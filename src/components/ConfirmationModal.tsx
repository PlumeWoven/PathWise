import { useEffect, useState } from "react";
import { CheckCircle, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  isConfirmed: boolean;
  onResend: () => Promise<void>;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  email,
  isConfirmed,
  onResend,
}: ConfirmationModalProps) {
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
        className="sm:max-w-md pw-card shadow-pw-float"
        style={{
          background: "var(--pw-surface)",
          color: "var(--pw-ink)",
          border: "1px solid var(--pw-border)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display font-bold uppercase tracking-[-0.025em] text-[var(--pw-ink)]">
            {isConfirmed ? (
              <>
                <CheckCircle className="size-5 text-[var(--pw-accent-2)]" />
                Email confirmed
              </>
            ) : (
              <>
                <Mail className="size-5 text-[var(--pw-accent)]" />
                Confirm your email
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-[var(--pw-ink-2)]">
            {isConfirmed
              ? "Your email has been verified. Redirecting you to your dashboard..."
              : `We've sent a confirmation link to ${email}. Click it to get started.`}
          </DialogDescription>
        </DialogHeader>
        {/* The title already carries the icon; the pulsing icon-in-a-circle repeated it. */}
        {!isConfirmed && (
          <div>
            <p className="text-sm text-[var(--pw-ink-2)]">
              Check your inbox and spam folder. The link expires in 24 hours.
            </p>
            <Button variant="outline" onClick={handleResend} disabled={resending} className="mt-4">
              <RefreshCw className={`size-4 mr-2 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Sending..." : "Resend email"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
