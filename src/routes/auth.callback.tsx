import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { normalizeRole, postAuthDestination } from '@/pathwise/roles';
import {
    applyPendingRole,
    backfillProfileFromOAuth,
    readPendingRole,
    readReturnPath,
} from '@/pathwise/oauth';
import { claimGuestResults } from '@/pathwise/api';

export const Route = createFileRoute('/auth/callback')({
    component: AuthCallback,
});

/**
 * Waits for the session that detectSessionInUrl is establishing from the
 * ?code= in the URL. getSession() already awaits the client's initialize
 * promise, but an onAuthStateChange listener covers the case where the
 * exchange finishes a tick later.
 */
function waitForSession(timeoutMs = 10000) {
    return new Promise<import('@supabase/supabase-js').Session | null>((resolve) => {
        let settled = false;
        const finish = (s: import('@supabase/supabase-js').Session | null) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            sub.subscription.unsubscribe();
            resolve(s);
        };

        const sub = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) finish(session);
        }).data;

        const timer = setTimeout(() => finish(null), timeoutMs);

        void supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) finish(session);
        });
    });
}

function AuthCallback() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('Completing sign-in…');

    useEffect(() => {
        let cancelled = false;

        const handleCallback = async () => {
            const params = new URLSearchParams(window.location.search);

            // The provider can decline before we ever get a session — e.g. the
            // user closed Google's chooser, or the app isn't authorised.
            const oauthError = params.get('error_description') || params.get('error');
            if (oauthError) {
                toast.error(decodeURIComponent(oauthError));
                navigate({ to: '/' });
                return;
            }

            try {
                const session = await waitForSession();
                if (cancelled) return;

                if (!session?.user) {
                    toast.error("We couldn't complete that sign-in. Please try again.");
                    navigate({ to: '/' });
                    return;
                }

                const user = session.user;

                // Google gives us a real name and avatar the DB trigger never saw.
                setMessage('Setting up your account…');
                await backfillProfileFromOAuth(user.id, user.user_metadata ?? {});

                // Carry over anything created before signing in.
                await claimGuestResults();

                // Apply the role picked before the redirect, if the profile
                // has none yet (the RPC won't overwrite an existing role).
                const pendingRole = readPendingRole();
                if (pendingRole) await applyPendingRole(pendingRole);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, onboarding_completed')
                    .eq('id', user.id)
                    .maybeSingle();

                if (cancelled) return;

                const role = normalizeRole(profile?.role);

                // A first-time Google user has no role, and every RoleGate
                // rejects a null role — so send them to pick one rather than
                // dropping them on a home page they can't act on.
                if (!role) {
                    navigate({ to: '/auth/choose-role' });
                    return;
                }

                toast.success('Signed in successfully!');

                // Honour an explicit return path (e.g. mid-roadmap sign-in),
                // otherwise use the role-correct destination.
                const returnPath = readReturnPath();
                const dest = returnPath ?? postAuthDestination(role, profile?.onboarding_completed);
                navigate({ to: dest });
            } catch (err) {
                if (cancelled) return;
                const msg = err instanceof Error ? err.message : 'Authentication failed';
                toast.error(msg);
                navigate({ to: '/' });
            }
        };

        void handleCallback();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[var(--pw-bg)] flex items-center justify-center px-6">
            <div className="text-center">
                <div className="relative w-12 h-12 mx-auto">
                    <svg
                        viewBox="0 0 50 50"
                        className="w-full h-full animate-spin"
                        style={{ animationDuration: '1.2s' }}
                        aria-hidden="true"
                    >
                        <circle cx="25" cy="25" r="20" stroke="var(--pw-surface-2)" strokeWidth="4" fill="none" />
                        <circle
                            cx="25"
                            cy="25"
                            r="20"
                            stroke="var(--pw-accent)"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray="125"
                            strokeDashoffset="80"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                <p className="mt-6 text-[0.875rem] text-[var(--pw-ink-2)]" role="status" aria-live="polite">
                    {message}
                </p>
            </div>
        </div>
    );
}
