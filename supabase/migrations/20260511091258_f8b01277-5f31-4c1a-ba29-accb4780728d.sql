
-- Extend courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS subcategory_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS learning_outcomes text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prerequisites text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_audience text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS estimated_weeks integer,
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'MDL',
  ADD COLUMN IF NOT EXISTS discount_price numeric,
  ADD COLUMN IF NOT EXISTS discount_expiry timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_unique ON public.courses(slug) WHERE slug IS NOT NULL;

-- Slug generator
CREATE OR REPLACE FUNCTION public.courses_set_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  n int := 0;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug <> '' THEN
    RETURN NEW;
  END IF;
  base := lower(regexp_replace(coalesce(NEW.title, 'course'), '[^a-zA-Z0-9]+', '-', 'g'));
  base := trim(both '-' from base);
  IF base = '' THEN base := 'course'; END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.courses WHERE slug = candidate AND id <> NEW.id) LOOP
    n := n + 1;
    candidate := base || '-' || substr(md5(random()::text), 1, 5);
    IF n > 10 THEN EXIT; END IF;
  END LOOP;
  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS courses_set_slug_trg ON public.courses;
CREATE TRIGGER courses_set_slug_trg
BEFORE INSERT OR UPDATE OF title, slug ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.courses_set_slug();

-- Updated_at trigger if missing
DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
CREATE TRIGGER courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- course_sections
CREATE TABLE IF NOT EXISTS public.course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled section',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_sections_course_idx ON public.course_sections(course_id, position);
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sections: owner all" ON public.course_sections;
CREATE POLICY "Sections: owner all" ON public.course_sections
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_sections.course_id AND c.tutor_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_sections.course_id AND c.tutor_id = auth.uid())
);

DROP POLICY IF EXISTS "Sections: public read published" ON public.course_sections;
CREATE POLICY "Sections: public read published" ON public.course_sections
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_sections.course_id AND c.status = 'published')
);

DROP POLICY IF EXISTS "Sections: admin read review" ON public.course_sections;
CREATE POLICY "Sections: admin read review" ON public.course_sections
FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- course_lessons
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled lesson',
  description text,
  video_url text,
  duration_minutes integer NOT NULL DEFAULT 0,
  is_free_preview boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  resources jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_lessons_section_idx ON public.course_lessons(section_id, position);
CREATE INDEX IF NOT EXISTS course_lessons_course_idx ON public.course_lessons(course_id);
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lessons: owner all" ON public.course_lessons;
CREATE POLICY "Lessons: owner all" ON public.course_lessons
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_lessons.course_id AND c.tutor_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_lessons.course_id AND c.tutor_id = auth.uid())
);

DROP POLICY IF EXISTS "Lessons: public read published" ON public.course_lessons;
CREATE POLICY "Lessons: public read published" ON public.course_lessons
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_lessons.course_id AND c.status = 'published')
);

DROP POLICY IF EXISTS "Lessons: free preview public" ON public.course_lessons;
CREATE POLICY "Lessons: free preview public" ON public.course_lessons
FOR SELECT USING (is_free_preview = true);

DROP POLICY IF EXISTS "Lessons: admin read review" ON public.course_lessons;
CREATE POLICY "Lessons: admin read review" ON public.course_lessons
FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- Admin can read courses under review
DROP POLICY IF EXISTS "Courses: admin read all" ON public.courses;
CREATE POLICY "Courses: admin read all" ON public.courses
FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Courses: admin update review" ON public.courses;
CREATE POLICY "Courses: admin update review" ON public.courses
FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');
