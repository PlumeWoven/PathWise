# Authentication & Authorization

## Auth Provider
- `AuthProvider` wraps the app; provides `useAuth()` hook with:
  - `user`, `profile`, `role`, `isLoggedIn`, `signOut`, `openLogin`, `refreshProfile`, `emailConfirmed`, `resendConfirmation`.
- `user` includes `app_metadata` (for admin claim).

## Roles
- `student`, `tutor`, `both`, `admin` (stored in `profiles.role`).
- Admin authorization is based on **JWT claim** (`user.app_metadata.role === 'admin'`), not `profile.role`, to avoid infinite recursion in RLS.

## Route Protection
- `RequireOnboarding` checks `onboarding_completed`.
- `RoleGate` for role‑based access.

## Impersonation Flow
1. Admin goes to `/admin/users` → clicks "Impersonate" on a user.
2. Frontend calls `/api/impersonate` (Nitro server) with admin token + target userId.
3. Server validates admin via JWT claim, gets target email, generates a magic link using Supabase admin client.
4. Server returns magic link; frontend stores impersonation flags in localStorage, signs out admin, redirects to magic link.
5. User is now signed in as the target user; banner shows "You are impersonating X".
6. Clicking "Exit Impersonation" clears flags, signs out, redirects to `/admin`.