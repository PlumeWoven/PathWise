-- 1) Status enum
DO $$ BEGIN
  CREATE TYPE public.session_status AS ENUM (
    'scheduled','confirmed','reminder_sent','in_progress',
    'completed','awaiting_review','closed','cancelled','disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.session_payment_status AS ENUM (
    'unpaid','pending','paid','refunded','failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Extend sessions
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS scheduled_start timestamptz,
  ADD COLUMN IF NOT EXISTS scheduled_end timestamptz,
  ADD COLUMN IF NOT EXISTS actual_start timestamptz,
  ADD COLUMN IF NOT EXISTS actual_end timestamptz,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS payment_status public.session_payment_status NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS course_id uuid,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid,
  ADD COLUMN IF NOT EXISTS refund_status text,
  ADD COLUMN IF NOT EXISTS review_reminder_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS status_v2 public.session_status NOT NULL DEFAULT 'scheduled';

-- Backfill scheduled_start from scheduled_at where present
UPDATE public.sessions
  SET scheduled_start = scheduled_at
  WHERE scheduled_start IS NULL AND scheduled_at IS NOT NULL;

UPDATE public.sessions
  SET scheduled_end = scheduled_start + make_interval(mins => COALESCE(duration_minutes, 60))
  WHERE scheduled_end IS NULL AND scheduled_start IS NOT NULL;

-- updated_at trigger
DROP TRIGGER IF EXISTS sessions_set_updated_at ON public.sessions;
CREATE TRIGGER sessions_set_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) State history
CREATE TABLE IF NOT EXISTS public.session_state_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  from_status public.session_status,
  to_status public.session_status NOT NULL,
  changed_by uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_state_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "SSH: involved read" ON public.session_state_history;
CREATE POLICY "SSH: involved read" ON public.session_state_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_state_history.session_id
        AND (s.student_id = auth.uid() OR s.tutor_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "SSH: involved insert" ON public.session_state_history;
CREATE POLICY "SSH: involved insert" ON public.session_state_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_state_history.session_id
        AND (s.student_id = auth.uid() OR s.tutor_id = auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_ssh_session ON public.session_state_history(session_id);

-- 4) Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notif: read own" ON public.notifications;
CREATE POLICY "Notif: read own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Notif: update own" ON public.notifications;
CREATE POLICY "Notif: update own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Notif: delete own" ON public.notifications;
CREATE POLICY "Notif: delete own" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Notif: authed insert" ON public.notifications;
CREATE POLICY "Notif: authed insert" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON public.sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor ON public.sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status_v2);