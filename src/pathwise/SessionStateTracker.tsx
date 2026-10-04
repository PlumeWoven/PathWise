import { ORDERED_STATES, STATUS_META, type SessionStatus } from "./sessions";
import { Icon } from "@/components/Icon";

export function SessionStateTracker({ status }: { status: SessionStatus }) {
  const isFinal = status === "cancelled" || status === "disputed";
  const currentIdx = ORDERED_STATES.indexOf(status === "reminder_sent" ? "confirmed" : status);
  return (
    <div className="pw-card p-4">
      <div className="label-caps text-[var(--pw-ink-2)] mb-3">Session lifecycle</div>
      {isFinal ? (
        <div
          className="p-3 text-[0.8125rem]"
          style={{ background: STATUS_META[status].bg, color: STATUS_META[status].fg }}
        >
          <div className="font-display font-bold uppercase tracking-[-0.025em] text-[0.9375rem]">
            {STATUS_META[status].label}
          </div>
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
                  className="rounded-full w-7 h-7 flex items-center justify-center text-[0.6875rem] font-mono-pw font-medium"
                  style={{
                    background: done || active ? "var(--pw-accent-fill)" : "var(--pw-surface-2)",
                    color: done || active ? "var(--pw-on-accent)" : "var(--pw-ink-2)",
                  }}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Icon name="check" className="h-3.5 w-3.5 text-pw-on-accent" /> : i + 1}
                </div>
                <div className={`label-caps ${active ? "" : "text-[var(--pw-ink-2)]"}`}>
                  {STATUS_META[s].label}
                </div>
                {i < ORDERED_STATES.length - 1 && (
                  <div
                    className="w-5 h-px"
                    style={{ background: done ? "var(--pw-accent)" : "var(--pw-border)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
