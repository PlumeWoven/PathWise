import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate } from "../pathwise/RoleGate";
import { Icon, type IconName } from "@/components/Icon";
import { formatPrice } from "../pathwise/sessions";

export const Route = createFileRoute("/_app/find-tutor")({
  head: () => ({
    meta: [
      { title: "Find a tutor · PathWise" },
      {
        name: "description",
        content: "Answer 8 questions and we'll rank verified tutors by how well they fit you.",
      },
      { property: "og:title", content: "Find a tutor · PathWise" },
      {
        property: "og:description",
        content: "Answer 8 questions and we'll rank verified tutors by how well they fit you.",
      },
      { property: "og:url", content: "/find-tutor" },
    ],
    links: [{ rel: "canonical", href: "/find-tutor" }],
  }),
  component: FindTutorPage,
});

// ---------- Types ----------
type Subject =
  | "math"
  | "science"
  | "languages"
  | "coding"
  | "test_prep"
  | "music"
  | "writing"
  | "art";
type Goal = "ace_exam" | "master_skill" | "build_confidence" | "get_ahead" | "homework";
type Style = "visual" | "auditory" | "kinesthetic";
type TimeOfDay = "early_bird" | "midday" | "night_owl" | "weekend";
type Level = "beginner" | "intermediate" | "advanced";
type Frequency = "weekly" | "biweekly" | "intensive" | "flexible";

interface Answers {
  subject?: Subject;
  multi_subject?: boolean;
  goal?: Goal;
  learning_style?: Style;
  pace?: number; // 1-5
  time_of_day?: TimeOfDay;
  experience_level?: Level;
  frequency?: Frequency;
  budget_max?: number; // hourly cap
}

const STORAGE_KEY = "pw_find_tutor_answers";

// ---------- Page ----------
function FindTutorPage() {
  return (
    <RoleGate allow={["student", "both"]} allowAnonymous>
      <FindTutorPageInner />
    </RoleGate>
  );
}

