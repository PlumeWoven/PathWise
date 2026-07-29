/**
 * src/pathwise/adaptive-quiz.ts
 *
 * The diagnostic's level estimator.
 *
 * Instead of counting correct answers out of five random questions, we run a
 * staircase: start mid-tier, step up on a correct answer and down on a wrong
 * one, with the step shrinking each round. Eight questions converge on a band
 * far more tightly than a flat five, and every question the student sees is
 * near the edge of what they can actually do.
 */

// Explicit .ts extensions keep this module loadable by `node --test`, which
// resolves imports natively rather than through Vite. tsconfig enables
// allowImportingTsExtensions, and Vite resolves them unchanged.
import { pickQuestionAtTier, type QuizQuestion, type Subject } from "./data.ts";
import { clampBand, type LevelBand } from "./levels.ts";

export const ADAPTIVE_LENGTH = 8;

/** Where every student starts — the middle band. */
const START_ABILITY = 3;

/**
 * Step size per question. Big early moves get a badly-placed student to the
 * right neighbourhood fast; small late moves settle on a band.
 * Total swing is ±4.05, enough to reach either extreme from the centre.
 */
const STEPS = [1.0, 0.8, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2];

export interface AdaptiveAnswer {
  questionId: string;
  selected: number;
  correct: boolean;
  topic: string;
  difficulty: LevelBand;
}

export interface AdaptiveState {
  /** Continuous ability estimate, 1..5 before clamping. */
  ability: number;
  answers: AdaptiveAnswer[];
}

export function createAdaptiveState(): AdaptiveState {
  return { ability: START_ABILITY, answers: [] };
}

export function askedIds(state: AdaptiveState): Set<string> {
  return new Set(state.answers.map((a) => a.questionId));
}

/**
 * The next question to serve, aimed at the current ability estimate.
 * Returns null once the run is complete or the pool is exhausted.
 */
export function nextQuestion(subject: Subject, state: AdaptiveState): QuizQuestion | null {
  if (state.answers.length >= ADAPTIVE_LENGTH) return null;
  return pickQuestionAtTier(subject, clampBand(state.ability), askedIds(state));
}

/** Applies one answer and returns the new state (never mutates the input). */
export function recordAnswer(
  state: AdaptiveState,
  question: QuizQuestion,
  selected: number,
): AdaptiveState {
  const correct = selected === question.correctIndex;
  const step = STEPS[Math.min(state.answers.length, STEPS.length - 1)];
  return {
    ability: state.ability + (correct ? step : -step),
    answers: [
      ...state.answers,
      {
        questionId: question.id,
        selected,
        correct,
        topic: question.topic,
        difficulty: question.difficulty,
      },
    ],
  };
}

/** The band this run lands on. */
export function finalBand(state: AdaptiveState): LevelBand {
  return clampBand(state.ability);
}

/**
 * XP for the run. Harder questions are worth more, so a student who reaches
 * tier-5 questions is rewarded for getting there — not just for volume.
 */
export function earnedXP(state: AdaptiveState): number {
  let xp = 0;
  let streak = 0;
  for (const a of state.answers) {
    if (a.correct) {
      xp += 60 + a.difficulty * 20; // 80 XP at tier 1 → 160 XP at tier 5
      streak += 1;
      if (streak >= 3) xp += 20;
    } else {
      streak = 0;
    }
  }
  return xp;
}

export function currentStreak(state: AdaptiveState): number {
  let streak = 0;
  for (const a of state.answers) streak = a.correct ? streak + 1 : 0;
  return streak;
}

/**
 * Per-topic band estimates. A correct answer is evidence the student holds
 * that tier; a wrong one is evidence they sit just below it. Averaging the
 * evidence per topic gives the strand-level picture the roadmap uses to
 * explain *why* a stage matters.
 */
export function topicBands(state: AdaptiveState): Record<string, LevelBand> {
  const buckets = new Map<string, number[]>();
  for (const a of state.answers) {
    const evidence = a.correct ? a.difficulty : a.difficulty - 1;
    const list = buckets.get(a.topic) ?? [];
    list.push(evidence);
    buckets.set(a.topic, list);
  }
  const out: Record<string, LevelBand> = {};
  buckets.forEach((values, topic) => {
    out[topic] = clampBand(values.reduce((s, v) => s + v, 0) / values.length);
  });
  return out;
}

/** Topics the student got wrong at least once — drives the roadmap copy. */
export function weakTopics(state: AdaptiveState): string[] {
  return Array.from(new Set(state.answers.filter((a) => !a.correct).map((a) => a.topic)));
}

/**
 * How settled the estimate is, 0..1. A run that flip-flops between right and
 * wrong at the end is less certain than one that plateaus.
 */
export function confidence(state: AdaptiveState): number {
  const tail = state.answers.slice(-4);
  if (tail.length < 2) return 0.3;
  let flips = 0;
  for (let i = 1; i < tail.length; i++) {
    if (tail[i].correct !== tail[i - 1].correct) flips += 1;
  }
  return Math.max(0.3, 1 - flips / (tail.length - 1));
}

/** Raw correct count — still shown on the result card and stored as `score`. */
export function correctCount(state: AdaptiveState): number {
  return state.answers.filter((a) => a.correct).length;
}

/**
 * One line explaining the placement, using the tier the student topped out at
 * rather than a bare fraction.
 */
export function placementSummary(state: AdaptiveState): string {
  const hardestCorrect = state.answers
    .filter((a) => a.correct)
    .reduce<number>((max, a) => Math.max(max, a.difficulty), 0);
  const weak = weakTopics(state);

  if (hardestCorrect === 0) {
    return "We'll start from the ground up and build your foundations properly.";
  }
  if (weak.length === 0) {
    return `You cleared every question we threw at you, up to tier ${hardestCorrect} — straight to advanced material.`;
  }
  const named = weak.slice(0, 2).join(" and ");
  return `You handled questions up to tier ${hardestCorrect}, but ${named} still need work.`;
}
