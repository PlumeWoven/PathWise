import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type Role } from "./auth";
import { normalizeRole, postAuthDestination } from "./roles";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { toast } from "sonner";

type Mode = "signin" | "signup" | "forgot";

export function LoginModal() {
  const { loginOpen, closeLogin, emailConfirmed, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // State for confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  // Reset state whenever the modal opens.
  useEffect(() => {
    if (loginOpen) {
      setMode("signin");
      setRole(null);
      setName("");
      setEmail("");
      setPassword("");
      setError("");
      setInfo("");
      setSubmitting(false);
      setShowConfirmation(false);
      setSignupEmail("");
    }
  }, [loginOpen]);

  if (!loginOpen) return null;

  const handleClose = () => closeLogin();

  async function routeAfterAuth(userId: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("id", userId)
      .maybeSingle();
    // Never default an unknown role to "student"; postAuthDestination sends
    // unknown roles to "/" instead of mislabeling the user.
    const r = normalizeRole(profile?.role);
    const onboarded = !!profile?.onboarding_completed;
    // Claim any anonymous diagnostic + roadmap rows created before signup.
    try {
      const diagId = localStorage.getItem("pathwise_diagnostic_id");
      const roadmapId = localStorage.getItem("pathwise_roadmap_id");
      if (diagId) {
        await supabase.from("diagnostic_results").update({ user_id: userId }).eq("id", diagId).is("user_id", null);
      }
      if (roadmapId) {
        await supabase.from("roadmaps").update({ user_id: userId }).eq("id", roadmapId).is("user_id", null);
      }
      localStorage.removeItem("pathwise_diagnostic_id");
      localStorage.removeItem("pathwise_roadmap_id");
    } catch (err) {
      console.error("[auth] claim anonymous error", err);
    }
    closeLogin();
    navigate({ to: postAuthDestination(r, onboarded) });
  }

  async function handleGoogle() {
    setError("");
    // In sign-up mode the role picker must be used; in sign-in mode
    // the role is whatever already exists on the profile.
    if (mode === "signup" && !role) {
      setError("Please choose your role first.");
      return;
    }
    setSubmitting(true);
    try {
      if (role) {
        // Survive the OAuth redirect so we can apply the picked role
        // after the browser returns from Google.
        try {
          sessionStorage.setItem("pathwise_pending_role", role);
        } catch {
          /* ignore storage errors */
        }
      }
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        // Best-effort hint for the provider; the authoritative role write is
        // the set_profile_role RPC after the redirect (see below).
        extraParams: role ? { role } : undefined,
      });
      if (result.redirected) return; // browser redirecting to Google
      if (result.error) {
        setError(result.error.message || "Google sign-in failed");
        setSubmitting(false);
        return;
      }
      // Tokens received & session set (no redirect happened).
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        // Display name is safe to repair with an UPDATE (the trigger has
        // already inserted the profile row by the time we get here).
        const fallbackName =
          (data.user.user_metadata?.full_name as string) ||
          (data.user.user_metadata?.name as string) ||
          data.user.email?.split("@")[0] ||
          "Learner";
        await supabase
          .from("profiles")
          .update({ display_name: fallbackName, full_name: fallbackName })
          .eq("id", data.user.id);

        // Apply pending role via the one-shot RPC, which only writes
        // when the column is currently NULL (so returning users are safe).
        let pending: Role | null = role;
        try {
          const stored = sessionStorage.getItem("pathwise_pending_role") as Role | null;
          if (stored) pending = stored;
          sessionStorage.removeItem("pathwise_pending_role");
        } catch {
          /* ignore storage errors */
        }
        if (pending) {
          // Cast through any until generated types include the new RPC.
          const { error: rpcErr } = await (supabase.rpc as any)("set_profile_role", {
            target_role: pending,
          });
          if (rpcErr && !/already set/i.test(rpcErr.message)) {
            console.warn("[auth] set_profile_role", rpcErr);
          }
        }
        await routeAfterAuth(data.user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.user) {
      // Check if email is confirmed; if not, show modal instead of routing
      if (!data.user.confirmed_at) {
        setSignupEmail(email);
        setShowConfirmation(true);
        return;
      }
      await routeAfterAuth(data.user.id);
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!role) {
      setError("Please choose your role first.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setSubmitting(true);
    const redirectTo = `${window.location.origin}/confirm-email`; // explicit route
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { role, display_name: name.trim(), full_name: name.trim() },
      },
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.user) {
      // Names are safe to repair with an UPDATE (the trigger has already
      // inserted the profile row from user_metadata at signUp time).
      await supabase
        .from("profiles")
        .update({ display_name: name.trim(), full_name: name.trim() })
        .eq("id", data.user.id);
      // Role: use the one-shot RPC. The trigger normally already wrote
      // the role from user_metadata; this is a safety net for the
      // (rare) case where it didn't fire, and it cannot overwrite an
      // already-assigned role. Cast through any until generated types
      // include the new RPC.
      const { error: rpcErr } = await (supabase.rpc as any)("set_profile_role", {
        target_role: role,
      });
      if (rpcErr && !/already set/i.test(rpcErr.message)) {
        console.warn("[auth] set_profile_role", rpcErr);
      }
      // Show confirmation modal instead of routing immediately
      setSignupEmail(email.trim());
      setShowConfirmation(true);
      // Do NOT call routeAfterAuth yet – the user must confirm email first.
      // The confirmation page will handle routing after confirmation.
    }
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (err) setError(err.message);
    else setInfo("Check your inbox for a password reset link.");
  }

  const title =
    mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password";
  const subtitle =
    mode === "signin"
      ? "Choose how you're signing in"
      : mode === "signup"
        ? "Pick your role to get started"
        : "We'll email you a reset link";

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(26,26,26,0.45)", backdropFilter: "blur(6px)" }}
        onClick={handleClose}
      >
        <div
          className="pw-card w-full max-w-[520px] p-7 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] text-xl leading-none"
          >
            ×
          </button>

          <h2 className="font-display text-[28px] leading-tight">{title}</h2>
          <p className="mt-1 text-[14px] text-[var(--pw-ink-2)]">{subtitle}</p>

          {mode === "signup" && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <RoleCard
                emoji="🎓"
                label="Student"
                sub="Get a roadmap & tutor"
                selected={role === "student"}
                onClick={() => { setRole("student"); setError(""); }}
              />
              <RoleCard
                emoji="👨‍🏫"
                label="Tutor"
                sub="Teach & earn"
                selected={role === "tutor"}
                onClick={() => { setRole("tutor"); setError(""); }}
              />
              <RoleCard
                emoji="🔁"
                label="Both"
                sub="Learn and teach"
                selected={role === "both"}
                onClick={() => { setRole("both"); setError(""); }}
              />
            </div>
          )}

          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="mt-6 space-y-3">
              <Field label="Email" type="email" value={email} onChange={setEmail} />
              <Field label="Password" type="password" value={password} onChange={setPassword} />
              {error && <ErrorLine msg={error} />}
              <SubmitButton submitting={submitting} label="Sign In →" />
              <OrDivider />
              <GoogleButton onClick={handleGoogle} submitting={submitting} />
              <div className="flex items-center justify-between text-[12px] text-[var(--pw-ink-2)]">
                <button type="button" onClick={() => { setMode("forgot"); setError(""); setInfo(""); }} className="underline-offset-4 hover:underline">
                  Forgot password?
                </button>
                <button type="button" onClick={() => { setMode("signup"); setError(""); setInfo(""); }} className="underline-offset-4 hover:underline">
                  Create account
                </button>
              </div>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="mt-6 space-y-3">
              <Field label="Full name" type="text" value={name} onChange={setName} />
              <Field label="Email" type="email" value={email} onChange={setEmail} />
              <Field label="Password" type="password" value={password} onChange={setPassword} />
              {error && <ErrorLine msg={error} />}
              <SubmitButton submitting={submitting} label="Create Free Account →" disabled={!role} />
              <OrDivider />
              <GoogleButton onClick={handleGoogle} submitting={submitting} disabled={!role} />
              {!role && (
                <p className="text-[11px] text-[var(--pw-ink-2)] text-center">Pick a role above to enable Google sign-up.</p>
              )}
              <div className="text-[12px] text-[var(--pw-ink-2)] text-center">
                Already have an account?{" "}
                <button type="button" onClick={() => { setMode("signin"); setError(""); setInfo(""); }} className="underline-offset-4 hover:underline">
                  Sign in
                </button>
              </div>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="mt-6 space-y-3">
              <Field label="Email" type="email" value={email} onChange={setEmail} />
              {error && <ErrorLine msg={error} />}
              {info && (
                <div className="text-[12px]" style={{ color: "var(--pw-accent-2)" }}>
                  {info}
                </div>
              )}
              <SubmitButton submitting={submitting} label="Send reset link →" />
              <div className="text-[12px] text-[var(--pw-ink-2)] text-center">
                <button type="button" onClick={() => { setMode("signin"); setError(""); setInfo(""); }} className="underline-offset-4 hover:underline">
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        email={signupEmail}
        isConfirmed={emailConfirmed}
        onResend={resendConfirmation}
      />
    </>
  );
}

