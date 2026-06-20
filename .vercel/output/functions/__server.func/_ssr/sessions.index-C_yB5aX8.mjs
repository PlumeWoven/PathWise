import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, s as supabase, P as PWHeader } from "./router-C4GolrgT.mjs";
import { S as STATUS_META } from "./sessions-cwg9I1VF.mjs";
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
const FILTERS = [{
  id: "all",
  label: "All"
}, {
  id: "upcoming",
  label: "Upcoming"
}, {
  id: "past",
  label: "Past"
}, {
  id: "cancelled",
  label: "Cancelled"
}];
function SessionsList() {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const [rows, setRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [filter, setFilter] = reactExports.useState("upcoming");
  reactExports.useEffect(() => {
    if (!user) return;
    void (async () => {
      setLoading(true);
      const {
        data
      } = await supabase.from("sessions").select("id, scheduled_start, status_v2, session_type, amount, tutor_id, student_id").or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`).order("scheduled_start", {
        ascending: false
      });
      const list = data ?? [];
      const otherIds = Array.from(new Set(list.map((r) => r.student_id === user.id ? r.tutor_id : r.student_id).filter(Boolean)));
      if (otherIds.length) {
        const {
          data: profs
        } = await supabase.from("profiles").select("id, display_name").in("id", otherIds);
        const map = new Map((profs ?? []).map((p) => [p.id, p.display_name]));
        list.forEach((r) => {
          const oid = r.student_id === user.id ? r.tutor_id : r.student_id;
          r.other_name = oid ? map.get(oid) ?? null : null;
        });
      }
      setRows(list);
      setLoading(false);
    })();
  }, [user]);
  if (authLoading) return null;
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-sm", children: "Sign in to see your sessions." })
    ] });
  }
  const now = Date.now();
  const filtered = rows.filter((r) => {
    if (filter === "all") return true;
    if (filter === "cancelled") return r.status_v2 === "cancelled";
    const start = r.scheduled_start ? new Date(r.scheduled_start).getTime() : 0;
    if (filter === "upcoming") return start >= now && r.status_v2 !== "cancelled";
    return start < now || ["completed", "awaiting_review", "closed"].includes(r.status_v2);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-5 sm:px-8 pb-24 max-w-3xl mx-auto pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl", children: "My sessions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex gap-2", children: FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f.id), className: "pw-pill text-[12px] px-3 py-1.5", style: {
        background: filter === f.id ? "var(--pw-accent)" : "var(--pw-surface-2)",
        color: filter === f.id ? "white" : "var(--pw-ink)"
      }, children: f.label }, f.id)) }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-sm text-[var(--pw-ink-2)]", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 pw-card p-6 text-center text-sm text-[var(--pw-ink-2)]", children: [
        "Nothing here yet. ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/matches", className: "text-[var(--pw-accent)] underline", children: "Find a tutor →" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2", children: filtered.map((r) => {
        const meta = STATUS_META[r.status_v2];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sessions/$id", params: {
          id: r.id
        }, className: "pw-card p-4 flex items-center justify-between hover:border-[var(--pw-accent)] transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[15px]", children: r.other_name ?? "Session" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-[var(--pw-ink-2)]", children: [
              r.scheduled_start ? new Date(r.scheduled_start).toLocaleString(void 0, {
                dateStyle: "medium",
                timeStyle: "short"
              }) : "—",
              " · ",
              r.session_type ?? "session"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill text-[11px] px-2.5 py-0.5", style: {
            background: meta.bg,
            color: meta.fg
          }, children: meta.label })
        ] }, r.id);
      }) })
    ] })
  ] });
}
export {
  SessionsList as component
};
