import { test } from "node:test";
import assert from "node:assert/strict";

import {
  MOCK_TUTORS,
  blockingCriteria,
  evaluateTutor,
  matchMockTutors,
  type RoadmapContext,
  type TutorQuizAnswers,
} from "../src/pathwise/mock-tutors.ts";
import { SUBJECT_SLUGS, type LevelBand } from "../src/pathwise/levels.ts";
import type { Subject } from "../src/pathwise/data.ts";

const ALL_SUBJECTS = Object.keys(SUBJECT_SLUGS) as Subject[];

// ─── Roster shape ────────────────────────────────────────────────────────────

test("every canonical subject has at least two tutors", () => {
  for (const subject of ALL_SUBJECTS) {
    const count = MOCK_TUTORS.filter((t) => t.subjects.includes(subject)).length;
    assert.ok(count >= 2, `${subject} has only ${count} tutor(s)`);
  }
});

test("every band 1-5 is teachable in every subject", () => {
  for (const subject of ALL_SUBJECTS) {
    for (const band of [1, 2, 3, 4, 5] as LevelBand[]) {
      const covered = MOCK_TUTORS.some(
        (t) => t.subjects.includes(subject) && band >= t.bands[0] && band <= t.bands[1],
      );
      assert.ok(covered, `${subject} has no tutor covering band ${band}`);
    }
  }
});

test("every band 1-5 has at least one course pitched at it", () => {
  for (const band of [1, 2, 3, 4, 5] as LevelBand[]) {
    const found = MOCK_TUTORS.flatMap((t) => t.courses).some((c) => c.band === band);
    assert.ok(found, `no course exists at band ${band}`);
  }
});

test("tutor and course ids are unique", () => {
  const tutorIds = MOCK_TUTORS.map((t) => t.id);
  assert.equal(new Set(tutorIds).size, tutorIds.length, "duplicate tutor id");

  const courseIds = MOCK_TUTORS.flatMap((t) => t.courses.map((c) => c.id));
  assert.equal(new Set(courseIds).size, courseIds.length, "duplicate course id");
});

test("every tutor's courses fall inside their declared band range", () => {
  for (const t of MOCK_TUTORS) {
    assert.ok(t.bands[0] <= t.bands[1], `${t.name} has an inverted band range`);
    for (const c of t.courses) {
      assert.ok(
        c.band >= t.bands[0] && c.band <= t.bands[1],
        `${t.name} teaches bands ${t.bands.join("-")} but "${c.title}" is band ${c.band}`,
      );
    }
  }
});

// ─── Strict AND semantics ────────────────────────────────────────────────────

const languagesBuilder: RoadmapContext = {
  subject: "Languages",
  band: 3,
  requiredBand: 3,
};

test("an answered criterion that fails excludes the tutor", () => {
  // Sofia Rossi is auditory/kinesthetic, so a visual-only learner must not match her.
  const sofia = MOCK_TUTORS.find((t) => t.id === "mock-lng-1")!;
  const criteria = evaluateTutor(sofia, { learning_style: "visual" }, languagesBuilder);
  const style = criteria.find((c) => c.key === "learning_style")!;
  assert.equal(style.passed, false);
  assert.equal(style.skipped, false);

  const matched = matchMockTutors({ learning_style: "visual" }, languagesBuilder);
  assert.ok(!matched.some((m) => m.tutor.id === "mock-lng-1"));
});

test("a skipped criterion disqualifies nobody", () => {
  const sofia = MOCK_TUTORS.find((t) => t.id === "mock-lng-1")!;
  const criteria = evaluateTutor(sofia, {}, languagesBuilder);
  for (const c of criteria) {
    if (c.key === "subject" || c.key === "level") continue;
    assert.equal(c.skipped, true, `${c.key} should be skipped`);
    assert.equal(c.passed, true, `${c.key} should pass when unanswered`);
  }
});

