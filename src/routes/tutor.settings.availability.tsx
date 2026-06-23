import { createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { useDarkMode } from "../pathwise/DarkMode";
import { supabase } from "@/integrations/supabase/client";
import { COMMON_TIMEZONES, detectTimezone } from "../pathwise/scheduling";
import { Globe, Clock, Copy, Save, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/tutor/settings/availability")({
  head: () => ({
    meta: [
      { title: "Availability — PathWise" },
      { name: "description", content: "Set your weekly availability, buffer time, and time off." },
    ],
  }),
  component: AvailabilityPage,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_INDEX = [1, 2, 3, 4, 5, 6, 0];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const BUFFER_OPTIONS = [0, 15, 30, 60];

type CellState = "free" | "available" | "blocked" | "booked";

function AvailabilityPage() {
  const { user, isLoggedIn } = useAuth();
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/dashboard');

  const [grid, setGrid] = useState<Record<string, CellState>>({});
  const [tz, setTz] = useState(detectTimezone());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [minAdvanceHours, setMinAdvanceHours] = useState(24);
  const [instantBookings, setInstantBookings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tzMismatch, setTzMismatch] = useState<string | null>(null);

  const dragMode = useRef<CellState | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    void loadAll();
  }, [isLoggedIn, user?.id]);

  async function loadAll() {
    if (!user) return;
    setLoading(true);
    try {
      const [profileRes, availRes, sessionsRes] = await Promise.all([
        supabase.from("profiles").select("timezone, buffer_minutes, instant_bookings, min_advance_hours").eq("id", user.id).maybeSingle(),
        supabase.from("tutor_availability").select("day_of_week, start_hour, end_hour, is_blocked").eq("user_id", user.id),
        supabase.from("sessions").select("scheduled_start, scheduled_end").eq("tutor_id", user.id).in("status_v2", ["scheduled", "confirmed", "reminder_sent", "in_progress"]),
      ]);

      const p: any = profileRes.data ?? {};
      const detected = detectTimezone();
      const profileTz: string = p.timezone || detected;
      setTz(profileTz);
      if (p.timezone && p.timezone !== detected) {
        setTzMismatch(`Your browser is in ${detected} but your profile is set to ${p.timezone}.`);
      }
      setBufferMinutes(p.buffer_minutes ?? 15);
      setInstantBookings(!!p.instant_bookings);
      setMinAdvanceHours(p.min_advance_hours ?? 24);

      const next: Record<string, CellState> = {};
      for (const row of (availRes.data ?? []) as any[]) {
        for (let h = row.start_hour; h < row.end_hour; h++) {
          next[`${row.day_of_week}-${h}`] = row.is_blocked ? "blocked" : "available";
        }
      }
      setGrid(next);

      const booked = new Set<string>();
      for (const s of (sessionsRes.data ?? []) as any[]) {
        if (!s.scheduled_start) continue;
        const d = new Date(s.scheduled_start);
        booked.add(`${d.getDay()}-${d.getHours()}`);
      }
      setBookedSlots(booked);
    } finally {
      setLoading(false);
    }
  }

  function cellState(day: number, hour: number): CellState {
    const key = `${day}-${hour}`;
    if (bookedSlots.has(key)) return "booked";
    return grid[key] ?? "free";
  }

  function paint(day: number, hour: number, mode: CellState) {
    const key = `${day}-${hour}`;
    if (bookedSlots.has(key)) return;
    setGrid((g) => ({ ...g, [key]: mode }));
  }

  function nextMode(current: CellState): CellState {
    if (current === "free") return "available";
    if (current === "available") return "blocked";
    return "free";
  }

  function onCellMouseDown(day: number, hour: number) {
    const cur = cellState(day, hour);
    if (cur === "booked") return;
    const target = nextMode(cur);
    dragMode.current = target;
    paint(day, hour, target);
  }

  function onCellEnter(day: number, hour: number) {
    if (dragMode.current === null) return;
    paint(day, hour, dragMode.current);
  }

  function copyMondayToAll() {
    setGrid((g) => {
      const next = { ...g };
      for (let h = 0; h < 24; h++) {
        const src = next[`1-${h}`];
        for (const day of [2, 3, 4, 5, 6, 0]) {
          const k = `${day}-${h}`;
          if (bookedSlots.has(k)) continue;
          if (src) next[k] = src;
          else delete next[k];
        }
      }
      return next;
    });
    toast.success("Copied Monday to all weekdays + weekend");
  }

  function compactGrid(): Array<{ day_of_week: number; start_hour: number; end_hour: number; is_blocked: boolean }> {
    const ranges: Array<{ day_of_week: number; start_hour: number; end_hour: number; is_blocked: boolean }> = [];
    for (const day of [0, 1, 2, 3, 4, 5, 6]) {
      let runStart: number | null = null;
      let runBlocked = false;
      for (let h = 0; h < 25; h++) {
        const state = h < 24 ? grid[`${day}-${h}`] : undefined;
        const active = state === "available" || state === "blocked";
        const blocked = state === "blocked";
        if (active && runStart === null) {
          runStart = h;
          runBlocked = blocked;
        } else if (active && runStart !== null && blocked !== runBlocked) {
          ranges.push({ day_of_week: day, start_hour: runStart, end_hour: h, is_blocked: runBlocked });
          runStart = h;
          runBlocked = blocked;
        } else if (!active && runStart !== null) {
          ranges.push({ day_of_week: day, start_hour: runStart, end_hour: h, is_blocked: runBlocked });
          runStart = null;
        }
      }
    }
    return ranges;
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      const ranges = compactGrid();
      const { error: delErr } = await supabase.from("tutor_availability").delete().eq("user_id", user.id);
      if (delErr) throw delErr;
      if (ranges.length) {
        const { error: insErr } = await supabase.from("tutor_availability").insert(
          ranges.map((r) => ({ ...r, user_id: user.id })) as any,
        );
        if (insErr) throw insErr;
      }
      const { error: profErr } = await supabase.from("profiles").update({
        timezone: tz,
        buffer_minutes: bufferMinutes,
        instant_bookings: instantBookings,
        min_advance_hours: minAdvanceHours,
      } as any).eq("id", user.id);
      if (profErr) throw profErr;
      toast.success("Availability saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)]">
        <PWHeader />
        <main className="max-w-md mx-auto px-5 py-12 text-center">
          <h1 className="font-display text-2xl">Sign in required</h1>
          <p className="text-sm text-[var(--pw-ink-2)] mt-2">Tutors only — please sign in.</p>
          <button onClick={() => navigate({ to: "/" })} className="pw-btn-outline mt-4 px-4 py-2 text-sm">Home</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]" onMouseUp={() => (dragMode.current = null)} onMouseLeave={() => (dragMode.current = null)}>
      {!isInsideDashboard && <PWHeader />}
      <main className="px-5 sm:px-8 py-6 max-w-5xl mx-auto pb-24">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl">Your weekly availability</h1>
            <p className="text-sm text-[var(--pw-ink-2)] mt-1">Click a cell to mark it available. Click again to block it (vacation/time off). Drag to paint multiple cells.</p>
          </div>
          <Link to="/dashboard" className="pw-btn-outline px-4 py-2 text-sm">Back to dashboard</Link>
        </div>

        {tzMismatch && (
          <div className="pw-card mt-4 p-3 flex items-start gap-3 border-l-4" style={{ borderLeftColor: "var(--pw-warning, #d97706)" }}>
            <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600" />
            <div className="text-[13px] text-[var(--pw-ink-2)]">{tzMismatch} Update below if needed.</div>
          </div>
        )}

        <div className="pw-card mt-4 p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] flex items-center gap-1.5"><Globe className="w-3 h-3" /> Timezone</label>
            <select value={tz} onChange={(e) => setTz(e.target.value)} className="mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-[var(--pw-input-bg)]">
              {[tz, ...COMMON_TIMEZONES.filter((t) => t !== tz)].map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            <p className="text-[11px] text-[var(--pw-ink-2)] mt-1">Current: <strong>{tz}</strong></p>
          </div>
          <div>
            <label className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] flex items-center gap-1.5"><Clock className="w-3 h-3" /> Buffer between sessions</label>
            <select value={bufferMinutes} onChange={(e) => setBufferMinutes(Number(e.target.value))} className="mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-[var(--pw-input-bg)]">
              {BUFFER_OPTIONS.map((b) => <option key={b} value={b}>{b === 0 ? "No buffer" : `${b} min`}</option>)}
            </select>
          </div>
          <div>
            <label className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Min advance booking</label>
            <select value={minAdvanceHours} onChange={(e) => setMinAdvanceHours(Number(e.target.value))} className="mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-[var(--pw-input-bg)]">
              {[2, 6, 12, 24, 48, 72].map((h) => <option key={h} value={h}>{h} hours</option>)}
            </select>
          </div>
          <div>
            <label className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Instant bookings</label>
            <button
              onClick={() => setInstantBookings((v) => !v)}
              className="mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] text-left"
              style={{ background: instantBookings ? "var(--pw-accent-soft)" : "var(--pw-input-bg)" }}
            >
              {instantBookings ? "On — auto-confirm" : "Off — you confirm each one"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <Legend color="#10B981" label="Available" />
          <Legend color="#9CA3AF" label="Blocked / time off" />
          <Legend color="#3B82F6" label="Booked" />
          <Legend color="white" label="Free" border={isDark} />
          <button onClick={copyMondayToAll} className="pw-btn-outline px-3 py-1.5 text-[12px] flex items-center gap-1.5 ml-auto">
            <Copy className="w-3 h-3" /> Copy Monday to all days
          </button>
          <button onClick={save} disabled={saving} className="pw-btn-primary px-4 py-1.5 text-[12px] flex items-center gap-1.5 disabled:opacity-50">
            <Save className="w-3 h-3" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pw-card mt-4 overflow-x-auto select-none">
          <div className="min-w-[640px] p-3">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px">
              <div />
              {DAYS.map((d) => <div key={d} className="text-center font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] py-1">{d}</div>)}
              {HOURS.map((h) => (
                <Hour key={h} hour={h} cellState={cellState} onMouseDown={onCellMouseDown} onMouseEnter={onCellEnter} />
              ))}
            </div>
          </div>
        </motion.div>

        {loading && <p className="text-sm text-[var(--pw-ink-2)] mt-4">Loading…</p>}
      </main>
    </div>
  );
}

function Hour({ hour, cellState, onMouseDown, onMouseEnter }: {
  hour: number;
  cellState: (day: number, h: number) => CellState;
  onMouseDown: (day: number, h: number) => void;
  onMouseEnter: (day: number, h: number) => void;
}) {
  const label = useMemo(() => {
    const ampm = hour < 12 ? "am" : "pm";
    const hr = hour % 12 === 0 ? 12 : hour % 12;
    return `${hr}${ampm}`;
  }, [hour]);
  return (
    <>
      <div className="text-right pr-2 font-mono-pw text-[11px] text-[var(--pw-ink-2)] py-1">{label}</div>
      {DAY_INDEX.map((day) => {
        const state = cellState(day, hour);
        let bgClass = "";
        if (state === "available") bgClass = "bg-[var(--pw-accent-2)]";
        else if (state === "blocked") bgClass = "bg-[var(--pw-ink-2)]";
        else if (state === "booked") bgClass = "bg-[var(--pw-accent)]";
        else bgClass = "bg-[var(--pw-input-bg)]";

        return (
          <div
            key={`${day}-${hour}`}
            onMouseDown={() => onMouseDown(day, hour)}
            onMouseEnter={() => onMouseEnter(day, hour)}
            className={`h-7 rounded cursor-pointer pw-border hover:opacity-80 transition-opacity ${bgClass}`}
            style={{ opacity: state === "booked" ? 0.9 : 1 }}
            title={`${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]} ${hour}:00 — ${state}`}
          />
        );
      })}
    </>
  );
}

function Legend({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-[var(--pw-ink-2)]">
      <span className="w-4 h-4 rounded" style={{ background: color, border: border ? "1px solid var(--pw-border)" : undefined }} />
      {label}
    </div>
  );
}

// ===== NAMED EXPORT FOR DASHBOARD REUSE =====
const TutorAvailabilityComponent = Route.options.component;
export { TutorAvailabilityComponent as TutorAvailabilityPage };