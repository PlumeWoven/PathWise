// Run with: node --test tests/levels.test.ts
// Uses Node's native TypeScript type-stripping (Node >= 22.6) so there is no
// build step or test-runner dependency to install.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BAND_TO_LEVEL,
  LEVEL_TO_BAND,
  bandFromDifficulty,
  canonicalSubjectFromCourseCategory,
  canonicalSubjectFromTutorQuiz,
  clampBand,
  courseBand,
  courseMatchesSubject,
  makeLevelId,
  parseLevelId,
  requiredBandForStage,
  requiredLevelIdForStage,
  subjectFromSlug,
  tutorQuizSubjectFor,
} from "../src/pathwise/levels.ts";

test("band <-> level names round-trip", () => {
  for (const band of [1, 2, 3, 4, 5] as const) {
    assert.equal(LEVEL_TO_BAND[BAND_TO_LEVEL[band]], band);
  }
});

test("clampBand pins to 1..5 and rounds", () => {
  assert.equal(clampBand(-3), 1);
  assert.equal(clampBand(0.4), 1);
  assert.equal(clampBand(2.6), 3);
  assert.equal(clampBand(3.4), 3);
  assert.equal(clampBand(7.05), 5);
});

test("level ids round-trip through parse", () => {
  const id = makeLevelId("Mathematics", 3);
  assert.equal(id, "mathematics.L3");
  assert.deepEqual(parseLevelId(id), { subject: "Mathematics", band: 3 });
});

test("parseLevelId rejects malformed ids instead of guessing", () => {
  for (const bad of [null, undefined, "", "mathematics", "mathematics.L9", "wizardry.L3", "L3"]) {
    assert.equal(parseLevelId(bad as unknown as string), null, `expected null for ${bad}`);
  }
});

test("stage requirement climbs one band per stage and caps at Mastermind", () => {
  // A Seedling walks 1 → 5 across a five-stage roadmap.
  assert.deepEqual(
    [1, 2, 3, 4, 5].map((n) => requiredBandForStage(1, n)),
    [1, 2, 3, 4, 5],
  );
  // A Sharpshooter tops out rather than running off the end.
  assert.deepEqual(
    [1, 2, 3, 4, 5].map((n) => requiredBandForStage(4, n)),
    [4, 5, 5, 5, 5],
  );
  // Stage 1 always asks for exactly the student's own band.
  for (const base of [1, 2, 3, 4, 5] as const) {
    assert.equal(requiredBandForStage(base, 1), base);
  }
});

test("requiredLevelIdForStage composes subject and shifted band", () => {
  assert.equal(requiredLevelIdForStage("Programming", 2, 3), "programming.L4");
});

test("tutor-quiz subjects fold onto canonical roadmap subjects", () => {
  assert.equal(canonicalSubjectFromTutorQuiz("math"), "Mathematics");
  assert.equal(canonicalSubjectFromTutorQuiz("coding"), "Programming");
  assert.equal(canonicalSubjectFromTutorQuiz("writing"), "Literature");
  // These have no roadmap equivalent and must not be silently mismapped.
  assert.equal(canonicalSubjectFromTutorQuiz("music"), null);
  assert.equal(canonicalSubjectFromTutorQuiz("art"), null);
  assert.equal(canonicalSubjectFromTutorQuiz("test_prep"), null);
  assert.equal(canonicalSubjectFromTutorQuiz(undefined), null);
});

test("tutorQuizSubjectFor reverses the mapping where one exists", () => {
  assert.equal(tutorQuizSubjectFor("Mathematics"), "math");
  assert.equal(tutorQuizSubjectFor("History"), null); // history isn't in the tutor quiz
});

test("course catalogue categories fold onto canonical subjects", () => {
  assert.equal(canonicalSubjectFromCourseCategory("Algebra"), "Mathematics");
  assert.equal(canonicalSubjectFromCourseCategory("AP Calculus"), "Mathematics");
  assert.equal(canonicalSubjectFromCourseCategory("Physics"), "Sciences");
  assert.equal(canonicalSubjectFromCourseCategory("Computer Science"), "Programming");
  assert.equal(canonicalSubjectFromCourseCategory("  english "), "Literature");
  assert.equal(canonicalSubjectFromCourseCategory("Underwater Basketry"), null);
  assert.equal(canonicalSubjectFromCourseCategory(null), null);
});

test("subjectFromSlug only accepts canonical slugs", () => {
  assert.equal(subjectFromSlug("mathematics"), "Mathematics");
  assert.equal(subjectFromSlug("MATHEMATICS"), "Mathematics");
  assert.equal(subjectFromSlug("math"), null);
});

test("courseMatchesSubject checks subject, category and tags", () => {
  const bySubject = { subject: "mathematics", category: null, subcategory_tags: null };
  const byCategory = { subject: null, category: "Geometry", subcategory_tags: null };
  const byTag = { subject: null, category: null, subcategory_tags: ["Calculus"] };
  const unrelated = { subject: null, category: "Spanish", subcategory_tags: ["Grammar"] };

  assert.equal(courseMatchesSubject(bySubject, "Mathematics"), true);
  assert.equal(courseMatchesSubject(byCategory, "Mathematics"), true);
  assert.equal(courseMatchesSubject(byTag, "Mathematics"), true);
  assert.equal(courseMatchesSubject(unrelated, "Mathematics"), false);
  assert.equal(courseMatchesSubject(unrelated, "Languages"), true);
});

test("legacy difficulty maps to bands, with 'All Levels' as a wildcard", () => {
  assert.equal(bandFromDifficulty("Beginner"), 1);
  assert.equal(bandFromDifficulty("Intermediate"), 3);
  assert.equal(bandFromDifficulty("Advanced"), 5);
  // A wildcard must stay null rather than collapsing to the middle band —
  // null means "serves every band" to the matcher.
  assert.equal(bandFromDifficulty("All Levels"), null);
  assert.equal(bandFromDifficulty(null), null);
});

test("courseBand prefers explicit level_band over legacy difficulty", () => {
  assert.equal(courseBand({ level_band: 2, difficulty: "Advanced" }), 2);
  assert.equal(courseBand({ level_band: null, level_id: "sciences.L4" }), 4);
  assert.equal(courseBand({ level_band: null, level_id: null, difficulty: "Beginner" }), 1);
  assert.equal(courseBand({ level_band: null, level_id: null, difficulty: "All Levels" }), null);
});
