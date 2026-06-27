import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, QuoteIcon } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "The level check was eerily accurate. Within minutes I had a roadmap that actually matched where I was — not where a generic course assumed I’d be.",
    name: "Maya Okonkwo",
    role: "Learning Spanish",
  },
  {
    quote:
      "As a tutor, PathWise sends me students who are genuinely at the stage I teach best. Every session starts with momentum instead of guesswork.",
    name: "Daniel Reyes",
    role: "Verified Math Tutor",
  },
  {
    quote:
      "I stopped wasting sessions reviewing things I already knew. The roadmap kept me moving and I hit my goal three weeks early.",
    name: "Priya Sharma",
    role: "Front-end developer",
  },
];

const variants: Variants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 60 : -60,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
  }),
};

export function Testimonials() {
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);

  const paginate = useCallback((dir: number) => {
    setState(([prev]) => {
      const next = (prev + dir + testimonials.length) % testimonials.length;
      return [next, dir];
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => paginate(1), 6000);
    return () => clearInterval(id);
  }, [paginate]);

  const active = testimonials[index];

  return (
    <section className="w-full bg-pw-bg px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-pw-accent">
          Loved by learners & tutors
        </p>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-wide text-pw-ink sm:text-4xl">
          Calmer learning, real results
        </h2>

        <div className="relative mt-12">
          <div className="rounded-pw bg-pw-surface p-8 shadow-pw-raised sm:p-12">
            <QuoteIcon className="mx-auto h-8 w-8 text-pw-accent/70" aria-hidden="true" />

            <div className="relative mt-6 min-h-[150px] sm:min-h-[120px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.blockquote
                  key={index}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                >
                  <p className="text-lg leading-relaxed text-pw-ink sm:text-xl">“{active.quote}”</p>
                  <footer className="mt-6">
                    <span className="block font-semibold tracking-wide text-pw-ink">
                      {active.name}
                    </span>
                    <span className="text-sm text-pw-muted">{active.role}</span>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <motion.button
              type="button"
              onClick={() => paginate(-1)}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              aria-label="Previous testimonial"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-pw-surface text-pw-ink shadow-pw-raised-sm"
            >
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </motion.button>

            <div className="flex items-center gap-2.5">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setState([i, i > index ? 1 : -1])}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === index}
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === index ? "w-7 bg-pw-accent" : "w-2.5 bg-pw-muted/40"}`}
                />
              ))}
            </div>

            <motion.button
              type="button"
              onClick={() => paginate(1)}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              aria-label="Next testimonial"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-pw-surface text-pw-ink shadow-pw-raised-sm"
            >
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
