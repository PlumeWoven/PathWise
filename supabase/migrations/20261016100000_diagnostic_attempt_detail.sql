-- Keep the detail of every level-check attempt, so a student's history (and,
-- later, the brief a tutor sees) can say what was asked, what was missed and
-- what the student is strong in. Rows written before this keep the defaults.
alter table public.diagnostic_results
  add column if not exists answers jsonb not null default '[]'::jsonb,
  add column if not exists strong_topics text[] not null default '{}',
  add column if not exists confidence real;

comment on column public.diagnostic_results.answers is
  'One entry per question: {question_id, topic, tier, selected, correct}.';
comment on column public.diagnostic_results.strong_topics is
  'Topics with no miss whose hardest question reached the overall band.';
comment on column public.diagnostic_results.confidence is
  '0..1, how settled the placement was (adaptive-quiz confidence()).';
