import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { isAdmin } from "./roles";
import { VerificationBadge, statusToTier } from "./VerificationBadge";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icon } from "@/components/Icon";

// Class strings per look. Markup is shared; only these swap. PW is theme-aware (--pw-* tokens);
// QED is the always-dark landing look (fixed qed-* tokens).
const pwCta =
  "label-caps inline-flex items-center border border-[var(--pw-border)] px-3 sm:px-4 py-2 text-[var(--pw-ink)] hover:bg-[var(--pw-ink)] hover:text-[var(--pw-bg)] transition-colors";
const PW = {
  brand:
    "font-syne text-[0.9375rem] font-bold uppercase leading-none text-[var(--pw-ink)] after:content-['.'] after:text-pw-accent",
  name: "hidden sm:inline text-[0.8125rem] text-[var(--pw-ink-2)]",
  role: "label-caps inline-flex items-center rounded-full border border-[var(--pw-border)] px-2.5 py-1 text-[var(--pw-ink-2)]",
  accent: pwCta,
  link: "label-caps px-1 py-2 text-[var(--pw-ink-2)] hover:text-pw-accent transition-colors",
  signOut: "label-caps text-[var(--pw-ink-2)] hover:text-pw-accent transition-colors",
  signIn: pwCta,
};
// Landing ("/") is always dark. `dark` on the header re-scopes --pw-* tokens so ThemeToggle,
// NotificationBell and VerificationBadge (which read them) stay legible on the dark bar.
const cta =
  "label-caps inline-flex items-center border border-qed-hairline px-3 sm:px-4 py-2 text-qed-ink hover:bg-qed-ink hover:text-qed-ground transition-colors";
const QED = {
  header:
    "dark sticky top-0 z-40 w-full h-[3.625rem] px-5 sm:px-8 flex items-center justify-between gap-3 border-b border-qed-hairline bg-qed-ground",
  brand:
    "font-syne text-[0.9375rem] font-bold uppercase leading-none text-qed-ink after:content-['.'] after:text-qed-amber",
  name: "hidden sm:inline text-[0.8125rem] text-qed-ink-2",
  role: "label-caps inline-flex items-center rounded-full border border-qed-hairline px-2.5 py-1 text-qed-ink-2",
  accent: cta,
  link: "label-caps px-1 py-2 text-qed-ink-2 hover:text-qed-amber transition-colors",
  signOut: "label-caps text-qed-ink-2 hover:text-qed-amber transition-colors",
  signIn: cta,
};

export function PWHeader() {
  const { isLoggedIn, user, profile, openLogin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const qed = location.pathname === "/";
  const c = qed ? QED : PW;
  // Starts false so the first render matches the server. Reading pageYOffset here
  // instead would mismatch on hydration: browsers restore scroll position before
  // React runs, so a deep link or mid-page refresh renders `true` on the client
  // against the server's `false`. The real position is adopted on mount below.
  const [scrolled, setScrolled] = useState(false);

  const [impersonating, setImpersonating] = useState(false);
  const [impersonatingName, setImpersonatingName] = useState("");

  const readImpersonationState = () => {
    const imp = localStorage.getItem("impersonating") === "true";
    const name = localStorage.getItem("impersonating_user_name") || "User";
    setImpersonating(imp);
    setImpersonatingName(name);
  };

  useEffect(() => {
    readImpersonationState();
  }, [location.pathname]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "impersonating" || e.key === "impersonating_user_name") {
        readImpersonationState();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.pageYOffset > 10);
    onScroll(); // pick up a scroll position the browser restored before hydration
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    if (impersonating) {
      localStorage.removeItem("impersonating");
      localStorage.removeItem("impersonating_user_name");
      localStorage.removeItem("admin_user_id");
      localStorage.removeItem("admin_email");
      localStorage.removeItem("admin_access_token");
    }
    await logout();
    navigate({ to: "/" });
  };

  const handleExitImpersonation = async () => {
    localStorage.removeItem("impersonating");
    localStorage.removeItem("impersonating_user_name");
    localStorage.removeItem("admin_user_id");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_access_token");
    await logout();
    navigate({ to: "/admin" });
  };

  return (
    <>
      {/* Impersonation Banner */}
      {impersonating && (
        <div className="sticky top-0 z-50 w-full bg-[var(--pw-accent-soft)] border-b border-[var(--pw-border)] px-5 py-2 flex items-center justify-between text-sm impersonation-banner">
          <span className="text-pw-accent inline-flex items-center gap-1.5">
            <Icon name="lock" className="h-4 w-4" />
            <span>
              You are impersonating <strong>{impersonatingName}</strong>. Actions will affect their
              account.
            </span>
          </span>
          <button
            onClick={handleExitImpersonation}
            className="label-caps px-3 py-1 bg-pw-accent-fill text-pw-on-accent hover:bg-[var(--pw-ink)] hover:text-[var(--pw-bg)] transition-colors"
          >
            Exit Impersonation
          </button>
        </div>
      )}

      <header
        className={
          qed
            ? QED.header
            : `sticky top-0 z-40 w-full h-[3.625rem] px-5 sm:px-8 flex items-center justify-between gap-3 border-b border-[var(--pw-border)] ${
                scrolled ? "bg-[var(--pw-bg)]/95 backdrop-blur-md" : "bg-[var(--pw-bg)]"
              }`
        }
      >
        <div className="flex items-center gap-3">
          <Link to="/" className={c.brand}>
            PathWise
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn && user ? (
            <>
              <span className={c.name}>{user.name}</span>
              <NotificationBell userId={user.id} />
              {(user.role === "tutor" || user.role === "both") && profile ? (
                <VerificationBadge tier={statusToTier(profile.verification_status)} size="sm" />
              ) : (
                <span className={c.role}>{user.role}</span>
              )}
              {(user.role === "tutor" || user.role === "both") && (
                <Link
                  to="/dashboard"
                  className={c.accent}
                  activeProps={{ style: { background: "var(--pw-accent-soft)" } }}
                >
                  Dashboard
                </Link>
              )}
              {(user.role === "student" || user.role === "both") && (
                <>
                  <Link to="/roadmap" className={c.accent}>
                    My Roadmap
                  </Link>
                  <Link to="/find-tutor" className={`${c.link} hidden sm:inline-flex`}>
                    Find a tutor
                  </Link>
                  <Link to="/sessions" className={`${c.link} hidden sm:inline-flex`}>
                    My sessions
                  </Link>
                </>
              )}
              {isAdmin(user.app_metadata) && (
                <Link to="/admin" className={c.accent}>
                  Admin
                </Link>
              )}
              <button onClick={handleSignOut} className={c.signOut}>
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={openLogin} className={c.signIn}>
              Sign In
            </button>
          )}
        </div>
      </header>
    </>
  );
}
