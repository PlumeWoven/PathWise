-- Subjects catalog
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects: public read" ON public.subjects FOR SELECT USING (true);

INSERT INTO public.subjects (name, category) VALUES
  ('Math','STEM'),('Algebra','STEM'),('Geometry','STEM'),('Pre-Calculus','STEM'),
  ('Calculus','STEM'),('Statistics','STEM'),('Physics','STEM'),('Chemistry','STEM'),
  ('Biology','STEM'),('Computer Science','STEM'),('Programming','STEM'),
  ('English','Humanities'),('Writing','Humanities'),('Literature','Humanities'),
  ('Reading','Humanities'),('History','Humanities'),('Geography','Humanities'),
  ('Economics','Humanities'),('Philosophy','Humanities'),('Psychology','Humanities'),
  ('Spanish','Languages'),('French','Languages'),('German','Languages'),
  ('Mandarin','Languages'),('SAT Prep','Test Prep'),('ACT Prep','Test Prep'),
  ('GRE Prep','Test Prep'),('GMAT Prep','Test Prep'),('AP Calculus','Test Prep'),
  ('AP Physics','Test Prep'),('IELTS','Test Prep'),('TOEFL','Test Prep');

-- Add columns to profiles for tutor onboarding wizard data
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS institution text,
  ADD COLUMN IF NOT EXISTS specializations text[],
  ADD COLUMN IF NOT EXISTS superpowers text[],
  ADD COLUMN IF NOT EXISTS subject_proficiency jsonb,
  ADD COLUMN IF NOT EXISTS video_intro_url text,
  ADD COLUMN IF NOT EXISTS video_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS instant_bookings boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS buffer_minutes integer DEFAULT 15,
  ADD COLUMN IF NOT EXISTS first_session_free boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS free_discovery_call boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 1;

-- Tutor weekly availability (recurring)
CREATE TABLE public.tutor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_hour smallint NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  end_hour smallint NOT NULL CHECK (end_hour BETWEEN 1 AND 24),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Availability: public read" ON public.tutor_availability FOR SELECT USING (true);
CREATE POLICY "Availability: own insert" ON public.tutor_availability FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Availability: own update" ON public.tutor_availability FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Availability: own delete" ON public.tutor_availability FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_tutor_availability_user ON public.tutor_availability(user_id);

-- Tutor packages (e.g., 5 sessions for 10% off)
CREATE TABLE public.tutor_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sessions integer NOT NULL CHECK (sessions > 0),
  discount_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tutor_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Packages: public read" ON public.tutor_packages FOR SELECT USING (true);
CREATE POLICY "Packages: own insert" ON public.tutor_packages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Packages: own update" ON public.tutor_packages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Packages: own delete" ON public.tutor_packages FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_tutor_packages_user ON public.tutor_packages(user_id);

-- Public storage buckets for profile photos and tutor video intros
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('tutor-videos', 'tutor-videos', true)
  ON CONFLICT (id) DO NOTHING;

-- Profile photos: public read, owner-only write to /{uid}/...
CREATE POLICY "Profile photos: public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');
CREATE POLICY "Profile photos: own insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Profile photos: own update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Profile photos: own delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Tutor videos: public read, owner-only write
CREATE POLICY "Tutor videos: public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'tutor-videos');
CREATE POLICY "Tutor videos: own insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tutor-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Tutor videos: own update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'tutor-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Tutor videos: own delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'tutor-videos' AND auth.uid()::text = (storage.foldername(name))[1]);