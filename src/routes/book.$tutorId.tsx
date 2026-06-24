import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  priceForType,
  durationForType,
  googleCalendarUrl,
  makeICS,
  type SessionType,
} from "../pathwise/sessions";
import {
  buildAvailableSlots,
  groupSlotsByDay,
  hasSlotsOn,
  detectTimezone,
  fmtInTz,
  tzAbbreviation,
  expandRecurrence,
  detectDSTShifts,
  offsetDifferenceLabel,
  COMMON_TIMEZONES,
  type Frequency,
} from "../pathwise/scheduling";
import { Calendar as CalendarIcon, AlertTriangle, Repeat } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { addDays } from "date-fns";

export const Route = createFileRoute("/book/$tutorId")({
  head: () => ({
    meta: [
      { title: "Book a session — PathWise" },
      { name: "description", content: "Pick a session type, time, and confirm your booking." },
    ],
  }),
  component: BookPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="pw-card p-6 max-w-md text-center">
        <h1 className="font-display text-xl">Booking unavailable</h1>
        <p className="text-sm text-[var(--pw-ink-2)] mt-2">{error.message}</p>
        <Link to="/matches" className="pw-btn-outline mt-4 inline-block px-4 py-2 text-sm">Back to matches</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div>Tutor not found. <Link to="/matches" className="underline">Back</Link></div>
    </div>
  ),
});

interface TutorRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  hourly_rate: number | null;
  first_session_free: boolean | null;
  free_discovery_call: boolean | null;
  timezone: string | null;
  buffer_minutes: number | null;
  min_advance_hours: number | null;
}

const STEPS = ["Type", "Time", "Timezone", "Summary", "Pay"] as const;

