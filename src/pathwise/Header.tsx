import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { VerificationBadge, statusToTier } from "./VerificationBadge";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function PWHeader() {
  const { isLoggedIn, user, profile, openLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.pageYOffset > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header
      className="sticky top-0 z-50 w-full px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3 transition-all duration-200 backdrop-blur-md"
      style={{
        background: scrolled ? "color-mix(in oklab, var(--pw-bg) 95%, transparent)" : "color-mix(in oklab, var(--pw-bg) 70%, transparent)",
        borderBottom: scrolled ? "1px solid var(--pw-border)" : "1px solid transparent",
      }}
    >
      <Link to="/" className="flex items-center gap-3">
        <span className="font-display italic text-[24px] leading-none text-[var(--pw-ink)]">PathWise</span>
        <span className="pw-pill text-[11px] px-2.5 py-1 pw-border-accent text-[var(--pw-accent)] uppercase pw-tracking-wide">Beta — Free</span>
      </Link>

      <div className="flex items-center gap-3">
        {isLoggedIn && user ? (
          <>
            <span className="hidden sm:inline text-[13px] text-[var(--pw-ink-2)]">{user.name}</span>
            <NotificationBell userId={user.id} />
            {(user.role === "tutor" || user.role === "both") && profile ? (
              <VerificationBadge tier={statusToTier(profile.verification_status)} size="sm" />
            ) : (
              <span className="pw-pill text-[11px] px-2.5 py-1 pw-border text-[var(--pw-ink-2)] uppercase pw-tracking-wide">
                {user.role}
              </span>
            )}
            {(user.role === "tutor" || user.role === "both") && (
              <>
                <Link
                  to="/dashboard"
                  className="pw-pill px-3 py-1.5 text-[13px] pw-border-accent text-[var(--pw-accent)] hover:bg-[var(--pw-accent-soft)] transition-colors"
                  activeProps={{ style: { background: "var(--pw-accent-soft)" } }}
                >
                  Dashboard
                </Link>
              </>
            )}
            {(user.role === "student" || user.role === "both") && (
              <>
                <Link
                  to="/roadmap"
                  className="pw-pill px-3 py-1.5 text-[13px] pw-border-accent text-[var(--pw-accent)] hover:bg-[var(--pw-accent-soft)] transition-colors"
                >
                  My Roadmap
                </Link>
                <Link
                  to="/find-tutor"
                  className="pw-pill px-3 py-1.5 text-[13px] pw-border text-[var(--pw-ink)] hover:bg-[var(--pw-surface-2)] transition-colors hidden sm:inline-flex"
                >
                  Find a tutor
                </Link>
                <Link
                  to="/sessions"
                  className="pw-pill px-3 py-1.5 text-[13px] pw-border text-[var(--pw-ink)] hover:bg-[var(--pw-surface-2)] transition-colors hidden sm:inline-flex"
                >
                  My sessions
                </Link>
              </>
            )}
            <button
              onClick={handleSignOut}
              className="text-[13px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] underline-offset-4 hover:underline"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={openLogin}
            className="pw-pill px-4 py-1.5 text-[14px] pw-border text-[var(--pw-ink)] hover:bg-[var(--pw-surface-2)] transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}