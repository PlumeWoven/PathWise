/**
 * src/pathwise/course-matching.ts
 *
 * The double convergence: courses shown for a roadmap stage must satisfy the
 * *level* the stage requires AND come from the tutors the student was matched
 * with. Those two filters are computed independently and then intersected.
 *
 * Results come back in three labelled tiers so the page never dead-ends:
 *   exact_matched — right level, matched tutor        ("Perfect match")
 *   near_matched  — one band off, matched tutor       ("Just above/below your level")
 *   exact_other   — right level, tutor outside matches ("Outside your matches")
 */

import { supabase } from "@/integrations/supabase/client";
import type { Subject } from "./data";
import {
  BAND_META,
  canonicalSubjectFromTutorQuiz,
  courseBand,
  courseMatchesSubject,
  type LevelBand,
} from "./levels";
import { computeMatch, type MatchPrefs, type TutorRow } from "./matching";

export type MatchKind = "exact_matched" | "near_matched" | "exact_other";

export const MATCH_KIND_META: Record<
  MatchKind,
  { label: string; tone: "strong" | "medium" | "soft"; blurb: string }
> = {
  exact_matched: {
    label: "Perfect match",
    tone: "strong",
    blurb: "Right at your level, taught by one of your matched tutors",
  },
  near_matched: {
    label: "Close to your level",
    tone: "medium",
    blurb: "One band away, but from a tutor you were matched with",
  },
  exact_other: {
    label: "Outside your matches",
    tone: "soft",
    blurb: "Right at your level, from a tutor you haven't been matched with",
  },
};

/** Tutors scoring at or above this are treated as "matched" for convergence. */
const MATCH_THRESHOLD = 0.55;
/** Cap on how many tutors count as matched. */
const MATCHED_TUTOR_LIMIT = 15;

export interface CourseCandidate {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string | null;
  description: string | null;
  category: string | null;
  subject: string | null;
  subcategory_tags: string[] | null;
  difficulty: string | null;
  level_band: number | null;
  level_id: string | null;
  estimated_weeks: number | null;
  price: number | null;
  currency: string | null;
  discount_price: number | null;
  thumbnail_url: string | null;
  learning_outcomes: string[] | null;
  tutor_id: string;
}

export interface CourseMatch {
  course: CourseCandidate;
  tutor: TutorRow | null;
  kind: MatchKind;
  /** Effective band of the course; null means it serves every band. */
  band: LevelBand | null;
  /** Signed distance from the required band (0 when exact or wildcard). */
  bandDelta: number;
  /** Tutor match score 0..1, when the tutor is in the matched set. */
  tutorScore: number | null;
  /** Learner-facing sentence explaining why this course is being shown. */
  reason: string;
}

export interface StageCourseResult {
  matches: CourseMatch[];
  /** How many tutors the convergence had to work with. */
  matchedTutorCount: number;
  /** True when the student has never taken the tutor quiz. */
  missingLearningProfile: boolean;
  /** Total published courses in this subject, before level filtering. */
  subjectCourseCount: number;
}

// ─────────────────────────────────────────────
// Matched tutors
// ─────────────────────────────────────────────

export interface MatchedTutors {
  tutors: TutorRow[];
  scores: Map<string, number>;
  prefs: MatchPrefs;
  missingProfile: boolean;
}

/**
 * Re-derives the student's matched tutors using the same scoring the /matches
 * page shows, so the courses surfaced here line up with the tutors the student
 * has already seen. Falls back to subject-only scoring when no learning
 * profile exists yet.
 */
export async function getMatchedTutors(
  userId: string | null,
  fallbackSubject: Subject | null,
): Promise<MatchedTutors> {
  let prefs: MatchPrefs = {};
  let missingProfile = true;

  if (userId) {
    const { data } = await supabase
      .from("user_learning_profiles")
      .select("subject, learning_style, experience_level, budget_max")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      missingProfile = false;
      // The tutor quiz stores its own subject slugs; fold onto the
      // canonical subject so scoring lines up with the roadmap.
      const canonical = canonicalSubjectFromTutorQuiz(data.subject);
      prefs = {
        subject: canonical ?? fallbackSubject ?? undefined,
        learning_style: data.learning_style ?? undefined,
        experience_level: data.experience_level ?? undefined,
        budget_max: data.budget_max ? Number(data.budget_max) : undefined,
      };
    }
  }

  if (!prefs.subject && fallbackSubject) prefs.subject = fallbackSubject;

  const [tutorsRes, reviewsRes, availRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, display_name, avatar_url, headline, bio, hourly_rate, " +
          "subject_specialties, specializations, superpowers, video_intro_url, " +
          "verification_status, free_discovery_call, first_session_free",
      )
      .eq("role", "tutor")
      .limit(200),
    supabase.from("reviews").select("tutor_id, rating"),
    supabase.from("tutor_availability").select("user_id"),
  ]);

  const rows = (tutorsRes.data ?? []) as unknown as TutorRow[];

  const ratings = new Map<string, { sum: number; n: number }>();
  ((reviewsRes.data ?? []) as { tutor_id: string | null; rating: number | null }[]).forEach((r) => {
    if (!r.tutor_id || r.rating == null) return;
    const cur = ratings.get(r.tutor_id) ?? { sum: 0, n: 0 };
    cur.sum += Number(r.rating);
    cur.n += 1;
    ratings.set(r.tutor_id, cur);
  });

  const hasAvailability = new Set<string>();
  ((availRes.data ?? []) as { user_id: string | null }[]).forEach((a) => {
    if (a.user_id) hasAvailability.add(a.user_id);
  });

  const scored = rows
    .map((t) => {
      const agg = ratings.get(t.id);
      const rating = agg ? { avg: agg.sum / agg.n, count: agg.n } : { avg: 0, count: 0 };
      return { tutor: t, total: computeMatch(t, prefs, rating, hasAvailability.has(t.id)).total };
    })
    .sort((a, b) => b.total - a.total);

  const matched = scored.filter((s) => s.total >= MATCH_THRESHOLD).slice(0, MATCHED_TUTOR_LIMIT);

  return {
    tutors: matched.map((m) => m.tutor),
    scores: new Map(matched.map((m) => [m.tutor.id, m.total])),
    prefs,
    missingProfile,
  };
}

