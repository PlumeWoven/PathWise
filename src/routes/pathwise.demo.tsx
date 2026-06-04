import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "../components/dashboard/TutorSidebar";
import { DemoProvider, useDemo } from "../pathwise/DemoContext";
import { ExitDemoModal } from "../pathwise/ExitDemoModal";

const DEMO_CODES = ["PATHWISE2025", "DEMO", "LAUNCH"];

type DemoSearch = { as?: "tutor" | "student"; code?: string; ref?: string };

export const Route = createFileRoute("/pathwise/demo")({
  validateSearch: (s: Record<string, unknown>): DemoSearch => ({
    as: s.as === "student" || s.as === "tutor" ? s.as : undefined,
    code: typeof s.code === "string" ? s.code : undefined,
    ref: typeof s.ref === "string" ? s.ref : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pathwise Demo — Try the platform with sample data" },
      { name: "description", content: "Explore Pathwise as a tutor or student. No signup. Real-looking sample data." },
      { property: "og:title", content: "Pathwise Demo Mode" },
      { property: "og:description", content: "See the full tutor dashboard and student experience in 60 seconds." },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const search = useSearch({ from: "/pathwise/demo" }) as DemoSearch;
  const navigate = useNavigate();
  const codeOk = !search.code || DEMO_CODES.includes(search.code.toUpperCase());
  const [exitOpen, setExitOpen] = useState(false);

  if (!codeOk) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
        <div className="max-w-md mx-auto pt-24 px-5 text-center">
          <h1 className="font-display text-3xl">Invalid demo code</h1>
          <p className="mt-3 text-[var(--pw-ink-2)]">The code "{search.code}" isn't valid. Try the public demo instead.</p>
          <Link to="/demo" className="pw-btn-primary mt-6 inline-flex px-5 py-3">Open public demo</Link>
        </div>
      </div>
    );
  }

  return (
    <DemoProvider
      initialView={search.as ?? "tutor"}
      refCode={search.ref}
      onExit={() => setExitOpen(true)}
    >
      <DemoLayout
        onExitClick={() => setExitOpen(true)}
        onViewChange={(v) => navigate({ to: "/pathwise/demo", search: { ...search, as: v } })}
      />
      <ExitDemoModal open={exitOpen} onClose={() => setExitOpen(false)} />
    </DemoProvider>
  );
}

function DemoLayout({ onExitClick, onViewChange }: { onExitClick: () => void; onViewChange: (v: "tutor" | "student") => void }) {
  const { view, setView, data } = useDemo();
  const handleSetView = (v: "tutor" | "student") => {
    setView(v);
    onViewChange(v);
  };

  return (
    <DashboardShell
      role={view}
      user={
        view === "tutor"
          ? { name: data.tutor.name, subtitle: data.tutor.headline }
          : { name: "Sample Student", subtitle: "Exploring Pathwise" }
      }
      isDemo
      banner={<DemoBar setView={handleSetView} onExitClick={onExitClick} />}
      onExit={onExitClick}
    >
      {view === "tutor" ? <TutorDemo /> : <StudentDemo />}
      <PersistentSignupLink />
      <ConvertCTA />
      <MobileViewSwitch view={view} setView={handleSetView} />
    </DashboardShell>
  );
}

function DemoBar({ setView, onExitClick }: { setView: (v: "tutor" | "student") => void; onExitClick: () => void }) {
  const { view, remaining, warning, expired, shareLink } = useDemo();
  const tone = expired ? "var(--pw-danger)" : warning ? "#b45309" : "var(--pw-accent)";
  const bg = expired
    ? "color-mix(in oklab, var(--pw-danger) 12%, transparent)"
    : warning
    ? "#fff7ed"
    : "var(--pw-accent-soft)";

  if (expired) {
    return (
      <div className="px-5 sm:px-8 pt-14 lg:pt-4">
        <div className="max-w-7xl mx-auto pw-card px-4 py-3 flex flex-wrap items-center gap-3 justify-between" style={{ background: bg, borderColor: tone }}>
          <div className="flex items-center gap-2 text-[12px]">
            <span className="px-2 py-0.5 rounded-full font-mono-pw uppercase tracking-wider" style={{ background: "color-mix(in oklab, var(--pw-danger) 18%, transparent)", color: tone }}>Demo expired</span>
            <span className="text-[var(--pw-ink-2)]">Sign up to keep exploring with your own data.</span>
          </div>
          <button onClick={onExitClick} className="pw-btn-primary text-[12px] px-3 py-1.5">Sign up to continue →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-8 pt-14 lg:pt-4">
      <div className="max-w-7xl mx-auto pw-card px-4 py-3 flex flex-wrap items-center gap-3 justify-between" style={{ background: bg, borderColor: warning ? tone : undefined }}>
        <div className="flex items-center gap-2 text-[12px] min-w-0">
          <span className="px-2 py-0.5 rounded-full font-mono-pw uppercase tracking-wider shrink-0" style={{ background: `color-mix(in oklab, ${tone} 15%, transparent)`, color: tone }}>Demo</span>
          <span className="text-[var(--pw-ink-2)] truncate">
            <span className="hidden sm:inline">Sample data · </span>expires in <span className="font-mono-pw" style={{ color: tone }}>{remaining}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:inline-flex rounded-lg border border-[var(--pw-border)] p-0.5 bg-[var(--pw-surface)]">
            <button onClick={() => setView("tutor")} className={`px-3 py-1.5 text-[13px] rounded-md ${view === "tutor" ? "bg-[var(--pw-accent)] text-white" : "text-[var(--pw-ink-2)]"}`}>Tutor view</button>
            <button onClick={() => setView("student")} className={`px-3 py-1.5 text-[13px] rounded-md ${view === "student" ? "bg-[var(--pw-accent)] text-white" : "text-[var(--pw-ink-2)]"}`}>Student view</button>
          </div>
          <button onClick={shareLink} className="pw-btn-outline text-[12px] px-3 py-1.5">Share demo</button>
        </div>
      </div>
    </div>
  );
}

// Mobile-only floating tutor/student tab bar (sm and down)
function MobileViewSwitch({ view, setView }: { view: "tutor" | "student"; setView: (v: "tutor" | "student") => void }) {
  return (
    <div className="sm:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 inline-flex rounded-full border border-[var(--pw-border)] bg-[var(--pw-surface)] shadow-lg p-1">
      <button onClick={() => setView("tutor")} className={`px-4 py-2 text-[13px] rounded-full ${view === "tutor" ? "bg-[var(--pw-accent)] text-white" : "text-[var(--pw-ink-2)]"}`}>Tutor</button>
      <button onClick={() => setView("student")} className={`px-4 py-2 text-[13px] rounded-full ${view === "student" ? "bg-[var(--pw-accent)] text-white" : "text-[var(--pw-ink-2)]"}`}>Student</button>
    </div>
  );
}

function PersistentSignupLink() {
  const { exitDemo } = useDemo();
  return (
    <div className="mt-10 text-center">
      <button onClick={exitDemo} className="text-[13px] text-[var(--pw-accent)] hover:underline">
        Sign up for free →
      </button>
    </div>
  );
}

function TutorDemo() {
  const { data, lockedFeature, viewsForRef } = useDemo();
  const { tutor, courses, messages, sessions, review, earnings } = data;
  const totalEarnings = earnings.reduce((a, b) => a + b, 0);
  const max = Math.max(...earnings);
  const search = useSearch({ from: "/pathwise/demo" }) as DemoSearch;
  const refViews = search.ref ? viewsForRef(search.ref) : 0;

  return (
    <div className="space-y-8 mt-6">
      {/* Profile header — no avatar */}
      <div className="pw-card p-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-display text-[26px] leading-tight">{tutor.name}</h1>
          <span
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[var(--pw-accent)]/15 text-[var(--pw-accent)]"
            title="Verified tutor"
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M6.5 10.5L4 8l1-1 1.5 1.5L11 4l1 1-5.5 5.5z"/></svg>
            Verified
          </span>
        </div>
        <p className="mt-1 text-[14px] text-[var(--pw-ink-2)]">{tutor.headline}</p>
        <p className="mt-4 text-[14px] leading-relaxed max-w-2xl">{tutor.bio}</p>
        <ul className="mt-5 space-y-2">
          {tutor.credentials.map((c) => (
            <li key={c} className="flex items-center gap-3 text-[13px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--pw-accent)] shrink-0" />
              <span>{c}</span>
            </li>
          ))}
        </ul>

        {search.ref && (
          <div className="mt-5 text-[12px] text-[var(--pw-ink-2)] pt-4 border-t border-[var(--pw-border)]">
            🔗 Your demo link <span className="font-mono-pw text-[var(--pw-ink)]">{search.ref}</span> has been viewed <span className="font-mono-pw text-[var(--pw-ink)]">{refViews}</span> {refViews === 1 ? "time" : "times"}.
          </div>
        )}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total earnings" value={`€${totalEarnings.toLocaleString()}`} delta="+18% MoM" />
        <Kpi label="Active students" value={String(tutor.students)} delta="+12 this month" />
        <Kpi label="Avg rating" value={tutor.rating.toFixed(1)} delta={`${tutor.reviews} reviews`} />
        <Kpi label="Course completion" value="65%" delta="+5pp vs avg" />
      </div>

      {/* Earnings chart */}
      <section className="pw-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[20px]">Earnings · last 12 months</h2>
          <span className="text-[12px] text-[var(--pw-ink-2)]">€ MDL equivalent</span>
        </div>
        <div className="mt-5 flex items-end gap-2 h-40">
          {earnings.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all hover:opacity-80"
                style={{ height: `${(v / max) * 100}%`, background: "linear-gradient(180deg, var(--pw-accent), var(--pw-accent-2))" }}
                title={`€${v}`}
              />
              <span className="text-[10px] text-[var(--pw-ink-2)] font-mono-pw">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Two-column: messages + sessions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="pw-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[18px]">Messages</h2>
            <span className="text-[11px] text-[var(--pw-ink-2)]">2 unread</span>
          </div>
          <ul className="mt-4 space-y-3">
            {messages.map(m => (
              <li
                key={m.id}
                onClick={() => lockedFeature("the inbox")}
                className="flex gap-3 p-3 rounded-lg hover:bg-[var(--pw-surface-2)] cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium text-white" style={{ background: "linear-gradient(135deg, var(--pw-accent), var(--pw-accent-2))" }}>{m.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-medium truncate">{m.from}</span>
                    <span className="text-[11px] text-[var(--pw-ink-2)] shrink-0">{m.time}</span>
                  </div>
                  <p className="text-[13px] text-[var(--pw-ink-2)] truncate">{m.preview}</p>
                </div>
                {m.unread && <span className="w-2 h-2 rounded-full bg-[var(--pw-accent)] mt-2" />}
              </li>
            ))}
          </ul>
        </section>

        <section className="pw-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[18px]">Upcoming sessions</h2>
            <span className="text-[11px] text-[var(--pw-ink-2)]">{sessions.length} this week</span>
          </div>
          <ul className="mt-4 space-y-3">
            {sessions.map(s => (
              <li key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--pw-border)]">
                <div className="w-1 h-10 rounded-full bg-[var(--pw-accent)]" />
                <div className="flex-1">
                  <div className="text-[14px] font-medium">{s.topic}</div>
                  <div className="text-[12px] text-[var(--pw-ink-2)]">with {s.student} · {s.duration} min</div>
                </div>
                <div className="text-[12px] font-mono-pw text-right">{s.when}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[20px]">My courses</h2>
          <button onClick={() => lockedFeature("course creation")} className="pw-btn-outline text-[12px] px-3 py-1.5">+ New course</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map(c => (
            <div key={c.id} className="pw-card overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="h-32" style={{ background: c.thumb }} />
              <div className="p-5">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)]">{c.category}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600">Published</span>
                </div>
                <h3 className="mt-2 font-display text-[16px] leading-tight">{c.title}</h3>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[var(--pw-ink-2)]">
                  <div><div className="text-[var(--pw-ink)] text-[14px] font-medium">{c.students}</div>students</div>
                  <div><div className="text-[var(--pw-ink)] text-[14px] font-medium">★ {c.rating}</div>{c.reviews} reviews</div>
                  <div><div className="text-[var(--pw-ink)] text-[14px] font-medium">{c.completion}%</div>completion</div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-[var(--pw-surface-2)]">
                  <div className="h-full rounded-full bg-[var(--pw-accent)]" style={{ width: `${c.completion}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-[var(--pw-ink-2)] italic">Demo mode — changes won't be saved.</p>
      </section>

      {/* Recent review */}
      <section className="pw-card p-6">
        <h2 className="font-display text-[18px]">Recent review</h2>
        <div className="mt-3 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] text-white font-medium" style={{ background: "linear-gradient(135deg, var(--pw-accent), var(--pw-accent-2))" }}>MP</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-medium">{review.student}</span>
              <span className="text-amber-500 text-[12px]">{"★".repeat(review.rating)}</span>
              <span className="text-[11px] text-[var(--pw-ink-2)]">on {review.course}</span>
            </div>
            <p className="mt-1 text-[14px] text-[var(--pw-ink-2)]">"{review.body}"</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StudentDemo() {
  const { data, lockedFeature } = useDemo();
  const { courses, tutor } = data;
  const [enrolled, setEnrolled] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <div className="space-y-8 mt-6">
      <div>
        <h1 className="font-display text-[28px]">Browse courses</h1>
        <p className="text-[14px] text-[var(--pw-ink-2)] mt-1">This is what students see when exploring Pathwise.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {courses.map(c => (
          <div key={c.id} className="pw-card overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all">
            <div className="h-36" style={{ background: c.thumb }} />
            <div className="p-5">
              <div className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)] inline-block">{c.category}</div>
              <h3 className="mt-2 font-display text-[17px] leading-tight">{c.title}</h3>
              <p className="mt-1 text-[12px] text-[var(--pw-ink-2)]">by {tutor.name}</p>
              <div className="mt-2 flex items-center gap-3 text-[12px] text-[var(--pw-ink-2)] flex-wrap">
                <span>★ {c.rating} ({c.reviews})</span>
                <span>· {c.students} students</span>
                <span>· {c.lessons} lessons · {c.hours}h</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  {c.discount ? (
                    <>
                      <span className="font-display text-[20px]">€{c.discount}</span>
                      <span className="text-[12px] text-[var(--pw-ink-2)] line-through">€{c.price}</span>
                    </>
                  ) : (
                    <span className="font-display text-[20px]">€{c.price}</span>
                  )}
                </div>
                <button
                  onClick={() => setEnrolled(c.id)}
                  className={enrolled === c.id ? "pw-btn-outline text-[12px] px-3 py-1.5" : "pw-btn-primary text-[12px] px-3 py-1.5"}
                >
                  {enrolled === c.id ? "✓ Enrolled" : "Enroll"}
                </button>
              </div>
              <p className="mt-2 text-[10px] text-[var(--pw-ink-2)] italic">Demo mode — payment disabled</p>
            </div>
          </div>
        ))}
      </div>

      {enrolled && (
        <section className="pw-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[20px]">Continue learning</h2>
            <span className="text-[11px] text-[var(--pw-ink-2)]">Lesson 3 of 42</span>
          </div>
          <div className="mt-4 aspect-video rounded-lg bg-black overflow-hidden flex items-center justify-center relative">
            {playing ? (
              <div className="text-white/70 text-sm">▶ Playing sample lesson…</div>
            ) : (
              <button onClick={() => setPlaying(true)} className="w-16 h-16 rounded-full bg-white/90 text-black flex items-center justify-center text-2xl">▶</button>
            )}
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-[var(--pw-surface-2)]">
            <div className="h-full rounded-full bg-[var(--pw-accent)]" style={{ width: "12%" }} />
          </div>
          <p className="mt-2 text-[12px] text-[var(--pw-ink-2)]">12% complete · keep going to earn your certificate</p>
          <button onClick={() => lockedFeature("certificates")} className="mt-3 text-[12px] text-[var(--pw-accent)] hover:underline">Get my certificate →</button>
        </section>
      )}
    </div>
  );
}

function Kpi({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="pw-card p-5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--pw-accent)]/40 cursor-default">
      <div className="text-[11px] uppercase tracking-wider text-[var(--pw-ink-2)] font-mono-pw">{label}</div>
      <div className="font-display text-[26px] mt-1">{value}</div>
      <div className="text-[11px] text-emerald-600 mt-1">{delta}</div>
    </div>
  );
}

function ConvertCTA() {
  const { exitDemo } = useDemo();
  return (
    <section className="mt-12 pw-card p-8 text-center" style={{ background: "linear-gradient(135deg, var(--pw-accent-soft), var(--pw-surface))" }}>
      <div className="font-mono-pw text-[11px] uppercase tracking-wider text-[var(--pw-ink-2)]">You're in demo mode</div>
      <h2 className="mt-2 font-display text-[28px]">Ready to make it real?</h2>
      <p className="mt-2 text-[14px] text-[var(--pw-ink-2)] max-w-lg mx-auto">
        Sign up to keep your courses, students, and earnings. Free to start — no credit card.
      </p>
      <div className="mt-5 flex gap-3 justify-center flex-wrap">
        <button onClick={exitDemo} className="pw-btn-primary px-6 py-3 text-[14px]">Create my real account →</button>
        <Link to="/" className="pw-btn-outline px-6 py-3 text-[14px]">Back to home</Link>
      </div>
      <p className="mt-4 text-[11px] text-[var(--pw-ink-2)]">Demo data is not saved. Sessions reset after 1 hour.</p>
    </section>
  );
}
