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
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="pw-card max-w-md w-full p-7 relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-demo-title"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)]"
        >×</button>
        <div className="font-mono-pw text-[10px] uppercase tracking-wider text-[var(--pw-accent)]">Ready for the real thing?</div>
        <h2 id="exit-demo-title" className="mt-1 font-display text-[26px] leading-tight">Start your own journey</h2>
        <p className="mt-2 text-[13px] text-[var(--pw-ink-2)]">
          Create your free account to keep your courses, students and earnings — for real this time.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
            className="w-full px-4 py-3 rounded-lg border border-[var(--pw-border)] bg-[var(--pw-surface)] text-[14px] focus:outline-none focus:border-[var(--pw-accent)]"
          />
          <button type="submit" className="pw-btn-primary w-full px-5 py-3 text-[14px] font-medium">
            Create my free account →
          </button>
          <button type="button" onClick={onClose} className="block w-full text-center text-[12px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] py-1">
            Keep exploring the demo
          </button>
        </form>
        <p className="mt-3 text-[11px] text-[var(--pw-ink-2)] text-center">No credit card · Cancel anytime</p>
      </div>
    </div>
  );
}
