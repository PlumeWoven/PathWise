import type { ReactNode } from "react";
import type { VerificationStatus } from "./auth";

export type VerificationTier = "unverified" | "email" | "identity" | "premium";

/** Map raw profile.verification_status -> a display tier. */
export function statusToTier(
  status: VerificationStatus,
  hasEmail: boolean = true,
): VerificationTier {
  if (status === "verified") return "identity";
  return hasEmail ? "email" : "unverified";
}

// Tier = text + border colour on a transparent chip: ink-2 basic, ink email, teal verified, gold premium.
const TIERS: Record<
  VerificationTier,
  { label: string; color: string; bg: string; border: string; icon: ReactNode }
> = {
  unverified: {
    label: "Unverified",
    color: "var(--pw-ink-2)",
    bg: "transparent",
    border: "var(--pw-border)",
    icon: <ShieldIcon />,
  },
  email: {
    label: "Email Verified",
    color: "var(--pw-ink)",
    bg: "transparent",
    border: "var(--pw-ink)",
    icon: <ShieldCheckIcon />,
  },
  identity: {
    label: "ID Verified",
    color: "var(--pw-accent-2)",
    bg: "transparent",
    border: "var(--pw-accent-2)",
    icon: <ShieldCheckIcon />,
  },
  premium: {
    label: "Premium Verified",
    color: "var(--pw-accent-3)",
    bg: "transparent",
    border: "var(--pw-accent-3)",
    icon: <StarShieldIcon />,
  },
};

export function VerificationBadge({
  tier,
  size = "md",
  className = "",
}: {
  tier: VerificationTier;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const t = TIERS[tier];
  const sizing =
    size === "sm"
      ? "px-2 py-0.5 gap-1"
      : size === "lg"
        ? "px-3 py-1.5 gap-2"
        : "px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`verification-badge label-caps inline-flex items-center rounded-full ${sizing} ${className}`}
      style={{
        color: t.color,
        background: t.bg,
        borderColor: t.border,
        borderWidth: 1,
        borderStyle: "solid",
      }}
      title={t.label}
      data-tier={tier}
    >
      <span aria-hidden className="inline-flex items-center">
        {t.icon}
      </span>
      {t.label}
    </span>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function ShieldCheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function StarShieldIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    >
      <path d="M12 2 4 5v7c0 6 8 10 8 10s8-4 8-10V5l-8-3z" opacity="0.25" />
      <path d="m12 7 1.6 3.3 3.6.5-2.6 2.5.6 3.6L12 15.2 8.8 16.9l.6-3.6L6.8 10.8l3.6-.5L12 7z" />
    </svg>
  );
}
