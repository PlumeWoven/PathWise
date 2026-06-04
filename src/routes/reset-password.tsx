import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PWHeader } from "../pathwise/Header";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — PathWise" },
      { name: "description", content: "Set a new password for your PathWise account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Supabase parses the recovery token from the URL hash and emits a
  // PASSWORD_RECOVERY event. We just wait until a session is available.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setInfo("Password updated. Redirecting...");
    setTimeout(() => navigate({ to: "/" }), 1200);
  }

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <main className="px-5 sm:px-8 py-12 max-w-md mx-auto">
        <h1 className="font-display text-[32px] leading-tight">Set a new password</h1>
        <p className="mt-2 text-[14px] text-[var(--pw-ink-2)]">
          Choose a new password for your PathWise account.
        </p>

        {!ready ? (
          <div className="mt-8 text-[14px] text-[var(--pw-ink-2)]">
            Verifying your reset link...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div>
              <label className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
                New password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]"
              />
            </div>
            <div>
              <label className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
                Confirm password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]"
              />
            </div>
            {error && (
              <div className="text-[12px]" style={{ color: "var(--pw-danger)" }}>
                {error}
              </div>
            )}
            {info && (
              <div className="text-[12px]" style={{ color: "var(--pw-accent-2)" }}>
                {info}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="pw-btn-primary w-full inline-flex justify-center items-center px-6 py-3 text-[15px] font-medium disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}