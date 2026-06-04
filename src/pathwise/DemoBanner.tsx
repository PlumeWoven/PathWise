import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function DemoBanner() {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setHidden(localStorage.getItem("pw-demo-banner-hidden") === "1");
  }, []);
  if (hidden) return null;
  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-[340px] pw-card p-4 shadow-2xl border border-[var(--pw-border)] backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🎬</div>
        <div className="flex-1">
          <div className="font-display text-[15px] leading-tight">Want to see how Pathwise works?</div>
          <p className="mt-1 text-[12px] text-[var(--pw-ink-2)]">No signup. Explore the full tutor & student experience with sample data.</p>
          <div className="mt-3 flex gap-2">
            <Link to="/pathwise/demo" className="pw-btn-primary text-[12px] px-3 py-1.5">Try Demo Mode →</Link>
            <button
              onClick={() => { localStorage.setItem("pw-demo-banner-hidden", "1"); setHidden(true); }}
              className="text-[12px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] px-2"
            >Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  );
}
