/**
 * src/pathwise/levels.ts
 *
 * The single vocabulary that lets the roadmap quiz, the tutor quiz and the
 * course catalogue talk about "level" using the same words.
 *
 * A level id looks like `mathematics.L3` — a canonical subject slug plus a
 * band 1..5. The diagnostic assigns a *base* band; each roadmap stage then
 * requires the band matching its position (stage 1 = base, stage 4 = base + 3,
 * capped at L5), so course difficulty climbs alongside the roadmap.
 *
 * Only type imports come from ./data, so there is no runtime import cycle.
 */

import type { Subject, Level } from "./data";

// ─────────────────────────────────────────────
// Bands
// ─────────────────────────────────────────────

export type LevelBand = 1 | 2 | 3 | 4 | 5;

export const MIN_BAND: LevelBand = 1;
export const MAX_BAND: LevelBand = 5;

export const BAND_TO_LEVEL: Record<LevelBand, Level> = {
  1: "Seedling",
  2: "Spark",
  3: "Builder",
  4: "Sharpshooter",
  5: "Mastermind",
};

export const LEVEL_TO_BAND: Record<Level, LevelBand> = {
  Seedling: 1,
  Spark: 2,
  Builder: 3,
  Sharpshooter: 4,
  Mastermind: 5,
};

/** Short, learner-facing description of what a band means for course choice. */
export const BAND_META: Record<LevelBand, { label: Level; emoji: string; blurb: string }> = {
  1: { label: "Seedling", emoji: "🌱", blurb: "Foundations from scratch" },
  2: { label: "Spark", emoji: "⚡", blurb: "Basics in place, building up" },
  3: { label: "Builder", emoji: "🔥", blurb: "Solid core, plugging gaps" },
  4: { label: "Sharpshooter", emoji: "🎯", blurb: "Strong — ready for depth" },
  5: { label: "Mastermind", emoji: "🏆", blurb: "Advanced and specialised" },
};

export function clampBand(n: number): LevelBand {
  const r = Math.round(n);
  if (r <= 1) return 1;
  if (r >= 5) return 5;
  return r as LevelBand;
}

export function isLevelBand(n: unknown): n is LevelBand {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5;
}

// ─────────────────────────────────────────────
// Canonical subjects
// ─────────────────────────────────────────────

/** The roadmap quiz subjects are canonical. Everything else maps onto them. */
export const SUBJECT_SLUGS: Record<Subject, string> = {
  Mathematics: "mathematics",
  Sciences: "sciences",
  Literature: "literature",
  History: "history",
  Programming: "programming",
  Languages: "languages",
};

const SLUG_TO_SUBJECT: Record<string, Subject> = Object.entries(SUBJECT_SLUGS).reduce(
  (acc, [subject, slug]) => {
    acc[slug] = subject as Subject;
    return acc;
  },
  {} as Record<string, Subject>,
);

export function subjectSlug(subject: Subject): string {
  return SUBJECT_SLUGS[subject];
}

export function subjectFromSlug(slug?: string | null): Subject | null {
  if (!slug) return null;
  return SLUG_TO_SUBJECT[slug.toLowerCase().trim()] ?? null;
}

/**
 * The tutor quiz (/find-tutor) uses its own subject slugs. These map onto the
 * canonical roadmap subjects; the three that have no roadmap equivalent
 * (test prep, music, art) resolve to null and simply don't converge.
 */
export const TUTOR_QUIZ_SUBJECT_MAP: Record<string, Subject | null> = {
  math: "Mathematics",
  science: "Sciences",
  languages: "Languages",
  coding: "Programming",
  writing: "Literature",
  test_prep: null,
  music: null,
  art: null,
};

export function canonicalSubjectFromTutorQuiz(slug?: string | null): Subject | null {
  if (!slug) return null;
  return TUTOR_QUIZ_SUBJECT_MAP[slug.toLowerCase().trim()] ?? null;
}

/** Reverse direction — used to pre-fill /matches from a roadmap subject. */
export function tutorQuizSubjectFor(subject: Subject): string | null {
  const hit = Object.entries(TUTOR_QUIZ_SUBJECT_MAP).find(([, s]) => s === subject);
  return hit ? hit[0] : null;
}

/**
 * Course rows carry `category` picked from the `subjects` catalogue
 * ('Algebra', 'Physics', 'Computer Science', …). Fold those into the six
 * canonical subjects so a course can be matched to a roadmap.
 */