// ---------- Helper Components ----------

function RoleCard({
  emoji,
  label,
  sub,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pw-card text-left p-4 transition-colors"
      style={{
        borderColor: selected ? "var(--pw-accent)" : "var(--pw-border)",
        background: selected ? "var(--pw-accent-soft)" : "var(--pw-surface)",
      }}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="font-display text-[16px] mt-1.5">{label}</div>
      <div className="text-[12px] text-[var(--pw-ink-2)] mt-0.5">{sub}</div>
    </button>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
        {label}
      </label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-[var(--pw-surface)] outline-none focus:border-[var(--pw-accent)]"
      />
    </div>
  );
}

function ErrorLine({ msg }: { msg: string }) {
  return (
    <div className="text-[12px]" style={{ color: "var(--pw-danger)" }}>
      {msg}
    </div>
  );
}

function SubmitButton({
  submitting,
  label,
  disabled,
}: {
  submitting: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={submitting || disabled}
      className="pw-btn-primary w-full inline-flex justify-center items-center px-6 py-3 text-[15px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {submitting ? "Please wait..." : label}
    </button>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-[var(--pw-border)]" />
      <span className="text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] font-mono-pw">or</span>
      <div className="flex-1 h-px bg-[var(--pw-border)]" />
    </div>
  );
}

function GoogleButton({
  onClick,
  submitting,
  disabled,
}: {
  onClick: () => void;
  submitting: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={submitting || disabled}
        className="w-full inline-flex justify-center items-center gap-2 pw-border rounded-md px-6 py-3 text-[14px] font-medium bg-[var(--pw-surface)] hover:bg-[var(--pw-surface-2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.3l-6.2-5.3c-2 1.5-4.6 2.4-7.3 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.3C40.9 35.6 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      Continue with Google
    </button>
  );
}