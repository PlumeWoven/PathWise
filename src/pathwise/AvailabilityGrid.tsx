import { Fragment, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Check, Copy, Lock, X } from "lucide-react";

export type CellState = "free" | "available" | "blocked" | "booked";

interface AvailabilityGridProps {
  grid: Record<string, CellState>;
  onChange: (newGrid: Record<string, CellState>) => void;
  bookedSlots?: Set<string>;
  readOnly?: boolean;
  className?: string;
}

// Columns run Mon..Sun; grid keys use day_of_week (0 = Sunday), hence DAY_INDEX.
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_INDEX = [1, 2, 3, 4, 5, 6, 0];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const STATE_LABEL: Record<CellState, string> = {
  free: "not set",
  available: "available",
  blocked: "blocked",
  booked: "booked",
};
// Each state has a glyph, and Blocked a stripe, so none depends on hue alone
// (Available vs Blocked fills were 1.1:1 apart).
const CELL_CLASS: Record<CellState, string> = {
  free: "bg-[var(--pw-input-bg)]",
  available: "bg-[var(--pw-accent-2)] text-[var(--pw-bg)]",
  blocked: "text-[var(--pw-ink)]",
  booked: "bg-pw-accent-fill text-pw-on-accent",
};
const BLOCKED_BG: CSSProperties = {
  background:
    "repeating-linear-gradient(45deg, color-mix(in srgb, var(--pw-ink-2) 45%, transparent) 0 2px, transparent 2px 6px)",
};

