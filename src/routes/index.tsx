import { createFileRoute, Link } from "@tanstack/react-router";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { DemoBanner } from "../pathwise/DemoBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PathWise — Find exactly where you stand" },
      { name: "description", content: "A 3-minute quiz reveals your level, builds your roadmap, and finds the right tutor. No guesswork. No wasted sessions." },
      { property: "og:title", content: "PathWise — Find exactly where you stand" },
      { property: "og:description", content: "Discover your level, get a personalized roadmap, and meet matched tutors. Free, no signup." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "PathWise",
          url: "/",
          description: "PathWise matches students with tutors and personalized learning roadmaps.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "PathWise",
          url: "/",
          potentialAction: {
            "@type": "SearchAction",
            target: "/find-tutor?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  component: Hero,
});

function Hero() {
  const { openLogin, role, isLoggedIn } = useAuth();
  const isStudent = isLoggedIn && (role === "student" || role === "both");
  const isTutor = isLoggedIn && role === "tutor";
  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />

      <main className="px-5 sm:px-8 pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_360px] gap-12 items-center pt-8 lg:pt-16">
          {/* Hero content */}
          <section className="max-w-[560px]">
            <h1 className="font-display text-[44px] sm:text-[56px] leading-[1.05] tracking-tight">
              Find exactly<br />where you stand.
            </h1>
            <p className="mt-6 text-[17px] sm:text-[18px] leading-relaxed text-[var(--pw-ink-2)]">
              A 3-minute quiz reveals your level, builds your roadmap, and finds the right tutor. No guesswork. No wasted sessions.
            </p>

            {/* Trust bar */}
            <div className="mt-7 inline-flex items-center divide-x divide-[var(--pw-border)] font-mono-pw text-[13px] text-[var(--pw-ink-2)]">
              <span className="px-3 first:pl-0">⚡ 3 min avg</span>
              <span className="px-3">🎯 94% accuracy</span>
              <span className="px-3">👤 No signup</span>
            </div>

            {isTutor ? (
              <div className="mt-8">
                <Link to="/dashboard" className="pw-btn-primary inline-flex w-full sm:w-auto justify-center items-center px-7 py-4 text-[16px] font-medium">
                  Go to your dashboard →
                </Link>
                <p className="mt-3 text-[12px] text-[var(--pw-ink-2)]">Manage your students, sessions and earnings.</p>
              </div>
            ) : (
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/quiz"
                  className="pw-btn-primary inline-flex justify-center items-center px-7 py-4 text-[16px] font-medium"
                >
                  Start your level check →
                </Link>
                <Link
                  to="/find-tutor"
                  className="pw-btn-outline inline-flex justify-center items-center px-7 py-4 text-[16px] font-medium"
                >
                  Find a tutor →
                </Link>
              </div>
            )}
            {!isTutor && (
              <p className="mt-3 text-[12px] text-[var(--pw-ink-2)]">
                Free · No account required · 3 minutes
              </p>
            )}
          </section>

          {/* Floating preview card */}
          <aside className="hidden lg:block">
            <div className="pw-card p-6 relative overflow-hidden">
              <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
                Sample roadmap
              </div>
              <div className="mt-5 relative pl-8">
                <div className="absolute left-3 top-2 bottom-2 border-l-2 border-dashed border-[var(--pw-border)]" />
                {[
                  { t: "Foundations", s: "Stage 01", done: true },
                  { t: "Core Skills", s: "Stage 02", done: false },
                  { t: "Your Goal", s: "Stage 05", done: false, goal: true },
                ].map((n, i) => (
                  <div key={i} className="relative mb-6 last:mb-0">
                    <div
                      className="absolute -left-[22px] top-1 w-4 h-4 rounded-full"
                      style={{
                        background: n.done ? "var(--pw-accent)" : "var(--pw-surface)",
                        border: "2px solid " + (n.goal ? "var(--pw-accent-2)" : "var(--pw-border)"),
                      }}
                    />
                    <div className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">{n.s}</div>
                    <div className="font-display text-[18px] leading-tight">{n.t}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-[var(--pw-ink-2)]">Built from your quiz results.</div>
            </div>
          </aside>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-16">
          <div className="animate-chev text-[var(--pw-ink-2)] text-2xl">⌄</div>
        </div>

        {/* Two-path entry */}
        <section className="max-w-5xl mx-auto mt-20" id="get-started">
          <div className="text-center">
            <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Choose your path</div>
            <h2 className="font-display text-[32px] sm:text-[40px] mt-2">Are you here to learn or to teach?</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            <PathCard
              emoji="🎓"
              title="I'm a Student"
              points={[
                "Take a free 3-min level quiz",
                "Or jump into the tutor-match quiz",
                "Match with a verified tutor",
              ]}
              cta={isStudent ? "Find a tutor →" : "Start as a Student →"}
              onClick={isStudent ? () => { window.location.href = "/find-tutor"; } : openLogin}
            />
            <PathCard
              emoji="👨‍🏫"
              title="I'm a Tutor"
              points={["Build your verified tutor profile", "Connect with matched students", "Track sessions and earnings"]}
              cta={isTutor ? "Open dashboard →" : "Join as a Tutor →"}
              onClick={isTutor ? () => { window.location.href = "/dashboard"; } : openLogin}
            />
          </div>
        </section>
      </main>
      <DemoBanner />
    </div>
  );
}

function PathCard({
  emoji,
  title,
  points,
  cta,
  onClick,
}: {
  emoji: string;
  title: string;
  points: string[];
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="pw-card p-7 flex flex-col">
      <div className="text-3xl">{emoji}</div>
      <h3 className="font-display text-[24px] mt-3">{title}</h3>
      <ul className="mt-4 space-y-2 text-[14px] text-[var(--pw-ink-2)]">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span style={{ color: "var(--pw-accent)" }}>✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClick}
        className="pw-btn-primary mt-6 inline-flex justify-center items-center px-5 py-3 text-[15px] font-medium"
      >
        {cta}
      </button>
    </div>
  );
}
