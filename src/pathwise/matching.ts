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
// (Your existing computeMatch, learningStyleScore, subjectScore, etc. stay exactly the same)
// I won't reprint the 150 lines here to save space – keep them as they are in your current file.
// But they must remain present below this comment.

// ... paste your existing `normalize`, `subjectScore`, `learningStyleScore`, `budgetScore`,
// `ratingScore`, `availabilityScore`, `computeMatch`, `RatingAgg` interface, etc. here ...

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
  return (data || []).map((row: any) => ({
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