import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "../pathwise/auth";
import { RoleGate } from "../pathwise/RoleGate";
import { supabase } from "@/integrations/supabase/client";
import type { Subject } from "../pathwise/data";
import { BAND_META, isLevelBand, subjectFromSlug, type LevelBand } from "../pathwise/levels";
import {
  fetchLibraryCourses,
  groupByBand,
  type LibraryCourse,
} from "../pathwise/course-matching";

const searchSchema = z.object({
  // Optional so /library is a valid destination on its own; the roadmap's
  // "Start here" deep-links with all four so the shelf opens at the student's band.
  subject: fallback(z.string().optional(), undefined),
  band: fallback(z.coerce.number().int().min(1).max(5).optional(), undefined),
  roadmapId: fallback(z.string().optional(), undefined),
  stage: fallback(z.coerce.number().int().min(1).optional(), undefined),
});

export const Route = createFileRoute("/_app/library")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Course Library — PathWise" },
      {
        name: "description",
        content:
          "Every course on PathWise, shelved by level band and indexed by tutor, so you can see what sits at, above and below where you placed.",
      },
      { property: "og:title", content: "Course Library — PathWise" },
      { property: "og:url", content: "/library" },
    ],
    links: [{ rel: "canonical", href: "/library" }],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <RoleGate allow={["student", "both"]}>
      <LibraryPageInner />
    </RoleGate>
  );
}

/** What the student's roadmap tells us about them — the library's second gate. */
interface RoadmapContext {
  id: string;
  subject: Subject | null;
  band: LevelBand | null;
}

