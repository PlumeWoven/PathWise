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
                // Supabase handles the confirmation via the URL hash
                // We just need to check if the user is now confirmed
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error) throw error;

                if (user?.confirmed_at) {
                    setStatus('success');
                    toast.success('Email confirmed!');

                    // Redirect after 2 seconds
                    setTimeout(async () => {
                        // Check if user has completed onboarding
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('onboarding_completed, role')
                            .eq('id', user.id)
                            .single();

                        if (profile?.onboarding_completed) {
                            navigate({ to: profile.role === 'tutor' ? '/dashboard' : '/roadmap' });
                        } else {
                            navigate({ to: profile?.role === 'tutor' ? '/onboarding/tutor' : '/onboarding/student' });
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