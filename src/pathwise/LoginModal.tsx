import { useEffect, useId, useState, FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth, type Role } from "./auth";
import { normalizeRole, pendingBookingTutorId, postAuthDestination } from "./roles";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "./oauth";
import { claimGuestResults } from "./api";
import { getGuestToken } from "@/lib/guestToken";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

// Google sign-in is disabled in Supabase Auth and the set_profile_role RPC it
// needs doesn't exist yet, so the button could only fail. Flip once both exist.
const GOOGLE_ENABLED = false;
import { Icon, type IconName } from "@/components/Icon";

type Mode = "signin" | "signup" | "forgot";

export function LoginModal() {
  const { loginOpen, closeLogin, emailConfirmed, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
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
    // Attach any guest level check + roadmap made in this browser.
    await claimGuestResults();
    closeLogin();
    const pendingTutor = onboarded ? pendingBookingTutorId() : null;
    if (pendingTutor) navigate({ to: "/book/$tutorId", params: { tutorId: pendingTutor } });
    else navigate({ to: postAuthDestination(r, onboarded) });
  }

  /**
   * Hands off to Google's account chooser. Everything after the redirect —
   * code exchange, profile backfill, role assignment, routing — is handled by
   * routes/auth.callback.tsx, since this modal won't survive the navigation.
   *
   * A role is optional here: picking one in sign-up mode pre-assigns it, and
   * anyone arriving without one gets /auth/choose-role after the redirect.
   */
  async function handleGoogle() {
    setError("");
    setSubmitting(true);

    const { error: oauthError } = await signInWithGoogle({
      role,
      // Come back to wherever the user opened the modal from, so signing in
      // mid-roadmap doesn't dump them on a dashboard.
      returnPath: window.location.pathname !== "/" ? window.location.pathname : null,
    });

    if (oauthError) {
      setError(oauthError.message || "Google sign-in failed");
      setSubmitting(false);
      return;
    }
    // Success means the browser is already navigating to Google — keep the
    // button in its pending state rather than flicking it back.
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
    if (!consent) {
      setError("Please confirm you're 18+ (or a parent/guardian) and accept the terms.");
      return;
    }
    setSubmitting(true);
    const redirectTo = `${window.location.origin}/confirm-email`; // explicit route
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          role,
          display_name: name.trim(),
          full_name: name.trim(),
          // Record of what the user agreed to and when.
          terms_accepted_at: new Date().toISOString(),
          age_confirmed: true,
          // Lets the account claim this browser's guest results even if the
          // confirmation link is opened on another device.
          guest_token: getGuestToken(),
        },
      },
    });
    setSubmitting(false);
    if (err) {
      const msg = err.message || "";
      if (/already registered|email_exists|user already exists/i.test(msg)) {
        const friendly = "An account with this email already exists. Please sign in instead.";
        setError(friendly);
        toast.error(friendly);
        return;
      }
      setError(err.message);
      return;
    }
    // Supabase hides whether an email is taken: for an existing account it returns no error and a
    // user with zero identities — and sends no email. Say so instead of "check your inbox".
    if (data.user && data.user.identities?.length === 0) {
      const friendly = "An account with this email already exists. Please sign in instead.";
      setError(friendly);
      toast.error(friendly);
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
    mode === "signin"
      ? "Welcome back"
      : mode === "signup"
        ? "Create your account"
        : "Reset password";
  const subtitle =
    mode === "signin"
      ? "Choose how you're signing in"
      : mode === "signup"
        ? "Pick your role to get started"
        : "We'll email you a reset link";

  return (
    <>
      {/* Radix Dialog: role + label, focus moved in and trapped, Esc, page behind made inert. */}
      <Dialog open={loginOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="pw-card block w-[calc(100%-2rem)] max-w-[32.5rem] max-h-[calc(100dvh-2rem)] overflow-y-auto p-8 border-[var(--pw-border)] shadow-pw-float">
          <DialogTitle className="font-display font-bold uppercase tracking-[-0.025em] text-[1.75rem] leading-none">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-[0.875rem] text-[var(--pw-ink-2)]">
            {subtitle}
          </DialogDescription>

          {mode === "signup" && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <RoleCard
                icon="student"
                label="Student"
                sub="Get a roadmap & tutor"
                selected={role === "student"}
                onClick={() => {
                  setRole("student");
                  setError("");
                }}
              />
              <RoleCard
                icon="tutor"
                label="Tutor"
                sub="Teach & earn"
                selected={role === "tutor"}
                onClick={() => {
                  setRole("tutor");
                  setError("");
                }}
              />
              <RoleCard
                icon="switchRole"
                label="Both"
                sub="Learn and teach"
                selected={role === "both"}
                onClick={() => {
                  setRole("both");
                  setError("");
                }}
              />
            </div>
          )}

          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              <Field label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
              <Field
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
              />
              {error && <ErrorLine msg={error} />}
              <SubmitButton submitting={submitting} label="Sign in →" />
              {GOOGLE_ENABLED && (
                <>
                  <OrDivider />
                  <GoogleButton onClick={handleGoogle} submitting={submitting} />
                </>
              )}
              <div className="flex items-center justify-between text-[0.8125rem] text-[var(--pw-ink-2)]">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                    setInfo("");
                  }}
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setInfo("");
                  }}
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  Create account
                </button>
              </div>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="mt-6 space-y-4">
              <Field label="Full name" type="text" autoComplete="name" value={name} onChange={setName} />
              <Field label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
              <Field
                label="Password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
              />
              {error && <ErrorLine msg={error} />}
              <label className="flex items-start gap-2 text-[0.75rem] text-[var(--pw-ink-2)]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0"
                />
                <span>
                  I'm 18 or older (or a parent/guardian signing up for my child) and I accept the{" "}
                  <Link to="/terms" target="_blank" className="underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" className="underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              <SubmitButton
                submitting={submitting}
                label="Create free account →"
                disabled={!role || !consent}
              />
              {GOOGLE_ENABLED && (
                <>
                  <OrDivider />
                  <GoogleButton onClick={handleGoogle} submitting={submitting} disabled={!role} />
                  {!role && (
                    <p className="text-[0.6875rem] text-[var(--pw-ink-2)] text-center">
                      Pick a role above to enable Google sign-up.
                    </p>
                  )}
                </>
              )}
              <div className="text-[0.8125rem] text-[var(--pw-ink-2)] text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setInfo("");
                    setShowConfirmation(false);
                  }}
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="mt-6 space-y-4">
              <Field label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
              {error && <ErrorLine msg={error} />}
              {info && (
                <div role="status" className="text-[0.75rem]" style={{ color: "var(--pw-accent-2)" }}>
                  {info}
                </div>
              )}
              <SubmitButton submitting={submitting} label="Send reset link →" />
              <div className="text-[0.8125rem] text-[var(--pw-ink-2)] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setInfo("");
                  }}
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        email={signupEmail}
        isConfirmed={emailConfirmed}
        onResend={() => resendConfirmation(signupEmail)}
      />
    </>
  );
}

