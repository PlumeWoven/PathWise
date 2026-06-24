// Single source of truth for role semantics, post-auth routing, and
// authorization. Keep this module DEPENDENCY-FREE so it can be unit-tested in
// isolation (and reasoned about without pulling in React/Supabase).
//
// Role model:
//  - "student" | "tutor" | "both" are persisted in public.profiles.role.
//  - "admin" is NOT a profile role; it lives in the auth JWT
//    (app_metadata.role) and is checked via isAdmin().

export type Role = "student" | "tutor" | "both" | "admin";

/** Roles that may legitimately be stored in profiles.role. */
export const DB_ROLES = ["student", "tutor", "both"] as const;
export type DbRole = (typeof DB_ROLES)[number];

/** Routes this module may direct users to. Subset of the app's route tree. */
export type AppRoute =
  | "/"
  | "/dashboard"
  | "/roadmap"
  | "/admin"
  | "/onboarding/tutor"
  | "/onboarding/student";

/**
 * Coerce an unknown value (DB column, user_metadata, etc.) into a valid Role,
 * or null when it isn't one. Crucially this NEVER falls back to "student" —
 * an unknown/missing role must stay null so callers can handle it explicitly
 * instead of silently mislabeling the user.
 */
export function normalizeRole(raw: unknown): Role | null {
  return raw === "student" || raw === "tutor" || raw === "both" || raw === "admin" ? raw : null;
}

/** True when the role can act as a tutor (tutor or both). */
export function isTutorSide(role: Role | null | undefined): boolean {
  return role === "tutor" || role === "both";
}

/** True when the role can act as a student (student or both). */
export function isStudentSide(role: Role | null | undefined): boolean {
  return role === "student" || role === "both";
}

/** Admin is determined by the auth JWT (app_metadata.role), not the profile. */
export function isAdmin(appMetadata: Record<string, unknown> | null | undefined): boolean {
  return !!appMetadata && appMetadata.role === "admin";
}

/**
 * Where a fully-onboarded user of this role should land.
 * Unknown role → "/" (never assume student).
 */
export function roleHome(role: Role | null | undefined): AppRoute {
  if (role === "admin") return "/admin";
  if (isTutorSide(role)) return "/dashboard";
  if (role === "student") return "/roadmap";
  return "/";
}

/**
 * Which onboarding flow a not-yet-onboarded user of this role should enter.
 * "both" uses the tutor onboarding (the heavier flow incl. verification).
 * Unknown role → "/" (never assume student).
 */
export function roleOnboarding(role: Role | null | undefined): AppRoute {
  if (isTutorSide(role)) return "/onboarding/tutor";
  if (role === "student") return "/onboarding/student";
  return "/";
}

/**
 * The single decision used by every post-authentication redirect:
 * route to onboarding when incomplete, otherwise to the role's home.
 * Returns "/" when the role is unknown so callers don't have to special-case it.
 */
export function postAuthDestination(
  role: Role | null | undefined,
  onboardingCompleted: boolean | null | undefined,
): AppRoute {
  if (!normalizeRole(role ?? null)) return "/";
  return onboardingCompleted ? roleHome(role) : roleOnboarding(role);
}

/**
 * Authorization check for a route gate that permits the given `allow` roles.
 *  - admin is a superuser (always allowed).
 *  - "both" satisfies any gate that allows student OR tutor (OR both).
 *  - everyone else must be explicitly listed.
 *  - a null/unknown role is never allowed.
 */
export function canAccess(role: Role | null | undefined, allow: Role[]): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  if (role === "both") {
    return allow.some((r) => r === "both" || r === "student" || r === "tutor");
  }
  return allow.includes(role);
}
