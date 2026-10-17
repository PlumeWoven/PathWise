export function Statement() {
  // The 16vw outline "01" (on content that isn't a sequence) and the rotating dashed ring
  // were removed: the landing already has its signature in the hero and the journey line.
  return (
    <section
      data-journey="statement"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-qed-ground px-6 py-32 md:px-24"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <h2
          data-journey="statement-heading"
          className="max-w-[22ch] font-syne text-[clamp(1.5rem,3.6vw,3.25rem)] leading-[1.15] tracking-[-0.025em]"
        >
          Find out your level,{" "}
          <span className="text-qed-amber">then follow a plan to your goal.</span>
        </h2>
        <p className="mt-8 max-w-md leading-relaxed text-qed-ink-2">
          Math and English tutoring in Moldova. An 8-question check places you at one of five
          levels. Your roadmap then lists five stages, each with courses and tutors at your level.
        </p>
      </div>
    </section>
  );
}
