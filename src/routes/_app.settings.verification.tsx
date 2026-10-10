import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../pathwise/auth";
import { SignInPrompt } from "../pathwise/RoleGate";
import { VerificationBadge, statusToTier } from "../pathwise/VerificationBadge";
import { supabase } from "@/integrations/supabase/client";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/_app/settings/verification")({
  head: () => ({ meta: [{ title: "Verification Center — PathWise" }] }),
  component: VerificationCenter,
});

/**
 * Verification is manual for now: the tutor requests it (status → pending) and
 * the PathWise team verifies them on a short video call, then an admin marks
 * them verified. No ID documents are uploaded or stored.
 */
export function VerificationCenter() {
  const { loading, isLoggedIn, profile, supabaseUser, openLogin, refreshProfile } = useAuth();
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) openLogin();
  }, [loading, isLoggedIn, openLogin]);

  if (!loading && !isLoggedIn) return <SignInPrompt />;
  if (loading || !profile) {
    return (
      <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
        <main className="px-5 sm:px-8 py-20 max-w-md mx-auto text-center text-[0.875rem] text-[var(--pw-ink-2)]">
          Loading…
        </main>
      </div>
    );
  }

  const emailVerified = !!supabaseUser?.email_confirmed_at;
  const identityStatus = profile.verification_status;
  const identityVerified = identityStatus === "verified";
  const identityRequested = identityStatus === "pending";
  const tier = statusToTier(identityStatus);

  async function requestVerification() {
    if (!profile) return;
    setRequesting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ verification_status: "pending" })
      .eq("id", profile.id);
    setRequesting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Request sent — we'll email you to book a short video call.");
    await refreshProfile();
  }

  return (
    <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <div className="label-caps text-[var(--pw-ink-2)]">Settings</div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[2.25rem] uppercase tracking-[-0.025em] leading-none">
            Verification Center
          </h1>
          <VerificationBadge tier={tier} size="lg" />
        </div>
        <p className="mt-2 text-[0.9375rem] text-[var(--pw-ink-2)]">
          Only verified tutors appear in search and can be booked by new students.
        </p>

        <div className="mt-8 space-y-4">
          <TierCard
            tone={emailVerified ? "done" : "todo"}
            title="Email Verified"
            subtitle="Confirms you own your account email."
            statusLabel={emailVerified ? "Complete" : "Check your inbox"}
            actionLabel={null}
          >
            {supabaseUser?.email && (
              <div className="text-[0.8125rem] text-[var(--pw-ink-2)] inline-flex items-center gap-1.5">
                {emailVerified && <Icon name="check" className="h-4 w-4" />}
                <span className="text-[var(--pw-ink)] font-medium">{supabaseUser.email}</span>
              </div>
            )}
          </TierCard>

          <TierCard
            tone={identityVerified ? "done" : identityRequested ? "pending" : "todo"}
            title="Identity Verified"
            subtitle="A 10-minute video call with the PathWise team: we check your ID and teaching background."
            statusLabel={identityVerified ? "Verified" : identityRequested ? "Requested" : "Not started"}
            actionLabel={
              identityVerified || identityRequested
                ? null
                : requesting
                  ? "Sending…"
                  : "Request verification"
            }
            onAction={requesting ? undefined : requestVerification}
          >
            {identityRequested && (
              <div className="text-[0.8125rem] text-[var(--pw-ink-2)]">
                We'll email you to schedule the call. You'll be listed as soon as you're verified.
              </div>
            )}
          </TierCard>
        </div>

        <div className="mt-10">
          <Link
            to="/dashboard"
            className="label-caps text-[var(--pw-ink-2)] hover:text-pw-accent transition-colors"
          >
            ← Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

function TierCard({
  tone,
  title,
  subtitle,
  statusLabel,
  actionLabel,
  onAction,
  children,
}: {
  tone: "done" | "pending" | "todo" | "locked";
  title: string;
  subtitle: string;
  statusLabel: string;
  actionLabel: string | null;
  onAction?: () => void;
  children?: React.ReactNode;
}) {
  const accent =
    tone === "done"
      ? "var(--pw-accent-2)"
      : tone === "pending"
        ? "var(--pw-accent-3)"
        : tone === "locked"
          ? "var(--pw-ink-2)"
          : "var(--pw-accent)";

  return (
    <div className="pw-card p-5 sm:p-6" style={{ borderLeft: `3px solid ${accent}` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[1.25rem] uppercase tracking-[-0.025em] leading-none">
              {title}
            </h3>
            <span
              className="pw-pill px-2 py-0.5"
              style={{
                color: accent,
                background:
                  tone === "locked"
                    ? "var(--pw-surface-2)"
                    : `color-mix(in srgb, ${accent} 10%, transparent)`,
                borderColor: accent,
                borderWidth: 1,
                borderStyle: "solid",
              }}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 text-[0.875rem] text-[var(--pw-ink-2)]">{subtitle}</p>
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
        {actionLabel && onAction && (
          <button onClick={onAction} className="pw-btn-primary px-4 py-2 whitespace-nowrap">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
