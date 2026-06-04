import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { addDays, addWeeks, addMonths, isSameDay } from "date-fns";

export const COMMON_TIMEZONES = [
  "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
  "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid",
  "Africa/Cairo", "Asia/Dubai", "Asia/Kolkata", "Asia/Bangkok", "Asia/Singapore",
  "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland",
];

export function detectTimezone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
  catch { return "UTC"; }
}

export function tzAbbreviation(date: Date, tz: string): string {
  try { return formatInTimeZone(date, tz, "zzz"); } catch { return tz; }
}

export function fmtInTz(date: Date, tz: string, fmt = "EEE, MMM d · h:mm a") {
  try { return formatInTimeZone(date, tz, fmt); } catch { return date.toString(); }
}

/**
 * Detect whether a given local hour-of-week slot crosses a DST transition
 * for the next `weeks` occurrences. Returns dates with offset shifts.
 */
export function detectDSTShifts(start: Date, tz: string, weeks: number): Date[] {
  const baseOffset = formatInTimeZone(start, tz, "xxx");
  const out: Date[] = [];
  for (let i = 1; i < weeks; i++) {
    const d = addWeeks(start, i);
    if (formatInTimeZone(d, tz, "xxx") !== baseOffset) out.push(d);
  }
  return out;
}

export type Frequency = "weekly" | "biweekly" | "monthly";

export interface RecurrenceOptions {
  start: Date;
  frequency: Frequency;
  /** Mutually exclusive with endDate; either count or endDate, not both. */
  count?: number;
  endDate?: Date;
  /** Hard cap to avoid runaway "ongoing" bookings. */
  maxOccurrences?: number;
}

export function expandRecurrence(opts: RecurrenceOptions): Date[] {
  const cap = opts.maxOccurrences ?? 26;
  const out: Date[] = [];
  let cursor = opts.start;
  for (let i = 0; i < cap; i++) {
    if (opts.endDate && cursor > opts.endDate) break;
    out.push(cursor);
    if (opts.count && out.length >= opts.count) break;
    cursor = opts.frequency === "weekly" ? addWeeks(cursor, 1)
      : opts.frequency === "biweekly" ? addWeeks(cursor, 2)
      : addMonths(cursor, 1);
  }
  return out;
}

export interface AvailabilityRow {
  day_of_week: number;
  start_hour: number;
  end_hour: number;
  is_blocked?: boolean | null;
}

export interface SlotConfig {
  availability: AvailabilityRow[];
  durationMin: number;
  bufferMin?: number;
  daysAhead?: number;
  /** Booked time ranges (UTC). */
  booked?: Array<{ start: Date; end: Date }>;
  /** Minimum hours into the future a slot must be. */
  minAdvanceHours?: number;
  tz?: string;
}

/**
 * Generate bookable slots in UTC. Honours blocked rows, buffer, advance window,
 * and existing bookings.
 */
export function buildAvailableSlots(cfg: SlotConfig): Date[] {
  const days = cfg.daysAhead ?? 30;
  const dur = cfg.durationMin;
  const buf = cfg.bufferMin ?? 0;
  const minAdvance = cfg.minAdvanceHours ?? 24;
  const earliest = new Date(Date.now() + minAdvance * 60 * 60 * 1000);
  const out: Date[] = [];
  const today = new Date();

  for (let d = 0; d < days; d++) {
    const day = addDays(today, d);
    const dow = day.getDay();
    const blocks = cfg.availability.filter((a) => a.day_of_week === dow && !a.is_blocked);
    for (const b of blocks) {
      for (let hr = b.start_hour; hr + dur / 60 <= b.end_hour; hr++) {
        const slot = new Date(day);
        slot.setHours(hr, 0, 0, 0);
        if (slot < earliest) continue;
        const slotEnd = new Date(slot.getTime() + dur * 60 * 1000);
        const conflict = (cfg.booked ?? []).some(
          (bk) => slot.getTime() < bk.end.getTime() + buf * 60 * 1000 &&
                  slotEnd.getTime() + buf * 60 * 1000 > bk.start.getTime(),
        );
        if (!conflict) out.push(slot);
      }
    }
  }
  return out;
}

export function groupSlotsByDay(slots: Date[]): Map<string, Date[]> {
  const map = new Map<string, Date[]>();
  for (const s of slots) {
    const k = s.toDateString();
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(s);
  }
  return map;
}

export function hasSlotsOn(date: Date, slots: Date[]): boolean {
  return slots.some((s) => isSameDay(s, date));
}

export function offsetDifferenceLabel(a: Date, tzA: string, tzB: string): string | null {
  try {
    const oa = formatInTimeZone(a, tzA, "xxx");
    const ob = formatInTimeZone(a, tzB, "xxx");
    if (oa === ob) return null;
    return `${tzA} (${oa}) vs ${tzB} (${ob})`;
  } catch { return null; }
}

export { toZonedTime };