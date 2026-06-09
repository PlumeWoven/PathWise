import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow, format, startOfMonth, subMonths, startOfWeek } from "date-fns";
import { toast } from "sonner";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import { UnverifiedBanner } from "../pathwise/UnverifiedBanner";
import { VerificationBadge, statusToTier } from "../pathwise/VerificationBadge";

export const Route = createFileRoute("/dashboard/")({
    component: DashboardHome,
});

// ---------- Types ----------
interface EarningRow { id: string; amount: number; earned_at: string; }
interface SessionRow {
    id: string; scheduled_at: string | null; student_id: string | null;
    subject: string | null; session_type: string | null; meeting_url: string | null;
}
interface ReviewRow { id: string; rating: number | null; body: string | null; created_at: string; student_id: string | null; }
interface LeadRow { stage: string; }
interface ProfileLite { id: string; display_name: string | null; avatar_url: string | null; }
interface ProfileFull {
    id: string; display_name: string | null; avatar_url: string | null;
    bio: string | null; video_intro_url: string | null; subject_specialties: string[] | null;
    hourly_rate: number | null;
}

function DashboardHome() {
    const { user, profile } = useAuth();
    const tutorId = user?.id;

    const [earnings, setEarnings] = useState<EarningRow[]>([]);
    const [sessions, setSessions] = useState<SessionRow[]>([]);
    const [reviews, setReviews] = useState<ReviewRow[]>([]);
    const [leads, setLeads] = useState<LeadRow[]>([]);
    const [students, setStudents] = useState<ProfileLite[]>([]);
    const [tutorProfile, setTutorProfile] = useState<ProfileFull | null>(null);
    const [availabilityCount, setAvailabilityCount] = useState(0);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!tutorId) return;
        let cancelled = false;
        (async () => {
            setDataLoading(true);
            try {
                const sinceMs = Date.now() - 1000 * 60 * 60 * 24 * 90;
                const [earnRes, sessRes, revRes, leadRes, relRes, profRes, availRes] = await Promise.all([
                    supabase.from("tutor_earnings").select("id, amount, earned_at")
                        .eq("tutor_id", tutorId).gte("earned_at", new Date(sinceMs).toISOString()),
                    supabase.from("sessions").select("id, scheduled_at, student_id, subject, session_type, meeting_url")
                        .eq("tutor_id", tutorId).order("scheduled_at", { ascending: true }),
                    supabase.from("reviews").select("id, rating, body, created_at, student_id")
                        .eq("tutor_id", tutorId).order("created_at", { ascending: false }).limit(10),
                    supabase.from("lead_events").select("stage").eq("tutor_id", tutorId),
                    supabase.from("tutor_students").select("student_id").eq("tutor_id", tutorId),
                    supabase.from("profiles").select("id, display_name, avatar_url, bio, video_intro_url, subject_specialties, hourly_rate")
                        .eq("id", tutorId).maybeSingle(),
                    supabase.from("tutor_availability").select("id", { count: "exact", head: true }).eq("user_id", tutorId),
                ]);

                const studentIds = Array.from(new Set([
                    ...((relRes.data ?? []).map((r) => r.student_id)),
                    ...((sessRes.data ?? []).map((r) => r.student_id).filter(Boolean) as string[]),
                    ...((revRes.data ?? []).map((r) => r.student_id).filter(Boolean) as string[]),
                ])).filter(Boolean) as string[];

                const profilesRes = studentIds.length
                    ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", studentIds)
                    : { data: [] as ProfileLite[], error: null };

                if (cancelled) return;
                setEarnings(((earnRes.data ?? []) as any[]).map((e) => ({ ...e, amount: Number(e.amount) })));
                setSessions(sessRes.data ?? []);
                setReviews(revRes.data ?? []);
                setLeads(leadRes.data ?? []);
                setStudents(((profilesRes as any).data ?? []) as ProfileLite[]);
                setTutorProfile((profRes.data ?? null) as ProfileFull | null);
                setAvailabilityCount(availRes.count ?? 0);
            } catch (err) {
                console.error("[dashboard]", err);
                toast.error("Failed to load some dashboard data.");
            } finally {
                if (!cancelled) setDataLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [tutorId]);

    // ---- Derived ----
    const greeting = useMemo(() => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    const now = new Date();
    const mtdStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const earningsMTD = earnings.filter(e => new Date(e.earned_at) >= mtdStart).reduce((s, e) => s + e.amount, 0);
    const earningsLastMonth = earnings.filter(e => {
        const d = new Date(e.earned_at);
        return d >= lastMonthStart && d < mtdStart;
    }).reduce((s, e) => s + e.amount, 0);
    const earningsChange = pctChange(earningsMTD, earningsLastMonth);

    const sessionsThisMonth = sessions.filter(s => s.scheduled_at && new Date(s.scheduled_at) >= mtdStart);
    const sessionsLastMonth = sessions.filter(s => s.scheduled_at && new Date(s.scheduled_at) >= lastMonthStart && new Date(s.scheduled_at!) < mtdStart);
    const sessionsChange = pctChange(sessionsThisMonth.length, sessionsLastMonth.length);

    const totalStudents = students.length;
    const studentsChange = 0;

    const avgRating = reviews.length > 0
        ? Number((reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1))
        : 0;

    const upcoming = sessions.filter(s => s.scheduled_at && new Date(s.scheduled_at) > now).slice(0, 5);
    const studentMap = new Map(students.map(s => [s.id, s] as const));

    const completeness = useMemo(() => computeCompleteness(tutorProfile, availabilityCount), [tutorProfile, availabilityCount]);

    return (
        <>
            {/* Welcome */}
            <div className="mt-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-[28px] sm:text-[34px] leading-tight">
                        {greeting}, {profile?.display_name ?? "Tutor"}!
                    </h1>
                    {profile && <VerificationBadge tier={statusToTier(profile.verification_status)} />}
                </div>
                <p className="mt-1 text-[14px] text-[var(--pw-ink-2)]">Here's how your tutoring practice is doing today.</p>
                <UnverifiedBanner />
            </div>

            {!dataLoading && earnings.length === 0 && sessions.length === 0 && reviews.length === 0 && (
                <div className="mt-5 pw-card p-5 flex flex-wrap items-center gap-4" style={{ background: "var(--pw-accent-soft)" }}>
                    <div className="text-3xl">✨</div>
                    <div className="flex-1 min-w-[220px]">
                        <div className="font-display text-[18px]">Your live dashboard is ready</div>
                        <p className="text-[13px] text-[var(--pw-ink-2)] mt-0.5">
                            Earnings, sessions and reviews will appear here as students book and rate you.
                            Finish your profile and add availability so students can find you.
                        </p>
                    </div>
                    <Link to="/onboarding/tutor" className="pw-btn-primary text-[13px] px-4 py-2">Complete profile</Link>
                </div>
            )}

            {/* Quick Actions */}
            <QuickActionsBar />

            {/* Metric Cards */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Earnings (MTD)" value={`$${earningsMTD.toFixed(0)}`} change={earningsChange} skeleton={dataLoading} />
                <MetricCard label="Total Students" value={String(totalStudents)} change={studentsChange} skeleton={dataLoading} />
                <MetricCard label="Sessions" value={String(sessionsThisMonth.length)} change={sessionsChange} skeleton={dataLoading} />
                <MetricCard label="Avg Rating" value={avgRating ? `${avgRating}★` : "—"} change={null} skeleton={dataLoading} />
            </div>

            {/* Main grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="md:col-span-2 lg:col-span-2"><EarningsChart earnings={earnings} /></div>
                <div><ProfileCompleteness data={completeness} /></div>

                <div className="lg:col-span-2"><UpcomingSessions sessions={upcoming} studentMap={studentMap} /></div>
                <div><LeadFunnel leads={leads} /></div>

                <div className="lg:col-span-2"><ReviewsPreview reviews={reviews} studentMap={studentMap} /></div>
                <div><EarningsBreakdown earnings={earnings} /></div>
            </div>
        </>
    );
}

// ---------- Helpers ----------
function pctChange(current: number, prev: number): number | null {
    if (prev === 0) return current === 0 ? 0 : null;
    return ((current - prev) / prev) * 100;
}

function computeCompleteness(p: ProfileFull | null, availability: number) {
    const items = [
        { key: "photo", label: "Profile photo", done: !!p?.avatar_url },
        { key: "bio", label: "Bio", done: !!p?.bio && p.bio.length > 30 },
        { key: "video", label: "Video intro", done: !!p?.video_intro_url },
        { key: "subjects", label: "Subjects (min 3)", done: (p?.subject_specialties?.length ?? 0) >= 3 },
        { key: "availability", label: "Availability set", done: availability > 0 },
        { key: "pricing", label: "Hourly rate", done: !!p?.hourly_rate && p.hourly_rate > 0 },
    ];
    const done = items.filter(i => i.done).length;
    const score = Math.round((done / items.length) * 100);
    return { items, score };
}

// ---------- Components (unchanged from original) ----------
function MetricCard({ label, value, change, skeleton }:
    { label: string; value: string; change: number | null; skeleton?: boolean }) {
    if (skeleton) return <div className="pw-card p-5 h-[112px] animate-pulse bg-[var(--pw-surface-2)]" />;
    const isUp = (change ?? 0) >= 0;
    return (
        <div className="pw-card p-5">
            <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">{label}</div>
            <div className="mt-2 font-display text-[28px] leading-none" style={{ color: "var(--pw-accent)" }}>{value}</div>
            <div className="mt-2 text-[12px]">
                {change == null ? (
                    <span className="text-[var(--pw-ink-2)]">vs last month —</span>
                ) : (
                    <span style={{ color: isUp ? "var(--pw-accent-2)" : "var(--pw-danger)" }}>
                        {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(0)}% <span className="text-[var(--pw-ink-2)]">vs last month</span>
                    </span>
                )}
            </div>
        </div>
    );
}

type Range = "daily" | "weekly" | "monthly";
function EarningsChart({ earnings }: { earnings: EarningRow[] }) {
    const [range, setRange] = useState<Range>("daily");

    const data = useMemo(() => {
        const now = new Date();
        if (range === "daily") {
            const buckets = new Map<string, { date: string; amount: number; count: number }>();
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now); d.setDate(d.getDate() - i);
                const k = format(d, "yyyy-MM-dd");
                buckets.set(k, { date: format(d, "MMM d"), amount: 0, count: 0 });
            }
            earnings.forEach(e => {
                const k = format(new Date(e.earned_at), "yyyy-MM-dd");
                const b = buckets.get(k);
                if (b) { b.amount += e.amount; b.count += 1; }
            });
            return Array.from(buckets.values());
        }
        if (range === "weekly") {
            const buckets = new Map<string, { date: string; amount: number; count: number }>();
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now); d.setDate(d.getDate() - i * 7);
                const wk = startOfWeek(d, { weekStartsOn: 1 });
                const k = format(wk, "yyyy-MM-dd");
                if (!buckets.has(k)) buckets.set(k, { date: format(wk, "MMM d"), amount: 0, count: 0 });
            }
            earnings.forEach(e => {
                const wk = startOfWeek(new Date(e.earned_at), { weekStartsOn: 1 });
                const k = format(wk, "yyyy-MM-dd");
                const b = buckets.get(k);
                if (b) { b.amount += e.amount; b.count += 1; }
            });
            return Array.from(buckets.values());
        }
        const buckets = new Map<string, { date: string; amount: number; count: number }>();
        for (let i = 5; i >= 0; i--) {
            const d = startOfMonth(subMonths(now, i));
            const k = format(d, "yyyy-MM");
            buckets.set(k, { date: format(d, "MMM"), amount: 0, count: 0 });
        }
        earnings.forEach(e => {
            const k = format(new Date(e.earned_at), "yyyy-MM");
            const b = buckets.get(k);
            if (b) { b.amount += e.amount; b.count += 1; }
        });
        return Array.from(buckets.values());
    }, [earnings, range]);

    return (
        <div className="pw-card p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Earnings</div>
                    <div className="font-display text-[20px] mt-0.5">
                        {range === "daily" ? "Last 30 days" : range === "weekly" ? "Last 12 weeks" : "Last 6 months"}
                    </div>
                </div>
                <div className="flex gap-1 p-1 rounded-full bg-[var(--pw-surface-2)]">
                    {(["daily", "weekly", "monthly"] as Range[]).map(r => (
                        <button key={r} onClick={() => setRange(r)}
                            className={`px-3 py-1 text-[12px] rounded-full capitalize ${range === r ? "bg-white shadow-sm font-medium" : "text-[var(--pw-ink-2)]"}`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>
            <div className="mt-4 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid stroke="var(--pw-border)" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: "var(--pw-ink-2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--pw-ink-2)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<EarningsTooltip />} cursor={{ stroke: "var(--pw-accent)", strokeWidth: 1, strokeDasharray: "3 3" }} />
                        <Line type="monotone" dataKey="amount" stroke="var(--pw-accent)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function EarningsTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
        <div className="pw-card p-2.5 text-[12px] shadow-lg">
            <div className="font-medium">{label}</div>
            <div className="text-[var(--pw-accent)] font-display text-[16px]">${p.amount.toFixed(0)}</div>
            <div className="text-[var(--pw-ink-2)]">{p.count} session{p.count === 1 ? "" : "s"}</div>
        </div>
    );
}

function UpcomingSessions({ sessions, studentMap }: { sessions: SessionRow[]; studentMap: Map<string, ProfileLite> }) {
    return (
        <div className="pw-card p-5">
            <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Upcoming sessions</div>
            <div className="font-display text-[20px] mt-0.5">Next up</div>
            <div className="mt-4 space-y-3">
                {sessions.length === 0 ? (
                    <div className="text-[14px] text-[var(--pw-ink-2)] py-6 text-center">No upcoming sessions scheduled.</div>
                ) : sessions.map(s => {
                    const stu = s.student_id ? studentMap.get(s.student_id) : null;
                    const name = stu?.display_name ?? "Student";
                    const when = s.scheduled_at ? new Date(s.scheduled_at) : null;
                    return (
                        <div key={s.id} className="flex flex-wrap gap-3 items-center pw-border rounded-lg p-3">
                            <Avatar name={name} url={stu?.avatar_url} />
                            <div className="flex-1 min-w-0">
                                <div className="text-[14px] font-medium truncate">{name}</div>
                                <div className="text-[12px] text-[var(--pw-ink-2)] truncate">
                                    {s.subject ?? "Tutoring"} · {s.session_type ?? "1on1"}
                                </div>
                                {when && (
                                    <div className="text-[11px] text-[var(--pw-ink-2)] mt-0.5">
                                        {formatDistanceToNow(when, { addSuffix: true })} · {format(when, "MMM d, h:mm a")}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-1.5">
                                <button className="pw-btn-primary text-[12px] px-3 py-1.5" onClick={() => toast.info("Joining session…")}>Join</button>
                                <button className="pw-btn-outline text-[12px] px-3 py-1.5" onClick={() => toast.info("Messaging coming soon")}>Message</button>
                                <button className="pw-btn-outline text-[12px] px-3 py-1.5" onClick={() => toast.info("Reschedule coming soon")}>Reschedule</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function LeadFunnel({ leads }: { leads: LeadRow[] }) {
    const stages = [
        { key: "view", label: "Profile views" },
        { key: "message", label: "Messages" },
        { key: "trial", label: "Trial sessions" },
        { key: "paid", label: "Paid sessions" },
        { key: "repeat", label: "Repeat students" },
    ];
    const counts = stages.map(s => ({ ...s, count: leads.filter(l => l.stage === s.key).length }));
    const max = Math.max(1, counts[0].count);
    return (
        <div className="pw-card p-5">
            <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Lead funnel</div>
            <div className="font-display text-[20px] mt-0.5">Conversion</div>
            <div className="mt-4 space-y-2">
                {counts.map((s, i) => {
                    const w = (s.count / max) * 100;
                    const conv = i > 0 && counts[i - 1].count > 0 ? (s.count / counts[i - 1].count) * 100 : null;
                    return (
                        <div key={s.key}>
                            {conv != null && (
                                <div className="text-[10px] text-[var(--pw-ink-2)] text-center mb-0.5">
                                    ↓ {conv.toFixed(0)}% conv
                                </div>
                            )}
                            <div className="relative h-9 rounded-md overflow-hidden bg-[var(--pw-surface-2)]">
                                <div className="absolute inset-y-0 left-0 rounded-md transition-all"
                                    style={{ width: `${Math.max(8, w)}%`, background: `linear-gradient(90deg, var(--pw-accent), var(--pw-accent-3))`, opacity: 0.85 }} />
                                <div className="relative h-full px-3 flex items-center justify-between text-[12px]">
                                    <span className="font-medium">{s.label}</span>
                                    <span className="font-mono-pw">{s.count}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ProfileCompleteness({ data }: { data: ReturnType<typeof computeCompleteness> }) {
    const radius = 42, circ = 2 * Math.PI * radius;
    const offset = circ - (data.score / 100) * circ;
    return (
        <div className="pw-card p-5">
            <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Profile</div>
            <div className="font-display text-[20px] mt-0.5">Completeness</div>
            <div className="flex items-center gap-4 mt-3">
                <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
                    <circle cx="50" cy="50" r={radius} stroke="var(--pw-surface-2)" strokeWidth="10" fill="none" />
                    <circle cx="50" cy="50" r={radius} stroke="var(--pw-accent)" strokeWidth="10" fill="none"
                        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                        transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 600ms" }} />
                    <text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="600" fill="var(--pw-ink)">{data.score}%</text>
                </svg>
                <div className="flex-1 space-y-1.5">
                    {data.items.map(i => (
                        <div key={i.key} className="flex items-center gap-2 text-[12px]">
                            <span style={{ color: i.done ? "var(--pw-accent-2)" : "var(--pw-border)" }}>{i.done ? "✓" : "○"}</span>
                            <span className={i.done ? "text-[var(--pw-ink-2)] line-through" : ""}>{i.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            {data.score < 70 && (
                <Link to="/onboarding/tutor" className="pw-btn-primary mt-4 inline-block text-center w-full text-[13px] px-4 py-2">
                    Complete your profile
                </Link>
            )}
        </div>
    );
}

function ReviewsPreview({ reviews, studentMap }:
    { reviews: ReviewRow[]; studentMap: Map<string, ProfileLite> }) {
    const top3 = reviews.slice(0, 3);
    return (
        <div className="pw-card p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Reviews</div>
                    <div className="font-display text-[20px] mt-0.5">Latest feedback</div>
                </div>
                <div className="text-[11px] text-[var(--pw-ink-2)]">You typically respond in <span className="font-medium text-[var(--pw-ink)]">~3 hours</span></div>
            </div>
            <div className="mt-4 space-y-3">
                {top3.length === 0 ? (
                    <div className="text-[14px] text-[var(--pw-ink-2)] text-center py-6">No reviews yet.</div>
                ) : top3.map(r => {
                    const stu = r.student_id ? studentMap.get(r.student_id) : null;
                    const stars = r.rating ?? 0;
                    return (
                        <div key={r.id} className="pw-border rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <Avatar name={stu?.display_name ?? "Student"} url={stu?.avatar_url} small />
                                <span className="text-[13px] font-medium">{stu?.display_name ?? "Student"}</span>
                                <span className="text-[var(--pw-accent)] text-[12px] ml-auto">
                                    {"★".repeat(stars)}<span className="text-[var(--pw-border)]">{"★".repeat(5 - stars)}</span>
                                </span>
                            </div>
                            {r.body && <p className="mt-1.5 text-[13px] line-clamp-2">"{r.body}"</p>}
                        </div>
                    );
                })}
            </div>
            <button className="mt-4 text-[12px] text-[var(--pw-accent)] hover:underline" onClick={() => toast.info("Reviews page coming soon")}>
                View all reviews →
            </button>
        </div>
    );
}

function EarningsBreakdown({ earnings }: { earnings: EarningRow[] }) {
    const now = new Date();
    const last30 = earnings.filter(e => new Date(e.earned_at) >= new Date(now.getTime() - 30 * 86400000));
    const total = last30.reduce((s, e) => s + e.amount, 0);
    const avgPerSession = last30.length ? total / last30.length : 0;
    return (
        <div className="pw-card p-5">
            <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Last 30 days</div>
            <div className="font-display text-[20px] mt-0.5">At a glance</div>
            <div className="mt-4 space-y-3 text-[14px]">
                <Row label="Total earned" value={`$${total.toFixed(0)}`} />
                <Row label="Sessions paid" value={String(last30.length)} />
                <Row label="Avg / session" value={`$${avgPerSession.toFixed(0)}`} />
            </div>
            <button className="mt-4 pw-btn-outline w-full text-[13px] px-4 py-2" onClick={() => toast.info("Withdrawal flow coming soon")}>
                Withdraw earnings
            </button>
        </div>
    );
}
function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[var(--pw-ink-2)]">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

function QuickActionsBar() {
    const shareLink = async () => {
        const url = window.location.origin + "/matches";
        try { await navigator.clipboard.writeText(url); toast.success("Profile link copied!"); }
        catch { toast.error("Couldn't copy link"); }
    };
    return (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Link to="/onboarding/tutor" className="pw-btn-outline text-[13px] px-3 py-2 text-center">Update availability</Link>
            <Link to="/tutor/courses/new" className="pw-btn-outline text-[13px] px-3 py-2 text-center">Create new course</Link>
            <button onClick={() => toast.info("Withdrawal flow coming soon")} className="pw-btn-outline text-[13px] px-3 py-2">Withdraw earnings</button>
            <button onClick={shareLink} className="pw-btn-outline text-[13px] px-3 py-2">Share profile link</button>
        </div>
    );
}

function Avatar({ name, url, small }: { name: string; url?: string | null; small?: boolean }) {
    const size = small ? "w-7 h-7 text-[12px]" : "w-10 h-10 text-[14px]";
    if (url) return <img src={url} alt={name} className={`${size} rounded-full object-cover shrink-0`} />;
    const initial = name.charAt(0).toUpperCase();
    return (
        <div className={`${size} rounded-full flex items-center justify-center text-white font-medium shrink-0`}
            style={{ background: "var(--pw-accent)" }}>{initial}</div>
    );
}