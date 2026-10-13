import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDemo } from "./DemoContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function ExitDemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { capturedEmail, captureEmail } = useDemo();
  const [email, setEmail] = useState(capturedEmail ?? "");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Enter an email address, like you@example.com.");
      return;
    }
    setError("");
    captureEmail(email);
    toast.success("Welcome to Pathwise!", { description: "Setting up your account…" });
    onClose();
    navigate({ to: "/dashboard" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="pw-card block w-[calc(100%-2rem)] max-w-md p-8 border-[var(--pw-border)] shadow-pw-float">
        <div className="label-caps text-pw-accent">Ready for the real thing?</div>
        <DialogTitle className="mt-2 font-display font-bold uppercase tracking-[-0.025em] text-[1.625rem] leading-none">
          Start your own journey
        </DialogTitle>
        <DialogDescription className="mt-2 text-[0.8125rem] text-[var(--pw-ink-2)]">
          Create your free account to keep your courses, students and earnings — for real this time.
        </DialogDescription>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="email"
            aria-label="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="pw-input text-[0.875rem]"
          />
          {error && (
            <div role="alert" className="text-[0.75rem]" style={{ color: "var(--pw-danger)" }}>
              {error}
            </div>
          )}
          <button type="submit" className="pw-btn-primary w-full px-6 py-4">
            Create my free account →
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[0.8125rem] font-semibold block w-full text-center text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] transition-colors py-2"
          >
            Keep exploring the demo
          </button>
        </form>
        <p className="mt-4 text-[0.6875rem] text-[var(--pw-ink-2)] text-center">
          No credit card · Cancel anytime
        </p>
      </DialogContent>
    </Dialog>
  );
}
