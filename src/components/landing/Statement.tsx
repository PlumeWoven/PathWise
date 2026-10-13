export function Statement() {
  // The 16vw outline "01" (on content that isn't a sequence) and the rotating dashed ring
  // were removed: the landing already has its signature in the hero and the journey line.
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
        <p className="mt-24 max-w-sm leading-relaxed text-qed-ink-2">
          Get a clear, stage-by-stage path from your current level to your goal. No filler, no
          guesswork.
        </p>
      </div>
    </section>
  );
}
