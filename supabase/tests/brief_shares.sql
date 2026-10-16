-- RLS check for 20261016110000_brief_shares.sql on a throwaway local Postgres:
--   createdb pw_shares_test && psql -d pw_shares_test -f supabase/tests/brief_shares.sql
-- Ends with ALL PASSED.
\set ON_ERROR_STOP 1
do $$ begin create role anon nologin; create role authenticated nologin;
exception when duplicate_object then null; end $$;
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claims', true)::json->>'sub','')::uuid $$;
grant usage on schema auth to anon, authenticated;
create table public.profiles (id uuid primary key);
insert into public.profiles values
  ('aaaaaaaa-0000-0000-0000-00000000000a'), -- student A
  ('bbbbbbbb-0000-0000-0000-00000000000b'), -- student B
  ('77777777-0000-0000-0000-000000000007'), -- tutor T
  ('88888888-0000-0000-0000-000000000008'); -- tutor U
\ir ../migrations/20261016110000_brief_shares.sql

create or replace function pg_temp.check(ok boolean, msg text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'FAIL: %', msg; end if; raise notice 'ok: %', msg; end $$;
create or replace function pg_temp.as_user(uid text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claims', json_build_object('sub', uid)::text, false); end $$;

set role authenticated;
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-00000000000a');
insert into brief_shares(student_id, tutor_id, subject) values ('aaaaaaaa-0000-0000-0000-00000000000a', '77777777-0000-0000-0000-000000000007', 'Mathematics');
select pg_temp.check((select count(*) from brief_shares) = 1, 'student shares own level check');
do $$ begin
  begin
    insert into brief_shares(student_id, tutor_id, subject) values ('bbbbbbbb-0000-0000-0000-00000000000b', '77777777-0000-0000-0000-000000000007', 'Mathematics');
    raise exception 'FAIL: shared on behalf of another student';
  exception when insufficient_privilege then raise notice 'ok: cannot share for another student'; end;
end $$;

select pg_temp.as_user('77777777-0000-0000-0000-000000000007');
select pg_temp.check((select count(*) from brief_shares) = 1, 'tutor sees the share made to them');
update brief_shares set revoked_at = null, subject = 'Sciences';
select pg_temp.check((select subject from brief_shares) = 'Mathematics', 'tutor cannot edit a share');

select pg_temp.as_user('88888888-0000-0000-0000-000000000008');
select pg_temp.check((select count(*) from brief_shares) = 0, 'another tutor sees nothing');
select pg_temp.as_user('bbbbbbbb-0000-0000-0000-00000000000b');
select pg_temp.check((select count(*) from brief_shares) = 0, 'another student sees nothing');

select pg_temp.as_user('aaaaaaaa-0000-0000-0000-00000000000a');
update brief_shares set revoked_at = now() where tutor_id = '77777777-0000-0000-0000-000000000007';
select pg_temp.check((select revoked_at is not null from brief_shares), 'student revokes');
insert into brief_shares(student_id, tutor_id, subject, revoked_at) values ('aaaaaaaa-0000-0000-0000-00000000000a', '77777777-0000-0000-0000-000000000007', 'Mathematics', null)
  on conflict (student_id, tutor_id, subject) do update set revoked_at = null, granted_at = now();
select pg_temp.check((select revoked_at is null from brief_shares), 'student re-grants by booking again (upsert)');

reset role; set role anon;
do $$ begin
  begin perform 1 from brief_shares; raise exception 'FAIL: anon can read';
  exception when insufficient_privilege then raise notice 'ok: signed-out visitors cannot read shares'; end;
end $$;
reset role;
select 'ALL PASSED';
