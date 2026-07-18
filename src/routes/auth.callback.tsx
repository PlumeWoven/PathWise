import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { normalizeRole, postAuthDestination } from '@/pathwise/roles';

export const Route = createFileRoute('/auth/callback')({
    component: AuthCallback,
});

async function claimPendingRoadmap(userId: string): Promise<void> {
    console.log('[claim] Starting claim process for user:', userId);
    // Check URL params first, then localStorage
    const params = new URLSearchParams(window.location.search);
    const claimId = params.get('claim') || localStorage.getItem('pendingRoadmapId');

    console.log('[claim] Claim ID from URL:', params.get('claim'));
    console.log('[claim] Claim ID from localStorage:', localStorage.getItem('pendingRoadmapId'));

    if (!claimId) {
        console.log('[claim] No claim ID found, skipping');
        return;
    }

    try {
        console.log('[claim] Claiming roadmap with ID:', claimId);
        // 1. Claim the roadmap: update user_id from NULL to the authenticated user
        const { data: roadmap, error: roadmapError } = await supabase
            .from('roadmaps')
            .update({ user_id: userId })
            .eq('id', claimId)
            .is('user_id', null)  // Only claim if still anonymous
            .select('subject, created_at')
            .single();

        if (roadmapError) {
            console.error('[claim] Failed to claim roadmap:', roadmapError);
            localStorage.removeItem('pendingRoadmapId');
            return;
        }

        console.log('[claim] Roadmap claimed successfully:', roadmap);

        // 2. Claim the matching diagnostic result (same subject, NULL user_id, within last 5 minutes)
        if (roadmap && roadmap.subject) {
            console.log('[claim] Claiming diagnostic results for subject:', roadmap.subject);
            const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { error: diagError } = await supabase
                .from('diagnostic_results')
                .update({ user_id: userId })
                .eq('subject', roadmap.subject)
                .is('user_id', null)
                .gte('created_at', fiveMinAgo);

            if (diagError) {
                console.error('[claim] Failed to claim diagnostic results:', diagError);
            } else {
                console.log('[claim] Diagnostic results claimed successfully');
            }
        }

        // 3. Clean up
        localStorage.removeItem('pendingRoadmapId');
        console.log('[claim] Claim process completed successfully');
    } catch (err) {
        console.error('[claim] Error claiming roadmap:', err);
    }
}

function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const handleCallback = async () => {
            try {
                // Supabase automatically handles the magic link exchange
                // We just need to wait for the session to be set
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;
                if (user) {
                    // Claim any pending anonymous roadmap
                    const claimId = params.get('claim') || localStorage.getItem('pendingRoadmapId');
                    if (claimId) {
                        await claimPendingRoadmap(claimId);
                    }

                    toast.success('Signed in successfully!');
                    // Redirect to the role-correct destination (tutor/both/
                    // student/unknown + onboarding state) via the single helper.
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role, onboarding_completed')
                        .eq('id', user.id)
                        .maybeSingle();
                    navigate({
                        to: postAuthDestination(
                            normalizeRole(profile?.role),
                            profile?.onboarding_completed,
                        ),
                    });
                } else {
                    toast.error('No user found');
                    navigate({ to: '/' });
                }
            } catch (err: any) {
                toast.error(err.message || 'Authentication failed');
                navigate({ to: '/' });
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[var(--pw-bg)] flex items-center justify-center">
            <div className="text-center text-[var(--pw-ink-2)]">Processing sign-in...</div>
        </div>
    );
}