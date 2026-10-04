interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
  id?: string;
}

/**
 * QED pill toggle switch (on / off): a hairline pill track with a flat thumb that
 * slides right when on. On = flat amber track with a ground-coloured thumb; off =
 * surface-2 track with an ink thumb. Use this for every boolean on/off control.
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
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border px-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pw-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pw-bg)] ${
        checked
          ? "border-pw-accent-fill bg-pw-accent-fill"
          : "border-[var(--pw-border)] bg-[var(--pw-surface-2)]"
      }`}
    >
      <span
        className={`h-6 w-6 rounded-full transition-all duration-300 ease-out ${
          checked ? "bg-pw-on-accent" : "bg-[var(--pw-ink)]"
        }`}
        style={{ transform: checked ? "translateX(22px)" : "translateX(0px)" }}
      />
    </button>
  );
}
