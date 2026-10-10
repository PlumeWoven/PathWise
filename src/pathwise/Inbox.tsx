/**
 * src/pathwise/Inbox.tsx
 *
 * Student ↔ tutor messaging on message_threads / messages. Threads are created
 * only through the ensure_thread RPC (see openThread); RLS limits everything to
 * the two people in a thread, and a trigger notifies the recipient (M4).
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./auth";

// ponytail: src/integrations/supabase/types.ts predates the live messaging
// columns (e.g. message_threads.updated_at), so these queries use explicit row
// types on an untyped client. Drop `db` once types.ts is regenerated.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type ThreadRow = { id: string; tutor_id: string | null; student_id: string | null; updated_at: string | null };
type Thread = { id: string; otherId: string; updatedAt: string | null };
type Person = { id: string; display_name: string | null; full_name: string | null; avatar_url: string | null };
type Message = { id: string; thread_id: string; sender_id: string; body: string; created_at: string };

/** Get (or create) the 1:1 thread with another user; returns its id. */
export async function openThread(myId: string, otherId: string): Promise<string> {
  const { data, error } = await (supabase.rpc as any)("ensure_thread", { a: myId, b: otherId });
  if (error) throw error;
  return data as string;
}

/** Returns a handler for "Message" buttons: sign in if needed, open the thread, go to /messages. */
export function useStartConversation() {
  const { user, openLogin } = useAuth();
  const navigate = useNavigate();
  return async (otherId: string) => {
    if (!user) {
      openLogin();
      return;
    }
    if (user.id === otherId) return;
    try {
      const thread = await openThread(user.id, otherId);
      navigate({ to: "/messages", search: { thread } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't open the conversation");
    }
  };
}

export function Inbox({
  threadId,
  onSelect,
}: {
  threadId?: string;
  onSelect: (id: string | undefined) => void;
}) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [people, setPeople] = useState<Map<string, Person>>(new Map());
  const [lastBody, setLastBody] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = (await db
        .from("message_threads")
        .select("id, tutor_id, student_id, updated_at")
        .order("updated_at", { ascending: false })) as { data: ThreadRow[] | null };
      const rows: Thread[] = (data ?? []).map((t) => ({
        id: t.id,
        otherId: (t.tutor_id === user.id ? t.student_id : t.tutor_id) as string,
        updatedAt: t.updated_at,
      }));
      const ids = [...new Set(rows.map((t) => t.otherId).filter(Boolean))];
      const [profiles, recent] = await Promise.all([
        ids.length
          ? supabase.from("profiles").select("id, display_name, full_name, avatar_url").in("id", ids)
          : Promise.resolve({ data: [] as Person[] }),
        rows.length
          ? (db
              .from("messages")
              .select("thread_id, body, created_at")
              .in("thread_id", rows.map((t) => t.id))
              .order("created_at", { ascending: false })
              .limit(200) as Promise<{ data: { thread_id: string; body: string }[] | null }>)
          : Promise.resolve({ data: [] as { thread_id: string; body: string }[] }),
      ]);
      if (cancelled) return;
      setPeople(new Map((profiles.data ?? []).map((p) => [p.id, p as Person])));
      const last = new Map<string, string>();
      for (const m of recent.data ?? []) if (m.thread_id && !last.has(m.thread_id)) last.set(m.thread_id, m.body);
      setLastBody(last);
      setThreads(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, threadId]);

  if (!user) return null;
  const selected = threads?.find((t) => t.id === threadId);
  const nameOf = (id: string) => {
    const p = people.get(id);
    return p?.display_name || p?.full_name || "Unknown user";
  };

  return (
    <div className="grid md:grid-cols-[18rem_1fr] gap-4 min-h-[28rem]">
      <ul className={`pw-card divide-y divide-[var(--pw-border)] ${selected ? "hidden md:block" : ""}`}>
        {threads === null && <li className="p-4 text-sm text-[var(--pw-ink-2)]">Loading…</li>}
        {threads?.length === 0 && (
          <li className="p-4 text-sm text-[var(--pw-ink-2)]">
            No conversations yet. Message a tutor from their profile.
          </li>
        )}
        {threads?.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => onSelect(t.id)}
              className={`w-full text-left p-3 hover:bg-[var(--pw-surface-2)] ${t.id === threadId ? "bg-[var(--pw-surface-2)]" : ""}`}
            >
              <div className="font-medium text-sm">{nameOf(t.otherId)}</div>
              <div className="text-[0.75rem] text-[var(--pw-ink-2)] truncate">
                {lastBody.get(t.id) ?? "No messages yet"}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <Conversation
          key={selected.id}
          threadId={selected.id}
          myId={user.id}
          otherName={nameOf(selected.otherId)}
          onBack={() => onSelect(undefined)}
        />
      ) : (
        <div className="pw-card hidden md:flex items-center justify-center text-sm text-[var(--pw-ink-2)]">
          Pick a conversation.
        </div>
      )}
    </div>
  );
}

function Conversation({
  threadId,
  myId,
  otherName,
  onBack,
}: {
  threadId: string;
  myId: string;
  otherName: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    db.from("messages")
      .select("id, thread_id, sender_id, body, created_at")
      .eq("thread_id", threadId)
      .order("created_at")
      .then(({ data }: { data: Message[] | null }) => !cancelled && setMessages(data ?? []));

    // This thread's notifications are now read.
    void supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", myId)
      .eq("link", `/messages?thread=${threadId}`);

    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [threadId, myId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    const { data, error } = await db
      .from("messages")
      .insert({ thread_id: threadId, sender_id: myId, body })
      .select("id, thread_id, sender_id, body, created_at")
      .single();
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDraft("");
    const sent = data as Message;
    setMessages((prev) => (prev.some((x) => x.id === sent.id) ? prev : [...prev, sent]));
  }

  return (
    <section className="pw-card flex flex-col min-h-[28rem]">
      <header className="p-3 border-b border-[var(--pw-border)] flex items-center gap-2">
        <button onClick={onBack} className="md:hidden label-caps text-[var(--pw-ink-2)]">
          ← Back
        </button>
        <span className="font-medium">{otherName}</span>
      </header>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[60vh]">
        {messages.length === 0 && (
          <p className="text-sm text-[var(--pw-ink-2)]">Say hello — introduce yourself and what you'd like to learn.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === myId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] px-3 py-2 text-sm whitespace-pre-wrap"
                style={{
                  background: mine ? "var(--pw-accent-soft)" : "var(--pw-surface-2)",
                  border: "1px solid var(--pw-border)",
                }}
              >
                {m.body}
                <div className="text-[0.625rem] text-[var(--pw-ink-2)] mt-1">
                  {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} className="p-3 border-t border-[var(--pw-border)] flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          aria-label="Message"
          maxLength={4000}
          className="pw-input flex-1 text-sm"
        />
        <button type="submit" disabled={sending || !draft.trim()} className="pw-btn-primary px-4 py-2 disabled:opacity-50">
          Send
        </button>
      </form>
    </section>
  );
}
