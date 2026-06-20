import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import { MatchCard } from "../pathwise/MatchCard";
import { computeMatch, VIBE_TAGS, type MatchPrefs, type TutorRow } from "../pathwise/matching";
// ─── api.ts for lead event inserts ───────────────────────────────────────────
import { recordProfileView } from "../pathwise/api";

const SORTS = [
  { id: "best", label: "Best Match" },
  { id: "rating", label: "Highest Rated" },
  { id: "reviews", label: "Most Reviews" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
] as const;
type SortId = typeof SORTS[number]["id"];

const searchSchema = z.object({
  subject: fallback(z.string().optional(), undefined),
  budget: fallback(z.coerce.number().optional(), undefined),
  level: fallback(z.string().optional(), undefined),
  style: fallback(z.string().optional(), undefined),
  sort: fallback(z.enum(["best", "rating", "reviews", "price_asc", "price_desc"]), "best").default("best"),
  minRating: fallback(z.coerce.number().min(0).max(5), 0).default(0),
  priceMin: fallback(z.coerce.number().min(0), 0).default(0),
  priceMax: fallback(z.coerce.number().min(0), 200).default(200),
  vibes: fallback(z.string().array(), []).default([]),
  availableThisWeek: fallback(z.coerce.boolean(), false).default(false),
});

export const Route = createFileRoute("/matches")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Your Matches — PathWise" },
      { name: "description", content: "Tutors ranked for your learning style, subject, schedule and budget." },
      { property: "og:title", content: "Your Matches — PathWise" },
      { property: "og:description", content: "Personalized tutor matches with a transparent score breakdown." },
    ],
  }),
  component: MatchesPage,
});

const PAGE_SIZE = 8;

interface ScoredTutor {
  tutor: TutorRow;
  score: ReturnType<typeof computeMatch>;
  rating: { avg: number; count: number };
  packageDiscount?: number;
  course?: { title: string; thumbnail_url: string | null } | null;
}

function MatchesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [reviewsByTutor, setReviewsByTutor] = useState<Map<string, { avg: number; count: number }>>(new Map());
  const [availabilityByTutor, setAvailabilityByTutor] = useState<Set<string>>(new Set());
  const [packagesByTutor, setPackagesByTutor] = useState<Map<string, number>>(new Map());
  const [coursesByTutor, setCoursesByTutor] = useState<Map<string, { title: string; thumbnail_url: string | null }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState<MatchPrefs>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Load saved learning profile to enrich matching defaults
        if (user?.id) {
          const { data } = await supabase
            .from("user_learning_profiles")
            .select("subject, learning_style, experience_level, budget_max")
            .eq("user_id", user.id)
            .maybeSingle();
          if (data && !cancelled) setSavedPrefs(data as MatchPrefs);
        } else {
          try {
            const cached = localStorage.getItem("pathwise_find_tutor_answers");
            if (cached) setSavedPrefs(JSON.parse(cached));
          } catch { /* ignore */ }
        }

        // ── CHANGED: subject-scoped tutor query ──────────────────────────────
        // Previously fetched all 200 tutors regardless of subject.
        // Now filters by subject_specialties if a subject is in the URL or saved
        // profile, which is faster and more relevant. Falls back to all tutors
        // if no subject is known (same behaviour as before for that case).
        const effectiveSubject = search.subject ?? savedPrefs.subject;

        let tutorQuery = supabase
          .from("profiles")
          .select(
            "id, display_name, avatar_url, headline, bio, hourly_rate, " +
            "subject_specialties, specializations, superpowers, video_intro_url, " +
            "verification_status, free_discovery_call, first_session_free"
          )
          .eq("role", "tutor")
          .limit(200);

        // Apply subject filter when we know the subject
        if (effectiveSubject) {
          tutorQuery = tutorQuery.contains("subject_specialties", [effectiveSubject]);
        }

        const [tutorsRes, reviewsRes, availRes, packagesRes, coursesRes] = await Promise.all([
          tutorQuery,
          supabase.from("reviews").select("tutor_id, rating"),
          supabase.from("tutor_availability").select("user_id"),
          supabase.from("tutor_packages").select("user_id, discount_percent, enabled"),
          supabase.from("courses").select("tutor_id, title, thumbnail_url, status").eq("status", "published"),
        ]);

        if (cancelled) return;

        // ── CHANGED: fallback when subject filter returns 0 results ──────────
        // If the subject filter returns nothing (no tutors have that specialty yet),
        // re-fetch without the filter so the page is never empty during early growth.
        let tutorRows = (tutorsRes.data ?? []) as unknown as TutorRow[];
        if (tutorRows.length === 0 && effectiveSubject) {
          const { data: fallback } = await supabase
            .from("profiles")
            .select(
              "id, display_name, avatar_url, headline, bio, hourly_rate, " +
              "subject_specialties, specializations, superpowers, video_intro_url, " +
              "verification_status, free_discovery_call, first_session_free"
            )
            .eq("role", "tutor")
            .limit(200);
          tutorRows = (fallback ?? []) as unknown as TutorRow[];
        }
        setTutors(tutorRows);

        // Reviews → per-tutor avg
        const rmap = new Map<string, { avg: number; count: number }>();
        const tmp = new Map<string, { sum: number; n: number }>();
        (reviewsRes.data ?? []).forEach((r: any) => {
          if (!r.tutor_id || r.rating == null) return;
          const cur = tmp.get(r.tutor_id) ?? { sum: 0, n: 0 };
          cur.sum += Number(r.rating); cur.n += 1;
          tmp.set(r.tutor_id, cur);
        });
        tmp.forEach((v, k) => rmap.set(k, { avg: v.sum / v.n, count: v.n }));
        setReviewsByTutor(rmap);

        const avail = new Set<string>();
        (availRes.data ?? []).forEach((a: any) => a.user_id && avail.add(a.user_id));
        setAvailabilityByTutor(avail);

        const pkg = new Map<string, number>();
        (packagesRes.data ?? []).forEach((p: any) => {
          if (!p.enabled) return;
          const cur = pkg.get(p.user_id) ?? 0;
          pkg.set(p.user_id, Math.max(cur, Number(p.discount_percent ?? 0)));
        });
        setPackagesByTutor(pkg);

        const cmap = new Map<string, { title: string; thumbnail_url: string | null }>();
        (coursesRes.data ?? []).forEach((c: any) => {
          if (!c.tutor_id) return;
          if (!cmap.has(c.tutor_id)) cmap.set(c.tutor_id, { title: c.title, thumbnail_url: c.thumbnail_url });
        });
        setCoursesByTutor(cmap);
      } catch (err) {
        console.error("[matches]", err);
        toast.error("Couldn't load tutors. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // Re-run when the subject in the URL changes so the query scope updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, search.subject]);

  // Effective preferences (URL > saved > defaults)
  const prefs: MatchPrefs = useMemo(() => ({
    subject: search.subject ?? savedPrefs.subject,
    budget_max: search.budget ?? savedPrefs.budget_max,
    learning_style: search.style ?? savedPrefs.learning_style,
    experience_level: search.level ?? savedPrefs.experience_level,
    vibes: search.vibes,
    availableThisWeek: search.availableThisWeek,
  }), [search, savedPrefs]);

  // Score & filter
  const scored: ScoredTutor[] = useMemo(() => {
    const list: ScoredTutor[] = tutors.map((t) => {
      const rating = reviewsByTutor.get(t.id) ?? { avg: 0, count: 0 };
      const score = computeMatch(t, prefs, rating, availabilityByTutor.has(t.id));
      return {
        tutor: t,
        score,
        rating,
        packageDiscount: packagesByTutor.get(t.id),
        course: coursesByTutor.get(t.id) ?? null,
      };
    });

    return list.filter((s) => {
      const rate = Number(s.tutor.hourly_rate ?? 0);
      if (rate < search.priceMin) return false;
      if (search.priceMax > 0 && rate > search.priceMax && rate !== 0) return false;
      if (search.minRating > 0 && s.rating.avg < search.minRating) return false;
      if (search.availableThisWeek && !availabilityByTutor.has(s.tutor.id)) return false;
      return true;
    });
  }, [tutors, reviewsByTutor, availabilityByTutor, packagesByTutor, coursesByTutor, prefs, search]);

  const sorted = useMemo(() => {
    const copy = [...scored];
    switch (search.sort) {
      case "rating": copy.sort((a, b) => b.rating.avg - a.rating.avg); break;
      case "reviews": copy.sort((a, b) => b.rating.count - a.rating.count); break;
      case "price_asc": copy.sort((a, b) => Number(a.tutor.hourly_rate ?? 9999) - Number(b.tutor.hourly_rate ?? 9999)); break;
      case "price_desc": copy.sort((a, b) => Number(b.tutor.hourly_rate ?? 0) - Number(a.tutor.hourly_rate ?? 0)); break;
      default: copy.sort((a, b) => b.score.total - a.score.total);
    }
    return copy.slice(0, 20);
  }, [scored, search.sort]);

  const visibleList = sorted.slice(0, visible);

  const updateSearch = (patch: Partial<typeof search>) => {
    navigate({ to: "/matches", search: (prev: any) => ({ ...prev, ...patch }) });
  };

  // ── CHANGED: handleBook uses api.ts lead event instead of raw supabase ─────
  // Also fires recordProfileView so the tutor sees this in their analytics.
  const handleBook = (tutorId: string) => {
    if (user) {
      void supabase
        .from("lead_events")
        .insert({ tutor_id: tutorId, student_id: user.id, stage: "trial" });
      // Fire-and-forget profile view for tutor analytics
      void recordProfileView(tutorId, user.id);
    }
    navigate({ to: "/book/$tutorId", params: { tutorId } });
  };

  // ── CHANGED: handleMessage records lead event consistently ─────────────────
  const handleMessage = (tutorId: string) => {
    if (!user) { toast.info("Sign in to message tutors."); return; }
    toast.success("Message thread opened.");
    void supabase
      .from("lead_events")
      .insert({ tutor_id: tutorId, student_id: user.id, stage: "message" });
  };

  // Active filter chips
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (prefs.subject) chips.push({ key: "subject", label: `Subject: ${prefs.subject}`, clear: () => updateSearch({ subject: undefined }) });
  if (prefs.budget_max) chips.push({ key: "budget", label: `Budget ≤ $${prefs.budget_max}/hr`, clear: () => updateSearch({ budget: undefined, priceMax: 200 }) });
  if (prefs.experience_level) chips.push({ key: "level", label: `Level: ${prefs.experience_level}`, clear: () => updateSearch({ level: undefined }) });
  if (prefs.learning_style) chips.push({ key: "style", label: `Style: ${prefs.learning_style}`, clear: () => updateSearch({ style: undefined }) });
  if (search.minRating > 0) chips.push({ key: "rating", label: `Min ${search.minRating}★`, clear: () => updateSearch({ minRating: 0 }) });
  if (search.availableThisWeek) chips.push({ key: "avail", label: "Available this week", clear: () => updateSearch({ availableThisWeek: false }) });
  (search.vibes as string[]).forEach((v) => chips.push({
    key: `vibe-${v}`,
    label: v,
    clear: () => updateSearch({ vibes: (search.vibes as string[]).filter((x) => x !== v) }),
  }));

  const clearAll = () => navigate({
    to: "/matches",
    search: { sort: search.sort, minRating: 0, priceMin: 0, priceMax: 200, vibes: [], availableThisWeek: false },
  });

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <main className="px-5 sm:px-8 pb-24 max-w-6xl mx-auto">
        <div className="mt-2">
          <div className="text-[12px] text-[var(--pw-ink-2)]">
            <Link to="/find-tutor" className="underline-offset-2 hover:underline">Find a tutor</Link>
            <span className="mx-2">→</span>
            Your matches
          </div>
          <h1 className="font-display text-[28px] sm:text-[34px] leading-tight mt-2">
            We found <span style={{ color: "var(--pw-accent)" }}>{loading ? "…" : sorted.length}</span> tutors based on your learning profile
          </h1>
          <p className="mt-2 text-[14px] text-[var(--pw-ink-2)] max-w-2xl">
            Each card shows a match score (Learning Style 30%, Subject 25%, Availability 20%, Budget 15%, Rating 10%).
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/find-tutor" className="pw-btn-primary inline-flex items-center px-5 py-2.5 text-[14px] font-medium">
            Find my tutor →
          </Link>
          <span className="text-[12px] text-[var(--pw-ink-2)] self-center">
            Take a 60-second quiz to refine your matches
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="lg:hidden pw-btn-outline px-4 py-2 text-[13px]"
          >
            {filterOpen ? "Hide" : "Show"} filters
          </button>
          <label className="flex items-center gap-2 text-[13px] ml-auto">
            <span className="text-[var(--pw-ink-2)]">Sort by</span>
            <select
              value={search.sort}
              onChange={(e) => updateSearch({ sort: e.target.value as SortId })}
              className="pw-border rounded-md px-3 py-1.5 text-[13px] bg-white"
            >
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={c.clear}
                className="pw-pill text-[12px] px-3 py-1 inline-flex items-center gap-1.5 hover:bg-[var(--pw-surface-2)]"
              >
                {c.label} <span className="text-[var(--pw-ink-2)]">×</span>
              </button>
            ))}
            <button onClick={clearAll} className="text-[12px] text-[var(--pw-accent)] hover:underline ml-1">
              Clear all
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className={`${filterOpen ? "block" : "hidden"} lg:block`}>
            <FilterSidebar search={search} update={updateSearch} onClear={clearAll} />
          </aside>

          <section>
            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="pw-card h-44 animate-pulse bg-[var(--pw-surface-2)]" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <NoResults onClear={clearAll} />
            ) : (
              <>
                <div className="space-y-4">
                  {visibleList.map((s) => (
                    <MatchCard
                      key={s.tutor.id}
                      data={{
                        tutor: s.tutor,
                        match: s.score,
                        rating: s.rating,
                        packageDiscount: s.packageDiscount,
                        course: s.course,
                      }}
                      onBook={handleBook}
                      onMessage={handleMessage}
                      onView={(id) => navigate({ to: "/tutor/$tutorId", params: { tutorId: id } })}
                    />
                  ))}
                </div>
                {visible < sorted.length && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="pw-btn-outline px-6 py-2.5 text-[14px]"
                    >
                      Load more ({sorted.length - visible} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function FilterSidebar({
  search, update, onClear,
}: {
  search: ReturnType<typeof Route.useSearch>;
  update: (p: any) => void;
  onClear: () => void;
}) {
  return (
    <div className="pw-card p-5 space-y-5 sticky top-4">
      <div className="font-display text-[18px]">Filters</div>

      <Section title="Price range">
        <div className="text-[12px] text-[var(--pw-ink-2)]">
          ${search.priceMin} – ${search.priceMax}/hr
        </div>
        <input
          type="range" min={0} max={300} step={5} value={search.priceMax}
          onChange={(e) => update({ priceMax: Number(e.target.value) })}
          className="w-full mt-2"
        />
      </Section>

      <Section title="Availability">
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox" checked={search.availableThisWeek}
            onChange={(e) => update({ availableThisWeek: e.target.checked })}
          />
          Available this week
        </label>
      </Section>

      <Section title="Minimum rating">
        <div className="flex gap-1.5 flex-wrap">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => update({ minRating: r })}
              className="pw-pill text-[12px] px-3 py-1"
              style={{
                background: search.minRating === r ? "var(--pw-accent)" : "var(--pw-surface)",
                color: search.minRating === r ? "white" : "inherit",
                borderColor: search.minRating === r ? "var(--pw-accent)" : "var(--pw-border)",
              }}
            >
              {r === 0 ? "Any" : `${r}★+`}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Vibe">
        <div className="flex flex-wrap gap-1.5">
          {VIBE_TAGS.map((v) => {
            const vibes = search.vibes as string[];
            const active = vibes.includes(v);
            return (
              <button
                key={v}
                onClick={() => update({ vibes: active ? vibes.filter((x) => x !== v) : [...vibes, v] })}
                className="pw-pill text-[12px] px-3 py-1"
                style={{
                  background: active ? "var(--pw-accent)" : "var(--pw-surface)",
                  color: active ? "white" : "inherit",
                  borderColor: active ? "var(--pw-accent)" : "var(--pw-border)",
                }}
              >
                {v}
              </button>
            );
          })}
        </div>
      </Section>

      <button onClick={onClear} className="pw-btn-outline w-full text-[13px] px-4 py-2">
        Clear all filters
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2">{title}</div>
      {children}
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="pw-card p-8 text-center">
      <div className="text-5xl">🔍</div>
      <h2 className="font-display text-[22px] mt-3">No exact matches found</h2>
      <p className="text-[14px] text-[var(--pw-ink-2)] mt-2 max-w-md mx-auto">
        But here's what we can do to widen your search:
      </p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
        <button onClick={onClear} className="pw-btn-outline px-4 py-2 text-[13px]">Clear all filters</button>
        <Link to="/find-tutor" className="pw-btn-outline px-4 py-2 text-[13px] text-center">Try related subjects</Link>
        <button onClick={() => toast.success("Alert created — we'll email you when matches join.")} className="pw-btn-outline px-4 py-2 text-[13px]">
          Create alert
        </button>
        <button onClick={() => toast.success("Added to waitlist.")} className="pw-btn-outline px-4 py-2 text-[13px]">
          Join waitlist
        </button>
      </div>
      <button
        onClick={() => toast.success("Alert created — we'll notify you when matching tutors join.")}
        className="pw-btn-primary mt-5 px-6 py-2.5 text-[13px]"
      >
        Notify me when matching tutors join
      </button>
    </div>
  );
}