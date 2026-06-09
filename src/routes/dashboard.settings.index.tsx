import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings/")({
    component: DashboardSettingsIndex,
});

function DashboardSettingsIndex() {
    return (
        <div>
            <h1 className="font-display text-2xl mb-4">Settings</h1>
            <p className="mb-2">Choose a setting category:</p>
            <ul className="space-y-1">
                <li><Link to="/dashboard/settings/verification" className="text-[var(--pw-accent)] underline">Verification</Link></li>
                <li><Link to="/dashboard/calendar" className="text-[var(--pw-accent)] underline">Availability (Calendar)</Link></li>
                <li><Link to="/dashboard/courses" className="text-[var(--pw-accent)] underline">Courses</Link></li>
            </ul>
        </div>
    );
}