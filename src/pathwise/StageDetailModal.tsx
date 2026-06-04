import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Subject } from "./data";
import { addSession, getStageProgress, removeSession, useProgress } from "./progress";

interface Props {
  subject: Subject;
  stageNumber: number;
  stageTitle: string;
  onClose: () => void;
}

export function StageDetailModal({ subject, stageNumber, stageTitle, onClose }: Props) {
  useProgress();
  const progress = getStageProgress(subject, stageNumber);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tutor, setTutor] = useState("");
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!tutor.trim()) return;
    addSession(subject, stageNumber, { date, tutor: tutor.trim(), duration, notes: notes.trim() });
    setTutor("");
    setNotes("");
    setDuration(45);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(26,26,26,0.45)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="pw-card w-full max-w-2xl max-h-[88vh] overflow-y-auto"
          style={{ background: "var(--pw-surface)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono-pw text-[11px] text-[var(--pw-ink-2)]">
                  STAGE {String(stageNumber).padStart(2, "0")} · SESSION LOG
                </div>
                <h2 className="font-display text-[26px] leading-tight mt-1">{stageTitle}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Add session form */}
            <form onSubmit={submit} className="mt-5 pw-card p-4" style={{ background: "var(--pw-surface-2)" }}>
              <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-3">
                LOG A SESSION
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[12px] text-[var(--pw-ink-2)]">Date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-3 py-2 rounded-md text-[14px]"
                    style={{ background: "var(--pw-surface)", border: "1.5px solid var(--pw-border)" }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[12px] text-[var(--pw-ink-2)]">Tutor</span>
                  <input
                    type="text"
                    value={tutor}
                    onChange={(e) => setTutor(e.target.value)}
                    placeholder="Amélie L."
                    className="px-3 py-2 rounded-md text-[14px]"
                    style={{ background: "var(--pw-surface)", border: "1.5px solid var(--pw-border)" }}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[12px] text-[var(--pw-ink-2)]">Duration (min)</span>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="px-3 py-2 rounded-md text-[14px]"
                    style={{ background: "var(--pw-surface)", border: "1.5px solid var(--pw-border)" }}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1 mt-3">
                <span className="text-[12px] text-[var(--pw-ink-2)]">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="What did you cover? What clicked?"
                  className="px-3 py-2 rounded-md text-[14px] resize-none"
                  style={{ background: "var(--pw-surface)", border: "1.5px solid var(--pw-border)" }}
                />
              </label>
              <div className="flex justify-end mt-3">
                <button type="submit" className="pw-btn-primary px-4 py-2 text-[14px] font-medium">
                  + Add session
                </button>
              </div>
            </form>

            {/* Sessions list */}
            <div className="mt-5">
              <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2">
                {progress.sessions.length} SESSION{progress.sessions.length === 1 ? "" : "S"} LOGGED
              </div>
              {progress.sessions.length === 0 ? (
                <div
                  className="text-[13px] text-[var(--pw-ink-2)] p-4 rounded-md text-center"
                  style={{ border: "1.5px dashed var(--pw-border)" }}
                >
                  No sessions yet. Log your first session above to start tracking progress.
                </div>
              ) : (
                <ul className="space-y-2">
                  {progress.sessions.map((s) => (
                    <li key={s.id} className="pw-card p-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono-pw text-[11px] text-[var(--pw-ink-2)]">
                            {new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="text-[var(--pw-border)]">·</span>
                          <span className="text-[13px] font-medium">👤 {s.tutor}</span>
                          <span className="text-[var(--pw-border)]">·</span>
                          <span className="text-[12px] text-[var(--pw-ink-2)]">⏱ {s.duration} min</span>
                        </div>
                        {s.notes && (
                          <p className="text-[13px] text-[var(--pw-ink)] mt-1">{s.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeSession(subject, stageNumber, s.id)}
                        className="text-[var(--pw-ink-2)] hover:text-[var(--pw-danger)] text-[12px]"
                        aria-label="Remove session"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
