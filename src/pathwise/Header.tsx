import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { useAuth } from "./auth";
import { useDarkMode } from "./DarkMode";
import { VerificationBadge, statusToTier } from "./VerificationBadge";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PWHeader() {
  const { isLoggedIn, user, profile, openLogin, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const [impersonating, setImpersonating] = useState(false);
  const [impersonatingName, setImpersonatingName] = useState('');

  const [waveActive, setWaveActive] = useState(false);
  const [waveOrigin, setWaveOrigin] = useState({ x: 0, y: 0 });
  const [targetTheme, setTargetTheme] = useState<'light' | 'dark'>('light');
  const waveColor = useMemo(() => targetTheme === 'dark' ? '#1F1F1E' : '#FAFAF7', [targetTheme]);

  const readImpersonationState = () => {
    const imp = localStorage.getItem('impersonating') === 'true';
    const name = localStorage.getItem('impersonating_user_name') || 'User';
    setImpersonating(imp);
    setImpersonatingName(name);
  };

  useEffect(() => {
    readImpersonationState();
  }, [location.pathname]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'impersonating' || e.key === 'impersonating_user_name') {
        readImpersonationState();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.pageYOffset > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    if (impersonating) {
      localStorage.removeItem('impersonating');
      localStorage.removeItem('impersonating_user_name');
      localStorage.removeItem('admin_user_id');
      localStorage.removeItem('admin_email');
      localStorage.removeItem('admin_access_token');
    }
    await logout();
    navigate({ to: "/" });
  };

  const handleExitImpersonation = async () => {
    localStorage.removeItem('impersonating');
    localStorage.removeItem('impersonating_user_name');
    localStorage.removeItem('admin_user_id');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_access_token');
    await logout();
    navigate({ to: '/admin' });
  };

  const handleDarkToggle = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setWaveOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setTargetTheme(isDark ? 'light' : 'dark');
    setWaveActive(true);
  };

  return (
    <>
      {/* Impersonation Banner */}
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

      <AnimatePresence>
        {waveActive && (
          <motion.div
            key="wave"
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 200, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: 'fixed',
              top: waveOrigin.y,
              left: waveOrigin.x,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: waveColor,
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            onAnimationComplete={() => {
              toggleTheme(); // switches theme and applies dark/light class
              setWaveActive(false);
            }}
          />
        )}
      </AnimatePresence>

      <header
        className="sticky top-0 z-40 w-full px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3 transition-all duration-200 backdrop-blur-md"
        style={{
          background: scrolled ? "color-mix(in oklab, var(--pw-bg) 95%, transparent)" : "color-mix(in oklab, var(--pw-bg) 70%, transparent)",
          borderBottom: scrolled ? "1px solid var(--pw-border)" : "1px solid transparent",
        }}
      >
        <Link to="/" className="flex items-center gap-3">
          <span className="font-display italic text-[24px] leading-none text-[var(--pw-ink)]">PathWise</span>
          {/* Dark mode toggle – replaces the beta-free pill */}
          <button
            onClick={handleDarkToggle}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] transition-colors hover:bg-[var(--pw-surface-2)] focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
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
                <Link
                  to="/admin"
                  className="pw-pill px-3 py-1.5 text-[13px] pw-border-accent text-[var(--pw-accent)] hover:bg-[var(--pw-accent-soft)] transition-colors"
                >
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