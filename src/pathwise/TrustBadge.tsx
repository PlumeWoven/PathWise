import type { VerificationStatus } from "./auth";
import { Icon, type IconName } from "@/components/Icon";

// Status = text + border colour on a transparent chip: teal verified, gold pending, ink-2 unverified, danger rejected.
const MAP: Record<
  VerificationStatus,
  { label: string; icon: IconName | "○"; color: string; border: string }
> = {
  verified: {
    label: "Verified",
    icon: "check",
    color: "var(--pw-accent-2)",
    border: "var(--pw-accent-2)",
  },
  pending: {
    label: "Pending review",
    icon: "clock",
    color: "var(--pw-accent-3)",
    border: "var(--pw-accent-3)",
  },
  unverified: {
    label: "Unverified",
    icon: "○",
    color: "var(--pw-ink-2)",
    border: "var(--pw-border)",
  },
  rejected: {
    label: "Rejected",
    icon: "close",
    color: "var(--pw-danger)",
    border: "var(--pw-danger)",
  },
};

export function TrustBadge({
  status,
  className = "",
}: {
  status: VerificationStatus;
  className?: string;
}) {
  const m = MAP[status] ?? MAP.unverified;
  return (
    <span
      className={`label-caps inline-flex items-center gap-1.5 rounded-full border border-solid px-2.5 py-1 ${className}`}
      style={{ color: m.color, background: "transparent", borderColor: m.border }}
      title={`Verification: ${m.label}`}
    >
      <span aria-hidden className="inline-flex">
        {m.icon === "○" ? m.icon : <Icon name={m.icon} className="h-3.5 w-3.5 text-inherit" />}
      </span>
      {m.label}
    </span>
  );
}
