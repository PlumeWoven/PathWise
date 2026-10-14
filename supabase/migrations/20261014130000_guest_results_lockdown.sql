-- Guest level checks and roadmaps: private to the browser that made them.
--
-- Before: any signed-out visitor could read every unclaimed diagnostic and
-- roadmap, and every roadmap stage (claimed or not); any signed-in user could
-- claim any guest roadmap; and diagnostic claims silently updated 0 rows
-- (signed-in users can't SELECT guest rows), so results never reached the
-- account.
--
-- After: each browser has a random guest token (localStorage pw_guest_token),
-- sent as the x-guest-token header. A guest reads and writes only rows saved
-- with that token. Claiming happens by token: at sign-up (handle_new_user,
-- token in the sign-up metadata, so it works on any device) and at sign-in
-- (claim_guest_roadmaps RPC). Unclaimed guest rows are deleted after 30 days.

-- 1. The token on the current request, or null (missing or malformed header).
create or replace function public.request_guest_token()
returns uuid
language plpgsql
stable
set search_path = ''
as $$
begin
  return nullif(current_setting('request.headers', true)::json ->> 'x-guest-token', '')::uuid;
exception when others then
  return null;
end;
$$;

-- 2. Claim, used by both sign-up and sign-in. Not callable directly.
create or replace function public.claim_guest_rows(p_user uuid, p_guest_token uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if p_user is null or p_guest_token is null then
    return;
  end if;
  update public.roadmap_stages s
  set guest_token = null
  from public.roadmaps r
  where r.id = s.roadmap_id and r.guest_token = p_guest_token and r.user_id is null;

  update public.roadmaps
  set user_id = p_user, guest_token = null
  where guest_token = p_guest_token and user_id is null;

  update public.diagnostic_results
  set user_id = p_user, guest_token = null
  where guest_token = p_guest_token and user_id is null;
end;
$$;
revoke execute on function public.claim_guest_rows(uuid, uuid) from public, anon, authenticated;

create or replace function public.claim_guest_roadmaps(p_guest_token uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  perform public.claim_guest_rows(auth.uid(), p_guest_token);
end;
$$;
revoke execute on function public.claim_guest_roadmaps(uuid) from public, anon;
grant execute on function public.claim_guest_roadmaps(uuid) to authenticated;

-- 3. Sign-up claims the token it was given (live definition + the claim).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
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

  -- A bad token must never block sign-up.
  begin
    perform public.claim_guest_rows(new.id, (new.raw_user_meta_data ->> 'guest_token')::uuid);
  exception when others then
    null;
  end;
  return new;
end;
$$;

-- 4. Policies.
-- diagnostic_results
drop policy if exists "Anon can read own results" on public.diagnostic_results;
drop policy if exists "Anon can insert null user_id" on public.diagnostic_results;
drop policy if exists "Authenticated can claim anonymous diagnostics" on public.diagnostic_results;
create policy "Guests read own results" on public.diagnostic_results
  for select to anon, authenticated
  using (user_id is null and guest_token = public.request_guest_token());
create policy "Guests insert own results" on public.diagnostic_results
  for insert to anon, authenticated
  with check (user_id is null and guest_token = public.request_guest_token());
-- kept: "Authenticated can read own", "Authenticated can insert own"

-- roadmaps
drop policy if exists anon_select_roadmaps on public.roadmaps;
drop policy if exists authenticated_select_roadmaps on public.roadmaps;
drop policy if exists anyone_insert_roadmaps on public.roadmaps;
drop policy if exists authenticated_claim_roadmaps on public.roadmaps;
create policy select_own_roadmaps on public.roadmaps
  for select to anon, authenticated
  using (
    (user_id is not null and user_id = auth.uid())
    or (user_id is null and guest_token = public.request_guest_token())
  );
create policy insert_own_roadmaps on public.roadmaps
  for insert to anon, authenticated
  with check (
    (user_id is not null and user_id = auth.uid())
    or (user_id is null and guest_token = public.request_guest_token())
  );
-- kept: authenticated_update_own_roadmaps

-- roadmap_stages: follow the parent roadmap (whose own RLS applies here).
drop policy if exists anon_select_stages on public.roadmap_stages;
drop policy if exists authenticated_select_stages on public.roadmap_stages;
drop policy if exists anyone_insert_stages on public.roadmap_stages;
drop policy if exists authenticated_update_stages on public.roadmap_stages;
create policy select_own_stages on public.roadmap_stages
  for select to anon, authenticated
  using (exists (select 1 from public.roadmaps r where r.id = roadmap_stages.roadmap_id));
create policy insert_own_stages on public.roadmap_stages
  for insert to anon, authenticated
  with check (exists (select 1 from public.roadmaps r where r.id = roadmap_stages.roadmap_id));
create policy update_own_stages on public.roadmap_stages
  for update to authenticated
  using (exists (
    select 1 from public.roadmaps r
    where r.id = roadmap_stages.roadmap_id and r.user_id = auth.uid()
  ));

-- 5. A deleted account's results go with it instead of becoming guest rows.
alter table public.diagnostic_results drop constraint diagnostic_results_user_id_fkey;
alter table public.diagnostic_results
  add constraint diagnostic_results_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

-- 6. Repair: results whose roadmap was claimed but whose diagnostic claim
--    silently failed belong to the roadmap's owner.
update public.diagnostic_results d
set user_id = r.user_id
from public.roadmaps r
where r.diagnostic_id = d.id and d.user_id is null and r.user_id is not null;

-- 7. Delete unclaimed guest rows after 30 days (stages cascade with roadmaps).
create extension if not exists pg_cron;
select cron.schedule(
  'delete-unclaimed-guest-results',
  '17 3 * * *',
  $$
    delete from public.roadmaps where user_id is null and created_at < now() - interval '30 days';
    delete from public.diagnostic_results where user_id is null and created_at < now() - interval '30 days';
  $$
);
