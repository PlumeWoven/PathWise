import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PWHeader } from "../pathwise/Header";
import { DashboardShell } from "../components/dashboard/TutorSidebar";
import { useAuth } from "../pathwise/auth";
import { RequireOnboarding } from "../pathwise/RequireOnboarding";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { isLoggedIn, role, loading, openLogin, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    if (role && role !== "tutor" && role !== "both") {
      navigate({ to: "/" });
    }
  }, [loading, isLoggedIn, role, openLogin, navigate]);

  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
        <PWHeader />
        <main className="px-5 sm:px-8 py-20 max-w-md mx-auto text-center text-[14px] text-[var(--pw-ink-2)]">Loading…</main>
      </div>
    );
  }
  if (role !== "tutor" && role !== "both") return null;

  return (
    <RequireOnboarding>
      <div className="min-h-screen bg-[var(--pw-bg)]">
        <PWHeader />
        <DashboardShell
          role="tutor"
          user={{
            name: profile?.display_name ?? user?.name ?? "Tutor",
            avatar: profile?.avatar_url ?? undefined,
            subtitle: profile?.bio ?? undefined,
          }}
        >
          <Outlet />
        </DashboardShell>
      </div>
    </RequireOnboarding>
  );
}