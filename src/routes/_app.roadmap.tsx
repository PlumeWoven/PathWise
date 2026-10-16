import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { burst } from "@/lib/celebrate";
import { toast } from "sonner";
import { LEVEL_META, Subject, Level } from "../pathwise/data";
import { Icon, type IconName } from "@/components/Icon";
import { GOAL_LABELS, usePW } from "../pathwise/store";
import { StageDetailModal } from "../pathwise/StageDetailModal";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "../pathwise/auth";
import { RoleGate } from "../pathwise/RoleGate";
// ─── api.ts replaces inline supabase calls ───────────────────────────────────
import {
  getRoadmapWithStages,
  completeStage,
  getRoadmapEnrollments,
  claimGuestResults,
  type StageEnrollment,
} from "../pathwise/api";
import { requireAuth } from "../lib/authGuard";
import { supabase } from "@/integrations/supabase/client";
import {
  BAND_META,
  clampBand,
  tutorQuizSubjectFor,
  LEVEL_TO_BAND,
  requiredBandForStage,
  type LevelBand,
} from "../pathwise/levels";
import { MatchedTutorsPanel } from "../pathwise/MatchedTutorsPanel";

interface DBStage {
  id: string;
  roadmap_id: string;
  stage_number: number;
  title: string;
  skills: string[] | null;
  status: "active" | "locked" | "complete" | string;
  completed_at: string | null;
  /** Course level this stage demands. Null on roadmaps built before gating. */
  required_level_id: string | null;
  required_level_band: number | null;
}

interface DBRoadmap {
  id: string;
  user_id: string | null;
  subject: string | null;
  goal: string | null;
  current_stage: number;
  total_stages: number;
  level_band: number | null;
  level_id: string | null;
}

type RoadmapSearch = { roadmapId?: string };

