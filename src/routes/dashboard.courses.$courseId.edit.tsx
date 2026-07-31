import { createFileRoute, useParams } from "@tanstack/react-router";
import { CourseEditor } from "@/components/dashboard/CourseEditor";

export const Route = createFileRoute("/dashboard/courses/$courseId/edit")({
  head: () => ({ meta: [{ title: "Edit Course — PathWise" }] }),
  component: DashboardCourseEdit,
});

function DashboardCourseEdit() {
  const { courseId } = useParams({ from: "/dashboard/courses/$courseId/edit" });
  return <CourseEditor courseId={courseId} />;
}
