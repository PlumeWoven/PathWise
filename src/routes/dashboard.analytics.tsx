import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/analytics")({
    component: DashboardAnalytics,
});

function DashboardAnalytics() {
    return (
        <div>
            <h1 className="font-display text-2xl mb-4">Analytics</h1>
            <p className="text-[var(--pw-ink-2)]">Student engagement and growth metrics coming soon.</p>
        </div>
    );
}