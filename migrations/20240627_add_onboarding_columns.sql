-- Migration: add onboarding columns to profiles
-- Run this via Supabase SQL Editor or `supabase db push`

-- Add grade_level (integer) for student onboarding
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS grade_level integer;

-- Add learning_goal (text) for student onboarding
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS learning_goal text;

-- If old columns exist from an earlier schema, migrate data and drop them.
-- (Safe to run even if the columns never existed.)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'grade'
    ) THEN
        UPDATE public.profiles
        SET grade_level = grade::integer
        WHERE grade_level IS NULL AND grade IS NOT NULL;

        ALTER TABLE public.profiles DROP COLUMN IF EXISTS grade;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        UPDATE public.profiles
        SET learning_goal = bio
        WHERE learning_goal IS NULL AND bio IS NOT NULL;

        ALTER TABLE public.profiles DROP COLUMN IF EXISTS bio;
    END IF;
END $$;
