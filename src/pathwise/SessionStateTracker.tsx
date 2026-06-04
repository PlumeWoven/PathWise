import { ORDERED_STATES, STATUS_META, type SessionStatus } from "./sessions";

export function SessionStateTracker({ status }: { status: SessionStatus }) {
  const isFinal = status === "cancelled" || status === "disputed";
  const currentIdx = ORDERED_STATES.indexOf(status === "reminder_sent" ? "confirmed" : status);
  return (
    <div className="pw-card p-4">
      <div className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-3">
        Session lifecycle
      </div>
      {isFinal ? (
        <div
          className="rounded-lg p-3 text-[13px]"
          style={{ background: STATUS_META[status].bg, color: STATUS_META[status].fg }}
        >
          <div className="font-display text-[15px]">{STATUS_META[status].label}</div>
          <div className="opacity-80 mt-0.5">{STATUS_META[status].description}</div>
        </div>
      ) : (
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {ORDERED_STATES.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s} className="flex items-center gap-1 flex-shrink-0">
                <div
                  className="rounded-full w-7 h-7 flex items-center justify-center text-[11px] font-mono-pw font-medium"
                  style={{
                    background: done || active ? "var(--pw-accent)" : "var(--pw-surface-2)",
                    color: done || active ? "white" : "var(--pw-ink-2)",
                  }}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? "✓" : i + 1}
                </div>
                <div className={`text-[11px] ${active ? "font-medium" : "text-[var(--pw-ink-2)]"}`}>
                  {STATUS_META[s].label}
                </div>
                {i < ORDERED_STATES.length - 1 && (
                  <div className="w-5 h-px" style={{ background: done ? "var(--pw-accent)" : "var(--pw-border)" }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}