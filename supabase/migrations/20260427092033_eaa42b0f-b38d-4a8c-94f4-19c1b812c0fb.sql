-- 1. Block flag on availability (vacations / holidays)
ALTER TABLE public.tutor_availability
  ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

-- 2. Configurable advance booking window
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS min_advance_hours integer NOT NULL DEFAULT 24;

-- 3. Recurrence linking on sessions
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS recurrence_group_id uuid,
  ADD COLUMN IF NOT EXISTS recurrence_index integer;

CREATE INDEX IF NOT EXISTS idx_sessions_recurrence_group
  ON public.sessions(recurrence_group_id);

CREATE INDEX IF NOT EXISTS idx_sessions_tutor_time
  ON public.sessions(tutor_id, scheduled_start, scheduled_end);

-- 4. Atomic booking function with conflict detection (row lock on tutor profile)
CREATE OR REPLACE FUNCTION public.book_session(
  p_tutor_id uuid,
  p_scheduled_start timestamptz,
  p_scheduled_end timestamptz,
  p_duration_minutes integer,
  p_timezone text,
  p_session_type text,
  p_amount numeric,
  p_meeting_url text,
  p_recurrence_group_id uuid DEFAULT NULL,
  p_recurrence_index integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student uuid := auth.uid();
  v_session_id uuid;
  v_conflict integer;
BEGIN
  IF v_student IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock the tutor's profile row to serialise concurrent booking attempts
  PERFORM 1 FROM public.profiles WHERE id = p_tutor_id FOR UPDATE;

  -- Detect overlap with any non-cancelled session for this tutor
  SELECT COUNT(*) INTO v_conflict
  FROM public.sessions
  WHERE tutor_id = p_tutor_id
    AND status_v2 NOT IN ('cancelled')
    AND scheduled_start < p_scheduled_end
    AND scheduled_end   > p_scheduled_start;

  IF v_conflict > 0 THEN
    RAISE EXCEPTION 'SLOT_TAKEN' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.sessions (
    student_id, tutor_id,
    scheduled_at, scheduled_start, scheduled_end,
    duration_minutes, timezone, session_type, amount,
    status, status_v2, payment_status, meeting_url,
    recurrence_group_id, recurrence_index
  ) VALUES (
    v_student, p_tutor_id,
    p_scheduled_start, p_scheduled_start, p_scheduled_end,
    p_duration_minutes, p_timezone, p_session_type, p_amount,
    'scheduled',
    CASE WHEN p_amount = 0 THEN 'confirmed'::session_status ELSE 'scheduled'::session_status END,
    'paid'::session_payment_status, p_meeting_url,
    p_recurrence_group_id, p_recurrence_index
  )
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_session(uuid, timestamptz, timestamptz, integer, text, text, numeric, text, uuid, integer) TO authenticated;