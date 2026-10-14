import { useAuth } from "./auth";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

// Opens the real sign-up. It used to save the email to localStorage and toast
// "Setting up your account…" without creating one.
export function ExitDemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openLogin } = useAuth();

  const signUp = () => {
    onClose();
    openLogin();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="pw-card block w-[calc(100%-2rem)] max-w-md p-8 border-[var(--pw-border)] shadow-pw-float">
        <DialogTitle className="font-display font-bold uppercase tracking-[-0.025em] text-[1.625rem] leading-none">
          Create your account
        </DialogTitle>
        <DialogDescription className="mt-2 text-[0.8125rem] text-[var(--pw-ink-2)]">
          Demo data isn't kept. Your account starts empty.
        </DialogDescription>
        <div className="mt-6 space-y-4">
          <button type="button" onClick={signUp} className="pw-btn-primary w-full px-6 py-4">
            Sign up free
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[0.8125rem] font-semibold block w-full text-center text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] transition-colors py-2"
          >
            Keep exploring the demo
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
