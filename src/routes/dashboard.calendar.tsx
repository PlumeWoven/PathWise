import { createFileRoute } from "@tanstack/react-router";
import { AvailabilityPage } from "./_app.tutor.settings.availability";

export const Route = createFileRoute("/dashboard/calendar")({
  head: () => ({ meta: [{ title: "Availability · PathWise" }] }),
  component: DashboardCalendar,
});

function DashboardCalendar() {
  return <AvailabilityPage />;
}
