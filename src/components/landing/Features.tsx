import { motion, type Variants } from "framer-motion";
import { ClipboardCheckIcon, RouteIcon, UsersIcon, LineChartIcon } from "lucide-react";

const features = [
  {
    icon: ClipboardCheckIcon,
    title: "Level check in 3 minutes",
    body: "A focused adaptive quiz pinpoints exactly what you know — and what you don’t — with 94% accuracy.",
  },
  {
    icon: RouteIcon,
    title: "A roadmap built for you",
    body: "Get a clear, stage-by-stage path from your current level to your goal. No filler, no guesswork.",
  },
  {
    icon: UsersIcon,
    title: "Matched with the right tutor",
    body: "We pair you with verified tutors who specialize in the exact stage you’re working through.",
  },
  {
    icon: LineChartIcon,
    title: "Track every session",
    body: "See your progress, hours, and momentum in one calm dashboard that keeps you moving forward.",
  },
];

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: i * 0.08,
    },
  }),
};

export function Features() {
  return (
    <section className="w-full bg-pw-bg px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pw-accent">
            How it works
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-wide text-pw-ink sm:text-4xl">
            Everything you need to learn deliberately
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.3,
                }}
                whileHover={{
                  scale: 1.02,
                }}
                className="rounded-pw bg-pw-surface p-7 shadow-pw-raised transition-shadow"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-pw-bg shadow-pw-inset">
                  <Icon className="h-6 w-6 text-pw-accent" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-wide text-pw-ink">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-pw-muted">{feature.body}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
