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
      className="unverified-banner mt-4 pw-card p-4 flex flex-wrap items-center gap-3 border-l-4"
      style={{ borderLeftColor: "var(--pw-accent)" }}
    >
      <div className="flex-1 min-w-[200px]">
        <div className="font-medium text-[14px]">
          Get verified to appear higher in search results and earn 3× more bookings
        </div>
        <div className="text-[12px] text-[var(--pw-ink-2)]">
          Verification takes 1–2 minutes. Upload a government ID and a quick selfie.
        </div>
      </div>
      <Link to="/settings/verification" className="pw-btn-primary text-[13px] px-4 py-2">
        Get verified →
      </Link>
    </div>
  );
}