import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeRole, postAuthDestination, type Role } from "./roles";

// Re-exported so existing `import { type Role } from "./auth"` sites keep working.
export type { Role };
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface Profile {
  id: string;
  // null when the user has no role assigned yet. NEVER defaulted to a concrete
  // role here — callers must handle the unset case explicitly.
  role: Role | null;
  display_name: string | null;
  avatar_url: string | null;
  full_name: string | null;
  verification_status: VerificationStatus;
  onboarding_completed: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role | null;
  app_metadata?: Record<string, any>;
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
  logout: () => Promise<void>;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  refreshProfile: () => Promise<void>;
  emailConfirmed: boolean;
  confirmationSent: boolean;
  resendConfirmation: (email?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, role, display_name, avatar_url, full_name, verification_status, onboarding_completed",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth] fetchProfile error", error);
    return null;
  }
  if (!data) return null;
  return {
    id: (data as any).id,
    role: normalizeRole((data as any).role),
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
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const updateConfirmationState = (user: User | null) => {
    if (user) {
      const confirmed = !!user.confirmed_at;
      setEmailConfirmed(confirmed);
      if (!confirmed && user.email) {
        setConfirmationSent(true);
      } else {
        setConfirmationSent(false);
      }
    } else {
      setEmailConfirmed(false);
      setConfirmationSent(false);
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        updateConfirmationState(newSession.user);
        setTimeout(() => {
          fetchProfile(newSession.user.id).then((p) => {
            setProfile(p);
            if (event === "SIGNED_IN" && typeof window !== "undefined") {
              const path = window.location.pathname;
              const onPublicEntry = path === "/" || path === "/login";
              if (onPublicEntry) {
                claimAnonymousRecords(newSession.user.id).finally(() => {
                  if (!p) return;
                  if (!newSession.user.confirmed_at) {
                    return;
                  }
                  // Single, role-correct destination (handles tutor/both/
                  // student/unknown + onboarding state). Skip the hard
                  // redirect when the role is unknown so we don't bounce the
                  // user somewhere wrong.
                  const dest = postAuthDestination(p.role, p.onboarding_completed);
                  if (dest !== "/") window.location.replace(dest);
                });
              }
            }
          });
        }, 0);
      } else {
        setProfile(null);
        updateConfirmationState(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      if (existing?.user) {
        updateConfirmationState(existing.user);
        fetchProfile(existing.user.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        updateConfirmationState(null);
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
      if (session.user) {
        updateConfirmationState(session.user);
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    updateConfirmationState(null);

    // 🧹 Clear all impersonation state on sign‑out
    localStorage.removeItem("impersonating");
    localStorage.removeItem("impersonating_user_name");
    localStorage.removeItem("admin_user_id");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_access_token");
  };

  const resendConfirmation = async (targetEmail?: string) => {
    const email = targetEmail || session?.user?.email;
    if (!email) {
      toast.error("No email address found");
      return;
    }
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      setConfirmationSent(true);
      toast.success("Confirmation email resent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend confirmation");
      throw err;
    }
  };

  const supabaseUser = session?.user ?? null;

  const user: AuthUser | null =
    supabaseUser && profile
      ? {
          id: supabaseUser.id,
          email: supabaseUser.email ?? "",
          name: profile.display_name || supabaseUser.email?.split("@")[0] || "Learner",
          role: profile.role,
          app_metadata: supabaseUser.app_metadata,
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
        emailConfirmed,
        confirmationSent,
        resendConfirmation,
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
      await supabase
        .from("diagnostic_results")
        .update({ user_id: userId })
        .eq("id", diagId)
        .is("user_id", null);
      localStorage.removeItem("pathwise_diagnostic_id");
    }
    if (roadmapId) {
      await supabase
        .from("roadmaps")
        .update({ user_id: userId })
        .eq("id", roadmapId)
        .is("user_id", null);
      localStorage.removeItem("pathwise_roadmap_id");
    }
  } catch (err) {
    console.error("[auth] claimAnonymousRecords", err);
  }
}
