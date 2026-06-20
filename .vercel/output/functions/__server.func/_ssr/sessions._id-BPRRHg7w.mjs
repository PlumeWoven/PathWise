import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { i as Route$i, u as useAuth, P as PWHeader, s as supabase } from "./router-C4GolrgT.mjs";
import { S as STATUS_META, O as ORDERED_STATES, t as transitionSession } from "./sessions-cwg9I1VF.mjs";
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
function SessionStateTracker({ status }) {
  const isFinal = status === "cancelled" || status === "disputed";
  const currentIdx = ORDERED_STATES.indexOf(status === "reminder_sent" ? "confirmed" : status);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-3", children: "Session lifecycle" }),
    isFinal ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-lg p-3 text-[13px]",
        style: { background: STATUS_META[status].bg, color: STATUS_META[status].fg },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[15px]", children: STATUS_META[status].label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-80 mt-0.5", children: STATUS_META[status].description })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 overflow-x-auto pb-1", children: ORDERED_STATES.map((s, i) => {
      const done = i < currentIdx;
      const active = i === currentIdx;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "rounded-full w-7 h-7 flex items-center justify-center text-[11px] font-mono-pw font-medium",
            style: {
              background: done || active ? "var(--pw-accent)" : "var(--pw-surface-2)",
              color: done || active ? "white" : "var(--pw-ink-2)"
            },
            "aria-current": active ? "step" : void 0,
            children: done ? "✓" : i + 1
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[11px] ${active ? "font-medium" : "text-[var(--pw-ink-2)]"}`, children: STATUS_META[s].label }),
        i < ORDERED_STATES.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-px", style: { background: done ? "var(--pw-accent)" : "var(--pw-border)" } })
      ] }, s);
    }) })
  ] });
}
function SessionDetail() {
  const {
    id
  } = Route$i.useParams();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = reactExports.useState(null);
  const [tutor, setTutor] = reactExports.useState(null);
  const [student, setStudent] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [reviewBody, setReviewBody] = reactExports.useState("");
  const [reviewRating, setReviewRating] = reactExports.useState(5);
  const [cancelReason, setCancelReason] = reactExports.useState("");
  const [showCancel, setShowCancel] = reactExports.useState(false);
  async function load() {
    setLoading(true);
    const {
      data,
      error
    } = await supabase.from("sessions").select("id, student_id, tutor_id, scheduled_start, scheduled_end, duration_minutes, timezone, session_type, amount, meeting_url, notes, rating, status_v2, payment_status, cancellation_reason").eq("id", id).maybeSingle();
    if (error || !data) {
      setLoading(false);
      return;
    }
    const s = data;
    setSession(s);
    if (s.tutor_id) {
      const {
        data: t
      } = await supabase.from("profiles").select("display_name, avatar_url").eq("id", s.tutor_id).maybeSingle();
      setTutor(t);
    }
    if (s.student_id) {
      const {
        data: st
      } = await supabase.from("profiles").select("display_name, avatar_url").eq("id", s.student_id).maybeSingle();
      setStudent(st);
    }
    setLoading(false);
  }
  reactExports.useEffect(() => {
    void load();
  }, [id]);
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-sm", children: "Loading…" })
  ] });
  if (!session) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center", children: "Session not found." })
  ] });
  const isTutor = user?.id === session.tutor_id;
  const isStudent = user?.id === session.student_id;
  const start = session.scheduled_start ? new Date(session.scheduled_start) : null;
  session.scheduled_end ? new Date(session.scheduled_end) : null;
  const meta = STATUS_META[session.status_v2];
  const minsToStart = start ? (start.getTime() - Date.now()) / 6e4 : Infinity;
  const canJoin = (session.status_v2 === "confirmed" || session.status_v2 === "reminder_sent" || session.status_v2 === "in_progress") && minsToStart <= 5 && minsToStart > -((session.duration_minutes ?? 60) + 30);
  const isUpcoming = ["scheduled", "confirmed", "reminder_sent"].includes(session.status_v2);
  const canReschedule = isUpcoming && minsToStart > 24 * 60;
  const canCancel = isUpcoming;
  async function doTransition(to, opts = {
    title: ""
  }) {
    if (!user) return;
    try {
      await transitionSession({
        sessionId: id,
        to,
        by: user.id,
        reason: opts.reason,
        patch: opts.patch,
        notify: {
          title: opts.title,
          message: opts.message,
          link: `/sessions/${id}`
        }
      });
      toast.success(`Session ${to.replace("_", " ")}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update session");
    }
  }
  async function handleJoin() {
    const s = session;
    if (s && s.status_v2 !== "in_progress") {
      await doTransition("in_progress", {
        patch: {
          actual_start: (/* @__PURE__ */ new Date()).toISOString()
        },
        title: "Session started"
      });
    }
    if (s?.meeting_url) window.open(s.meeting_url, "_blank");
  }
  async function handleComplete() {
    await doTransition("completed", {
      patch: {
        actual_end: (/* @__PURE__ */ new Date()).toISOString()
      },
      title: "Session completed",
      message: "Don't forget to leave a review"
    });
    setTimeout(() => doTransition("awaiting_review", {
      title: "Review window open",
      message: "You have 48h to leave feedback"
    }), 600);
  }
  async function handleCancel() {
    if (!cancelReason.trim()) {
      toast.error("Please give a reason");
      return;
    }
    await doTransition("cancelled", {
      reason: cancelReason,
      patch: {
        cancellation_reason: cancelReason,
        cancelled_by: user?.id,
        payment_status: "refunded"
      },
      title: "Session cancelled",
      message: cancelReason
    });
    setShowCancel(false);
  }
  async function handleSubmitReview() {
    const s = session;
    if (!user || !s?.tutor_id) return;
    try {
      await supabase.from("reviews").insert({
        student_id: user.id,
        tutor_id: s.tutor_id,
        rating: reviewRating,
        body: reviewBody || null
      });
      await doTransition("closed", {
        title: "Thanks for your review!"
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-5 sm:px-8 pb-24 max-w-3xl mx-auto pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-[var(--pw-ink-2)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sessions", className: "underline-offset-2 hover:underline", children: "My sessions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-2", children: "→" }),
        "Session details"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl", children: "Session" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill text-[12px] px-2.5 py-0.5 font-medium", style: {
          background: meta.bg,
          color: meta.fg
        }, children: meta.label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PersonCard, { label: "Tutor", person: tutor }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PersonCard, { label: "Student", person: student })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pw-card p-5 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Date & time", value: start ? start.toLocaleString(void 0, {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: session.timezone ?? void 0
        }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Timezone", value: session.timezone ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Type", value: session.session_type ?? "Standard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Duration", value: `${session.duration_minutes ?? 60} min` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Amount", value: Number(session.amount ?? 0) === 0 ? "Free" : `$${session.amount}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Payment", value: session.payment_status }),
        session.cancellation_reason && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Reason", value: session.cancellation_reason })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SessionStateTracker, { status: session.status_v2 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleJoin, disabled: !canJoin, className: "pw-btn-primary px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed", title: !canJoin ? "Available 5 min before start" : void 0, children: session.status_v2 === "in_progress" ? "Re-join session" : "Join session" }),
        (isTutor || isStudent) && session.status_v2 === "scheduled" && isTutor && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => doTransition("confirmed", {
          title: "Session confirmed"
        }), className: "pw-btn-outline px-4 py-2 text-sm", children: "Accept booking" }),
        (isTutor || isStudent) && session.status_v2 === "in_progress" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleComplete, className: "pw-btn-outline px-4 py-2 text-sm", children: "Mark completed" }),
        canReschedule && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
          to: "/book/$tutorId",
          params: {
            tutorId: session.tutor_id ?? ""
          }
        }), className: "pw-btn-outline px-4 py-2 text-sm", children: "Reschedule" }),
        canCancel && !showCancel && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowCancel(true), className: "pw-btn-outline px-4 py-2 text-sm", style: {
          color: "var(--pw-danger)"
        }, children: "Cancel" })
      ] }),
      showCancel && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pw-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Reason" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: cancelReason, onChange: (e) => setCancelReason(e.target.value), rows: 3, className: "mt-1 w-full pw-border rounded-md px-3 py-2 text-sm bg-white", placeholder: "Schedule conflict, no longer needed, etc." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCancel, className: "pw-btn-primary px-4 py-2 text-sm", style: {
            background: "var(--pw-danger)"
          }, children: "Confirm cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowCancel(false), className: "pw-btn-outline px-4 py-2 text-sm", children: "Keep session" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pw-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--pw-ink)] mt-1 whitespace-pre-wrap", children: session.notes || "—" })
      ] }),
      isStudent && session.status_v2 === "awaiting_review" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pw-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg", children: "How did it go?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 mt-2", children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setReviewRating(n), className: "text-2xl", style: {
          color: n <= reviewRating ? "var(--pw-accent)" : "var(--pw-border)"
        }, children: "★" }, n)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: reviewBody, onChange: (e) => setReviewBody(e.target.value), rows: 3, className: "mt-3 w-full pw-border rounded-md px-3 py-2 text-sm bg-white", placeholder: "Tell other students about this tutor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSubmitReview, className: "pw-btn-primary px-4 py-2 text-sm mt-3", children: "Submit review" })
      ] })
    ] })
  ] });
}
function PersonCard({
  label,
  person
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-4 flex items-center gap-3", children: [
    person?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: person.avatar_url, alt: "", className: "w-12 h-12 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-[var(--pw-surface-2)] flex items-center justify-center font-display", children: (person?.display_name ?? "?")[0] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[15px]", children: person?.display_name ?? "—" })
    ] })
  ] });
}
function Row({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[14px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)]", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right ml-3", children: value })
  ] });
}
export {
  SessionDetail as component
};
