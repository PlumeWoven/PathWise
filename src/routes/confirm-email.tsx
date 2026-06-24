import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { normalizeRole, postAuthDestination } from '@/pathwise/roles';
import { PWHeader } from '../pathwise/Header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const Route = createFileRoute('/confirm-email')({
    component: ConfirmEmailPage,
});

function ConfirmEmailPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleConfirmation = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;
                if (!user) throw new Error('No user found');

                if (user.confirmed_at) {
                    setStatus('success');
                    toast.success('Email confirmed!');

                    // Get user_metadata (includes role from signup)
                    const metadata = user.user_metadata || {};
                    const metaRole = (metadata.role as string | undefined) || undefined;

                    // Fetch profile
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role, onboarding_completed, display_name, full_name')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (profileError) throw profileError;

                    const displayName = metadata.display_name || metadata.full_name || user.email?.split('@')[0] || 'Learner';
                    const fullName = metadata.full_name || metadata.display_name || user.email?.split('@')[0] || 'Learner';

                    // Names are safe to repair (no semantic ownership concern).
                    // Only write fields that are currently missing on the profile.
                    const namePatch: { display_name?: string; full_name?: string } = {};
                    if (!profile?.display_name) namePatch.display_name = displayName;
                    if (!profile?.full_name) namePatch.full_name = fullName;
                    if (Object.keys(namePatch).length > 0) {
                        await supabase.from('profiles').update(namePatch).eq('id', user.id);
                    }

                    // Role repair: ONLY when the row is missing a role. Never
                    // overwrite a role that has already been set. Falls back to
                    // user_metadata.role from the signup payload.
                    let role = normalizeRole(profile?.role);
                    if (!role && metaRole) {
                        // Cast through any until generated types include the new RPC.
                        const { error: rpcErr } = await (supabase.rpc as any)('set_profile_role', {
                            target_role: metaRole,
                        });
                        if (rpcErr && !/already set/i.test(rpcErr.message)) {
                            console.warn('[confirm-email] set_profile_role', rpcErr);
                        } else {
                            role = normalizeRole(metaRole);
                        }
                    }

                    // Wait a moment, then redirect via the single role-correct
                    // helper (handles tutor/both/student/unknown + onboarding).
                    setTimeout(() => {
                        navigate({ to: postAuthDestination(role, profile?.onboarding_completed) });
                    }, 2000);

                } else {
                    setStatus('error');
                    setErrorMessage('Email confirmation failed. Please try again.');
                }
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.message || 'Confirmation failed');
            }
        };

        handleConfirmation();
    }, [navigate]);

    const handleResend = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) throw new Error('No email found');
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });
            if (error) throw error;
            toast.success('Confirmation email resent!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to resend');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
            <PWHeader />
            <main className="flex items-center justify-center px-5 py-24">
                <div className="max-w-md w-full pw-card p-8 text-center">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="size-12 animate-spin mx-auto text-[var(--pw-accent)]" />
                            <h1 className="font-display text-2xl mt-4">Confirming your email...</h1>
                            <p className="text-[var(--pw-ink-2)] mt-2">Please wait a moment</p>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <CheckCircle className="size-16 mx-auto text-[var(--pw-accent-2)]" />
                            <h1 className="font-display text-2xl mt-4">Email Confirmed!</h1>
                            <p className="text-[var(--pw-ink-2)] mt-2">Your email has been verified. Redirecting you now...</p>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <XCircle className="size-16 mx-auto text-[var(--pw-danger)]" />
                            <h1 className="font-display text-2xl mt-4">Confirmation Failed</h1>
                            <p className="text-[var(--pw-ink-2)] mt-2">{errorMessage || 'Something went wrong.'}</p>
                            <div className="flex flex-col gap-2 mt-6">
                                <Button onClick={() => navigate({ to: '/' })}>Go Home</Button>
                                <Button variant="outline" onClick={handleResend}>Resend Email</Button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}