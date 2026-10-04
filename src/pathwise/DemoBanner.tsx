import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

export function DemoBanner() {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setHidden(localStorage.getItem("pw-demo-banner-hidden") === "1");
  }, []);
  if (hidden) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 pw-card p-3 shadow-pw-float border border-[var(--pw-border)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-w-[21.25rem] sm:p-4">
      <div className="flex items-start gap-3">
        <Icon name="film" className="hidden h-6 w-6 sm:block" />
        <div className="flex-1">
          <div className="font-display text-[0.9375rem] leading-tight">
            Want to see how Pathwise works?
          </div>
          <p className="mt-1 hidden text-[0.75rem] text-[var(--pw-ink-2)] sm:block">
            No signup. Explore the full tutor & student experience with sample data.
          </p>
          <div className="mt-2 flex gap-2 sm:mt-3">
            <Link to="/pathwise/demo" className="pw-btn-primary px-3 py-1.5">
              Try Demo Mode →
            </Link>
            <button
              onClick={() => {
                localStorage.setItem("pw-demo-banner-hidden", "1");
                setHidden(true);
              }}
              className="label-caps text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] transition-colors px-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
