import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
                    const metaRole = metadata.role;

                    // Fetch profile
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role, onboarding_completed')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (profileError) throw profileError;

                    const role = profile?.role || metaRole || 'student';
                    const displayName = metadata.display_name || metadata.full_name || user.email?.split('@')[0] || 'Learner';
                    const fullName = metadata.full_name || metadata.display_name || user.email?.split('@')[0] || 'Learner';

                    // If profile doesn't exist or role mismatch, upsert
                    if (!profile || profile.role !== metaRole) {
                        await supabase.from('profiles').upsert({
                            id: user.id,
                            role: metaRole || 'student',
                            display_name: displayName,
                            full_name: fullName,
                        }, { onConflict: 'id' });
                    }

                    // Wait a moment, then redirect
                    setTimeout(() => {
                        if (profile?.onboarding_completed) {
                            navigate({ to: role === 'tutor' ? '/dashboard' : '/roadmap' });
                        } else {
                            navigate({ to: role === 'tutor' ? '/onboarding/tutor' : '/onboarding/student' });
                        }
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