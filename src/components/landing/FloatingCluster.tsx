import { ClockIcon, CircleCheckIcon, CircleXIcon } from "lucide-react";
import { useDVDFloat } from "@/hooks/useDVDFloat";

/**
 * Shared card shell — same visual language as the feature cards in `Features`
 * (`rounded-pw bg-pw-surface shadow-pw-raised`), so the floating chips read as
 * the same material in both themes. Sizes are measured at runtime by
 * `useDVDFloat`; the `width`/`height` below are only pre-measure fallbacks.
 */
const cardClass =
  "absolute top-0 left-0 inline-flex flex-col rounded-2xl bg-pw-surface px-5 py-3.5 " +
  "shadow-pw-raised-sm pointer-events-none z-0 will-change-transform";

const iconChipClass = "grid h-7 w-7 place-items-center rounded-xl bg-pw-bg shadow-pw-inset";

export function FloatingCluster() {
  // DVD-style autonomous floating with collision detection
  useDVDFloat([
    { selector: '[data-dvd="stage-01"]', speed: 0.6, width: 130, height: 56 },
    { selector: '[data-dvd="stage-02"]', speed: 0.55, width: 120, height: 56 },
    { selector: '[data-dvd="stage-05"]', speed: 0.65, width: 130, height: 56 },
    { selector: '[data-dvd="stat-3min"]', speed: 0.5, width: 100, height: 76 },
    { selector: '[data-dvd="stat-94"]', speed: 0.58, width: 120, height: 76 },
    { selector: '[data-dvd="no-signup"]', speed: 0.52, width: 110, height: 76 },
  ]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block" aria-hidden="true">
      {/* ═══ FLOATING ELEMENT 1: STAGE 01 ═══ */}
      <div data-dvd="stage-01" className={`${cardClass} items-start`}>
        <span className="text-[11px] font-bold uppercase tracking-widest text-pw-accent">
          Stage 01
        </span>
        <span className="mt-0.5 text-sm font-semibold text-pw-ink">Foundations</span>
      </div>

      {/* ═══ FLOATING ELEMENT 2: STAGE 02 ═══ */}
      <div data-dvd="stage-02" className={`${cardClass} items-start`}>
        <span className="text-[11px] font-bold uppercase tracking-widest text-pw-accent">
          Stage 02
        </span>
        <span className="mt-0.5 text-sm font-semibold text-pw-ink">Core Skills</span>
      </div>

      {/* ═══ FLOATING ELEMENT 3: STAGE 05 ═══ */}
      <div data-dvd="stage-05" className={`${cardClass} items-start`}>
        <span className="text-[11px] font-bold uppercase tracking-widest text-pw-accent">
          Stage 05
        </span>
        <span className="mt-0.5 text-sm font-semibold text-pw-ink">Your Goal</span>
      </div>

      {/* ═══ FLOATING ELEMENT 4: 3 min AVG ═══ */}
      <div data-dvd="stat-3min" className={`${cardClass} items-center`}>
        <span className={iconChipClass}>
          <ClockIcon className="h-4 w-4 text-pw-accent" aria-hidden="true" />
        </span>
        <span className="mt-2 text-lg font-bold leading-none text-pw-accent">3 min</span>
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-pw-muted">
          Avg
        </span>
      </div>

      {/* ═══ FLOATING ELEMENT 5: 94% ACCURACY ═══ */}
      <div data-dvd="stat-94" className={`${cardClass} items-center`}>
        <span className={iconChipClass}>
          <CircleCheckIcon className="h-4 w-4 text-pw-accent" aria-hidden="true" />
        </span>
        <span className="mt-2 text-lg font-bold leading-none text-pw-accent">94%</span>
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-pw-muted">
          Accuracy
        </span>
      </div>

      {/* ═══ FLOATING ELEMENT 6: No SIGNUP ═══ */}
      <div data-dvd="no-signup" className={`${cardClass} items-center`}>
        <span className={iconChipClass}>
          <CircleXIcon className="h-4 w-4 text-pw-accent" aria-hidden="true" />
        </span>
        <span className="mt-2 text-lg font-bold leading-none text-pw-accent">No</span>
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-pw-muted">
          Signup
        </span>
      </div>
    </div>
  );
}
