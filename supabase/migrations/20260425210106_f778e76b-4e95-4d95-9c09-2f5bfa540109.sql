create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student','tutor')),
  display_name text,
  avatar_url text,
  bio text,
  subject_specialties text[],
  hourly_rate numeric,
  grade integer,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles: read own" on public.profiles for select using (auth.uid() = id);
create policy "Profiles: read tutors publicly" on public.profiles for select using (role = 'tutor');
create policy "Profiles: insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles: update own" on public.profiles for update using (auth.uid() = id);

create or replace function public.get_user_role(_user_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = _user_id;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- TUTOR-STUDENT LINKS (must exist before roadmap policies reference it)
create table public.tutor_students (
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (tutor_id, student_id)
);
alter table public.tutor_students enable row level security;
create policy "TutorStudents: read involved" on public.tutor_students for select using (auth.uid() = tutor_id or auth.uid() = student_id);
create policy "TutorStudents: tutor inserts" on public.tutor_students for insert with check (auth.uid() = tutor_id);
create policy "TutorStudents: involved deletes" on public.tutor_students for delete using (auth.uid() = tutor_id or auth.uid() = student_id);

-- DIAGNOSTIC RESULTS
create table public.diagnostic_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  subject text not null,
  goal text not null,
  score integer not null,
  level text not null,
  xp_earned integer not null,
  wrong_topics text[],
  created_at timestamptz not null default now()
);
alter table public.diagnostic_results enable row level security;
create policy "Diagnostics: anyone can insert" on public.diagnostic_results for insert with check (true);
create policy "Diagnostics: read own" on public.diagnostic_results for select using (auth.uid() = user_id);
create policy "Diagnostics: claim anonymous" on public.diagnostic_results for update
  using (user_id is null or auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ROADMAPS
create table public.roadmaps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  diagnostic_id uuid references public.diagnostic_results(id) on delete set null,
  subject text,
  goal text,
  current_stage integer not null default 1,
  total_stages integer not null default 5,
  created_at timestamptz not null default now()
);
alter table public.roadmaps enable row level security;
create policy "Roadmaps: anyone can insert" on public.roadmaps for insert with check (true);
create policy "Roadmaps: read own" on public.roadmaps for select using (auth.uid() = user_id);
create policy "Roadmaps: read anonymous" on public.roadmaps for select using (user_id is null);
create policy "Roadmaps: tutors read student roadmaps" on public.roadmaps for select using (
  exists (select 1 from public.tutor_students ts where ts.tutor_id = auth.uid() and ts.student_id = roadmaps.user_id)
);
create policy "Roadmaps: claim anonymous or update own" on public.roadmaps for update
  using (user_id is null or auth.uid() = user_id)
  with check (auth.uid() = user_id or user_id is null);

-- ROADMAP STAGES
create table public.roadmap_stages (
  id uuid primary key default uuid_generate_v4(),
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  stage_number integer not null,
  title text not null,
  skills text[],
  status text not null default 'locked' check (status in ('locked','active','complete')),
  completed_at timestamptz
);
alter table public.roadmap_stages enable row level security;
create policy "Stages: anyone can insert" on public.roadmap_stages for insert with check (true);
create policy "Stages: read own or anonymous" on public.roadmap_stages for select using (
  exists (select 1 from public.roadmaps r where r.id = roadmap_stages.roadmap_id and (r.user_id = auth.uid() or r.user_id is null))
);
create policy "Stages: tutors read student stages" on public.roadmap_stages for select using (
  exists (
    select 1 from public.roadmaps r join public.tutor_students ts on ts.student_id = r.user_id
    where r.id = roadmap_stages.roadmap_id and ts.tutor_id = auth.uid()
  )
);
create policy "Stages: update own" on public.roadmap_stages for update using (
  exists (select 1 from public.roadmaps r where r.id = roadmap_stages.roadmap_id and (r.user_id = auth.uid() or r.user_id is null))
);

-- SESSIONS
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id) on delete set null,
  tutor_id uuid references public.profiles(id) on delete set null,
  stage_id uuid references public.roadmap_stages(id) on delete set null,
  scheduled_at timestamptz,
  duration_minutes integer,
  notes text,
  rating integer check (rating between 1 and 5),
  created_at timestamptz not null default now()
);
alter table public.sessions enable row level security;
create policy "Sessions: read involved" on public.sessions for select using (auth.uid() = student_id or auth.uid() = tutor_id);
create policy "Sessions: insert involved" on public.sessions for insert with check (auth.uid() = student_id or auth.uid() = tutor_id);
create policy "Sessions: update involved" on public.sessions for update using (auth.uid() = student_id or auth.uid() = tutor_id);
create policy "Sessions: delete involved" on public.sessions for delete using (auth.uid() = student_id or auth.uid() = tutor_id);

-- REVIEWS
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id) on delete set null,
  tutor_id uuid references public.profiles(id) on delete set null,
  rating integer check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create policy "Reviews: public read" on public.reviews for select using (true);
create policy "Reviews: students insert own" on public.reviews for insert with check (auth.uid() = student_id);
create policy "Reviews: students update own" on public.reviews for update using (auth.uid() = student_id);
create policy "Reviews: students delete own" on public.reviews for delete using (auth.uid() = student_id);

-- COURSES
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  subject text,
  level text,
  description text,
  file_url text,
  created_at timestamptz not null default now()
);
alter table public.courses enable row level security;
create policy "Courses: public read" on public.courses for select using (true);
create policy "Courses: tutor inserts own" on public.courses for insert with check (auth.uid() = tutor_id);
create policy "Courses: tutor updates own" on public.courses for update using (auth.uid() = tutor_id);
create policy "Courses: tutor deletes own" on public.courses for delete using (auth.uid() = tutor_id);

create index on public.roadmaps(user_id);
create index on public.roadmap_stages(roadmap_id);
create index on public.diagnostic_results(user_id);
create index on public.sessions(student_id);
create index on public.sessions(tutor_id);
create index on public.reviews(tutor_id);
create index on public.courses(tutor_id);
create index on public.tutor_students(student_id);