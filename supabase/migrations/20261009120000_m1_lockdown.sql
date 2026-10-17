-- M1 "lockdown" — Phase 0 of the real-user readiness plan (2026-10-09).
-- Written against the LIVE schema (repo migrations before 20260717 were never
-- applied). Deploy PR "phase 0 client hardening" first: this drops profiles.email.

-- ── Admin check ─────────────────────────────────────────────────────────────
-- Admin lives in app_metadata.role. The old policies compared the top-level JWT
-- `role` claim, which is always 'authenticated', so they never matched.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

drop policy if exists "Admins can manage all profiles" on public.profiles;
drop policy if exists "Admins can manage all courses"  on public.courses;
drop policy if exists "Admins can manage all sessions" on public.sessions;
drop policy if exists "Admins can manage all reviews"  on public.reviews;
create policy "Admins can manage all profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage all courses"  on public.courses  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage all sessions" on public.sessions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage all reviews"  on public.reviews  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Email leak ──────────────────────────────────────────────────────────────
-- profiles.email was readable by anon. auth.users already holds the address.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  )
  on conflict (id) do nothing; -- never overwrite an existing role
  return new;
end;
$$;

alter table public.profiles drop column if exists email;

-- Student onboarding writes `grade`; the live table never had it.
alter table public.profiles add column if not exists grade smallint;

-- ── Profile visibility ──────────────────────────────────────────────────────
-- Tutors are a public directory. Everyone else is visible only to themselves,
-- admins, and people they actually work with.
drop policy if exists "Anyone can view profiles" on public.profiles;
create policy "Tutor profiles are public" on public.profiles
  for select to anon, authenticated
  using (role in ('tutor', 'both'));
create policy "Users can view own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid());
create policy "Users can view people they work with" on public.profiles
  for select to authenticated
  using (
    exists (select 1 from public.sessions s
            where (s.student_id = auth.uid() and s.tutor_id = profiles.id)
               or (s.tutor_id = auth.uid() and s.student_id = profiles.id))
    or exists (select 1 from public.tutor_students ts
               where ts.tutor_id = auth.uid() and ts.student_id = profiles.id)
    or exists (select 1 from public.course_enrollments e
               join public.courses c on c.id = e.course_id
               where c.tutor_id = auth.uid() and e.student_id = profiles.id)
  );

-- Anonymous visitors only see guest (unclaimed) roadmaps.
drop policy if exists anon_select_roadmaps on public.roadmaps;
create policy anon_select_roadmaps on public.roadmaps
  for select to anon
  using (user_id is null);

-- ── Self-promotion guards ───────────────────────────────────────────────────
-- Column rules for signed-in, non-admin users. Security-definer functions and
-- the service role run as a different current_user, so they are unaffected.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'role can only be changed by an admin';
    end if;
    if new.verification_status is distinct from old.verification_status
       and new.verification_status is distinct from 'pending' then
      raise exception 'verification status can only be set by an admin';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists guard_profile_update on public.profiles;
create trigger guard_profile_update before update on public.profiles
  for each row execute function public.guard_profile_update();

create or replace function public.guard_course_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'authenticated' and not public.is_admin()
     and (tg_op = 'INSERT' or new.status is distinct from old.status)
     and new.status not in ('draft', 'under_review') then
    raise exception 'courses are published by an admin after review';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_course_status on public.courses;
create trigger guard_course_status before insert or update on public.courses
  for each row execute function public.guard_course_status();

create or replace function public.guard_session_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'authenticated' and not public.is_admin()
     and (new.amount is distinct from old.amount
          or new.payment_status is distinct from old.payment_status
          or new.student_id is distinct from old.student_id
          or new.tutor_id is distinct from old.tutor_id) then
    raise exception 'amount, payment and participants of a session cannot be changed';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_session_update on public.sessions;
create trigger guard_session_update before update on public.sessions
  for each row execute function public.guard_session_update();

-- Duplicate of "Tutors can manage their own courses" (which has a WITH CHECK).
drop policy if exists "Tutors can manage own courses" on public.courses;

-- ── Booking ─────────────────────────────────────────────────────────────────
-- Sessions are created only through book_session. As definer it can see every
-- booking for the tutor, so the slot check now catches other students' sessions.
drop policy if exists "Students can insert sessions" on public.sessions;

