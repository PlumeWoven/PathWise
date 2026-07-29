import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../pathwise/auth";
import { RoleGate } from "../pathwise/RoleGate";
import type { Subject } from "../pathwise/data";
import {
  BAND_META,
  clampBand,
  parseLevelId,
  requiredBandForStage,
  subjectFromSlug,
  type LevelBand,
} from "../pathwise/levels";
import {
  fetchStageCourseMatches,
  groupByKind,
  MATCH_KIND_META,
  type CourseMatch,
  type MatchKind,
} from "../pathwise/course-matching";
import {
  completeEnrollment,
  dropEnrollment,
  enrollInStageCourse,
  getStageEnrollment,
  type StageEnrollment,
} from "../pathwise/api";

const searchSchema = z.object({
  roadmapId: fallback(z.string().optional(), undefined),
  stage: fallback(z.coerce.number().int().min(1).optional(), undefined),
});

export const Route = createFileRoute("/_app/course-match")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Find Your Stage Course — PathWise" },
      {
        name: "description",
        content:
          "Courses matched to both your level and the tutors you were paired with, for the stage you're on.",
      },
      { property: "og:title", content: "Find Your Stage Course — PathWise" },
      { property: "og:url", content: "/course-match" },
    ],
    links: [{ rel: "canonical", href: "/course-match" }],
  }),
  component: CourseMatchPage,
});

interface StageRow {
  id: string;
  roadmap_id: string;
  stage_number: number;
  title: string;
  skills: string[] | null;
  status: string;
  required_level_id: string | null;
  required_level_band: number | null;
}

interface RoadmapRow {
  id: string;
  subject: string | null;
  level_band: number | null;
  level_id: string | null;
  total_stages: number;
}

function CourseMatchPage() {
  return (
    <RoleGate allow={["student", "both"]}>
      <CourseMatchPageInner />
    </RoleGate>
  );
}

