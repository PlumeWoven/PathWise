import type { VerificationStatus } from "./auth";

const MAP: Record<VerificationStatus, { label: string; icon: string; color: string; bg: string }> = {
  verified: { label: "Verified", icon: "✓", color: "var(--pw-accent-2)", bg: "var(--pw-accent-soft)" },
  pending: { label: "Pending review", icon: "⏳", color: "#a16207", bg: "#fef3c7" },
  unverified: { label: "Unverified", icon: "○", color: "var(--pw-ink-2)", bg: "var(--pw-surface-2)" },
  rejected: { label: "Rejected", icon: "✕", color: "var(--pw-danger)", bg: "#fee2e2" },
};

export function TrustBadge({ status, className = "" }: { status: VerificationStatus; className?: string }) {
  const m = MAP[status] ?? MAP.unverified;
  return (
    <span
      className={`pw-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase pw-tracking-wide ${className}`}
      style={{ color: m.color, background: m.bg, borderColor: m.color }}
      title={`Verification: ${m.label}`}
    >
      <span aria-hidden>{m.icon}</span>
      {m.label}
    </span>
  );
}