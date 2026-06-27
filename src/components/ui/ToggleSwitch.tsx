interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
  id?: string;
}

/**
 * Neomorphic pill toggle switch (on / off), modelled on the soft-UI reference:
 * an inset pill track with a raised 3D ball thumb that turns accent-orange and
 * slides right when on. Use this for every boolean on/off control.
 */
export function ToggleSwitch({ checked, onChange, ariaLabel, id }: ToggleSwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="pw-well relative inline-flex h-8 w-14 shrink-0 items-center !rounded-full px-1 transition-colors"
    >
      <span
        className="h-6 w-6 rounded-full transition-all duration-300 ease-out"
        style={{
          transform: checked ? "translateX(24px)" : "translateX(0px)",
          backgroundImage: checked
            ? "radial-gradient(circle at 32% 30%, #f3a275, var(--pw-accent) 70%)"
            : "radial-gradient(circle at 32% 30%, var(--pw-surface), color-mix(in srgb, var(--pw-surface) 80%, #000) 110%)",
          boxShadow: checked
            ? "3px 3px 6px var(--pw-shadow-dark), -2px -2px 5px rgba(255,255,255,0.35), inset 1px 1px 2px rgba(255,255,255,0.5)"
            : "3px 3px 6px var(--pw-shadow-dark), -3px -3px 6px var(--pw-shadow-light)",
        }}
      />
    </button>
  );
}
