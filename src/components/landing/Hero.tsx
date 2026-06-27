import { motion, type Variants } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/pathwise/auth";
import { FloatingCluster } from "./FloatingCluster";

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.1 + i * 0.08,
    },
  }),
};

export function Hero() {
  const { isLoggedIn, role } = useAuth();
  const isTutor = isLoggedIn && role === "tutor";

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-pw-bg px-5 py-28 sm:px-8">
      <FloatingCluster />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.h1
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-display text-[2.75rem] font-bold leading-[1.1] tracking-wide text-pw-ink sm:text-6xl"
        >
          Find exactly where you stand.
        </motion.h1>

        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-pw-muted sm:text-lg"
        >
          A 3-minute quiz reveals your level, builds your roadmap, and finds the right tutor. No
          guesswork. No wasted sessions.
        </motion.p>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold tracking-wide text-pw-muted"
        >
          <span>3 min avg</span>
          <span className="h-1 w-1 rounded-full bg-pw-muted/50" aria-hidden="true" />
          <span>94% accuracy</span>
          <span className="h-1 w-1 rounded-full bg-pw-muted/50" aria-hidden="true" />
          <span>No signup</span>
        </motion.div>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {isTutor ? (
            <Link
              to="/dashboard"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-pw-accent px-8 py-3.5 text-[15px] font-semibold tracking-wide text-white shadow-pw-raised transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              Go to your dashboard
              <ArrowRightIcon
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <>
              <Link
                to="/quiz"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-pw-accent px-8 py-3.5 text-[15px] font-semibold tracking-wide text-white shadow-pw-raised transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
              >
                Start your level check
                <ArrowRightIcon
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/find-tutor"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-pw-bg px-8 py-3.5 text-[15px] font-semibold tracking-wide text-pw-ink shadow-pw-inset transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
              >
                Find a tutor
                <ArrowRightIcon
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
