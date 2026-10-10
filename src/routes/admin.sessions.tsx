import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sessions")({
  component: AdminSessions,
});

type Row = {
  id: string;
  scheduled_start: string | null;
  status_v2: string;
  cancellation_reason: string | null;
  /** What the participant wrote when reporting it (from session_state_history). */
  reportReason?: string | null;
  student: { display_name: string | null } | null;
  tutor: { display_name: string | null } | null;
};

/**
 * Disputed sessions (reported by a participant) first, then the next 30 days.
 * Admin RLS allows the update; the notify trigger tells both participants.
 */
function AdminSessions() {
  const [disputed, setDisputed] = useState<Row[]>([]);
  const [upcoming, setUpcoming] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const select =
      "id, scheduled_start, status_v2, cancellation_reason, student:student_id(display_name), tutor:tutor_id(display_name)";
    const [d, u] = await Promise.all([
      supabase.from("sessions").select(select).eq("status_v2", "disputed").order("scheduled_start"),
      supabase
        .from("sessions")
        .select(select)
        .in("status_v2", ["scheduled", "confirmed", "reminder_sent"])
        .gte("scheduled_start", new Date().toISOString())
        .lte("scheduled_start", new Date(Date.now() + 30 * 86_400_000).toISOString())
        .order("scheduled_start"),
    ]);
    if (d.error || u.error) toast.error((d.error ?? u.error)!.message);
    const disputedRows = (d.data ?? []) as unknown as Row[];
    if (disputedRows.length) {
      const { data: reports } = await supabase
        .from("session_state_history")
        .select("session_id, reason, created_at")
        .eq("to_status", "disputed")
        .in("session_id", disputedRows.map((r) => r.id))
        .order("created_at", { ascending: false });
      for (const r of disputedRows) {
        r.reportReason = reports?.find((x) => x.session_id === r.id)?.reason ?? null;
      }
    }
    setDisputed(disputedRows);
    setUpcoming((u.data ?? []) as unknown as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: "closed" | "cancelled") => {
    const patch =
      status === "cancelled"
        ? { status_v2: status, cancellation_reason: "Cancelled by PathWise" }
        : { status_v2: status };
    const { data, error } = await supabase.from("sessions").update(patch).eq("id", id).select("id");
    if (error || !data?.length) {
      toast.error(error?.message ?? "Not updated — are you signed in as an admin?");
      return;
    }
    toast.success(status === "closed" ? "Dispute resolved" : "Session cancelled");
    await load();
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-2xl uppercase tracking-[-0.025em] leading-none mb-2">
          Disputes
        </h1>
        <p className="text-[0.8125rem] text-[var(--pw-ink-2)] mb-4">
          Sessions a student or tutor reported. Contact both, then resolve.
        </p>
        <SessionTable
          rows={disputed}
          empty="No open disputes."
          action={(r) => (
            <Button size="sm" onClick={() => setStatus(r.id, "closed")}>
              Resolve
            </Button>
          )}
        />
      </section>

      <section>
        <h2 className="font-display text-xl uppercase tracking-[-0.025em] leading-none mb-4">
          Next 30 days
        </h2>
        <SessionTable
          rows={upcoming}
          empty="No upcoming sessions."
          action={(r) => (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.confirm("Cancel this session for both sides?") && setStatus(r.id, "cancelled")}
            >
              Cancel
            </Button>
          )}
        />
      </section>
    </div>
  );
}

function SessionTable({
  rows,
  empty,
  action,
}: {
  rows: Row[];
  empty: string;
  action: (r: Row) => React.ReactNode;
}) {
  if (rows.length === 0) return <p className="text-[var(--pw-ink-2)] text-sm">{empty}</p>;
  return (
    <table className="w-full text-sm">
      <thead className="label-caps border-b border-[var(--pw-border)] text-[var(--pw-ink-2)]">
        <tr>
          <th className="text-left py-3 font-semibold">When</th>
          <th className="text-left py-3 font-semibold">Student</th>
          <th className="text-left py-3 font-semibold">Tutor</th>
          <th className="text-left py-3 font-semibold">Status</th>
          <th className="text-left py-3 font-semibold"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--pw-border)]">
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="py-3">
              <Link to="/sessions/$id" params={{ id: r.id }} className="underline">
                {r.scheduled_start ? new Date(r.scheduled_start).toLocaleString() : "—"}
              </Link>
            </td>
            <td className="py-3">{r.student?.display_name ?? "—"}</td>
            <td className="py-3">{r.tutor?.display_name ?? "—"}</td>
            <td className="py-3 text-[var(--pw-ink-2)]">
              <span className="label-caps">{r.status_v2.replace("_", " ")}</span>
              {r.reportReason && <div className="text-[0.75rem] mt-0.5">“{r.reportReason}”</div>}
            </td>
            <td className="py-3">{action(r)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
