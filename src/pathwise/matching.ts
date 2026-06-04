/** Weighted matching algorithm.
 *  Weights: Learning Style 30%, Subject Match 25%, Availability 20%, Budget 15%, Rating 10%
 */
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
  subject?: string;        // free text, e.g. "math"
  learning_style?: string; // visual | auditory | kinesthetic
  budget_max?: number;     // hourly $ cap
  experience_level?: string; // beginner | intermediate | advanced
  vibes?: string[];          // selected vibe tags
  minRating?: number;
  availableThisWeek?: boolean;
  hasAvailability?: boolean; // tutor has any availability rows
}

export interface MatchScore {
  total: number;
  parts: { learningStyle: number; subject: number; availability: number; budget: number; rating: number };
}

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

export function matchColor(pct: number): string {
  if (pct >= 80) return "var(--pw-accent-2)";
  if (pct >= 60) return "var(--pw-warn, #d97706)";
  return "var(--pw-ink-2)";
}

export const VIBE_TAGS = ["Motivational", "Patient", "Strict", "Fun", "Methodical", "Creative"] as const;
export type Vibe = typeof VIBE_TAGS[number];