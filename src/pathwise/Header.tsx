import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { VerificationBadge, statusToTier } from "./VerificationBadge";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PWHeader() {
  const { isLoggedIn, user, profile, openLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const [impersonating, setImpersonating] = useState(false);
  const [impersonatingName, setImpersonatingName] = useState('');

  useEffect(() => {
    const imp = localStorage.getItem('impersonating') === 'true';
    const name = localStorage.getItem('impersonating_user_name') || 'User';
    setImpersonating(imp);
    setImpersonatingName(name);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.pageYOffset > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const handleExitImpersonation = async () => {
    try {
      // Retrieve stored admin info and token
      const adminUserId = localStorage.getItem('admin_user_id');
      const adminToken = localStorage.getItem('admin_access_token');
      const adminEmail = localStorage.getItem('admin_email');

      if (!adminUserId || !adminToken) {
        // Fallback: sign out and redirect to admin
        localStorage.removeItem('impersonating');
        localStorage.removeItem('impersonating_user_name');
        localStorage.removeItem('admin_user_id');
        localStorage.removeItem('admin_email');
        localStorage.removeItem('admin_access_token');
        await logout();
        navigate({ to: '/admin' });
        return;
      }

      // Generate magic link for admin using stored admin token
      const response = await fetch('/api/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ userId: adminUserId }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Exit impersonation API error:', text);
        throw new Error('Failed to get admin magic link');
      }

      const { magicLink } = await response.json();
      if (!magicLink) throw new Error('No magic link returned');

      // Clear impersonation state
      localStorage.removeItem('impersonating');
      localStorage.removeItem('impersonating_user_name');
      localStorage.removeItem('admin_user_id');
      localStorage.removeItem('admin_email');
      localStorage.removeItem('admin_access_token');

      // Sign out the impersonated user and redirect to magic link
      await logout();
      window.location.href = magicLink;
    } catch (err: any) {
      console.error('Exit impersonation error:', err);
      toast.error(err.message || 'Failed to exit impersonation');
      // Fallback: sign out and redirect to admin
      await logout();
      localStorage.removeItem('impersonating');
      localStorage.removeItem('impersonating_user_name');
      localStorage.removeItem('admin_user_id');
      localStorage.removeItem('admin_email');
      localStorage.removeItem('admin_access_token');
      navigate({ to: '/admin' });
    }
  };

  return (
    <>
      {impersonating && (
        <div className="sticky top-0 z-50 w-full bg-amber-50 border-b border-amber-300 px-5 py-2 flex items-center justify-between text-sm">
          <span className="text-amber-800">
            🔒 You are impersonating <strong>{impersonatingName}</strong>. Actions will affect their account.
          </span>
          <button
            onClick={handleExitImpersonation}
            className="px-3 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            Exit Impersonation
          </button>
        </div>
      )}

      <header
        className="sticky top-0 z-40 w-full px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3 transition-all duration-200 backdrop-blur-md"
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
                <Link
                  to="/dashboard"
                  className="pw-pill px-3 py-1.5 text-[13px] pw-border-accent text-[var(--pw-accent)] hover:bg-[var(--pw-accent-soft)] transition-colors"
                  activeProps={{ style: { background: "var(--pw-accent-soft)" } }}
                >
                  Dashboard
                </Link>
              )}
              {(user.role === "student" || user.role === "both") && (
                <>
                  <Link to="/roadmap" className="pw-pill px-3 py-1.5 text-[13px] pw-border-accent text-[var(--pw-accent)] hover:bg-[var(--pw-accent-soft)] transition-colors">
                    My Roadmap
                  </Link>
                  <Link to="/find-tutor" className="pw-pill px-3 py-1.5 text-[13px] pw-border text-[var(--pw-ink)] hover:bg-[var(--pw-surface-2)] transition-colors hidden sm:inline-flex">
                    Find a tutor
                  </Link>
                  <Link to="/sessions" className="pw-pill px-3 py-1.5 text-[13px] pw-border text-[var(--pw-ink)] hover:bg-[var(--pw-surface-2)] transition-colors hidden sm:inline-flex">
                    My sessions
                  </Link>
                </>
              )}
              {(user as any).app_metadata?.role === 'admin' && (
                <Link to="/admin" className="pw-pill px-3 py-1.5 text-[13px] pw-border-accent text-[var(--pw-accent)] hover:bg-[var(--pw-accent-soft)] transition-colors">
                  Admin
                </Link>
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
    </>
  );
}