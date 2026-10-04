import { Fragment, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { CheckIcon } from "lucide-react";

// Power3 ease-out, as in the source stepper; same curve as the landing progress fills.
const POWER3_OUT = [0.33, 1, 0.68, 1] as const;

/** Direction-aware slide for step content. Pass `custom={direction}` on AnimatePresence and on each child. */
export const stepSlide: Variants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 20 : -20, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } },
  },
  exit: (dir: number) => ({ x: dir >= 0 ? -20 : 20, opacity: 0, transition: { duration: 0.2 } }),
};

/** 1 after moving forward, -1 after moving back. Kept until the step changes again. */
export function useStepDirection(step: number) {
  const [prev, setPrev] = useState(step);
  const [dir, setDir] = useState(1);
  if (step !== prev) {
    setPrev(step);
    setDir(step > prev ? 1 : -1);
  }
  return dir;
}

/**
 * Controlled step indicator: numbered rings joined by hairline connectors that fill amber.
 * `currentStep` is 1-based; pass `steps.length + 1` to show everything complete.
 * Completed steps are clickable only when `onStepClick` is given.
 */
export function AnimatedStepper({
  steps,
  currentStep,
  onStepClick,
  className = "",
}: {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center pb-7">
        {steps.map((label, i) => {
          const step = i + 1;
          const status =
            step < currentStep ? "complete" : step === currentStep ? "active" : "upcoming";
          const clickable = !!onStepClick && status === "complete";
          return (
            <Fragment key={label}>
              <li className="relative flex flex-col items-center">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => onStepClick?.(step)}
                  aria-current={status === "active" ? "step" : undefined}
                  aria-label={`Step ${step}: ${label}${status === "complete" ? ", done" : ""}`}
                  className={`relative grid h-8 w-8 place-items-center rounded-full border text-[0.6875rem] font-semibold tabular-nums transition-colors duration-300 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--pw-accent-fill)] ${
                    status === "complete"
                      ? "border-pw-accent-fill bg-pw-accent-fill text-pw-on-accent enabled:hover:bg-transparent enabled:hover:text-pw-accent"
                      : status === "active"
                        ? "border-[var(--pw-ink)] text-pw-ink"
                        : "border-[var(--pw-border)] text-[var(--pw-ink-2)]"
                  }`}
                >
                  {status === "complete" ? (
                    <CheckIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    step
                  )}
                  {status === "active" && (
                    <motion.span
                      layoutId="stepper-active-ring"
                      aria-hidden="true"
                      className="absolute -inset-1.5 rounded-full border border-pw-accent-fill"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
                <span
                  className={`label-caps absolute top-full mt-2.5 whitespace-nowrap ${
                    status === "active"
                      ? "text-pw-ink"
                      : `hidden sm:block ${status === "upcoming" ? "text-[var(--pw-ink-2)]" : "text-pw-ink"}`
                  }`}
                >
                  {label}
                </span>
              </li>
              {step < steps.length && (
                <li aria-hidden="true" className="relative mx-3 h-px flex-1 bg-[var(--pw-border)]">
                  <motion.span
                    className="absolute inset-0 origin-left bg-pw-accent-fill"
                    initial={false}
                    animate={{ scaleX: step < currentStep ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: POWER3_OUT }}
                  />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
