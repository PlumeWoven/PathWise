import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { e as Route$p, P as PWHeader } from "./router-C4GolrgT.mjs";
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
function DemoEntry() {
  const {
    ref
  } = Route$p.useSearch();
  const navigate = useNavigate();
  const start = (as) => {
    navigate({
      to: "/pathwise/demo",
      search: {
        as,
        ref: ref || void 0,
        code: void 0
      }
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-pw text-[11px] uppercase tracking-wider text-[var(--pw-accent)]", children: "Live Demo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-3 font-display text-[36px] sm:text-[46px] leading-tight", children: [
        "Experience Pathwise ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic", children: "in 60 seconds" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-[15px] text-[var(--pw-ink-2)] max-w-xl mx-auto", children: "Explore the full platform with realistic sample data. No signup, no credit card. Your demo session lasts 60 minutes — choose which experience you want to start with." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 grid sm:grid-cols-2 gap-4 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => start("tutor"), className: "pw-card p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 hover:border-[var(--pw-accent)] group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: "👩‍🏫" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 font-display text-[20px]", children: "I want to see the Tutor experience" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[13px] text-[var(--pw-ink-2)]", children: "Dashboard with earnings, students, courses, messages — everything tutors get." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-[13px] text-[var(--pw-accent)] font-medium", children: "Start as Tutor →" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => start("student"), className: "pw-card p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 hover:border-[var(--pw-accent)] group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: "🎓" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 font-display text-[20px]", children: "I want to see the Student experience" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[13px] text-[var(--pw-ink-2)]", children: "Browse courses, enroll, and follow a sample learning roadmap." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-[13px] text-[var(--pw-accent)] font-medium", children: "Start as Student →" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-8 text-[12px] text-[var(--pw-ink-2)]", children: [
        "Already exploring? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/pathwise/demo", className: "text-[var(--pw-accent)] hover:underline", children: "Resume your demo" }),
        " · ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-[var(--pw-accent)] hover:underline", children: "Back to home" })
      ] })
    ] })
  ] });
}
export {
  DemoEntry as component
};
