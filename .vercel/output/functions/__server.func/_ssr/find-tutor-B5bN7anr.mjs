import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAuth, s as supabase, P as PWHeader } from "./router-C4GolrgT.mjs";
import { R as RoleGate } from "./RoleGate-BYZ2pTkR.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__zod-adapter.mjs";
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-scroll-area.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/date-fns.mjs";
import "../_libs/date-fns-tz.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const STORAGE_KEY = "pw_find_tutor_answers";
function FindTutorPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RoleGate, { allow: ["student", "both"], allowAnonymous: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FindTutorPageInner, {}) });
}
function FindTutorPageInner() {
  const {
    user
  } = useAuth();
  useNavigate();
  const [step, setStep] = reactExports.useState(0);
  const [answers, setAnswers] = reactExports.useState({});
  const [direction, setDirection] = reactExports.useState(1);
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
    }
  }, [answers]);
  const totalQ = 8;
  const isResults = step >= totalQ;
  const progress = isResults ? 100 : step / totalQ * 100;
  const set = (k, v) => {
    setAnswers((a) => ({
      ...a,
      [k]: v
    }));
  };
  const next = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };
  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };
  reactExports.useEffect(() => {
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
        traits: deriveTraits(answers)
      };
      const {
        error
      } = await supabase.from("user_learning_profiles").upsert(payload, {
        onConflict: "user_id"
      });
      if (error) {
        console.error("[find-tutor] save failed", error);
        toast.error("Couldn't save your profile, but here are your matches!");
      }
    })();
  }, [isResults, user, answers]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 z-30 bg-[var(--pw-bg)]/90 backdrop-blur border-b border-[var(--pw-border)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-5 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] font-mono-pw uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isResults ? "Your profile" : `Question ${step + 1} of ${totalQ}` }),
        !isResults && step > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: back, className: "hover:text-[var(--pw-ink)] transition", children: "← Back" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-1.5 rounded-full bg-[var(--pw-surface-2)] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "h-full", style: {
        background: "var(--pw-accent)"
      }, animate: {
        width: `${progress}%`
      }, transition: {
        duration: 0.4,
        ease: "easeOut"
      } }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "px-5 py-10 max-w-2xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", custom: direction, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { custom: direction, initial: {
      opacity: 0,
      x: direction * 40
    }, animate: {
      opacity: 1,
      x: 0
    }, exit: {
      opacity: 0,
      x: direction * -40
    }, transition: {
      duration: 0.28,
      ease: "easeOut"
    }, children: [
      step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Q1, { value: answers, onChange: set, onNext: next }),
      step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Q2, { value: answers.goal, onChange: (v) => {
        set("goal", v);
        next();
      } }),
      step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Q3, { value: answers.learning_style, onChange: (v) => {
        set("learning_style", v);
        next();
      } }),
      step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Q4, { value: answers.pace ?? 3, onChange: (v) => set("pace", v), onNext: next }),
      step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(Q5, { value: answers.time_of_day, onChange: (v) => {
        set("time_of_day", v);
        next();
      } }),
      step === 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(Q6, { value: answers.experience_level, subject: answers.subject, onChange: (v) => {
        set("experience_level", v);
        next();
      } }),
      step === 6 && /* @__PURE__ */ jsxRuntimeExports.jsx(Q7, { value: answers.frequency, onChange: (v) => {
        set("frequency", v);
        next();
      } }),
      step === 7 && /* @__PURE__ */ jsxRuntimeExports.jsx(Q8, { value: answers.budget_max ?? 50, onChange: (v) => set("budget_max", v), onNext: next }),
      isResults && /* @__PURE__ */ jsxRuntimeExports.jsx(Results, { answers, onRestart: () => {
        setStep(0);
        setAnswers({});
        localStorage.removeItem(STORAGE_KEY);
      } })
    ] }, step) }) })
  ] });
}
const SUBJECTS = [{
  id: "math",
  label: "Math",
  emoji: "🔢"
}, {
  id: "science",
  label: "Science",
  emoji: "🔬"
}, {
  id: "languages",
  label: "Languages",
  emoji: "🗣️"
}, {
  id: "coding",
  label: "Coding",
  emoji: "💻"
}, {
  id: "test_prep",
  label: "Test prep",
  emoji: "📝"
}, {
  id: "music",
  label: "Music",
  emoji: "🎵"
}, {
  id: "writing",
  label: "Writing",
  emoji: "✍️"
}, {
  id: "art",
  label: "Art",
  emoji: "🎨"
}];
function Q1({
  value,
  onChange,
  onNext
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { kicker: "01", title: "What subject brings you here today?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3", children: SUBJECTS.map((s, i) => {
      const active = value.subject === s.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.button, { initial: {
        opacity: 0,
        y: 10
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: i * 0.04
      }, whileHover: {
        scale: 1.04
      }, whileTap: {
        scale: 0.96
      }, onClick: () => {
        onChange("subject", s.id);
        onChange("multi_subject", false);
        setTimeout(onNext, 200);
      }, className: `pw-card p-4 flex flex-col items-center text-center transition ${active ? "ring-2 ring-[var(--pw-accent)]" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[36px]", "aria-hidden": true, children: s.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-2 text-[13px] font-medium", children: s.label })
      ] }, s.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
      onChange("multi_subject", true);
      onChange("subject", void 0);
      setTimeout(onNext, 150);
    }, className: `mt-5 w-full pw-btn-outline px-4 py-3 text-[13px] ${value.multi_subject ? "bg-[var(--pw-accent-soft)]" : ""}`, children: "I need help with multiple subjects" })
  ] });
}
const GOALS = [{
  id: "ace_exam",
  label: "Ace an exam",
  emoji: "🏆",
  desc: "Crush that upcoming test"
}, {
  id: "master_skill",
  label: "Master a skill",
  emoji: "🎯",
  desc: "Go deep, become great"
}, {
  id: "build_confidence",
  label: "Build confidence",
  emoji: "💪",
  desc: "Believe you can do it"
}, {
  id: "get_ahead",
  label: "Get ahead",
  emoji: "🚀",
  desc: "Stay one step in front"
}, {
  id: "homework",
  label: "Homework help",
  emoji: "📚",
  desc: "Tackle assignments together"
}];
function Q2({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { kicker: "02", title: "What's your goal?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-3", children: GOALS.map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.button, { initial: {
      opacity: 0,
      y: 8
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: i * 0.05
    }, whileHover: {
      x: 4
    }, whileTap: {
      scale: 0.98
    }, onClick: () => onChange(g.id), className: `w-full pw-card p-4 flex items-center gap-4 text-left transition ${value === g.id ? "ring-2 ring-[var(--pw-accent)]" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[40px]", children: g.emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-[16px]", children: g.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] text-[var(--pw-ink-2)]", children: g.desc })
      ] })
    ] }, g.id)) })
  ] });
}
const STYLES = [{
  id: "visual",
  label: "Show me",
  sub: "Visual learner",
  emoji: "👁️"
}, {
  id: "auditory",
  label: "Tell me",
  sub: "Auditory learner",
  emoji: "👂"
}, {
  id: "kinesthetic",
  label: "Let me try",
  sub: "Kinesthetic",
  emoji: "✋"
}];
function Q3({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { kicker: "03", title: "How do you like to learn?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid sm:grid-cols-3 gap-3", children: STYLES.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.button, { initial: {
      opacity: 0,
      scale: 0.9
    }, animate: {
      opacity: 1,
      scale: 1
    }, transition: {
      delay: i * 0.08
    }, whileHover: {
      y: -4
    }, whileTap: {
      scale: 0.96
    }, onClick: () => onChange(s.id), className: `pw-card p-6 text-center ${value === s.id ? "ring-2 ring-[var(--pw-accent)]" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "text-[56px]", animate: {
        rotate: [0, -8, 8, 0]
      }, transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1
      }, children: s.emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 font-display text-[20px]", children: s.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)] mt-0.5", children: s.sub })
    ] }, s.id)) })
  ] });
}
function Q4({
  value,
  onChange,
  onNext
}) {
  const pct = (value - 1) / 4 * 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { kicker: "04", title: "What's your pace?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 px-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[12px] text-[var(--pw-ink-2)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🐢 I need time to absorb" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Challenge me! 🐇" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 1, max: 5, step: 1, value, onChange: (e) => onChange(Number(e.target.value)), className: "w-full accent-[var(--pw-accent)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "absolute -top-12 text-[40px]", animate: {
          left: `calc(${pct}% - 20px)`
        }, transition: {
          type: "spring",
          stiffness: 200,
          damping: 20
        }, children: value <= 2 ? "🐢" : value === 3 ? "🐎" : "🐇" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center text-[14px] text-[var(--pw-ink-2)]", children: ["Take it slow", "Easygoing", "Just right", "Push me", "Sprint mode"][value - 1] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onNext, className: "mt-10 w-full pw-btn-primary px-5 py-3 text-[14px]", children: "Continue →" })
  ] });
}
const TIMES = [{
  id: "early_bird",
  label: "Early Bird",
  emoji: "🌅"
}, {
  id: "midday",
  label: "Midday",
  emoji: "☀️"
}, {
  id: "night_owl",
  label: "Night Owl",
  emoji: "🌙"
}, {
  id: "weekend",
  label: "Weekend Warrior",
  emoji: "🎉"
}];
function Q5({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { kicker: "05", title: "When do you learn best?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-2 gap-3", children: TIMES.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.button, { initial: {
      opacity: 0,
      y: 8
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: i * 0.05
    }, whileHover: {
      scale: 1.03
    }, whileTap: {
      scale: 0.96
    }, onClick: () => onChange(t.id), className: `pw-card p-6 text-center ${value === t.id ? "ring-2 ring-[var(--pw-accent)]" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[44px]", children: t.emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 font-medium text-[15px]", children: t.label })
    ] }, t.id)) })
  ] });
}
function Q6({
  value,
  subject,
  onChange
}) {
  const subjLabel = subject ? SUBJECTS.find((s) => s.id === subject)?.label.toLowerCase() ?? "this subject" : "this subject";
  const levels = [{
    id: "beginner",
    label: "Beginner",
    desc: `Just getting started with ${subjLabel}`
  }, {
    id: "intermediate",
    label: "Intermediate",
    desc: `Comfortable with the basics of ${subjLabel}`
  }, {
    id: "advanced",
    label: "Advanced",
    desc: `Ready for deep dives into ${subjLabel}`
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { kicker: "06", title: "What's your experience level?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-3", children: levels.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.button, { initial: {
      opacity: 0,
      y: 6
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: i * 0.05
    }, whileHover: {
      x: 4
    }, whileTap: {
      scale: 0.98
    }, onClick: () => onChange(l.id), className: `w-full pw-card p-5 text-left ${value === l.id ? "ring-2 ring-[var(--pw-accent)]" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-[16px]", children: l.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] text-[var(--pw-ink-2)] mt-0.5", children: l.desc })
    ] }, l.id)) })
  ] });
}
const FREQS = [{
  id: "weekly",
  label: "Once a week",
  sub: "Steady & consistent",
  emoji: "📅"
}, {
  id: "biweekly",
  label: "Twice a week",
  sub: "Build momentum",
  emoji: "⚡"
}, {
  id: "intensive",
  label: "Intensive (3+)",
  sub: "Go all in",
  emoji: "🔥"
}, {
  id: "flexible",
  label: "Flexible",
  sub: "As needed",
  emoji: "🌊"
}];
function Q7({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { kicker: "07", title: "How often do you want sessions?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-2 gap-3", children: FREQS.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.button, { initial: {
      opacity: 0,
      y: 8
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: i * 0.05
    }, whileHover: {
      scale: 1.03
    }, whileTap: {
      scale: 0.96
    }, onClick: () => onChange(f.id), className: `pw-card p-5 text-center ${value === f.id ? "ring-2 ring-[var(--pw-accent)]" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[34px]", children: f.emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 font-medium text-[15px]", children: f.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)] mt-0.5", children: f.sub })
    ] }, f.id)) })
  ] });
}
function Q8({
  value,
  onChange,
  onNext
}) {
  const [count, setCount] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        count: c
      } = await supabase.from("profiles").select("id", {
        count: "exact",
        head: true
      }).eq("role", "tutor").lte("hourly_rate", value);
      if (!cancelled) setCount(c ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [value]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { kicker: "08", title: "What's your budget per hour?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 px-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center font-display text-[56px]", style: {
        color: "var(--pw-accent)"
      }, children: [
        "$",
        value,
        value >= 150 ? "+" : "",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px] text-[var(--pw-ink-2)] ml-1", children: "/hr" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 15, max: 150, step: 5, value, onChange: (e) => onChange(Number(e.target.value)), className: "mt-6 w-full accent-[var(--pw-accent)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[12px] text-[var(--pw-ink-2)] mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "$15" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "$150+" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        scale: 0.95,
        opacity: 0
      }, animate: {
        scale: 1,
        opacity: 1
      }, className: "mt-6 text-center text-[14px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-[22px]", style: {
          color: "var(--pw-accent-2)"
        }, children: count ?? "…" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)]", children: "tutors available in your range" })
      ] }, count ?? -1)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onNext, className: "mt-10 w-full pw-btn-primary px-5 py-3 text-[14px]", children: "See my matches →" })
  ] });
}
function deriveTraits(a) {
  const traits = [];
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
function Results({
  answers,
  onRestart
}) {
  const {
    user
  } = useAuth();
  const [matching, setMatching] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setMatching(false), 1800);
    return () => clearTimeout(t);
  }, []);
  const traits = reactExports.useMemo(() => deriveTraits(answers), [answers]);
  const subjLabel = answers.subject ? SUBJECTS.find((s) => s.id === answers.subject)?.label : answers.multi_subject ? "Multiple subjects" : "Any subject";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: matching ? /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { exit: {
    opacity: 0
  }, className: "text-center py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "text-[64px]", animate: {
      rotate: 360
    }, transition: {
      duration: 1.4,
      repeat: Infinity,
      ease: "linear"
    }, children: "✨" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[26px] mt-4", children: "Finding your perfect match…" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] text-[var(--pw-ink-2)] mt-2", children: "Analyzing your learning profile" })
  ] }, "matching") : /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    y: 20
  }, animate: {
    opacity: 1,
    y: 0
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative pw-card p-7 overflow-hidden", style: {
      background: "linear-gradient(135deg, var(--pw-accent-soft) 0%, var(--pw-surface) 60%)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "absolute -top-8 -right-8 text-[140px] opacity-10", animate: {
        rotate: [0, 8, -8, 0]
      }, transition: {
        duration: 6,
        repeat: Infinity
      }, children: "🎯" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Your learning profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display text-[32px] leading-tight mt-1", children: [
        "The ",
        traits[0] ?? "Curious Learner"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex flex-wrap gap-2", children: traits.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { initial: {
        opacity: 0,
        scale: 0.8
      }, animate: {
        opacity: 1,
        scale: 1
      }, transition: {
        delay: 0.1 + i * 0.08
      }, className: "pw-pill px-3 py-1 text-[12px] font-medium", style: {
        background: "var(--pw-accent)",
        color: "white"
      }, children: t }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-2 gap-4 text-[13px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Subject", value: subjLabel ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Level", value: cap(answers.experience_level) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Frequency", value: freqLabel(answers.frequency) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Budget", value: answers.budget_max ? `Up to $${answers.budget_max}/hr` : "—" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/matches", search: (prev) => ({
        ...prev,
        subject: answers.subject,
        budget: answers.budget_max,
        level: answers.experience_level
      }), className: "pw-btn-primary text-center px-5 py-3 text-[14px]", children: "View my matches →" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onRestart, className: "pw-btn-outline px-5 py-3 text-[14px]", children: "Retake the quiz" })
    ] }),
    !user && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 text-center text-[12px] text-[var(--pw-ink-2)]", children: "Your answers are saved locally. Sign up to keep them." })
  ] }, "card") }) });
}
function Heading({
  kicker,
  title
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide", style: {
      color: "var(--pw-accent)"
    }, children: kicker }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-[28px] sm:text-[32px] leading-tight mt-1", children: title })
  ] });
}
function Field({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mt-0.5", children: value })
  ] });
}
function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
}
function freqLabel(f) {
  return f ? FREQS.find((x) => x.id === f)?.label ?? "—" : "—";
}
export {
  FindTutorPage as component
};
