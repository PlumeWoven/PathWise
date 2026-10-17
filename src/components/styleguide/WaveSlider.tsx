/** Evenly-spaced tick positions (0%–100%) for the slider track. */
const TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

interface WaveSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Accessible label for the slider */
  ariaLabel?: string;
}

/**
 * QED range slider: a flat amber dot riding a hairline track with tick marks.
 * Tick marks AT OR BEFORE the thumb are accent-colored; ticks ahead stay muted.
 *
 * Interaction + keyboard are handled by a transparent native <input
 * type="range"> layered on top, so it stays fully accessible.
 */
export function WaveSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  ariaLabel = "Slider",
}: WaveSliderProps) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  // Evenly spaced tick marks — module-level constant, no hook needed.
  const ticks = TICKS;
  return (
    <div className="relative h-12 w-full select-none">
      {/* Hairline track */}
      <div
        className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2"
        style={{ backgroundColor: "var(--pw-border)" }}
      />

      {/* Tick marks: accent once the thumb has passed them, uncolored ahead */}
      <div
        className="pointer-events-none absolute left-0 top-1/2 h-4 w-full -translate-y-1/2"
        aria-hidden="true"
      >
        {ticks.map((t) => {
          const passed = t <= pct;
          return (
            <span
              key={t}
              className="absolute top-1/2 h-2 w-px -translate-y-1/2 transition-colors duration-200"
              style={{
                left: `${t}%`,
                backgroundColor: passed ? "var(--pw-accent)" : "var(--pw-muted)",
                opacity: passed ? 0.9 : 0.35,
              }}
            />
          );
        })}
      </div>

      {/* Flat amber dot thumb */}
      <div
        className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: `${pct}%`,
          backgroundColor: "var(--pw-accent-fill)",
          boxShadow: "0 0 0 1px var(--pw-border)",
        }}
        aria-hidden="true"
      />

      {/* Transparent native input for interaction + keyboard a11y */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
