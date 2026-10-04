import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/reset-password")({
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
    <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <main className="px-5 sm:px-8 py-12 max-w-md mx-auto">
        <h1 className="font-display text-[2rem] uppercase tracking-[-0.025em] leading-none">
          Set a new password
        </h1>
        <p className="mt-2 text-[0.875rem] text-[var(--pw-ink-2)]">
          Choose a new password for your PathWise account.
        </p>

        {!ready ? (
          <div className="mt-8 text-[0.875rem] text-[var(--pw-ink-2)]">
            Verifying your reset link...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div>
              <label className="label-caps text-[var(--pw-ink-2)]">New password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pw-input mt-1 text-[0.875rem]"
              />
            </div>
            <div>
              <label className="label-caps text-[var(--pw-ink-2)]">Confirm password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="pw-input mt-1 text-[0.875rem]"
              />
            </div>
            {error && (
              <div className="text-[0.75rem]" style={{ color: "var(--pw-danger)" }}>
                {error}
              </div>
            )}
            {info && (
              <div className="text-[0.75rem]" style={{ color: "var(--pw-accent-2)" }}>
                {info}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="pw-btn-primary w-full inline-flex justify-center items-center px-6 py-3 disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
