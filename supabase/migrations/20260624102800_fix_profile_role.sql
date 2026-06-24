-- Fix role misassignment: make the trigger refuse to invent a role,
-- and add a one-shot RPC + tightened RLS so a non-null role can never be
-- silently overwritten by client upserts.

-- 1) Allow role to be NULL so we can distinguish "unset" from "student".
ALTER TABLE public.profiles
  ALTER COLUMN role DROP NOT NULL;

-- 2) Keep the enum but permit NULL.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IS NULL OR role IN ('student', 'tutor', 'both'));

-- 3) Trigger: insert NULL when caller didn't provide a role; validate when they did.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  meta_role text := nullif(new.raw_user_meta_data->>'role', '');
begin
  if meta_role is not null and meta_role not in ('student','tutor','both') then
    raise exception 'handle_new_user: invalid role %', meta_role;
  end if;

  insert into public.profiles (id, role, display_name, full_name)
  values (
    new.id,
    meta_role,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'display_name',
             split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

-- 4) One-shot role setter. Only writes when the column is currently NULL,
--    so client code can never clobber an already-assigned role.
CREATE OR REPLACE FUNCTION public.set_profile_role(target_role text)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  updated public.profiles;
begin
  if target_role not in ('student','tutor','both') then
    raise exception 'set_profile_role: invalid role %', target_role;
  end if;

  update public.profiles
     set role = target_role
   where id = auth.uid()
     and role is null
  returning * into updated;

  if updated.id is null then
    raise exception 'set_profile_role: role already set or no profile for user';
  end if;

  return updated;
end;
$function$;

GRANT EXECUTE ON FUNCTION public.set_profile_role(text) TO authenticated;

-- 5) Tighten RLS: a user may update their own row only when either
--    (a) the new role matches the current role (no-op on role), or
--    (b) the current role is NULL (first-time assignment).
DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;
CREATE POLICY "Profiles: update own non-role" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
      OR
      (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) IS NULL
    )
  );
