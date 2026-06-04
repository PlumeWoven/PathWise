import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "student" | "tutor" | "both";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface Profile {
  id: string;
  role: Role;
  display_name: string | null;
  avatar_url: string | null;
  full_name: string | null;
  verification_status: VerificationStatus;
  onboarding_completed: boolean;
}

/** Lightweight shape kept for compatibility with existing UI. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthContextValue {
  session: Session | null;
  supabaseUser: User | null;
  profile: Profile | null;
  user: AuthUser | null;
  role: Role | null;
  isLoggedIn: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  /** Kept for backwards-compat with components that called logout() */
  logout: () => Promise<void>;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  /** Re-fetch the profile after a mutation (e.g. avatar upload). */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, avatar_url, full_name, verification_status, onboarding_completed")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth] fetchProfile error", error);
    return null;
  }
  if (!data) return null;
  return {
    id: (data as any).id,
    role: ((data as any).role as Role) ?? "student",
    display_name: (data as any).display_name ?? null,
    avatar_url: (data as any).avatar_url ?? null,
    full_name: (data as any).full_name ?? null,
    verification_status: ((data as any).verification_status as VerificationStatus) ?? "unverified",
    onboarding_completed: !!(data as any).onboarding_completed,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    // 1) Subscribe FIRST to avoid missing events.
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        // Defer Supabase calls to avoid deadlock with the auth listener.
        setTimeout(() => {
          fetchProfile(newSession.user.id).then((p) => {
            setProfile(p);
            // After an OAuth redirect (e.g. Google), the user lands back on the
            // origin (usually "/"). Auto-route them to the right place so the
            // landing page doesn't appear to "swallow" the login.
            if (event === "SIGNED_IN" && typeof window !== "undefined") {
              const path = window.location.pathname;
              const onPublicEntry = path === "/" || path === "/login";
              if (onPublicEntry) {
                claimAnonymousRecords(newSession.user.id).finally(() => {
                  if (!p) return;
                  if (!p.onboarding_completed) {
                    window.location.replace(p.role === "tutor" ? "/onboarding/tutor" : "/onboarding/student");
                    return;
                  }
                  window.location.replace(p.role === "tutor" ? "/dashboard" : "/roadmap");
                });
              }
            }
          });
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // 2) Then read the existing session.
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      if (existing?.user) {
        fetchProfile(existing.user.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (session?.user) {
      const p = await fetchProfile(session.user.id);
      setProfile(p);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const supabaseUser = session?.user ?? null;

  const user: AuthUser | null =
    supabaseUser && profile
      ? {
          id: supabaseUser.id,
          email: supabaseUser.email ?? "",
          name: profile.display_name || supabaseUser.email?.split("@")[0] || "Learner",
          role: profile.role,
        }
      : null;

  return (
    <AuthContext.Provider
      value={{
        session,
        supabaseUser,
        profile,
        user,
        role: profile?.role ?? null,
        isLoggedIn: !!session,
        loading,
        signOut,
        logout: signOut,
        loginOpen,
        openLogin: () => setLoginOpen(true),
        closeLogin: () => setLoginOpen(false),
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

async function claimAnonymousRecords(userId: string) {
  try {
    const diagId = localStorage.getItem("pathwise_diagnostic_id");
    const roadmapId = localStorage.getItem("pathwise_roadmap_id");
    if (diagId) {
      await supabase.from("diagnostic_results").update({ user_id: userId }).eq("id", diagId).is("user_id", null);
      localStorage.removeItem("pathwise_diagnostic_id");
    }
    if (roadmapId) {
      await supabase.from("roadmaps").update({ user_id: userId }).eq("id", roadmapId).is("user_id", null);
      localStorage.removeItem("pathwise_roadmap_id");
    }
  } catch (err) {
    console.error("[auth] claimAnonymousRecords", err);
  }
}