/**
 * A private random id per browser. Guest level checks and roadmaps are saved
 * with it, and the database only lets a request carrying the same id (the
 * x-guest-token header, added by the Supabase client) read them back. It is
 * also sent with sign-up so the account claims them on any device.
 */
const KEY = "pw_guest_token";

export function getGuestToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let token = localStorage.getItem(KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(KEY, token);
    }
    return token;
  } catch {
    return null;
  }
}
