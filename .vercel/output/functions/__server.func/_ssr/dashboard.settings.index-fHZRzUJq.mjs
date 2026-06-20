import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
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
function DashboardSettingsIndex() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl mb-4", children: "Settings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Choose a setting category:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/settings/verification", className: "text-[var(--pw-accent)] underline", children: "Verification" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/calendar", className: "text-[var(--pw-accent)] underline", children: "Availability (Calendar)" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/courses", className: "text-[var(--pw-accent)] underline", children: "Courses" }) })
    ] })
  ] });
}
export {
  DashboardSettingsIndex as component
};
