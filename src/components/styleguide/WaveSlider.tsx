import { useMemo } from "react";

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
 * Neomorphic range slider: a glossy 3D ball thumb riding in a deep carved
 * channel with tick marks. Tick marks AFTER the thumb are accent-colored;
 * ticks before the thumb stay uncolored.
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
  // Evenly spaced tick marks carved into the channel, echoing the reference.
  const ticks = useMemo(() => Array.from({ length: 11 }, (_, i) => (i / 10) * 100), []);
  return (
    <div className="relative h-12 w-full select-none">
      {/* Deep indented channel */}
      <div
        className="absolute left-0 top-1/2 h-4 w-full -translate-y-1/2 rounded-full"
        style={{
          backgroundColor: "var(--pw-bg)",
          boxShadow:
            "inset 5px 5px 10px var(--pw-shadow-dark), inset -5px -5px 10px var(--pw-shadow-light)",
        }}
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
              className="absolute top-1/2 h-2 w-px -translate-y-1/2 rounded-full transition-colors duration-200"
              style={{
                left: `${t}%`,
                backgroundColor: passed ? "var(--pw-accent)" : "var(--pw-muted)",
                opacity: passed ? 0.9 : 0.35,
              }}
            />
          );
        })}
      </div>

      {/* 3D ball thumb sitting in the groove */}
      <div
        className="pointer-events-none absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: `${pct}%`,
          backgroundImage: "radial-gradient(circle at 32% 28%, #f6ad84, var(--pw-accent) 68%)",
          boxShadow:
            "4px 4px 8px var(--pw-shadow-dark), -2px -2px 6px rgba(255,255,255,0.4), inset 1px 1px 2px rgba(255,255,255,0.55), 0 0 8px color-mix(in srgb, var(--pw-accent) 55%, transparent)",
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
