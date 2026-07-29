/**
 * src/pathwise/oauth.ts
 *
 * Native Supabase OAuth for PathWise.
 *
 * This replaces the previous route through @lovable.dev/cloud-auth-js, which
 * brokered the handshake through Lovable's own OAuth application. Going direct
 * to Supabase means the Google app is ours, the flow matches the rest of the
 * auth in this codebase (all plain supabase.auth.*), and we control the two
 * things the brokered version could not: which redirect URI we come back to,
 * and forcing Google's account chooser.
 *
 * The handshake:
 *   1. signInWithGoogle() stashes intent (role, return path) in sessionStorage,
 *      which survives a full-page redirect in the same tab.
 *   2. Browser leaves for accounts.google.com, user picks an account.
 *   3. Google returns to Supabase, which returns to /auth/callback?code=…
 *   4. routes/auth.callback.tsx exchanges the code, applies the stashed intent,
 *      and routes by role — sending role-less new users to /auth/choose-role.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Role } from "./roles";

/** Where Supabase sends the browser back to. Must be allow-listed in the dashboard. */
export const OAUTH_CALLBACK_PATH = "/auth/callback";

/**
 * sessionStorage (not localStorage) on purpose: this intent belongs to one
 * sign-in attempt in one tab, and must not leak into a later session.
 */
const PENDING_ROLE_KEY = "pathwise_pending_role";
const RETURN_PATH_KEY = "pathwise_oauth_return_path";

export interface GoogleSignInOptions {
  /**
   * Role to assign if — and only if — the resulting profile has none yet.
   * Applied via the set_profile_role RPC, which refuses to overwrite an
   * existing role, so passing this for a returning user is harmless.
   */
  role?: Role | null;
  /** Path to return to after auth instead of the role's default home. */
  returnPath?: string | null;
}

function safeSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private browsing / storage disabled — the flow still works, we just
       lose the preference and fall back to the role chooser. */
  }
}

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeRemove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readPendingRole(): Role | null {
  const raw = safeGet(PENDING_ROLE_KEY);
  safeRemove(PENDING_ROLE_KEY);
  return raw === "student" || raw === "tutor" || raw === "both" ? raw : null;
}

export function readReturnPath(): string | null {
  const raw = safeGet(RETURN_PATH_KEY);
  safeRemove(RETURN_PATH_KEY);
  // Only ever honour app-internal paths — never an absolute URL, which would
  // turn our own callback into an open redirect.
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export function stashReturnPath(path: string) {
  if (path.startsWith("/") && !path.startsWith("//")) {
    safeSet(RETURN_PATH_KEY, path);
  }
}

/**
 * Sends the browser to Google. Resolves only on failure — on success the page
 * is already navigating away, so callers should treat a resolved promise
 * without an error as "redirect in flight" and leave their spinner up.
 */
export async function signInWithGoogle(
  options: GoogleSignInOptions = {},
): Promise<{ error: Error | null }> {
  const { role = null, returnPath = null } = options;

  if (role) safeSet(PENDING_ROLE_KEY, role);
  if (returnPath) stashReturnPath(returnPath);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${OAUTH_CALLBACK_PATH}`,
      queryParams: {
        // The brief: "directed to their google account of their choosing".
        // Without this Google silently reuses the single signed-in account
        // and the user never sees a chooser.
        prompt: "select_account",
      },
    },
  });

  if (error) {
    // Don't leave stale intent behind for the next attempt.
    safeRemove(PENDING_ROLE_KEY);
    safeRemove(RETURN_PATH_KEY);
    return { error };
  }

  return { error: null };
}

/**
 * Best-effort profile repair from Google's identity payload.
 *
 * The handle_new_user trigger derives display_name from the email local-part
 * (it has no idea Google sent a real name), and never sets an avatar. This
 * fills both in — but only where the profile is currently empty, so a user who
 * has since edited their own name doesn't get it overwritten on next sign-in.
 */
export async function backfillProfileFromOAuth(userId: string, metadata: Record<string, unknown>) {
  const name =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    null;
  const avatar =
    (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
    (typeof metadata.picture === "string" && metadata.picture) ||
    null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("display_name, full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  const patch: { display_name?: string; full_name?: string; avatar_url?: string } = {};
  if (name && !existing?.full_name) patch.full_name = name;
  // The trigger writes the email local-part as display_name, so treat that as
  // "unset" and prefer Google's real name over it.
  if (name && !existing?.display_name) patch.display_name = name;
  if (avatar && !existing?.avatar_url) patch.avatar_url = avatar;

  if (Object.keys(patch).length === 0) return;

  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) console.warn("[oauth] profile backfill failed", error.message);
}

/**
 * Assigns a role when the profile has none. The RPC is the authority here: it
 * only writes where role IS NULL, so this can never clobber an existing role
 * no matter how often it runs.
 */
export async function applyPendingRole(role: Role): Promise<boolean> {
  if (role === "admin") return false; // admin lives in the JWT, not the profile

  // Cast through any until generated types include the RPC.
  const { error } = await (supabase.rpc as any)("set_profile_role", { target_role: role });
  if (!error) return true;
  if (/already set/i.test(error.message)) return false;
  console.warn("[oauth] set_profile_role", error.message);
  return false;
}
