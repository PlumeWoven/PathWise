import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/messages")({
    component: DashboardMessages,
});

function DashboardMessages() {
    return (
        <div>
            <h1 className="font-display text-2xl mb-4">Messages</h1>
            <p className="text-[var(--pw-ink-2)]">Coming soon – real‑time chat with your students.</p>
        </div>
    );
}