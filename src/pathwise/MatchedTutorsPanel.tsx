/**
 * src/pathwise/MatchedTutorsPanel.tsx
 *
 * The "Your matched tutors" panel that sits directly under the roadmap profile
 * card. It is the visible payoff of the double convergence: it only lists
 * tutors that satisfy the roadmap quiz (subject + level band) AND every
 * question the student answered in the find-tutor quiz.
 *
 * Before the find-tutor quiz is taken there is nothing to intersect, so the
 * panel shows a prompt to take it rather than a misleading list.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Subject } from "./data";
import { BAND_META, type LevelBand } from "./levels";
import {
  blockingCriteria,
  matchMockTutors,
  type MockCourse,
  type MockTutorMatch,
  type TutorQuizAnswers,
} from "./mock-tutors";

/** The key routes/_app.find-tutor.tsx writes its answers under. */
const QUIZ_STORAGE_KEY = "pw_find_tutor_answers";

interface Props {
  subject: Subject;
  /** Band the diagnostic placed the student in. */
  band: LevelBand;
  /** Band the stage they're currently on demands. */
  requiredBand: LevelBand;
  /** Title of the active stage, for the explanatory copy. */
  activeStageTitle: string | null;
  userId: string | null;
}

export function MatchedTutorsPanel({
  subject,
  band,
  requiredBand,
  activeStageTitle,
  userId,
}: Props) {
  const [answers, setAnswers] = useState<TutorQuizAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Quiz results come from localStorage first (instant, works anonymously),
  // falling back to the saved learning profile for a signed-in student who took
  // the quiz on another device.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      let local: TutorQuizAnswers | null = null;
      try {
        const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as TutorQuizAnswers;
          // An empty object is a quiz that was opened but never answered.
          if (parsed && Object.keys(parsed).length > 0) local = parsed;
        }
      } catch {
        /* malformed storage — fall through to the profile */
      }

      if (local) {
        if (!cancelled) {
          setAnswers(local);
          setLoading(false);
        }
        return;
      }

      if (!userId) {
        if (!cancelled) {
          setAnswers(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("user_learning_profiles")
        .select(
          "subject, multi_subject, goal, learning_style, pace, time_of_day, experience_level, frequency, budget_max",
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;
      setAnswers(
        data
          ? ({
              subject: data.subject ?? undefined,
              multi_subject: data.multi_subject ?? undefined,
              goal: (data.goal ?? undefined) as TutorQuizAnswers["goal"],
              learning_style: (data.learning_style ??
                undefined) as TutorQuizAnswers["learning_style"],
              pace: data.pace ?? undefined,
              time_of_day: (data.time_of_day ?? undefined) as TutorQuizAnswers["time_of_day"],
              experience_level: (data.experience_level ??
                undefined) as TutorQuizAnswers["experience_level"],
              frequency: (data.frequency ?? undefined) as TutorQuizAnswers["frequency"],
              budget_max: data.budget_max != null ? Number(data.budget_max) : undefined,
            } satisfies TutorQuizAnswers)
          : null,
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const ctx = useMemo(() => ({ subject, band, requiredBand }), [subject, band, requiredBand]);

  const matches = useMemo(
    () => (answers ? matchMockTutors(answers, ctx) : []),
    [answers, ctx],
  );

  const blockers = useMemo(
    () => (answers && matches.length === 0 ? blockingCriteria(answers, ctx) : []),
    [answers, matches.length, ctx],
  );

  const requiredMeta = BAND_META[requiredBand];

  return (
    <section
      aria-labelledby="matched-tutors-heading"
      className="pw-card p-6 mt-6"
    >
      <header>
        <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
          Your matched tutors
        </div>
        <h2 id="matched-tutors-heading" className="font-display text-[20px] leading-tight mt-1">
          {loading
            ? "Matching…"
            : !answers
              ? "Take the tutor quiz"
              : matches.length > 0
                ? `${matches.length} tutor${matches.length === 1 ? "" : "s"} fit you`
                : "No tutor fits every answer"}
        </h2>
        {!loading && answers && matches.length > 0 && (
          <p className="text-[13px] text-[var(--pw-ink-2)] mt-1.5">
            Teaching {subject} at {requiredMeta.emoji} {requiredMeta.label}
            {activeStageTitle ? ` for ${activeStageTitle}` : ""}, and matching every answer you
            gave.
          </p>
        )}
      </header>

      {/* Loading */}
      {loading && (
        <div className="mt-4 space-y-3" aria-hidden="true">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-20 rounded-lg animate-pulse"
              style={{ background: "var(--pw-surface-2)" }}
            />
          ))}
        </div>
      )}

      {/* No quiz taken yet — nothing to intersect against */}
      {!loading && !answers && (
        <div className="mt-4">
          <p className="text-[13px] text-[var(--pw-ink-2)]">
            We know you're a {BAND_META[band].label} in {subject}. Answer eight quick questions
            about how you like to learn and we'll narrow this to the tutors who actually fit — and
            surface their courses at your level.
          </p>
          <Link
            to="/find-tutor"
            className="pw-btn-primary inline-flex justify-center w-full mt-4 px-5 py-2.5 text-[13px] font-medium"
          >
            Find my tutor →
          </Link>
        </div>
      )}

      {/* Matches */}
      {!loading && answers && matches.length > 0 && (
        <>
          <ul className="mt-4 space-y-3" role="list">
            {matches.map((m) => (
              <TutorRow
                key={m.tutor.id}
                match={m}
                requiredBand={requiredBand}
                expanded={expanded === m.tutor.id}
                onToggle={() =>
                  setExpanded((cur) => (cur === m.tutor.id ? null : m.tutor.id))
                }
              />
            ))}
          </ul>
          <Link
            to="/find-tutor"
            className="mt-4 inline-block text-[12px] underline underline-offset-2"
            style={{ color: "var(--pw-accent)" }}
          >
            Retake the quiz to change these
          </Link>
        </>
      )}

      {/* Answered, but the strict intersection is empty */}
      {!loading && answers && matches.length === 0 && (
        <div className="mt-4">
          <p className="text-[13px] text-[var(--pw-ink-2)]">
            No tutor satisfies all of your answers for {subject} at {requiredMeta.emoji}{" "}
            {requiredMeta.label}.
            {blockers.length > 0 && (
              <>
                {" "}
                The tightest constraint is{" "}
                <strong className="text-[var(--pw-ink)]">{blockers[0].label.toLowerCase()}</strong>
                {blockers[1] ? `, then ${blockers[1].label.toLowerCase()}` : ""}.
              </>
            )}
          </p>
          <Link
            to="/find-tutor"
            className="pw-btn-outline inline-flex justify-center w-full mt-4 px-5 py-2.5 text-[13px]"
          >
            Adjust my answers
          </Link>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// One tutor
// ─────────────────────────────────────────────

function TutorRow({
  match,
  requiredBand,
  expanded,
  onToggle,
}: {
  match: MockTutorMatch;
  requiredBand: LevelBand;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { tutor, courses, bestCourse } = match;
  const panelId = `tutor-courses-${tutor.id}`;

  return (
    <li
      className="rounded-lg pw-border overflow-hidden"
      style={{ background: "var(--pw-surface-2)" }}
    >
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="w-full text-left p-3.5 transition-colors hover:bg-[var(--pw-surface)]"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-medium text-white shrink-0"
            style={{ background: tutor.color }}
          >
            {tutor.initial}
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[14px] font-medium">{tutor.name}</span>
              {tutor.verified && (
                <span
                  className="text-[10px]"
                  style={{ color: "var(--pw-accent-2)" }}
                  title="Verified tutor"
                  aria-label="Verified tutor"
                >
                  ✓
                </span>
              )}
            </span>
            <span className="block text-[12px] text-[var(--pw-ink-2)] mt-0.5 leading-snug">
              {tutor.headline}
            </span>

            <span className="flex items-center gap-2 mt-1.5 text-[11px] text-[var(--pw-ink-2)] flex-wrap">
              <span aria-label={`Rated ${tutor.rating} out of 5 from ${tutor.reviews} reviews`}>
                ★ {tutor.rating} ({tutor.reviews})
              </span>
              <span aria-hidden="true" style={{ color: "var(--pw-border)" }}>
                ·
              </span>
              <span>€{tutor.hourlyRate}/hr</span>
              {tutor.firstSessionFree && (
                <>
                  <span aria-hidden="true" style={{ color: "var(--pw-border)" }}>
                    ·
                  </span>
                  <span style={{ color: "var(--pw-accent-2)" }}>1st free</span>
                </>
              )}
            </span>
          </span>

          <span
            aria-hidden="true"
            className="text-[var(--pw-ink-2)] text-[12px] shrink-0 mt-1 transition-transform"
            style={{ transform: expanded ? "rotate(90deg)" : "none" }}
          >
            ▶
          </span>
        </div>

        {/* The course that satisfies this stage */}
        {bestCourse && (
          <div
            className="mt-2.5 rounded-md px-2.5 py-2"
            style={{
              background: "var(--pw-surface)",
              borderLeft: `3px solid ${
                bestCourse.band === requiredBand ? "var(--pw-accent)" : "var(--pw-accent-3)"
              }`,
            }}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono-pw text-[9px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
                {bestCourse.band === requiredBand ? "Exact level" : "Near level"}
              </span>
              <span className="text-[10px] text-[var(--pw-ink-2)]">
                {BAND_META[bestCourse.band].emoji} {BAND_META[bestCourse.band].label}
              </span>
            </div>
            <div className="text-[12.5px] font-medium mt-0.5 leading-snug">
              {bestCourse.title}
            </div>
            <div className="text-[11px] text-[var(--pw-ink-2)] mt-0.5">
              {bestCourse.weeks} weeks · {bestCourse.price === 0 ? "Free" : `€${bestCourse.price}`}
            </div>
          </div>
        )}
      </button>

      {/* Expanded: why they matched, and their other fitting courses */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-3.5 pb-3.5 pt-1">
              <div className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
                Why they matched
              </div>
              <ul className="mt-1.5 flex flex-wrap gap-1.5" role="list">
                {match.criteria
                  .filter((c) => !c.skipped)
                  .map((c) => (
                    <li
                      key={c.key}
                      className="pw-pill text-[10.5px] px-2 py-0.5"
                      style={{
                        background: "var(--pw-surface)",
                        color: "var(--pw-accent-2)",
                      }}
                    >
                      ✓ {c.label}
                    </li>
                  ))}
              </ul>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {tutor.vibes.map((v) => (
                  <span
                    key={v}
                    className="pw-pill text-[10.5px] px-2 py-0.5"
                    style={{ background: "var(--pw-surface)" }}
                  >
                    {v}
                  </span>
                ))}
              </div>

              {courses.length > 1 && (
                <>
                  <div className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mt-3">
                    Also fits this stage
                  </div>
                  <ul className="mt-1.5 space-y-1.5" role="list">
                    {courses.slice(1).map((c) => (
                      <CourseLine key={c.id} course={c} requiredBand={requiredBand} />
                    ))}
                  </ul>
                </>
              )}

              <div className="mt-3 flex gap-2">
                <Link
                  to="/matches"
                  search={{} as never}
                  className="pw-btn-outline flex-1 text-center px-3 py-1.5 text-[12px]"
                >
                  View profile
                </Link>
                <Link
                  to="/find-tutor"
                  className="pw-btn-primary flex-1 text-center px-3 py-1.5 text-[12px]"
                >
                  Book
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function CourseLine({ course, requiredBand }: { course: MockCourse; requiredBand: LevelBand }) {
  return (
    <li
      className="rounded-md px-2.5 py-1.5"
      style={{
        background: "var(--pw-surface)",
        borderLeft: `3px solid ${
          course.band === requiredBand ? "var(--pw-accent)" : "var(--pw-border)"
        }`,
      }}
    >
      <div className="text-[12px] font-medium leading-snug">{course.title}</div>
      <div className="text-[10.5px] text-[var(--pw-ink-2)] mt-0.5">
        {BAND_META[course.band].label} · {course.weeks} weeks ·{" "}
        {course.price === 0 ? "Free" : `€${course.price}`}
      </div>
    </li>
  );
}