function FindTutorPageInner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0..7 questions, 8 = results
  const [answers, setAnswers] = useState<Answers>({});
  const [direction, setDirection] = useState<1 | -1>(1);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      /* ignore */
    }
  }, [answers]);

  const totalQ = 8;
  const isResults = step >= totalQ;
  const progress = isResults ? 100 : (step / totalQ) * 100;

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => {
    setAnswers((a) => ({ ...a, [k]: v }));
  };

  const next = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };
  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  // Save to DB when reaching results
  useEffect(() => {
    if (!isResults || !user) return;
    (async () => {
      const payload = {
        user_id: user.id,
        subject: answers.subject ?? null,
        multi_subject: !!answers.multi_subject,
        goal: answers.goal ?? null,
        learning_style: answers.learning_style ?? null,
        pace: answers.pace ?? null,
        time_of_day: answers.time_of_day ?? null,
        experience_level: answers.experience_level ?? null,
        frequency: answers.frequency ?? null,
        budget_max: answers.budget_max ?? null,
        traits: deriveTraits(answers),
      };
      const { error } = await supabase
        .from("user_learning_profiles")
        .upsert(payload, { onConflict: "user_id" });
      if (error) {
        console.error("[find-tutor] save failed", error);
        toast.error("Your answers weren't saved to your account. Your matches below still use them.");
      }
    })();
  }, [isResults, user, answers]);

  return (
    <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      {/* Progress bar */}
      <div className="sticky top-(--pw-header-h) z-30 bg-[var(--pw-bg)]/90 backdrop-blur border-b border-[var(--pw-border)]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-[var(--pw-ink-2)]">
            <span className="label-caps">
              {isResults
                ? `${totalQ} of ${totalQ} answered`
                : `Question ${step + 1} of ${totalQ}`}
            </span>
            {!isResults && step > 0 && (
              <button
                onClick={back}
                className="text-[0.8125rem] font-semibold hover:text-[var(--pw-ink)] transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="mt-2 pw-progress">
            <motion.div
              className="pw-progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <main className="relative px-6 py-12 max-w-2xl mx-auto">
        {/* popLayout, not "wait": the next question mounts while the old one leaves. */}
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {step === 0 && <Q1 value={answers} onChange={set} onNext={next} />}
            {step === 1 && (
              <Q2
                value={answers.goal}
                onChange={(v) => {
                  set("goal", v);
                  next();
                }}
              />
            )}
            {step === 2 && (
              <Q3
                value={answers.learning_style}
                onChange={(v) => {
                  set("learning_style", v);
                  next();
                }}
              />
            )}
            {step === 3 && (
              <Q4 value={answers.pace ?? 3} onChange={(v) => set("pace", v)} onNext={next} />
            )}
            {step === 4 && (
              <Q5
                value={answers.time_of_day}
                onChange={(v) => {
                  set("time_of_day", v);
                  next();
                }}
              />
            )}
            {step === 5 && (
              <Q6
                value={answers.experience_level}
                subject={answers.subject}
                onChange={(v) => {
                  set("experience_level", v);
                  next();
                }}
              />
            )}
            {step === 6 && (
              <Q7
                value={answers.frequency}
                onChange={(v) => {
                  set("frequency", v);
                  next();
                }}
              />
            )}
            {step === 7 && (
              <Q8
                value={answers.budget_max ?? 300}
                onChange={(v) => set("budget_max", v)}
                onNext={next}
              />
            )}
            {isResults && (
              <Results
                answers={answers}
                onRestart={() => {
                  setStep(0);
                  setAnswers({});
                  localStorage.removeItem(STORAGE_KEY);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ---------- Q1: Subject ----------
const SUBJECTS: { id: Subject; label: string; icon: IconName }[] = [
  { id: "math", label: "Math", icon: "math" },
  { id: "science", label: "Science", icon: "science" },
  { id: "languages", label: "Languages", icon: "languages" },
  { id: "coding", label: "Coding", icon: "coding" },
  { id: "test_prep", label: "Test prep", icon: "notes" },
  { id: "music", label: "Music", icon: "music" },
  { id: "writing", label: "Writing", icon: "writing" },
  { id: "art", label: "Art", icon: "art" },
];

function Q1({
  value,
  onChange,
  onNext,
}: {
  value: Answers;
  onChange: <K extends keyof Answers>(k: K, v: Answers[K]) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <Heading title="Which subject do you need help with?" />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {SUBJECTS.map((s) => {
          const active = value.subject === s.id;
          return (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                onChange("subject", s.id);
                onChange("multi_subject", false);
                onNext();
              }}
              className={`pw-card p-4 flex flex-col items-center text-center transition-colors hover:border-[var(--pw-ink)] ${active ? "border-[var(--pw-ink)] ring-1 ring-[var(--pw-accent)]" : ""}`}
            >
              <Icon name={s.icon} className="h-10 w-10" />
              <span className="mt-2 text-[0.875rem] font-semibold">{s.label}</span>
            </motion.button>
          );
        })}
      </div>
      <button
        onClick={() => {
          onChange("multi_subject", true);
          onChange("subject", undefined);
          onNext();
        }}
        className="mt-6 w-full pw-btn-outline px-4 py-4"
        style={
          value.multi_subject
            ? { background: "var(--pw-accent-soft)", borderColor: "var(--pw-ink)" }
            : undefined
        }
      >
        I need help with multiple subjects
      </button>
    </div>
  );
}

// ---------- Q2: Goal ----------
const GOALS: { id: Goal; label: string; icon: IconName; desc: string }[] = [
  { id: "ace_exam", label: "Pass an exam", icon: "trophy", desc: "Prepare for a test or exam" },
  {
    id: "master_skill",
    label: "Learn one topic well",
    icon: "target",
    desc: "Go through it step by step",
  },
  {
    id: "build_confidence",
    label: "Build confidence",
    icon: "thumbsUp",
    desc: "Feel sure of the basics",
  },
  { id: "get_ahead", label: "Get ahead", icon: "rocket", desc: "Learn ahead of your class" },
  { id: "homework", label: "Homework help", icon: "books", desc: "Get help with assignments" },
];
function Q2({ value, onChange }: { value?: Goal; onChange: (v: Goal) => void }) {
  return (
    <div>
      <Heading title="What's your goal?" />
      <div className="mt-6 space-y-4">
        {GOALS.map((g) => (
          <motion.button
            key={g.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(g.id)}
            className={`w-full pw-card p-4 flex items-center gap-4 text-left transition-colors hover:border-[var(--pw-ink)] ${value === g.id ? "border-[var(--pw-ink)] ring-1 ring-[var(--pw-accent)]" : ""}`}
          >
            <Icon name={g.icon} className="h-10 w-10" />
            <div>
              <div className="font-display tracking-[-0.025em] text-[1rem]">{g.label}</div>
              <div className="text-[0.8125rem] text-[var(--pw-ink-2)]">{g.desc}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q3: Learning Style ----------
const STYLES: { id: Style; label: string; sub: string; icon: IconName }[] = [
  { id: "visual", label: "Show me", sub: "Visual learner", icon: "eye" },
  { id: "auditory", label: "Tell me", sub: "Auditory learner", icon: "ear" },
  { id: "kinesthetic", label: "Let me try", sub: "Kinesthetic", icon: "hand" },
];
function Q3({ value, onChange }: { value?: Style; onChange: (v: Style) => void }) {
  return (
    <div>
      <Heading title="How do you like to learn?" />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STYLES.map((s) => (
          <motion.button
            key={s.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(s.id)}
            className={`pw-card p-6 text-center transition-colors hover:border-[var(--pw-ink)] ${value === s.id ? "border-[var(--pw-ink)] ring-1 ring-[var(--pw-accent)]" : ""}`}
          >
            <div className="flex justify-center">
              <Icon name={s.icon} className="h-12 w-12" />
            </div>
            <div className="mt-4 font-display text-[1.25rem] tracking-[-0.025em]">
              {s.label}
            </div>
            <div className="text-[0.75rem] text-[var(--pw-ink-2)] mt-0">{s.sub}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q4: Pace slider ----------
const PACE_LABELS = ["Slow", "Fairly slow", "Medium", "Fairly fast", "Fast"];
function Q4({
  value,
  onChange,
  onNext,
}: {
  value: number;
  onChange: (v: number) => void;
  onNext: () => void;
}) {
  const pct = ((value - 1) / 4) * 100;
  return (
    <div>
      <Heading title="What's your pace?" />
      <div className="mt-12 px-2">
        <div className="flex items-center justify-between text-[0.75rem] text-[var(--pw-ink-2)]">
          <span className="inline-flex items-center gap-2">
            <Icon name="slow" className="h-4 w-4" /> Slower
          </span>
          <span className="inline-flex items-center gap-2">
            Faster <Icon name="fast" className="h-4 w-4" />
          </span>
        </div>
        <div className="relative mt-4">
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label="Learning pace"
            aria-valuetext={PACE_LABELS[value - 1]}
            className="w-full accent-[var(--pw-accent)]"
          />
          <motion.div
            className="absolute -top-12"
            animate={{ left: `calc(${pct}% - 20px)` }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <Icon
              name={value <= 2 ? "slow" : value === 3 ? "steady" : "fast"}
              className="h-10 w-10"
            />
          </motion.div>
        </div>
        <div className="mt-6 text-center text-[0.875rem] text-[var(--pw-ink-2)]">
          {PACE_LABELS[value - 1]}
        </div>
      </div>
      <button onClick={onNext} className="mt-12 w-full pw-btn-primary px-6 py-4">
        Continue →
      </button>
    </div>
  );
}

// ---------- Q5: Time of day ----------
const TIMES: { id: TimeOfDay; label: string; icon: IconName }[] = [
  { id: "early_bird", label: "Mornings", icon: "sunrise" },
  { id: "midday", label: "Midday", icon: "sun" },
  { id: "night_owl", label: "Evenings", icon: "moon" },
  { id: "weekend", label: "Weekends", icon: "party" },
];
function Q5({ value, onChange }: { value?: TimeOfDay; onChange: (v: TimeOfDay) => void }) {
  return (
    <div>
      <Heading title="When do you learn best?" />
      <div className="mt-6 grid grid-cols-2 gap-4">
        {TIMES.map((t) => (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(t.id)}
            className={`pw-card p-6 text-center transition-colors hover:border-[var(--pw-ink)] ${value === t.id ? "border-[var(--pw-ink)] ring-1 ring-[var(--pw-accent)]" : ""}`}
          >
            <div className="flex justify-center">
              <Icon name={t.icon} className="h-10 w-10" />
            </div>
            <div className="mt-2 font-display tracking-[-0.025em] text-[0.9375rem]">
              {t.label}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q6: Experience ----------
function Q6({
  value,
  subject,
  onChange,
}: {
  value?: Level;
  subject?: Subject;
  onChange: (v: Level) => void;
}) {
  const subjLabel = subject
    ? (SUBJECTS.find((s) => s.id === subject)?.label.toLowerCase() ?? "this subject")
    : "this subject";
  const levels: { id: Level; label: string; desc: string }[] = [
    { id: "beginner", label: "Beginner", desc: `Just getting started with ${subjLabel}` },
    {
      id: "intermediate",
      label: "Intermediate",
      desc: `Comfortable with the basics of ${subjLabel}`,
    },
    { id: "advanced", label: "Advanced", desc: `Ready for deep dives into ${subjLabel}` },
  ];
  return (
    <div>
      <Heading title="What's your experience level?" />
      <div className="mt-6 space-y-4">
        {levels.map((l) => (
          <motion.button
            key={l.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(l.id)}
            className={`w-full pw-card p-6 text-left transition-colors hover:border-[var(--pw-ink)] ${value === l.id ? "border-[var(--pw-ink)] ring-1 ring-[var(--pw-accent)]" : ""}`}
          >
            <div className="font-display tracking-[-0.025em] text-[1rem]">{l.label}</div>
            <div className="text-[0.8125rem] text-[var(--pw-ink-2)] mt-0">{l.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q7: Frequency ----------
const FREQS: { id: Frequency; label: string; icon: IconName }[] = [
  { id: "weekly", label: "Once a week", icon: "calendar" },
  { id: "biweekly", label: "Twice a week", icon: "momentum" },
  { id: "intensive", label: "3 or more a week", icon: "flame" },
  { id: "flexible", label: "Flexible", icon: "flow" },
];
function Q7({ value, onChange }: { value?: Frequency; onChange: (v: Frequency) => void }) {
  return (
    <div>
      <Heading title="How often do you want sessions?" />
      <div className="mt-6 grid grid-cols-2 gap-4">
        {FREQS.map((f) => (
          <motion.button
            key={f.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(f.id)}
            className={`pw-card p-6 text-center transition-colors hover:border-[var(--pw-ink)] ${value === f.id ? "border-[var(--pw-ink)] ring-1 ring-[var(--pw-accent)]" : ""}`}
          >
            <div className="flex justify-center">
              <Icon name={f.icon} className="h-10 w-10" />
            </div>
            <div className="mt-2 font-display tracking-[-0.025em] text-[0.9375rem]">
              {f.label}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q8: Budget ----------
function Q8({
  value,
  onChange,
  onNext,
}: {
  value: number;
  onChange: (v: number) => void;
  onNext: () => void;
}) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { count: c } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .in("role", ["tutor", "both"])
        .eq("verification_status", "verified")
        // The top stop means "1000 MDL or more", so it has no upper bound.
        .lte("hourly_rate", value >= 1000 ? Number.MAX_SAFE_INTEGER : value);
      if (!cancelled) setCount(c ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div>
      <Heading title="What's your budget per hour?" />
      <div className="mt-12 px-2">
        <div className="text-center font-display text-[3.5rem] tabular-nums">
          <span className="text-[1rem] text-[var(--pw-ink-2)] mr-2">up to</span>
          {formatPrice(value)}
          {value >= 1000 ? "+" : ""}
          <span className="text-[1rem] text-[var(--pw-ink-2)] ml-2">/hr</span>
        </div>
        <input
          type="range"
          min={100}
          max={1000}
          step={50}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Budget per hour"
          aria-valuetext={`${formatPrice(value)} per hour`}
          className="mt-6 w-full accent-[var(--pw-accent)]"
        />
        <div className="flex items-center justify-between text-[0.75rem] text-[var(--pw-ink-2)] mt-2">
          <span>{formatPrice(100)}</span>
          <span>{formatPrice(1000)}+</span>
        </div>
        <motion.div
          key={count ?? -1}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-6 text-center text-[0.875rem]"
        >
          <span className="font-display text-[1.375rem]">
            {count ?? "…"}
          </span>{" "}
          <span className="text-[var(--pw-ink-2)]">tutors available in your range</span>
        </motion.div>
      </div>
      <button onClick={onNext} className="mt-12 w-full pw-btn-primary px-6 py-4">
        See my matches →
      </button>
    </div>
  );
}

// ---------- Results ----------
function deriveTraits(a: Answers): string[] {
  const traits: string[] = [];
  if (a.learning_style === "visual") traits.push("Visual Explorer");
  if (a.learning_style === "auditory") traits.push("Active Listener");
  if (a.learning_style === "kinesthetic") traits.push("Hands-On Learner");
  if (a.pace != null) {
    if (a.pace <= 2) traits.push("Steady Pace");
    else if (a.pace === 3) traits.push("Balanced Pace");
    else traits.push("Fast Track");
  }
  if (a.goal === "ace_exam") traits.push("Goal-Focused");
  if (a.goal === "master_skill") traits.push("Skill-Builder");
  if (a.goal === "build_confidence") traits.push("Confidence-Seeker");
  if (a.goal === "get_ahead") traits.push("Ambitious");
  if (a.goal === "homework") traits.push("Practical");
  if (a.frequency === "intensive") traits.push("Deep Diver");
  if (a.time_of_day === "night_owl") traits.push("Night Thinker");
  if (a.time_of_day === "early_bird") traits.push("Morning Riser");
  return traits.slice(0, 4);
}

function Results({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const { user } = useAuth();

  const subjLabel = answers.subject
    ? SUBJECTS.find((s) => s.id === answers.subject)?.label
    : answers.multi_subject
      ? "Multiple subjects"
      : "Any subject";
  const labelOf = <T extends { id: string; label: string }>(list: T[], id?: string) =>
    list.find((x) => x.id === id)?.label ?? "—";

  return (
    <div className="pt-6">
      {/* Shown at once: the profile is derived synchronously (it sat behind a 1.8 s fake loader).
          The step slide is its only entrance. */}
      <div className="pw-card p-8">
        <h1 className="font-display text-[1.75rem] sm:text-[2rem] leading-tight">Your answers</h1>
        <div className="mt-6 grid grid-cols-2 gap-4 text-[0.8125rem]">
          <Field label="Subject" value={subjLabel ?? "—"} />
          <Field label="Goal" value={labelOf(GOALS, answers.goal)} />
          <Field
            label="Learning style"
            value={STYLES.find((x) => x.id === answers.learning_style)?.sub ?? "—"}
          />
          <Field label="Pace" value={answers.pace ? PACE_LABELS[answers.pace - 1] : "—"} />
          <Field label="Best time" value={labelOf(TIMES, answers.time_of_day)} />
          <Field label="Level" value={cap(answers.experience_level)} />
          <Field label="Sessions" value={labelOf(FREQS, answers.frequency)} />
          <Field
            label="Budget"
            value={answers.budget_max ? `Up to ${formatPrice(answers.budget_max)}/hr` : "—"}
          />
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/matches"
          search={(prev: Record<string, unknown>) => ({
            ...prev,
            subject: answers.subject,
            budget: answers.budget_max,
            level: answers.experience_level,
          })}
          className="pw-btn-primary text-center px-6 py-4"
        >
          View my matches →
        </Link>
        <button onClick={onRestart} className="pw-btn-outline px-6 py-4">
          Retake the quiz
        </button>
      </div>

      {!user && (
        <div className="mt-6 text-center text-[0.75rem] text-[var(--pw-ink-2)]">
          Your answers are saved locally. Sign up to keep them.
        </div>
      )}
    </div>
  );
}

// ---------- Tiny helpers ----------
function Heading({ title }: { title: string }) {
  return <h1 className="font-display text-[1.75rem] sm:text-[2rem] leading-tight">{title}</h1>;
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-caps text-[var(--pw-ink-2)]">{label}</div>
      <div className="font-medium mt-0">{value}</div>
    </div>
  );
}
function cap(s?: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
}
