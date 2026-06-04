-- Tutor earnings ledger
CREATE TABLE public.tutor_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL,
  session_id uuid,
  student_id uuid,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  earned_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'paid',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tutor_earnings_tutor_date ON public.tutor_earnings(tutor_id, earned_at DESC);
ALTER TABLE public.tutor_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Earnings: tutor reads own" ON public.tutor_earnings FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "Earnings: tutor inserts own" ON public.tutor_earnings FOR INSERT WITH CHECK (auth.uid() = tutor_id);

-- Profile views (tracking)
CREATE TABLE public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL,
  viewer_id uuid,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profile_views_tutor ON public.profile_views(tutor_id, viewed_at DESC);
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ProfileViews: tutor reads own" ON public.profile_views FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "ProfileViews: anyone can insert" ON public.profile_views FOR INSERT WITH CHECK (true);

-- Lead funnel events
CREATE TABLE public.lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL,
  student_id uuid,
  stage text NOT NULL CHECK (stage IN ('view','message','trial','paid','repeat')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_events_tutor_stage ON public.lead_events(tutor_id, stage);
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "LeadEvents: tutor reads own" ON public.lead_events FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "LeadEvents: tutor inserts own" ON public.lead_events FOR INSERT WITH CHECK (auth.uid() = tutor_id);

-- Message threads (lightweight: messages between tutor and student)
CREATE TABLE public.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL,
  student_id uuid NOT NULL,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  tutor_response_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_threads_tutor ON public.message_threads(tutor_id, last_message_at DESC);
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Threads: involved read" ON public.message_threads FOR SELECT USING (auth.uid() = tutor_id OR auth.uid() = student_id);
CREATE POLICY "Threads: involved insert" ON public.message_threads FOR INSERT WITH CHECK (auth.uid() = tutor_id OR auth.uid() = student_id);

-- Add session_type and meeting_url to sessions for upcoming widget
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS session_type text DEFAULT '1on1',
  ADD COLUMN IF NOT EXISTS meeting_url text,
  ADD COLUMN IF NOT EXISTS amount numeric(10,2);