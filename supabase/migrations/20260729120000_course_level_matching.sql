-- ============================================================================
-- Course-level matching
--
-- Gives diagnostics, roadmap stages and courses a shared level vocabulary
-- (`<subject-slug>.L<band>`, band 1..5), and introduces course enrollments so a
-- roadmap stage can require a course to be taken before it may be completed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Level identity on the diagnostic → roadmap → stage chain
-- ----------------------------------------------------------------------------

ALTER TABLE public.diagnostic_results
  ADD COLUMN IF NOT EXISTS level_band smallint CHECK (level_band BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS level_id text,
  -- Per-topic band estimates from the adaptive run, e.g. {"Algebra": 4, "Geometry": 2}
  ADD COLUMN IF NOT EXISTS topic_bands jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.roadmaps
  ADD COLUMN IF NOT EXISTS level_band smallint CHECK (level_band BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS level_id text;

ALTER TABLE public.roadmap_stages
  ADD COLUMN IF NOT EXISTS required_level_band smallint CHECK (required_level_band BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS required_level_id text;

-- Backfill existing rows from the old free-text level names so historic
-- roadmaps still render a band. Requirements stay NULL — see the trigger note
-- at the bottom: stages without a requirement remain ungated.
UPDATE public.diagnostic_results
SET level_band = CASE lower(level)
    WHEN 'seedling'     THEN 1
    WHEN 'spark'        THEN 2
    WHEN 'builder'      THEN 3
    WHEN 'sharpshooter' THEN 4
    WHEN 'mastermind'   THEN 5
    ELSE NULL
  END
WHERE level_band IS NULL;

UPDATE public.diagnostic_results
SET level_id = lower(subject) || '.L' || level_band
WHERE level_id IS NULL AND level_band IS NOT NULL AND subject IS NOT NULL;

UPDATE public.roadmaps r
SET level_band = d.level_band,
    level_id   = d.level_id
FROM public.diagnostic_results d
WHERE r.diagnostic_id = d.id AND r.level_band IS NULL;

-- ----------------------------------------------------------------------------
-- 2. Level identity on courses
-- ----------------------------------------------------------------------------

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS level_band smallint CHECK (level_band BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS level_id text;

-- Courses authored before level ids existed only carry free-text difficulty.
-- "All Levels" deliberately stays NULL — it acts as a wildcard that satisfies
-- any band rather than being pinned to the middle.
UPDATE public.courses
SET level_band = CASE lower(difficulty)
    WHEN 'beginner'     THEN 1
    WHEN 'intermediate' THEN 3
    WHEN 'advanced'     THEN 5
    ELSE NULL
  END
WHERE level_band IS NULL;

CREATE INDEX IF NOT EXISTS courses_level_id_idx
  ON public.courses(level_id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS courses_level_band_idx
  ON public.courses(level_band) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS courses_tutor_published_idx
  ON public.courses(tutor_id) WHERE status = 'published';

-- ----------------------------------------------------------------------------
-- 3. Course enrollments
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
    CREATE TYPE public.enrollment_status AS ENUM ('enrolled', 'in_progress', 'completed', 'dropped');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  -- Set when the enrollment exists to satisfy a roadmap stage requirement.
  roadmap_id uuid REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  roadmap_stage_id uuid REFERENCES public.roadmap_stages(id) ON DELETE CASCADE,
  -- Snapshot of what the stage asked for at enrollment time, so the record
  -- still makes sense if the student later retakes the diagnostic.
  required_level_id text,
  -- 'exact_matched' | 'near_matched' | 'exact_other' — which convergence tier
  -- this course came from when the student picked it.
  match_kind text,
  status public.enrollment_status NOT NULL DEFAULT 'enrolled',
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One live enrollment per stage: switching courses means dropping the old one.
CREATE UNIQUE INDEX IF NOT EXISTS course_enrollments_active_stage_unique
  ON public.course_enrollments(student_id, roadmap_stage_id)
  WHERE roadmap_stage_id IS NOT NULL AND status <> 'dropped';

CREATE INDEX IF NOT EXISTS course_enrollments_student_idx
  ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS course_enrollments_roadmap_idx
  ON public.course_enrollments(roadmap_id);
CREATE INDEX IF NOT EXISTS course_enrollments_course_idx
  ON public.course_enrollments(course_id);

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enrollments: student read own" ON public.course_enrollments;
CREATE POLICY "Enrollments: student read own" ON public.course_enrollments
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Enrollments: student insert own" ON public.course_enrollments;
CREATE POLICY "Enrollments: student insert own" ON public.course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Enrollments: student update own" ON public.course_enrollments;
CREATE POLICY "Enrollments: student update own" ON public.course_enrollments
  FOR UPDATE USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Tutors can see who enrolled in the courses they authored.
DROP POLICY IF EXISTS "Enrollments: tutor read own courses" ON public.course_enrollments;
CREATE POLICY "Enrollments: tutor read own courses" ON public.course_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_enrollments.course_id AND c.tutor_id = auth.uid()
    )
  );

-- Earlier migrations assume this helper already exists, but it is absent on at
-- least one deployed database (the remote schema has drifted from the local
-- migration files). Define it here so this migration stands on its own;
-- CREATE OR REPLACE is a no-op where it is already present.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS course_enrollments_updated_at ON public.course_enrollments;
CREATE TRIGGER course_enrollments_updated_at
  BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. Server-side gate
--
-- The UI hides "Mark Stage Complete" until a course is finished, but the gate
-- has to hold even if someone calls the API directly. Stages carrying no
-- `required_level_id` (every roadmap built before this migration) are left
-- ungated so existing students aren't stranded mid-roadmap.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enforce_stage_course_requirement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'complete'
     AND COALESCE(OLD.status, '') <> 'complete'
     AND NEW.required_level_id IS NOT NULL
  THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.course_enrollments e
      WHERE e.roadmap_stage_id = NEW.id
        AND e.status = 'completed'
    ) THEN
      RAISE EXCEPTION 'STAGE_COURSE_REQUIRED'
        USING HINT = 'Complete a course matching this stage''s level before finishing the stage.',
              ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- This is a trigger function, not an API. Postgres checks EXECUTE at
-- CREATE TRIGGER time rather than per-row, so revoking it keeps the gate
-- working while removing it from the exposed REST surface (it would otherwise
-- be callable by anon at /rest/v1/rpc/enforce_stage_course_requirement).
REVOKE ALL ON FUNCTION public.enforce_stage_course_requirement() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS roadmap_stages_course_gate ON public.roadmap_stages;
CREATE TRIGGER roadmap_stages_course_gate
  BEFORE UPDATE ON public.roadmap_stages
  FOR EACH ROW EXECUTE FUNCTION public.enforce_stage_course_requirement();

-- ----------------------------------------------------------------------------
-- 5. Convenience view — a stage plus its enrollment state
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.roadmap_stage_requirements
WITH (security_invoker = true)
AS
SELECT
  s.id                AS stage_id,
  s.roadmap_id,
  s.stage_number,
  s.status            AS stage_status,
  s.required_level_id,
  s.required_level_band,
  e.id                AS enrollment_id,
  e.course_id,
  e.status            AS enrollment_status,
  (s.required_level_id IS NULL OR e.status = 'completed') AS requirement_met
FROM public.roadmap_stages s
LEFT JOIN public.course_enrollments e
  ON e.roadmap_stage_id = s.id AND e.status <> 'dropped';
