import { supabase } from '@/integrations/supabase/client';

/**
 * Check if user is authenticated. If not, store the roadmap ID and open login modal.
 * Returns true if authenticated, false if modal was opened.
 *
 * IMPORTANT: This function uses supabase.auth.getSession() directly,
 * NOT the useAuth() hook. Hooks cannot be called outside React components.
 */
export async function requireAuth(roadmapId?: string): Promise<boolean> {
    // Get session directly from Supabase — NOT from a React hook
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // User is authenticated — proceed with the action
    if (userId) return true;

    // User is not authenticated — store roadmap ID for later claim
    if (roadmapId) {
        localStorage.setItem('pathwise_roadmap_id', roadmapId);
        console.log('[authGuard] Stored roadmap ID for claim:', roadmapId);
    }

    // Open the login modal — same as clicking "Sign Up" in the header
    console.log('[authGuard] Opening login modal for roadmap:', roadmapId);
    window.dispatchEvent(new CustomEvent('open-login-modal'));

    return false;
}