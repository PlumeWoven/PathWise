const testimonials = [
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

/** Testimonials in the design's hairline-table language (was the seminars table). */
export function Voices() {
  return (
    <section className="relative overflow-hidden bg-qed-ground-2 px-6 py-32 md:px-24">
      <div data-journey="voices" className="relative z-[2] mx-auto max-w-7xl">
        <p className="label-caps mb-8 text-qed-amber">Loved by learners &amp; tutors</p>
        <div
          className="label-caps hidden grid-cols-[1fr_3fr_1fr] gap-8 border-b border-qed-hairline py-4 text-qed-ink-2 md:grid"
          aria-hidden="true"
        >
          <span>Learning</span>
          <span>In their words</span>
          <span className="text-right">Name</span>
        </div>
        <ul className="divide-y divide-qed-hairline">
          {testimonials.map((t) => (
            <li key={t.name}>
              <figure className="group grid grid-cols-1 gap-3 py-8 md:grid-cols-[1fr_3fr_1fr] md:gap-8">
                <span className="text-qed-ink-2">{t.role}</span>
                <blockquote className="font-syne text-xl leading-snug transition-colors group-hover:text-qed-amber md:text-2xl">
                  “{t.quote}”
                </blockquote>
                <figcaption className="text-qed-ink-2 md:text-right">{t.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
