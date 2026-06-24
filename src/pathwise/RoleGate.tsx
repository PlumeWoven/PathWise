import { ReactNode, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useAuth, type Role } from "./auth";
import { canAccess, isTutorSide, roleHome } from "./roles";
import { PWHeader } from "./Header";

/**
 * Restricts a route to specific roles.
 * - Anonymous users: allowed if `allowAnonymous` is true (default false → opens login).
 * - Logged-in users with disallowed role: shown a friendly switch-screen.
 */
export function RoleGate({
  allow,
  allowAnonymous = false,
  children,
}: {
  allow: Role[];
  allowAnonymous?: boolean;
  children: ReactNode;
}) {
  const { loading, isLoggedIn, role, openLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn && !allowAnonymous) openLogin();
  }, [loading, isLoggedIn, allowAnonymous, openLogin]);

  if (loading) return null;
  if (!isLoggedIn) return allowAnonymous ? <>{children}</> : null;
  // Only block a user who has a known role that isn't permitted. A logged-in
  // user without a role yet falls through (these gates are used on pages that
  // also allow anonymous access).
  if (role && !canAccess(role, allow)) {
    const home = roleHome(role);
    const tutorSide = isTutorSide(role);
    return (
      <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
        <PWHeader />
        <main className="px-5 sm:px-8 py-16 max-w-lg mx-auto text-center">
          <div className="text-5xl">🔒</div>
          <h1 className="font-display text-[28px] mt-3">This area isn't available for your account</h1>
          <p className="mt-2 text-[14px] text-[var(--pw-ink-2)]">
            {tutorSide
              ? "You're signed in as a tutor. This section is for students."
              : "You're signed in as a student. This section is for tutors."}
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            {home !== "/" && (
              <Link to={home} className="pw-btn-primary px-5 py-2.5 text-[14px]">
                {tutorSide ? "Go to your dashboard" : "Go to your roadmap"}
              </Link>
            )}
            <button onClick={() => navigate({ to: "/" })} className="pw-btn-outline px-5 py-2.5 text-[14px]">Home</button>
          </div>
        </main>
      </div>
    );
  }
  return <>{children}</>;
}