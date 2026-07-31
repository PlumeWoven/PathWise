import { createFileRoute, redirect } from "@tanstack/react-router";

// The editor moved under /dashboard so it renders inside DashboardShell.
// Kept as a redirect so existing links and bookmarks still land somewhere useful.
export const Route = createFileRoute("/_app/tutor/courses/new")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/courses/new", replace: true });
  },
});
