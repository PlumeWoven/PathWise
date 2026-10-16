-- A student's consent to show their level checks in one subject to one tutor.
--
-- Owner decisions (2026-10-14): sharing is a checkbox on the booking, ticked
-- by default, with a preview; the tutor keeps seeing new attempts in that
-- subject while the student books with them; the student can stop sharing at
-- any time (revoked_at). This table holds consent only, never results: the
-- tutor-facing read (PR 5) goes through a function that checks it.

create table if not exists public.brief_shares (
  student_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (student_id, tutor_id, subject)
);

alter table public.brief_shares enable row level security;

-- The student grants, re-grants and revokes their own shares.
create policy brief_shares_student_all on public.brief_shares
  for all to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- A tutor can see which subjects a student shares with them (not the results).
create policy brief_shares_tutor_read on public.brief_shares
  for select to authenticated
  using (tutor_id = auth.uid());

revoke all on public.brief_shares from anon;
grant select, insert, update on public.brief_shares to authenticated;
