/**
 * src/pathwise/api.ts
 *
 * Single source of truth for all Supabase calls in PathWise.
 * Import from here — never call supabase directly from route files.
 *
 * Sections:
 *  1. Auth
 *  2. Profile
 *  3. Diagnostic Results
 *  4. Roadmaps & Stages
 *  5. Tutor Matching
 *  6. Sessions & Booking
 *  7. Courses
 *  8. Notifications
 *  9. Reviews
 * 10. Availability
 */

import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate, Enums } from "@/integrations/supabase/types";
import type { Subject, Level, GoalId } from "./data";
import type { GeneratedStage } from "./roadmap-gen";

type SessionStatus = Enums<"session_status">;

// ─────────────────────────────────────────────
// 1. AUTH
// ─────────────────────────────────────────────

export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// ─────────────────────────────────────────────
// 2. PROFILE
// ─────────────────────────────────────────────

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
    if (error) throw error;
    return data;
}

export async function updateProfile(userId: string, updates: TablesUpdate<"profiles">) {
    const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function completeOnboarding(userId: string) {
    return updateProfile(userId, { onboarding_completed: true });
}

// ─────────────────────────────────────────────
// 3. DIAGNOSTIC RESULTS
// ─────────────────────────────────────────────

export interface SaveDiagnosticInput {
    subject: Subject;
    goal: GoalId;
    score: number;
    level: Level;
    xp_earned: number;
    wrong_topics: string[];
    user_id?: string | null; // null = anonymous (demo)
}

/**
 * Saves quiz results to diagnostic_results table.
 * Works for both authenticated users and anonymous demo users.
 * Returns the new diagnostic ID — store this to link the roadmap.
 */
export async function saveDiagnosticResult(input: SaveDiagnosticInput): Promise<string> {
    const { data, error } = await supabase
        .from("diagnostic_results")
        .insert({
            user_id: input.user_id ?? null,
            subject: input.subject,
            goal: input.goal,
            score: input.score,
            level: input.level,
            xp_earned: input.xp_earned,
            wrong_topics: input.wrong_topics,
        })
        .select("id")
        .single();

    if (error) throw error;
    return data.id;
}

/**
 * Gets the most recent diagnostic result for the current user.
 */
export async function getLatestDiagnostic(userId: string) {
    const { data, error } = await supabase
        .from("diagnostic_results")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
    return data ?? null;
}

// ─────────────────────────────────────────────
// 4. ROADMAPS & STAGES
// ─────────────────────────────────────────────

/**
 * Creates a roadmap and its 5 stages in one go.
 * Call this immediately after saveDiagnosticResult.
 */
export async function createRoadmap(params: {
    user_id: string | null;
    diagnostic_id: string;
    subject: Subject;
    goal: GoalId;
    stages: GeneratedStage[];
}): Promise<string> {
    // 1. Insert the roadmap
    const { data: roadmap, error: roadmapErr } = await supabase
        .from("roadmaps")
        .insert({
            user_id: params.user_id,
            diagnostic_id: params.diagnostic_id,
            subject: params.subject,
            goal: params.goal,
            current_stage: 1,
            total_stages: params.stages.length,
        })
        .select("id")
        .single();

    if (roadmapErr) throw roadmapErr;

    // 2. Insert all stages
    const stageRows = params.stages.map((s) => ({
        roadmap_id: roadmap.id,
        stage_number: s.stage_number,
        title: s.title,
        skills: s.skills,
        status: s.status,
    }));

    const { error: stagesErr } = await supabase
        .from("roadmap_stages")
        .insert(stageRows);

    if (stagesErr) throw stagesErr;

    return roadmap.id;
}

/**
 * Fetches a roadmap with all its stages for the current user.
 */
export async function getRoadmapWithStages(userId: string) {
    const { data: roadmap, error: roadmapErr } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (roadmapErr && roadmapErr.code !== "PGRST116") throw roadmapErr;
    if (!roadmap) return null;

    const { data: stages, error: stagesErr } = await supabase
        .from("roadmap_stages")
        .select("*")
        .eq("roadmap_id", roadmap.id)
        .order("stage_number", { ascending: true });

    if (stagesErr) throw stagesErr;

    return { roadmap, stages: stages ?? [] };
}

/**
 * Marks a stage as complete and unlocks the next one.
 */
export async function completeStage(roadmapId: string, stageNumber: number) {
    // Mark current stage complete
    const { error: completeErr } = await supabase
        .from("roadmap_stages")
        .update({ status: "complete", completed_at: new Date().toISOString() })
        .eq("roadmap_id", roadmapId)
        .eq("stage_number", stageNumber);

    if (completeErr) throw completeErr;

    // Unlock next stage
    const { error: unlockErr } = await supabase
        .from("roadmap_stages")
        .update({ status: "active" })
        .eq("roadmap_id", roadmapId)
        .eq("stage_number", stageNumber + 1);

    if (unlockErr && unlockErr.code !== "PGRST116") throw unlockErr;

    // Advance current_stage on roadmap
    const { error: roadmapErr } = await supabase
        .from("roadmaps")
        .update({ current_stage: stageNumber + 1 })
        .eq("id", roadmapId);

    if (roadmapErr) throw roadmapErr;
}

// ─────────────────────────────────────────────
// 5. TUTOR MATCHING
// ─────────────────────────────────────────────

/**
 * Fetches real tutors from the database matching a subject and level.
 *
 * Matching logic:
 *  - Tutor role = 'tutor'
 *  - verification_status = 'verified' (only show verified tutors)
 *  - subject_specialties contains the requested subject
 *  - Falls back to subject_proficiency JSON if specialties is empty
 *
 * Returns up to 6 tutors ordered by hourly_rate ASC (cheapest first).
 * The UI can re-sort however it wants.
 */
export async function fetchMatchedTutors(subject: Subject, _level: Level) {
    const { data, error } = await supabase
        .from("profiles")
        .select(
            "id, display_name, full_name, avatar_url, headline, bio, hourly_rate, " +
            "subject_specialties, years_experience, rating, verification_status, " +
            "instant_bookings, first_session_free, free_discovery_call, timezone, " +
            "superpowers"
        )
        .eq("role", "tutor")
        .eq("verification_status", "verified")
        .contains("subject_specialties", [subject])
        .order("hourly_rate", { ascending: true })
        .limit(6);

    if (error) throw error;

    // If no verified tutors yet (early stage), fall back to all tutors
    // Remove this fallback once real tutors are onboarded
    if (!data || data.length === 0) {
        const { data: fallback, error: fallbackErr } = await supabase
            .from("profiles")
            .select(
                "id, display_name, full_name, avatar_url, headline, bio, hourly_rate, " +
                "subject_specialties, years_experience, verification_status, " +
                "instant_bookings, first_session_free, free_discovery_call, timezone"
            )
            .eq("role", "tutor")
            .order("created_at", { ascending: false })
            .limit(6);

        if (fallbackErr) throw fallbackErr;
        return fallback ?? [];
    }

    return data;
}

/**
 * Records a profile view for analytics (tutor dashboard).
 * Fire-and-forget — don't await in the UI.
 */
export async function recordProfileView(tutorId: string, viewerId?: string) {
    await supabase.from("profile_views").insert({
        tutor_id: tutorId,
        viewer_id: viewerId ?? null,
    });
}

// ─────────────────────────────────────────────
// 6. SESSIONS & BOOKING
// ─────────────────────────────────────────────

/**
 * Books a session using the atomic book_session() Postgres RPC.
 * Handles slot conflict detection server-side.
 *
 * Throws "SLOT_TAKEN" if the slot is already booked.
 */
export async function bookSession(params: {
    tutor_id: string;
    scheduled_start: string; // ISO string
    scheduled_end: string;   // ISO string
    duration_minutes: number;
    timezone: string;
    session_type: string;    // '1on1' | 'group'
    amount: number;
    meeting_url: string;
    recurrence_group_id?: string;
    recurrence_index?: number;
}): Promise<string> {
    const { data, error } = await supabase.rpc("book_session", {
        p_tutor_id: params.tutor_id,
        p_scheduled_start: params.scheduled_start,
        p_scheduled_end: params.scheduled_end,
        p_duration_minutes: params.duration_minutes,
        p_timezone: params.timezone,
        p_session_type: params.session_type,
        p_amount: params.amount,
        p_meeting_url: params.meeting_url,
        p_recurrence_group_id: params.recurrence_group_id ?? undefined,
        p_recurrence_index: params.recurrence_index ?? undefined,
    });

    if (error) {
        if (error.message?.includes("SLOT_TAKEN")) {
            throw new Error("SLOT_TAKEN");
        }
        throw error;
    }

    return data as string; // returns session UUID
}

/**
 * Fetches upcoming sessions for a student or tutor.
 */
export async function getUpcomingSessions(userId: string, role: "student" | "tutor") {
    const field = role === "student" ? "student_id" : "tutor_id";

    const { data, error } = await supabase
        .from("sessions")
        .select(
            "id, scheduled_start, scheduled_end, duration_minutes, status_v2, " +
            "session_type, meeting_url, amount, subject, " +
            "student:student_id(id, display_name, avatar_url), " +
            "tutor:tutor_id(id, display_name, avatar_url, hourly_rate)"
        )
        .eq(field, userId)
        .not("status_v2", "in", '("cancelled","closed","completed")')
        .order("scheduled_start", { ascending: true })
        .limit(20);

    if (error) throw error;
    return data ?? [];
}

/**
 * Fetches past sessions for a student or tutor.
 */
export async function getPastSessions(userId: string, role: "student" | "tutor") {
    const field = role === "student" ? "student_id" : "tutor_id";

    const { data, error } = await supabase
        .from("sessions")
        .select(
            "id, scheduled_start, scheduled_end, duration_minutes, status_v2, " +
            "session_type, amount, subject, rating, " +
            "student:student_id(id, display_name, avatar_url), " +
            "tutor:tutor_id(id, display_name, avatar_url)"
        )
        .eq(field, userId)
        .in("status_v2", ["completed", "closed", "cancelled"])
        .order("scheduled_start", { ascending: false })
        .limit(50);

    if (error) throw error;
    return data ?? [];
}

/**
 * Updates session status (e.g., student cancels, tutor confirms).
 */
export async function updateSessionStatus(
    sessionId: string,
    newStatus: SessionStatus,
    reason?: string
) {
    const { error } = await supabase
        .from("sessions")
        .update({ status_v2: newStatus, cancellation_reason: reason ?? null })
        .eq("id", sessionId);

    if (error) throw error;
}

// ─────────────────────────────────────────────
// 7. COURSES
// ─────────────────────────────────────────────

/**
 * Fetches published courses, optionally filtered by subject.
 */
export async function getPublishedCourses(subject?: Subject) {
    let query = supabase
        .from("courses")
        .select(
            "id, title, slug, subtitle, description, subject, level, difficulty, " +
            "price, currency, discount_price, thumbnail_url, certificate_enabled, " +
            "estimated_weeks, learning_outcomes, " +
            "tutor:tutor_id(id, display_name, avatar_url, headline)"
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });

    if (subject) {
        query = query.eq("subject", subject);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

/**
 * Fetches a single course by slug (public page).
 */
export async function getCourseBySlug(slug: string) {
    const { data, error } = await supabase
        .from("courses")
        .select(
            "*, " +
            "tutor:tutor_id(id, display_name, full_name, avatar_url, headline, bio, verification_status), " +
            "sections:course_sections(id, title, position, lessons:course_lessons(id, title, description, duration_minutes, is_free_preview, position))"
        )
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error) throw error;
    return data;
}

/**
 * Fetches all courses for the currently logged-in tutor (includes drafts).
 */
export async function getTutorCourses(tutorId: string) {
    const { data, error } = await supabase
        .from("courses")
        .select(
            "id, title, slug, status, subject, level, price, currency, thumbnail_url, " +
            "created_at, updated_at, " +
            "sections:course_sections(id, lessons:course_lessons(id))"
        )
        .eq("tutor_id", tutorId)
        .order("updated_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

// ─────────────────────────────────────────────
// 8. NOTIFICATIONS
// ─────────────────────────────────────────────

export async function getNotifications(userId: string) {
    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);

    if (error) throw error;
    return data ?? [];
}

export async function markNotificationRead(notificationId: string) {
    const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

    if (error) throw error;
}

export async function markAllNotificationsRead(userId: string) {
    const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

    if (error) throw error;
}

// ─────────────────────────────────────────────
// 9. REVIEWS
// ─────────────────────────────────────────────

/**
 * Fetches all reviews for a tutor (public).
 */
export async function getTutorReviews(tutorId: string) {
    const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, body, created_at, student:student_id(display_name, avatar_url)")
        .eq("tutor_id", tutorId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

/**
 * Submits a review from a student for a tutor.
 * Note: no enrollment check yet — add this once enrollments table exists.
 */
export async function submitReview(params: {
    tutor_id: string;
    student_id: string;
    rating: number;
    body: string;
}) {
    const { error } = await supabase.from("reviews").insert({
        tutor_id: params.tutor_id,
        student_id: params.student_id,
        rating: params.rating,
        body: params.body,
    });

    if (error) throw error;
}

// ─────────────────────────────────────────────
// 10. AVAILABILITY
// ─────────────────────────────────────────────

/**
 * Fetches a tutor's weekly availability slots (public — used on booking page).
 */
export async function getTutorAvailability(tutorId: string) {
    const { data, error } = await supabase
        .from("tutor_availability")
        .select("*")
        .eq("user_id", tutorId)
        .eq("is_blocked", false)
        .order("day_of_week")
        .order("start_hour");

    if (error) throw error;
    return data ?? [];
}

/**
 * Saves tutor availability (replaces all existing slots).
 */
export async function saveTutorAvailability(
    tutorId: string,
    slots: { day_of_week: number; start_hour: number; end_hour: number }[]
) {
    // Delete all existing non-blocked slots first
    const { error: deleteErr } = await supabase
        .from("tutor_availability")
        .delete()
        .eq("user_id", tutorId)
        .eq("is_blocked", false);

    if (deleteErr) throw deleteErr;

    if (slots.length === 0) return;

    const { error: insertErr } = await supabase
        .from("tutor_availability")
        .insert(slots.map((s) => ({ ...s, user_id: tutorId })));

    if (insertErr) throw insertErr;
}