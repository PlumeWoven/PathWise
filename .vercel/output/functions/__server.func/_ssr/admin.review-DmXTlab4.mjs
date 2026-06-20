import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAuth, s as supabase, P as PWHeader, B as Button } from "./router-C4GolrgT.mjs";
import { u as updateCourse } from "./courses-Cd8L0VyP.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { O as LoaderCircle, e as Check, X } from "../_libs/lucide-react.mjs";
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
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/date-fns.mjs";
import "../_libs/date-fns-tz.mjs";
function AdminReview() {
  const {
    profile,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (loading) return;
    if (!profile || profile.role !== "admin") {
      toast.error("Admin access required");
      navigate({
        to: "/"
      });
      return;
    }
    supabase.from("courses").select("*").eq("status", "under_review").order("updated_at", {
      ascending: false
    }).then(({
      data,
      error
    }) => {
      if (error) toast.error(error.message);
      setItems(data ?? []);
    });
  }, [loading, profile, navigate]);
  const decide = async (c, status) => {
    try {
      await updateCourse(c.id, {
        status
      });
      setItems((arr) => arr ? arr.filter((x) => x.id !== c.id) : arr);
      toast.success(status === "published" ? "Approved" : "Sent back to draft");
    } catch (e) {
      toast.error(e.message ?? "Failed");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-4xl mx-auto px-5 sm:px-8 pb-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl mb-1", children: "Course Review Queue" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] text-[var(--pw-ink-2)] mb-6", children: items ? `${items.length} courses awaiting review` : "Loading…" }),
      !items ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin text-[var(--pw-ink-2)]" }) }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20 text-[var(--pw-ink-2)]", children: "Nothing to review right now." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: items.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4 flex gap-4 items-center", children: [
        c.thumbnail_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.thumbnail_url, alt: "", className: "size-20 rounded object-cover" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: c.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)] truncate", children: c.subtitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-[var(--pw-ink-2)] mt-1", children: [
            c.category,
            " · ",
            c.difficulty,
            " · ",
            c.price,
            " ",
            c.currency
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
          c.slug && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/courses/${c.slug}`, target: "_blank", rel: "noreferrer", className: "text-[12px] underline text-[var(--pw-ink-2)] text-center", children: "Preview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => decide(c, "published"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }),
            " Approve"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => decide(c, "draft"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }),
            " Reject"
          ] })
        ] })
      ] }, c.id)) })
    ] })
  ] });
}
export {
  AdminReview as component
};
