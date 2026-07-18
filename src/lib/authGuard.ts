import { supabase } from "@/integrations/supabase/client";

/**
 * If user is not authenticated (no user ID), store the roadmap ID and open the login modal.
 * Returns true if authenticated (proceed with action), false if opening modal.
 */
export async function requireAuth(roadmapId?: string): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();

    // Check if user has a valid user ID (not anonymous)
    const userId = session?.user?.id;
    if (userId) return true;

    // Store the roadmap ID to claim after sign-in
    if (roadmapId) {
        console.log('[authGuard] Storing roadmap ID for claim:', roadmapId);
        localStorage.setItem('pathwise_roadmap_id', roadmapId);
    }

    // Open the login modal instead of redirecting to a page
    console.log('[authGuard] Opening login modal for roadmap:', roadmapId);
    window.dispatchEvent(new CustomEvent('open-login-modal', { detail: { roadmapId } }));
    return false;
}
