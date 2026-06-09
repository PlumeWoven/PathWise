import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/earnings")({
    component: DashboardEarnings,
});

function DashboardEarnings() {
    return (
        <div>
            <h1 className="font-display text-2xl mb-4">Earnings</h1>
            <p className="text-[var(--pw-ink-2)]">Detailed earnings and payout history will appear here.</p>
        </div>
    );
}