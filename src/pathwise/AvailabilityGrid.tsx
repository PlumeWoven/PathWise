import { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export type CellState = "free" | "available" | "blocked" | "booked";

interface AvailabilityGridProps {
    grid: Record<string, CellState>;
    onChange: (newGrid: Record<string, CellState>) => void;
    bookedSlots?: Set<string>;
    readOnly?: boolean;
    className?: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_INDEX = [1, 2, 3, 4, 5, 6, 0];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function AvailabilityGrid({
    grid,
    onChange,
    bookedSlots = new Set(),
    readOnly = false,
    className = "",
}: AvailabilityGridProps) {
    const dragMode = useRef<CellState | null>(null);

    function cellState(day: number, hour: number): CellState {
        const key = `${day}-${hour}`;
        if (bookedSlots.has(key)) return "booked";
        return grid[key] ?? "free";
    }

    function paint(day: number, hour: number, mode: CellState) {
        const key = `${day}-${hour}`;
        if (bookedSlots.has(key)) return;
        const newGrid = { ...grid, [key]: mode };
        onChange(newGrid);
    }

    function nextMode(current: CellState): CellState {
        if (current === "free") return "available";
        if (current === "available") return "blocked";
        return "free";
    }

    function onCellMouseDown(day: number, hour: number) {
        if (readOnly) return;
        const cur = cellState(day, hour);
        if (cur === "booked") return;
        const target = nextMode(cur);
        dragMode.current = target;
        paint(day, hour, target);
    }

    function onCellEnter(day: number, hour: number) {
        if (readOnly || dragMode.current === null) return;
        paint(day, hour, dragMode.current);
    }

    return (
        <div
            className={`select-none ${className}`}
            onMouseUp={() => (dragMode.current = null)}
            onMouseLeave={() => (dragMode.current = null)}
        >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pw-card overflow-x-auto">
                <div className="min-w-[640px] p-3">
                    <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px">
                        <div />
                        {DAYS.map((d) => (
                            <div key={d} className="text-center font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] py-1">
                                {d}
                            </div>
                        ))}
                        {HOURS.map((h) => (
                            <Hour
                                key={h}
                                hour={h}
                                cellState={cellState}
                                onMouseDown={onCellMouseDown}
                                onMouseEnter={onCellEnter}
                                readOnly={readOnly}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
            <div className="flex items-center gap-4 flex-wrap mt-4">
                <Legend color="#10B981" label="Available" />
                <Legend color="#9CA3AF" label="Blocked / time off" />
                <Legend color="#3B82F6" label="Booked" />
                <Legend color="var(--pw-input-bg)" label="Free" border />
            </div>
        </div>
    );
}

function Hour({
    hour,
    cellState,
    onMouseDown,
    onMouseEnter,
    readOnly,
}: {
    hour: number;
    cellState: (day: number, h: number) => CellState;
    onMouseDown: (day: number, h: number) => void;
    onMouseEnter: (day: number, h: number) => void;
    readOnly?: boolean;
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
                        style={{ opacity: state === "booked" ? 0.9 : 1, cursor: readOnly ? "default" : "pointer" }}
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
            <span
                className="w-4 h-4 rounded"
                style={{ background: color, border: border ? "1px solid var(--pw-border)" : undefined }}
            />
            {label}
        </div>
    );
}