import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
function getInitials(name) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "·";
}
const TUTOR_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "📊", to: "/dashboard" },
  { key: "courses", label: "My Courses", icon: "📚", to: "/dashboard/courses" },
  { key: "calendar", label: "Calendar", icon: "📅", to: "/dashboard/calendar" },
  { key: "messages", label: "Messages", icon: "💬", to: "/dashboard/messages" },
  { key: "earnings", label: "Earnings", icon: "💰", to: "/dashboard/earnings" },
  { key: "analytics", label: "Analytics", icon: "📈", to: "/dashboard/analytics" },
  { key: "settings", label: "Settings", icon: "⚙️", to: "/dashboard/settings" }
];
const STUDENT_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "📊", to: "/roadmap" },
  { key: "courses", label: "Browse courses", icon: "📚", to: "/find-tutor" },
  { key: "sessions", label: "My sessions", icon: "📅", to: "/sessions" },
  { key: "messages", label: "Messages", icon: "💬" },
  { key: "progress", label: "Progress", icon: "📈" },
  { key: "settings", label: "Settings", icon: "⚙️" }
];
function DashboardShell({
  role = "tutor",
  user,
  isDemo,
  banner,
  onExit,
  activeKey,
  onItemClick,
  children
}) {
  const [open, setOpen] = reactExports.useState(false);
  const items = role === "tutor" ? TUTOR_ITEMS : STUDENT_ITEMS;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)] flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        "aria-label": "Open menu",
        onClick: () => setOpen(true),
        className: "lg:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-md pw-card flex items-center justify-center",
        children: "☰"
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden fixed inset-0 z-40 bg-black/40", onClick: () => setOpen(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "aside",
      {
        className: `fixed lg:sticky top-0 left-0 z-40 h-screen w-[260px] shrink-0 flex flex-col border-r border-[var(--pw-border)] bg-[var(--pw-surface)]/80 backdrop-blur-md transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-5 border-b border-[var(--pw-border)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "font-display italic text-[22px] text-[var(--pw-ink)]", children: "PathWise" }),
            isDemo && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full bg-[var(--pw-accent)]/15 text-[var(--pw-accent)] font-mono-pw uppercase tracking-wider", children: "Demo" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 flex items-center gap-3 border-b border-[var(--pw-border)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold text-white shrink-0",
                style: { background: "linear-gradient(135deg, var(--pw-accent), var(--pw-accent-2))" },
                "aria-hidden": true,
                children: getInitials(user.name)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[14px] font-medium truncate", children: user.name }),
              user.subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-[var(--pw-ink-2)] truncate", children: user.subtitle })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 overflow-y-auto py-3 px-2", children: items.map((item) => {
            const isActive = activeKey ? activeKey === item.key : item.to ? pathname === item.to || pathname.startsWith(item.to + "/") : false;
            const className = `relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${isActive ? "bg-[var(--pw-accent-soft)] text-[var(--pw-accent)] font-medium" : "text-[var(--pw-ink)] hover:bg-[var(--pw-surface-2)]"}`;
            const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[var(--pw-accent)]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px] leading-none", children: item.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label })
            ] });
            if (item.to && !onItemClick) {
              return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: item.to, onClick: () => setOpen(false), className, children: inner }, item.key);
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  onItemClick?.(item.key);
                  setOpen(false);
                },
                className,
                children: inner
              },
              item.key
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 border-t border-[var(--pw-border)]", children: isDemo ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: onExit,
              className: "w-full text-[13px] py-2 rounded-md pw-border-accent text-[var(--pw-accent)] hover:bg-[var(--pw-accent-soft)]",
              children: "← Exit Demo"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/",
              className: "block text-center text-[13px] py-2 rounded-md text-[var(--pw-ink-2)] hover:bg-[var(--pw-surface-2)]",
              children: "Sign out"
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      banner,
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "px-5 sm:px-8 pt-14 lg:pt-6 pb-24 max-w-7xl mx-auto", children })
    ] })
  ] });
}
export {
  DashboardShell as D
};
