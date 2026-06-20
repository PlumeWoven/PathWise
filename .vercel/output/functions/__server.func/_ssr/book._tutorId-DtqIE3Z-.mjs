import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { m as Route$7, u as useAuth, n as detectTimezone, s as supabase, o as buildAvailableSlots, p as groupSlotsByDay, q as offsetDifferenceLabel, t as detectDSTShifts, v as expandRecurrence, P as PWHeader, w as tzAbbreviation, x as hasSlotsOn, y as fmtInTz, C as COMMON_TIMEZONES, k as cn, l as buttonVariants, B as Button } from "./router-C4GolrgT.mjs";
import { p as priceForType, m as makeICS, g as googleCalendarUrl, d as durationForType } from "./sessions-cwg9I1VF.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import { a as addDays } from "../_libs/date-fns.mjs";
import { v as Calendar$1, R as Repeat, a as TriangleAlert, o as ChevronLeft, d as ChevronRight, K as ChevronDown } from "../_libs/lucide-react.mjs";
import { g as getDefaultClassNames, D as DayPicker } from "../_libs/react-day-picker.mjs";
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
import "../_libs/date-fns-tz.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/date-fns__tz.mjs";
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      ),
      captionLayout,
      formatters: {
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters
      },
      classNames: {
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" ? "text-sm" : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      },
      components: {
        Root: ({ className: className2, rootRef, ...props2 }) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-slot": "calendar", ref: rootRef, className: cn(className2), ...props2 });
        },
        Chevron: ({ className: className2, orientation, ...props2 }) => {
          if (orientation === "left") {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: cn("size-4", className2), ...props2 });
          }
          if (orientation === "right") {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: cn("size-4", className2), ...props2 });
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("size-4", className2), ...props2 });
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props2 }) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { ...props2, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex size-(--cell-size) items-center justify-center text-center", children }) });
        },
        ...components
      },
      ...props
    }
  );
}
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      ref,
      variant: "ghost",
      size: "icon",
      "data-day": day.date.toLocaleDateString(),
      "data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
      "data-range-start": modifiers.range_start,
      "data-range-end": modifiers.range_end,
      "data-range-middle": modifiers.range_middle,
      className: cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      ),
      ...props
    }
  );
}
const STEPS = ["Type", "Time", "Timezone", "Summary", "Pay"];
function BookPage() {
  const {
    tutorId
  } = Route$7.useParams();
  useNavigate();
  const {
    user,
    openLogin
  } = useAuth();
  const [step, setStep] = reactExports.useState(0);
  const [tutor, setTutor] = reactExports.useState(null);
  const [availability, setAvailability] = reactExports.useState([]);
  const [bookedRanges, setBookedRanges] = reactExports.useState([]);
  const [pkg, setPkg] = reactExports.useState(null);
  const [type, setType] = reactExports.useState("trial");
  const [slot, setSlot] = reactExports.useState(null);
  const [pickedDay, setPickedDay] = reactExports.useState(void 0);
  const [tz, setTz] = reactExports.useState(detectTimezone());
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [createdSessionId, setCreatedSessionId] = reactExports.useState(null);
  const [recurring, setRecurring] = reactExports.useState(false);
  const [frequency, setFrequency] = reactExports.useState("weekly");
  const [endMode, setEndMode] = reactExports.useState("count");
  const [recCount, setRecCount] = reactExports.useState(4);
  const [recEndDate, setRecEndDate] = reactExports.useState(void 0);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem("pathwise_pending_booking", JSON.stringify({
        tutorId
      }));
    } catch {
    }
  }, [tutorId]);
  reactExports.useEffect(() => {
    void (async () => {
      const {
        data: t
      } = await supabase.from("profiles").select("id, display_name, avatar_url, headline, hourly_rate, first_session_free, free_discovery_call, timezone, buffer_minutes, min_advance_hours").eq("id", tutorId).eq("role", "tutor").maybeSingle();
      setTutor(t);
      const {
        data: a
      } = await supabase.from("tutor_availability").select("day_of_week, start_hour, end_hour, is_blocked").eq("user_id", tutorId);
      setAvailability(a ?? []);
      const {
        data: booked
      } = await supabase.from("sessions").select("scheduled_start, scheduled_end").eq("tutor_id", tutorId).in("status_v2", ["scheduled", "confirmed", "reminder_sent", "in_progress"]);
      setBookedRanges((booked ?? []).filter((s) => s.scheduled_start && s.scheduled_end).map((s) => ({
        start: new Date(s.scheduled_start),
        end: new Date(s.scheduled_end)
      })));
      const {
        data: p
      } = await supabase.from("tutor_packages").select("sessions, discount_percent").eq("user_id", tutorId).eq("enabled", true).order("sessions", {
        ascending: true
      }).limit(1).maybeSingle();
      if (p) setPkg(p);
    })();
  }, [tutorId]);
  const duration = durationForType(type);
  const slots = reactExports.useMemo(() => buildAvailableSlots({
    availability,
    durationMin: duration,
    bufferMin: tutor?.buffer_minutes ?? 0,
    daysAhead: 60,
    booked: bookedRanges,
    minAdvanceHours: tutor?.min_advance_hours ?? 24
  }), [availability, duration, tutor?.buffer_minutes, tutor?.min_advance_hours, bookedRanges]);
  const slotsByDay = reactExports.useMemo(() => groupSlotsByDay(slots), [slots]);
  const slotsForPickedDay = pickedDay ? slotsByDay.get(pickedDay.toDateString()) ?? [] : [];
  const tutorTz = tutor?.timezone ?? tz;
  const tzMismatch = slot ? offsetDifferenceLabel(slot, tz, tutorTz) : null;
  const dstShifts = reactExports.useMemo(() => slot && recurring ? detectDSTShifts(slot, tz, recCount) : [], [slot, recurring, tz, recCount]);
  const recurrenceInstances = reactExports.useMemo(() => {
    if (!recurring || !slot) return slot ? [slot] : [];
    return expandRecurrence({
      start: slot,
      frequency,
      count: endMode === "count" ? recCount : void 0,
      endDate: endMode === "date" ? recEndDate : void 0,
      maxOccurrences: endMode === "ongoing" ? 26 : 26
    });
  }, [recurring, slot, frequency, endMode, recCount, recEndDate]);
  const hourlyRate = Number(tutor?.hourly_rate ?? 0);
  const isTrialFree = type === "trial" && (tutor?.free_discovery_call || tutor?.first_session_free);
  const price = isTrialFree ? 0 : priceForType(hourlyRate, type, pkg?.discount_percent ?? 0, pkg?.sessions ?? 5);
  function next() {
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }
  async function handleConfirmAndPay() {
    if (!user) {
      toast.info("Sign in to complete your booking — we'll bring you back here.");
      openLogin();
      return;
    }
    if (!slot) return;
    setSubmitting(true);
    const groupId = recurring && recurrenceInstances.length > 1 ? crypto.randomUUID() : null;
    try {
      const createdIds = [];
      for (let i = 0; i < recurrenceInstances.length; i++) {
        const start = recurrenceInstances[i];
        const end = new Date(start.getTime() + duration * 60 * 1e3);
        const meetingUrl = `https://meet.pathwise.app/${crypto.randomUUID().slice(0, 8)}`;
        const {
          data,
          error
        } = await supabase.rpc("book_session", {
          p_tutor_id: tutorId,
          p_scheduled_start: start.toISOString(),
          p_scheduled_end: end.toISOString(),
          p_duration_minutes: duration,
          p_timezone: tz,
          p_session_type: type,
          p_amount: price,
          p_meeting_url: meetingUrl,
          p_recurrence_group_id: groupId,
          p_recurrence_index: groupId ? i : null
        });
        if (error) {
          if (String(error.message).includes("SLOT_TAKEN")) {
            throw new Error("This slot was just booked by someone else — please refresh and pick another time.");
          }
          throw error;
        }
        const sid = data;
        createdIds.push(sid);
        await supabase.from("session_state_history").insert({
          session_id: sid,
          from_status: null,
          to_status: price === 0 ? "confirmed" : "scheduled",
          changed_by: user.id
        });
      }
      await supabase.from("notifications").insert([{
        user_id: user.id,
        title: recurring && createdIds.length > 1 ? `${createdIds.length} sessions booked` : "Booking confirmed",
        message: `Your ${type} session${createdIds.length > 1 ? "s" : ""} with ${tutor?.display_name ?? "your tutor"} ${createdIds.length > 1 ? "are" : "is"} set.`,
        link: `/sessions/${createdIds[0]}`,
        type: "confirmed"
      }, {
        user_id: tutorId,
        title: recurring && createdIds.length > 1 ? `${createdIds.length} new bookings` : "New booking",
        message: `You have ${createdIds.length > 1 ? `${createdIds.length} new ${type} sessions` : `a new ${type} session`} booked.`,
        link: `/sessions/${createdIds[0]}`,
        type: "scheduled"
      }]);
      try {
        localStorage.removeItem("pathwise_pending_booking");
      } catch {
      }
      setBookedRanges((prev) => [...prev, ...recurrenceInstances.map((s) => ({
        start: s,
        end: new Date(s.getTime() + duration * 60 * 1e3)
      }))]);
      setCreatedSessionId(createdIds[0]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not complete booking");
      const {
        data: booked
      } = await supabase.from("sessions").select("scheduled_start, scheduled_end").eq("tutor_id", tutorId).in("status_v2", ["scheduled", "confirmed", "reminder_sent", "in_progress"]);
      setBookedRanges((booked ?? []).filter((s) => s.scheduled_start && s.scheduled_end).map((s) => ({
        start: new Date(s.scheduled_start),
        end: new Date(s.scheduled_end)
      })));
      setSlot(null);
    } finally {
      setSubmitting(false);
    }
  }
  if (createdSessionId) {
    const start = slot;
    const end = new Date(start.getTime() + duration * 60 * 1e3);
    const ics = makeICS({
      title: `PathWise session with ${tutor?.display_name ?? "your tutor"}`,
      description: `Join: https://meet.pathwise.app`,
      start,
      end
    });
    const blobUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
    const gcal = googleCalendarUrl({
      title: `PathWise session with ${tutor?.display_name ?? "your tutor"}`,
      details: "Booked via PathWise",
      start,
      end
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "px-5 sm:px-8 py-12 max-w-xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, animate: {
        opacity: 1,
        y: 0
      }, className: "pw-card p-7 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl mb-3", children: "🎉" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl", children: "You're booked!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[var(--pw-ink-2)] mt-1", children: [
          start.toLocaleString(void 0, {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: tz
          }),
          " (",
          tz,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: gcal, target: "_blank", rel: "noreferrer", className: "pw-btn-outline px-4 py-2 text-sm", children: "Add to Google Calendar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: blobUrl, download: "pathwise-session.ics", className: "pw-btn-outline px-4 py-2 text-sm", children: "Download .ics (Apple / Outlook)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sessions/$id", params: {
            id: createdSessionId
          }, className: "pw-btn-primary px-4 py-2 text-sm", children: "View session details" })
        ] })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-5 sm:px-8 pb-24 max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex items-center gap-2 text-[12px] text-[var(--pw-ink-2)]", children: STEPS.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full w-6 h-6 flex items-center justify-center font-mono-pw text-[11px]", style: {
          background: i <= step ? "var(--pw-accent)" : "var(--pw-surface-2)",
          color: i <= step ? "white" : "var(--pw-ink-2)"
        }, children: i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: i === step ? "text-[var(--pw-ink)] font-medium" : "", children: s }),
        i < STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-px bg-[var(--pw-border)]" })
      ] }, s)) }),
      tutor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card mt-5 p-4 flex items-center gap-3", children: [
        tutor.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: tutor.avatar_url, alt: tutor.display_name ?? "", className: "w-12 h-12 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-[var(--pw-accent)] text-white flex items-center justify-center font-display", children: (tutor.display_name ?? "T")[0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[16px] truncate", children: tutor.display_name ?? "Tutor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)] truncate", children: tutor.headline ?? `$${hourlyRate}/hr` })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        x: 12
      }, animate: {
        opacity: 1,
        x: 0
      }, exit: {
        opacity: 0,
        x: -12
      }, transition: {
        duration: 0.2
      }, className: "mt-5", children: [
        step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl", children: "Pick a session type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TypeOption, { active: type === "trial", onClick: () => setType("trial"), emoji: "👋", title: "Trial / discovery call", subtitle: "30 min · meet your tutor, set goals", price: isTrialFree ? "Free" : `$${priceForType(hourlyRate, "trial")}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TypeOption, { active: type === "standard", onClick: () => setType("standard"), emoji: "📚", title: "Standard session", subtitle: "60 min · 1-on-1 lesson", price: `$${priceForType(hourlyRate, "standard")}` }),
          pkg && /* @__PURE__ */ jsxRuntimeExports.jsx(TypeOption, { active: type === "package", onClick: () => setType("package"), emoji: "📦", title: `${pkg.sessions}-session package`, subtitle: `Save ${pkg.discount_percent}% — ${pkg.sessions} × 60 min`, price: `$${priceForType(hourlyRate, "package", pkg.discount_percent, pkg.sessions)}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NavBar, { onNext: next, disabled: false })
        ] }),
        step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl", children: "Pick a time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[13px] text-[var(--pw-ink-2)]", children: [
            "Slots shown in ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: tz }),
            " (",
            slot ? tzAbbreviation(slot, tz) : tzAbbreviation(/* @__PURE__ */ new Date(), tz),
            ")"
          ] }),
          slots.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pw-card p-5 text-sm text-[var(--pw-ink-2)]", children: "This tutor hasn't published availability yet. Try messaging them first." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { mode: "single", selected: pickedDay, onSelect: (d) => {
                setPickedDay(d);
                setSlot(null);
              }, disabled: (date) => {
                const today = /* @__PURE__ */ new Date();
                today.setHours(0, 0, 0, 0);
                if (date < today) return true;
                if (date > addDays(today, 60)) return true;
                return !hasSlotsOn(date, slots);
              }, modifiers: {
                hasSlots: (d) => hasSlotsOn(d, slots)
              }, modifiersStyles: {
                hasSlots: {
                  fontWeight: 700
                }
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-[var(--pw-ink-2)] mt-2 px-2 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar$1, { className: "w-3 h-3" }),
                " Bold dates have open slots. Past dates and dates within ",
                tutor?.min_advance_hours ?? 24,
                "h are disabled."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2", children: pickedDay ? pickedDay.toLocaleDateString(void 0, {
                weekday: "long",
                month: "short",
                day: "numeric"
              }) : "Pick a day to see times" }),
              pickedDay && slotsForPickedDay.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] text-[var(--pw-ink-2)]", children: "No open slots on this day." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: slotsForPickedDay.map((s) => {
                const sel = slot?.getTime() === s.getTime();
                return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSlot(s), className: "pw-pill text-[12px] px-3 py-1.5", style: {
                  background: sel ? "var(--pw-accent)" : "var(--pw-surface-2)",
                  color: sel ? "white" : "var(--pw-ink)"
                }, children: fmtInTz(s, tz, "h:mm a") }, s.toISOString());
              }) }),
              slot && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-1 text-[12px] text-[var(--pw-ink-2)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "Your time: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtInTz(slot, tz, "h:mm a") }),
                  " ",
                  tzAbbreviation(slot, tz)
                ] }),
                tutorTz !== tz && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "Tutor's time: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtInTz(slot, tutorTz, "h:mm a") }),
                  " ",
                  tzAbbreviation(slot, tutorTz)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-4 md:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: recurring, onChange: (e) => setRecurring(e.target.checked) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[14px] font-medium", children: "Make this recurring" })
              ] }),
              recurring && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid sm:grid-cols-3 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[10px] uppercase text-[var(--pw-ink-2)]", children: "Frequency" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: frequency, onChange: (e) => setFrequency(e.target.value), className: "mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-white", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "weekly", children: "Weekly" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "biweekly", children: "Bi-weekly" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "monthly", children: "Monthly" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[10px] uppercase text-[var(--pw-ink-2)]", children: "Ends" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: endMode, onChange: (e) => setEndMode(e.target.value), className: "mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-white", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "count", children: "After N sessions" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "date", children: "On a date" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ongoing", children: "Ongoing (cap 26)" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  endMode === "count" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[10px] uppercase text-[var(--pw-ink-2)]", children: "Number of sessions" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 2, max: 26, value: recCount, onChange: (e) => setRecCount(Math.max(2, Math.min(26, Number(e.target.value) || 2))), className: "mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-white" })
                  ] }),
                  endMode === "date" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[10px] uppercase text-[var(--pw-ink-2)]", children: "End date" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: recEndDate ? recEndDate.toISOString().slice(0, 10) : "", onChange: (e) => setRecEndDate(e.target.value ? new Date(e.target.value) : void 0), className: "mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-white" })
                  ] }),
                  endMode === "ongoing" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] text-[var(--pw-ink-2)] mt-5", children: "Books up to 26 occurrences from your selected start." })
                ] }),
                dstShifts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-3 flex items-start gap-2 text-[12px] text-amber-700 bg-amber-50 p-2 rounded", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Heads up — daylight-saving change between occurrences. Local clock-time is preserved across all instances." })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NavBar, { onBack: back, onNext: next, disabled: !slot })
        ] }),
        step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl", children: "Confirm your timezone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Your timezone (auto-detected)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-white", value: tz, onChange: (e) => setTz(e.target.value), children: [tz, ...COMMON_TIMEZONES.filter((t) => t !== tz)].map((z) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: z, children: z }, z)) }),
            slot && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px] text-[var(--pw-ink-2)] mt-3 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Your time: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtInTz(slot, tz, "EEEE, MMM d · h:mm a") }),
                " ",
                tzAbbreviation(slot, tz)
              ] }),
              tutorTz !== tz && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Tutor's time: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtInTz(slot, tutorTz, "EEEE, MMM d · h:mm a") }),
                " ",
                tzAbbreviation(slot, tutorTz)
              ] }),
              tzMismatch && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-amber-700 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
                " You and your tutor are in different timezones — double-check the times match."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NavBar, { onBack: back, onNext: next, disabled: false })
        ] }),
        step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl", children: "Order summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-5 space-y-2 text-[14px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Tutor", value: tutor?.display_name ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Type", value: type === "trial" ? "Trial / discovery" : type === "package" ? `${pkg?.sessions ?? 5} × sessions` : "Standard session" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Duration", value: `${duration} min${type === "package" ? ` × ${pkg?.sessions ?? 5}` : ""}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Date & time", value: slot ? fmtInTz(slot, tz, "EEE, MMM d · h:mm a") : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Timezone", value: tz }),
            recurring && recurrenceInstances.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Recurrence", value: `${recurrenceInstances.length} × ${frequency}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-[var(--pw-border)] pt-3 mt-2 flex justify-between font-display text-[18px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: price === 0 ? "Free" : `$${price * (recurring && recurrenceInstances.length > 1 ? recurrenceInstances.length : 1)}` })
            ] })
          ] }),
          recurring && recurrenceInstances.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2", children: "All instances" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-[13px] space-y-1 max-h-48 overflow-auto", children: recurrenceInstances.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[var(--pw-ink-2)]", children: [
                "#",
                i + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtInTz(d, tz, "EEE, MMM d · h:mm a") })
            ] }, d.toISOString())) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NavBar, { onBack: back, onNext: next, disabled: !slot })
        ] }),
        step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl", children: price === 0 ? "Confirm" : "Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pw-card p-5", children: price === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--pw-ink-2)]", children: "No payment required for this trial — just confirm below." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--pw-ink-2)]", children: "Stripe checkout isn't enabled yet — for now we'll mark this as paid so you can test the full flow. Enable Stripe to charge real cards." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-3 rounded-md bg-[var(--pw-surface-2)] text-[13px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                "$",
                price * (recurring && recurrenceInstances.length > 1 ? recurrenceInstances.length : 1)
              ] }),
              " · charged on confirmation",
              recurring && recurrenceInstances.length > 1 ? ` (${recurrenceInstances.length} sessions)` : ""
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: back, className: "pw-btn-outline px-4 py-2 text-sm", children: "Back" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleConfirmAndPay, disabled: submitting || !slot, className: "pw-btn-primary px-5 py-2.5 text-sm flex-1 disabled:opacity-50", children: submitting ? "Booking…" : price === 0 ? "Confirm booking" : `Pay $${price} & confirm` })
          ] })
        ] })
      ] }, step) })
    ] })
  ] });
}
function TypeOption({
  active,
  onClick,
  emoji,
  title,
  subtitle,
  price
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: "pw-card w-full p-4 text-left flex items-center gap-3 transition-colors", style: {
    borderColor: active ? "var(--pw-accent)" : "var(--pw-border)",
    background: active ? "var(--pw-accent-soft)" : "var(--pw-surface)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: emoji }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[16px]", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)]", children: subtitle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[16px]", children: price })
  ] });
}
function Row({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[14px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)]", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value })
  ] });
}
function NavBar({
  onBack,
  onNext,
  disabled
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
    onBack && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onBack, className: "pw-btn-outline px-4 py-2 text-sm", children: "Back" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onNext, disabled, className: "pw-btn-primary px-5 py-2.5 text-sm flex-1 disabled:opacity-50", children: "Continue →" })
  ] });
}
export {
  BookPage as component
};
