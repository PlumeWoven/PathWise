import { Link } from "@tanstack/react-router";
import { ArrowUpRightIcon } from "lucide-react";
const stages = [
  { n: "01", name: "Foundations", tone: "text-qed-amber" },
  { n: "02", name: "Core Skills", tone: "text-qed-teal-ink" },
  { n: "05", name: "Your Goal", tone: "text-qed-amber" },
];

const title = "font-syne text-2xl uppercase tracking-[-0.025em] sm:text-3xl md:text-5xl";

/** Roadmap stages as hairline rows; the last row is the only link (to the quiz that places you on a stage). */
export function StageRoster() {
  return (
    <section className="relative overflow-hidden bg-qed-ground px-6 py-32 md:px-24">
      <div data-journey="roster" className="relative z-[2] mx-auto max-w-7xl">
        <p className="label-caps mb-12 text-qed-ink-2">Your roadmap</p>
        <ol className="divide-y divide-qed-hairline">
          {stages.map((s, i) => (
            <li key={s.n}>
              {i === stages.length - 1 && (
                <p className="label-caps py-4 text-qed-muted" aria-hidden="true">
                  · · ·
                </p>
              )}
              <div className="flex items-center gap-4 sm:gap-6 py-8">
                <span className={`label-caps shrink-0 whitespace-nowrap ${s.tone}`}>
                  Stage {s.n}
                </span>
                <h3 className={title}>{s.name}</h3>
              </div>
            </li>
          ))}
          <li>
            <Link to="/quiz" className="group flex items-center justify-between py-8">
              <span className="flex items-center gap-4 sm:gap-6">
                <span className="label-caps shrink-0 whitespace-nowrap text-qed-ink-2">3 min</span>
                <span className={`${title} transition-transform group-hover:translate-x-2`}>
                  Find your stage
                </span>
              </span>
              <ArrowUpRightIcon
                className="h-6 w-6 text-qed-ink-2 transition-colors group-hover:text-qed-ink"
                aria-hidden="true"
              />
            </Link>
          </li>
        </ol>
      </div>
    </section>
  );
}
