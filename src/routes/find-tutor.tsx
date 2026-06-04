import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate } from "../pathwise/RoleGate";

export const Route = createFileRoute("/find-tutor")({
  head: () => ({
    meta: [
      { title: "Find Your Tutor — PathWise" },
      { name: "description", content: "Take a quick 8-question quiz and we'll match you with the perfect tutor." },
      { property: "og:title", content: "Find Your Tutor — PathWise" },
      { property: "og:description", content: "Take a quick 8-question quiz and we'll match you with the perfect tutor." },
      { property: "og:url", content: "/find-tutor" },
    ],
    links: [{ rel: "canonical", href: "/find-tutor" }],
  }),
  component: FindTutorPage,
});

// ---------- Types ----------
type Subject = "math" | "science" | "languages" | "coding" | "test_prep" | "music" | "writing" | "art";
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
    } catch {}
  }, []);

  // Persist on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch {}
  }, [answers]);

  const totalQ = 8;
  const isResults = step >= totalQ;
  const progress = isResults ? 100 : (step / totalQ) * 100;

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => {
    setAnswers(a => ({ ...a, [k]: v }));
  };

  const next = () => { setDirection(1); setStep(s => s + 1); };
  const back = () => { setDirection(-1); setStep(s => Math.max(0, s - 1)); };

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
        toast.error("Couldn't save your profile, but here are your matches!");
      }
    })();
  }, [isResults, user, answers]);

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />

      {/* Progress bar */}
      <div className="sticky top-0 z-30 bg-[var(--pw-bg)]/90 backdrop-blur border-b border-[var(--pw-border)]">
        <div className="max-w-2xl mx-auto px-5 py-3">
          <div className="flex items-center justify-between text-[11px] font-mono-pw uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
            <span>{isResults ? "Your profile" : `Question ${step + 1} of ${totalQ}`}</span>
            {!isResults && step > 0 && (
              <button onClick={back} className="hover:text-[var(--pw-ink)] transition">← Back</button>
            )}
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--pw-surface-2)] overflow-hidden">
            <motion.div
              className="h-full"
              style={{ background: "var(--pw-accent)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <main className="px-5 py-10 max-w-2xl mx-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {step === 0 && <Q1 value={answers} onChange={set} onNext={next} />}
            {step === 1 && <Q2 value={answers.goal} onChange={(v) => { set("goal", v); next(); }} />}
            {step === 2 && <Q3 value={answers.learning_style} onChange={(v) => { set("learning_style", v); next(); }} />}
            {step === 3 && <Q4 value={answers.pace ?? 3} onChange={(v) => set("pace", v)} onNext={next} />}
            {step === 4 && <Q5 value={answers.time_of_day} onChange={(v) => { set("time_of_day", v); next(); }} />}
            {step === 5 && <Q6 value={answers.experience_level} subject={answers.subject} onChange={(v) => { set("experience_level", v); next(); }} />}
            {step === 6 && <Q7 value={answers.frequency} onChange={(v) => { set("frequency", v); next(); }} />}
            {step === 7 && <Q8 value={answers.budget_max ?? 50} onChange={(v) => set("budget_max", v)} onNext={next} />}
            {isResults && <Results answers={answers} onRestart={() => { setStep(0); setAnswers({}); localStorage.removeItem(STORAGE_KEY); }} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ---------- Q1: Subject ----------
const SUBJECTS: { id: Subject; label: string; emoji: string }[] = [
  { id: "math", label: "Math", emoji: "🔢" },
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "languages", label: "Languages", emoji: "🗣️" },
  { id: "coding", label: "Coding", emoji: "💻" },
  { id: "test_prep", label: "Test prep", emoji: "📝" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "writing", label: "Writing", emoji: "✍️" },
  { id: "art", label: "Art", emoji: "🎨" },
];

function Q1({
  value, onChange, onNext,
}: {
  value: Answers;
  onChange: <K extends keyof Answers>(k: K, v: Answers[K]) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <Heading kicker="01" title="What subject brings you here today?" />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SUBJECTS.map((s, i) => {
          const active = value.subject === s.id;
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { onChange("subject", s.id); onChange("multi_subject", false); setTimeout(onNext, 200); }}
              className={`pw-card p-4 flex flex-col items-center text-center transition ${active ? "ring-2 ring-[var(--pw-accent)]" : ""}`}
            >
              <span className="text-[36px]" aria-hidden>{s.emoji}</span>
              <span className="mt-2 text-[13px] font-medium">{s.label}</span>
            </motion.button>
          );
        })}
      </div>
      <button
        onClick={() => { onChange("multi_subject", true); onChange("subject", undefined); setTimeout(onNext, 150); }}
        className={`mt-5 w-full pw-btn-outline px-4 py-3 text-[13px] ${value.multi_subject ? "bg-[var(--pw-accent-soft)]" : ""}`}
      >
        I need help with multiple subjects
      </button>
    </div>
  );
}

