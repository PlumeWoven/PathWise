import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAuth, s as supabase, V as VerificationBadge, f as statusToTier } from "./router-C4GolrgT.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { F as startOfMonth, J as subMonths, f as format, G as startOfWeek, I as formatDistanceToNow } from "../_libs/date-fns.mjs";
import { R as ResponsiveContainer, L as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Line } from "../_libs/recharts.mjs";
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
import "../_libs/date-fns-tz.mjs";
import "../_libs/lodash.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
function UnverifiedBanner() {
  const { profile, role } = useAuth();
  if (!profile) return null;
  const isTutor = role === "tutor" || role === "both";
  if (!isTutor) return null;
  if (profile.verification_status === "verified") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "mt-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3",
      style: { background: "var(--pw-accent-soft)", border: "1px solid var(--pw-accent)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "text-[20px] leading-none", children: "🛡️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[14px] font-medium text-[var(--pw-ink)]", children: "Get verified to appear higher in search results and earn 3× more bookings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)] mt-0.5", children: "Verification takes 1–2 minutes. Upload a government ID and a quick selfie." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/settings/verification",
            className: "pw-btn-primary px-4 py-2 text-[13px] whitespace-nowrap",
            children: "Get verified →"
          }
        )
      ]
    }
  );
}
function DashboardHome() {
  const {
    user,
    profile
  } = useAuth();
  const tutorId = user?.id;
  const [earnings, setEarnings] = reactExports.useState([]);
  const [sessions, setSessions] = reactExports.useState([]);
  const [reviews, setReviews] = reactExports.useState([]);
  const [leads, setLeads] = reactExports.useState([]);
  const [students, setStudents] = reactExports.useState([]);
  const [tutorProfile, setTutorProfile] = reactExports.useState(null);
  const [availabilityCount, setAvailabilityCount] = reactExports.useState(0);
  const [dataLoading, setDataLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!tutorId) return;
    let cancelled = false;
    (async () => {
      setDataLoading(true);
      try {
        const sinceMs = Date.now() - 1e3 * 60 * 60 * 24 * 90;
        const [earnRes, sessRes, revRes, leadRes, relRes, profRes, availRes] = await Promise.all([supabase.from("tutor_earnings").select("id, amount, earned_at").eq("tutor_id", tutorId).gte("earned_at", new Date(sinceMs).toISOString()), supabase.from("sessions").select("id, scheduled_at, student_id, subject, session_type, meeting_url").eq("tutor_id", tutorId).order("scheduled_at", {
          ascending: true
        }), supabase.from("reviews").select("id, rating, body, created_at, student_id").eq("tutor_id", tutorId).order("created_at", {
          ascending: false
        }).limit(10), supabase.from("lead_events").select("stage").eq("tutor_id", tutorId), supabase.from("tutor_students").select("student_id").eq("tutor_id", tutorId), supabase.from("profiles").select("id, display_name, avatar_url, bio, video_intro_url, subject_specialties, hourly_rate").eq("id", tutorId).maybeSingle(), supabase.from("tutor_availability").select("id", {
          count: "exact",
          head: true
        }).eq("user_id", tutorId)]);
        const studentIds = Array.from(/* @__PURE__ */ new Set([...(relRes.data ?? []).map((r) => r.student_id), ...(sessRes.data ?? []).map((r) => r.student_id).filter(Boolean), ...(revRes.data ?? []).map((r) => r.student_id).filter(Boolean)])).filter(Boolean);
        const profilesRes = studentIds.length ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", studentIds) : {
          data: [],
          error: null
        };
        if (cancelled) return;
        setEarnings((earnRes.data ?? []).map((e) => ({
          ...e,
          amount: Number(e.amount)
        })));
        setSessions(sessRes.data ?? []);
        setReviews(revRes.data ?? []);
        setLeads(leadRes.data ?? []);
        setStudents(profilesRes.data ?? []);
        setTutorProfile(profRes.data ?? null);
        setAvailabilityCount(availRes.count ?? 0);
      } catch (err) {
        console.error("[dashboard]", err);
        toast.error("Failed to load some dashboard data.");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tutorId]);
  const greeting = reactExports.useMemo(() => {
    const h = (/* @__PURE__ */ new Date()).getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);
  const now = /* @__PURE__ */ new Date();
  const mtdStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const earningsMTD = earnings.filter((e) => new Date(e.earned_at) >= mtdStart).reduce((s, e) => s + e.amount, 0);
  const earningsLastMonth = earnings.filter((e) => {
    const d = new Date(e.earned_at);
    return d >= lastMonthStart && d < mtdStart;
  }).reduce((s, e) => s + e.amount, 0);
  const earningsChange = pctChange(earningsMTD, earningsLastMonth);
  const sessionsThisMonth = sessions.filter((s) => s.scheduled_at && new Date(s.scheduled_at) >= mtdStart);
  const sessionsLastMonth = sessions.filter((s) => s.scheduled_at && new Date(s.scheduled_at) >= lastMonthStart && new Date(s.scheduled_at) < mtdStart);
  const sessionsChange = pctChange(sessionsThisMonth.length, sessionsLastMonth.length);
  const totalStudents = students.length;
  const studentsChange = 0;
  const avgRating = reviews.length > 0 ? Number((reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)) : 0;
  const upcoming = sessions.filter((s) => s.scheduled_at && new Date(s.scheduled_at) > now).slice(0, 5);
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const completeness = reactExports.useMemo(() => computeCompleteness(tutorProfile, availabilityCount), [tutorProfile, availabilityCount]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-[28px] sm:text-[34px] leading-tight", children: [
          greeting,
          ", ",
          profile?.display_name ?? "Tutor",
          "!"
        ] }),
        profile && /* @__PURE__ */ jsxRuntimeExports.jsx(VerificationBadge, { tier: statusToTier(profile.verification_status) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[14px] text-[var(--pw-ink-2)]", children: "Here's how your tutoring practice is doing today." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(UnverifiedBanner, {})
    ] }),
    !dataLoading && earnings.length === 0 && sessions.length === 0 && reviews.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 pw-card p-5 flex flex-wrap items-center gap-4", style: {
      background: "var(--pw-accent-soft)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: "✨" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[220px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[18px]", children: "Your live dashboard is ready" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] text-[var(--pw-ink-2)] mt-0.5", children: "Earnings, sessions and reviews will appear here as students book and rate you. Finish your profile and add availability so students can find you." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/onboarding/tutor", className: "pw-btn-primary text-[13px] px-4 py-2", children: "Complete profile" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(QuickActionsBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCard, { label: "Earnings (MTD)", value: `$${earningsMTD.toFixed(0)}`, change: earningsChange, skeleton: dataLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCard, { label: "Total Students", value: String(totalStudents), change: studentsChange, skeleton: dataLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCard, { label: "Sessions", value: String(sessionsThisMonth.length), change: sessionsChange, skeleton: dataLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCard, { label: "Avg Rating", value: avgRating ? `${avgRating}★` : "—", change: null, skeleton: dataLoading })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2 lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EarningsChart, { earnings }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileCompleteness, { data: completeness }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UpcomingSessions, { sessions: upcoming, studentMap }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(LeadFunnel, { leads }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewsPreview, { reviews, studentMap }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EarningsBreakdown, { earnings }) })
    ] })
  ] });
}
function pctChange(current, prev) {
  if (prev === 0) return current === 0 ? 0 : null;
  return (current - prev) / prev * 100;
}
function computeCompleteness(p, availability) {
  const items = [{
    key: "photo",
    label: "Profile photo",
    done: !!p?.avatar_url
  }, {
    key: "bio",
    label: "Bio",
    done: !!p?.bio && p.bio.length > 30
  }, {
    key: "video",
    label: "Video intro",
    done: !!p?.video_intro_url
  }, {
    key: "subjects",
    label: "Subjects (min 3)",
    done: (p?.subject_specialties?.length ?? 0) >= 3
  }, {
    key: "availability",
    label: "Availability set",
    done: availability > 0
  }, {
    key: "pricing",
    label: "Hourly rate",
    done: !!p?.hourly_rate && p.hourly_rate > 0
  }];
  const done = items.filter((i) => i.done).length;
  const score = Math.round(done / items.length * 100);
  return {
    items,
    score
  };
}
function MetricCard({
  label,
  value,
  change,
  skeleton
}) {
  if (skeleton) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pw-card p-5 h-[112px] animate-pulse bg-[var(--pw-surface-2)]" });
  const isUp = (change ?? 0) >= 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 font-display text-[28px] leading-none", style: {
      color: "var(--pw-accent)"
    }, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-[12px]", children: change == null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)]", children: "vs last month —" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
      color: isUp ? "var(--pw-accent-2)" : "var(--pw-danger)"
    }, children: [
      isUp ? "▲" : "▼",
      " ",
      Math.abs(change).toFixed(0),
      "% ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)]", children: "vs last month" })
    ] }) })
  ] });
}
function EarningsChart({
  earnings
}) {
  const [range, setRange] = reactExports.useState("daily");
  const data = reactExports.useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    if (range === "daily") {
      const buckets2 = /* @__PURE__ */ new Map();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const k = format(d, "yyyy-MM-dd");
        buckets2.set(k, {
          date: format(d, "MMM d"),
          amount: 0,
          count: 0
        });
      }
      earnings.forEach((e) => {
        const k = format(new Date(e.earned_at), "yyyy-MM-dd");
        const b = buckets2.get(k);
        if (b) {
          b.amount += e.amount;
          b.count += 1;
        }
      });
      return Array.from(buckets2.values());
    }
    if (range === "weekly") {
      const buckets2 = /* @__PURE__ */ new Map();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        const wk = startOfWeek(d, {
          weekStartsOn: 1
        });
        const k = format(wk, "yyyy-MM-dd");
        if (!buckets2.has(k)) buckets2.set(k, {
          date: format(wk, "MMM d"),
          amount: 0,
          count: 0
        });
      }
      earnings.forEach((e) => {
        const wk = startOfWeek(new Date(e.earned_at), {
          weekStartsOn: 1
        });
        const k = format(wk, "yyyy-MM-dd");
        const b = buckets2.get(k);
        if (b) {
          b.amount += e.amount;
          b.count += 1;
        }
      });
      return Array.from(buckets2.values());
    }
    const buckets = /* @__PURE__ */ new Map();
    for (let i = 5; i >= 0; i--) {
      const d = startOfMonth(subMonths(now, i));
      const k = format(d, "yyyy-MM");
      buckets.set(k, {
        date: format(d, "MMM"),
        amount: 0,
        count: 0
      });
    }
    earnings.forEach((e) => {
      const k = format(new Date(e.earned_at), "yyyy-MM");
      const b = buckets.get(k);
      if (b) {
        b.amount += e.amount;
        b.count += 1;
      }
    });
    return Array.from(buckets.values());
  }, [earnings, range]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Earnings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[20px] mt-0.5", children: range === "daily" ? "Last 30 days" : range === "weekly" ? "Last 12 weeks" : "Last 6 months" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 p-1 rounded-full bg-[var(--pw-surface-2)]", children: ["daily", "weekly", "monthly"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRange(r), className: `px-3 py-1 text-[12px] rounded-full capitalize ${range === r ? "bg-white shadow-sm font-medium" : "text-[var(--pw-ink-2)]"}`, children: r }, r)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-[240px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data, margin: {
      top: 8,
      right: 8,
      left: -16,
      bottom: 0
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "var(--pw-border)", strokeDasharray: "3 3", vertical: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: {
        fill: "var(--pw-ink-2)",
        fontSize: 11
      }, axisLine: false, tickLine: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
        fill: "var(--pw-ink-2)",
        fontSize: 11
      }, axisLine: false, tickLine: false, tickFormatter: (v) => `$${v}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(EarningsTooltip, {}), cursor: {
        stroke: "var(--pw-accent)",
        strokeWidth: 1,
        strokeDasharray: "3 3"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "amount", stroke: "var(--pw-accent)", strokeWidth: 2.5, dot: false, activeDot: {
        r: 5
      } })
    ] }) }) })
  ] });
}
function EarningsTooltip({
  active,
  payload,
  label
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-2.5 text-[12px] shadow-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[var(--pw-accent)] font-display text-[16px]", children: [
      "$",
      p.amount.toFixed(0)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[var(--pw-ink-2)]", children: [
      p.count,
      " session",
      p.count === 1 ? "" : "s"
    ] })
  ] });
}
function UpcomingSessions({
  sessions,
  studentMap
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Upcoming sessions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[20px] mt-0.5", children: "Next up" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: sessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[14px] text-[var(--pw-ink-2)] py-6 text-center", children: "No upcoming sessions scheduled." }) : sessions.map((s) => {
      const stu = s.student_id ? studentMap.get(s.student_id) : null;
      const name = stu?.display_name ?? "Student";
      const when = s.scheduled_at ? new Date(s.scheduled_at) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-center pw-border rounded-lg p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { name, url: stu?.avatar_url }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[14px] font-medium truncate", children: name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-[var(--pw-ink-2)] truncate", children: [
            s.subject ?? "Tutoring",
            " · ",
            s.session_type ?? "1on1"
          ] }),
          when && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-[var(--pw-ink-2)] mt-0.5", children: [
            formatDistanceToNow(when, {
              addSuffix: true
            }),
            " · ",
            format(when, "MMM d, h:mm a")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "pw-btn-primary text-[12px] px-3 py-1.5", onClick: () => toast.info("Joining session…"), children: "Join" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "pw-btn-outline text-[12px] px-3 py-1.5", onClick: () => toast.info("Messaging coming soon"), children: "Message" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "pw-btn-outline text-[12px] px-3 py-1.5", onClick: () => toast.info("Reschedule coming soon"), children: "Reschedule" })
        ] })
      ] }, s.id);
    }) })
  ] });
}
function LeadFunnel({
  leads
}) {
  const stages = [{
    key: "view",
    label: "Profile views"
  }, {
    key: "message",
    label: "Messages"
  }, {
    key: "trial",
    label: "Trial sessions"
  }, {
    key: "paid",
    label: "Paid sessions"
  }, {
    key: "repeat",
    label: "Repeat students"
  }];
  const counts = stages.map((s) => ({
    ...s,
    count: leads.filter((l) => l.stage === s.key).length
  }));
  const max = Math.max(1, counts[0].count);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Lead funnel" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[20px] mt-0.5", children: "Conversion" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2", children: counts.map((s, i) => {
      const w = s.count / max * 100;
      const conv = i > 0 && counts[i - 1].count > 0 ? s.count / counts[i - 1].count * 100 : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        conv != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-[var(--pw-ink-2)] text-center mb-0.5", children: [
          "↓ ",
          conv.toFixed(0),
          "% conv"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-9 rounded-md overflow-hidden bg-[var(--pw-surface-2)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-0 rounded-md transition-all", style: {
            width: `${Math.max(8, w)}%`,
            background: `linear-gradient(90deg, var(--pw-accent), var(--pw-accent-3))`,
            opacity: 0.85
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full px-3 flex items-center justify-between text-[12px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: s.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-pw", children: s.count })
          ] })
        ] })
      ] }, s.key);
    }) })
  ] });
}
function ProfileCompleteness({
  data
}) {
  const radius = 42, circ = 2 * Math.PI * radius;
  const offset = circ - data.score / 100 * circ;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Profile" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[20px] mt-0.5", children: "Completeness" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "100", height: "100", viewBox: "0 0 100 100", className: "shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "50", r: radius, stroke: "var(--pw-surface-2)", strokeWidth: "10", fill: "none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "50", r: radius, stroke: "var(--pw-accent)", strokeWidth: "10", fill: "none", strokeDasharray: circ, strokeDashoffset: offset, strokeLinecap: "round", transform: "rotate(-90 50 50)", style: {
          transition: "stroke-dashoffset 600ms"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("text", { x: "50", y: "56", textAnchor: "middle", fontSize: "22", fontWeight: "600", fill: "var(--pw-ink)", children: [
          data.score,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-1.5", children: data.items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[12px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: i.done ? "var(--pw-accent-2)" : "var(--pw-border)"
        }, children: i.done ? "✓" : "○" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: i.done ? "text-[var(--pw-ink-2)] line-through" : "", children: i.label })
      ] }, i.key)) })
    ] }),
    data.score < 70 && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/onboarding/tutor", className: "pw-btn-primary mt-4 inline-block text-center w-full text-[13px] px-4 py-2", children: "Complete your profile" })
  ] });
}
function ReviewsPreview({
  reviews,
  studentMap
}) {
  const top3 = reviews.slice(0, 3);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Reviews" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[20px] mt-0.5", children: "Latest feedback" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-[var(--pw-ink-2)]", children: [
        "You typically respond in ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-[var(--pw-ink)]", children: "~3 hours" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: top3.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[14px] text-[var(--pw-ink-2)] text-center py-6", children: "No reviews yet." }) : top3.map((r) => {
      const stu = r.student_id ? studentMap.get(r.student_id) : null;
      const stars = r.rating ?? 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-border rounded-lg p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { name: stu?.display_name ?? "Student", url: stu?.avatar_url, small: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-medium", children: stu?.display_name ?? "Student" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[var(--pw-accent)] text-[12px] ml-auto", children: [
            "★".repeat(stars),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-border)]", children: "★".repeat(5 - stars) })
          ] })
        ] }),
        r.body && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1.5 text-[13px] line-clamp-2", children: [
          '"',
          r.body,
          '"'
        ] })
      ] }, r.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-4 text-[12px] text-[var(--pw-accent)] hover:underline", onClick: () => toast.info("Reviews page coming soon"), children: "View all reviews →" })
  ] });
}
function EarningsBreakdown({
  earnings
}) {
  const now = /* @__PURE__ */ new Date();
  const last30 = earnings.filter((e) => new Date(e.earned_at) >= new Date(now.getTime() - 30 * 864e5));
  const total = last30.reduce((s, e) => s + e.amount, 0);
  const avgPerSession = last30.length ? total / last30.length : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Last 30 days" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[20px] mt-0.5", children: "At a glance" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3 text-[14px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Total earned", value: `$${total.toFixed(0)}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Sessions paid", value: String(last30.length) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Avg / session", value: `$${avgPerSession.toFixed(0)}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-4 pw-btn-outline w-full text-[13px] px-4 py-2", onClick: () => toast.info("Withdrawal flow coming soon"), children: "Withdraw earnings" })
  ] });
}
function Row({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)]", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: value })
  ] });
}
function QuickActionsBar() {
  const shareLink = async () => {
    const url = window.location.origin + "/matches";
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied!");
    } catch {
      toast.error("Couldn't copy link");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/onboarding/tutor", className: "pw-btn-outline text-[13px] px-3 py-2 text-center", children: "Update availability" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/tutor/courses/new", className: "pw-btn-outline text-[13px] px-3 py-2 text-center", children: "Create new course" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast.info("Withdrawal flow coming soon"), className: "pw-btn-outline text-[13px] px-3 py-2", children: "Withdraw earnings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: shareLink, className: "pw-btn-outline text-[13px] px-3 py-2", children: "Share profile link" })
  ] });
}
function Avatar({
  name,
  url,
  small
}) {
  const size = small ? "w-7 h-7 text-[12px]" : "w-10 h-10 text-[14px]";
  if (url) return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: name, className: `${size} rounded-full object-cover shrink-0` });
  const initial = name.charAt(0).toUpperCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${size} rounded-full flex items-center justify-center text-white font-medium shrink-0`, style: {
    background: "var(--pw-accent)"
  }, children: initial });
}
export {
  DashboardHome as component
};
