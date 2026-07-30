import { supabase } from "@/integrations/supabase/client";

/**
 * Claim an anonymous roadmap for the currently signed-in user.
 * Called automatically after sign-in if a pending roadmap ID exists.
 * 
 * This function:
 * 1. Reads pathwise_roadmap_id from localStorage
 * 2. Updates the roadmap row to set user_id = auth.uid()
 * 3. Removes the localStorage key
 * 4. Returns true on success, false if nothing to claim
 */
export async function claimRoadmapForUser(userId: string): Promise<boolean> {
    const pendingId = localStorage.getItem('pathwise_roadmap_id');
    if (!pendingId) {
        console.log('[claimRoadmap] No pending roadmap ID in localStorage');
        return false;
    }

    console.log('[claimRoadmap] Claiming roadmap:', pendingId, 'for user:', userId);

    try {
        const { error } = await supabase
            .from('roadmaps')
            .update({ user_id: userId })
            .eq('id', pendingId)
            .is('user_id', null); // Only claim if not already claimed

        if (error) {
            console.error('[claimRoadmap] Failed to claim roadmap:', error.message);
            return false;
        }

        // Success — remove the pending key
        localStorage.removeItem('pathwise_roadmap_id');
        console.log('[claimRoadmap] Roadmap claimed successfully for user:', userId);
        return true;
    } catch (err) {
        console.error('[claimRoadmap] Error claiming roadmap:', err);
        return false;
    }
}