function CourseMatchPageInner() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<RoadmapRow | null>(null);
  const [stage, setStage] = useState<StageRow | null>(null);
  const [matches, setMatches] = useState<CourseMatch[]>([]);
  const [meta, setMeta] = useState({
    matchedTutorCount: 0,
    missingLearningProfile: false,
    subjectCourseCount: 0,
  });
  const [enrollment, setEnrollment] = useState<StageEnrollment | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const roadmapId = search.roadmapId ?? null;
  const stageNumber = search.stage ?? null;

  const load = useCallback(async () => {
    if (!roadmapId || !stageNumber) {
      navigate({ to: "/roadmap", search: {} });
      return;
    }
    setLoading(true);
    try {
      const [{ data: rm, error: rErr }, { data: st, error: sErr }] = await Promise.all([
        supabase
          .from("roadmaps")
          .select("id, subject, level_band, level_id, total_stages")
          .eq("id", roadmapId)
          .maybeSingle(),
        supabase
          .from("roadmap_stages")
          .select(
            "id, roadmap_id, stage_number, title, skills, status, required_level_id, required_level_band",
          )
          .eq("roadmap_id", roadmapId)
          .eq("stage_number", stageNumber)
          .maybeSingle(),
      ]);

      if (rErr) throw rErr;
      if (sErr) throw sErr;
      if (!rm || !st) {
        toast.error("Couldn't find that roadmap stage.");
        navigate({ to: "/roadmap", search: {} });
        return;
      }

      setRoadmap(rm as RoadmapRow);
      setStage(st as StageRow);

      const subject = resolveSubject(rm as RoadmapRow, st as StageRow);
      const band = resolveRequiredBand(rm as RoadmapRow, st as StageRow);

      if (!subject) {
        toast.error("This roadmap has no matchable subject yet.");
        setMatches([]);
        return;
      }

      const [result, existing] = await Promise.all([
        fetchStageCourseMatches({
          userId: user?.id ?? null,
          subject,
          requiredBand: band,
          stageTitle: (st as StageRow).title,
        }),
        getStageEnrollment((st as StageRow).id),
      ]);

      setMatches(result.matches);
      setMeta({
        matchedTutorCount: result.matchedTutorCount,
        missingLearningProfile: result.missingLearningProfile,
        subjectCourseCount: result.subjectCourseCount,
      });
      setEnrollment(existing);
    } catch (err: unknown) {
      console.error("[course-match] load", err);
      toast.error(errorMessage(err, "Couldn't load courses for this stage."));
    } finally {
      setLoading(false);
    }
  }, [roadmapId, stageNumber, user?.id, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const subject = roadmap && stage ? resolveSubject(roadmap, stage) : null;
  const requiredBand = roadmap && stage ? resolveRequiredBand(roadmap, stage) : null;
  const grouped = useMemo(() => groupByKind(matches), [matches]);

  async function handleEnroll(match: CourseMatch) {
    if (!user || !stage || !roadmap) return;
    setBusy(match.course.id);
    try {
      await enrollInStageCourse({
        student_id: user.id,
        course_id: match.course.id,
        roadmap_id: roadmap.id,
        roadmap_stage_id: stage.id,
        required_level_id: stage.required_level_id,
        match_kind: match.kind,
      });
      const fresh = await getStageEnrollment(stage.id);
      setEnrollment(fresh);
      toast.success(`"${match.course.title}" is now your course for this stage.`);
    } catch (err: unknown) {
      console.error("[course-match] enroll", err);
      toast.error(errorMessage(err, "Couldn't enroll in that course."));
    } finally {
      setBusy(null);
    }
  }

  async function handleComplete() {
    if (!enrollment || !stage) return;
    setBusy(enrollment.id);
    try {
      await completeEnrollment(enrollment.id);
      const fresh = await getStageEnrollment(stage.id);
      setEnrollment(fresh);
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.5 },
        colors: ["#E85D26", "#F4C430", "#2D6A4F"],
      });
      toast.success("Course complete — this stage is unlocked.");
    } catch (err: unknown) {
      console.error("[course-match] complete", err);
      toast.error(errorMessage(err, "Couldn't mark that course complete."));
    } finally {
      setBusy(null);
    }
  }

  async function handleSwitch() {
    if (!enrollment) return;
    setBusy(enrollment.id);
    try {
      await dropEnrollment(enrollment.id);
      setEnrollment(null);
      toast.success("Course released — pick another below.");
    } catch (err: unknown) {
      console.error("[course-match] switch", err);
      toast.error(errorMessage(err, "Couldn't release that course."));
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
        <main className="px-5 sm:px-8 pt-20 pb-24 max-w-5xl mx-auto">
          <div className="text-center text-[var(--pw-ink-2)] text-[14px]">
            Matching courses to your level and your tutors…
          </div>
          <div className="mt-8 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pw-card h-40 animate-pulse bg-[var(--pw-surface-2)]" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!roadmap || !stage || !requiredBand) return null;

  const bandMeta = BAND_META[requiredBand];
  const isComplete = enrollment?.status === "completed";

  return (
    <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <main className="px-5 sm:px-8 pb-24 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="mt-3 text-[12px] text-[var(--pw-ink-2)]">
          <Link
            to="/roadmap"
            search={{ roadmapId: roadmap.id }}
            className="underline-offset-2 hover:underline"
          >
            Your roadmap
          </Link>
          <span className="mx-2">→</span>
          Stage {String(stage.stage_number).padStart(2, "0")} course
        </div>

        {/* Header: the two conditions being intersected */}
        <div className="mt-4">
          <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
            Stage {String(stage.stage_number).padStart(2, "0")} of {roadmap.total_stages}
          </div>
          <h1 className="font-display text-[30px] sm:text-[36px] leading-tight mt-1">
            {stage.title} needs a {bandMeta.label} course
          </h1>
          <p className="mt-2.5 text-[14px] text-[var(--pw-ink-2)] max-w-2xl">
            You can't tick this stage off until you've taken a course that fits it. We only show
            courses that clear two bars at once: pitched at the level your quiz placed you in, and
            taught by a tutor you were matched with.
          </p>
        </div>

        {/* Convergence explainer */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
          <ConvergenceCard
            kicker="Your level"
            title={`${bandMeta.emoji} ${bandMeta.label}`}
            body={
              stage.required_level_id
                ? `Level id ${stage.required_level_id} — ${bandMeta.blurb}.`
                : `${bandMeta.blurb}.`
            }
          />
          <div className="hidden sm:flex items-center justify-center">
            <span
              className="font-display text-[28px] px-2"
              style={{ color: "var(--pw-accent)" }}
              aria-hidden
            >
              ∩
            </span>
          </div>
          <ConvergenceCard
            kicker="Your tutors"
            title={`${meta.matchedTutorCount} matched`}
            body={
              meta.missingLearningProfile
                ? "Based on subject alone — take the tutor quiz to sharpen this."
                : "From the learning profile you built in the tutor quiz."
            }
            action={
              meta.missingLearningProfile ? (
                <Link
                  to="/find-tutor"
                  className="text-[12px] underline underline-offset-2"
                  style={{ color: "var(--pw-accent)" }}
                >
                  Take the tutor quiz →
                </Link>
              ) : (
                <Link
                  to="/matches"
                  search={{}}
                  className="text-[12px] underline underline-offset-2"
                  style={{ color: "var(--pw-accent)" }}
                >
                  See your matched tutors →
                </Link>
              )
            }
          />
        </div>

        {/* Active enrollment */}
        <AnimatePresence>
          {enrollment && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-6 pw-card p-5"
              style={{
                borderColor: isComplete ? "var(--pw-accent-2)" : "var(--pw-accent)",
                borderWidth: 2,
                background: isComplete ? "rgba(45,106,79,0.05)" : "var(--pw-accent-soft)",
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
                    {isComplete ? "Requirement met" : "Your course for this stage"}
                  </div>
                  <h2 className="font-display text-[22px] leading-tight mt-1">
                    {enrollment.course?.title ?? "Course"}
                  </h2>
                  <p className="text-[13px] text-[var(--pw-ink-2)] mt-1">
                    {isComplete
                      ? "You've finished this course — head back and mark the stage complete."
                      : "Work through it, then confirm below to unlock the stage."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {enrollment.course?.slug && (
                    <Link
                      to="/courses/$slug"
                      params={{ slug: enrollment.course.slug }}
                      className="pw-btn-outline px-4 py-2 text-[13px]"
                    >
                      Open course
                    </Link>
                  )}
                  {!isComplete && (
                    <button
                      onClick={handleComplete}
                      disabled={busy === enrollment.id}
                      className="pw-btn-primary px-4 py-2 text-[13px] disabled:opacity-60"
                    >
                      {busy === enrollment.id ? "Saving…" : "✓ I've completed this course"}
                    </button>
                  )}
                  {isComplete && (
                    <button
                      onClick={() =>
                        navigate({ to: "/roadmap", search: { roadmapId: roadmap.id } })
                      }
                      className="pw-btn-primary px-4 py-2 text-[13px]"
                    >
                      Back to roadmap →
                    </button>
                  )}
                  <button
                    onClick={handleSwitch}
                    disabled={busy === enrollment.id}
                    className="pw-btn-outline px-4 py-2 text-[13px] disabled:opacity-60"
                  >
                    Choose a different course
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {!enrollment && (
          <div className="mt-8">
            {matches.length === 0 ? (
              <EmptyState
                subject={subject}
                bandLabel={bandMeta.label}
                subjectCourseCount={meta.subjectCourseCount}
                matchedTutorCount={meta.matchedTutorCount}
              />
            ) : (
              (["exact_matched", "near_matched", "exact_other"] as MatchKind[]).map((kind) => {
                const group = grouped[kind];
                if (group.length === 0) return null;
                const km = MATCH_KIND_META[kind];
                return (
                  <section key={kind} className="mb-9">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h2 className="font-display text-[22px] leading-tight">{km.label}</h2>
                      <span className="font-mono-pw text-[11px] text-[var(--pw-ink-2)]">
                        {group.length} course{group.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--pw-ink-2)] mt-1">{km.blurb}</p>
                    <div className="mt-4 space-y-4">
                      {group.map((m) => (
                        <CourseMatchCard
                          key={m.course.id}
                          match={m}
                          busy={busy === m.course.id}
                          onEnroll={() => handleEnroll(m)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function errorMessage(err: unknown, fallbackText: string): string {
  return err instanceof Error && err.message ? err.message : fallbackText;
}

// ─────────────────────────────────────────────
// Pieces
// ─────────────────────────────────────────────

function ConvergenceCard({
  kicker,
  title,
  body,
  action,
}: {
  kicker: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="pw-card p-4">
      <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
        {kicker}
      </div>
      <div className="font-display text-[20px] leading-tight mt-1">{title}</div>
      <p className="text-[13px] text-[var(--pw-ink-2)] mt-1.5">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

function CourseMatchCard({
  match,
  busy,
  onEnroll,
}: {
  match: CourseMatch;
  busy: boolean;
  onEnroll: () => void;
}) {
  const { course, tutor, band, kind, tutorScore } = match;
  const tone = MATCH_KIND_META[kind].tone;
  const borderColor =
    tone === "strong"
      ? "var(--pw-accent)"
      : tone === "medium"
        ? "var(--pw-accent-3)"
        : "var(--pw-border)";

  const price =
    course.discount_price != null
      ? `${course.discount_price} ${course.currency ?? ""}`.trim()
      : course.price
        ? `${course.price} ${course.currency ?? ""}`.trim()
        : "Free";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pw-card p-5"
      style={{ borderColor, borderWidth: tone === "soft" ? 1 : 2 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="pw-pill text-[11px] px-2.5 py-1 font-medium"
              style={{
                background: tone === "strong" ? "var(--pw-accent)" : "var(--pw-surface-2)",
                color: tone === "strong" ? "#fff" : "var(--pw-ink-2)",
              }}
            >
              {MATCH_KIND_META[kind].label}
            </span>
            <span className="pw-pill text-[11px] px-2.5 py-1 pw-border">
              {band === null ? "All levels" : `${BAND_META[band].emoji} ${BAND_META[band].label}`}
            </span>
            {tutorScore != null && (
              <span className="font-mono-pw text-[11px] text-[var(--pw-ink-2)]">
                {Math.round(tutorScore * 100)}% tutor match
              </span>
            )}
          </div>

          <h3 className="font-display text-[21px] leading-tight mt-2.5">{course.title}</h3>
          {course.subtitle && (
            <p className="text-[13px] text-[var(--pw-ink-2)] mt-1">{course.subtitle}</p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--pw-ink-2)]">
            {tutor?.display_name && <span>👤 {tutor.display_name}</span>}
            {course.estimated_weeks && (
              <>
                <span className="text-[var(--pw-border)]">·</span>
                <span>📅 {course.estimated_weeks} weeks</span>
              </>
            )}
            <span className="text-[var(--pw-border)]">·</span>
            <span>💶 {price}</span>
          </div>

          {/* Why this course, for this student, at this stage */}
          <div
            className="mt-3 text-[13px] px-3 py-2 rounded-md"
            style={{ background: "var(--pw-surface-2)" }}
          >
            <span className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
              Why you're seeing this
            </span>
            <p className="mt-1">{match.reason}</p>
          </div>

          {course.learning_outcomes && course.learning_outcomes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {course.learning_outcomes.slice(0, 4).map((o) => (
                <span
                  key={o}
                  className="pw-pill text-[11px] px-2.5 py-1"
                  style={{ background: "var(--pw-surface-2)" }}
                >
                  {o}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={onEnroll}
            disabled={busy}
            className="pw-btn-primary px-5 py-2.5 text-[13px] font-medium disabled:opacity-60 whitespace-nowrap"
          >
            {busy ? "Enrolling…" : "Choose this course"}
          </button>
          {course.slug && (
            <Link
              to="/courses/$slug"
              params={{ slug: course.slug }}
              className="pw-btn-outline px-5 py-2.5 text-[13px] text-center whitespace-nowrap"
            >
              Preview
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({
  subject,
  bandLabel,
  subjectCourseCount,
  matchedTutorCount,
}: {
  subject: Subject | null;
  bandLabel: string;
  subjectCourseCount: number;
  matchedTutorCount: number;
}) {
  return (
    <div className="pw-card p-8 text-center">
      <div className="text-5xl">🎯</div>
      <h2 className="font-display text-[24px] mt-3">No course clears both bars yet</h2>
      <p className="text-[14px] text-[var(--pw-ink-2)] mt-2 max-w-lg mx-auto">
        {subjectCourseCount === 0
          ? `No published ${subject ?? "course"} courses exist yet.`
          : `There are ${subjectCourseCount} ${subject ?? ""} course${subjectCourseCount === 1 ? "" : "s"} published, but none sits at ${bandLabel} from your ${matchedTutorCount} matched tutor${matchedTutorCount === 1 ? "" : "s"}.`}{" "}
        Widening your tutor match is usually the fastest fix.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link to="/find-tutor" className="pw-btn-primary px-5 py-2.5 text-[13px]">
          Retake the tutor quiz
        </Link>
        <Link to="/matches" search={{}} className="pw-btn-outline px-5 py-2.5 text-[13px]">
          Browse all matched tutors
        </Link>
      </div>
      <p className="mt-5 text-[12px] text-[var(--pw-ink-2)]">
        You can also book a session with a matched tutor and ask them to publish a course at your
        level.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Resolution helpers
//
// Roadmaps built before level ids existed carry neither a band nor a stage
// requirement, so both are reconstructed from whatever the row does have.
// ─────────────────────────────────────────────

function resolveSubject(roadmap: RoadmapRow, stage: StageRow): Subject | null {
  const fromStage = parseLevelId(stage.required_level_id);
  if (fromStage) return fromStage.subject;
  const fromRoadmapLevel = parseLevelId(roadmap.level_id);
  if (fromRoadmapLevel) return fromRoadmapLevel.subject;
  if (!roadmap.subject) return null;
  // roadmaps.subject holds the display name ("Mathematics"), not the slug.
  return subjectFromSlug(roadmap.subject.toLowerCase()) ?? (roadmap.subject as Subject);
}

function resolveRequiredBand(roadmap: RoadmapRow, stage: StageRow): LevelBand {
  if (stage.required_level_band != null) return clampBand(stage.required_level_band);
  const parsed = parseLevelId(stage.required_level_id);
  if (parsed) return parsed.band;
  const base = roadmap.level_band != null ? clampBand(roadmap.level_band) : 3;
  return requiredBandForStage(base, stage.stage_number);
}
