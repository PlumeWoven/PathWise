import { useDVDFloat } from "@/hooks/useDVDFloat";

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
    <div
      className="pointer-events-none absolute inset-0 z-0 block"
      aria-hidden="true"
    >
      {/* ═══ FLOATING ELEMENT 1: STAGE 01 ═══ */}
      <div
        data-dvd="stage-01"
        className="absolute top-0 left-0 inline-flex flex-col items-start
          rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm
          border border-zinc-200/50 dark:border-zinc-800/50
          shadow-lg shadow-black/5 dark:shadow-black/20
          px-5 py-3.5 pointer-events-none z-0"
      >
        <span className="text-orange-500 text-[11px] font-bold tracking-widest uppercase">STAGE 01</span>
        <span className="text-zinc-900 dark:text-white text-sm font-semibold mt-0.5">Foundations</span>
      </div>

      {/* ═══ FLOATING ELEMENT 2: STAGE 02 ═══ */}
      <div
        data-dvd="stage-02"
        className="absolute top-0 left-0 inline-flex flex-col items-start
          rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm
          border border-zinc-200/50 dark:border-zinc-800/50
          shadow-lg shadow-black/5 dark:shadow-black/20
          px-5 py-3.5 pointer-events-none z-0"
      >
        <span className="text-orange-500 text-[11px] font-bold tracking-widest uppercase">STAGE 02</span>
        <span className="text-zinc-900 dark:text-white text-sm font-semibold mt-0.5">Core Skills</span>
      </div>

      {/* ═══ FLOATING ELEMENT 3: STAGE 05 ═══ */}
      <div
        data-dvd="stage-05"
        className="absolute top-0 left-0 inline-flex flex-col items-start
          rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm
          border border-zinc-200/50 dark:border-zinc-800/50
          shadow-lg shadow-black/5 dark:shadow-black/20
          px-5 py-3.5 pointer-events-none z-0"
      >
        <span className="text-orange-500 text-[11px] font-bold tracking-widest uppercase">STAGE 05</span>
        <span className="text-zinc-900 dark:text-white text-sm font-semibold mt-0.5">Your Goal</span>
      </div>

      {/* ═══ FLOATING ELEMENT 4: 3 min AVG ═══ */}
      <div
        data-dvd="stat-3min"
        className="absolute top-0 left-0 inline-flex flex-col items-center
          rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm
          border border-zinc-200/50 dark:border-zinc-800/50
          shadow-lg shadow-black/5 dark:shadow-black/20
          px-5 py-3.5 pointer-events-none z-0"
      >
        <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
        <span className="text-orange-500 text-lg font-bold leading-none">3 min</span>
        <span className="text-zinc-700 dark:text-white text-[11px] font-semibold tracking-wider uppercase mt-0.5">AVG</span>
      </div>

      {/* ═══ FLOATING ELEMENT 5: 94% ACCURACY ═══ */}
      <div
        data-dvd="stat-94"
        className="absolute top-0 left-0 inline-flex flex-col items-center
          rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm
          border border-zinc-200/50 dark:border-zinc-800/50
          shadow-lg shadow-black/5 dark:shadow-black/20
          px-5 py-3.5 pointer-events-none z-0"
      >
        <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
        </svg>
        <span className="text-orange-500 text-lg font-bold leading-none">94%</span>
        <span className="text-zinc-700 dark:text-white text-[11px] font-semibold tracking-wider uppercase mt-0.5">ACCURACY</span>
      </div>

      {/* ═══ FLOATING ELEMENT 6: No SIGNUP ═══ */}
      <div
        data-dvd="no-signup"
        className="absolute top-0 left-0 inline-flex flex-col items-center
          rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm
          border border-zinc-200/50 dark:border-zinc-800/50
          shadow-lg shadow-black/5 dark:shadow-black/20
          px-5 py-3.5 pointer-events-none z-0"
      >
        <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
        </svg>
        <span className="text-orange-500 text-lg font-bold leading-none">No</span>
        <span className="text-zinc-700 dark:text-white text-[11px] font-semibold tracking-wider uppercase mt-0.5">SIGNUP</span>
      </div>
    </div>
  );
}