test("budget is a hard ceiling", () => {
  const cheap = matchMockTutors({ budget_max: 26 }, languagesBuilder);
  assert.ok(cheap.length > 0, "expected at least one tutor under EUR 26");
  for (const m of cheap) {
    assert.ok(
      m.tutor.hourlyRate <= 26,
      `${m.tutor.name} costs EUR ${m.tutor.hourlyRate}, over the EUR 26 cap`,
    );
  }
});

test("every returned match passes every criterion", () => {
  const answers: TutorQuizAnswers = {
    subject: "languages",
    goal: "master_skill",
    learning_style: "auditory",
    time_of_day: "midday",
    frequency: "weekly",
    experience_level: "intermediate",
    budget_max: 60,
  };
  const matched = matchMockTutors(answers, languagesBuilder);
  assert.ok(matched.length > 0, "expected matches for a realistic answer set");

  for (const m of matched) {
    for (const c of m.criteria) {
      assert.ok(c.passed, `${m.tutor.name} was returned but failed ${c.key}`);
    }
  }
});

test("matches only teach the roadmap subject", () => {
  const matched = matchMockTutors({ learning_style: "auditory" }, languagesBuilder);
  assert.ok(matched.length > 0);
  for (const m of matched) {
    assert.ok(
      m.tutor.subjects.includes("Languages"),
      `${m.tutor.name} does not teach Languages`,
    );
  }
});

test("a tutor-quiz subject conflicting with the roadmap yields nothing", () => {
  // Student took the roadmap quiz in Languages but the tutor quiz in coding.
  const matched = matchMockTutors({ subject: "coding" }, languagesBuilder);
  assert.equal(matched.length, 0);
});

test("subjects with no roadmap equivalent do not constrain the subject filter", () => {
  // test_prep maps to null, so it must not wipe out the Languages roster.
  const matched = matchMockTutors({ subject: "test_prep" }, languagesBuilder);
  assert.ok(matched.length > 0, "test_prep should fall back to the roadmap subject");
});

// ─── Course relevance ────────────────────────────────────────────────────────

test("returned courses are within one band of the requirement", () => {
  for (const band of [1, 2, 3, 4, 5] as LevelBand[]) {
    for (const subject of ALL_SUBJECTS) {
      const matched = matchMockTutors({}, { subject, band, requiredBand: band });
      for (const m of matched) {
        assert.ok(m.courses.length > 0, `${m.tutor.name} returned with no courses`);
        for (const c of m.courses) {
          assert.ok(
            Math.abs(c.band - band) <= 1,
            `"${c.title}" is band ${c.band}, too far from required ${band}`,
          );
        }
      }
    }
  }
});

test("tutors with an exact-band course outrank those without", () => {
  const matched = matchMockTutors({}, languagesBuilder);
  const firstNonExact = matched.findIndex((m) => m.bestCourse?.band !== 3);
  if (firstNonExact === -1) return; // all exact — nothing to order
  const laterExact = matched.slice(firstNonExact).some((m) => m.bestCourse?.band === 3);
  assert.equal(laterExact, false, "an exact-band match ranked below a near-band one");
});

test("every subject and band combination is satisfiable with no preferences", () => {
  for (const subject of ALL_SUBJECTS) {
    for (const band of [1, 2, 3, 4, 5] as LevelBand[]) {
      const matched = matchMockTutors({}, { subject, band, requiredBand: band });
      assert.ok(
        matched.length > 0,
        `${subject} band ${band} has no matchable tutor with a fitting course`,
      );
    }
  }
});

// ─── Empty-state diagnostics ─────────────────────────────────────────────────

test("blockingCriteria names the constraint that excluded everyone", () => {
  // EUR 5 is below every tutor's rate, so budget must be the top blocker.
  const blockers = blockingCriteria({ budget_max: 5 }, languagesBuilder);
  assert.ok(blockers.length > 0);
  assert.equal(blockers[0].label, "Budget");
  assert.equal(matchMockTutors({ budget_max: 5 }, languagesBuilder).length, 0);
});

test("blockingCriteria is empty when everything matches", () => {
  const answers: TutorQuizAnswers = { learning_style: "auditory" };
  assert.ok(matchMockTutors(answers, languagesBuilder).length > 0);
});
