import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_META, type SessionStatus } from "../pathwise/sessions";

export const Route = createFileRoute("/sessions/")({
  head: () => ({ meta: [{ title: "My sessions — PathWise" }] }),
  component: SessionsList,
});

interface Row {
  id: string;
  scheduled_start: string | null;
  status_v2: SessionStatus;
  session_type: string | null;
  amount: number | null;
  tutor_id: string | null;
  student_id: string | null;
  other_name?: string | null;
}

const FILTERS: { id: "all" | "upcoming" | "past" | "cancelled"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

function SessionsList() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<typeof FILTERS[number]["id"]>("upcoming");

  useEffect(() => {
    if (!user) return;
    void (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("sessions")
        .select("id, scheduled_start, status_v2, session_type, amount, tutor_id, student_id")
        .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`)
        .order("scheduled_start", { ascending: false });
      const list = (data ?? []) as unknown as Row[];
      const otherIds = Array.from(new Set(list.map((r) => (r.student_id === user.id ? r.tutor_id : r.student_id)).filter(Boolean) as string[]));
      if (otherIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", otherIds);
        const map = new Map((profs ?? []).map((p: any) => [p.id, p.display_name as string | null]));
        list.forEach((r) => {
          const oid = r.student_id === user.id ? r.tutor_id : r.student_id;
          r.other_name = oid ? map.get(oid) ?? null : null;
        });
      }
      setRows(list);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading) return null;
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)]">
        <PWHeader />
        <div className="p-8 text-center text-sm">Sign in to see your sessions.</div>
      </div>
    );
  }

  const now = Date.now();
  const filtered = rows.filter((r) => {
    if (filter === "all") return true;
    if (filter === "cancelled") return r.status_v2 === "cancelled";
    const start = r.scheduled_start ? new Date(r.scheduled_start).getTime() : 0;
    if (filter === "upcoming") return start >= now && r.status_v2 !== "cancelled";
    return start < now || ["completed", "awaiting_review", "closed"].includes(r.status_v2);
  });

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <main className="px-5 sm:px-8 pb-24 max-w-3xl mx-auto pt-4">
        <h1 className="font-display text-2xl">My sessions</h1>
        <div className="mt-3 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="pw-pill text-[12px] px-3 py-1.5"
              style={{
                background: filter === f.id ? "var(--pw-accent)" : "var(--pw-surface-2)",
                color: filter === f.id ? "white" : "var(--pw-ink)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-[var(--pw-ink-2)]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 pw-card p-6 text-center text-sm text-[var(--pw-ink-2)]">
            Nothing here yet. <Link to="/matches" className="text-[var(--pw-accent)] underline">Find a tutor →</Link>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {filtered.map((r) => {
              const meta = STATUS_META[r.status_v2];
              return (
                <Link
                  key={r.id}
                  to="/sessions/$id"
                  params={{ id: r.id }}
                  className="pw-card p-4 flex items-center justify-between hover:border-[var(--pw-accent)] transition-colors"
                >
                  <div>
                    <div className="font-display text-[15px]">{r.other_name ?? "Session"}</div>
                    <div className="text-[12px] text-[var(--pw-ink-2)]">
                      {r.scheduled_start ? new Date(r.scheduled_start).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"}
                      {" · "}
                      {r.session_type ?? "session"}
                    </div>
                  </div>
                  <span className="pw-pill text-[11px] px-2.5 py-0.5" style={{ background: meta.bg, color: meta.fg }}>{meta.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}