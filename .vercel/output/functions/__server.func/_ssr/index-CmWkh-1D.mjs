import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, P as PWHeader } from "./router-C4GolrgT.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import "../_libs/sonner.mjs";
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
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/date-fns.mjs";
import "../_libs/date-fns-tz.mjs";
function DemoBanner() {
  const [hidden, setHidden] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    setHidden(localStorage.getItem("pw-demo-banner-hidden") === "1");
  }, []);
  if (hidden) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-5 right-5 z-40 max-w-[340px] pw-card p-4 shadow-2xl border border-[var(--pw-border)] backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: "🎬" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[15px] leading-tight", children: "Want to see how Pathwise works?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[12px] text-[var(--pw-ink-2)]", children: "No signup. Explore the full tutor & student experience with sample data." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/pathwise/demo", className: "pw-btn-primary text-[12px] px-3 py-1.5", children: "Try Demo Mode →" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              localStorage.setItem("pw-demo-banner-hidden", "1");
              setHidden(true);
            },
            className: "text-[12px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] px-2",
            children: "Dismiss"
          }
        )
      ] })
    ] })
  ] }) });
}
function Hero() {
  const {
    openLogin,
    role,
    isLoggedIn
  } = useAuth();
  const isStudent = isLoggedIn && (role === "student" || role === "both");
  const isTutor = isLoggedIn && role === "tutor";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-5 sm:px-8 pb-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto grid lg:grid-cols-[1fr_360px] gap-12 items-center pt-8 lg:pt-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-[560px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-[44px] sm:text-[56px] leading-[1.05] tracking-tight", children: [
            "Find exactly",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "where you stand."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-[17px] sm:text-[18px] leading-relaxed text-[var(--pw-ink-2)]", children: "A 3-minute quiz reveals your level, builds your roadmap, and finds the right tutor. No guesswork. No wasted sessions." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-7 inline-flex items-center divide-x divide-[var(--pw-border)] font-mono-pw text-[13px] text-[var(--pw-ink-2)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 first:pl-0", children: "⚡ 3 min avg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3", children: "🎯 94% accuracy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3", children: "👤 No signup" })
          ] }),
          isTutor ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "pw-btn-primary inline-flex w-full sm:w-auto justify-center items-center px-7 py-4 text-[16px] font-medium", children: "Go to your dashboard →" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[12px] text-[var(--pw-ink-2)]", children: "Manage your students, sessions and earnings." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-col sm:flex-row gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/quiz", className: "pw-btn-primary inline-flex justify-center items-center px-7 py-4 text-[16px] font-medium", children: "Start your level check →" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/find-tutor", className: "pw-btn-outline inline-flex justify-center items-center px-7 py-4 text-[16px] font-medium", children: "Find a tutor →" })
          ] }),
          !isTutor && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[12px] text-[var(--pw-ink-2)]", children: "Free · No account required · 3 minutes" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-6 relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Sample roadmap" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 relative pl-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-3 top-2 bottom-2 border-l-2 border-dashed border-[var(--pw-border)]" }),
            [{
              t: "Foundations",
              s: "Stage 01",
              done: true
            }, {
              t: "Core Skills",
              s: "Stage 02",
              done: false
            }, {
              t: "Your Goal",
              s: "Stage 05",
              done: false,
              goal: true
            }].map((n, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-6 last:mb-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -left-[22px] top-1 w-4 h-4 rounded-full", style: {
                background: n.done ? "var(--pw-accent)" : "var(--pw-surface)",
                border: "2px solid " + (n.goal ? "var(--pw-accent-2)" : "var(--pw-border)")
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: n.s }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[18px] leading-tight", children: n.t })
            ] }, i))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-[11px] text-[var(--pw-ink-2)]", children: "Built from your quiz results." })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-chev text-[var(--pw-ink-2)] text-2xl", children: "⌄" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-5xl mx-auto mt-20", id: "get-started", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Choose your path" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[32px] sm:text-[40px] mt-2", children: "Are you here to learn or to teach?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-5 mt-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PathCard, { emoji: "🎓", title: "I'm a Student", points: ["Take a free 3-min level quiz", "Or jump into the tutor-match quiz", "Match with a verified tutor"], cta: isStudent ? "Find a tutor →" : "Start as a Student →", onClick: isStudent ? () => {
            window.location.href = "/find-tutor";
          } : openLogin }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PathCard, { emoji: "👨‍🏫", title: "I'm a Tutor", points: ["Build your verified tutor profile", "Connect with matched students", "Track sessions and earnings"], cta: isTutor ? "Open dashboard →" : "Join as a Tutor →", onClick: isTutor ? () => {
            window.location.href = "/dashboard";
          } : openLogin })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DemoBanner, {})
  ] });
}
function PathCard({
  emoji,
  title,
  points,
  cta,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-7 flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: emoji }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-[24px] mt-3", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-2 text-[14px] text-[var(--pw-ink-2)]", children: points.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
        color: "var(--pw-accent)"
      }, children: "✓" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p })
    ] }, p)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick, className: "pw-btn-primary mt-6 inline-flex justify-center items-center px-5 py-3 text-[15px] font-medium", children: cta })
  ] });
}
export {
  Hero as component
};
