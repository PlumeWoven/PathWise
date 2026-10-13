import { Link } from "@tanstack/react-router";
import { useAuth } from "./auth";

/** Persistent banner shown to tutors whose identity isn't verified yet. */
export function UnverifiedBanner() {
  const { profile, role } = useAuth();
  if (!profile) return null;
  const isTutor = role === "tutor" || role === "both";
  if (!isTutor) return null;
  if (profile.verification_status === "verified") return null;
  // Says what really happens: a 10-minute video call, no document upload, and that
  // verification gates being listed at all (it used to promise an ID+selfie upload,
  // "1–2 minutes" and "3× more bookings").
  const requested = profile.verification_status === "pending";

  return (
    <div
      className="unverified-banner mt-4 pw-card p-4 flex flex-wrap items-center gap-3 border-l-4"
      style={{ borderLeftColor: "var(--pw-accent)" }}
    >
      <div className="flex-1 min-w-[12.5rem]">
        <div className="font-medium text-[0.875rem]">
          {requested
            ? "Verification requested"
            : "Get verified so students can find and book you"}
        </div>
        <div className="text-[0.75rem] text-[var(--pw-ink-2)]">
          {requested
            ? "We'll email you to book a 10-minute video call. Until then, students can't see or book you."
            : "Request a 10-minute video call. The PathWise team checks your ID and teaching background."}
        </div>
      </div>
      <Link to="/dashboard/settings/verification" className="pw-btn-primary px-4 py-2">
        {requested ? "View status →" : "Request verification →"}
      </Link>
    </div>
  );
}
