-- Extend courses table
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS trailer_url text,
  ADD COLUMN IF NOT EXISTS subtitle_url text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS hourly_rate numeric;

-- Validate status values
DO $$ BEGIN
  ALTER TABLE public.courses ADD CONSTRAINT courses_status_check
    CHECK (status IN ('draft','published','archived'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Restrict public read to published only; tutors still see their own drafts
DROP POLICY IF EXISTS "Courses: public read" ON public.courses;
CREATE POLICY "Courses: public read published"
ON public.courses FOR SELECT
USING (status = 'published');

CREATE POLICY "Courses: tutor reads own"
ON public.courses FOR SELECT
USING (auth.uid() = tutor_id);

-- Storage bucket for course assets (thumbnails, subtitles)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "course-assets public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-assets');

CREATE POLICY "course-assets owner insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "course-assets owner update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'course-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "course-assets owner delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-assets' AND auth.uid()::text = (storage.foldername(name))[1]);