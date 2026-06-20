import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase, P as PWHeader } from "./router-C4GolrgT.mjs";
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
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = reactExports.useState(false);
  const [password, setPassword] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [info, setInfo] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const {
      data: sub
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    const {
      error: err
    } = await supabase.auth.updateUser({
      password
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setInfo("Password updated. Redirecting...");
    setTimeout(() => navigate({
      to: "/"
    }), 1200);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-5 sm:px-8 py-12 max-w-md mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-[32px] leading-tight", children: "Set a new password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[14px] text-[var(--pw-ink-2)]", children: "Choose a new password for your PathWise account." }),
      !ready ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-[14px] text-[var(--pw-ink-2)]", children: "Verifying your reset link..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "New password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Confirm password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", required: true, value: confirm, onChange: (e) => setConfirm(e.target.value), className: "mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]" })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px]", style: {
          color: "var(--pw-danger)"
        }, children: error }),
        info && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px]", style: {
          color: "var(--pw-accent-2)"
        }, children: info }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: submitting, className: "pw-btn-primary w-full inline-flex justify-center items-center px-6 py-3 text-[15px] font-medium disabled:opacity-50", children: submitting ? "Updating..." : "Update password" })
      ] })
    ] })
  ] });
}
export {
  ResetPasswordPage as component
};
