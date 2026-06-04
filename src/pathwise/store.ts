import { Subject, GoalId, Level } from "./data";

export interface PWState {
  subject: Subject | null;
  goal: GoalId | null;
  answers: { questionId: string; selected: number; correct: boolean; topic: string }[];
  totalXP: number;
  streak: number;
  level: Level | null;
}

const initial: PWState = {
  subject: null,
  goal: null,
  answers: [],
  totalXP: 0,
  streak: 0,
  level: null,
};

let state: PWState = { ...initial };
const listeners = new Set<() => void>();

export function getState() {
  return state;
}

export function setState(patch: Partial<PWState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function resetState() {
  state = { ...initial, answers: [] };
  listeners.forEach((l) => l());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

import { useSyncExternalStore } from "react";
export function usePW() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export const GOAL_LABELS: Record<GoalId, string> = {
  exam: "Pass an exam",
  grades: "Improve my grades",
  gaps: "Fill in gaps",
  advanced: "Go to advanced level",
  work: "Learn for work",
};