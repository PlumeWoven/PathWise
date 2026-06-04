import { useState } from "react";
import { motion } from "framer-motion";
import type { TutorRow, MatchScore } from "./matching";
import { matchColor } from "./matching";

export interface MatchCardData {
  tutor: TutorRow;
  match: MatchScore;
  rating: { avg: number; count: number };
  packageDiscount?: number; // % off if a package exists
  course?: { title: string; thumbnail_url: string | null } | null;
}

export function MatchCard({ data, onBook, onMessage, onView }: {
  data: MatchCardData;
  onBook?: (tutorId: string) => void;
  onMessage?: (tutorId: string) => void;
  onView?: (tutorId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { tutor: t, match, rating, packageDiscount, course } = data;
  const pct = Math.round(match.total * 100);
  const color = matchColor(pct);

  const initials = (t.display_name ?? "T").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="pw-card overflow-hidden"
    >
      <div className="p-5 flex gap-5 flex-col sm:flex-row">
        {/* Photo */}
        <div className="flex sm:block items-center gap-4 sm:gap-0">
          {t.avatar_url ? (
            <img src={t.avatar_url} alt={t.display_name ?? "Tutor"} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-display text-2xl flex-shrink-0"
              style={{ background: "var(--pw-accent)" }}>{initials}</div>
          )}
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onView?.(t.id)}
              className="font-display text-[18px] leading-tight text-left hover:text-[var(--pw-accent)] transition-colors"
            >
              {t.display_name ?? "Tutor"}
            </button>
            <span
              className="pw-pill text-[11px] px-2.5 py-0.5 font-medium ml-auto sm:ml-0"
              style={{ background: color, color: "white" }}
              aria-label={`${pct}% match`}
            >
              {pct}% Match
            </span>
          </div>
          {t.headline && (
            <p className="text-[13px] text-[var(--pw-ink-2)] mt-0.5 line-clamp-2">{t.headline}</p>
          )}

          <div className="mt-2 flex items-center gap-3 text-[12px] text-[var(--pw-ink-2)] font-mono-pw">
            <span style={{ color: "var(--pw-accent)" }}>
              {"★".repeat(Math.round(rating.avg))}<span className="text-[var(--pw-border)]">{"★".repeat(5 - Math.round(rating.avg))}</span>
            </span>
            <span>{rating.avg.toFixed(1)} · ({rating.count} review{rating.count === 1 ? "" : "s"})</span>
          </div>

          {t.subject_specialties && t.subject_specialties.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {t.subject_specialties.slice(0, 4).map((s) => (
                <span key={s} className="pw-pill text-[11px] px-2.5 py-0.5" style={{ background: "var(--pw-surface-2)" }}>{s}</span>
              ))}
            </div>
          )}

          {course && (
            <div className="mt-3 flex items-center gap-3 pw-border rounded-lg p-2">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-12 h-12 rounded object-cover" />
              ) : (
                <div className="w-12 h-12 rounded bg-[var(--pw-surface-2)] flex items-center justify-center text-lg">📚</div>
              )}
              <div className="min-w-0">
                <div className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Featured course</div>
                <div className="text-[13px] font-medium truncate">{course.title}</div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-3 text-[12px] text-[var(--pw-accent)] hover:underline underline-offset-2"
            aria-expanded={open}
          >
            {open ? "Hide" : "Show"} match breakdown
          </button>
          {open && (
            <div className="mt-2 space-y-1.5">
              <Bar label="Subject expertise" pct={Math.round(match.parts.subject * 100)} />
              <Bar label="Learning style" pct={Math.round(match.parts.learningStyle * 100)} />
              <Bar label="Availability" pct={Math.round(match.parts.availability * 100)} />
              <Bar label="Budget fit" pct={Math.round(match.parts.budget * 100)} />
              <Bar label="Rating" pct={Math.round(match.parts.rating * 100)} />
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="sm:text-right sm:w-44 flex sm:flex-col items-start sm:items-end gap-2 justify-between">
          <div>
            <div className="font-display text-[22px] leading-none">
              ${Number(t.hourly_rate ?? 0).toFixed(0)}<span className="text-[12px] text-[var(--pw-ink-2)]"> /hr</span>
            </div>
            {packageDiscount && packageDiscount > 0 && (
              <div className="text-[11px] mt-0.5" style={{ color: "var(--pw-accent-2)" }}>
                Save {packageDiscount}% with package
              </div>
            )}
            {t.first_session_free && (
              <div className="text-[11px] text-[var(--pw-ink-2)] mt-0.5">First session free</div>
            )}
          </div>
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={() => onView?.(t.id)}
              className="pw-btn-outline px-4 py-2 text-[13px] font-medium flex-1"
            >
              View profile
            </button>
            <button
              onClick={() => onBook?.(t.id)}
              className="pw-btn-primary px-4 py-2 text-[13px] font-medium flex-1"
            >
              Book trial
            </button>
            <button
              onClick={() => onMessage?.(t.id)}
              className="pw-btn-outline px-4 py-2 text-[13px] font-medium flex-1"
            >
              Message
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="text-[12px]">
      <div className="flex justify-between">
        <span className="text-[var(--pw-ink-2)]">{label}</span>
        <span className="font-mono-pw">{pct}%</span>
      </div>
      <div className="h-1.5 mt-1 rounded-full overflow-hidden bg-[var(--pw-surface-2)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--pw-accent)" }} />
      </div>
    </div>
  );
}