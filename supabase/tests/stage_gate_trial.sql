-- Check for 20261016090000_stage_gate_trial.sql on a throwaway local Postgres:
--   createdb pw_gate_test && psql -d pw_gate_test -f supabase/tests/stage_gate_trial.sql
-- Ends with ALL PASSED. Mirrors only the columns the gate reads.
\set ON_ERROR_STOP 1
create table public.profiles (id uuid primary key);
create table public.sessions (id uuid primary key default gen_random_uuid(), student_id uuid, session_type text, status_v2 text, scheduled_end timestamptz default now());
create table public.roadmaps (id uuid primary key default gen_random_uuid(), user_id uuid);
create table public.roadmap_stages (id uuid primary key default gen_random_uuid(), roadmap_id uuid references public.roadmaps(id), stage_number int, status text, required_level_id text, completed_at timestamptz);
create table public.course_enrollments (id uuid primary key default gen_random_uuid(), roadmap_stage_id uuid, status text);
\ir ../migrations/20261016090000_stage_gate_trial.sql

create or replace function pg_temp.check(ok boolean, msg text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'FAIL: %', msg; end if; raise notice 'ok: %', msg; end $$;
create or replace function pg_temp.complete(stage int) returns text language plpgsql as $$
begin
  update roadmap_stages set status = 'complete' where stage_number = stage;
  return 'done';
exception when check_violation then return 'blocked';
end $$;

insert into roadmaps(id, user_id) values ('00000000-0000-0000-0000-00000000000a', 'aaaaaaaa-0000-0000-0000-000000000001');
insert into roadmap_stages(roadmap_id, stage_number, status, required_level_id)
  select '00000000-0000-0000-0000-00000000000a', g, 'active', 'mathematics.L' || g from generate_series(1,4) g;

select pg_temp.check(pg_temp.complete(1) = 'blocked', 'no course, no trial: blocked');
insert into sessions(id, student_id, session_type, status_v2) values
  ('5e550000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'trial', 'scheduled'),
  ('5e550000-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002', 'trial', 'completed'),
  ('5e550000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'standard', 'completed');
select pg_temp.check(pg_temp.complete(1) = 'blocked', 'unfinished trial, someone else''s trial, paid lesson: still blocked');

insert into sessions(id, student_id, session_type, status_v2) values
  ('5e550000-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'trial', 'completed');
select pg_temp.check(pg_temp.complete(1) = 'done', 'own completed trial unlocks stage 1');
select pg_temp.check((select completed_by_session_id from roadmap_stages where stage_number = 1) = '5e550000-0000-0000-0000-000000000004', 'stage 1 records the trial it used');
select pg_temp.check(pg_temp.complete(2) = 'blocked', 'the same trial cannot unlock stage 2');

update roadmap_stages set completed_by_session_id = '5e550000-0000-0000-0000-000000000002' where stage_number = 3;
select pg_temp.check((select completed_by_session_id from roadmap_stages where stage_number = 3) is null, 'clients cannot set completed_by_session_id');
insert into roadmap_stages(roadmap_id, stage_number, status, completed_by_session_id)
  values ('00000000-0000-0000-0000-00000000000a', 9, 'locked', '5e550000-0000-0000-0000-000000000002');
select pg_temp.check((select completed_by_session_id from roadmap_stages where stage_number = 9) is null, 'an insert cannot claim someone else''s trial');

insert into course_enrollments(roadmap_stage_id, status) select id, 'completed' from roadmap_stages where stage_number = 2;
select pg_temp.check(pg_temp.complete(2) = 'done', 'a completed course still unlocks a stage');
select pg_temp.check((select completed_by_session_id from roadmap_stages where stage_number = 2) is null, 'course path uses no trial');

update roadmap_stages set required_level_id = null where stage_number = 4;
select pg_temp.check(pg_temp.complete(4) = 'done', 'ungated (old) stages complete freely');
select 'ALL PASSED';
