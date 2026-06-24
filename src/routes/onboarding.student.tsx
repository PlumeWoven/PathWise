import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import { PWHeader } from "../pathwise/Header";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding/student")({
  head: () => ({ meta: [{ title: "Welcome — PathWise" }] }),
  component: StudentOnboarding,
});

function StudentOnboarding() {
  const { loading, isLoggedIn, profile, refreshProfile, openLogin } = useAuth();
  const navigate = useNavigate();
  const [grade, setGrade] = useState<number | "">("");
  const [goal, setGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) openLogin();
    if (!loading && profile?.onboarding_completed) navigate({ to: "/roadmap" });
  }, [loading, isLoggedIn, profile, openLogin, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        grade: grade === "" ? null : Number(grade),
        bio: goal || null,
        onboarding_completed: true,
      })
      .eq("id", profile.id);
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't save onboarding. Please try again.");
      return;
    }
    await refreshProfile();
    navigate({ to: "/roadmap" });
  }

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <main className="max-w-[560px] mx-auto px-5 sm:px-8 py-12">
        <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Step 1 of 1</div>
        <h1 className="font-display text-[36px] leading-tight mt-2">Welcome, {profile.full_name || profile.display_name} 🎓</h1>
        <p className="mt-2 text-[15px] text-[var(--pw-ink-2)]">A couple of details so we can tailor your roadmap.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 pw-card p-6">
          <div>
            <label className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Grade level</label>
            <select
              required
              value={grade}
              onChange={(e) => setGrade(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-[var(--pw-surface)] outline-none focus:border-[var(--pw-accent)]"
            >
              <option value="">Select grade…</option>
              {[6,7,8,9,10,11,12].map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
              <option value={13}>University / Other</option>
            </select>
          </div>
          <div>
            <label className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">What's your goal?</label>
            <textarea
              required
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Pass my algebra final, prep for SAT…"
              className="mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-[var(--pw-surface)] outline-none focus:border-[var(--pw-accent)]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="pw-btn-primary w-full inline-flex justify-center items-center px-6 py-3 text-[15px] font-medium disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Continue to my roadmap →"}
          </button>
        </form>
      </main>
    </div>
  );
}