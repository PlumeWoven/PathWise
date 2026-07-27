import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PWHeader } from "../pathwise/Header";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

// Pathless layout: supplies the page shell + sticky header to every `_app.*` route
// so individual pages don't each import and render PWHeader. Guard logic lives in
// dashboard.tsx / RoleGate.tsx — deliberately none here.
function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <Outlet />
    </div>
  );
}
