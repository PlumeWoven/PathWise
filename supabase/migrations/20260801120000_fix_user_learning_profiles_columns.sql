-- ============================================================================
-- Align user_learning_profiles with what the "Find a tutor" quiz writes
--
-- Why this exists
-- ---------------
-- Finishing the tutor-matching quiz POSTed to user_learning_profiles and got
-- HTTP 400 / PGRST204: "Could not find the 'frequency' column ... in the schema
-- cache". Six of the eleven fields the quiz saves had no column on the live
-- table: multi_subject, goal, pace, time_of_day, frequency and traits.
--
-- Dropping those fields from the client was not an option — MatchedTutorsPanel
-- reads exactly the same set back out to drive matching, so its SELECT was
-- failing for the same reason. The columns have to exist for the feature to
-- work at all.
--
-- The generated types in src/integrations/supabase/types.ts already declare all
-- six, which is why TypeScript never caught this: those types were generated
-- against a different database than the one the app talks to. This migration
-- brings the live table up to what the types (and the code) already assume.
--
-- Two further defects on the same call path, fixed below:
--   * `.upsert(payload, { onConflict: "user_id" })` had nothing to conflict on
--     — user_id carried only a foreign key, no unique constraint — so the write
--     would have failed with 42P10 even once the columns existed.
--   * `subject` was NOT NULL, but the quiz saves `answers.subject ?? null`, so
--     a profile saved before the subject step was answered would be rejected.
--
-- Safe to run on the live table: it currently holds 0 rows, precisely because
-- every write has been failing since the feature shipped.
-- ============================================================================

-- All nullable to match src/integrations/supabase/types.ts, and because the
-- quiz can be abandoned part-way through and still saves what it has.
ALTER TABLE public.user_learning_profiles
  ADD COLUMN IF NOT EXISTS multi_subject boolean,
  ADD COLUMN IF NOT EXISTS goal          text,
  ADD COLUMN IF NOT EXISTS pace          smallint,
  ADD COLUMN IF NOT EXISTS time_of_day   text,
  ADD COLUMN IF NOT EXISTS frequency     text,
  ADD COLUMN IF NOT EXISTS traits        jsonb;

-- Gives `upsert(..., { onConflict: "user_id" })` a constraint to target, and
-- enforces the one-profile-per-user assumption the whole read path relies on
-- (every reader uses .maybeSingle()).
CREATE UNIQUE INDEX IF NOT EXISTS user_learning_profiles_user_id_key
  ON public.user_learning_profiles (user_id);

-- The quiz writes `subject: answers.subject ?? null`.
ALTER TABLE public.user_learning_profiles
  ALTER COLUMN subject DROP NOT NULL;

-- Deliberately NOT constrained with CHECKs the way learning_style and
-- experience_level are: goal/time_of_day/frequency are product copy that shifts
-- as the quiz is reworded, and a CHECK here would turn a copy edit into a failed
-- write. The existing CHECKs are left alone — the quiz's Style and Level unions
-- are already strict subsets of what they allow.
--
-- Also left alone: preferred_learning_style, goals (text[]) and
-- preferred_schedule. No application code references them; they are from an
-- earlier design of this table. Dropping them is a separate decision.
