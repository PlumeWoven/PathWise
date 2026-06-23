import { useEffect, useState } from 'react';
import { CheckCircle, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    email: string;
    isConfirmed: boolean;
    onResend: () => Promise<void>;
}

export function ConfirmationModal({ open, onOpenChange, email, isConfirmed, onResend }: ConfirmationModalProps) {
    const [resending, setResending] = useState(false);

    const handleResend = async () => {
        setResending(true);
        try {
            await onResend();
        } finally {
            setResending(false);
        }
    };

    useEffect(() => {
        if (isConfirmed && open) {
            const timer = setTimeout(() => {
                onOpenChange(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isConfirmed, open, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md pw-card"
                style={{
                    background: 'var(--pw-surface)',
                    color: 'var(--pw-ink)',
                    border: '1px solid var(--pw-border)',
                }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[var(--pw-ink)]">
                        {isConfirmed ? (
                            <>
                                <CheckCircle className="size-5 text-[var(--pw-accent-2)]" />
                                Email Confirmed!
                            </>
                        ) : (
                            <>
                                <Mail className="size-5 text-[var(--pw-accent)]" />
                                Confirm Your Email
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-[var(--pw-ink-2)]">
                        {isConfirmed
                            ? 'Your email has been verified. Redirecting you to your dashboard...'
                            : `We've sent a confirmation link to ${email}. Click it to get started.`
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center py-6">
                    {isConfirmed ? (
                        <div className="w-16 h-16 rounded-full bg-[var(--pw-accent-soft)] flex items-center justify-center">
                            <CheckCircle className="size-10 text-[var(--pw-accent-2)]" />
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-full bg-[var(--pw-accent-soft)] flex items-center justify-center animate-pulse">
                                <Mail className="size-8 text-[var(--pw-accent)]" />
                            </div>
                            <p className="text-sm text-[var(--pw-ink-2)] mt-4 text-center max-w-sm">
                                Check your inbox and spam folder. The link expires in 24 hours.
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleResend}
                                disabled={resending}
                                className="mt-4"
                                style={{
                                    color: 'var(--pw-accent)',
                                    borderColor: 'var(--pw-border)',
                                    background: 'transparent',
                                }}
                            >
                                <RefreshCw className={`size-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                                {resending ? 'Sending...' : 'Resend email'}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}