create or replace function public.book_session(
  p_tutor_id uuid,
  p_scheduled_start timestamptz,
  p_scheduled_end timestamptz,
  p_duration_minutes integer,
  p_timezone text,
  p_session_type text,
  p_amount numeric,
  p_meeting_url text,
  p_recurrence_group_id uuid default null,
  p_recurrence_index integer default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_student_id uuid := auth.uid();
begin
  if v_student_id is null then
    raise exception 'Not authenticated';
  end if;
  if v_student_id = p_tutor_id then
    raise exception 'You cannot book a session with yourself';
  end if;
  if not exists (select 1 from public.profiles where id = p_tutor_id and role in ('tutor', 'both')) then
    raise exception 'Tutor not found';
  end if;

  if exists (
    select 1 from public.sessions
    where tutor_id = p_tutor_id
      and scheduled_start < p_scheduled_end
      and scheduled_end > p_scheduled_start
      and status_v2 not in ('cancelled', 'closed')
  ) then
    raise exception 'SLOT_TAKEN';
  end if;

  -- ponytail: amount is still client-supplied; compute it server-side when payments go live.
  insert into public.sessions (
    student_id, tutor_id, scheduled_start, scheduled_end, duration_minutes,
    timezone, session_type, amount, meeting_url, status_v2
  ) values (
    v_student_id, p_tutor_id, p_scheduled_start, p_scheduled_end, p_duration_minutes,
    p_timezone, p_session_type, p_amount, p_meeting_url, 'scheduled'
  )
  returning id into v_session_id;

  return v_session_id;
end;
$$;

-- ── Messaging ───────────────────────────────────────────────────────────────
-- ensure_thread could create threads between any two users. Require the caller
-- to be one of them (kept for the upcoming inbox; not called by the app yet).
create or replace function public.ensure_thread(a uuid, b uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  thread_id uuid;
  a_role text;
  b_role text;
begin
  if a is null or b is null or a = b then
    raise exception 'ensure_thread: need two distinct non-null user ids';
  end if;
  if auth.uid() is null or auth.uid() not in (a, b) then
    raise exception 'ensure_thread: caller must be a participant';
  end if;

  select t.id into thread_id
  from public.message_threads t
  where (select count(*) from public.message_participants p where p.thread_id = t.id) = 2
    and exists (select 1 from public.message_participants p where p.thread_id = t.id and p.user_id = a)
    and exists (select 1 from public.message_participants p where p.thread_id = t.id and p.user_id = b)
  limit 1;

  if thread_id is not null then
    return thread_id;
  end if;

  select role into a_role from public.profiles where id = a;
  select role into b_role from public.profiles where id = b;

  insert into public.message_threads (tutor_id, student_id)
  values (
    case when a_role in ('tutor','both') then a when b_role in ('tutor','both') then b else null end,
    case when a_role in ('tutor','both') then b when b_role in ('tutor','both') then a else null end
  )
  returning id into thread_id;

  insert into public.message_participants (thread_id, user_id)
  values (thread_id, a), (thread_id, b)
  on conflict (thread_id, user_id) do nothing;

  return thread_id;
end;
$$;

-- ── Function exposure ───────────────────────────────────────────────────────
-- The app calls only book_session (signed in). Everything else is legacy, a
-- trigger function, or not wired up yet — callable by nobody from the API.
-- ponytail: revoked rather than dropped; drop the legacy ones once confirmed dead.
revoke execute on function public.book_session(uuid, uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function public.check_availability(uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function public.claim_guest_roadmaps(uuid) from public, anon, authenticated;
revoke execute on function public.complete_milestone(uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.end_session(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.start_session(uuid) from public, anon, authenticated;
revoke execute on function public.generate_roadmap(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.match_tutors(uuid, text, text, integer, integer) from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.guard_profile_update() from public, anon, authenticated;
revoke execute on function public.guard_course_status() from public, anon, authenticated;
revoke execute on function public.guard_session_update() from public, anon, authenticated;

revoke execute on function public.book_session(uuid, timestamptz, timestamptz, integer, text, text, numeric, text, uuid, integer) from public, anon;
grant  execute on function public.book_session(uuid, timestamptz, timestamptz, integer, text, text, numeric, text, uuid, integer) to authenticated;
revoke execute on function public.ensure_thread(uuid, uuid) from public, anon;
grant  execute on function public.ensure_thread(uuid, uuid) to authenticated;

-- Pin search_path on the remaining definer functions that lacked it.
alter function public.book_session(uuid, uuid, timestamptz, timestamptz) set search_path = public;
alter function public.check_availability(uuid, timestamptz, timestamptz) set search_path = public;
alter function public.claim_guest_roadmaps(uuid) set search_path = public;
alter function public.complete_milestone(uuid, uuid, text) set search_path = public;
alter function public.end_session(uuid, text, text) set search_path = public;
alter function public.start_session(uuid) set search_path = public;
alter function public.generate_roadmap(uuid, text, text) set search_path = public;
alter function public.match_tutors(uuid, text, text, integer, integer) set search_path = public;
alter function public.courses_set_slug() set search_path = public;

-- ── Other leaks ─────────────────────────────────────────────────────────────
drop policy if exists "Tutors can read other tutors' earnings" on public.tutor_earnings;

-- A review needs a finished session with that tutor, or an enrolment in one of
-- their courses (course pages let enrolled students review).
drop policy if exists "Students can insert reviews" on public.reviews;
create policy "Students can insert reviews" on public.reviews
  for insert to authenticated
  with check (
    student_id = auth.uid()
    and (
      exists (select 1 from public.sessions s
              where s.student_id = auth.uid() and s.tutor_id = reviews.tutor_id
                and s.status_v2 in ('completed', 'awaiting_review', 'closed'))
      or exists (select 1 from public.course_enrollments e
                 join public.courses c on c.id = e.course_id
                 where e.student_id = auth.uid() and c.tutor_id = reviews.tutor_id)
    )
  );

-- ── Storage ─────────────────────────────────────────────────────────────────
-- "owner insert" (own folder only) already exists; this one allowed any path.
drop policy if exists "Authenticated users can upload course assets" on storage.objects;

-- Size caps (free plan's global upload cap is 50 MB anyway).
update storage.buckets set file_size_limit = 5242880,  allowed_mime_types = array['image/*'] where id = 'profile-photos';
update storage.buckets set file_size_limit = 52428800 where id in ('course-assets', 'tutor-videos');
