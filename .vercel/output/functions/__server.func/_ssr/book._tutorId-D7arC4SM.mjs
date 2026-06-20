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
const SplitErrorComponent = ({
  error
}) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-6 max-w-md text-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-xl", children: "Booking unavailable" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--pw-ink-2)] mt-2", children: error.message }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/matches", className: "pw-btn-outline mt-4 inline-block px-4 py-2 text-sm", children: "Back to matches" })
] }) });
export {
  SplitErrorComponent as errorComponent
};