// ---------- Helper Components ----------

function RoleCard({
  icon,
  label,
  sub,
  selected,
  onClick,
}: {
  icon: IconName;
  label: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="pw-card text-left p-4 transition-colors"
      style={{
        borderColor: selected ? "var(--pw-accent)" : "var(--pw-border)",
        background: selected ? "var(--pw-accent-soft)" : "var(--pw-surface)",
      }}
    >
      <Icon name={icon} className="h-6 w-6" />
      <div className="font-display font-bold uppercase tracking-[-0.025em] text-[1rem] mt-2">
        {label}
      </div>
      <div className="text-[0.75rem] text-[var(--pw-ink-2)] mt-0">{sub}</div>
    </button>
  );
}

function Field({
  label,
  type,
  autoComplete,
  value,
  onChange,
}: {
  label: string;
  type: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label-caps text-[var(--pw-ink-2)]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pw-input mt-2 text-[0.875rem]"
      />
    </div>
  );
}

function ErrorLine({ msg }: { msg: string }) {
  return (
    <div role="alert" className="text-[0.75rem]" style={{ color: "var(--pw-danger)" }}>
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
      className="pw-btn-primary w-full inline-flex justify-center items-center px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {submitting ? "Please wait..." : label}
    </button>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 h-px bg-[var(--pw-border)]" />
      <span className="label-caps text-[var(--pw-ink-2)]">or</span>
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
      className="pw-btn-secondary w-full px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.2 0 9.9-2 13.5-5.3l-6.2-5.3c-2 1.5-4.6 2.4-7.3 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.3C40.9 35.6 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z"
        />
      </svg>
      Continue with Google
    </button>
  );
}
