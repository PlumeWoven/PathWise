import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, O as Outlet } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, P as PWHeader } from "./router-C4GolrgT.mjs";
import { D as DashboardShell } from "./TutorSidebar-BaNldSBv.mjs";
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
function RequireOnboarding({ children }) {
  const { loading, isLoggedIn, profile, openLogin } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    if (profile && !profile.onboarding_completed) {
      const target = profile.role === "tutor" ? "/onboarding/tutor" : "/onboarding/student";
      navigate({ to: target });
    }
  }, [loading, isLoggedIn, profile, openLogin, navigate]);
  if (loading) return null;
  if (!isLoggedIn) return null;
  if (profile && !profile.onboarding_completed) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
function DashboardLayout() {
  const {
    isLoggedIn,
    role,
    loading,
    openLogin,
    user,
    profile
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    if (role && role !== "tutor" && role !== "both") {
      navigate({
        to: "/"
      });
    }
  }, [loading, isLoggedIn, role, openLogin, navigate]);
  if (loading || !isLoggedIn) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "px-5 sm:px-8 py-20 max-w-md mx-auto text-center text-[14px] text-[var(--pw-ink-2)]", children: "Loading…" })
    ] });
  }
  if (role !== "tutor" && role !== "both") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RequireOnboarding, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardShell, { role: "tutor", user: {
      name: profile?.display_name ?? user?.name ?? "Tutor",
      avatar: profile?.avatar_url ?? void 0,
      subtitle: profile?.full_name ?? void 0
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] }) });
}
export {
  DashboardLayout as component
};
