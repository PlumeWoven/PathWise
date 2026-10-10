import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../pathwise/auth";
import { SignInPrompt } from "../pathwise/RoleGate";
import { Inbox } from "../pathwise/Inbox";

export const Route = createFileRoute("/_app/messages")({
  validateSearch: (s: Record<string, unknown>) => ({
    thread: typeof s.thread === "string" ? s.thread : undefined,
  }),
  head: () => ({ meta: [{ title: "Messages — PathWise" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const { loading, isLoggedIn, openLogin } = useAuth();
  const { thread } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isLoggedIn) openLogin();
  }, [loading, isLoggedIn, openLogin]);

  if (!loading && !isLoggedIn) return <SignInPrompt />;
  return (
    <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-display text-[2rem] uppercase tracking-[-0.025em] leading-none mb-6">Messages</h1>
      <Inbox threadId={thread} onSelect={(id) => navigate({ to: "/messages", search: { thread: id } })} />
    </main>
  );
}
