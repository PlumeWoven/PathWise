-- RLS check for 20261014130000_guest_results_lockdown.sql on a throwaway local
-- Postgres (no Supabase needed). Part 1 mirrors the live schema and policies as
-- of 2026-10-14; part 2 asserts the guest, stranger, sign-up and sign-in cases.
--
--   createdb pw_rls_test
--   psql -d pw_rls_test -v ON_ERROR_STOP=1 -f supabase/tests/guest_results_lockdown.sql -v part=1
--   sed '/^-- 7\./,$d' supabase/migrations/20261014130000_guest_results_lockdown.sql | psql -d pw_rls_test -v ON_ERROR_STOP=1
--   psql -d pw_rls_test -f supabase/tests/guest_results_lockdown.sql -v part=2   # ends with ALL PASSED
--
-- (Section 7, the pg_cron job, is skipped: plain Postgres has no pg_cron.)

\if :{?part}
\else
\echo 'pass -v part=1 or -v part=2'
\quit
\endif

select :part = 1 as is_part1 \gset
\if :is_part1
do $$ begin create role anon nologin; create role authenticated nologin; create role service_role nologin; exception when duplicate_object then null; end $$;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::json->>'sub','')::uuid $$;
grant usage on schema auth to anon, authenticated;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
create table public.profiles (id uuid primary key, display_name text, full_name text, role text);
create table public.diagnostic_results (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete set null, subject text, score int, guest_token uuid, created_at timestamptz default now());
create table public.roadmaps (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete cascade, diagnostic_id uuid references public.diagnostic_results(id) on delete set null, subject text, guest_token uuid, created_at timestamptz default now());
create table public.roadmap_stages (id uuid primary key default gen_random_uuid(), roadmap_id uuid references public.roadmaps(id) on delete cascade, stage_number int, status text, guest_token uuid);
alter table public.diagnostic_results enable row level security; alter table public.roadmaps enable row level security; alter table public.roadmap_stages enable row level security;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
-- live policies (pg_policies, 2026-10-14)
create policy "Anon can insert null user_id" on diagnostic_results for insert to anon with check (user_id is null);
create policy "Authenticated can insert own" on diagnostic_results for insert to authenticated with check (user_id = auth.uid());
create policy "Authenticated can read own" on diagnostic_results for select to authenticated using (user_id = auth.uid());
create policy "Anon can read own results" on diagnostic_results for select to anon using (user_id is null);
create policy "Authenticated can claim anonymous diagnostics" on diagnostic_results for update to authenticated using (user_id is null) with check (user_id = auth.uid());
create policy anyone_insert_stages on roadmap_stages for insert to anon, authenticated with check (true);
create policy authenticated_select_stages on roadmap_stages for select to authenticated using (exists (select 1 from roadmaps r where r.id = roadmap_stages.roadmap_id and (r.user_id = auth.uid() or r.user_id is null)));
create policy anon_select_stages on roadmap_stages for select to anon using (true);
create policy authenticated_update_stages on roadmap_stages for update to authenticated using (exists (select 1 from roadmaps r where r.id = roadmap_stages.roadmap_id and (r.user_id = auth.uid() or r.user_id is null)));
create policy anyone_insert_roadmaps on roadmaps for insert to anon, authenticated with check (true);
create policy anon_select_roadmaps on roadmaps for select to anon using (user_id is null);
create policy authenticated_select_roadmaps on roadmaps for select to authenticated using (auth.uid() = user_id or user_id is null);
create policy authenticated_claim_roadmaps on roadmaps for update to authenticated using (user_id is null) with check (auth.uid() = user_id);
create policy authenticated_update_own_roadmaps on roadmaps for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create function public.handle_new_user() returns trigger language plpgsql security definer as $$ begin insert into public.profiles(id) values (new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- pre-existing data: a tokenless guest row whose roadmap was claimed (failed diag claim)
insert into profiles(id) values ('aaaaaaaa-0000-0000-0000-000000000002');
insert into diagnostic_results(id, user_id, subject) values ('00000000-0000-0000-0000-0000000000d0', null, 'Old');
insert into roadmaps(user_id, diagnostic_id, subject) values ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000d0', 'Old');

\else
\set ON_ERROR_STOP 1
-- helpers
create or replace function pg_temp.as_guest(tok text) returns void language plpgsql as $$ begin
  perform set_config('request.headers', json_build_object('x-guest-token', tok)::text, false);
  perform set_config('request.jwt.claims', '{}', false); end $$;
create or replace function pg_temp.as_user(uid uuid, tok text) returns void language plpgsql as $$ begin
  perform set_config('request.headers', json_build_object('x-guest-token', tok)::text, false);
  perform set_config('request.jwt.claims', json_build_object('sub', uid)::text, false); end $$;
create or replace function pg_temp.check(ok boolean, msg text) returns void language plpgsql as $$ begin
  if ok is not true then raise exception 'FAIL: %', msg; end if; raise notice 'ok: %', msg; end $$;
\set A '11111111-1111-1111-1111-111111111111'
\set B '22222222-2222-2222-2222-222222222222'
\set U1 'aaaaaaaa-0000-0000-0000-000000000001'
\set U2 'aaaaaaaa-0000-0000-0000-000000000002'
-- pre-existing tokenless guest row and an existing student whose diag claim failed

-- guest A saves a result + roadmap + stages (as the app does: insert ... returning)
set role anon; select pg_temp.as_guest(:'A');
insert into diagnostic_results(id, user_id, subject, guest_token) values ('00000000-0000-0000-0000-0000000000a1', null, 'Math', :'A') returning id;
insert into roadmaps(id, user_id, diagnostic_id, subject, guest_token) values ('00000000-0000-0000-0000-0000000000a2', null, '00000000-0000-0000-0000-0000000000a1', 'Math', :'A') returning id;
insert into roadmap_stages(roadmap_id, stage_number, status) select '00000000-0000-0000-0000-0000000000a2', g, 'locked' from generate_series(1,5) g;
select pg_temp.check((select count(*) from diagnostic_results)=1, 'guest A reads only own diagnostic');
select pg_temp.check((select count(*) from roadmap_stages)=5, 'guest A reads own 5 stages');
-- guest A cannot forge another token or write with none
do $$ begin
  begin insert into diagnostic_results(user_id, subject, guest_token) values (null,'x','22222222-2222-2222-2222-222222222222'); raise exception 'FAIL: forged token insert allowed';
  exception when insufficient_privilege then raise notice 'ok: forged-token insert blocked'; end;
end $$;

-- guest B / no token sees nothing
select pg_temp.as_guest(:'B');
select pg_temp.check((select count(*) from diagnostic_results)+(select count(*) from roadmaps)+(select count(*) from roadmap_stages)=0, 'guest B sees nothing of A');
select pg_temp.as_guest('not-a-uuid');
select pg_temp.check((select count(*) from roadmap_stages)=0, 'malformed token sees nothing, no error');
do $$ begin
  begin insert into roadmap_stages(roadmap_id, stage_number) values ('00000000-0000-0000-0000-0000000000a2', 9); raise exception 'FAIL: stage insert into other roadmap allowed';
  exception when insufficient_privilege then raise notice 'ok: stage insert into others roadmap blocked'; end;
end $$;

-- a stranger signed in can neither see nor claim A's rows
reset role; insert into profiles(id) values (:'U1');
set role authenticated; select pg_temp.as_user(:'U1', :'B');
select pg_temp.check((select count(*) from roadmaps)=0, 'stranger sees no guest roadmaps');
update roadmaps set user_id = :'U1' where user_id is null;
do $$ begin begin perform public.claim_guest_rows('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111'); raise exception 'FAIL: claim_guest_rows callable';
  exception when insufficient_privilege then raise notice 'ok: claim_guest_rows not callable'; end; end $$;
select public.claim_guest_roadmaps(:'B');
reset role;
select pg_temp.check((select user_id from roadmaps where id='00000000-0000-0000-0000-0000000000a2') is null, 'stranger did not claim A');

-- anon cannot call the claim RPC
set role anon;
do $$ begin begin perform public.claim_guest_roadmaps('11111111-1111-1111-1111-111111111111'); raise exception 'FAIL: anon can claim';
  exception when insufficient_privilege then raise notice 'ok: anon cannot call claim'; end; end $$;
reset role;

-- sign-up on ANOTHER device carrying A's token in metadata claims everything
insert into auth.users(id, email, raw_user_meta_data) values ('aaaaaaaa-0000-0000-0000-00000000000a', 'a@x', json_build_object('guest_token', :'A')::jsonb);
select pg_temp.check((select user_id from diagnostic_results where id='00000000-0000-0000-0000-0000000000a1') = 'aaaaaaaa-0000-0000-0000-00000000000a', 'sign-up claimed diagnostic');
select pg_temp.check((select user_id from roadmaps where id='00000000-0000-0000-0000-0000000000a2') = 'aaaaaaaa-0000-0000-0000-00000000000a', 'sign-up claimed roadmap');
-- bad token in metadata does not block sign-up
insert into auth.users(id, email, raw_user_meta_data) values ('aaaaaaaa-0000-0000-0000-00000000000b', 'b@x', '{"guest_token":"garbage"}');
select pg_temp.check(exists(select 1 from profiles where id='aaaaaaaa-0000-0000-0000-00000000000b'), 'garbage token: sign-up still works');

-- owner reads + updates own stages; guest A token no longer reads them
set role authenticated; select pg_temp.as_user('aaaaaaaa-0000-0000-0000-00000000000a', :'A');
select pg_temp.check((select count(*) from roadmap_stages)=5 and (select count(*) from diagnostic_results)=1, 'owner reads own roadmap stages + diagnostic');
update roadmap_stages set status='active' where stage_number=1;
select pg_temp.check((select count(*) from roadmap_stages where status='active')=1, 'owner updates own stage');
set role anon; select pg_temp.as_guest(:'A');
select pg_temp.check((select count(*) from roadmap_stages)=0, 'after claim, guest token reads nothing');

-- sign-in path: guest B saves, signs in as U1, RPC claims
select pg_temp.as_guest(:'B');
insert into roadmaps(id, user_id, subject, guest_token) values ('00000000-0000-0000-0000-0000000000b2', null, 'Eng', :'B');
set role authenticated; select pg_temp.as_user(:'U1', :'B');
select pg_temp.check((select count(*) from roadmaps)=1, 'signed-in user sees own unclaimed guest roadmap pre-claim');
select public.claim_guest_roadmaps(:'B');
reset role;
select pg_temp.check((select user_id from roadmaps where id='00000000-0000-0000-0000-0000000000b2') = :'U1', 'sign-in RPC claimed');

-- repair + cascade
select pg_temp.check((select user_id from diagnostic_results where id='00000000-0000-0000-0000-0000000000d0') = :'U2', 'repair gave old diagnostic to its roadmap owner');
delete from profiles where id = :'U2';
select pg_temp.check(not exists(select 1 from diagnostic_results where id='00000000-0000-0000-0000-0000000000d0'), 'deleted account takes its results with it');
-- cleanup job statements
update roadmaps set created_at = now() - interval '31 days' where user_id is null;
delete from public.roadmaps where user_id is null and created_at < now() - interval '30 days';
delete from public.diagnostic_results where user_id is null and created_at < now() - interval '30 days';
select 'ALL PASSED';
\endif
