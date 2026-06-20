import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as useSearch, d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { D as DashboardShell } from "./TutorSidebar-BaNldSBv.mjs";
import { t as toast } from "../_libs/sonner.mjs";
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
const DEMO_DURATION_MS = 60 * 60 * 1e3;
const STORAGE_KEY = "pw-demo-started";
const VIEWS_KEY = "pw-demo-views";
const EMAIL_KEY = "pw-demo-email";
const DEMO_TUTOR = {
  id: "demo-tutor-1",
  name: "Alex Mereanu",
  username: "alex-demo",
  headline: "Senior Software Engineer · 8 yrs teaching",
  bio: "I help students go from zero to job-ready in modern web development. 500+ students mentored across 12 countries.",
  rating: 4.9,
  reviews: 127,
  students: 348,
  hourlyRate: 45,
  credentials: ["MSc Computer Science — TU Delft", "AWS Certified Solutions Architect", "Ex-Google Engineer"]
};
const DEMO_COURSES = [
  {
    id: "c1",
    title: "Full-Stack JavaScript: From Zero to Production",
    category: "Programming",
    price: 89,
    discount: 49,
    students: 214,
    rating: 4.9,
    reviews: 86,
    lessons: 42,
    hours: 18,
    completion: 73,
    thumb: "linear-gradient(135deg,#0ea5e9,#6366f1)",
    tutorId: "demo-tutor-1"
  },
  {
    id: "c2",
    title: "Build & Sell: A Practical Guide to Indie SaaS",
    category: "Business",
    price: 129,
    discount: null,
    students: 134,
    rating: 4.8,
    reviews: 41,
    lessons: 28,
    hours: 11,
    completion: 58,
    thumb: "linear-gradient(135deg,#f59e0b,#ef4444)",
    tutorId: "demo-tutor-1"
  }
];
const DEMO_MESSAGES = [
  { id: 1, from: "Maria P.", avatar: "MP", time: "2h ago", preview: "Hi Alex! Loved lesson 12 — quick question about async patterns…", unread: true },
  { id: 2, from: "Daniel C.", avatar: "DC", time: "yesterday", preview: "Could we schedule a 1:1 next week to review my project?", unread: true },
  { id: 3, from: "Sarah K.", avatar: "SK", time: "3 days ago", preview: "Just finished the SaaS course — thank you, this was incredible.", unread: false }
];
const DEMO_SESSIONS = [
  { id: "s1", student: "Maria P.", topic: "Async JS deep dive", when: "Today · 16:00", duration: 60 },
  { id: "s2", student: "Daniel C.", topic: "Project review", when: "Tomorrow · 10:30", duration: 45 },
  { id: "s3", student: "James L.", topic: "Career mentoring", when: "Fri · 14:00", duration: 30 }
];
const DEMO_REVIEW = {
  student: "Maria P.",
  rating: 5,
  course: "Full-Stack JavaScript",
  body: "Alex's teaching style is unmatched. The exercises are practical, and his feedback in 1:1s helped me land my first dev job."
};
const EARNINGS = [320, 480, 410, 690, 820, 940, 1180, 1340, 1510, 1620, 1890, 2240];
const Ctx = reactExports.createContext(null);
function useDemo() {
  const c = reactExports.useContext(Ctx);
  if (!c) throw new Error("useDemo must be used inside <DemoProvider>");
  return c;
}
function DemoProvider({
  initialView,
  refCode,
  onExit,
  children
}) {
  const [view, setView] = reactExports.useState(initialView);
  const [expiresAt, setExpiresAt] = reactExports.useState(null);
  const [now, setNow] = reactExports.useState(() => Date.now());
  const [capturedEmail, setCapturedEmail] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
    let started = stored ? parseInt(stored, 10) : NaN;
    if (!started || Date.now() - started > DEMO_DURATION_MS) {
      started = Date.now();
    }
    sessionStorage.setItem(STORAGE_KEY, String(started));
    localStorage.setItem(STORAGE_KEY, String(started));
    setExpiresAt(started + DEMO_DURATION_MS);
    setCapturedEmail(localStorage.getItem(EMAIL_KEY));
    if (refCode) {
      const data = JSON.parse(localStorage.getItem(VIEWS_KEY) ?? "{}");
      data[refCode] = (data[refCode] ?? 0) + 1;
      localStorage.setItem(VIEWS_KEY, JSON.stringify(data));
    }
  }, [refCode]);
  reactExports.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(t);
  }, []);
  const ms = expiresAt ? Math.max(0, expiresAt - now) : DEMO_DURATION_MS;
  const m = Math.floor(ms / 6e4);
  const s = Math.floor(ms % 6e4 / 1e3);
  const remaining = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const expired = !!expiresAt && ms === 0;
  const warning = ms > 0 && ms <= 5 * 60 * 1e3;
  const exitDemo = reactExports.useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    }
    onExit();
  }, [onExit]);
  const lockedFeature = reactExports.useCallback((label = "this feature") => {
    toast.message("Sign up to unlock " + label, {
      description: "Demo mode is read-only. Create a free account to use it for real.",
      action: { label: "Sign up →", onClick: () => onExit() }
    });
  }, [onExit]);
  const shareLink = reactExports.useCallback(async () => {
    if (typeof window === "undefined") return "";
    const ref = "demo" + Math.random().toString(36).slice(2, 8);
    const url = `${window.location.origin}/demo?ref=${ref}&as=${view}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Demo link copied!", { description: url });
    } catch {
      toast.error("Could not copy link");
    }
    return url;
  }, [view]);
  const viewsForRef = reactExports.useCallback((ref) => {
    if (typeof window === "undefined") return 0;
    const data = JSON.parse(localStorage.getItem(VIEWS_KEY) ?? "{}");
    return data[ref] ?? 0;
  }, []);
  const captureEmail = reactExports.useCallback((email) => {
    setCapturedEmail(email);
    if (typeof window !== "undefined") localStorage.setItem(EMAIL_KEY, email);
  }, []);
  const value = reactExports.useMemo(() => ({
    isDemo: true,
    view,
    setView,
    remaining,
    expired,
    warning,
    exitDemo,
    lockedFeature,
    shareLink,
    viewsForRef,
    capturedEmail,
    captureEmail,
    data: {
      tutor: DEMO_TUTOR,
      courses: DEMO_COURSES,
      messages: DEMO_MESSAGES,
      sessions: DEMO_SESSIONS,
      review: DEMO_REVIEW,
      earnings: EARNINGS
    }
  }), [view, remaining, expired, warning, exitDemo, lockedFeature, shareLink, viewsForRef, capturedEmail, captureEmail]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value, children });
}
function ExitDemoModal({ open, onClose }) {
  const { capturedEmail, captureEmail } = useDemo();
  const [email, setEmail] = reactExports.useState(capturedEmail ?? "");
  const navigate = useNavigate();
  if (!open) return null;
  const submit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    captureEmail(email);
    toast.success("Welcome to Pathwise!", { description: "Setting up your account…" });
    onClose();
    navigate({ to: "/dashboard" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "pw-card max-w-md w-full p-7 relative",
      onClick: (e) => e.stopPropagation(),
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "exit-demo-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onClose,
            "aria-label": "Close",
            className: "absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)]",
            children: "×"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[10px] uppercase tracking-wider text-[var(--pw-accent)]", children: "Ready for the real thing?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "exit-demo-title", className: "mt-1 font-display text-[26px] leading-tight", children: "Start your own journey" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[13px] text-[var(--pw-ink-2)]", children: "Create your free account to keep your courses, students and earnings — for real this time." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-5 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "you@example.com",
              autoFocus: true,
              className: "w-full px-4 py-3 rounded-lg border border-[var(--pw-border)] bg-[var(--pw-surface)] text-[14px] focus:outline-none focus:border-[var(--pw-accent)]"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "pw-btn-primary w-full px-5 py-3 text-[14px] font-medium", children: "Create my free account →" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "block w-full text-center text-[12px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] py-1", children: "Keep exploring the demo" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[11px] text-[var(--pw-ink-2)] text-center", children: "No credit card · Cancel anytime" })
      ]
    }
  ) });
}
const DEMO_CODES = ["PATHWISE2025", "DEMO", "LAUNCH"];
function DemoPage() {
  const search = useSearch({
    from: "/pathwise/demo"
  });
  const navigate = useNavigate();
  const codeOk = !search.code || DEMO_CODES.includes(search.code.toUpperCase());
  const [exitOpen, setExitOpen] = reactExports.useState(false);
  if (!codeOk) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto pt-24 px-5 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl", children: "Invalid demo code" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-[var(--pw-ink-2)]", children: [
        'The code "',
        search.code,
        `" isn't valid. Try the public demo instead.`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/demo", className: "pw-btn-primary mt-6 inline-flex px-5 py-3", children: "Open public demo" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DemoProvider, { initialView: search.as ?? "tutor", refCode: search.ref, onExit: () => setExitOpen(true), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DemoLayout, { onExitClick: () => setExitOpen(true), onViewChange: (v) => navigate({
      to: "/pathwise/demo",
      search: {
        ...search,
        as: v
      }
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ExitDemoModal, { open: exitOpen, onClose: () => setExitOpen(false) })
  ] });
}
function DemoLayout({
  onExitClick,
  onViewChange
}) {
  const {
    view,
    setView,
    data
  } = useDemo();
  const handleSetView = (v) => {
    setView(v);
    onViewChange(v);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DashboardShell, { role: view, user: view === "tutor" ? {
    name: data.tutor.name,
    subtitle: data.tutor.headline
  } : {
    name: "Sample Student",
    subtitle: "Exploring Pathwise"
  }, isDemo: true, banner: /* @__PURE__ */ jsxRuntimeExports.jsx(DemoBar, { setView: handleSetView, onExitClick }), onExit: onExitClick, children: [
    view === "tutor" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TutorDemo, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(StudentDemo, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PersistentSignupLink, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConvertCTA, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MobileViewSwitch, { view, setView: handleSetView })
  ] });
}
function DemoBar({
  setView,
  onExitClick
}) {
  const {
    view,
    remaining,
    warning,
    expired,
    shareLink
  } = useDemo();
  const tone = expired ? "var(--pw-danger)" : warning ? "#b45309" : "var(--pw-accent)";
  const bg = expired ? "color-mix(in oklab, var(--pw-danger) 12%, transparent)" : warning ? "#fff7ed" : "var(--pw-accent-soft)";
  if (expired) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 sm:px-8 pt-14 lg:pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto pw-card px-4 py-3 flex flex-wrap items-center gap-3 justify-between", style: {
      background: bg,
      borderColor: tone
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[12px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full font-mono-pw uppercase tracking-wider", style: {
          background: "color-mix(in oklab, var(--pw-danger) 18%, transparent)",
          color: tone
        }, children: "Demo expired" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)]", children: "Sign up to keep exploring with your own data." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onExitClick, className: "pw-btn-primary text-[12px] px-3 py-1.5", children: "Sign up to continue →" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 sm:px-8 pt-14 lg:pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto pw-card px-4 py-3 flex flex-wrap items-center gap-3 justify-between", style: {
    background: bg,
    borderColor: warning ? tone : void 0
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[12px] min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full font-mono-pw uppercase tracking-wider shrink-0", style: {
        background: `color-mix(in oklab, ${tone} 15%, transparent)`,
        color: tone
      }, children: "Demo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[var(--pw-ink-2)] truncate", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Sample data · " }),
        "expires in ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-pw", style: {
          color: tone
        }, children: remaining })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:inline-flex rounded-lg border border-[var(--pw-border)] p-0.5 bg-[var(--pw-surface)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("tutor"), className: `px-3 py-1.5 text-[13px] rounded-md ${view === "tutor" ? "bg-[var(--pw-accent)] text-white" : "text-[var(--pw-ink-2)]"}`, children: "Tutor view" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("student"), className: `px-3 py-1.5 text-[13px] rounded-md ${view === "student" ? "bg-[var(--pw-accent)] text-white" : "text-[var(--pw-ink-2)]"}`, children: "Student view" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: shareLink, className: "pw-btn-outline text-[12px] px-3 py-1.5", children: "Share demo" })
    ] })
  ] }) });
}
function MobileViewSwitch({
  view,
  setView
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 inline-flex rounded-full border border-[var(--pw-border)] bg-[var(--pw-surface)] shadow-lg p-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("tutor"), className: `px-4 py-2 text-[13px] rounded-full ${view === "tutor" ? "bg-[var(--pw-accent)] text-white" : "text-[var(--pw-ink-2)]"}`, children: "Tutor" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("student"), className: `px-4 py-2 text-[13px] rounded-full ${view === "student" ? "bg-[var(--pw-accent)] text-white" : "text-[var(--pw-ink-2)]"}`, children: "Student" })
  ] });
}
function PersistentSignupLink() {
  const {
    exitDemo
  } = useDemo();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: exitDemo, className: "text-[13px] text-[var(--pw-accent)] hover:underline", children: "Sign up for free →" }) });
}
function TutorDemo() {
  const {
    data,
    lockedFeature,
    viewsForRef
  } = useDemo();
  const {
    tutor,
    courses,
    messages,
    sessions,
    review,
    earnings
  } = data;
  const totalEarnings = earnings.reduce((a, b) => a + b, 0);
  const max = Math.max(...earnings);
  const search = useSearch({
    from: "/pathwise/demo"
  });
  const refViews = search.ref ? viewsForRef(search.ref) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 mt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-[26px] leading-tight", children: tutor.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[var(--pw-accent)]/15 text-[var(--pw-accent)]", title: "Verified tutor", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6.5 10.5L4 8l1-1 1.5 1.5L11 4l1 1-5.5 5.5z" }) }),
          "Verified"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[14px] text-[var(--pw-ink-2)]", children: tutor.headline }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-[14px] leading-relaxed max-w-2xl", children: tutor.bio }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-5 space-y-2", children: tutor.credentials.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 text-[13px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[var(--pw-accent)] shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c })
      ] }, c)) }),
      search.ref && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 text-[12px] text-[var(--pw-ink-2)] pt-4 border-t border-[var(--pw-border)]", children: [
        "🔗 Your demo link ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-pw text-[var(--pw-ink)]", children: search.ref }),
        " has been viewed ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-pw text-[var(--pw-ink)]", children: refViews }),
        " ",
        refViews === 1 ? "time" : "times",
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { label: "Total earnings", value: `€${totalEarnings.toLocaleString()}`, delta: "+18% MoM" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { label: "Active students", value: String(tutor.students), delta: "+12 this month" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { label: "Avg rating", value: tutor.rating.toFixed(1), delta: `${tutor.reviews} reviews` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { label: "Course completion", value: "65%", delta: "+5pp vs avg" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pw-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[20px]", children: "Earnings · last 12 months" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)]", children: "€ MDL equivalent" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex items-end gap-2 h-40", children: earnings.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-t-md transition-all hover:opacity-80", style: {
          height: `${v / max * 100}%`,
          background: "linear-gradient(180deg, var(--pw-accent), var(--pw-accent-2))"
        }, title: `€${v}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[var(--pw-ink-2)] font-mono-pw", children: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i] })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pw-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[18px]", children: "Messages" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-[var(--pw-ink-2)]", children: "2 unread" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-3", children: messages.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { onClick: () => lockedFeature("the inbox"), className: "flex gap-3 p-3 rounded-lg hover:bg-[var(--pw-surface-2)] cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium text-white", style: {
            background: "linear-gradient(135deg, var(--pw-accent), var(--pw-accent-2))"
          }, children: m.avatar }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[14px] font-medium truncate", children: m.from }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-[var(--pw-ink-2)] shrink-0", children: m.time })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] text-[var(--pw-ink-2)] truncate", children: m.preview })
          ] }),
          m.unread && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-[var(--pw-accent)] mt-2" })
        ] }, m.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pw-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[18px]", children: "Upcoming sessions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-[var(--pw-ink-2)]", children: [
            sessions.length,
            " this week"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-3", children: sessions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 p-3 rounded-lg border border-[var(--pw-border)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 h-10 rounded-full bg-[var(--pw-accent)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[14px] font-medium", children: s.topic }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-[var(--pw-ink-2)]", children: [
              "with ",
              s.student,
              " · ",
              s.duration,
              " min"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] font-mono-pw text-right", children: s.when })
        ] }, s.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[20px]", children: "My courses" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => lockedFeature("course creation"), className: "pw-btn-outline text-[12px] px-3 py-1.5", children: "+ New course" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: courses.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32", style: {
          background: c.thumb
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-md bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)]", children: c.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600", children: "Published" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 font-display text-[16px] leading-tight", children: c.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-3 gap-2 text-[11px] text-[var(--pw-ink-2)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[var(--pw-ink)] text-[14px] font-medium", children: c.students }),
              "students"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[var(--pw-ink)] text-[14px] font-medium", children: [
                "★ ",
                c.rating
              ] }),
              c.reviews,
              " reviews"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[var(--pw-ink)] text-[14px] font-medium", children: [
                c.completion,
                "%"
              ] }),
              "completion"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-1.5 rounded-full bg-[var(--pw-surface-2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-[var(--pw-accent)]", style: {
            width: `${c.completion}%`
          } }) })
        ] })
      ] }, c.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[11px] text-[var(--pw-ink-2)] italic", children: "Demo mode — changes won't be saved." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pw-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[18px]", children: "Recent review" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center text-[12px] text-white font-medium", style: {
          background: "linear-gradient(135deg, var(--pw-accent), var(--pw-accent-2))"
        }, children: "MP" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[14px] font-medium", children: review.student }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-500 text-[12px]", children: "★".repeat(review.rating) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-[var(--pw-ink-2)]", children: [
              "on ",
              review.course
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[14px] text-[var(--pw-ink-2)]", children: [
            '"',
            review.body,
            '"'
          ] })
        ] })
      ] })
    ] })
  ] });
}
function StudentDemo() {
  const {
    data,
    lockedFeature
  } = useDemo();
  const {
    courses,
    tutor
  } = data;
  const [enrolled, setEnrolled] = reactExports.useState(null);
  const [playing, setPlaying] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 mt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-[28px]", children: "Browse courses" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] text-[var(--pw-ink-2)] mt-1", children: "This is what students see when exploring Pathwise." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: courses.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-36", style: {
        background: c.thumb
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] px-2 py-0.5 rounded-md bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)] inline-block", children: c.category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 font-display text-[17px] leading-tight", children: c.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[12px] text-[var(--pw-ink-2)]", children: [
          "by ",
          tutor.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-3 text-[12px] text-[var(--pw-ink-2)] flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "★ ",
            c.rating,
            " (",
            c.reviews,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "· ",
            c.students,
            " students"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "· ",
            c.lessons,
            " lessons · ",
            c.hours,
            "h"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-baseline gap-2", children: c.discount ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-[20px]", children: [
              "€",
              c.discount
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[12px] text-[var(--pw-ink-2)] line-through", children: [
              "€",
              c.price
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-[20px]", children: [
            "€",
            c.price
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEnrolled(c.id), className: enrolled === c.id ? "pw-btn-outline text-[12px] px-3 py-1.5" : "pw-btn-primary text-[12px] px-3 py-1.5", children: enrolled === c.id ? "✓ Enrolled" : "Enroll" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[10px] text-[var(--pw-ink-2)] italic", children: "Demo mode — payment disabled" })
      ] })
    ] }, c.id)) }),
    enrolled && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pw-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[20px]", children: "Continue learning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-[var(--pw-ink-2)]", children: "Lesson 3 of 42" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 aspect-video rounded-lg bg-black overflow-hidden flex items-center justify-center relative", children: playing ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white/70 text-sm", children: "▶ Playing sample lesson…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPlaying(true), className: "w-16 h-16 rounded-full bg-white/90 text-black flex items-center justify-center text-2xl", children: "▶" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-1.5 rounded-full bg-[var(--pw-surface-2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-[var(--pw-accent)]", style: {
        width: "12%"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[12px] text-[var(--pw-ink-2)]", children: "12% complete · keep going to earn your certificate" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => lockedFeature("certificates"), className: "mt-3 text-[12px] text-[var(--pw-accent)] hover:underline", children: "Get my certificate →" })
    ] })
  ] });
}
function Kpi({
  label,
  value,
  delta
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--pw-accent)]/40 cursor-default", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-[var(--pw-ink-2)] font-mono-pw", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[26px] mt-1", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-emerald-600 mt-1", children: delta })
  ] });
}
function ConvertCTA() {
  const {
    exitDemo
  } = useDemo();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12 pw-card p-8 text-center", style: {
    background: "linear-gradient(135deg, var(--pw-accent-soft), var(--pw-surface))"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase tracking-wider text-[var(--pw-ink-2)]", children: "You're in demo mode" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-[28px]", children: "Ready to make it real?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[14px] text-[var(--pw-ink-2)] max-w-lg mx-auto", children: "Sign up to keep your courses, students, and earnings. Free to start — no credit card." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex gap-3 justify-center flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: exitDemo, className: "pw-btn-primary px-6 py-3 text-[14px]", children: "Create my real account →" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "pw-btn-outline px-6 py-3 text-[14px]", children: "Back to home" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-[11px] text-[var(--pw-ink-2)]", children: "Demo data is not saved. Sessions reset after 1 hour." })
  ] });
}
export {
  DemoPage as component
};