// ---------- Q2: Goal ----------
const GOALS: { id: Goal; label: string; emoji: string; desc: string }[] = [
  { id: "ace_exam", label: "Ace an exam", emoji: "🏆", desc: "Crush that upcoming test" },
  { id: "master_skill", label: "Master a skill", emoji: "🎯", desc: "Go deep, become great" },
  { id: "build_confidence", label: "Build confidence", emoji: "💪", desc: "Believe you can do it" },
  { id: "get_ahead", label: "Get ahead", emoji: "🚀", desc: "Stay one step in front" },
  { id: "homework", label: "Homework help", emoji: "📚", desc: "Tackle assignments together" },
];
function Q2({ value, onChange }: { value?: Goal; onChange: (v: Goal) => void }) {
  return (
    <div>
      <Heading kicker="02" title="What's your goal?" />
      <div className="mt-6 space-y-3">
        {GOALS.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
            onClick={() => onChange(g.id)}
            className={`w-full pw-card p-4 flex items-center gap-4 text-left transition ${value === g.id ? "ring-2 ring-[var(--pw-accent)]" : ""}`}
          >
            <span className="text-[40px]">{g.emoji}</span>
            <div>
              <div className="font-medium text-[16px]">{g.label}</div>
              <div className="text-[13px] text-[var(--pw-ink-2)]">{g.desc}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q3: Learning Style ----------
const STYLES: { id: Style; label: string; sub: string; emoji: string }[] = [
  { id: "visual", label: "Show me", sub: "Visual learner", emoji: "👁️" },
  { id: "auditory", label: "Tell me", sub: "Auditory learner", emoji: "👂" },
  { id: "kinesthetic", label: "Let me try", sub: "Kinesthetic", emoji: "✋" },
];
function Q3({ value, onChange }: { value?: Style; onChange: (v: Style) => void }) {
  return (
    <div>
      <Heading kicker="03" title="How do you like to learn?" />
      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        {STYLES.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}
            onClick={() => onChange(s.id)}
            className={`pw-card p-6 text-center ${value === s.id ? "ring-2 ring-[var(--pw-accent)]" : ""}`}
          >
            <motion.div className="text-[56px]" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}>
              {s.emoji}
            </motion.div>
            <div className="mt-3 font-display text-[20px]">{s.label}</div>
            <div className="text-[12px] text-[var(--pw-ink-2)] mt-0.5">{s.sub}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q4: Pace slider ----------
function Q4({ value, onChange, onNext }: { value: number; onChange: (v: number) => void; onNext: () => void }) {
  const pct = ((value - 1) / 4) * 100;
  return (
    <div>
      <Heading kicker="04" title="What's your pace?" />
      <div className="mt-10 px-2">
        <div className="flex items-center justify-between text-[12px] text-[var(--pw-ink-2)]">
          <span>🐢 I need time to absorb</span><span>Challenge me! 🐇</span>
        </div>
        <div className="relative mt-3">
          <input
            type="range" min={1} max={5} step={1} value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-[var(--pw-accent)]"
          />
          <motion.div
            className="absolute -top-12 text-[40px]"
            animate={{ left: `calc(${pct}% - 20px)` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {value <= 2 ? "🐢" : value === 3 ? "🐎" : "🐇"}
          </motion.div>
        </div>
        <div className="mt-6 text-center text-[14px] text-[var(--pw-ink-2)]">
          {["Take it slow", "Easygoing", "Just right", "Push me", "Sprint mode"][value - 1]}
        </div>
      </div>
      <button onClick={onNext} className="mt-10 w-full pw-btn-primary px-5 py-3 text-[14px]">Continue →</button>
    </div>
  );
}

// ---------- Q5: Time of day ----------
const TIMES: { id: TimeOfDay; label: string; emoji: string }[] = [
  { id: "early_bird", label: "Early Bird", emoji: "🌅" },
  { id: "midday", label: "Midday", emoji: "☀️" },
  { id: "night_owl", label: "Night Owl", emoji: "🌙" },
  { id: "weekend", label: "Weekend Warrior", emoji: "🎉" },
];
function Q5({ value, onChange }: { value?: TimeOfDay; onChange: (v: TimeOfDay) => void }) {
  return (
    <div>
      <Heading kicker="05" title="When do you learn best?" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        {TIMES.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            onClick={() => onChange(t.id)}
            className={`pw-card p-6 text-center ${value === t.id ? "ring-2 ring-[var(--pw-accent)]" : ""}`}
          >
            <div className="text-[44px]">{t.emoji}</div>
            <div className="mt-2 font-medium text-[15px]">{t.label}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q6: Experience ----------
function Q6({ value, subject, onChange }: { value?: Level; subject?: Subject; onChange: (v: Level) => void }) {
  const subjLabel = subject ? SUBJECTS.find(s => s.id === subject)?.label.toLowerCase() ?? "this subject" : "this subject";
  const levels: { id: Level; label: string; desc: string }[] = [
    { id: "beginner", label: "Beginner", desc: `Just getting started with ${subjLabel}` },
    { id: "intermediate", label: "Intermediate", desc: `Comfortable with the basics of ${subjLabel}` },
    { id: "advanced", label: "Advanced", desc: `Ready for deep dives into ${subjLabel}` },
  ];
  return (
    <div>
      <Heading kicker="06" title="What's your experience level?" />
      <div className="mt-6 space-y-3">
        {levels.map((l, i) => (
          <motion.button
            key={l.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
            onClick={() => onChange(l.id)}
            className={`w-full pw-card p-5 text-left ${value === l.id ? "ring-2 ring-[var(--pw-accent)]" : ""}`}
          >
            <div className="font-medium text-[16px]">{l.label}</div>
            <div className="text-[13px] text-[var(--pw-ink-2)] mt-0.5">{l.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q7: Frequency ----------
const FREQS: { id: Frequency; label: string; sub: string; emoji: string }[] = [
  { id: "weekly", label: "Once a week", sub: "Steady & consistent", emoji: "📅" },
  { id: "biweekly", label: "Twice a week", sub: "Build momentum", emoji: "⚡" },
  { id: "intensive", label: "Intensive (3+)", sub: "Go all in", emoji: "🔥" },
  { id: "flexible", label: "Flexible", sub: "As needed", emoji: "🌊" },
];
function Q7({ value, onChange }: { value?: Frequency; onChange: (v: Frequency) => void }) {
  return (
    <div>
      <Heading kicker="07" title="How often do you want sessions?" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        {FREQS.map((f, i) => (
          <motion.button
            key={f.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            onClick={() => onChange(f.id)}
            className={`pw-card p-5 text-center ${value === f.id ? "ring-2 ring-[var(--pw-accent)]" : ""}`}
          >
            <div className="text-[34px]">{f.emoji}</div>
            <div className="mt-2 font-medium text-[15px]">{f.label}</div>
            <div className="text-[12px] text-[var(--pw-ink-2)] mt-0.5">{f.sub}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q8: Budget ----------
function Q8({ value, onChange, onNext }: { value: number; onChange: (v: number) => void; onNext: () => void }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { count: c } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "tutor")
        .lte("hourly_rate", value);
      if (!cancelled) setCount(c ?? 0);
    })();
    return () => { cancelled = true; };
  }, [value]);

  return (
    <div>
      <Heading kicker="08" title="What's your budget per hour?" />
      <div className="mt-10 px-2">
        <div className="text-center font-display text-[56px]" style={{ color: "var(--pw-accent)" }}>
          ${value}{value >= 150 ? "+" : ""}
          <span className="text-[16px] text-[var(--pw-ink-2)] ml-1">/hr</span>
        </div>
        <input
          type="range" min={15} max={150} step={5} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-6 w-full accent-[var(--pw-accent)]"
        />
        <div className="flex items-center justify-between text-[12px] text-[var(--pw-ink-2)] mt-2">
          <span>$15</span><span>$150+</span>
        </div>
        <motion.div
          key={count ?? -1}
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="mt-6 text-center text-[14px]"
        >
          <span className="font-display text-[22px]" style={{ color: "var(--pw-accent-2)" }}>
            {count ?? "…"}
          </span>{" "}
          <span className="text-[var(--pw-ink-2)]">tutors available in your range</span>
        </motion.div>
      </div>
      <button onClick={onNext} className="mt-10 w-full pw-btn-primary px-5 py-3 text-[14px]">See my matches →</button>
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
  const [matching, setMatching] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setMatching(false), 1800);
    return () => clearTimeout(t);
  }, []);

  const traits = useMemo(() => deriveTraits(answers), [answers]);
  const subjLabel = answers.subject
    ? SUBJECTS.find(s => s.id === answers.subject)?.label
    : answers.multi_subject ? "Multiple subjects" : "Any subject";

  return (
    <div className="pt-6">
      <AnimatePresence mode="wait">
        {matching ? (
          <motion.div key="matching" exit={{ opacity: 0 }} className="text-center py-12">
            <motion.div
              className="text-[64px]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            >✨</motion.div>
            <div className="font-display text-[26px] mt-4">Finding your perfect match…</div>
            <div className="text-[13px] text-[var(--pw-ink-2)] mt-2">Analyzing your learning profile</div>
          </motion.div>
        ) : (
          <motion.div key="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Profile card */}
            <div className="relative pw-card p-7 overflow-hidden"
              style={{ background: "linear-gradient(135deg, var(--pw-accent-soft) 0%, var(--pw-surface) 60%)" }}>
              <motion.div
                className="absolute -top-8 -right-8 text-[140px] opacity-10"
                animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 6, repeat: Infinity }}
              >🎯</motion.div>
              <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Your learning profile</div>
              <div className="font-display text-[32px] leading-tight mt-1">
                The {traits[0] ?? "Curious Learner"}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {traits.map((t, i) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="pw-pill px-3 py-1 text-[12px] font-medium"
                    style={{ background: "var(--pw-accent)", color: "white" }}
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-[13px]">
                <Field label="Subject" value={subjLabel ?? "—"} />
                <Field label="Level" value={cap(answers.experience_level)} />
                <Field label="Frequency" value={freqLabel(answers.frequency)} />
                <Field label="Budget" value={answers.budget_max ? `Up to $${answers.budget_max}/hr` : "—"} />
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/matches"
                search={(prev: Record<string, unknown>) => ({
                  ...prev,
                  subject: answers.subject,
                  budget: answers.budget_max,
                  level: answers.experience_level,
                })}
                className="pw-btn-primary text-center px-5 py-3 text-[14px]"
              >
                View my matches →
              </Link>
              <button onClick={onRestart} className="pw-btn-outline px-5 py-3 text-[14px]">
                Retake the quiz
              </button>
            </div>

            {!user && (
              <div className="mt-5 text-center text-[12px] text-[var(--pw-ink-2)]">
                Your answers are saved locally. Sign up to keep them.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Tiny helpers ----------
function Heading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide" style={{ color: "var(--pw-accent)" }}>{kicker}</div>
      <h1 className="font-display text-[28px] sm:text-[32px] leading-tight mt-1">{title}</h1>
    </div>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}
function cap(s?: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—"; }
function freqLabel(f?: Frequency) {
  return f ? FREQS.find(x => x.id === f)?.label ?? "—" : "—";
}
