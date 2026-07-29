import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/pathwise/auth";
import { applyPendingRole, readReturnPath } from "@/pathwise/oauth";
import { normalizeRole, postAuthDestination, type DbRole } from "@/pathwise/roles";

export const Route = createFileRoute("/auth/choose-role")({
  head: () => ({
    meta: [
      { title: "Choose your role — PathWise" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChooseRolePage,
});

const OPTIONS: { id: DbRole; emoji: string; label: string; sub: string }[] = [
  { id: "student", emoji: "🎓", label: "Student", sub: "Get a roadmap & matched tutors" },
  { id: "tutor", emoji: "👨‍🏫", label: "Tutor", sub: "Teach, publish courses & earn" },
  { id: "both", emoji: "🔁", label: "Both", sub: "Learn and teach on one account" },
];

/**
 * Where a signed-in user with no role lands. Reached after a first-time Google
 * sign-in: the handle_new_user trigger deliberately refuses to invent a role,
 * and every RoleGate rejects a null one, so this is the step that makes the
 * account usable.
 */
function ChooseRolePage() {
  const navigate = useNavigate();
  const { session, loading, refreshProfile } = useAuth();
  const [choice, setChoice] = useState<DbRole | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checked, setChecked] = useState(false);

  const displayName =
    (session?.user.user_metadata?.full_name as string | undefined) ??
    (session?.user.user_metadata?.name as string | undefined) ??
    null;

  // Guard the page: signed-out users have nothing to assign, and users who
  // already have a role must not be offered a second (ignored) choice.
  useEffect(() => {
    if (loading) return;

    if (!session?.user) {
      navigate({ to: "/" });
      return;
    }

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", session.user.id)
        .maybeSingle();
      if (cancelled) return;

      const existing = normalizeRole(data?.role);
      if (existing) {
        navigate({ to: postAuthDestination(existing, data?.onboarding_completed) });
        return;
      }
      setChecked(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, session, navigate]);

  async function handleContinue() {
    if (!choice || !session?.user) return;
    setSubmitting(true);
    try {
      const applied = await applyPendingRole(choice);
      if (!applied) {
        // Either the role was set concurrently or the RPC refused — re-read
        // rather than guess, so we never route on a stale assumption.
        const { data } = await supabase
          .from("profiles")
          .select("role, onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle();
        const existing = normalizeRole(data?.role);
        if (!existing) {
          toast.error("Couldn't save your role. Please try again.");
          setSubmitting(false);
          return;
        }
        await refreshProfile();
        navigate({ to: postAuthDestination(existing, data?.onboarding_completed) });
        return;
      }

      await refreshProfile();
      const returnPath = readReturnPath();
      // A brand-new account is never onboarded, so this sends them into the
      // right onboarding flow for the role they just picked.
      navigate({ to: returnPath ?? postAuthDestination(choice, false) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save your role.");
      setSubmitting(false);
    }
  }

  if (loading || !checked) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)] flex items-center justify-center">
        <p className="text-[14px] text-[var(--pw-ink-2)]" role="status" aria-live="polite">
          Loading your account…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)] flex items-center justify-center px-5 py-12">
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[560px]"
      >
        <div className="pw-card p-7">
          <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
            One last step
          </div>
          <h1 className="font-display text-[28px] leading-tight mt-1">
            {displayName ? `Welcome, ${displayName.split(" ")[0]}` : "Welcome to PathWise"}
          </h1>
          <p className="mt-2 text-[14px] text-[var(--pw-ink-2)]">
            You're signed in with Google. Tell us how you'll use PathWise — this decides your
            dashboard, and you can't change it later, so pick the one that fits.
          </p>

          <fieldset className="mt-6">
            <legend className="sr-only">Choose your role</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {OPTIONS.map((o) => {
                const selected = choice === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setChoice(o.id)}
                    aria-pressed={selected}
                    className="pw-card text-left p-4 transition-colors"
                    style={{
                      borderColor: selected ? "var(--pw-accent)" : "var(--pw-border)",
                      background: selected ? "var(--pw-accent-soft)" : "var(--pw-surface)",
                    }}
                  >
                    <div className="text-2xl" aria-hidden="true">
                      {o.emoji}
                    </div>
                    <div className="font-display text-[16px] mt-1.5">{o.label}</div>
                    <div className="text-[12px] text-[var(--pw-ink-2)] mt-0.5">{o.sub}</div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            onClick={handleContinue}
            disabled={!choice || submitting}
            className="pw-btn-primary w-full inline-flex justify-center items-center mt-6 px-6 py-3 text-[15px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Continue →"}
          </button>
          {!choice && (
            <p className="mt-2 text-[11px] text-[var(--pw-ink-2)] text-center">
              Pick a role to continue.
            </p>
          )}
        </div>
      </motion.main>
    </div>
  );
}
