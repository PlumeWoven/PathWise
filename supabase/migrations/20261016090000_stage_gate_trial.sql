-- Roadmap stage gate: a completed course OR a completed trial lesson.
--
-- Before: a stage completed only with a finished course at that stage's level.
-- The live catalogue has no Seedling, Spark or Mastermind courses, so most
-- students could never finish stage 1 and nobody could finish stage 5.
--
-- After (owner decision, 2026-10-14): a completed trial lesson also unlocks
-- the stage. Each trial unlocks one stage only; the stage records which
-- session it used, and a unique index stops the same session being used twice.

alter table public.roadmap_stages
  add column if not exists completed_by_session_id uuid
  references public.sessions(id) on delete set null;
create unique index if not exists roadmap_stages_completed_by_session_id_key
  on public.roadmap_stages (completed_by_session_id);

create or replace function public.enforce_stage_course_requirement()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_session uuid;
begin
  -- Only this trigger decides which session a stage used, so nobody can
  -- spend another student's trial by writing its id onto a row.
  if tg_op = 'INSERT' then
    new.completed_by_session_id := null;
    return new;
  end if;
  new.completed_by_session_id := old.completed_by_session_id;

  if new.status = 'complete'
     and coalesce(old.status, '') <> 'complete'
     and new.required_level_id is not null
     and not exists (
       select 1 from public.course_enrollments e
       where e.roadmap_stage_id = new.id and e.status = 'completed'
     )
  then
    select s.id into v_session
    from public.sessions s
    join public.roadmaps r on r.id = new.roadmap_id
    where s.student_id = r.user_id
      and s.session_type = 'trial'
      and s.status_v2 in ('completed', 'awaiting_review', 'closed')
      and not exists (
        select 1 from public.roadmap_stages x where x.completed_by_session_id = s.id
      )
    order by s.scheduled_end
    limit 1;

    if v_session is null then
      raise exception 'STAGE_COURSE_REQUIRED'
        using hint = 'Finish a course at this stage''s level, or a trial lesson, first.',
              errcode = 'check_violation';
    end if;
    new.completed_by_session_id := v_session;
  end if;
  return new;
end;
$function$;

drop trigger if exists roadmap_stages_course_gate on public.roadmap_stages;
create trigger roadmap_stages_course_gate
  before insert or update on public.roadmap_stages
  for each row execute function public.enforce_stage_course_requirement();