// ─────────────────────────────────────────────
// The convergence
// ─────────────────────────────────────────────

const COURSE_SELECT =
  "id, title, subtitle, slug, description, category, subject, subcategory_tags, " +
  "difficulty, level_band, level_id, estimated_weeks, price, currency, discount_price, " +
  "thumbnail_url, learning_outcomes, tutor_id";

function buildReason(
  kind: MatchKind,
  band: LevelBand | null,
  requiredBand: LevelBand,
  stageTitle: string | null,
  tutorName: string | null,
): string {
  const required = BAND_META[requiredBand];
  if (band === null) {
    return `Open to every level, so it fits your ${required.label} standing${stageTitle ? ` for ${stageTitle}` : ""}.`;
  }
  if (kind === "exact_matched") {
    return `Pitched at ${required.label} — exactly where you placed${tutorName ? `, and ${tutorName} is one of your matched tutors` : ""}.`;
  }
  if (kind === "near_matched") {
    const direction = band > requiredBand ? "a step above" : "a step below";
    return `${direction} your ${required.label} standing, from your matched tutor${tutorName ? ` ${tutorName}` : ""} — useful if you want to ${band > requiredBand ? "stretch" : "consolidate"}.`;
  }
  return `Pitched at ${required.label} and matches this stage, though ${tutorName ?? "this tutor"} isn't in your matched set.`;
}

/**
 * Courses that can satisfy one roadmap stage, grouped into convergence tiers.
 */
export async function fetchStageCourseMatches(params: {
  userId: string | null;
  subject: Subject;
  requiredBand: LevelBand;
  stageTitle?: string | null;
}): Promise<StageCourseResult> {
  const { userId, subject, requiredBand, stageTitle = null } = params;

  const [matched, coursesRes] = await Promise.all([
    getMatchedTutors(userId, subject),
    supabase.from("courses").select(COURSE_SELECT).eq("status", "published").limit(500),
  ]);

  if (coursesRes.error) throw coursesRes.error;

  const allCourses = (coursesRes.data ?? []) as unknown as CourseCandidate[];
  const subjectCourses = allCourses.filter((c) => courseMatchesSubject(c, subject));

  const tutorById = new Map(matched.tutors.map((t) => [t.id, t]));

  // Tutors whose courses appear in the "outside your matches" tier still
  // need a name and rate on the card, so fetch those separately.
  const unmatchedTutorIds = Array.from(
    new Set(subjectCourses.filter((c) => !tutorById.has(c.tutor_id)).map((c) => c.tutor_id)),
  );

  const extraTutors = new Map<string, TutorRow>();
  if (unmatchedTutorIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, display_name, avatar_url, headline, bio, hourly_rate, " +
          "subject_specialties, specializations, superpowers, video_intro_url, " +
          "verification_status, free_discovery_call, first_session_free",
      )
      .in("id", unmatchedTutorIds);
    ((data ?? []) as unknown as TutorRow[]).forEach((t) => extraTutors.set(t.id, t));
  }

  const matches: CourseMatch[] = [];

  for (const course of subjectCourses) {
    const band = courseBand(course);
    const isMatchedTutor = tutorById.has(course.tutor_id);
    // A wildcard course (no band / "All Levels") counts as an exact fit.
    const delta = band === null ? 0 : band - requiredBand;
    const distance = Math.abs(delta);

    let kind: MatchKind | null = null;
    if (isMatchedTutor && distance === 0) kind = "exact_matched";
    else if (isMatchedTutor && distance === 1) kind = "near_matched";
    else if (!isMatchedTutor && distance === 0) kind = "exact_other";
    if (!kind) continue; // two bands away, or unmatched *and* off-level

    const tutor = tutorById.get(course.tutor_id) ?? extraTutors.get(course.tutor_id) ?? null;

    matches.push({
      course,
      tutor,
      kind,
      band,
      bandDelta: delta,
      tutorScore: matched.scores.get(course.tutor_id) ?? null,
      reason: buildReason(kind, band, requiredBand, stageTitle, tutor?.display_name ?? null),
    });
  }

  const kindRank: Record<MatchKind, number> = {
    exact_matched: 0,
    near_matched: 1,
    exact_other: 2,
  };

  matches.sort((a, b) => {
    if (kindRank[a.kind] !== kindRank[b.kind]) return kindRank[a.kind] - kindRank[b.kind];
    if ((b.tutorScore ?? 0) !== (a.tutorScore ?? 0))
      return (b.tutorScore ?? 0) - (a.tutorScore ?? 0);
    return Math.abs(a.bandDelta) - Math.abs(b.bandDelta);
  });

  return {
    matches,
    matchedTutorCount: matched.tutors.length,
    missingLearningProfile: matched.missingProfile,
    subjectCourseCount: subjectCourses.length,
  };
}

export function groupByKind(matches: CourseMatch[]): Record<MatchKind, CourseMatch[]> {
  return {
    exact_matched: matches.filter((m) => m.kind === "exact_matched"),
    near_matched: matches.filter((m) => m.kind === "near_matched"),
    exact_other: matches.filter((m) => m.kind === "exact_other"),
  };
}
