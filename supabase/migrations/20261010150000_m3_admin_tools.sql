-- M3 — admin tools (Phase 3). Written against the live schema after M2.

-- Suspension marker for the admin users list. Set/cleared by api/admin-user.js
-- (service role) alongside the auth ban.
alter table public.profiles add column if not exists suspended_at timestamptz;

-- Users must not be able to clear their own suspension (or set it on anyone).
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'role can only be changed by an admin';
    end if;
    if new.verification_status is distinct from old.verification_status
       and new.verification_status is distinct from 'pending' then
      raise exception 'verification status can only be set by an admin';
    end if;
    if new.suspended_at is distinct from old.suspended_at then
      raise exception 'suspension can only be changed by an admin';
    end if;
  end if;
  return new;
end;
$$;

-- Audit trail written by api/impersonate.js; readable by admins only.
create policy "Admins can read impersonation logs" on public.impersonation_logs
  for select to authenticated
  using (public.is_admin());