function BookPage() {
  const { tutorId } = Route.useParams();
  const navigate = useNavigate();
  const { user, openLogin } = useAuth();

  const [step, setStep] = useState(0);
  const [tutor, setTutor] = useState<TutorRow | null>(null);
  const [availability, setAvailability] = useState<{ day_of_week: number; start_hour: number; end_hour: number; is_blocked: boolean | null }[]>([]);
  const [bookedRanges, setBookedRanges] = useState<Array<{ start: Date; end: Date }>>([]);
  const [pkg, setPkg] = useState<{ sessions: number; discount_percent: number } | null>(null);
  const [type, setType] = useState<SessionType>("trial");
  const [slot, setSlot] = useState<Date | null>(null);
  const [pickedDay, setPickedDay] = useState<Date | undefined>(undefined);
  const [tz, setTz] = useState<string>(detectTimezone());
  const [submitting, setSubmitting] = useState(false);
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [endMode, setEndMode] = useState<"count" | "date" | "ongoing">("count");
  const [recCount, setRecCount] = useState(4);
  const [recEndDate, setRecEndDate] = useState<Date | undefined>(undefined);

  // Persist intent so we resume after login.
  useEffect(() => {
    try {
      localStorage.setItem("pathwise_pending_booking", JSON.stringify({ tutorId }));
    } catch {}
  }, [tutorId]);

  useEffect(() => {
    void (async () => {
      const { data: t } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, headline, hourly_rate, first_session_free, free_discovery_call, timezone, buffer_minutes, min_advance_hours")
        .eq("id", tutorId)
        .eq("role", "tutor")
        .maybeSingle();
      setTutor(t as TutorRow | null);
      const { data: a } = await supabase
        .from("tutor_availability")
        .select("day_of_week, start_hour, end_hour, is_blocked")
        .eq("user_id", tutorId);
      setAvailability((a ?? []) as any);
      const { data: booked } = await supabase
        .from("sessions")
        .select("scheduled_start, scheduled_end")
        .eq("tutor_id", tutorId)
        .in("status_v2", ["scheduled", "confirmed", "reminder_sent", "in_progress"]);
      setBookedRanges(((booked ?? []) as any[])
        .filter((s) => s.scheduled_start && s.scheduled_end)
        .map((s) => ({ start: new Date(s.scheduled_start), end: new Date(s.scheduled_end) })));
      const { data: p } = await supabase
        .from("tutor_packages")
        .select("sessions, discount_percent")
        .eq("user_id", tutorId)
        .eq("enabled", true)
        .order("sessions", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (p) setPkg(p as any);
    })();
  }, [tutorId]);

  const duration = durationForType(type);
  const slots = useMemo(
    () => buildAvailableSlots({
      availability,
      durationMin: duration,
      bufferMin: tutor?.buffer_minutes ?? 0,
      daysAhead: 60,
      booked: bookedRanges,
      minAdvanceHours: tutor?.min_advance_hours ?? 24,
    }),
    [availability, duration, tutor?.buffer_minutes, tutor?.min_advance_hours, bookedRanges],
  );
  const slotsByDay = useMemo(() => groupSlotsByDay(slots), [slots]);
  const slotsForPickedDay = pickedDay ? (slotsByDay.get(pickedDay.toDateString()) ?? []) : [];

  const tutorTz = tutor?.timezone ?? tz;
  const tzMismatch = slot ? offsetDifferenceLabel(slot, tz, tutorTz) : null;
  const dstShifts = useMemo(
    () => (slot && recurring ? detectDSTShifts(slot, tz, recCount) : []),
    [slot, recurring, tz, recCount],
  );

  const recurrenceInstances = useMemo<Date[]>(() => {
    if (!recurring || !slot) return slot ? [slot] : [];
    return expandRecurrence({
      start: slot,
      frequency,
      count: endMode === "count" ? recCount : undefined,
      endDate: endMode === "date" ? recEndDate : undefined,
      maxOccurrences: endMode === "ongoing" ? 26 : 26,
    });
  }, [recurring, slot, frequency, endMode, recCount, recEndDate]);

  const hourlyRate = Number(tutor?.hourly_rate ?? 0);
  const isTrialFree = type === "trial" && (tutor?.free_discovery_call || tutor?.first_session_free);
  const price = isTrialFree ? 0 : priceForType(hourlyRate, type, pkg?.discount_percent ?? 0, pkg?.sessions ?? 5);

  function next() { setStep((s) => Math.min(STEPS.length - 1, s + 1)); }
  function back() { setStep((s) => Math.max(0, s - 1)); }

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
      const createdIds: string[] = [];
      for (let i = 0; i < recurrenceInstances.length; i++) {
        const start = recurrenceInstances[i];
        const end = new Date(start.getTime() + duration * 60 * 1000);
        const meetingUrl = `https://meet.pathwise.app/${crypto.randomUUID().slice(0, 8)}`;
        const { data, error } = await supabase.rpc("book_session", {
          p_tutor_id: tutorId,
          p_scheduled_start: start.toISOString(),
          p_scheduled_end: end.toISOString(),
          p_duration_minutes: duration,
          p_timezone: tz,
          p_session_type: type,
          p_amount: price,
          p_meeting_url: meetingUrl,
          p_recurrence_group_id: groupId,
          p_recurrence_index: groupId ? i : null,
        } as any);
        if (error) {
          if (String(error.message).includes("SLOT_TAKEN")) {
            throw new Error("This slot was just booked by someone else — please refresh and pick another time.");
          }
          throw error;
        }
        const sid = data as unknown as string;
        createdIds.push(sid);
        await supabase.from("session_state_history").insert({
          session_id: sid,
          from_status: null,
          to_status: price === 0 ? "confirmed" : "scheduled",
          changed_by: user.id,
        });
      }
      await supabase.from("notifications").insert([
        { user_id: user.id, title: recurring && createdIds.length > 1 ? `${createdIds.length} sessions booked` : "Booking confirmed", message: `Your ${type} session${createdIds.length > 1 ? "s" : ""} with ${tutor?.display_name ?? "your tutor"} ${createdIds.length > 1 ? "are" : "is"} set.`, link: `/sessions/${createdIds[0]}`, type: "confirmed" },
        { user_id: tutorId, title: recurring && createdIds.length > 1 ? `${createdIds.length} new bookings` : "New booking", message: `You have ${createdIds.length > 1 ? `${createdIds.length} new ${type} sessions` : `a new ${type} session`} booked.`, link: `/sessions/${createdIds[0]}`, type: "scheduled" },
      ]);
      try { localStorage.removeItem("pathwise_pending_booking"); } catch {}
      // Refresh the booked ranges so the UI reflects newly taken slots if user goes back.
      setBookedRanges((prev) => [...prev, ...recurrenceInstances.map((s) => ({ start: s, end: new Date(s.getTime() + duration * 60 * 1000) }))]);
      setCreatedSessionId(createdIds[0]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not complete booking");
      // Refresh availability after a slot collision
      const { data: booked } = await supabase
        .from("sessions")
        .select("scheduled_start, scheduled_end")
        .eq("tutor_id", tutorId)
        .in("status_v2", ["scheduled", "confirmed", "reminder_sent", "in_progress"]);
      setBookedRanges(((booked ?? []) as any[])
        .filter((s) => s.scheduled_start && s.scheduled_end)
        .map((s) => ({ start: new Date(s.scheduled_start), end: new Date(s.scheduled_end) })));
      setSlot(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (createdSessionId) {
    const start = slot!;
    const end = new Date(start.getTime() + duration * 60 * 1000);
    const ics = makeICS({
      title: `PathWise session with ${tutor?.display_name ?? "your tutor"}`,
      description: `Join: https://meet.pathwise.app`,
      start, end,
    });
    const blobUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
    const gcal = googleCalendarUrl({
      title: `PathWise session with ${tutor?.display_name ?? "your tutor"}`,
      details: "Booked via PathWise",
      start, end,
    });
    return (
      <div className="min-h-screen bg-[var(--pw-bg)]">
        <PWHeader />
        <main className="px-5 sm:px-8 py-12 max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="pw-card p-7 text-center"
          >
            <div className="text-5xl mb-3">🎉</div>
            <h1 className="font-display text-2xl">You're booked!</h1>
            <p className="text-sm text-[var(--pw-ink-2)] mt-1">
              {start.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short", timeZone: tz })} ({tz})
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a href={gcal} target="_blank" rel="noreferrer" className="pw-btn-outline px-4 py-2 text-sm">Add to Google Calendar</a>
              <a href={blobUrl} download="pathwise-session.ics" className="pw-btn-outline px-4 py-2 text-sm">Download .ics (Apple / Outlook)</a>
              <Link to="/sessions/$id" params={{ id: createdSessionId }} className="pw-btn-primary px-4 py-2 text-sm">View session details</Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <main className="px-5 sm:px-8 pb-24 max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mt-4 flex items-center gap-2 text-[12px] text-[var(--pw-ink-2)]">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className="rounded-full w-6 h-6 flex items-center justify-center font-mono-pw text-[11px]"
                style={{
                  background: i <= step ? "var(--pw-accent)" : "var(--pw-surface-2)",
                  color: i <= step ? "white" : "var(--pw-ink-2)",
                }}
              >
                {i + 1}
              </span>
              <span className={i === step ? "text-[var(--pw-ink)] font-medium" : ""}>{s}</span>
              {i < STEPS.length - 1 && <span className="w-4 h-px bg-[var(--pw-border)]" />}
            </div>
          ))}
        </div>

        {/* Tutor header */}
        {tutor && (
          <div className="pw-card mt-5 p-4 flex items-center gap-3">
            {tutor.avatar_url ? (
              <img src={tutor.avatar_url} alt={tutor.display_name ?? ""} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[var(--pw-accent)] text-white flex items-center justify-center font-display">
                {(tutor.display_name ?? "T")[0]}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-display text-[16px] truncate">{tutor.display_name ?? "Tutor"}</div>
              <div className="text-[12px] text-[var(--pw-ink-2)] truncate">{tutor.headline ?? `$${hourlyRate}/hr`}</div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="mt-5"
          >
            {/* Step 1: Type */}
            {step === 0 && (
              <div className="space-y-3">
                <h1 className="font-display text-2xl">Pick a session type</h1>
                <TypeOption
                  active={type === "trial"}
                  onClick={() => setType("trial")}
                  emoji="👋"
                  title="Trial / discovery call"
                  subtitle="30 min · meet your tutor, set goals"
                  price={isTrialFree ? "Free" : `$${priceForType(hourlyRate, "trial")}`}
                />
                <TypeOption
                  active={type === "standard"}
                  onClick={() => setType("standard")}
                  emoji="📚"
                  title="Standard session"
                  subtitle="60 min · 1-on-1 lesson"
                  price={`$${priceForType(hourlyRate, "standard")}`}
                />
                {pkg && (
                  <TypeOption
                    active={type === "package"}
                    onClick={() => setType("package")}
                    emoji="📦"
                    title={`${pkg.sessions}-session package`}
                    subtitle={`Save ${pkg.discount_percent}% — ${pkg.sessions} × 60 min`}
                    price={`$${priceForType(hourlyRate, "package", pkg.discount_percent, pkg.sessions)}`}
                  />
                )}
                <NavBar onNext={next} disabled={false} />
              </div>
            )}

            {/* Step 2: Time */}
            {step === 1 && (
              <div className="space-y-3">
                <h1 className="font-display text-2xl">Pick a time</h1>
                <p className="text-[13px] text-[var(--pw-ink-2)]">Slots shown in <strong>{tz}</strong> ({slot ? tzAbbreviation(slot, tz) : tzAbbreviation(new Date(), tz)})</p>
                {slots.length === 0 ? (
                  <div className="pw-card p-5 text-sm text-[var(--pw-ink-2)]">
                    This tutor hasn't published availability yet. Try messaging them first.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="pw-card p-3">
                      <Calendar
                        mode="single"
                        selected={pickedDay}
                        onSelect={(d) => { setPickedDay(d); setSlot(null); }}
                        disabled={(date) => {
                          const today = new Date(); today.setHours(0, 0, 0, 0);
                          if (date < today) return true;
                          if (date > addDays(today, 60)) return true;
                          return !hasSlotsOn(date, slots);
                        }}
                        modifiers={{ hasSlots: (d) => hasSlotsOn(d, slots) }}
                        modifiersStyles={{ hasSlots: { fontWeight: 700 } }}
                      />
                      <p className="text-[11px] text-[var(--pw-ink-2)] mt-2 px-2 flex items-center gap-1.5">
                        <CalendarIcon className="w-3 h-3" /> Bold dates have open slots. Past dates and dates within {tutor?.min_advance_hours ?? 24}h are disabled.
                      </p>
                    </div>
                    <div className="pw-card p-3">
                      <div className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2">
                        {pickedDay ? pickedDay.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) : "Pick a day to see times"}
                      </div>
                      {pickedDay && slotsForPickedDay.length === 0 && (
                        <p className="text-[13px] text-[var(--pw-ink-2)]">No open slots on this day.</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {slotsForPickedDay.map((s) => {
                          const sel = slot?.getTime() === s.getTime();
                          return (
                            <button
                              key={s.toISOString()}
                              onClick={() => setSlot(s)}
                              className="pw-pill text-[12px] px-3 py-1.5"
                              style={{
                                background: sel ? "var(--pw-accent)" : "var(--pw-surface-2)",
                                color: sel ? "white" : "var(--pw-ink)",
                              }}
                            >
                              {fmtInTz(s, tz, "h:mm a")}
                            </button>
                          );
                        })}
                      </div>
                      {slot && (
                        <div className="mt-3 space-y-1 text-[12px] text-[var(--pw-ink-2)]">
                          <p>Your time: <strong>{fmtInTz(slot, tz, "h:mm a")}</strong> {tzAbbreviation(slot, tz)}</p>
                          {tutorTz !== tz && (
                            <p>Tutor's time: <strong>{fmtInTz(slot, tutorTz, "h:mm a")}</strong> {tzAbbreviation(slot, tutorTz)}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Recurring */}
                    <div className="pw-card p-4 md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
                        <Repeat className="w-4 h-4" />
                        <span className="text-[14px] font-medium">Make this recurring</span>
                      </label>
                      {recurring && (
                        <div className="mt-3 grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="font-mono-pw text-[10px] uppercase text-[var(--pw-ink-2)]">Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className="mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-[var(--pw-surface)]">
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-mono-pw text-[10px] uppercase text-[var(--pw-ink-2)]">Ends</label>
            <select value={endMode} onChange={(e) => setEndMode(e.target.value as any)} className="mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-[var(--pw-surface)]">
                              <option value="count">After N sessions</option>
                              <option value="date">On a date</option>
                              <option value="ongoing">Ongoing (cap 26)</option>
                            </select>
                          </div>
                          <div>
            {endMode === "count" && (
              <>
                <label className="font-mono-pw text-[10px] uppercase text-[var(--pw-ink-2)]">Number of sessions</label>
                <input type="number" min={2} max={26} value={recCount} onChange={(e) => setRecCount(Math.max(2, Math.min(26, Number(e.target.value) || 2)))} className="mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-[var(--pw-surface)]" />
                              </>
                            )}
            {endMode === "date" && (
              <>
                <label className="font-mono-pw text-[10px] uppercase text-[var(--pw-ink-2)]">End date</label>
                <input type="date" value={recEndDate ? recEndDate.toISOString().slice(0, 10) : ""} onChange={(e) => setRecEndDate(e.target.value ? new Date(e.target.value) : undefined)} className="mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-[var(--pw-surface)]" />
                              </>
                            )}
                            {endMode === "ongoing" && (
                              <p className="text-[12px] text-[var(--pw-ink-2)] mt-5">Books up to 26 occurrences from your selected start.</p>
                            )}
                          </div>
                          {dstShifts.length > 0 && (
                            <div className="sm:col-span-3 flex items-start gap-2 text-[12px] text-amber-700 bg-amber-50 p-2 rounded">
                              <AlertTriangle className="w-4 h-4 mt-0.5" />
                              <span>Heads up — daylight-saving change between occurrences. Local clock-time is preserved across all instances.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <NavBar onBack={back} onNext={next} disabled={!slot} />
              </div>
            )}

            {/* Step 3: Timezone */}
            {step === 2 && (
              <div className="space-y-3">
                <h1 className="font-display text-2xl">Confirm your timezone</h1>
                <div className="pw-card p-4">
                  <label className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Your timezone (auto-detected)</label>
                  <select
                    className="mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-[var(--pw-surface)]"
                    value={tz}
                    onChange={(e) => setTz(e.target.value)}
                  >
                    {[tz, ...COMMON_TIMEZONES.filter((t) => t !== tz)].map((z) => <option key={z} value={z}>{z}</option>)}
                  </select>
                  {slot && (
                    <div className="text-[13px] text-[var(--pw-ink-2)] mt-3 space-y-1">
                      <p>Your time: <strong>{fmtInTz(slot, tz, "EEEE, MMM d · h:mm a")}</strong> {tzAbbreviation(slot, tz)}</p>
                      {tutorTz !== tz && (
                        <p>Tutor's time: <strong>{fmtInTz(slot, tutorTz, "EEEE, MMM d · h:mm a")}</strong> {tzAbbreviation(slot, tutorTz)}</p>
                      )}
                      {tzMismatch && (
                        <p className="text-amber-700 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> You and your tutor are in different timezones — double-check the times match.</p>
                      )}
                    </div>
                  )}
                </div>
                <NavBar onBack={back} onNext={next} disabled={false} />
              </div>
            )}

            {/* Step 4: Summary */}
            {step === 3 && (
              <div className="space-y-3">
                <h1 className="font-display text-2xl">Order summary</h1>
                <div className="pw-card p-5 space-y-2 text-[14px]">
                  <Row label="Tutor" value={tutor?.display_name ?? "—"} />
                  <Row label="Type" value={type === "trial" ? "Trial / discovery" : type === "package" ? `${pkg?.sessions ?? 5} × sessions` : "Standard session"} />
                  <Row label="Duration" value={`${duration} min${type === "package" ? ` × ${pkg?.sessions ?? 5}` : ""}`} />
                  <Row label="Date & time" value={slot ? fmtInTz(slot, tz, "EEE, MMM d · h:mm a") : "—"} />
                  <Row label="Timezone" value={tz} />
                  {recurring && recurrenceInstances.length > 1 && (
                    <Row label="Recurrence" value={`${recurrenceInstances.length} × ${frequency}`} />
                  )}
                  <div className="border-t border-[var(--pw-border)] pt-3 mt-2 flex justify-between font-display text-[18px]">
                    <span>Total</span>
                    <span>{price === 0 ? "Free" : `$${price * (recurring && recurrenceInstances.length > 1 ? recurrenceInstances.length : 1)}`}</span>
                  </div>
                </div>
                {recurring && recurrenceInstances.length > 1 && (
                  <div className="pw-card p-4">
                    <div className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2">All instances</div>
                    <ul className="text-[13px] space-y-1 max-h-48 overflow-auto">
                      {recurrenceInstances.map((d, i) => (
                        <li key={d.toISOString()} className="flex justify-between">
                          <span className="text-[var(--pw-ink-2)]">#{i + 1}</span>
                          <span>{fmtInTz(d, tz, "EEE, MMM d · h:mm a")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <NavBar onBack={back} onNext={next} disabled={!slot} />
              </div>
            )}

            {/* Step 5: Pay */}
            {step === 4 && (
              <div className="space-y-3">
                <h1 className="font-display text-2xl">{price === 0 ? "Confirm" : "Payment"}</h1>
                <div className="pw-card p-5">
                  {price === 0 ? (
                    <p className="text-sm text-[var(--pw-ink-2)]">No payment required for this trial — just confirm below.</p>
                  ) : (
                    <>
                      <p className="text-sm text-[var(--pw-ink-2)]">
                        Stripe checkout isn't enabled yet — for now we'll mark this as paid so you can test the full flow.
                        Enable Stripe to charge real cards.
                      </p>
                      <div className="mt-3 p-3 rounded-md bg-[var(--pw-surface-2)] text-[13px]">
                        <strong>${price * (recurring && recurrenceInstances.length > 1 ? recurrenceInstances.length : 1)}</strong> · charged on confirmation{recurring && recurrenceInstances.length > 1 ? ` (${recurrenceInstances.length} sessions)` : ""}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={back} className="pw-btn-outline px-4 py-2 text-sm">Back</button>
                  <button
                    onClick={handleConfirmAndPay}
                    disabled={submitting || !slot}
                    className="pw-btn-primary px-5 py-2.5 text-sm flex-1 disabled:opacity-50"
                  >
                    {submitting ? "Booking…" : price === 0 ? "Confirm booking" : `Pay $${price} & confirm`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function TypeOption({ active, onClick, emoji, title, subtitle, price }: {
  active: boolean; onClick: () => void; emoji: string; title: string; subtitle: string; price: string;
}) {
  return (
    <button
      onClick={onClick}
      className="pw-card w-full p-4 text-left flex items-center gap-3 transition-colors"
      style={{
        borderColor: active ? "var(--pw-accent)" : "var(--pw-border)",
        background: active ? "var(--pw-accent-soft)" : "var(--pw-surface)",
      }}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="font-display text-[16px]">{title}</div>
        <div className="text-[12px] text-[var(--pw-ink-2)]">{subtitle}</div>
      </div>
      <div className="font-display text-[16px]">{price}</div>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[14px]">
      <span className="text-[var(--pw-ink-2)]">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function NavBar({ onBack, onNext, disabled }: { onBack?: () => void; onNext: () => void; disabled?: boolean }) {
  return (
    <div className="flex gap-2 pt-2">
      {onBack && <button onClick={onBack} className="pw-btn-outline px-4 py-2 text-sm">Back</button>}
      <button onClick={onNext} disabled={disabled} className="pw-btn-primary px-5 py-2.5 text-sm flex-1 disabled:opacity-50">
        Continue →
      </button>
    </div>
  );
}
