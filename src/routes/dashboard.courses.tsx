import { createFileRoute } from "@tanstack/react-router";
import { TutorCoursesPage } from "./tutor.courses.index";

export const Route = createFileRoute("/dashboard/courses")({
    component: DashboardCourses,
});

function DashboardCourses() {
    return <TutorCoursesPage />;
}