export const Route = createFileRoute("/_app/roadmap")({
  validateSearch: (search: Record<string, unknown>): RoadmapSearch => ({
    roadmapId: typeof search.roadmapId === "string" ? search.roadmapId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Your roadmap · PathWise" },
      {
        name: "description",
        content: "A five-stage roadmap from your level to your goal.",
      },
      { property: "og:title", content: "Your roadmap · PathWise" },
      {
        property: "og:description",
        content: "A five-stage roadmap from your level to your goal.",
      },
      { property: "og:url", content: "/roadmap" },
    ],
    links: [{ rel: "canonical", href: "/roadmap" }],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  return (
    <RoleGate allow={["student", "both"]} allowAnonymous>
      <RoadmapPageInner />
    </RoleGate>
  );
}

function RoadmapPageInner() {
  const pw = usePW();
  const { isLoggedIn, openLogin, user } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [roadmap, setRoadmap] = useState<DBRoadmap | null>(null);
  const [stages, setStages] = useState<DBStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openStage, setOpenStage] = useState<number | null>(null);
  const [completing, setCompleting] = useState<number | null>(null);
  const [overlay, setOverlay] = useState<{
    stageNumber: number;
    nextTitle: string | null;
    xp: number;
  } | null>(null);
  const [showAnonToast, setShowAnonToast] = useState(false);
  // Live enrollments keyed by stage id — drives the course gate on each card.
  const [enrollments, setEnrollments] = useState<Map<string, StageEnrollment>>(new Map());
  // Band recovered from the linked diagnostic, for roadmaps written before
  // roadmaps.level_band existed. The migration backfills this column, but the
  // page shouldn't guess in the meantime.
  const [diagnosticBand, setDiagnosticBand] = useState<LevelBand | null>(null);

  // ─── FIX 3: Resolve roadmap ID from localStorage or database ───────────────────────
  async function resolveRoadmapId(): Promise<string | null> {
    // 1. Check localStorage first (immediate, no network)
    const localId = localStorage.getItem("pathwise_roadmap_id");
    if (localId) return localId;

    // 2. If authenticated, look up by user_id in the database
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from("roadmaps")
        .select("id")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) return data.id;
    }

    // 3. Also check URL params (if you use /roadmap/:id routing)
    // const urlId = /* parse from URL */;
    // if (urlId) return urlId;

    return null; // No roadmap — user needs to take the quiz
  }

  const [roadmapId, setRoadmapId] = useState<string | null>(null);

  useEffect(() => {
    async function initRoadmap() {
      const id = await resolveRoadmapId();
      setRoadmapId(id);
      if (!id) {
        navigate({ to: "/quiz" });
        return;
      }
      void fetchRoadmap(id);
      if (!isLoggedIn) setShowAnonToast(true);
    }
    initRoadmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // ─── CHANGED: getRoadmapWithStages from api.ts ────────────────────────────
  // Previously called supabase directly with two parallel queries.
  // Now delegates to api.ts which does the same thing consistently.
  // One difference: api.ts fetches by user_id (most recent roadmap for the user).
  // For the roadmap page we still need to fetch by roadmapId from the URL/localStorage,
  // so we keep a lightweight direct fetch here scoped to the specific roadmapId.
  async function fetchRoadmap(roadmapId: string) {
    console.log("[roadmap] fetchRoadmap called");
    console.log("[roadmap] roadmapId:", roadmapId);
    if (!roadmapId) {
      console.log("[roadmap] No roadmapId, redirecting to quiz");
      navigate({ to: "/quiz" });
      return;
    }
    setLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");

      // Claim this browser's guest results first, so the fetch below sees
      // them as the user's own.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) await claimGuestResults();

      console.log("[roadmap] Fetching roadmap and stages from Supabase...");
      const [{ data: rm, error: rErr }, { data: st, error: sErr }] = await Promise.all([
        supabase.from("roadmaps").select("*").eq("id", roadmapId).maybeSingle(),
        supabase
          .from("roadmap_stages")
          .select("*")
          .eq("roadmap_id", roadmapId)
          .order("stage_number"),
      ]);
      console.log("[roadmap] Supabase responses:", { rm, rErr, st, sErr });

      if (rErr) throw rErr;
      if (sErr) throw sErr;

      if (!rm) {
        console.log("[roadmap] Roadmap not found");
        // If authenticated and still not found, try loading by user_id as fallback
        if (session?.user) {
          const { data: userRm } = await supabase
            .from("roadmaps")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (userRm) {
            console.log("[roadmap] Found roadmap by user_id:", userRm.id);
            // Set this as the active roadmap and continue
            setRoadmap(userRm);
            // Also fetch stages for this roadmap
            const { data: userStages } = await supabase
              .from("roadmap_stages")
              .select("*")
              .eq("roadmap_id", userRm.id)
              .order("stage_number");
            if (userStages) setStages(userStages);
            return;
          }
        }
        // If authenticated but no roadmap found, try loading their latest roadmap
        if (session?.user) {
          const { data: latestRm } = await supabase
            .from("roadmaps")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestRm) {
            console.log("[roadmap] Found latest roadmap by user_id:", latestRm.id);
            setRoadmap(latestRm);
            const { data: latestStages } = await supabase
              .from("roadmap_stages")
              .select("*")
              .eq("roadmap_id", latestRm.id)
              .order("stage_number");
            if (latestStages) setStages(latestStages);
            return;
          }
        }
        toast.error("Roadmap not found.");
        navigate({ to: "/quiz" });
        return;
      }

      console.log("[roadmap] Roadmap loaded successfully:", rm.id, rm.user_id);
      setRoadmap(rm as DBRoadmap);
      setStages((st ?? []) as DBStage[]);
      console.log("[roadmap] Stages loaded:", (st ?? []).length);
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string; hint?: string; details?: unknown };
      console.error("[roadmap] fetch error", err);
      console.error("[roadmap] Error details:", {
        message: e?.message,
        code: e?.code,
        hint: e?.hint,
        details: e?.details,
      });
      toast.error(e?.message || "Couldn't load your roadmap.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Trial gate: a finished trial lesson not yet used by another stage ─────
  // The database picks the session when the stage is completed; this only
  // decides whether "Mark stage complete" is offered.
  const [trialCredit, setTrialCredit] = useState(false);
  useEffect(() => {
    if (!user?.id) {
      setTrialCredit(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [trials, used] = await Promise.all([
        supabase
          .from("sessions")
          .select("id")
          .eq("student_id", user.id)
          .eq("session_type", "trial")
          .in("status_v2", ["completed", "awaiting_review", "closed"]),
        supabase
          .from("roadmap_stages")
          .select("completed_by_session_id")
          .not("completed_by_session_id", "is", null),
      ]);
      if (cancelled) return;
      const usedIds = new Set((used.data ?? []).map((u) => u.completed_by_session_id));
      setTrialCredit((trials.data ?? []).some((t) => !usedIds.has(t.id)));
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, stages]);

  // ─── Course gate: which stages have their required course finished ────────
  // fetchRoadmap has several early-return paths, so this hangs off the resolved
  // roadmap id rather than being threaded through each of them.
  useEffect(() => {
    if (!roadmap?.id || !isLoggedIn) {
      setEnrollments(new Map());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await getRoadmapEnrollments(roadmap.id);
        if (cancelled) return;
        const byStage = new Map<string, StageEnrollment>();
        rows.forEach((e) => {
          if (e.roadmap_stage_id) byStage.set(e.roadmap_stage_id, e);
        });
        setEnrollments(byStage);
      } catch (err) {
        console.error("[roadmap] enrollments", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roadmap?.id, isLoggedIn]);

  // Recover the placement band from the diagnostic when the roadmap row
  // predates the level_band column.
  useEffect(() => {
    const rm = roadmap as (DBRoadmap & { diagnostic_id?: string | null }) | null;
    if (!rm || rm.level_band != null || !rm.diagnostic_id) {
      setDiagnosticBand(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("diagnostic_results")
        .select("level, level_band")
        .eq("id", rm.diagnostic_id!)
        .maybeSingle();
      if (cancelled || !data) return;
      const band =
        data.level_band != null
          ? clampBand(data.level_band)
          : (LEVEL_TO_BAND[data.level as Level] ?? null);
      setDiagnosticBand(band);
    })();
    return () => {
      cancelled = true;
    };
  }, [roadmap]);

  /**
   * A stage is gated only when it names a required level. It unlocks with a
   * finished course at that level, or a finished trial lesson (the database
   * enforces the same rule). Roadmaps created before course matching existed
   * have no requirement and behave as before.
   */
  function requirementFor(stage: DBStage) {
    const enrollment = enrollments.get(stage.id) ?? null;
    const gated = !!stage.required_level_id;
    const courseDone = enrollment?.status === "completed";
    return {
      gated,
      enrollment,
      viaTrial: gated && !courseDone && trialCredit,
      met: !gated || courseDone || trialCredit,
    };
  }

  async function handleChooseCourse(stage: DBStage) {
    if (!roadmap) return;
    if (await requireAuth(roadmap.id)) goToCourseMatch(stage);
  }

  /** Tutors for this subject; booking asks for an account at its own step. */
  function goToTutors() {
    navigate({ to: "/matches", search: { subject: tutorQuizSubjectFor(subject) ?? subject } as any });
  }

  function goToCourseMatch(stage: DBStage) {
    if (!roadmap) return;
    navigate({
      to: "/course-match",
      search: { roadmapId: roadmap.id, stage: stage.stage_number },
    });
  }

  async function handleMarkComplete(stage: DBStage) {
    if (completing !== null) return;
    if (stage.status !== "active") return;
    if (!roadmap) return;

    // Require authentication before marking stage complete
    const authenticated = await requireAuth(roadmap.id);
    if (!authenticated) return;

    // ─── Course gate ────────────────────────────────────────────────────────
    // The stage can't be ticked off until a course matching this student's
    // level — and taught by one of their matched tutors — has been completed.
    // Clicking through sends them to the matched course search instead.
    const requirement = requirementFor(stage);
    if (!requirement.met) {
      goToCourseMatch(stage);
      return;
    }

    setCompleting(stage.stage_number);
    try {
      await completeStage(roadmap.id, stage.stage_number);

      // Optimistic local update (same as before)
      const next = stages.find((s) => s.stage_number === stage.stage_number + 1);
      setStages((prev) =>
        prev.map((s) => {
          if (s.id === stage.id)
            return { ...s, status: "complete", completed_at: new Date().toISOString() };
          if (next && s.id === next.id) return { ...s, status: "active" };
          return s;
        }),
      );
      setRoadmap({ ...roadmap, current_stage: stage.stage_number + 1 });

      // Confetti (skipped under reduced motion) + the completion dialog
      const fire = (origin: { x: number; y: number }) =>
        burst({ particleCount: 90, spread: 75, origin });
      fire({ x: 0.3, y: 0.5 });
      fire({ x: 0.7, y: 0.5 });
      setTimeout(() => fire({ x: 0.5, y: 0.4 }), 250);

      setOverlay({
        stageNumber: stage.stage_number,
        nextTitle: next?.title ?? null,
        xp: 100,
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error("[roadmap] mark complete", err);
      // The database enforces the same gate, so a stale UI lands here.
      if (e?.message === "STAGE_COURSE_REQUIRED") {
        toast.error("Finish a course at this level, or a trial lesson, first.");
        goToCourseMatch(stage);
      } else {
        toast.error(e?.message || "Couldn't mark stage complete.");
      }
    } finally {
      setCompleting(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
        <main className="px-6 sm:px-8 pt-24 text-center text-[var(--pw-ink-2)]">
          Loading your roadmap…
        </main>
      </div>
    );
  }

  if (!roadmap) return null;

  const subject = (roadmap.subject ?? pw.subject ?? "Mathematics") as Subject;
  // The band is persisted on the roadmap, so the level survives a page reload —
  // the in-memory store only holds it for the length of the quiz session.
  const baseBand: LevelBand =
    roadmap.level_band != null
      ? clampBand(roadmap.level_band)
      : (pw.band ?? (pw.level ? LEVEL_TO_BAND[pw.level] : null) ?? diagnosticBand ?? 3);
  const level = BAND_META[baseBand].label as Level;
  const levelMeta = LEVEL_META[level];
  const goalLabel =
    roadmap.goal && (GOAL_LABELS as unknown as Record<string, string>)[roadmap.goal]
      ? (GOAL_LABELS as unknown as Record<string, string>)[roadmap.goal]
      : "Improve";

  const total = stages.length || 5;
  const done = stages.filter((s) => s.status === "complete").length;
  const pct = Math.round((done / total) * 100);
  const lastStage = stages[stages.length - 1];

  // The stage the student is on drives which band the tutor panel matches
  // against — later stages ask for harder courses than the base placement.
  const activeStage = stages.find((s) => s.status === "active") ?? null;
  const activeRequiredBand: LevelBand =
    activeStage?.required_level_band != null
      ? clampBand(activeStage.required_level_band)
      : requiredBandForStage(baseBand, activeStage?.stage_number ?? 1);

  return (
    <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      {/* Anonymous save banner — same container as <main> so its edges line up with the columns */}
      <div className="px-6 sm:px-8 max-w-6xl mx-auto">
        <AnimatePresence>
          {showAnonToast && !isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 pw-card px-4 py-4 flex items-center justify-between gap-4"
              style={{ background: "var(--pw-accent-soft)", borderColor: "var(--pw-accent)" }}
            >
              <div className="text-[0.8125rem] flex items-center gap-2">
                <Icon name="save" className="h-4 w-4" />
                <span>
                  This roadmap is saved in this browser only. A free account keeps it and lets
                  you choose courses.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openLogin("signup")}
                  className="pw-btn-outline whitespace-nowrap px-4 py-2"
                >
                  Create account
                </button>
                <button
                  onClick={() => setShowAnonToast(false)}
                  className="text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] text-lg leading-none px-2"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="px-6 sm:px-8 pb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-6"
        >
          <h1 className="font-display text-[2rem] leading-none uppercase tracking-[-0.025em] mb-6">
            From {level} to your goal
          </h1>

          {/* Columns start on the same line: aside card top = Stage 01 card top. */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 items-start">
            {/* LEFT — profile */}
            <aside>
              <div className="pw-card p-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "var(--pw-surface-2)" }}
                  >
                    <Icon name={levelMeta.icon} className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="font-display text-[1.25rem] leading-none uppercase tracking-[-0.025em]">
                      {level}
                    </div>
                    <div className="label-caps mt-2 text-[var(--pw-ink-2)]">Your level</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-[0.75rem] text-[var(--pw-ink-2)]">
                    <span>Roadmap progress</span>
                    <span className="font-mono-pw">
                      {done} / {total} stages
                    </span>
                  </div>
                  <div className="pw-progress mt-2">
                    <motion.div
                      className="pw-progress-fill"
                      initial={false}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                  <div className="font-mono-pw text-[0.6875rem] text-[var(--pw-ink-2)] mt-2">
                    {pct}% complete
                  </div>
                </div>

                <div className="mt-6">
                  <div className="label-caps text-[var(--pw-ink-2)]">Your goal</div>
                  <p className="mt-2 text-[0.9375rem]">
                    {subject}, starting from {level}. Final stage:{" "}
                    <strong>{lastStage?.title ?? "your goal"}</strong>.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Pill>
                      <Icon name="books" className="h-3.5 w-3.5" /> {subject}
                    </Pill>
                    <Pill>
                      <Icon name={levelMeta.icon} className="h-3.5 w-3.5" /> {level} level
                    </Pill>
                    <Pill>
                      <Icon name="rocket" className="h-3.5 w-3.5" /> {goalLabel}
                    </Pill>
                  </div>
                </div>
              </div>

              {/* ── Matched tutors ──────────────────────────────────────────────
                Sits under the profile card, outside the roadmap timeline.
                Populates once the find-tutor quiz has been taken: it
                intersects that quiz's answers with this roadmap's subject and
                the band the active stage requires. */}
              <MatchedTutorsPanel
                subject={subject}
                band={baseBand}
                requiredBand={activeRequiredBand}
                activeStageTitle={activeStage?.title ?? null}
                userId={user?.id ?? null}
              />
            </aside>

            {/* RIGHT — roadmap */}
            <section>
              <div className="relative pl-12">
                <div className="absolute left-3 top-2 bottom-2 border-l border-[var(--pw-border)]" />

                {stages.map((s, i) => {
                  const isCompleted = s.status === "complete";
                  const isActive = s.status === "active";
                  const isGoal = i === stages.length - 1;
                  const req = requirementFor(s);
                  const reqBand =
                    s.required_level_band != null ? clampBand(s.required_level_band) : null;

                  let nodeBg = "var(--pw-surface)";
                  let nodeBorder = "var(--pw-border)";
                  let nodeFg = "var(--pw-ink)";
                  let nodeIcon: IconName | null = null;
                  let nodeIconColor = "";
                  if (isCompleted) {
                    nodeBg = "var(--pw-accent-2)";
                    nodeBorder = "var(--pw-accent-2)";
                    nodeFg = "var(--pw-bg)";
                    nodeIcon = "check";
                    nodeIconColor = "text-[var(--pw-bg)]";
                  } else if (isActive) {
                    nodeBg = "var(--pw-accent-fill)";
                    nodeBorder = "var(--pw-accent-fill)";
                    nodeFg = "var(--pw-on-accent)";
                    nodeIcon = isGoal ? "flag" : "play";
                    nodeIconColor = "text-pw-on-accent";
                  } else if (isGoal) {
                    nodeIcon = "flag";
                  }

                  return (
                    <motion.div
                      key={s.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 26 }}
                      className="relative mb-8"
                    >
                      {/* The path you've walked, in amber-orange: from this completed stage's dot
                          down to the next one (the landing's journey line, continued). Sits on the
                          grey line at left-3 of the list (-1.75rem from the row); 3.5rem = the
                          2rem row gap + the next dot's 1.5rem centre. */}
                      {isCompleted && i < stages.length - 1 && (
                        <div
                          aria-hidden="true"
                          className="absolute -left-7 top-6 -bottom-14 w-0.5 bg-pw-accent-fill"
                        />
                      )}
                      <div
                        className="absolute -left-[1.875rem] top-3 w-6 h-6 rounded-full flex items-center justify-center text-[0.75rem]"
                        style={{
                          background: nodeBg,
                          border: "2px solid " + nodeBorder,
                          color: nodeFg,
                          boxShadow: isActive ? "0 0 0 3px var(--pw-accent-soft)" : undefined,
                        }}
                      >
                        {nodeIcon && (
                          <Icon name={nodeIcon} className={`h-3 w-3 ${nodeIconColor}`} />
                        )}
                      </div>

                      <div
                        className={`text-left w-full pw-card p-6 relative transition-colors hover:border-[var(--pw-ink)] ${isActive ? "border-[var(--pw-accent)]" : isCompleted ? "border-[var(--pw-accent-2)]" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div
                              className={`label-caps ${isCompleted ? "text-pw-secondary" : isActive ? "text-pw-accent" : "text-[var(--pw-ink-2)]"}`}
                            >
                              STAGE {String(s.stage_number).padStart(2, "0")}
                            </div>
                            <h3 className="font-display text-[1.25rem] leading-[1.05] uppercase tracking-[-0.025em] mt-2">
                              {/* A real button stretched over the card (::after), so the
                                  card opens from the keyboard too. Nested controls sit
                                  above it with relative z-10. */}
                              <button
                                type="button"
                                onClick={() => setOpenStage(s.stage_number)}
                                className="text-left uppercase after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--pw-accent)]"
                              >
                                {s.title}
                              </button>
                            </h3>
                          </div>
                          {isCompleted && (
                            <span className="pw-pill px-2 py-2 whitespace-nowrap text-pw-secondary border-[var(--pw-accent-2)]">
                              <Icon name="check" className="h-3.5 w-3.5" /> Completed
                            </span>
                          )}
                          {!isCompleted && !isActive && (
                            <span className="pw-pill px-2 py-2 text-[var(--pw-ink-2)] whitespace-nowrap">
                              <Icon name="lock" className="h-3.5 w-3.5" /> Locked
                            </span>
                          )}
                        </div>

                        {s.skills && s.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {s.skills.map((sk) => (
                              <span key={sk} className="pw-badge">
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Course requirement — the level this stage unlocks against */}
                        {reqBand && !isCompleted && (
                          <div className="mt-4 flex flex-wrap items-center gap-2 text-[0.75rem]">
                            <span
                              className={`pw-pill px-2 py-2 ${req.met ? "text-pw-secondary border-[var(--pw-accent-2)]" : "text-[var(--pw-ink-2)]"}`}
                            >
                              <Icon name={req.met ? "check" : "book"} className="h-3.5 w-3.5" />{" "}
                              {req.viaTrial
                                ? "Trial lesson done"
                                : `Unlocks with a ${BAND_META[reqBand].label} course or a trial lesson`}
                            </span>
                            {req.enrollment && (
                              <span className="text-[var(--pw-ink-2)] truncate max-w-[13.75rem]">
                                {req.enrollment.status === "completed"
                                  ? "Completed"
                                  : "In progress"}
                                : {req.enrollment.course?.title ?? "your course"}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                          <div className="text-[0.75rem] text-[var(--pw-ink-2)]">
                            {isCompleted && s.completed_at
                              ? `Completed ${new Date(s.completed_at).toLocaleDateString()}`
                              : "Open for details"}
                          </div>
                          {isActive &&
                            (req.met ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkComplete(s);
                                }}
                                disabled={completing === s.stage_number}
                                className="relative z-10 pw-btn-primary px-4 py-2 inline-flex items-center gap-2 disabled:opacity-60"
                              >
                                {completing === s.stage_number ? (
                                  "Saving…"
                                ) : (
                                  <>
                                    <Icon name="check" className="h-3.5 w-3.5" /> Mark stage complete
                                  </>
                                )}
                              </button>
                            ) : (
                              // One next step: a course at this level. The trial is the other way in.
                              <div className="relative z-10 flex items-center gap-4 flex-wrap">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChooseCourse(s);
                                  }}
                                  className="pw-btn-outline px-4 py-2 inline-flex items-center gap-2"
                                >
                                  <Icon name="book" className="h-3.5 w-3.5" />
                                  {req.enrollment ? "Finish your course" : "Choose a course"}
                                </button>
                                {!req.enrollment && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      goToTutors();
                                    }}
                                    className="text-[0.875rem] underline underline-offset-4 text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)]"
                                  >
                                    or book a trial lesson
                                  </button>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <button type="button" onClick={goToTutors} className="pw-btn-outline inline-flex justify-center w-full px-8 py-4">
            See {subject} tutors
          </button>
          <p className="mt-4 text-[0.75rem] text-[var(--pw-ink-2)]">
            {isLoggedIn
              ? "Browsing is free. You pay only when you book."
              : "Browsing is free. Choosing a course or booking needs a free account, which also saves this roadmap."}
          </p>
        </div>
      </main>

      {openStage !== null && (
        <StageDetailModal
          subject={subject}
          stageNumber={openStage}
          stageTitle={stages.find((s) => s.stage_number === openStage)?.title ?? ""}
          onClose={() => setOpenStage(null)}
        />
      )}

      {/* Completion moment: a dialog people dismiss themselves, so it is announced and never
          vanishes before it can be read. */}
      <Dialog open={overlay !== null} onOpenChange={(open) => !open && setOverlay(null)}>
        <DialogContent className="pw-card block text-center px-12 py-12 w-[calc(100%-2rem)] max-w-md border-[var(--pw-accent)] shadow-pw-float">
          {overlay && (
            <>
              <Icon name="target" className="h-12 w-12 mx-auto" />
              <DialogTitle className="font-display font-normal text-[2.25rem] leading-none uppercase tracking-[-0.025em] mt-4">
                Stage {overlay.stageNumber} complete
              </DialogTitle>
              <div
                className="font-mono-pw text-[0.75rem] mt-2 flex items-center justify-center gap-2"
                style={{ color: "var(--pw-accent-3)" }}
              >
                <Icon name="sparkles" className="h-4 w-4" /> +{overlay.xp} XP earned
              </div>
              {overlay.nextTitle ? (
                <DialogDescription className="text-[0.875rem] text-[var(--pw-ink-2)] mt-4">
                  Next: <strong className="text-[var(--pw-ink)]">{overlay.nextTitle}</strong>
                </DialogDescription>
              ) : (
                <DialogDescription className="text-[0.875rem] text-[var(--pw-ink-2)] mt-4 flex items-center justify-center gap-2">
                  <Icon name="flag" className="h-4 w-4" /> That was the final stage.
                </DialogDescription>
              )}
              <DialogClose className="pw-btn-primary mt-6 px-6 py-2">Continue →</DialogClose>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="pw-pill px-4 py-2">{children}</span>;
}
