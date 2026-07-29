// Run with: node --test tests/adaptive-quiz.test.ts
// Uses Node's native TypeScript type-stripping (Node >= 22.6) so there is no
// build step or test-runner dependency to install.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADAPTIVE_LENGTH,
  correctCount,
  createAdaptiveState,
  currentStreak,
  earnedXP,
  finalBand,
  nextQuestion,
  recordAnswer,
  topicBands,
  weakTopics,
  type AdaptiveState,
} from "../src/pathwise/adaptive-quiz.ts";
import { QUIZZES, tierCoverage, type Subject } from "../src/pathwise/data.ts";

const SUBJECTS = Object.keys(QUIZZES) as Subject[];

/** Drives a full run where the student answers according to `answerFn`. */
function runQuiz(subject: Subject, answerFn: (tier: number) => boolean): AdaptiveState {
  let state = createAdaptiveState();
  for (let i = 0; i < ADAPTIVE_LENGTH; i++) {
    const q = nextQuestion(subject, state);
    if (!q) break;
    const correct = answerFn(q.difficulty);
    const selected = correct ? q.correctIndex : (q.correctIndex + 1) % q.options.length;
    state = recordAnswer(state, q, selected);
  }
  return state;
}

test("every subject pool covers all five difficulty tiers", () => {
  for (const subject of SUBJECTS) {
    const coverage = tierCoverage(subject);
    for (const tier of [1, 2, 3, 4, 5] as const) {
      assert.ok(
        coverage[tier] >= 3,
        `${subject} tier ${tier} has only ${coverage[tier]} questions — the staircase needs headroom`,
      );
    }
  }
});

test("every question has a valid correctIndex and distinct options", () => {
  for (const subject of SUBJECTS) {
    for (const q of QUIZZES[subject]) {
      assert.ok(
        q.correctIndex >= 0 && q.correctIndex < q.options.length,
        `${q.id}: correctIndex ${q.correctIndex} out of range`,
      );
      assert.equal(
        new Set(q.options).size,
        q.options.length,
        `${q.id}: duplicate options would make more than one answer correct`,
      );
      assert.ok(q.difficulty >= 1 && q.difficulty <= 5, `${q.id}: difficulty out of range`);
    }
  }
});

test("question ids are unique within each subject", () => {
  for (const subject of SUBJECTS) {
    const ids = QUIZZES[subject].map((q) => q.id);
    assert.equal(new Set(ids).size, ids.length, `${subject} has duplicate question ids`);
  }
});

test("a student who gets everything right lands on Mastermind", () => {
  for (const subject of SUBJECTS) {
    const state = runQuiz(subject, () => true);
    assert.equal(finalBand(state), 5, `${subject}: all-correct run should reach band 5`);
  }
});

test("a student who gets everything wrong lands on Seedling", () => {
  for (const subject of SUBJECTS) {
    const state = runQuiz(subject, () => false);
    assert.equal(finalBand(state), 1, `${subject}: all-wrong run should reach band 1`);
  }
});

test("a student who can answer up to tier N places near N", () => {
  // Someone who reliably clears tier 3 and below, and fails above it, should
  // settle at band 3 or 4 — the staircase brackets their ceiling.
  for (const subject of SUBJECTS) {
    const state = runQuiz(subject, (tier) => tier <= 3);
    const band = finalBand(state);
    assert.ok(
      band >= 3 && band <= 4,
      `${subject}: ceiling-at-3 student placed at band ${band}, expected 3–4`,
    );
  }
});

test("a student who can only answer tier 1 places at the bottom", () => {
  for (const subject of SUBJECTS) {
    const band = finalBand(runQuiz(subject, (tier) => tier <= 1));
    assert.ok(band <= 2, `${subject}: tier-1-only student placed at band ${band}, expected 1–2`);
  }
});

test("the run serves exactly ADAPTIVE_LENGTH distinct questions", () => {
  for (const subject of SUBJECTS) {
    const state = runQuiz(subject, (tier) => tier <= 3);
    assert.equal(state.answers.length, ADAPTIVE_LENGTH);
    const ids = state.answers.map((a) => a.questionId);
    assert.equal(new Set(ids).size, ids.length, `${subject}: repeated a question within one run`);
  }
});

test("nextQuestion returns null once the run is complete", () => {
  const state = runQuiz("Mathematics", () => true);
  assert.equal(nextQuestion("Mathematics", state), null);
});

test("difficulty follows the answer — up when right, down when wrong", () => {
  // Answer the first question correctly, the rest incorrectly, and confirm the
  // served tier moves in the expected direction each time.
  let state = createAdaptiveState();
  const first = nextQuestion("Mathematics", state)!;
  state = recordAnswer(state, first, first.correctIndex);
  const afterCorrect = nextQuestion("Mathematics", state)!;
  assert.ok(
    afterCorrect.difficulty >= first.difficulty,
    "a correct answer must not lower the difficulty",
  );

  state = recordAnswer(
    state,
    afterCorrect,
    (afterCorrect.correctIndex + 1) % afterCorrect.options.length,
  );
  const afterWrong = nextQuestion("Mathematics", state)!;
  assert.ok(
    afterWrong.difficulty <= afterCorrect.difficulty,
    "a wrong answer must not raise the difficulty",
  );
});

test("XP rewards harder questions more than easy ones", () => {
  const easy = runQuiz("Mathematics", (tier) => tier <= 1);
  const hard = runQuiz("Mathematics", () => true);
  assert.ok(
    earnedXP(hard) > earnedXP(easy),
    "clearing tier-5 questions should out-earn scraping tier 1",
  );
  assert.equal(earnedXP(createAdaptiveState()), 0);
});

test("streak resets on a wrong answer", () => {
  assert.equal(currentStreak(runQuiz("Mathematics", () => true)), ADAPTIVE_LENGTH);
  assert.equal(currentStreak(runQuiz("Mathematics", () => false)), 0);
});

test("topicBands reports a band per topic seen, never out of range", () => {
  const state = runQuiz("Sciences", (tier) => tier <= 3);
  const bands = topicBands(state);
  const seen = new Set(state.answers.map((a) => a.topic));
  assert.deepEqual(new Set(Object.keys(bands)), seen);
  for (const [topic, band] of Object.entries(bands)) {
    assert.ok(band >= 1 && band <= 5, `${topic} band ${band} out of range`);
  }
});

test("weakTopics lists only topics actually missed, without duplicates", () => {
  const perfect = runQuiz("History", () => true);
  assert.deepEqual(weakTopics(perfect), []);

  const failing = runQuiz("History", () => false);
  const weak = weakTopics(failing);
  assert.ok(weak.length > 0);
  assert.equal(new Set(weak).size, weak.length, "weakTopics must be deduplicated");
});

test("correctCount matches the answers recorded", () => {
  assert.equal(correctCount(runQuiz("Literature", () => true)), ADAPTIVE_LENGTH);
  assert.equal(correctCount(runQuiz("Literature", () => false)), 0);
});

test("recordAnswer does not mutate the state it is given", () => {
  const state = createAdaptiveState();
  const q = nextQuestion("Programming", state)!;
  const next = recordAnswer(state, q, q.correctIndex);
  assert.equal(state.answers.length, 0, "original state was mutated");
  assert.equal(next.answers.length, 1);
});