function hourLabel(h: number) {
  return `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;
}

function nextMode(current: CellState): CellState {
  if (current === "free") return "available";
  if (current === "available") return "blocked";
  return "free";
}

function Glyph({ state }: { state: CellState }) {
  if (state === "available") return <Check className="size-3.5" aria-hidden="true" />;
  if (state === "blocked") return <X className="size-3.5" aria-hidden="true" />;
  if (state === "booked") return <Lock className="size-3" aria-hidden="true" />;
  return null;
}

/**
 * Weekly availability: tap/click a slot to cycle not set → available → blocked,
 * drag with a mouse to paint, or use the arrow keys (one tab stop, roving focus).
 * Below `sm` it shows one day at a time with a day picker.
 */
export function AvailabilityGrid({
  grid,
  onChange,
  bookedSlots = new Set(),
  readOnly = false,
  className = "",
}: AvailabilityGridProps) {
  // Latest grid, so a fast drag never paints from a stale render.
  const gridRef = useRef(grid);
  gridRef.current = grid;
  const dragMode = useRef<CellState | null>(null);
  // Last slot painted in this drag: a fast mouse skips cells, so fill the gap in a line.
  const lastCell = useRef<[number, number] | null>(null);
  const cellsRef = useRef<HTMLDivElement>(null);
  const focusPending = useRef(false);
  // The focused slot. `col` is also the day shown on phones and the day "Copy" copies.
  const [col, setCol] = useState(0);
  const [hour, setHour] = useState(9);

  useEffect(() => {
    const end = () => (dragMode.current = null);
    window.addEventListener("mouseup", end);
    return () => window.removeEventListener("mouseup", end);
  }, []);

  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    cellsRef.current?.querySelector<HTMLButtonElement>(`[data-cell="${col}-${hour}"]`)?.focus();
  }, [col, hour]);

  const stateOf = (day: number, h: number): CellState =>
    bookedSlots.has(`${day}-${h}`) ? "booked" : (gridRef.current[`${day}-${h}`] ?? "free");

  function paint(cells: Array<[number, number]>, mode: CellState) {
    if (readOnly) return;
    const next = { ...gridRef.current };
    for (const [i, h] of cells) {
      const key = `${DAY_INDEX[i]}-${h}`;
      if (!bookedSlots.has(key)) next[key] = mode;
    }
    gridRef.current = next;
    onChange(next);
  }

  function dragTo(i: number, h: number) {
    const mode = dragMode.current;
    if (!mode) return;
    const [li, lh] = lastCell.current ?? [i, h];
    const cells: Array<[number, number]> = [];
    if (li === i) for (let k = Math.min(lh, h); k <= Math.max(lh, h); k++) cells.push([i, k]);
    else if (lh === h) for (let k = Math.min(li, i); k <= Math.max(li, i); k++) cells.push([k, h]);
    else cells.push([i, h]);
    lastCell.current = [i, h];
    paint(cells, mode);
  }

  function toggle(i: number, h: number): CellState | null {
    const cur = stateOf(DAY_INDEX[i], h);
    if (readOnly || cur === "booked") return null;
    const mode = nextMode(cur);
    paint([[i, h]], mode);
    lastCell.current = [i, h];
    return mode;
  }

  function onKeyDown(e: KeyboardEvent) {
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const step = steps[e.key];
    if (!step) return;
    e.preventDefault();
    const c = Math.min(6, Math.max(0, col + step[0]));
    const h = Math.min(23, Math.max(0, hour + step[1]));
    focusPending.current = true;
    setCol(c);
    setHour(h);
  }

  function copyDayToAll() {
    const src = DAY_INDEX[col];
    const next = { ...gridRef.current };
    for (const h of HOURS) {
      for (const day of DAY_INDEX) {
        const k = `${day}-${h}`;
        if (day === src || bookedSlots.has(k)) continue;
        const v = next[`${src}-${h}`];
        if (v) next[k] = v;
        else delete next[k];
      }
    }
    gridRef.current = next;
    onChange(next);
    toast.success(`Copied ${DAY_NAMES[col]} to every day`);
  }

  // Phones show only the selected day's column.
  const phoneHidden = (i: number) => (i === col ? "" : "max-sm:hidden");

  return (
    <div className={className}>
      <p className="text-[0.8125rem] text-[var(--pw-ink-2)]">
        Tap or click a slot to make it available, again to block it (time off), and again to clear
        it. With a mouse you can drag to paint several; arrow keys move between slots.
      </p>

      <div className="sm:hidden mt-3 grid grid-cols-7 gap-1" role="group" aria-label="Day to edit">
        {DAYS.map((d, i) => (
          <button
            key={d}
            type="button"
            aria-pressed={i === col}
            onClick={() => setCol(i)}
            className={`pw-pill min-h-11 justify-center px-0 ${i === col ? "is-active" : ""}`}
          >
            {d}
          </button>
        ))}
      </div>

      <div ref={cellsRef} className="pw-card mt-3 p-3 select-none">
        <div
          role="group"
          aria-label="Weekly availability"
          className="grid grid-cols-[3.75rem_1fr] sm:grid-cols-[3.75rem_repeat(7,1fr)] gap-px"
        >
          <div />
          {DAYS.map((d, i) => (
            <div
              key={d}
              aria-hidden="true"
              className={`text-center label-caps text-[var(--pw-ink-2)] py-1 ${phoneHidden(i)}`}
            >
              {d}
            </div>
          ))}
          {HOURS.map((h) => (
            <Fragment key={h}>
              <div
                aria-hidden="true"
                className="text-right pr-2 font-mono-pw text-[0.6875rem] text-[var(--pw-ink-2)] self-center"
              >
                {hourLabel(h)}
              </div>
              {DAY_INDEX.map((day, i) => {
                const s = stateOf(day, h);
                return (
                  <button
                    key={day}
                    type="button"
                    data-cell={`${i}-${h}`}
                    tabIndex={i === col && h === hour ? 0 : -1}
                    aria-label={`${DAY_NAMES[i]} ${hourLabel(h)}, ${STATE_LABEL[s]}`}
                    aria-disabled={readOnly || s === "booked" || undefined}
                    onFocus={() => {
                      setCol(i);
                      setHour(h);
                    }}
                    // Mouse and touch act on press (drag-paint starts here); keyboard
                    // Enter/Space arrive as a click with detail 0.
                    onMouseDown={(e) => {
                      if (e.button === 0) dragMode.current = toggle(i, h);
                    }}
                    onMouseEnter={() => dragTo(i, h)}
                    onClick={(e) => e.detail === 0 && toggle(i, h)}
                    onKeyDown={onKeyDown}
                    style={s === "blocked" ? BLOCKED_BG : undefined}
                    className={`h-7 max-sm:h-11 [@media(pointer:coarse)]:h-11 grid place-items-center pw-border transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--pw-ink)] ${CELL_CLASS[s]} ${phoneHidden(i)} ${readOnly || s === "booked" ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <Glyph state={s} />
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-x-4 gap-y-2 flex-wrap mt-4">
        <Legend state="available" label="Available" />
        <Legend state="blocked" label="Blocked / time off" />
        <Legend state="booked" label="Booked" />
        <Legend state="free" label="Not set" />
        {!readOnly && (
          <button
            type="button"
            onClick={copyDayToAll}
            className="pw-btn-outline px-3 py-1.5 inline-flex items-center gap-1.5 sm:ml-auto"
          >
            <Copy className="w-3 h-3" aria-hidden="true" /> Copy {DAYS[col]} to all days
          </button>
        )}
      </div>
    </div>
  );
}

function Legend({ state, label }: { state: CellState; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[0.75rem] text-[var(--pw-ink-2)]">
      <span
        aria-hidden="true"
        className={`size-5 grid place-items-center pw-border ${CELL_CLASS[state]}`}
        style={state === "blocked" ? BLOCKED_BG : undefined}
      >
        <Glyph state={state} />
      </span>
      {label}
    </div>
  );
}
