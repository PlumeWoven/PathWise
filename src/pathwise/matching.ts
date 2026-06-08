import { supabase } from '@/integrations/supabase/client';

// ---------- Existing types (unchanged) ----------
export interface TutorRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  hourly_rate: number | null;
  subject_specialties: string[] | null;
  specializations: string[] | null;
  superpowers: string[] | null;
  video_intro_url: string | null;
  verification_status: string | null;
  free_discovery_call: boolean | null;
  first_session_free: boolean | null;
}

export interface MatchPrefs {
  subject?: string;
  learning_style?: string;
  budget_max?: number;
  experience_level?: string;
  vibes?: string[];
  minRating?: number;
  availableThisWeek?: boolean;
  hasAvailability?: boolean;
}

export interface MatchScore {
  total: number;
  parts: {
    learningStyle: number;
    subject: number;
    availability: number;
    budget: number;
    rating: number;
  };
}

export const VIBE_TAGS = ["Motivational", "Patient", "Strict", "Fun", "Methodical", "Creative"] as const;
export type Vibe = typeof VIBE_TAGS[number];

export function matchColor(pct: number): string {
  if (pct >= 80) return "var(--pw-accent-2)";
  if (pct >= 60) return "var(--pw-warn, #d97706)";
  return "var(--pw-ink-2)";
}

// ---------- Client‑side scoring (kept for backwards compatibility / fallback) ----------

const WEIGHTS = { learningStyle: 0.30, subject: 0.25, availability: 0.20, budget: 0.15, rating: 0.10 };

const SUBJECT_ALIASES: Record<string, string[]> = {
  math: ["math", "mathematics", "algebra", "geometry", "calculus", "statistics"],
  science: ["science", "sciences", "physics", "chemistry", "biology"],
  languages: ["language", "languages", "english", "spanish", "french", "esl"],
  coding: ["coding", "programming", "python", "javascript", "computer science"],
  test_prep: ["test", "sat", "act", "gre", "gmat", "ielts", "toefl"],
  music: ["music", "piano", "guitar", "violin", "voice"],
  writing: ["writing", "literature", "essay"],
  art: ["art", "drawing", "painting"],
};

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function subjectScore(t: TutorRow, subject?: string): number {
  if (!subject) return 0.6; // neutral if no preference
  const key = normalize(subject);
  const aliases = SUBJECT_ALIASES[key] ?? [key];
  const haystack = [
    ...(t.subject_specialties ?? []),
    ...(t.specializations ?? []),
  ].map(normalize);
  if (haystack.length === 0) return 0.4;
  const directHit = haystack.some((h) => aliases.some((a) => h.includes(a)));
  if (directHit) return 1;
  // partial: matches via headline/bio
  const meta = `${t.headline ?? ""} ${t.bio ?? ""}`.toLowerCase();
  if (aliases.some((a) => meta.includes(a))) return 0.7;
  return 0.2;
}

function learningStyleScore(t: TutorRow, style?: string, vibes?: string[]): number {
  const sp = (t.superpowers ?? []).map(normalize);
  let score = 0.5;
  if (style) {
    const styleHints: Record<string, string[]> = {
      visual: ["visual", "diagram", "drawing", "creative", "demonstration"],
      auditory: ["explainer", "storytelling", "verbal", "discussion"],
      kinesthetic: ["hands-on", "interactive", "project", "practical"],
    };
    const hints = styleHints[normalize(style)] ?? [];
    if (hints.length && sp.some((s) => hints.some((h) => s.includes(h)))) score = 0.95;
    else if (sp.length > 0) score = 0.65;
  }
  if (vibes && vibes.length) {
    const matched = vibes.filter((v) => sp.some((s) => s.includes(normalize(v)))).length;
    if (matched > 0) score = Math.min(1, score + 0.1 * matched);
  }
  return score;
}

function budgetScore(t: TutorRow, max?: number): number {
  if (!max || max <= 0) return 0.7;
  const rate = Number(t.hourly_rate ?? 0);
  if (!rate) return 0.5;
  if (rate <= max * 0.7) return 1;
  if (rate <= max) return 0.85;
  if (rate <= max * 1.15) return 0.5;
  return 0.15;
}

function ratingScore(avg: number, count: number): number {
  if (count === 0) return 0.5; // unknown
  // 0..5 → 0..1, but penalise tutors with very few reviews slightly less
  const normalized = avg / 5;
  const confidence = Math.min(1, count / 10);
  return normalized * (0.7 + 0.3 * confidence);
}

function availabilityScore(hasAvail: boolean | undefined, availableThisWeek: boolean | undefined): number {
  if (hasAvail === undefined) return 0.6;
  if (!hasAvail) return 0.2;
  return availableThisWeek ? 1 : 0.85;
}

export interface RatingAgg { avg: number; count: number; }

export function computeMatch(
  t: TutorRow,
  prefs: MatchPrefs,
  rating: RatingAgg,
  hasAvailability: boolean,
): MatchScore {
  const parts = {
    learningStyle: learningStyleScore(t, prefs.learning_style, prefs.vibes),
    subject: subjectScore(t, prefs.subject),
    availability: availabilityScore(hasAvailability, prefs.availableThisWeek),
    budget: budgetScore(t, prefs.budget_max),
    rating: ratingScore(rating.avg, rating.count),
  };
  const total =
    parts.learningStyle * WEIGHTS.learningStyle +
    parts.subject * WEIGHTS.subject +
    parts.availability * WEIGHTS.availability +
    parts.budget * WEIGHTS.budget +
    parts.rating * WEIGHTS.rating;
  return { total, parts };
}
// ---------- NEW: Database RPC for matching ----------
export interface TutorMatchResult extends TutorRow {
  match_score: number;  // total score from SQL (0-1)
}

/**
 * Fetch matched tutors using the database `match_tutors` RPC.
 * @param studentId - current student's UUID (used for some internal logic, but the RPC may ignore it)
 * @param prefs - matching preferences (subject, dayOfWeek, hour, level)
 * @returns Array of tutors with their pre‑computed match_score (mapped to 0-1)
 */
export async function fetchTutorMatches(
  studentId: string,
  prefs: MatchPrefs
): Promise<TutorMatchResult[]> {
  // Map frontend preferences to RPC parameters
  const dayOfWeek = prefs.availableThisWeek ? new Date().getDay() : null; // 0=Sunday? adjust as needed
  const hour = prefs.availableThisWeek ? new Date().getHours() : null;

  // @ts-ignore: match_tutors RPC might not be in generated types
  const { data, error } = await supabase.rpc('match_tutors', {
    student_id: studentId,
    subject_filter: prefs.subject ?? null,
    level_filter: prefs.experience_level ?? null,
    day_of_week_filter: dayOfWeek,
    hour_filter: hour,
  });

  if (error) {
    console.error('Match RPC error:', error);
    throw new Error(error.message);
  }

  // Transform the RPC result into our TutorRow + match_score
  return ((data as unknown as any[]) || []).map((row: any) => ({
    id: row.tutor_id,
    display_name: row.full_name,
    avatar_url: row.avatar_url,
    headline: null,        // RPC doesn't return this; adjust if you add to SQL
    bio: null,
    hourly_rate: row.hourly_rate,
    subject_specialties: [row.subject], // SQL returns only one subject; adapt
    specializations: null,
    superpowers: null,
    video_intro_url: null,
    verification_status: null,
    free_discovery_call: null,
    first_session_free: null,
    match_score: row.match_score,
  }));
}

/**
 * Optional: If you still want to compute scores client‑side (e.g., for a single tutor),
 * you can keep your existing `computeMatch` function. It remains unchanged.
 */