const COURSE_CATEGORY_MAP: Record<string, Subject> = {
  // Mathematics
  math: "Mathematics",
  mathematics: "Mathematics",
  algebra: "Mathematics",
  geometry: "Mathematics",
  "pre-calculus": "Mathematics",
  precalculus: "Mathematics",
  calculus: "Mathematics",
  statistics: "Mathematics",
  "ap calculus": "Mathematics",
  // Sciences
  science: "Sciences",
  sciences: "Sciences",
  physics: "Sciences",
  chemistry: "Sciences",
  biology: "Sciences",
  "ap physics": "Sciences",
  // Programming
  programming: "Programming",
  "computer science": "Programming",
  coding: "Programming",
  // Literature
  literature: "Literature",
  english: "Literature",
  writing: "Literature",
  reading: "Literature",
  // History
  history: "History",
  geography: "History",
  economics: "History",
  philosophy: "History",
  // Languages
  languages: "Languages",
  spanish: "Languages",
  french: "Languages",
  german: "Languages",
  mandarin: "Languages",
};

export function canonicalSubjectFromCourseCategory(category?: string | null): Subject | null {
  if (!category) return null;
  return COURSE_CATEGORY_MAP[category.toLowerCase().trim()] ?? null;
}

/**
 * True when a course belongs to the given canonical subject. Checks the
 * explicit `subject` column first, then the catalogue `category`, then
 * subcategory tags — tutors fill these inconsistently, so we try all three.
 */
export function courseMatchesSubject(
  course: { subject?: string | null; category?: string | null; subcategory_tags?: string[] | null },
  subject: Subject,
): boolean {
  const direct =
    subjectFromSlug(course.subject) ?? canonicalSubjectFromCourseCategory(course.subject);
  if (direct === subject) return true;
  if (canonicalSubjectFromCourseCategory(course.category) === subject) return true;
  return (course.subcategory_tags ?? []).some(
    (t) => canonicalSubjectFromCourseCategory(t) === subject,
  );
}

// ─────────────────────────────────────────────
// Level ids
// ─────────────────────────────────────────────

export function makeLevelId(subject: Subject, band: LevelBand): string {
  return `${subjectSlug(subject)}.L${band}`;
}

export function parseLevelId(id?: string | null): { subject: Subject; band: LevelBand } | null {
  if (!id) return null;
  const [slug, rawBand] = id.split(".");
  const subject = subjectFromSlug(slug);
  if (!subject) return null;
  const band = Number((rawBand ?? "").replace(/^L/i, ""));
  if (!isLevelBand(band)) return null;
  return { subject, band };
}

/**
 * Stage-shifted requirement: stage 1 asks for the student's own band,
 * every stage after that asks for one band higher, capped at Mastermind.
 */
export function requiredBandForStage(baseBand: LevelBand, stageNumber: number): LevelBand {
  return clampBand(baseBand + Math.max(0, stageNumber - 1));
}

export function requiredLevelIdForStage(
  subject: Subject,
  baseBand: LevelBand,
  stageNumber: number,
): string {
  return makeLevelId(subject, requiredBandForStage(baseBand, stageNumber));
}

// ─────────────────────────────────────────────
// Legacy / cross-system coercion
// ─────────────────────────────────────────────

/**
 * Courses created before level ids existed only carry a free-text difficulty.
 * "All Levels" (or nothing) is a wildcard — such a course satisfies any band.
 */
export function bandFromDifficulty(difficulty?: string | null): LevelBand | null {
  if (!difficulty) return null;
  switch (difficulty.toLowerCase().trim()) {
    case "beginner":
      return 1;
    case "intermediate":
      return 3;
    case "advanced":
      return 5;
    default:
      return null; // "All Levels" and anything unrecognised → wildcard
  }
}

export function difficultyFromBand(band: LevelBand): string {
  if (band <= 2) return "Beginner";
  if (band <= 4) return "Intermediate";
  return "Advanced";
}

/** The tutor quiz's coarse three-way experience level → a band. */
export function bandFromExperienceLevel(level?: string | null): LevelBand | null {
  if (!level) return null;
  switch (level.toLowerCase().trim()) {
    case "beginner":
      return 1;
    case "intermediate":
      return 3;
    case "advanced":
      return 5;
    default:
      return null;
  }
}

/** A band → the tutor quiz's three-way level, so /matches can be pre-filled. */
export function experienceLevelFromBand(band: LevelBand): "beginner" | "intermediate" | "advanced" {
  if (band <= 2) return "beginner";
  if (band <= 4) return "intermediate";
  return "advanced";
}

/**
 * The band a course actually serves. Prefers the explicit `level_band`
 * written by the level-aware editor, falls back to legacy difficulty text.
 * `null` means "serves every band".
 */
export function courseBand(course: {
  level_band?: number | null;
  level_id?: string | null;
  difficulty?: string | null;
}): LevelBand | null {
  if (isLevelBand(course.level_band)) return course.level_band;
  const parsed = parseLevelId(course.level_id);
  if (parsed) return parsed.band;
  return bandFromDifficulty(course.difficulty);
}

export function bandLabel(band: LevelBand): string {
  return `${BAND_META[band].emoji} ${BAND_META[band].label}`;
}
