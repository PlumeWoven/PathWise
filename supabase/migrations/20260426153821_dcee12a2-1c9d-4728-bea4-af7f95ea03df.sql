CREATE TABLE public.user_learning_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  subject text,
  multi_subject boolean DEFAULT false,
  goal text,
  learning_style text,
  pace smallint CHECK (pace BETWEEN 1 AND 5),
  time_of_day text,
  experience_level text,
  frequency text,
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  traits jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_learning_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ULP: read own" ON public.user_learning_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ULP: insert own" ON public.user_learning_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ULP: update own" ON public.user_learning_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_learning_profiles_updated_at
  BEFORE UPDATE ON public.user_learning_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();