-- The level-check brief a tutor sees before a trial (owner decisions,
-- 2026-10-14): level, goal, strengths, gaps, and a one-line history, per
-- subject the student shares with this tutor.
--
-- Tutors never get a policy on diagnostic_results. This function is the only
-- way in, and it returns nothing unless all of these hold:
--   * the caller is a tutor this student has a live (not cancelled) session with;
--   * the student shares that subject with the caller (brief_shares, not revoked);
--   * the attempt belongs to the student (claimed rows only, never guest rows).
-- Individual answers are not returned.

create or replace function public.student_brief(p_student uuid)
returns jsonb
language sql
stable
security definer
set search_path = 'public'
as $$
  select coalesce(jsonb_agg(brief order by brief ->> 'subject'), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'subject', sh.subject,
      'level', latest.level,
      'level_band', latest.level_band,
      'goal', latest.goal,
      'strong_topics', latest.strong_topics,
      'wrong_topics', coalesce(latest.wrong_topics, '{}'),
      'topic_bands', latest.topic_bands,
      'taken_at', latest.created_at,
      'history', (
        select coalesce(jsonb_agg(jsonb_build_object('taken_at', h.created_at, 'level', h.level)
                                  order by h.created_at desc), '[]'::jsonb)
        from (
          select created_at, level from diagnostic_results
          where user_id = p_student and subject = sh.subject
          order by created_at desc
          limit 5
        ) h
      )
    ) as brief
    from brief_shares sh
    join lateral (
      select * from diagnostic_results d
      where d.user_id = p_student and d.subject = sh.subject
      order by d.created_at desc
      limit 1
    ) latest on true
    where sh.student_id = p_student
      and sh.tutor_id = auth.uid()
      and sh.revoked_at is null
      and exists (
        select 1 from sessions s
        where s.student_id = p_student
          and s.tutor_id = auth.uid()
          and s.status_v2 <> 'cancelled'
      )
  ) briefs;
$$;

revoke execute on function public.student_brief(uuid) from public, anon;
grant execute on function public.student_brief(uuid) to authenticated;
