import { motion, useScroll, useTransform } from "framer-motion";
export function Statement() {
  const { scrollY } = useScroll();
  const drift = useTransform(scrollY, (y) => y * 0.1);
  const spin = useTransform(scrollY, (y) => y * 0.05);

  return (
    <section
      data-journey="statement"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-qed-ground px-6 py-32 md:px-24"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <p className="label-caps mb-8 text-qed-ink-2">Learn deliberately</p>
        <h2
          data-journey="statement-heading"
          className="max-w-[22ch] font-syne text-[clamp(1.5rem,3.6vw,3.25rem)] leading-[1.15] tracking-[-0.025em]"
        >
          Find exactly where you stand and{" "}
          <span className="text-qed-amber">the path to where you want to be.</span>
        </h2>
        <div className="mt-20 flex items-baseline">
          <span
            className="text-outline select-none font-syne text-[16vw] leading-none"
            aria-hidden="true"
          >
            01
          </span>
          <p className="ml-8 max-w-sm leading-relaxed text-qed-ink-2">
            Get a clear, stage-by-stage path from your current level to your goal. No filler, no
            guesswork.
          </p>
        </div>
      </div>
      <motion.div
        aria-hidden="true"
        style={{ y: drift, rotate: spin }}
        className="pointer-events-none absolute -right-20 top-1/4 flex h-[25rem] w-[25rem] items-center justify-center rounded-full border border-qed-hairline p-12 opacity-20 motion-reduce:transform-none!"
      >
        <div className="h-full w-full rounded-full border-2 border-dashed border-qed-teal/30" />
      </motion.div>
    </section>
  );
}