function LibraryPageInner() {
  const { supabaseUser, loading: authLoading } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState<RoadmapContext | null>(null);
  const [courses, setCourses] = useState<LibraryCourse[]>([]);
  const [matchedTutorCount, setMatchedTutorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Which band the shelf is scrolled to. URL wins, then the roadmap's band.
  const activeBand: LevelBand | null = isLevelBand(search.band)
    ? search.band
    : (roadmap?.band ?? null);

  const subject: Subject | null =
    subjectFromSlug(search.subject) ?? roadmap?.subject ?? null;

  // ── Gate 2: you need a roadmap, which only exists once you've taken the quiz ──
  useEffect(() => {
    if (authLoading) return;
    if (!supabaseUser) return;
    let cancelled = false;

    (async () => {
      const { data, error: rErr } = await supabase
        .from("roadmaps")
        .select("id, subject, level_band")
        .eq("user_id", supabaseUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (rErr) {
        setError("Couldn't load your roadmap.");
        setLoading(false);
        return;
      }
      setRoadmap(
        data
          ? {
              id: data.id,
              subject: subjectFromSlug(data.subject),
              band: isLevelBand(data.level_band) ? data.level_band : null,
            }
          : null,
      );
      if (!data) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [supabaseUser, authLoading]);

  // ── Catalogue ──
  useEffect(() => {
    if (!roadmap || !subject) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetchLibraryCourses({
          userId: supabaseUser?.id ?? null,
          subject,
        });
        if (cancelled) return;
        setCourses(res.courses);
        setMatchedTutorCount(res.matchedTutorCount);
      } catch {
        if (!cancelled) setError("Couldn't load the course library.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roadmap, subject, supabaseUser]);

  const byBand = useMemo(() => groupByBand(courses), [courses]);

  const setBand = (band: LevelBand | null) =>
    navigate({ to: "/library", search: { ...search, band: band ?? undefined }, replace: true });

  if (authLoading || (loading && !error)) {
    return (
      <div className="grid place-items-center py-32 text-[var(--pw-ink-2)]">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  // ── Gate 2 failure: no roadmap means no quiz ──
  if (!roadmap) {
    return (
      <main className="px-5 sm:px-8 py-16 max-w-lg mx-auto text-center">
        <div className="text-5xl">📚</div>
        <h1 className="font-display text-[28px] mt-3">The library opens after your quiz</h1>
        <p className="mt-2 text-[14px] text-[var(--pw-ink-2)]">
          Courses here are shelved by level, so we need to know where you're starting
          from before it's any use to you. The quiz takes about two minutes.
        </p>
        <Link to="/quiz" className="pw-btn-primary inline-block mt-6 px-5 py-2.5 text-[14px]">
          Take the quiz →
        </Link>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-5 sm:px-8 py-16 max-w-lg mx-auto text-center">
        <div className="text-5xl">⚠️</div>
        <h1 className="font-display text-[28px] mt-3">{error}</h1>
        <button
          onClick={() => window.location.reload()}
          className="pw-btn-outline mt-6 px-5 py-2.5 text-[14px]"
        >
          Try again
        </button>
      </main>
    );
  }

  const shelf: LibraryCourse[] = activeBand ? byBand[activeBand] : courses;
  const openLevel = byBand.open;

  return (
    <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
            Course Library
          </div>
          <h1 className="font-display text-[34px] sm:text-[40px] leading-tight mt-1">
            Courses at your level
          </h1>
          <p className="mt-2 text-[14px] text-[var(--pw-ink-2)] max-w-2xl">
            {roadmap.band ? (
              <>
                You placed at <strong>{BAND_META[roadmap.band].label}</strong>. Courses at
                your band come first — the shelves above and below are open too, so you
                can stretch or consolidate.
              </>
            ) : (
              <>Everything published for your subject, shelved by level.</>
            )}
            {matchedTutorCount > 0 && (
              <> Courses from your {matchedTutorCount} matched tutors are marked.</>
            )}
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Band rail — the dashboard's sidebar shape, in library terms */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2">
              Level
            </div>
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1">
              <BandPill
                label="All levels"
                count={courses.length}
                active={activeBand === null}
                onClick={() => setBand(null)}
              />
              {([1, 2, 3, 4, 5] as LevelBand[]).map((b) => (
                <BandPill
                  key={b}
                  label={`${BAND_META[b].emoji} ${BAND_META[b].label}`}
                  count={byBand[b].length}
                  active={activeBand === b}
                  isYours={roadmap.band === b}
                  onClick={() => setBand(b)}
                />
              ))}
            </div>
          </aside>

          {/* Shelf */}
          <section>
            {shelf.length === 0 ? (
              <div className="pw-card p-12 text-center text-[var(--pw-ink-2)]">
                No courses on this shelf yet.
                {activeBand && (
                  <button
                    onClick={() => setBand(null)}
                    className="block mx-auto mt-2 text-[var(--pw-accent)] underline"
                  >
                    Show every level
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shelf.map((c) => (
                  <CourseCard key={c.id} course={c} yourBand={roadmap.band} />
                ))}
              </div>
            )}

            {/* Band-less courses are relevant to every shelf, so they trail it. */}
            {activeBand && openLevel.length > 0 && (
              <>
                <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mt-10 mb-3">
                  Open to every level
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {openLevel.map((c) => (
                    <CourseCard key={c.id} course={c} yourBand={roadmap.band} />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        {/* Back to the stage that sent us here */}
        {search.stage != null && (
          <div className="mt-12 text-center">
            <Link to="/roadmap" className="pw-btn-outline px-5 py-2.5 text-[14px]">
              ← Back to your roadmap
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function BandPill({
  label,
  count,
  active,
  isYours,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  isYours?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="pw-pill text-[12px] px-3 py-2 text-left whitespace-nowrap transition-colors lg:w-full flex items-center justify-between gap-2"
      style={{
        background: active ? "var(--pw-accent)" : "var(--pw-surface)",
        color: active ? "#fff" : "var(--pw-ink)",
        border: `1.5px solid ${active ? "var(--pw-accent)" : "var(--pw-border)"}`,
      }}
    >
      <span>
        {label}
        {isYours && !active && (
          <span className="ml-1.5 text-[var(--pw-accent)]" title="Your level">
            ●
          </span>
        )}
      </span>
      <span className="text-[11px] opacity-70">{count}</span>
    </button>
  );
}

function CourseCard({
  course,
  yourBand,
}: {
  course: LibraryCourse;
  yourBand: LevelBand | null;
}) {
  const atYourLevel = yourBand != null && course.band === yourBand;

  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug ?? course.id }}
      className="pw-card p-4 flex flex-col transition-colors hover:border-[var(--pw-accent)]"
      style={{ borderColor: atYourLevel ? "var(--pw-accent)" : "var(--pw-border)" }}
    >
      {course.thumbnail_url && (
        <img
          src={course.thumbnail_url}
          alt=""
          className="w-full h-32 object-cover rounded-md mb-3"
        />
      )}

      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {course.band && (
          <span
            className="pw-pill text-[11px] px-2 py-0.5"
            style={{ background: "var(--pw-surface-2)" }}
          >
            {BAND_META[course.band].emoji} {BAND_META[course.band].label}
          </span>
        )}
        {course.fromMatchedTutor && (
          <span
            className="pw-pill text-[11px] px-2 py-0.5"
            style={{ background: "var(--pw-accent-soft)", color: "var(--pw-accent)" }}
          >
            ★ Your match
          </span>
        )}
      </div>

      <h3 className="font-display text-[17px] leading-tight">{course.title}</h3>
      {course.subtitle && (
        <p className="text-[13px] text-[var(--pw-ink-2)] mt-1 line-clamp-2">{course.subtitle}</p>
      )}

      <div className="mt-auto pt-3 flex items-center justify-between gap-2 text-[12px] text-[var(--pw-ink-2)]">
        <span className="truncate">{course.tutorName ?? "PathWise tutor"}</span>
        {course.price != null && (
          <span className="whitespace-nowrap">
            {course.discount_price != null && course.discount_price < course.price ? (
              <>
                <span className="line-through opacity-60">{course.price}</span>{" "}
                {course.discount_price} {course.currency}
              </>
            ) : (
              <>
                {course.price} {course.currency}
              </>
            )}
          </span>
        )}
      </div>
    </Link>
  );
}
