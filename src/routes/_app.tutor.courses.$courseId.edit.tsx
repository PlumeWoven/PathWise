import { createFileRoute, redirect } from "@tanstack/react-router";

// The editor moved to /dashboard/courses/$courseId/edit so it renders inside
// DashboardShell. Kept as a redirect so existing bookmarks still work.
export const Route = createFileRoute("/_app/tutor/courses/$courseId/edit")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/dashboard/courses/$courseId/edit",
      params: { courseId: params.courseId },
      replace: true,
    });
  },
});
