import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { LEVEL_META, Subject, Level } from "../pathwise/data";
import { GOAL_LABELS, usePW } from "../pathwise/store";
import { StageDetailModal } from "../pathwise/StageDetailModal";
import { useAuth } from "../pathwise/auth";
import { RoleGate } from "../pathwise/RoleGate";
// ─── api.ts replaces inline supabase calls ───────────────────────────────────
import { getRoadmapWithStages, completeStage, getRoadmapEnrollments, type StageEnrollment } from "../pathwise/api";
import { requireAuth } from "../lib/authGuard";
import { supabase } from "@/integrations/supabase/client";
import { BAND_META, clampBand, LEVEL_TO_BAND, requiredBandForStage, type LevelBand } from "../pathwise/levels";
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
      { title: "Your Roadmap — PathWise" },
      { name: "description", content: "A personalized 5-stage learning roadmap built around your level and goal." },
      { property: "og:title", content: "Your Roadmap — PathWise" },
      { property: "og:description", content: "Visual learning journey from where you are to where you want to be." },
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
  const [overlay, setOverlay] = useState<{ stageNumber: number; nextTitle: string | null; xp: number } | null>(null);
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
    const { data: { session } } = await supabase.auth.getSession();
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
    console.log('[roadmap] fetchRoadmap called');
    console.log('[roadmap] roadmapId:', roadmapId);
    if (!roadmapId) {
      console.log('[roadmap] No roadmapId, redirecting to quiz');
      navigate({ to: "/quiz" });
      return;
    }
    setLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");

      // ─── FIX 2: Claim the roadmap FIRST before fetching ───────────────────────────
      // This eliminates the race condition — the claim and fetch happen sequentially
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const pendingId = localStorage.getItem('pathwise_roadmap_id');
        if (pendingId) {
          console.log('[roadmap] Claiming roadmap for user:', session.user.id);
          const { data: claimData, error: claimErr } = await supabase
            .from('roadmaps')
            .update({ user_id: session.user.id })
            .eq('id', pendingId)
            .is('user_id', null)
            .select()          // ← ADD .select() to get the updated row back
            .maybeSingle();    // ← ADD .maybeSingle() to get the actual data

          if (claimErr) {
            console.error('[roadmap] Claim failed:', claimErr.message);
          } else {
            console.log('[roadmap] Claim succeeded');
            localStorage.removeItem('pathwise_roadmap_id');

            // If we got the claimed row back, use it directly instead of re-fetching
            if (claimData) {
              console.log('[roadmap] Using claimed roadmap directly:', claimData.id);
              setRoadmap(claimData);
              // Fetch stages for this roadmap
              const { data: claimedStages } = await supabase
                .from('roadmap_stages')
                .select('*')
                .eq('roadmap_id', claimData.id)
                .order('stage_number');
              if (claimedStages) {
                console.log('[roadmap] Stages loaded:', claimedStages.length);
                setStages(claimedStages);
              }
              return; // ← DONE — don't fall through to the normal fetch
            }
          }
        }
      }

      // ─── Now fetch the roadmap ────────────────────────────────────────────────
      // After claiming, the row has user_id set, so the authenticated
      // SELECT policy (auth.uid() = user_id) will match.
      console.log('[roadmap] Fetching roadmap and stages from Supabase...');
      const [{ data: rm, error: rErr }, { data: st, error: sErr }] = await Promise.all([
        supabase.from("roadmaps").select("*").eq("id", roadmapId).maybeSingle(),
        supabase.from("roadmap_stages").select("*").eq("roadmap_id", roadmapId).order("stage_number"),
      ]);
      console.log('[roadmap] Supabase responses:', { rm, rErr, st, sErr });

      if (rErr) throw rErr;
      if (sErr) throw sErr;

      if (!rm) {
        console.log('[roadmap] Roadmap not found');
        // If authenticated and still not found, try loading by user_id as fallback
        if (session?.user) {
          const { data: userRm } = await supabase
            .from('roadmaps')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (userRm) {
            console.log('[roadmap] Found roadmap by user_id:', userRm.id);
            // Set this as the active roadmap and continue
            setRoadmap(userRm);
            // Also fetch stages for this roadmap
            const { data: userStages } = await supabase
              .from('roadmap_stages')
              .select('*')
              .eq('roadmap_id', userRm.id)
              .order('stage_number');
            if (userStages) setStages(userStages);
            return;
          }
        }
        // If authenticated but no roadmap found, try loading their latest roadmap
        if (session?.user) {
          const { data: latestRm } = await supabase
            .from('roadmaps')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestRm) {
            console.log('[roadmap] Found latest roadmap by user_id:', latestRm.id);
            setRoadmap(latestRm);
            const { data: latestStages } = await supabase
              .from('roadmap_stages')
              .select('*')
              .eq('roadmap_id', latestRm.id)
              .order('stage_number');
            if (latestStages) setStages(latestStages);
            return;
          }
        }
        toast.error("Roadmap not found.");
        navigate({ to: "/quiz" });
        return;
      }

      console.log('[roadmap] Roadmap loaded successfully:', rm.id, rm.user_id);
      setRoadmap(rm as DBRoadmap);
      setStages((st ?? []) as DBStage[]);
      console.log('[roadmap] Stages loaded:', (st ?? []).length);
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string; hint?: string; details?: unknown };
      console.error("[roadmap] fetch error", err);
      console.error("[roadmap] Error details:", {
        message: e?.message,
        code: e?.code,
        hint: e?.hint,
        details: e?.details
      });
      toast.error(e?.message || "Couldn't load your roadmap.");
    } finally {
      setLoading(false);
    }
  }

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
   * A stage is gated only when it names a required level. Roadmaps created
   * before course matching existed have no requirement and behave as before.
   */
  function requirementFor(stage: DBStage) {
    const enrollment = enrollments.get(stage.id) ?? null;
    const gated = !!stage.required_level_id;
    return {
      gated,
      enrollment,
      met: !gated || enrollment?.status === "completed",
    };
  }

  function goToCourseMatch(stage: DBStage) {
    if (!roadmap) return;
    navigate({
      to: "/course-match",
      search: { roadmapId: roadmap.id, stage: stage.stage_number },
    });
  }

  // ─── CHANGED: completeStage from api.ts ──────────────────────────────────
  // Previously 3 separate supabase calls inline.
  // Now one api.ts call that does the same thing: mark complete, unlock next, bump current_stage.
  async function handleStartHere() {
    if (!roadmap) return;

    // Require authentication
    const authenticated = await requireAuth(roadmap.id);
    if (!authenticated) return; // Will redirect to sign-in

    // Find the first stage that hasn't been started
    const firstStage = stages.find(s => s.status === 'active');

    if (!firstStage) {
      console.log('All stages already started');
      return;
    }

    try {
      // Update the first stage to "active"
      const { error } = await supabase
        .from('roadmap_stages')
        .update({ status: 'active' })
        .eq('id', firstStage.id);

      if (error) {
        console.error('Failed to start stage:', error);
        return;
      }

      // Update local state
      setStages(prev =>
        prev.map(s => s.id === firstStage.id ? { ...s, status: 'active' } : s)
      );

      // Open the stage detail modal
      setOpenStage(firstStage.stage_number);
    } catch (err) {
      console.error('Start here error:', err);
    }
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
          if (s.id === stage.id) return { ...s, status: "complete", completed_at: new Date().toISOString() };
          if (next && s.id === next.id) return { ...s, status: "active" };
          return s;
        }),
      );
      setRoadmap({ ...roadmap, current_stage: stage.stage_number + 1 });

      // Confetti + overlay (unchanged)
      const fire = (origin: { x: number; y: number }) =>
        confetti({
          particleCount: 90,
          spread: 75,
          origin,
          colors: ["#E85D26", "#F4C430", "#2D6A4F", "#FFFFFF"],
        });
      fire({ x: 0.3, y: 0.5 });
      fire({ x: 0.7, y: 0.5 });
      setTimeout(() => fire({ x: 0.5, y: 0.4 }), 250);

      setOverlay({
        stageNumber: stage.stage_number,
        nextTitle: next?.title ?? null,
        xp: 100,
      });
      setTimeout(() => setOverlay(null), 1500);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error("[roadmap] mark complete", err);
      // The database enforces the same gate, so a stale UI lands here.
      if (e?.message === "STAGE_COURSE_REQUIRED") {
        toast.error("Finish a course at this stage's level first.");
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
        <main className="px-5 sm:px-8 pt-20 text-center text-[var(--pw-ink-2)]">Loading your roadmap…</main>
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
  const goalLabel = roadmap.goal && (GOAL_LABELS as unknown as Record<string, string>)[roadmap.goal] ? (GOAL_LABELS as unknown as Record<string, string>)[roadmap.goal] : "Improve";

  const total = stages.length || 5;
  const done = stages.filter((s) => s.status === "complete").length;
  const pct = Math.round((done / total) * 100);
  const lastStage = stages[stages.length - 1];

  // The stage the student is on drives which band the tutor panel matches
  // against — later stages ask for harder courses than the base placement.
  const activeStage = stages.find((s) => s.status === "active") ?? null;
  const activeRequiredBand: LevelBand = activeStage?.required_level_band != null
    ? clampBand(activeStage.required_level_band)
    : requiredBandForStage(baseBand, activeStage?.stage_number ?? 1);

  return (
    <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">

      {/* Anonymous save banner */}
      <AnimatePresence>
        {showAnonToast && !isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-5 sm:mx-8 mt-4 pw-card px-4 py-3 flex items-center justify-between gap-4"
            style={{ background: "var(--pw-accent-soft)", borderColor: "var(--pw-accent)" }}
          >
            <div className="text-[13px]">
              💾 <strong>Sign up</strong> to save your progress permanently
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openLogin()}
                className="pw-pill px-3 py-1 text-[12px] text-white font-medium"
                style={{ background: "var(--pw-accent)" }}
              >
                Sign up
              </button>
              <button
                onClick={() => setShowAnonToast(false)}
                className="text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] text-lg leading-none px-1"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="px-5 sm:px-8 pb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-[40%_60%] gap-10 mt-6"
        >
          {/* LEFT — profile */}
          <aside>
            <div className="pw-card p-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                  style={{ background: "var(--pw-surface-2)" }}
                >
                  {levelMeta.emoji}
                </div>
                <div>
                  <div className="font-display text-[20px] leading-tight">{level}</div>
                  <div className="font-mono-pw text-[11px] text-[var(--pw-ink-2)]">YOUR RANK</div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[12px] text-[var(--pw-ink-2)]">
                  <span>Roadmap progress</span>
                  <span className="font-mono-pw">{done} / {total} stages</span>
                </div>
                <div className="h-2 mt-1.5 rounded-full bg-[var(--pw-surface-2)] overflow-hidden">
                  <motion.div
                    className="h-full"
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    style={{ background: "var(--pw-accent)" }}
                  />
                </div>
                <div className="font-mono-pw text-[11px] text-[var(--pw-ink-2)] mt-1">{pct}% complete</div>
              </div>

              <div className="mt-6">
                <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">YOUR MISSION</div>
                <p className="mt-2 text-[15px]">
                  Master {subject} up to <strong>{lastStage?.title ?? "your goal"}</strong>, starting from {level}.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>📚 {subject}</Pill>
                  <Pill>{levelMeta.emoji} {level} Level</Pill>
                  <Pill>🚀 {goalLabel}</Pill>
                </div>
              </div>

              <div className="my-5 h-px bg-[var(--pw-border)]" />

              <div>
                <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-3">ESTIMATED JOURNEY</div>
                <ul className="space-y-2 text-[13px]">
                  <li>📅 8–12 weeks</li>
                  <li>📚 3–4 sessions / week</li>
                  <li>⚡ ~45 min per session</li>
                </ul>
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
            <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2">YOUR ROADMAP</div>
            <h1 className="font-display text-[32px] leading-tight mb-6">From {level} to your goal</h1>

            <div className="relative pl-10">
              <div className="absolute left-3 top-2 bottom-2 border-l-2 border-dashed border-[var(--pw-border)]" />

              {stages.map((s, i) => {
                const isCompleted = s.status === "complete";
                const isActive = s.status === "active";
                const isGoal = i === stages.length - 1;
                const req = requirementFor(s);
                const reqBand =
                  s.required_level_band != null ? clampBand(s.required_level_band) : null;

                let nodeBg = "var(--pw-surface)";
                let nodeBorder = "var(--pw-border)";
                let nodeIcon: string = "";
                if (isCompleted) {
                  nodeBg = "var(--pw-accent-2)"; nodeBorder = "var(--pw-accent-2)"; nodeIcon = "✓";
                } else if (isActive) {
                  nodeBg = "var(--pw-accent)"; nodeBorder = "var(--pw-accent)"; nodeIcon = isGoal ? "🏁" : "▶";
                } else if (isGoal) {
                  nodeIcon = "🏁";
                }

                return (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, scale: isActive && completing === null ? 1 : 1 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 220, damping: 22 }}
                    className="relative mb-7"
                  >
                    <motion.div
                      className="absolute -left-[30px] top-3 w-6 h-6 rounded-full flex items-center justify-center text-[12px]"
                      style={{ background: nodeBg, border: "2px solid " + nodeBorder, color: "#fff" }}
                      animate={isActive ? {
                        boxShadow: [
                          "0 0 0 0 rgba(232,93,38,0.55)",
                          "0 0 0 10px rgba(232,93,38,0)",
                        ],
                      } : { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
                      transition={isActive ? { duration: 1.6, repeat: Infinity, ease: "easeOut" } : {}}
                    >
                      {nodeIcon}
                    </motion.div>

                    <div
                      onClick={() => setOpenStage(s.stage_number)}
                      className="text-left w-full pw-card p-5 relative transition-colors cursor-pointer"
                      style={{
                        borderColor: isActive ? "var(--pw-accent)" : isCompleted ? "var(--pw-accent-2)" : "var(--pw-border)",
                        background: isCompleted ? "rgba(45,106,79,0.04)" : "var(--pw-surface)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-mono-pw text-[11px] text-[var(--pw-ink-2)]">STAGE {String(s.stage_number).padStart(2, "0")}</div>
                          <h3 className="font-display text-[20px] leading-tight mt-0.5">{s.title}</h3>
                        </div>
                        {isCompleted && (
                          <span className="pw-pill text-[11px] px-2.5 py-1 text-white whitespace-nowrap" style={{ background: "var(--pw-accent-2)" }}>
                            ✓ Completed
                          </span>
                        )}
                        {isActive && (
                          <button
                            onClick={handleStartHere}
                            className="pw-pill text-[11px] px-2.5 py-1 text-white whitespace-nowrap"
                            style={{ background: "var(--pw-accent)" }}
                          >
                            ▶ START HERE
                          </button>
                        )}
                        {!isCompleted && !isActive && (
                          <span className="pw-pill text-[11px] px-2.5 py-1 text-[var(--pw-ink-2)] pw-border whitespace-nowrap">
                            🔒 Locked
                          </span>
                        )}
                      </div>

                      {s.skills && s.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {s.skills.map((sk) => (
                            <span key={sk} className="pw-pill text-[11px] px-2.5 py-1" style={{ background: "var(--pw-surface-2)" }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Course requirement — the level this stage unlocks against */}
                      {reqBand && !isCompleted && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                          <span
                            className="pw-pill text-[11px] px-2.5 py-1 pw-border"
                            style={{
                              background: req.met ? "rgba(45,106,79,0.08)" : "var(--pw-surface-2)",
                              borderColor: req.met ? "var(--pw-accent-2)" : "var(--pw-border)",
                            }}
                          >
                            {req.met ? "✓" : "📘"} Requires a {BAND_META[reqBand].label} course
                          </span>
                          {req.enrollment && (
                            <span className="text-[var(--pw-ink-2)] truncate max-w-[220px]">
                              {req.enrollment.status === "completed" ? "Completed" : "In progress"}:{" "}
                              {req.enrollment.course?.title ?? "your course"}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-[12px] text-[var(--pw-ink-2)]">
                          {isCompleted && s.completed_at
                            ? `Completed ${new Date(s.completed_at).toLocaleDateString()}`
                            : "Tap to view details & log sessions"}
                        </div>
                        {isActive && (
                          <span
                            role="button"
                            tabIndex={0}
                            title={
                              req.met
                                ? undefined
                                : req.enrollment
                                  ? "Finish your course to unlock this stage"
                                  : "Pick a course at your level to unlock this stage"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkComplete(s);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMarkComplete(s);
                              }
                            }}
                            className="pw-pill text-[12px] px-3 py-1.5 font-medium transition-colors cursor-pointer"
                            style={{
                              background: req.met ? "var(--pw-accent)" : "var(--pw-surface-2)",
                              color: req.met ? "#fff" : "var(--pw-ink-2)",
                              border: req.met ? "none" : "1.5px solid var(--pw-border)",
                              opacity: completing === s.stage_number ? 0.6 : 1,
                            }}
                          >
                            {completing === s.stage_number
                              ? "Saving…"
                              : req.met
                                ? "✓ Mark Stage Complete"
                                : req.enrollment
                                  ? "📘 Finish your course"
                                  : "🔒 Choose your course"}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </motion.div>

        {/* CTA */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <button
            onClick={async (e) => {
              e.preventDefault();
              // Require authentication — opens login modal if not signed in
              const authenticated = await requireAuth(roadmap.id);
              if (authenticated) {
                // Only navigate if authenticated
                navigate({ to: "/matches" });
              }
            }}
            className="pw-btn-primary inline-flex justify-center w-full px-7 py-4 text-[16px] font-medium"
          >
            See My Matched Tutors & Courses →
          </button>
          <p className="mt-3 text-[12px] text-[var(--pw-ink-2)]">Free to browse · Book only when ready</p>
        </div>
      </main>

      <AnimatePresence>
        {openStage !== null && (
          <StageDetailModal
            subject={subject}
            stageNumber={openStage}
            stageTitle={stages.find((s) => s.stage_number === openStage)?.title ?? ""}
            onClose={() => setOpenStage(null)}
          />
        )}
      </AnimatePresence>

      {/* Full-screen completion moment */}
      <AnimatePresence>
        {overlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: "rgba(26,26,26,0.6)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="pw-card text-center px-10 py-12 max-w-md w-full"
              style={{ background: "var(--pw-surface)", borderColor: "var(--pw-accent)", borderWidth: 2 }}
            >
              <div className="text-5xl">🎯</div>
              <h2 className="font-display text-[36px] leading-tight mt-3">
                Stage {overlay.stageNumber} Complete!
              </h2>
              <div className="font-mono-pw text-[12px] mt-2" style={{ color: "var(--pw-accent-3)" }}>
                ✦ +{overlay.xp} XP earned
              </div>
              {overlay.nextTitle ? (
                <p className="text-[14px] text-[var(--pw-ink-2)] mt-4">
                  Next: <strong className="text-[var(--pw-ink)]">{overlay.nextTitle}</strong>
                </p>
              ) : (
                <p className="text-[14px] text-[var(--pw-ink-2)] mt-4">🏁 Final stage reached!</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="pw-pill text-[12px] px-3 py-1 pw-border" style={{ background: "var(--pw-surface-2)" }}>
      {children}
    </span>
  );
}