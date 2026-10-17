import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Subject } from "./data";
import { addSession, getStageProgress, removeSession, useProgress } from "./progress";
import { Icon } from "@/components/Icon";

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="pw-card block w-[calc(100%-2rem)] max-w-2xl max-h-[88vh] overflow-y-auto p-0 border-[var(--pw-border)] shadow-pw-float"
      >
          <div className="p-6">
            <div className="pr-12">
              <div className="label-caps text-[var(--pw-ink-2)]">
                STAGE {String(stageNumber).padStart(2, "0")} · SESSION LOG
              </div>
              <DialogTitle className="font-display font-bold uppercase tracking-[-0.025em] text-[1.625rem] leading-none mt-2">
                {stageTitle}
              </DialogTitle>
            </div>

            {/* Add session form */}
            <form onSubmit={submit} className="mt-6 border-t border-[var(--pw-border)] pt-6">
              <div className="label-caps text-[var(--pw-ink-2)] mb-4">LOG A SESSION</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="label-caps text-[var(--pw-ink-2)]">Date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pw-input text-[0.875rem]"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="label-caps text-[var(--pw-ink-2)]">Tutor</span>
                  <input
                    type="text"
                    value={tutor}
                    onChange={(e) => setTutor(e.target.value)}
                    placeholder="Amélie L."
                    className="pw-input text-[0.875rem]"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="label-caps text-[var(--pw-ink-2)]">Duration (min)</span>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="pw-input text-[0.875rem]"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2 mt-4">
                <span className="label-caps text-[var(--pw-ink-2)]">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="What did you cover? What was hard?"
                  className="pw-input text-[0.875rem] resize-none"
                />
              </label>
              <div className="flex justify-end mt-4">
                <button type="submit" className="pw-btn-primary px-4 py-2">
                  + Add session
                </button>
              </div>
            </form>

            {/* Sessions list */}
            <div className="mt-6">
              <div className="label-caps text-[var(--pw-ink-2)] mb-2">
                {progress.sessions.length} SESSION{progress.sessions.length === 1 ? "" : "S"} LOGGED
              </div>
              {progress.sessions.length === 0 ? (
                <div
                  className="text-[0.8125rem] text-[var(--pw-ink-2)] p-4 text-center"
                  style={{ border: "1px dashed var(--pw-border)" }}
                >
                  No sessions yet. Log your first session above to start tracking progress.
                </div>
              ) : (
                <ul className="divide-y divide-[var(--pw-border)] border-y border-[var(--pw-border)]">
                  {progress.sessions.map((s) => (
                    <li key={s.id} className="py-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="label-caps text-[var(--pw-ink-2)]">
                            {new Date(s.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[var(--pw-border)]">·</span>
                          <span className="text-[0.8125rem] font-medium inline-flex items-center gap-2">
                            <Icon name="user" className="h-4 w-4" />
                            {s.tutor}
                          </span>
                          <span className="text-[var(--pw-border)]">·</span>
                          <span className="text-[0.75rem] text-[var(--pw-ink-2)] inline-flex items-center gap-2">
                            <Icon name="stopwatch" className="h-4 w-4" />
                            {s.duration} min
                          </span>
                        </div>
                        {s.notes && (
                          <p className="text-[0.8125rem] text-[var(--pw-ink)] mt-2">{s.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeSession(subject, stageNumber, s.id)}
                        className="text-[0.8125rem] font-semibold text-[var(--pw-ink-2)] hover:text-[var(--pw-danger)] transition-colors"
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
      </DialogContent>
    </Dialog>
  );
}
