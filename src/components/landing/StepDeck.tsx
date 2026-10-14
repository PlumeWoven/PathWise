import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRightIcon,
  ClipboardCheckIcon,
  LineChartIcon,
  RouteIcon,
  UsersIcon,
} from "lucide-react";

const steps = [
  {
    icon: ClipboardCheckIcon,
    title: "Level check: 8 questions",
    body: "The questions get harder when you're right and easier when you're not, then place you at one of five levels.",
  },
  {
    icon: RouteIcon,
    title: "Five stages to your goal",
    body: "Each stage names the level it needs. Finish a course at that level to unlock the next stage.",
  },
  {
    icon: UsersIcon,
    title: "Tutors ranked for you",
    body: "We rank verified tutors by subject, learning style, schedule, budget and rating. Book a trial or send a message first.",
  },
  {
    icon: LineChartIcon,
    title: "Your sessions in one place",
    body: "See upcoming and past sessions, message your tutor, and mark stages complete on your roadmap.",
  },
];

const AUTO_MS = 4500; // time between automatic swaps
const SKEW = 4; // deg, gives the stack its perspective lean
const MAX_SPREAD = 32; // px between stacked cards (shrinks on narrow screens)

/** Stack slot i: fanned up and to the right, pushed back in depth. */
const slotFor = (i: number, d: number) => ({
  x: i * d,
  y: -i * d,
  z: -i * d * 1.5,
  zIndex: steps.length - i,
});
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * "How it works" as a perspective card stack that swaps on its own: the front card drops away,
 * the rest step forward one by one, and it settles at the back. Pauses on hover/focus, off-screen,
 * and never auto-plays under reduced motion. Next, arrow keys or clicking the front card swap too.
 */
