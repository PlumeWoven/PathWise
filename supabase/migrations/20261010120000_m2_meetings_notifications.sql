-- M2 — lesson links, booking notifications, session history (Phase 1, PR4).
-- Written against the live schema after M1.

-- ── Booking: real lesson link + instant confirm ─────────────────────────────
-- The client used to invent https://meet.pathwise.app/<id>, a domain we don't
-- own. The session now gets the tutor's own link (profiles.meeting_url) or its
-- own Jitsi room, and tutors with instant bookings on skip the manual confirm.
-- p_meeting_url is kept in the signature for compatibility and ignored.
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
  v_tutor_link text;
  v_instant boolean;
begin
  if v_student_id is null then
    raise exception 'Not authenticated';
  end if;
  if v_student_id = p_tutor_id then
    raise exception 'You cannot book a session with yourself';
  end if;

  select nullif(trim(meeting_url), ''), coalesce(instant_bookings, false)
    into v_tutor_link, v_instant
  from public.profiles
  where id = p_tutor_id and role in ('tutor', 'both');
  if not found then
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
    p_timezone, p_session_type, p_amount,
    coalesce(v_tutor_link, 'https://meet.jit.si/PathWise-' || replace(gen_random_uuid()::text, '-', '')),
    (case when v_instant then 'confirmed' else 'scheduled' end)::public.session_status
  )
  returning id into v_session_id;

  return v_session_id;
end;
$$;

-- Existing sessions point at the dead domain; give each its own Jitsi room.
update public.sessions
set meeting_url = 'https://meet.jit.si/PathWise-' || replace(id::text, '-', '')
where meeting_url like 'https://meet.pathwise.app/%';

-- ── Notifications ───────────────────────────────────────────────────────────
-- Clients can't insert rows for other users (RLS), and the old inserts named a
-- `type` column that doesn't exist — so nobody was ever notified. A trigger
-- does it instead: on booking, both sides; on a status change, the other side.
create or replace function public.notify_session_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link text := '/sessions/' || new.id;
  v_status text := replace(new.status_v2::text, '_', ' ');
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, title, message, link) values
      (new.tutor_id,
       case when new.status_v2 = 'confirmed' then 'New session booked' else 'New booking request' end,
       case when new.status_v2 = 'confirmed' then 'A student booked a session with you.'
            else 'A student wants a session with you. Confirm it from the session page.' end,
       v_link),
      (new.student_id,
       case when new.status_v2 = 'confirmed' then 'Session confirmed' else 'Booking requested' end,
       case when new.status_v2 = 'confirmed' then 'Your session is confirmed. The lesson link is on the session page.'
            else 'Your tutor will confirm the session soon.' end,
       v_link);
  elsif new.status_v2 is distinct from old.status_v2 then
    insert into public.notifications (user_id, title, message, link)
    select uid,
           'Session ' || v_status,
           'Your session is now ' || v_status
             || coalesce('. Reason: ' || nullif(new.cancellation_reason, ''), '') || '.',
           v_link
    from unnest(array[new.student_id, new.tutor_id]) as uid
    where uid is not null
      and uid is distinct from auth.uid(); -- don't notify whoever made the change
  end if;
  return new;
end;
$$;
revoke execute on function public.notify_session_change() from public, anon, authenticated;

drop trigger if exists notify_session_change on public.sessions;
create trigger notify_session_change
  after insert or update of status_v2 on public.sessions
  for each row execute function public.notify_session_change();

-- The notification bell subscribes to postgres_changes on this table.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

-- ── Session history ─────────────────────────────────────────────────────────
-- RLS was on with no policies, so every history insert failed silently.
create policy "Participants can read session history" on public.session_state_history
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.sessions s
               where s.id = session_state_history.session_id
                 and auth.uid() in (s.student_id, s.tutor_id))
  );
create policy "Participants can log session history" on public.session_state_history
  for insert to authenticated
  with check (
    changed_by = auth.uid()
    and exists (select 1 from public.sessions s
                where s.id = session_state_history.session_id
                  and auth.uid() in (s.student_id, s.tutor_id))
  );
