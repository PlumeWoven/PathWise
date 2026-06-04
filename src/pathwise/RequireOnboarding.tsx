import { useEffect, ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./auth";

/**
 * Wraps protected routes. While auth is loading, shows nothing.
 * If unauthenticated → opens login modal.
 * If onboarding is incomplete → redirects to the role-appropriate onboarding page.
 */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const { loading, isLoggedIn, profile, openLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    if (profile && !profile.onboarding_completed) {
      const target = profile.role === "tutor" ? "/onboarding/tutor" : "/onboarding/student";
      navigate({ to: target });
    }
  }, [loading, isLoggedIn, profile, openLogin, navigate]);

  if (loading) return null;
  if (!isLoggedIn) return null;
  if (profile && !profile.onboarding_completed) return null;
  return <>{children}</>;
}