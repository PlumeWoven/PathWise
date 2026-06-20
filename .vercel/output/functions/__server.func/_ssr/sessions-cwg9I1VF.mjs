import { s as supabase } from "./router-C4GolrgT.mjs";
const STATUS_META = {
  scheduled: { label: "Scheduled", bg: "#FEF3C7", fg: "#92400E", description: "Awaiting tutor confirmation" },
  confirmed: { label: "Confirmed", bg: "#DBEAFE", fg: "#1E40AF", description: "Locked in your calendars" },
  reminder_sent: { label: "Reminder sent", bg: "#E0E7FF", fg: "#3730A3", description: "We pinged both of you" },
  in_progress: { label: "In progress", bg: "#DCFCE7", fg: "#166534", description: "Session is live now" },
  completed: { label: "Completed", bg: "#E5E7EB", fg: "#374151", description: "Session ended" },
  awaiting_review: { label: "Awaiting review", bg: "#FEF3C7", fg: "#92400E", description: "Leave feedback within 48h" },
  closed: { label: "Closed", bg: "#F3F4F6", fg: "#4B5563", description: "All wrapped up" },
  cancelled: { label: "Cancelled", bg: "#FEE2E2", fg: "#991B1B", description: "This session was cancelled" },
  disputed: { label: "Disputed", bg: "#FFE4E6", fg: "#9F1239", description: "Under investigation" }
};
const TRANSITIONS = {
  scheduled: ["confirmed", "cancelled", "disputed"],
  confirmed: ["reminder_sent", "in_progress", "cancelled", "disputed"],
  reminder_sent: ["in_progress", "cancelled", "disputed"],
  in_progress: ["completed", "disputed"],
  completed: ["awaiting_review", "disputed"],
  awaiting_review: ["closed", "disputed"],
  closed: ["disputed"],
  cancelled: [],
  disputed: ["closed"]
};
function canTransition(from, to) {
  return TRANSITIONS[from]?.includes(to) ?? false;
}
const ORDERED_STATES = [
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "awaiting_review",
  "closed"
];
async function transitionSession(input) {
  const { data: current, error: readErr } = await supabase.from("sessions").select("status_v2, student_id, tutor_id").eq("id", input.sessionId).single();
  if (readErr || !current) throw new Error(readErr?.message ?? "Session not found");
  const from = current.status_v2;
  if (from !== input.to && !canTransition(from, input.to)) {
    throw new Error(`Cannot move from ${from} to ${input.to}`);
  }
  const update = { status_v2: input.to, ...input.patch ?? {} };
  const { error: updErr } = await supabase.from("sessions").update(update).eq("id", input.sessionId);
  if (updErr) throw updErr;
  await supabase.from("session_state_history").insert({
    session_id: input.sessionId,
    from_status: from,
    to_status: input.to,
    changed_by: input.by,
    reason: input.reason ?? null
  });
  if (input.notify) {
    const recipients = [input.notify.studentId ?? current.student_id, input.notify.tutorId ?? current.tutor_id].filter(Boolean);
    if (recipients.length) {
      await supabase.from("notifications").insert(
        recipients.map((uid) => ({
          user_id: uid,
          title: input.notify.title,
          message: input.notify.message ?? null,
          link: input.notify.link ?? `/sessions/${input.sessionId}`,
          type: input.to
        }))
      );
    }
  }
  return { from, to: input.to };
}
function priceForType(hourlyRate, type, packageDiscount = 0, packageSessions = 5) {
  if (type === "trial") return Math.max(0, Math.round(hourlyRate * 0.5));
  if (type === "package") return Math.round(hourlyRate * packageSessions * (1 - packageDiscount / 100));
  return Math.round(hourlyRate);
}
function durationForType(type) {
  if (type === "trial") return 30;
  return 60;
}
function makeICS(opts) {
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PathWise//Session//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@pathwise`,
    `DTSTAMP:${fmt(/* @__PURE__ */ new Date())}`,
    `DTSTART:${fmt(opts.start)}`,
    `DTEND:${fmt(opts.end)}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${opts.description}`,
    opts.url ? `URL:${opts.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean).join("\r\n");
}
function googleCalendarUrl(opts) {
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    details: opts.details,
    dates: `${fmt(opts.start)}/${fmt(opts.end)}`
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
export {
  ORDERED_STATES as O,
  STATUS_META as S,
  durationForType as d,
  googleCalendarUrl as g,
  makeICS as m,
  priceForType as p,
  transitionSession as t
};
