-- M4 — inbox (Phase 3). Written against the live schema after M3.
-- Threads are created only through ensure_thread (SECURITY DEFINER, caller
-- check since M1); messages go straight into `messages` under RLS.

-- ── Tighten messaging RLS ───────────────────────────────────────────────────
-- Permissive policies OR together, so these loose duplicates undid the strict ones:
--  * "Participants can insert messages" had no sender check → post as the other person.
--  * "Messages: involved update" let participants rewrite each other's messages.
--  * Direct thread/participant inserts bypassed ensure_thread.
drop policy if exists "Participants can insert messages" on public.messages;
drop policy if exists "Messages: involved update" on public.messages;
drop policy if exists "Participants can view messages" on public.messages; -- duplicate of "Messages: involved read"
drop policy if exists "Participants can insert threads" on public.message_threads;
drop policy if exists "Threads: involved insert" on public.message_threads;
drop policy if exists "Threads: involved read" on public.message_threads; -- duplicate of "Participants can view threads"
drop policy if exists "Participants: involved insert" on public.message_participants;

-- ── ensure_thread never worked ──────────────────────────────────────────────
-- Its local variable `thread_id` clashed with the column of the same name
-- ("column reference is ambiguous") — unnoticed because nothing called it.
create or replace function public.ensure_thread(a uuid, b uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_thread_id uuid;
  a_role text;
  b_role text;
begin
  if a is null or b is null or a = b then
    raise exception 'ensure_thread: need two distinct non-null user ids';
  end if;
  if auth.uid() is null or auth.uid() not in (a, b) then
    raise exception 'ensure_thread: caller must be a participant';
  end if;

  select t.id into v_thread_id
  from public.message_threads t
  where (t.tutor_id = a and t.student_id = b) or (t.tutor_id = b and t.student_id = a)
  order by t.created_at
  limit 1;
  if v_thread_id is not null then
    return v_thread_id;
  end if;

  select role into a_role from public.profiles where id = a;
  select role into b_role from public.profiles where id = b;

  insert into public.message_threads (tutor_id, student_id)
  values (
    case when a_role in ('tutor','both') then a when b_role in ('tutor','both') then b else a end,
    case when a_role in ('tutor','both') then b when b_role in ('tutor','both') then a else b end
  )
  returning id into v_thread_id;

  insert into public.message_participants (thread_id, user_id)
  values (v_thread_id, a), (v_thread_id, b)
  on conflict do nothing;

  return v_thread_id;
end;
$$;

-- ── See who you're talking to ───────────────────────────────────────────────
-- A student who messages a tutor first has no session yet; let both sides of a
-- thread see each other's profile.
drop policy if exists "Users can view people they work with" on public.profiles;
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
    or exists (select 1 from public.message_threads t
               where (t.student_id = auth.uid() and t.tutor_id = profiles.id)
                  or (t.tutor_id = auth.uid() and t.student_id = profiles.id))
  );

-- ── New message: bump the thread, notify the recipient ──────────────────────
-- One unread notification per thread at a time, so a burst of messages doesn't
-- flood the bell.
create or replace function public.on_message_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient uuid;
  v_link text := '/messages?thread=' || new.thread_id;
  v_sender_name text;
begin
  update public.message_threads set updated_at = now() where id = new.thread_id;

  select case when t.tutor_id = new.sender_id then t.student_id else t.tutor_id end
    into v_recipient
  from public.message_threads t
  where t.id = new.thread_id;

  if v_recipient is not null and not exists (
    select 1 from public.notifications
    where user_id = v_recipient and link = v_link and coalesce(read, false) = false
  ) then
    select coalesce(display_name, full_name, 'Someone') into v_sender_name
    from public.profiles where id = new.sender_id;
    insert into public.notifications (user_id, title, message, link)
    values (v_recipient, 'New message from ' || coalesce(v_sender_name, 'Someone'),
            left(new.body, 140), v_link);
  end if;
  return new;
end;
$$;
revoke execute on function public.on_message_insert() from public, anon, authenticated;

drop trigger if exists on_message_insert on public.messages;
create trigger on_message_insert
  after insert on public.messages
  for each row execute function public.on_message_insert();

-- Live chat: the inbox subscribes to postgres_changes on messages (RLS applies).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;
