import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { Icon } from "@/components/Icon";

const searchSchema = z.object({
  ref: fallback(z.string(), "").default(""),
  as: fallback(z.enum(["tutor", "student"]), "tutor").default("tutor"),
});

export const Route = createFileRoute("/_app/demo")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Try Pathwise — Live Demo" },
      {
        name: "description",
        content:
          "Experience Pathwise as a tutor or student. Sample data, no signup, 60 minute session.",
      },
      { property: "og:title", content: "Try Pathwise — Live Demo" },
      {
        property: "og:description",
        content: "Explore the full tutor & student experience with sample data.",
      },
      { property: "og:url", content: "/demo" },
    ],
    links: [{ rel: "canonical", href: "/demo" }],
  }),
  component: DemoEntry,
});

function DemoEntry() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();

  const start = (as: "tutor" | "student") => {
    navigate({ to: "/pathwise/demo", search: { as, ref: ref || undefined, code: undefined } });
  };

  return (
    <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-20 text-center">
        <span className="label-caps text-[var(--pw-accent)]">Live Demo</span>
        <h1 className="mt-3 font-display text-[2.25rem] sm:text-[2.875rem] uppercase tracking-[-0.025em] leading-[1.1]">
          Experience Pathwise <span className="text-[var(--pw-accent)]">in 60 seconds</span>
        </h1>
        <p className="mt-4 text-[0.9375rem] text-[var(--pw-ink-2)] max-w-xl mx-auto">
          Explore the full platform with realistic sample data. No signup, no credit card. Your demo
          session lasts 60 minutes — choose which experience you want to start with.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <button
            onClick={() => start("tutor")}
            className="pw-card p-6 hover:border-[var(--pw-ink)] transition-colors group"
          >
            <Icon name="tutor" className="h-8 w-8" />
            <h2 className="mt-3 font-display text-[1.25rem] transition-colors group-hover:text-[var(--pw-accent)]">
              I want to see the Tutor experience
            </h2>
            <p className="mt-2 text-[0.8125rem] text-[var(--pw-ink-2)]">
              Dashboard with earnings, students, courses, messages — everything tutors get.
            </p>
            <div className="mt-4 label-caps text-[var(--pw-accent)]">Start as Tutor →</div>
          </button>

          <button
            onClick={() => start("student")}
            className="pw-card p-6 hover:border-[var(--pw-ink)] transition-colors group"
          >
            <Icon name="student" className="h-8 w-8" />
            <h2 className="mt-3 font-display text-[1.25rem] transition-colors group-hover:text-[var(--pw-accent)]">
              I want to see the Student experience
            </h2>
            <p className="mt-2 text-[0.8125rem] text-[var(--pw-ink-2)]">
              Browse courses, enroll, and follow a sample learning roadmap.
            </p>
            <div className="mt-4 label-caps text-[var(--pw-accent)]">Start as Student →</div>
          </button>
        </div>

        <p className="mt-8 text-[0.75rem] text-[var(--pw-ink-2)]">
          Already exploring?{" "}
          <Link to="/pathwise/demo" className="text-[var(--pw-accent)] hover:underline">
            Resume your demo
          </Link>
          {" · "}
          <Link to="/" className="text-[var(--pw-accent)] hover:underline">
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
