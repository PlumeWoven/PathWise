import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, P as PWHeader, s as supabase } from "./router-C4GolrgT.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
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
function StudentOnboarding() {
  const {
    loading,
    isLoggedIn,
    profile,
    refreshProfile,
    openLogin
  } = useAuth();
  const navigate = useNavigate();
  const [grade, setGrade] = reactExports.useState("");
  const [goal, setGoal] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading && !isLoggedIn) openLogin();
    if (!loading && profile?.onboarding_completed) navigate({
      to: "/roadmap"
    });
  }, [loading, isLoggedIn, profile, openLogin, navigate]);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    const {
      error
    } = await supabase.from("profiles").update({
      grade: grade === "" ? null : Number(grade),
      bio: goal || null,
      onboarding_completed: true
    }).eq("id", profile.id);
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't save onboarding. Please try again.");
      return;
    }
    await refreshProfile();
    navigate({
      to: "/roadmap"
    });
  }
  if (loading || !profile) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-[560px] mx-auto px-5 sm:px-8 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Step 1 of 1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-[36px] leading-tight mt-2", children: [
        "Welcome, ",
        profile.full_name || profile.display_name,
        " 🎓"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[15px] text-[var(--pw-ink-2)]", children: "A couple of details so we can tailor your roadmap." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mt-8 space-y-5 pw-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Grade level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: grade, onChange: (e) => setGrade(e.target.value === "" ? "" : Number(e.target.value)), className: "mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select grade…" }),
            [6, 7, 8, 9, 10, 11, 12].map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: g, children: [
              "Grade ",
              g
            ] }, g)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 13, children: "University / Other" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "What's your goal?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { required: true, rows: 3, value: goal, onChange: (e) => setGoal(e.target.value), placeholder: "e.g. Pass my algebra final, prep for SAT…", className: "mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: submitting, className: "pw-btn-primary w-full inline-flex justify-center items-center px-6 py-3 text-[15px] font-medium disabled:opacity-50", children: submitting ? "Saving…" : "Continue to my roadmap →" })
      ] })
    ] })
  ] });
}
export {
  StudentOnboarding as component
};
