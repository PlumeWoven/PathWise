import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { c as confetti } from "../_libs/canvas-confetti.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAuth, R as Route$u, P as PWHeader, c as completeStage } from "./router-C4GolrgT.mjs";
import { u as usePW, G as GOAL_LABELS, L as LEVEL_META } from "./store-BHvhbBzf.mjs";
import { R as RoleGate } from "./RoleGate-BYZ2pTkR.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
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
const STORAGE_KEY = "pw_progress_v1";
function load() {
  if (typeof localStorage === "undefined") return { stages: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { stages: {} };
    return JSON.parse(raw);
  } catch {
    return { stages: {} };
  }
}
function save(state2) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state2));
  } catch {
  }
}
let state = load();
const listeners = /* @__PURE__ */ new Set();
function emit() {
  save(state);
  listeners.forEach((l) => l());
}
function key(subject, stageNumber) {
  return `${subject}:${stageNumber}`;
}
function getStageProgress(subject, stageNumber) {
  return state.stages[key(subject, stageNumber)] ?? { completed: false, sessions: [] };
}
function addSession(subject, stageNumber, session) {
  const k = key(subject, stageNumber);
  const cur = state.stages[k] ?? { completed: false, sessions: [] };
  const next = { ...session, id: crypto.randomUUID() };
  state.stages = {
    ...state.stages,
    [k]: { ...cur, sessions: [next, ...cur.sessions] }
  };
  emit();
}
function removeSession(subject, stageNumber, sessionId) {
  const k = key(subject, stageNumber);
  const cur = state.stages[k];
  if (!cur) return;
  state.stages = {
    ...state.stages,
    [k]: { ...cur, sessions: cur.sessions.filter((s) => s.id !== sessionId) }
  };
  emit();
}
function useProgress() {
  return reactExports.useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state
  );
}
function StageDetailModal({ subject, stageNumber, stageTitle, onClose }) {
  useProgress();
  const progress = getStageProgress(subject, stageNumber);
  const [date, setDate] = reactExports.useState(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [tutor, setTutor] = reactExports.useState("");
  const [duration, setDuration] = reactExports.useState(45);
  const [notes, setNotes] = reactExports.useState("");
  function submit(e) {
    e.preventDefault();
    if (!tutor.trim()) return;
    addSession(subject, stageNumber, { date, tutor: tutor.trim(), duration, notes: notes.trim() });
    setTutor("");
    setNotes("");
    setDuration(45);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      style: { background: "rgba(26,26,26,0.45)", backdropFilter: "blur(6px)" },
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.96, y: 10 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.96 },
          transition: { duration: 0.2 },
          className: "pw-card w-full max-w-2xl max-h-[88vh] overflow-y-auto",
          style: { background: "var(--pw-surface)" },
          onClick: (e) => e.stopPropagation(),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono-pw text-[11px] text-[var(--pw-ink-2)]", children: [
                  "STAGE ",
                  String(stageNumber).padStart(2, "0"),
                  " · SESSION LOG"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[26px] leading-tight mt-1", children: stageTitle })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] text-2xl leading-none",
                  "aria-label": "Close",
                  children: "×"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-5 pw-card p-4", style: { background: "var(--pw-surface-2)" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-3", children: "LOG A SESSION" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-3 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)]", children: "Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "date",
                      value: date,
                      onChange: (e) => setDate(e.target.value),
                      className: "px-3 py-2 rounded-md text-[14px]",
                      style: { background: "var(--pw-surface)", border: "1.5px solid var(--pw-border)" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)]", children: "Tutor" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      value: tutor,
                      onChange: (e) => setTutor(e.target.value),
                      placeholder: "Amélie L.",
                      className: "px-3 py-2 rounded-md text-[14px]",
                      style: { background: "var(--pw-surface)", border: "1.5px solid var(--pw-border)" },
                      required: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)]", children: "Duration (min)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      min: 5,
                      max: 300,
                      value: duration,
                      onChange: (e) => setDuration(Number(e.target.value)),
                      className: "px-3 py-2 rounded-md text-[14px]",
                      style: { background: "var(--pw-surface)", border: "1.5px solid var(--pw-border)" }
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1 mt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)]", children: "Notes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    value: notes,
                    onChange: (e) => setNotes(e.target.value),
                    rows: 2,
                    placeholder: "What did you cover? What clicked?",
                    className: "px-3 py-2 rounded-md text-[14px] resize-none",
                    style: { background: "var(--pw-surface)", border: "1.5px solid var(--pw-border)" }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "pw-btn-primary px-4 py-2 text-[14px] font-medium", children: "+ Add session" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2", children: [
                progress.sessions.length,
                " SESSION",
                progress.sessions.length === 1 ? "" : "S",
                " LOGGED"
              ] }),
              progress.sessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "text-[13px] text-[var(--pw-ink-2)] p-4 rounded-md text-center",
                  style: { border: "1.5px dashed var(--pw-border)" },
                  children: "No sessions yet. Log your first session above to start tracking progress."
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: progress.sessions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "pw-card p-3 flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-pw text-[11px] text-[var(--pw-ink-2)]", children: new Date(s.date).toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-border)]", children: "·" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[13px] font-medium", children: [
                      "👤 ",
                      s.tutor
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-border)]", children: "·" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[12px] text-[var(--pw-ink-2)]", children: [
                      "⏱ ",
                      s.duration,
                      " min"
                    ] })
                  ] }),
                  s.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] text-[var(--pw-ink)] mt-1", children: s.notes })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => removeSession(subject, stageNumber, s.id),
                    className: "text-[var(--pw-ink-2)] hover:text-[var(--pw-danger)] text-[12px]",
                    "aria-label": "Remove session",
                    children: "Remove"
                  }
                )
              ] }, s.id)) })
            ] })
          ] })
        }
      )
    }
  ) });
}
function RoadmapPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RoleGate, { allow: ["student", "both"], allowAnonymous: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RoadmapPageInner, {}) });
}
function RoadmapPageInner() {
  const pw = usePW();
  const {
    isLoggedIn,
    openLogin
  } = useAuth();
  const navigate = useNavigate();
  const search = Route$u.useSearch();
  const [roadmap, setRoadmap] = reactExports.useState(null);
  const [stages, setStages] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [openStage, setOpenStage] = reactExports.useState(null);
  const [completing, setCompleting] = reactExports.useState(null);
  const [overlay, setOverlay] = reactExports.useState(null);
  const [showAnonToast, setShowAnonToast] = reactExports.useState(false);
  const roadmapId = search.roadmapId || (typeof window !== "undefined" ? localStorage.getItem("pathwise_roadmap_id") : null) || null;
  reactExports.useEffect(() => {
    if (!roadmapId) {
      navigate({
        to: "/quiz"
      });
      return;
    }
    void fetchRoadmap();
    if (!isLoggedIn) setShowAnonToast(true);
  }, [roadmapId, isLoggedIn]);
  async function fetchRoadmap() {
    if (!roadmapId) return;
    setLoading(true);
    try {
      const {
        supabase
      } = await import("./router-C4GolrgT.mjs").then((n) => n.A);
      const [{
        data: rm,
        error: rErr
      }, {
        data: st,
        error: sErr
      }] = await Promise.all([supabase.from("roadmaps").select("*").eq("id", roadmapId).maybeSingle(), supabase.from("roadmap_stages").select("*").eq("roadmap_id", roadmapId).order("stage_number")]);
      if (rErr) throw rErr;
      if (sErr) throw sErr;
      if (!rm) {
        toast.error("Roadmap not found.");
        navigate({
          to: "/quiz"
        });
        return;
      }
      setRoadmap(rm);
      setStages(st ?? []);
    } catch (err) {
      console.error("[roadmap] fetch", err);
      toast.error(err?.message || "Couldn't load your roadmap.");
    } finally {
      setLoading(false);
    }
  }
  async function handleMarkComplete(stage) {
    if (completing !== null) return;
    if (stage.status !== "active") return;
    if (!roadmap) return;
    setCompleting(stage.stage_number);
    try {
      await completeStage(roadmap.id, stage.stage_number);
      const next = stages.find((s) => s.stage_number === stage.stage_number + 1);
      setStages((prev) => prev.map((s) => {
        if (s.id === stage.id) return {
          ...s,
          status: "complete",
          completed_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (next && s.id === next.id) return {
          ...s,
          status: "active"
        };
        return s;
      }));
      setRoadmap({
        ...roadmap,
        current_stage: stage.stage_number + 1
      });
      const fire = (origin) => confetti({
        particleCount: 90,
        spread: 75,
        origin,
        colors: ["#E85D26", "#F4C430", "#2D6A4F", "#FFFFFF"]
      });
      fire({
        x: 0.3,
        y: 0.5
      });
      fire({
        x: 0.7,
        y: 0.5
      });
      setTimeout(() => fire({
        x: 0.5,
        y: 0.4
      }), 250);
      setOverlay({
        stageNumber: stage.stage_number,
        nextTitle: next?.title ?? null,
        xp: 100
      });
      setTimeout(() => setOverlay(null), 1500);
    } catch (err) {
      console.error("[roadmap] mark complete", err);
      toast.error(err?.message || "Couldn't mark stage complete.");
    } finally {
      setCompleting(null);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "px-5 sm:px-8 pt-20 text-center text-[var(--pw-ink-2)]", children: "Loading your roadmap…" })
    ] });
  }
  if (!roadmap) return null;
  const subject = roadmap.subject ?? pw.subject ?? "Mathematics";
  const level = pw.level ?? "Builder";
  const levelMeta = LEVEL_META[level];
  const goalLabel = roadmap.goal && GOAL_LABELS[roadmap.goal] ? GOAL_LABELS[roadmap.goal] : "Improve";
  const total = stages.length || 5;
  const done = stages.filter((s) => s.status === "complete").length;
  const pct = Math.round(done / total * 100);
  const lastStage = stages[stages.length - 1];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showAnonToast && !isLoggedIn && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: -10
    }, animate: {
      opacity: 1,
      y: 0
    }, exit: {
      opacity: 0,
      y: -10
    }, className: "mx-5 sm:mx-8 mt-4 pw-card px-4 py-3 flex items-center justify-between gap-4", style: {
      background: "var(--pw-accent-soft)",
      borderColor: "var(--pw-accent)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px]", children: [
        "💾 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sign up" }),
        " to save your progress permanently"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: openLogin, className: "pw-pill px-3 py-1 text-[12px] text-white font-medium", style: {
          background: "var(--pw-accent)"
        }, children: "Sign up" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAnonToast(false), className: "text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] text-lg leading-none px-1", "aria-label": "Dismiss", children: "×" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-5 sm:px-8 pb-24 max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, transition: {
        duration: 0.4
      }, className: "grid lg:grid-cols-[40%_60%] gap-10 mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full flex items-center justify-center text-3xl", style: {
              background: "var(--pw-surface-2)"
            }, children: levelMeta.emoji }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[20px] leading-tight", children: level }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] text-[var(--pw-ink-2)]", children: "YOUR RANK" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[12px] text-[var(--pw-ink-2)]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Roadmap progress" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono-pw", children: [
                done,
                " / ",
                total,
                " stages"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 mt-1.5 rounded-full bg-[var(--pw-surface-2)] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "h-full", initial: false, animate: {
              width: `${pct}%`
            }, transition: {
              duration: 0.7,
              ease: "easeOut"
            }, style: {
              background: "var(--pw-accent)"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono-pw text-[11px] text-[var(--pw-ink-2)] mt-1", children: [
              pct,
              "% complete"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "YOUR MISSION" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-[15px]", children: [
              "Master ",
              subject,
              " up to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: lastStage?.title ?? "your goal" }),
              ", starting from ",
              level,
              "."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Pill, { children: [
                "📚 ",
                subject
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Pill, { children: [
                levelMeta.emoji,
                " ",
                level,
                " Level"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Pill, { children: [
                "🚀 ",
                goalLabel
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-5 h-px bg-[var(--pw-border)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-3", children: "ESTIMATED JOURNEY" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-[13px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "📅 8–12 weeks" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "📚 3–4 sessions / week" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "⚡ ~45 min per session" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2", children: "YOUR ROADMAP" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-[32px] leading-tight mb-6", children: [
            "From ",
            level,
            " to your goal"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative pl-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-3 top-2 bottom-2 border-l-2 border-dashed border-[var(--pw-border)]" }),
            stages.map((s, i) => {
              const isCompleted = s.status === "complete";
              const isActive = s.status === "active";
              const isGoal = i === stages.length - 1;
              let nodeBg = "var(--pw-surface)";
              let nodeBorder = "var(--pw-border)";
              let nodeIcon = "";
              if (isCompleted) {
                nodeBg = "var(--pw-accent-2)";
                nodeBorder = "var(--pw-accent-2)";
                nodeIcon = "✓";
              } else if (isActive) {
                nodeBg = "var(--pw-accent)";
                nodeBorder = "var(--pw-accent)";
                nodeIcon = isGoal ? "🏁" : "▶";
              } else if (isGoal) {
                nodeIcon = "🏁";
              }
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { layout: true, initial: {
                opacity: 0,
                y: 20
              }, animate: {
                opacity: 1,
                y: 0,
                scale: isActive && completing === null ? 1 : 1
              }, transition: {
                delay: i * 0.08,
                type: "spring",
                stiffness: 220,
                damping: 22
              }, className: "relative mb-7", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "absolute -left-[30px] top-3 w-6 h-6 rounded-full flex items-center justify-center text-[12px]", style: {
                  background: nodeBg,
                  border: "2px solid " + nodeBorder,
                  color: "#fff"
                }, animate: isActive ? {
                  boxShadow: ["0 0 0 0 rgba(232,93,38,0.55)", "0 0 0 10px rgba(232,93,38,0)"]
                } : {
                  boxShadow: "0 0 0 0 rgba(0,0,0,0)"
                }, transition: isActive ? {
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeOut"
                } : {}, children: nodeIcon }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setOpenStage(s.stage_number), className: "text-left w-full pw-card p-5 relative transition-colors", style: {
                  cursor: "pointer",
                  borderColor: isActive ? "var(--pw-accent)" : isCompleted ? "var(--pw-accent-2)" : "var(--pw-border)",
                  background: isCompleted ? "rgba(45,106,79,0.04)" : "var(--pw-surface)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono-pw text-[11px] text-[var(--pw-ink-2)]", children: [
                        "STAGE ",
                        String(s.stage_number).padStart(2, "0")
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-[20px] leading-tight mt-0.5", children: s.title })
                    ] }),
                    isCompleted && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill text-[11px] px-2.5 py-1 text-white whitespace-nowrap", style: {
                      background: "var(--pw-accent-2)"
                    }, children: "✓ Completed" }),
                    isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill text-[11px] px-2.5 py-1 text-white whitespace-nowrap", style: {
                      background: "var(--pw-accent)"
                    }, children: "▶ START HERE" }),
                    !isCompleted && !isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill text-[11px] px-2.5 py-1 text-[var(--pw-ink-2)] pw-border whitespace-nowrap", children: "🔒 Locked" })
                  ] }),
                  s.skills && s.skills.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-1.5", children: s.skills.map((sk) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill text-[11px] px-2.5 py-1", style: {
                    background: "var(--pw-surface-2)"
                  }, children: sk }, sk)) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between gap-3 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)]", children: isCompleted && s.completed_at ? `Completed ${new Date(s.completed_at).toLocaleDateString()}` : "Tap to view details & log sessions" }),
                    isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "button", tabIndex: 0, onClick: (e) => {
                      e.stopPropagation();
                      handleMarkComplete(s);
                    }, onKeyDown: (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMarkComplete(s);
                      }
                    }, className: "pw-pill text-[12px] px-3 py-1.5 font-medium transition-colors", style: {
                      background: "var(--pw-accent)",
                      color: "#fff",
                      opacity: completing === s.stage_number ? 0.6 : 1
                    }, children: completing === s.stage_number ? "Saving…" : "✓ Mark Stage Complete" })
                  ] })
                ] })
              ] }, s.id);
            })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 max-w-2xl mx-auto text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/matches", className: "pw-btn-primary inline-flex justify-center w-full px-7 py-4 text-[16px] font-medium", children: "See My Matched Tutors & Courses →" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[12px] text-[var(--pw-ink-2)]", children: "Free to browse · Book only when ready" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: openStage !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(StageDetailModal, { subject, stageNumber: openStage, stageTitle: stages.find((s) => s.stage_number === openStage)?.title ?? "", onClose: () => setOpenStage(null) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: overlay && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, exit: {
      opacity: 0
    }, className: "fixed inset-0 z-[60] flex items-center justify-center p-4", style: {
      background: "rgba(26,26,26,0.6)",
      backdropFilter: "blur(8px)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      scale: 0.7,
      opacity: 0,
      y: 20
    }, animate: {
      scale: 1,
      opacity: 1,
      y: 0
    }, exit: {
      scale: 0.9,
      opacity: 0
    }, transition: {
      type: "spring",
      stiffness: 220,
      damping: 18
    }, className: "pw-card text-center px-10 py-12 max-w-md w-full", style: {
      background: "var(--pw-surface)",
      borderColor: "var(--pw-accent)",
      borderWidth: 2
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl", children: "🎯" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-[36px] leading-tight mt-3", children: [
        "Stage ",
        overlay.stageNumber,
        " Complete!"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono-pw text-[12px] mt-2", style: {
        color: "var(--pw-accent-3)"
      }, children: [
        "✦ +",
        overlay.xp,
        " XP earned"
      ] }),
      overlay.nextTitle ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[14px] text-[var(--pw-ink-2)] mt-4", children: [
        "Next: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-[var(--pw-ink)]", children: overlay.nextTitle })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] text-[var(--pw-ink-2)] mt-4", children: "🏁 Final stage reached!" })
    ] }) }) })
  ] });
}
function Pill({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill text-[12px] px-3 py-1 pw-border", style: {
    background: "var(--pw-surface-2)"
  }, children });
}
export {
  RoadmapPage as component
};
