import { supabase } from "@/integrations/supabase/client";

export type SessionStatus =
  | "scheduled"
  | "confirmed"
  | "reminder_sent"
  | "in_progress"
  | "completed"
  | "awaiting_review"
  | "closed"
  | "cancelled"
  | "disputed";

export type SessionPaymentStatus = "unpaid" | "pending" | "paid" | "refunded" | "failed";

export type SessionType = "trial" | "standard" | "package";

export const STATUS_META: Record<SessionStatus, { label: string; bg: string; fg: string; description: string }> = {
  scheduled:        { label: "Scheduled",        bg: "#FEF3C7", fg: "#92400E", description: "Awaiting tutor confirmation" },
  confirmed:        { label: "Confirmed",        bg: "#DBEAFE", fg: "#1E40AF", description: "Locked in your calendars" },
  reminder_sent:    { label: "Reminder sent",    bg: "#E0E7FF", fg: "#3730A3", description: "We pinged both of you" },
  in_progress:      { label: "In progress",      bg: "#DCFCE7", fg: "#166534", description: "Session is live now" },
  completed:        { label: "Completed",        bg: "#E5E7EB", fg: "#374151", description: "Session ended" },
  awaiting_review:  { label: "Awaiting review",  bg: "#FEF3C7", fg: "#92400E", description: "Leave feedback within 48h" },
  closed:           { label: "Closed",           bg: "#F3F4F6", fg: "#4B5563", description: "All wrapped up" },
  cancelled:        { label: "Cancelled",        bg: "#FEE2E2", fg: "#991B1B", description: "This session was cancelled" },
  disputed:         { label: "Disputed",         bg: "#FFE4E6", fg: "#9F1239", description: "Under investigation" },
};

/** Allowed transitions for the session state machine. */
const TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  scheduled:       ["confirmed", "cancelled", "disputed"],
  confirmed:       ["reminder_sent", "in_progress", "cancelled", "disputed"],
  reminder_sent:   ["in_progress", "cancelled", "disputed"],
  in_progress:     ["completed", "disputed"],
  completed:       ["awaiting_review", "disputed"],
  awaiting_review: ["closed", "disputed"],
  closed:          ["disputed"],
  cancelled:       [],
  disputed:        ["closed"],
};

export function canTransition(from: SessionStatus, to: SessionStatus) {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export const ORDERED_STATES: SessionStatus[] = [
  "scheduled", "confirmed", "in_progress", "completed", "awaiting_review", "closed",
];

export interface TransitionInput {
  sessionId: string;
  to: SessionStatus;
  by: string; // user id
  reason?: string;
  patch?: Record<string, unknown>;
  notify?: { studentId?: string | null; tutorId?: string | null; title: string; message?: string; link?: string };
}

/** Apply a state transition: validates, updates session, logs history, fires notification. */
export async function transitionSession(input: TransitionInput) {
  const { data: current, error: readErr } = await supabase
    .from("sessions")
    .select("status_v2, student_id, tutor_id")
    .eq("id", input.sessionId)
    .single();
  if (readErr || !current) throw new Error(readErr?.message ?? "Session not found");

  const from = (current as any).status_v2 as SessionStatus;
  if (from !== input.to && !canTransition(from, input.to)) {
    throw new Error(`Cannot move from ${from} to ${input.to}`);
  }

  const update = { status_v2: input.to, ...(input.patch ?? {}) } as never;
  const { error: updErr } = await supabase.from("sessions").update(update).eq("id", input.sessionId);
  if (updErr) throw updErr;

  await supabase.from("session_state_history").insert({
    session_id: input.sessionId,
    from_status: from,
    to_status: input.to,
    changed_by: input.by,
    reason: input.reason ?? null,
  });

  if (input.notify) {
    const recipients = [input.notify.studentId ?? (current as any).student_id, input.notify.tutorId ?? (current as any).tutor_id]
      .filter(Boolean) as string[];
    if (recipients.length) {
      await supabase.from("notifications").insert(
        recipients.map((uid) => ({
          user_id: uid,
          title: input.notify!.title,
          message: input.notify!.message ?? null,
          link: input.notify!.link ?? `/sessions/${input.sessionId}`,
          type: input.to,
        })),
      );
    }
  }

  return { from, to: input.to };
}

/** Format price for a session type. */
export function priceForType(hourlyRate: number, type: SessionType, packageDiscount = 0, packageSessions = 5) {
  if (type === "trial") return Math.max(0, Math.round(hourlyRate * 0.5));
  if (type === "package") return Math.round(hourlyRate * packageSessions * (1 - packageDiscount / 100));
  return Math.round(hourlyRate);
}

export function durationForType(type: SessionType): number {
  if (type === "trial") return 30;
  return 60;
}

export function generateSlots(opts: {
  availability: { day_of_week: number; start_hour: number; end_hour: number }[];
  daysAhead?: number;
  durationMin?: number;
  bufferMin?: number;
}): Date[] {
  const days = opts.daysAhead ?? 14;
  const dur = opts.durationMin ?? 60;
  const slots: Date[] = [];
  const now = new Date();
  for (let d = 0; d < days; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    const dow = day.getDay();
    const blocks = opts.availability.filter((a) => a.day_of_week === dow);
    for (const b of blocks) {
      for (let hr = b.start_hour; hr + dur / 60 <= b.end_hour; hr++) {
        const slot = new Date(day);
        slot.setHours(hr, 0, 0, 0);
        if (slot.getTime() > now.getTime() + 60 * 60 * 1000) slots.push(slot);
      }
    }
  }
  return slots;
}

export function makeICS(opts: { title: string; description: string; start: Date; end: Date; url?: string }) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PathWise//Session//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@pathwise`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(opts.start)}`,
    `DTEND:${fmt(opts.end)}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${opts.description}`,
    opts.url ? `URL:${opts.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

export function googleCalendarUrl(opts: { title: string; details: string; start: Date; end: Date }) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    details: opts.details,
    dates: `${fmt(opts.start)}/${fmt(opts.end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}