import { supabase } from "@/integrations/supabase/client";

/**
 * If user is not authenticated, store the roadmap ID and redirect to sign-in.
 * Returns true if authenticated (proceed with action), false if redirecting.
 */
export async function requireAuth(roadmapId?: string): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) return true;

    // Store the roadmap ID to claim after sign-in
    if (roadmapId) {
        console.log('[authGuard] Storing roadmap ID for claim:', roadmapId);
        localStorage.setItem('pendingRoadmapId', roadmapId);
    }

    // Redirect to sign-in with return URL and claim ID
    const returnUrl = roadmapId
        ? `/roadmap/${roadmapId}`
        : window.location.pathname;

    console.log('[authGuard] Redirecting to sign-in for roadmap:', roadmapId);
    window.location.href = `/sign-in?redirect=${encodeURIComponent(returnUrl)}&claim=${roadmapId || ''}`;
    return false;
}
