import { Link } from "@tanstack/react-router";
import { useAuth } from "./auth";

/** Persistent banner shown to tutors whose identity isn't verified yet. */
export function UnverifiedBanner() {
  const { profile, role } = useAuth();
  if (!profile) return null;
  const isTutor = role === "tutor" || role === "both";
  if (!isTutor) return null;
  if (profile.verification_status === "verified") return null;

  return (
    <div
      className="mt-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3"
      style={{ background: "var(--pw-accent-soft)", border: "1px solid var(--pw-accent)" }}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-[20px] leading-none">🛡️</span>
        <div>
          <div className="text-[14px] font-medium text-[var(--pw-ink)]">
            Get verified to appear higher in search results and earn 3× more bookings
          </div>
          <div className="text-[12px] text-[var(--pw-ink-2)] mt-0.5">
            Verification takes 1–2 minutes. Upload a government ID and a quick selfie.
          </div>
        </div>
      </div>
      <Link
        to="/settings/verification"
        className="pw-btn-primary px-4 py-2 text-[13px] whitespace-nowrap"
      >
        Get verified →
      </Link>
    </div>
  );
}