export function StepDeck() {
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const order = useRef(steps.map((_, i) => i)); // order.current[0] is the front card
  const spread = useRef(MAX_SPREAD);
  const busy = useRef(false);
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);
  const inView = useInView(stackRef, { amount: 0.4 });
  const reduced = useReducedMotion();

  // Snap every card to its slot; spread follows the stack width so the fan fits narrow screens.
  useLayoutEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    const place = () => {
      spread.current = Math.round(Math.min(MAX_SPREAD, el.clientWidth * 0.07));
      order.current.forEach((card, i) => {
        const c = cardRefs.current[card];
        if (!c) return;
        const s = slotFor(i, spread.current);
        c.style.zIndex = String(s.zIndex);
        animate(c, { x: s.x, y: s.y, z: s.z }, { duration: 0 });
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const swap = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const [first, ...rest] = order.current;
    const elFront = cardRefs.current[first];
    const d = spread.current;
    const still = reduced === true;
    const spring = still
      ? { duration: 0 }
      : ({ type: "spring", bounce: 0, visualDuration: 0.3 } as const); // critically damped: no overshoot
    setFront(rest[0]);

    // 1. Front card drops away…
    const drop = elFront
      ? animate(
          elFront,
          { y: 420 },
          still ? { duration: 0 } : { duration: 0.55, ease: [0.55, 0, 1, 0.45] },
        )
      : null;
    if (!still) await wait(260);

    // 2. …the rest step forward, staggered…
    const moves = rest.map((card, i) => {
      const el = cardRefs.current[card];
      if (!el) return null;
      const s = slotFor(i, d);
      el.style.zIndex = String(s.zIndex);
      return animate(el, { x: s.x, y: s.y, z: s.z }, { ...spring, delay: still ? 0 : i * 0.12 });
    });
    if (!still) await wait(160);

    // 3. …and it springs back in at the back of the stack.
    let back = null;
    if (elFront) {
      const s = slotFor(steps.length - 1, d);
      elFront.style.zIndex = String(s.zIndex);
      drop?.stop();
      back = animate(elFront, { x: s.x, y: s.y, z: s.z }, spring);
    }
    await Promise.all([...moves, back].filter(Boolean));
    order.current = [...rest, first];
    busy.current = false;
  }, [reduced]);

  // Auto-play: only while visible, not hovered/focused, tab active, and motion allowed.
  useEffect(() => {
    if (reduced || paused || !inView) return;
    const id = window.setInterval(() => {
      if (!document.hidden) void swap();
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [reduced, paused, inView, swap]);

  return (
    <section className="relative grid min-h-screen grid-cols-1 items-center gap-24 overflow-hidden bg-qed-ground-2 px-6 py-32 md:px-24 lg:grid-cols-2">
      <div data-journey="deck-copy" className="relative z-[2]">
        <h2 className="mb-8 font-syne text-[length:clamp(1.75rem,7.5vw,3rem)] uppercase leading-none tracking-[-0.025em] lg:text-[length:clamp(2.25rem,4.4vw,4.5rem)]">
          From level check to lessons
        </h2>
        <p className="mb-12 max-w-md text-lg leading-relaxed text-qed-ink-2">
          Take the level check, follow your roadmap, book a verified tutor, and keep every session
          in one list.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/quiz"
            className="text-[0.8125rem] font-semibold bg-qed-ink px-8 py-4 text-qed-ground transition-colors hover:bg-qed-amber"
          >
            Start your level check
          </Link>
          <Link
            to="/pathwise/demo"
            className="text-[0.8125rem] font-semibold border border-qed-hairline px-8 py-4 transition-colors hover:border-qed-ink"
          >
            Try demo mode
          </Link>
        </div>
      </div>

      <div
        className="relative z-[2] flex flex-col items-center"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
        }}
      >
        {/* Room above for the fanned back cards; narrower than the column so the fan fits. */}
        <div
          ref={stackRef}
          tabIndex={0}
          data-journey="deck"
          role="group"
          aria-roledescription="card stack"
          aria-label="How PathWise works. Plays automatically; hover or focus to pause. Use the arrow keys or the Next button to go to the next step."
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              void swap();
            }
          }}
          className="relative mt-24 h-[25rem] w-[min(20rem,calc(100%-4rem))] outline-none [perspective:75rem] focus-visible:ring-2 focus-visible:ring-qed-amber focus-visible:ring-offset-4 focus-visible:ring-offset-qed-ground-2"
        >
          <div className="absolute inset-0 [transform-style:preserve-3d]">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const s = slotFor(i, MAX_SPREAD); // first paint; resized/settled in the layout effect
              return (
                <motion.article
                  key={step.title}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  style={{ x: s.x, y: s.y, z: s.z, skewY: SKEW, zIndex: s.zIndex }}
                  onClick={i === front ? () => void swap() : undefined}
                  aria-hidden={i !== front}
                  className="absolute inset-0 flex cursor-pointer select-none flex-col justify-between border border-qed-hairline bg-qed-card p-6 sm:p-8 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] [backface-visibility:hidden] will-change-transform"
                >
                  <div className="flex items-start justify-between">
                    <span className="label-caps text-qed-ink-2">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                    <Icon
                      className={`h-5 w-5 ${i % 2 ? "text-qed-teal-ink" : "text-qed-amber"}`}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-syne text-2xl uppercase leading-[1.05] tracking-[-0.025em] sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-qed-ink-2">{step.body}</p>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="mt-16 w-[min(20rem,calc(100%-4rem))]">
          <div className="relative h-px w-full bg-qed-hairline">
            <div
              className="absolute left-0 top-0 h-full bg-qed-amber transition-all duration-300"
              style={{ width: `${((front + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="label-caps text-qed-ink-2" aria-live="polite">
              Step {front + 1} of {steps.length} ·{" "}
              {/* CSS, not useReducedMotion, so server and client render the same text.
                  Touch screens can't hover, so they get the tap hint too. */}
              <span className="motion-reduce:hidden [@media(hover:none)]:hidden">
                hover to pause
              </span>
              <span className="hidden motion-reduce:inline [@media(hover:none)]:inline">
                tap next
              </span>
            </span>
            <button
              type="button"
              onClick={() => void swap()}
              aria-label="Next step"
              className="relative grid h-8 w-8 place-items-center border border-qed-hairline after:absolute after:-inset-1.5 after:content-[''] transition-colors hover:border-qed-amber"
            >
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
