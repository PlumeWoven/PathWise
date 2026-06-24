import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  STATUS_META,
  transitionSession,
  type SessionStatus,
  type SessionPaymentStatus,
} from "../pathwise/sessions";
import { SessionStateTracker } from "../pathwise/SessionStateTracker";

export const Route = createFileRoute("/sessions/$id")({
  head: () => ({ meta: [{ title: "Session — PathWise" }] }),
  component: SessionDetail,
  errorComponent: ({ error }) => (
    <div className="p-6">Couldn't load session: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-6">Session not found.</div>,
});

interface SessionRow {
  id: string;
  student_id: string | null;
  tutor_id: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  duration_minutes: number | null;
  timezone: string | null;
  session_type: string | null;
  amount: number | null;
  meeting_url: string | null;
  notes: string | null;
  rating: number | null;
  status_v2: SessionStatus;
  payment_status: SessionPaymentStatus;
  cancellation_reason: string | null;
}

function SessionDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionRow | null>(null);
  const [tutor, setTutor] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [student, setStudent] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("sessions")
      .select("id, student_id, tutor_id, scheduled_start, scheduled_end, duration_minutes, timezone, session_type, amount, meeting_url, notes, rating, status_v2, payment_status, cancellation_reason")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) { setLoading(false); return; }
    const s = data as unknown as SessionRow;
    setSession(s);
    if (s.tutor_id) {
      const { data: t } = await supabase.from("profiles").select("display_name, avatar_url").eq("id", s.tutor_id).maybeSingle();
      setTutor(t as any);
    }
    if (s.student_id) {
      const { data: st } = await supabase.from("profiles").select("display_name, avatar_url").eq("id", s.student_id).maybeSingle();
      setStudent(st as any);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, [id]);

  if (loading) return <div className="min-h-screen bg-[var(--pw-bg)]"><PWHeader /><div className="p-8 text-center text-sm">Loading…</div></div>;
  if (!session) return <div className="min-h-screen bg-[var(--pw-bg)]"><PWHeader /><div className="p-8 text-center">Session not found.</div></div>;

  const isTutor = user?.id === session.tutor_id;
  const isStudent = user?.id === session.student_id;
  const start = session.scheduled_start ? new Date(session.scheduled_start) : null;
  const end = session.scheduled_end ? new Date(session.scheduled_end) : null;
  const meta = STATUS_META[session.status_v2];
  const minsToStart = start ? (start.getTime() - Date.now()) / 60000 : Infinity;
  const canJoin =
    (session.status_v2 === "confirmed" || session.status_v2 === "reminder_sent" || session.status_v2 === "in_progress") &&
    minsToStart <= 5 && minsToStart > -((session.duration_minutes ?? 60) + 30);

  const isUpcoming = ["scheduled", "confirmed", "reminder_sent"].includes(session.status_v2);
  const canReschedule = isUpcoming && minsToStart > 24 * 60;
  const canCancel = isUpcoming;

  async function doTransition(to: SessionStatus, opts: { reason?: string; patch?: any; title: string; message?: string } = { title: "" }) {
    if (!user) return;
    try {
      await transitionSession({
        sessionId: id,
        to,
        by: user.id,
        reason: opts.reason,
        patch: opts.patch,
        notify: { title: opts.title, message: opts.message, link: `/sessions/${id}` },
      });
      toast.success(`Session ${to.replace("_", " ")}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update session");
    }
  }

  async function handleJoin() {
    const s = session;
    if (s && s.status_v2 !== "in_progress") {
      await doTransition("in_progress", {
        patch: { actual_start: new Date().toISOString() },
        title: "Session started",
      });
    }
    if (s?.meeting_url) window.open(s.meeting_url, "_blank");
  }

  async function handleComplete() {
    await doTransition("completed", {
      patch: { actual_end: new Date().toISOString() },
      title: "Session completed",
      message: "Don't forget to leave a review",
    });
    setTimeout(() => doTransition("awaiting_review", { title: "Review window open", message: "You have 48h to leave feedback" }), 600);
  }

  async function handleCancel() {
    if (!cancelReason.trim()) { toast.error("Please give a reason"); return; }
    await doTransition("cancelled", {
      reason: cancelReason,
      patch: { cancellation_reason: cancelReason, cancelled_by: user?.id, payment_status: "refunded" },
      title: "Session cancelled",
      message: cancelReason,
    });
    setShowCancel(false);
  }

  async function handleSubmitReview() {
    const s = session;
    if (!user || !s?.tutor_id) return;
    try {
      await supabase.from("reviews").insert({
        student_id: user.id,
        tutor_id: s.tutor_id,
        rating: reviewRating,
        body: reviewBody || null,
      });
      await doTransition("closed", { title: "Thanks for your review!" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <main className="px-5 sm:px-8 pb-24 max-w-3xl mx-auto pt-4">
        <div className="text-[12px] text-[var(--pw-ink-2)]">
          <Link to="/sessions" className="underline-offset-2 hover:underline">My sessions</Link>
          <span className="mx-2">→</span>Session details
        </div>

        <div className="mt-3 flex items-center gap-2">
          <h1 className="font-display text-2xl">Session</h1>
          <span
            className="pw-pill text-[12px] px-2.5 py-0.5 font-medium"
            style={{ background: meta.bg, color: meta.fg }}
          >
            {meta.label}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <PersonCard label="Tutor" person={tutor} />
          <PersonCard label="Student" person={student} />
        </div>

        <div className="mt-4 pw-card p-5 space-y-2">
          <Row label="Date & time" value={start ? start.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short", timeZone: session.timezone ?? undefined }) : "—"} />
          <Row label="Timezone" value={session.timezone ?? "—"} />
          <Row label="Type" value={session.session_type ?? "Standard"} />
          <Row label="Duration" value={`${session.duration_minutes ?? 60} min`} />
          <Row label="Amount" value={Number(session.amount ?? 0) === 0 ? "Free" : `$${session.amount}`} />
          <Row label="Payment" value={session.payment_status} />
          {session.cancellation_reason && <Row label="Reason" value={session.cancellation_reason} />}
        </div>

        <div className="mt-4">
          <SessionStateTracker status={session.status_v2} />
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleJoin}
            disabled={!canJoin}
            className="pw-btn-primary px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            title={!canJoin ? "Available 5 min before start" : undefined}
          >
            {session.status_v2 === "in_progress" ? "Re-join session" : "Join session"}
          </button>
          {(isTutor || isStudent) && session.status_v2 === "scheduled" && isTutor && (
            <button onClick={() => doTransition("confirmed", { title: "Session confirmed" })} className="pw-btn-outline px-4 py-2 text-sm">
              Accept booking
            </button>
          )}
          {(isTutor || isStudent) && session.status_v2 === "in_progress" && (
            <button onClick={handleComplete} className="pw-btn-outline px-4 py-2 text-sm">Mark completed</button>
          )}
          {canReschedule && (
            <button onClick={() => navigate({ to: "/book/$tutorId", params: { tutorId: session.tutor_id ?? "" } })} className="pw-btn-outline px-4 py-2 text-sm">
              Reschedule
            </button>
          )}
          {canCancel && !showCancel && (
            <button onClick={() => setShowCancel(true)} className="pw-btn-outline px-4 py-2 text-sm" style={{ color: "var(--pw-danger)" }}>
              Cancel
            </button>
          )}
        </div>

        {showCancel && (
          <div className="mt-3 pw-card p-4">
            <label className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Reason</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="mt-1 w-full pw-border rounded-md px-3 py-2 text-sm bg-[var(--pw-surface)]"
              placeholder="Schedule conflict, no longer needed, etc."
            />
            <div className="flex gap-2 mt-2">
              <button onClick={handleCancel} className="pw-btn-primary px-4 py-2 text-sm" style={{ background: "var(--pw-danger)" }}>Confirm cancel</button>
              <button onClick={() => setShowCancel(false)} className="pw-btn-outline px-4 py-2 text-sm">Keep session</button>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mt-4 pw-card p-5">
          <div className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Notes</div>
          <p className="text-sm text-[var(--pw-ink)] mt-1 whitespace-pre-wrap">{session.notes || "—"}</p>
        </div>

        {/* Review form (student, awaiting_review) */}
        {isStudent && session.status_v2 === "awaiting_review" && (
          <div className="mt-4 pw-card p-5">
            <h2 className="font-display text-lg">How did it go?</h2>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setReviewRating(n)} className="text-2xl" style={{ color: n <= reviewRating ? "var(--pw-accent)" : "var(--pw-border)" }}>★</button>
              ))}
            </div>
            <textarea
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              rows={3}
              className="mt-3 w-full pw-border rounded-md px-3 py-2 text-sm bg-[var(--pw-surface)]"
              placeholder="Tell other students about this tutor"
            />
            <button onClick={handleSubmitReview} className="pw-btn-primary px-4 py-2 text-sm mt-3">Submit review</button>
          </div>
        )}
      </main>
    </div>
  );
}

function PersonCard({ label, person }: { label: string; person: { display_name: string | null; avatar_url: string | null } | null }) {
  return (
    <div className="pw-card p-4 flex items-center gap-3">
      {person?.avatar_url ? (
        <img src={person.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-[var(--pw-surface-2)] flex items-center justify-center font-display">
          {(person?.display_name ?? "?")[0]}
        </div>
      )}
      <div>
        <div className="font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">{label}</div>
        <div className="font-display text-[15px]">{person?.display_name ?? "—"}</div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[14px]">
      <span className="text-[var(--pw-ink-2)]">{label}</span>
      <span className="text-right ml-3">{value}</span>
    </div>
  );
}