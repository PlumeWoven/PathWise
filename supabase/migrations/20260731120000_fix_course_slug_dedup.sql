-- ============================================================================
-- Course slug de-duplication
--
-- Why this exists
-- ---------------
-- "Create a new course" returned HTTP 409 on every attempt. The live
-- `public.courses_set_slug()` trigger function derives a slug from the title
-- but has no de-duplication step, so every draft — all of which start life as
-- "Untitled course" — resolved to the same slug `untitled-course`. One
-- published row already holds that slug, so `courses_slug_key UNIQUE (slug)`
-- rejected each insert with SQLSTATE 23505, which PostgREST surfaces as 409.
--
-- The app-side fix (shipped separately) now supplies its own unique draft slug
-- on insert, which is why the "caller already set a slug" early-out below is
-- preserved verbatim. This migration is the database-level backstop: any
-- writer that omits a slug — a future code path, an admin using the dashboard,
-- a direct SQL insert — still gets a unique one instead of a 409.
--
-- Scope notes
-- -----------
-- * The trigger `set_course_slug` on public.courses is deliberately NOT dropped
--   or recreated. A trigger binds to its function by OID, so replacing the
--   function body is sufficient and avoids a window where the trigger is
--   missing and rows could slip through unslugged.
-- * No existing row is modified or re-slugged. The published course currently
--   holding `untitled-course` keeps it on purpose — that slug is a live public
--   URL and re-slugging it would break inbound links. Please do not "helpfully"
--   add a backfill here.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.courses_set_slug()
RETURNS trigger
LANGUAGE plpgsql
-- SECURITY DEFINER is load-bearing, not incidental. The collision probe below
-- is a SELECT against public.courses, which is RLS-protected: under the
-- caller's own privileges a tutor cannot see another tutor's drafts, so the
-- loop would find "no collision", exit happily, and the INSERT would still be
-- rejected by the unique constraint. Running as the function owner lets the
-- probe see every row, which is the only way it can be correct.
--
-- SET search_path = public closes the search-path hijacking vector that
-- SECURITY DEFINER would otherwise open: without it a caller could prepend a
-- schema of their own and shadow `courses`. Every other identifier used here
-- (lower, regexp_replace, trim, md5, random, clock_timestamp, gen_random_uuid)
-- resolves from pg_catalog, which is always searched first and cannot be
-- shadowed by the search_path setting.
--
-- The elevated scope is tightly bounded: this function only reads
-- courses.slug and assigns NEW.slug. It writes nothing and returns nothing to
-- the caller, so it leaks no rows and grants no other capability.
SECURITY DEFINER
SET search_path = public
AS $$
-- Kept inside the body on purpose: only the body survives into the database,
-- so this is what someone running `\sf public.courses_set_slug` sees. SECURITY
-- DEFINER is required for the collision probe below to see rows RLS would hide
-- from the calling tutor; search_path is pinned to public to close the
-- hijacking vector that opens. Scope is limited to reading courses.slug and
-- assigning NEW.slug. See migration 20260731120000_fix_course_slug_dedup.sql.
DECLARE
  base      text;
  candidate text;
  attempt   int := 0;
  -- After this many random suffixes, stop guessing and use a UUID.
  max_tries constant int := 10;
BEGIN
  -- Caller supplied a slug: honour it exactly. This is what lets the app pick
  -- its own draft slug, and what lets a tutor choose a vanity URL. A caller
  -- supplied slug that collides is deliberately left to fail on the unique
  -- constraint rather than being silently mangled — an explicitly chosen URL
  -- quietly turning into `my-course-a1b2c3` would be worse than an error.
  IF NEW.slug IS NOT NULL AND NEW.slug <> '' THEN
    RETURN NEW;
  END IF;

  -- Same derivation as before: collapse every run of non-alphanumerics into a
  -- single hyphen and lowercase the result.
  base := lower(regexp_replace(coalesce(NEW.title, 'course'), '[^a-zA-Z0-9]+', '-', 'g'));

  -- New: strip the leading/trailing hyphens that derivation leaves behind, so
  -- 'Trigonometry ' yields 'trigonometry' rather than 'trigonometry-'.
  base := trim(both '-' from base);

  -- A title made entirely of symbols or non-ASCII letters (Romanian
  -- diacritics, for instance) reduces to the empty string. Fall back to a
  -- generic stem so the dedup loop below always has something to append to.
  IF base = '' THEN
    base := 'course';
  END IF;

  candidate := base;

  -- `id IS DISTINCT FROM NEW.id` rather than `id <> NEW.id`: on an UPDATE we
  -- must not count the row against itself, and IS DISTINCT FROM keeps the
  -- comparison true (rather than NULL, which would silently match no rows and
  -- disable dedup entirely) in the event NEW.id is ever NULL.
  WHILE EXISTS (
    SELECT 1 FROM public.courses
    WHERE slug = candidate AND id IS DISTINCT FROM NEW.id
  ) LOOP
    attempt := attempt + 1;

    -- Bounded exit. `attempt` strictly increases every iteration and this
    -- branch EXITs unconditionally, so the loop runs at most max_tries + 1
    -- times no matter what the table contains. The UUID suffix carries enough
    -- entropy to be collision-proof in practice, so the value we leave with is
    -- safe even though we no longer re-probe it.
    IF attempt > max_tries THEN
      candidate := base || '-' || replace(gen_random_uuid()::text, '-', '');
      EXIT;
    END IF;

    -- clock_timestamp() advances within a transaction, so two candidates
    -- generated back to back in the same statement still differ.
    --
    -- Residual race, accepted knowingly: this is check-then-insert, so two
    -- concurrent inserts could in principle draw the same suffix (~1 in 16^6)
    -- and one would still fail on the unique constraint. Serialising course
    -- inserts behind an advisory lock to close that costs more than the rare
    -- retry it would save.
    candidate := base || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 6);
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

-- This is a trigger function, not an API. Postgres checks EXECUTE at
-- CREATE TRIGGER time rather than per-row, so revoking it leaves the existing
-- `set_course_slug` trigger working while keeping a SECURITY DEFINER function
-- off the exposed REST surface. Matches the treatment of
-- public.enforce_stage_course_requirement().
REVOKE ALL ON FUNCTION public.courses_set_slug() FROM PUBLIC, anon, authenticated;
