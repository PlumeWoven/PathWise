import { useSyncExternalStore } from "react";
import { Subject } from "./data";

export interface SessionLog {
  id: string;
  date: string; // ISO date
  tutor: string;
  duration: number; // minutes
  notes: string;
}

export interface StageProgress {
  completed: boolean;
  sessions: SessionLog[];
}

export interface ProgressState {
  // key: `${subject}:${stageNumber}`
  stages: Record<string, StageProgress>;
}

const STORAGE_KEY = "pw_progress_v1";

function load(): ProgressState {
  if (typeof localStorage === "undefined") return { stages: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { stages: {} };
    return JSON.parse(raw) as ProgressState;
  } catch {
    return { stages: {} };
  }
}

function save(state: ProgressState) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

let state: ProgressState = load();
const listeners = new Set<() => void>();

function emit() {
  save(state);
  listeners.forEach((l) => l());
}

export function key(subject: Subject, stageNumber: number) {
  return `${subject}:${stageNumber}`;
}

export function getStageProgress(subject: Subject, stageNumber: number): StageProgress {
  return state.stages[key(subject, stageNumber)] ?? { completed: false, sessions: [] };
}

export function markStageComplete(subject: Subject, stageNumber: number) {
  const k = key(subject, stageNumber);
  const cur = state.stages[k] ?? { completed: false, sessions: [] };
  state.stages = { ...state.stages, [k]: { ...cur, completed: true } };
  emit();
}

export function unmarkStageComplete(subject: Subject, stageNumber: number) {
  const k = key(subject, stageNumber);
  const cur = state.stages[k] ?? { completed: false, sessions: [] };
  state.stages = { ...state.stages, [k]: { ...cur, completed: false } };
  emit();
}

export function addSession(subject: Subject, stageNumber: number, session: Omit<SessionLog, "id">) {
  const k = key(subject, stageNumber);
  const cur = state.stages[k] ?? { completed: false, sessions: [] };
  const next: SessionLog = { ...session, id: crypto.randomUUID() };
  state.stages = {
    ...state.stages,
    [k]: { ...cur, sessions: [next, ...cur.sessions] },
  };
  emit();
}

export function removeSession(subject: Subject, stageNumber: number, sessionId: string) {
  const k = key(subject, stageNumber);
  const cur = state.stages[k];
  if (!cur) return;
  state.stages = {
    ...state.stages,
    [k]: { ...cur, sessions: cur.sessions.filter((s) => s.id !== sessionId) },
  };
  emit();
}

export function useProgress() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export function completedCount(subject: Subject, totalStages: number): number {
  let n = 0;
  for (let i = 1; i <= totalStages; i++) {
    if (state.stages[key(subject, i)]?.completed) n++;
  }
  return n;
}
