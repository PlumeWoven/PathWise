import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CircleCheckIcon, CircleXIcon, ClockIcon } from "lucide-react";
import { LandingCtas } from "./LandingCtas";

const HERO_IMG =
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=2000";

/**
 * Scroll-driven "portal": two ground-coloured panels slide apart while the PATH / WISE
 * wordmark splits, revealing the image. 250vh tall so the sticky stage has 1.5 viewports
 * of scroll. Reduced motion is handled in CSS (motion-reduce:*) rather than
 * useReducedMotion, so server and client render identical markup.
 */
export function PortalHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const panelLeftX = useTransform(p, [0, 1], ["0%", "-105%"]);
  const panelRightX = useTransform(p, [0, 1], ["0%", "105%"]);
  const titleScale = useTransform(p, [0, 1], [1, 1.15]);
  const titleSpacing = useTransform(p, [0, 1], ["-0.025em", "-0.065em"]);
  const splitLeft = useTransform(p, [0, 1], ["0%", "-40%"]);
  const splitRight = useTransform(p, [0, 1], ["0%", "40%"]);
  const imgScale = useTransform(p, [0, 1], [1.1, 1]);
  const duotone = useTransform(p, [0, 1], [0, 0.25]);
  const dotOpacity = useTransform(p, [0, 1], [0, 1]);
  // Dots start at the stage centre and fly toward opposite corners (amber top-left, teal bottom-right).
  const amberX = useTransform(p, [0, 1], ["0vw", "-44vw"]);
  const amberY = useTransform(p, [0, 1], ["0svh", "-38svh"]);
  const tealX = useTransform(p, [0, 1], ["0vw", "44vw"]);
  const tealY = useTransform(p, [0, 1], ["0svh", "38svh"]);

  return (
    <section ref={ref} className="relative h-[250vh] motion-reduce:h-[calc(100svh_-_3.625rem)]">
      {/* 58px = sticky site header; the stage sits below it so nothing is cut off. */}
      <div className="sticky top-[3.625rem] h-[calc(100svh_-_3.625rem)] w-full overflow-hidden isolate">
        <motion.img
          src={HERO_IMG}
          alt=""
          style={{ scale: imgScale }}
          className="absolute inset-0 z-0 h-full w-full object-cover grayscale brightness-50 md:grayscale-0 motion-reduce:transform-none!"
        />
        <motion.div
          style={{ opacity: duotone }}
          className="pointer-events-none absolute inset-0 z-10 bg-linear-135 from-qed-amber to-qed-teal mix-blend-overlay motion-reduce:opacity-25!"
        />
        <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle,transparent_20%,rgba(10,12,14,0.8)_100%)]" />

        <motion.div
          style={{ x: panelLeftX }}
          className="absolute left-0 top-0 z-40 h-full w-[50.5%] bg-qed-ground motion-reduce:hidden"
        />
        <motion.div
          style={{ x: panelRightX }}
          className="absolute right-0 top-0 z-40 h-full w-[50.5%] bg-qed-ground motion-reduce:hidden"
        />

        <motion.span
          style={{ opacity: dotOpacity, x: amberX, y: amberY }}
          className="absolute left-1/2 top-1/2 -ml-[0.1875rem] -mt-[0.1875rem] z-[45] h-1.5 w-1.5 rounded-full bg-qed-amber motion-reduce:hidden"
        />
        <motion.span
          style={{ opacity: dotOpacity, x: tealX, y: tealY }}
          className="absolute left-1/2 top-1/2 -ml-[0.1875rem] -mt-[0.1875rem] z-[45] h-1.5 w-1.5 rounded-full bg-qed-teal motion-reduce:hidden"
        />

        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center px-4 text-center">
          <motion.div
            aria-hidden="true"
            style={{ scale: titleScale, letterSpacing: titleSpacing }}
            className="pointer-events-none relative z-10 flex whitespace-nowrap font-syne text-[10vw] font-extrabold uppercase leading-none md:text-[8vw] motion-reduce:transform-none! motion-reduce:tracking-[-0.025em]!"
          >
            <motion.span
              style={{ x: splitLeft }}
              className="inline-block motion-reduce:transform-none!"
            >
              Path
            </motion.span>
            <motion.span
              style={{ x: splitRight }}
              className="inline-block text-qed-amber motion-reduce:transform-none!"
            >
              Wise
            </motion.span>
          </motion.div>

          <div className="relative isolate flex flex-col items-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-6 -inset-y-8 -z-10 rounded-[1.5rem] bg-qed-ground/70 blur-2xl"
            />
            <h1 className="mt-8 font-syne text-[clamp(1.375rem,2.6vw,2.25rem)] font-semibold leading-tight">
              Find exactly where you stand.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-qed-ink-2 sm:text-base">
              A 3-minute quiz reveals your level, builds your roadmap, and finds the right tutor. No
              guesswork. No wasted sessions.
            </p>
            <LandingCtas className="mt-8 justify-center" />
          </div>
        </div>

        <p className="label-caps absolute left-12 top-24 z-[55] hidden items-center gap-2 text-qed-ink-2 md:flex">
          <ClockIcon className="h-3.5 w-3.5 text-qed-amber" aria-hidden="true" /> 3 min avg
        </p>
        <p className="label-caps absolute right-12 top-24 z-[55] hidden items-center gap-2 text-qed-ink-2 md:flex">
          <CircleCheckIcon className="h-3.5 w-3.5 text-qed-amber" aria-hidden="true" /> 94% accuracy
        </p>
        <p className="label-caps absolute bottom-12 left-6 z-[55] flex items-center gap-2 text-qed-amber md:left-12">
          <span className="h-1.5 w-1.5 rounded-full bg-qed-amber" aria-hidden="true" /> Scroll to
          begin
        </p>
        <p className="label-caps absolute bottom-12 right-6 z-[55] flex items-center gap-2 text-qed-ink-2 md:right-12">
          <CircleXIcon className="h-3.5 w-3.5 text-qed-amber" aria-hidden="true" /> No signup
        </p>
      </div>
    </section>
  );
}
