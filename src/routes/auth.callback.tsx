import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { normalizeRole, postAuthDestination } from '@/pathwise/roles';

export const Route = createFileRoute('/auth/callback')({
    component: AuthCallback,
});

function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase automatically handles the magic link exchange
                // We just need to wait for the session to be set
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;
                if (user) {
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