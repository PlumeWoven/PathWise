import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SunIcon, MoonIcon } from "lucide-react";
import { flushSync } from "react-dom";
import { useDarkMode } from "../pathwise/DarkMode";

/**
 * Radial Sweep theme toggle.
 *
 * On click we measure the button's exact center, then expand (or contract) a
 * clip-path circle from that point across the whole viewport using the View
 * Transitions API. The circle radius reaches the farthest corner so the reveal
 * always covers the entire screen — never leaving a stale corner of the old theme.
 */
export function ThemeToggle() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const { setTheme, isDark } = useDarkMode();

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;
    const startViewTransition = (document as any).startViewTransition?.bind(
      document
    );
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // No View Transitions support (or reduced motion) — just flip instantly.
    if (!startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }

    // Origin = the toggle's center. Radius = distance to the farthest viewport
    // corner from that origin, so the circle fully covers the screen.
    const rect = btnRef.current!.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    const radius = Math.hypot(maxX, maxY);

    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${radius}px`);

    // Direction class drives which pseudo-element animates (see styles.css).
    const dirClass = next === "light" ? "vt-to-light" : "vt-to-dark";
    root.classList.add(dirClass);

    const transition = startViewTransition(() => {
      flushSync(() => {
        setTheme(next);
      });
    });
    transition.finished
      .catch(() => {
        // View transition may be interrupted; clean up classes anyway
      })
      .finally(() => {
        root.classList.remove("vt-to-light", "vt-to-dark");
      });
  };

  return (
    <button
      ref={btnRef}
      onClick={toggle}
      aria-label={
        isDark
          ? "Turn the lights on (switch to light mode)"
          : "Turn the lights off (switch to dark mode)"
      }
      aria-pressed={!isDark}
      className="relative grid h-9 w-9 place-items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        borderColor: "var(--pw-border)",
        backgroundColor: "var(--pw-surface)",
        color: isDark ? "var(--pw-accent)" : "#f59e0b",
      }}
    >
      {/* soft glow that swells while in light mode */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500"
        style={{
          opacity: isDark ? 0 : 1,
          boxShadow:
            "0 0 0 2px rgba(245,158,11,0.15), 0 0 22px 4px rgba(245,158,11,0.45)",
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{
            rotate: -90,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            rotate: 0,
            scale: 1,
            opacity: 1,
          }}
          exit={{
            rotate: 90,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 22,
          }}
          className="grid place-items-center"
        >
          {isDark ? (
            <MoonIcon className="h-4 w-4" />
          ) : (
            <SunIcon className="h-4 w-4" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
