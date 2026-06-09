import { createFileRoute } from "@tanstack/react-router";
import { TutorAvailabilityPage } from "./tutor.settings.availability";

export const Route = createFileRoute("/dashboard/calendar")({
    component: DashboardCalendar,
});

function DashboardCalendar() {
    return <TutorAvailabilityPage />;
}