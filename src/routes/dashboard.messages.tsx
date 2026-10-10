import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Inbox } from "../pathwise/Inbox";

export const Route = createFileRoute("/dashboard/messages")({
  validateSearch: (s: Record<string, unknown>) => ({
    thread: typeof s.thread === "string" ? s.thread : undefined,
  }),
  component: DashboardMessages,
});

function DashboardMessages() {
  const { thread } = Route.useSearch();
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="font-display text-2xl uppercase tracking-[-0.025em] leading-none mb-4">Messages</h1>
      <Inbox
        threadId={thread}
        onSelect={(id) => navigate({ to: "/dashboard/messages", search: { thread: id } })}
      />
    </div>
  );
}
