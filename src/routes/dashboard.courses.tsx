import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route: `/dashboard/courses` now has children (`new`, `$courseId/edit`),
// so the list itself lives in dashboard.courses.index.tsx and this file just
// renders the outlet. Same shape as dashboard.settings.tsx.
export const Route = createFileRoute("/dashboard/courses")({
    component: DashboardCoursesLayout,
});

function DashboardCoursesLayout() {
    return <Outlet />;
}
