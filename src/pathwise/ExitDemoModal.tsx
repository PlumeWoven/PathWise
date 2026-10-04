import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDemo } from "./DemoContext";
import { toast } from "sonner";

export function ExitDemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { capturedEmail, captureEmail } = useDemo();
  const [email, setEmail] = useState(capturedEmail ?? "");
  const navigate = useNavigate();

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    captureEmail(email);
    toast.success("Welcome to Pathwise!", { description: "Setting up your account…" });
    onClose();
    navigate({ to: "/dashboard" });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-[rgba(10,12,14,0.7)] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="pw-card max-w-md w-full p-7 relative shadow-pw-float"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-demo-title"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 hover:bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] transition-colors"
        >
          ×
        </button>
        <div className="label-caps text-pw-accent">Ready for the real thing?</div>
        <h2
          id="exit-demo-title"
          className="mt-1 font-display font-bold uppercase tracking-[-0.025em] text-[1.625rem] leading-none"
        >
          Start your own journey
        </h2>
        <p className="mt-2 text-[0.8125rem] text-[var(--pw-ink-2)]">
          Create your free account to keep your courses, students and earnings — for real this time.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
            className="pw-input text-[0.875rem]"
          />
          <button type="submit" className="pw-btn-primary w-full px-5 py-3">
            Create my free account →
          </button>
          <button
            type="button"
            onClick={onClose}
            className="label-caps block w-full text-center text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] transition-colors py-1"
          >
            Keep exploring the demo
          </button>
        </form>
        <p className="mt-3 text-[0.6875rem] text-[var(--pw-ink-2)] text-center">
          No credit card · Cancel anytime
        </p>
      </div>
    </div>
  );
}
