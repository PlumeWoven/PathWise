-- Check for 20261016120000_student_brief.sql on a throwaway local Postgres:
--   createdb pw_brief_test && psql -d pw_brief_test -f supabase/tests/student_brief.sql
-- Ends with ALL PASSED.
\set ON_ERROR_STOP 1
do $$ begin create role anon nologin; create role authenticated nologin;
exception when duplicate_object then null; end $$;
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claims', true)::json->>'sub','')::uuid $$;
grant usage on schema auth to anon, authenticated;
create table public.profiles (id uuid primary key);
create table public.sessions (id uuid primary key default gen_random_uuid(), student_id uuid, tutor_id uuid, status_v2 text);
create table public.diagnostic_results (
  id uuid primary key default gen_random_uuid(), user_id uuid, subject text, level text, level_band int,
  goal text, strong_topics text[] default '{}', wrong_topics text[], topic_bands jsonb default '{}',
  answers jsonb default '[]', created_at timestamptz default now());
\set S 'aaaaaaaa-0000-0000-0000-00000000000a'
\set T 'bbbbbbbb-0000-0000-0000-00000000000b'
\set U 'cccccccc-0000-0000-0000-00000000000c'
insert into profiles values (:'S'), (:'T'), (:'U');
\ir ../migrations/20261016110000_brief_shares.sql
\ir ../migrations/20261016120000_student_brief.sql

create or replace function pg_temp.check(ok boolean, msg text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'FAIL: %', msg; end if; raise notice 'ok: %', msg; end $$;
create or replace function pg_temp.as_user(uid text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claims', json_build_object('sub', uid)::text, false); end $$;

insert into diagnostic_results(user_id, subject, level, level_band, goal, strong_topics, wrong_topics, created_at) values
  (:'S', 'Mathematics', 'Seedling', 1, 'exam', '{}', '{Algebra}', now() - interval '2 days'),
  (:'S', 'Mathematics', 'Spark', 2, 'exam', '{Algebra}', '{Geometry}', now()),
  (:'S', 'Sciences', 'Builder', 3, 'grades', '{}', '{}', now()),
  (null, 'Mathematics', 'Mastermind', 5, 'exam', '{}', '{}', now() + interval '1 day'); -- a guest row

set role authenticated;
select pg_temp.as_user(:'T');
select pg_temp.check(student_brief(:'S') = '[]', 'no session, no share: nothing');

reset role;
insert into sessions(student_id, tutor_id, status_v2) values (:'S', :'T', 'confirmed');
set role authenticated;
select pg_temp.check(student_brief(:'S') = '[]', 'session but no share: nothing');

select pg_temp.as_user(:'S');
insert into brief_shares(student_id, tutor_id, subject) values (:'S', :'T', 'Mathematics');
select pg_temp.as_user(:'T');
select pg_temp.check(jsonb_array_length(student_brief(:'S')) = 1, 'shared subject only (Sciences not shared)');
select pg_temp.check(student_brief(:'S') -> 0 ->> 'level' = 'Spark', 'latest claimed attempt, never the guest row');
select pg_temp.check(student_brief(:'S') -> 0 -> 'strong_topics' = '["Algebra"]' and student_brief(:'S') -> 0 -> 'wrong_topics' = '["Geometry"]', 'strengths and gaps');
select pg_temp.check(jsonb_array_length(student_brief(:'S') -> 0 -> 'history') = 2, 'history of both claimed attempts');
select pg_temp.check(student_brief(:'S') -> 0 -> 'answers' is null, 'individual answers are not returned');

select pg_temp.as_user(:'U');
select pg_temp.check(student_brief(:'S') = '[]', 'another tutor sees nothing');

select pg_temp.as_user(:'S');
update brief_shares set revoked_at = now();
select pg_temp.as_user(:'T');
select pg_temp.check(student_brief(:'S') = '[]', 'revoked: nothing');

select pg_temp.as_user(:'S');
update brief_shares set revoked_at = null;
reset role;
update sessions set status_v2 = 'cancelled';
set role authenticated; select pg_temp.as_user(:'T');
select pg_temp.check(student_brief(:'S') = '[]', 'only cancelled sessions left: nothing');

reset role; set role anon;
do $$ begin
  begin perform public.student_brief('aaaaaaaa-0000-0000-0000-00000000000a'); raise exception 'FAIL: anon can call';
  exception when insufficient_privilege then raise notice 'ok: signed-out visitors cannot call it'; end;
end $$;
reset role;
select 'ALL PASSED';
