-- verification_requests table
create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null check (type in ('identity', 'background')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  id_document_path text,
  selfie_path text,
  notes text,
  submitted_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_verification_requests_user on public.verification_requests(user_id);

alter table public.verification_requests enable row level security;

create policy "VR: users read own"
  on public.verification_requests for select
  using (auth.uid() = user_id);

create policy "VR: users insert own"
  on public.verification_requests for insert
  with check (auth.uid() = user_id);

-- Private bucket for verification docs
insert into storage.buckets (id, name, public)
values ('verification-documents', 'verification-documents', false)
on conflict (id) do nothing;

-- Users can upload their own files (path must start with their uid)
create policy "VerDocs: user upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "VerDocs: user read own"
  on storage.objects for select
  using (
    bucket_id = 'verification-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );