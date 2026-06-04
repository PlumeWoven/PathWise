import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { PWHeader } from "../pathwise/Header";
import { LEVEL_META, Subject, Level } from "../pathwise/data";
import { GOAL_LABELS, usePW } from "../pathwise/store";
import { StageDetailModal } from "../pathwise/StageDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../pathwise/auth";
import { RoleGate } from "../pathwise/RoleGate";

interface DBStage {
  id: string;
  roadmap_id: string;
  stage_number: number;
  title: string;
  skills: string[] | null;
  status: "active" | "locked" | "complete" | string;
  completed_at: string | null;
}

interface DBRoadmap {
  id: string;
  user_id: string | null;
  subject: string | null;
  goal: string | null;
  current_stage: number;
  total_stages: number;
}

type RoadmapSearch = { roadmapId?: string };

export const Route = createFileRoute("/roadmap")({
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
  const { isLoggedIn, openLogin } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [roadmap, setRoadmap] = useState<DBRoadmap | null>(null);
  const [stages, setStages] = useState<DBStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openStage, setOpenStage] = useState<number | null>(null);
  const [completing, setCompleting] = useState<number | null>(null);
  const [overlay, setOverlay] = useState<{ stageNumber: number; nextTitle: string | null; xp: number } | null>(null);
  const [showAnonToast, setShowAnonToast] = useState(false);

  const roadmapId =
    search.roadmapId ||
    (typeof window !== "undefined" ? localStorage.getItem("pathwise_roadmap_id") : null) ||
    null;

  useEffect(() => {
    if (!roadmapId) {
      navigate({ to: "/quiz" });
      return;
    }
    void fetchRoadmap();
    // Show non-blocking anon toast once if not logged in
    if (!isLoggedIn) setShowAnonToast(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapId, isLoggedIn]);

  async function fetchRoadmap() {
    if (!roadmapId) return;
    setLoading(true);
    try {
      const [{ data: rm, error: rErr }, { data: st, error: sErr }] = await Promise.all([
        supabase.from("roadmaps").select("*").eq("id", roadmapId).maybeSingle(),
        supabase.from("roadmap_stages").select("*").eq("roadmap_id", roadmapId).order("stage_number"),
      ]);
      if (rErr) throw rErr;
      if (sErr) throw sErr;
      if (!rm) {
        toast.error("Roadmap not found.");
        navigate({ to: "/quiz" });
        return;
      }
      setRoadmap(rm as DBRoadmap);
      setStages((st ?? []) as DBStage[]);
    } catch (err: any) {
      console.error("[roadmap] fetch", err);
      toast.error(err?.message || "Couldn't load your roadmap.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkComplete(stage: DBStage) {
    if (completing !== null) return;
    if (stage.status !== "active") return;
    setCompleting(stage.stage_number);
    try {
      // 1) Mark current stage complete
      const { error: e1 } = await supabase
        .from("roadmap_stages")
        .update({ status: "complete", completed_at: new Date().toISOString() })
        .eq("id", stage.id);
      if (e1) throw e1;

      // 2) Find & unlock next stage
      const next = stages.find((s) => s.stage_number === stage.stage_number + 1);
      if (next) {
        const { error: e2 } = await supabase
          .from("roadmap_stages")
          .update({ status: "active" })
          .eq("id", next.id);
        if (e2) throw e2;
      }

      // 3) Bump roadmaps.current_stage
      if (roadmap) {
        const { error: e3 } = await supabase
          .from("roadmaps")
          .update({ current_stage: stage.stage_number + 1 })
          .eq("id", roadmap.id);
        if (e3) throw e3;
      }

      // 4) Optimistic local update
      setStages((prev) =>
        prev.map((s) => {
          if (s.id === stage.id) return { ...s, status: "complete", completed_at: new Date().toISOString() };
          if (next && s.id === next.id) return { ...s, status: "active" };
          return s;
        }),
      );
      if (roadmap) setRoadmap({ ...roadmap, current_stage: stage.stage_number + 1 });

      // 5) Confetti + full-screen overlay
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
    } catch (err: any) {
      console.error("[roadmap] mark complete", err);
      toast.error(err?.message || "Couldn't mark stage complete.");
    } finally {
      setCompleting(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
        <PWHeader />
        <main className="px-5 sm:px-8 pt-20 text-center text-[var(--pw-ink-2)]">Loading your roadmap…</main>
      </div>
    );
  }

  if (!roadmap) return null;

  const subject = (roadmap.subject ?? pw.subject ?? "Mathematics") as Subject;
  const level = (pw.level ?? "Builder") as Level;
  const levelMeta = LEVEL_META[level];
  const goalLabel = roadmap.goal && (GOAL_LABELS as any)[roadmap.goal] ? (GOAL_LABELS as any)[roadmap.goal] : "Improve";

  const total = stages.length || 5;
  const done = stages.filter((s) => s.status === "complete").length;
  const pct = Math.round((done / total) * 100);
  const lastStage = stages[stages.length - 1];

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />

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
                onClick={openLogin}
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

                    <button
                      type="button"
                      onClick={() => setOpenStage(s.stage_number)}
                      className="text-left w-full pw-card p-5 relative transition-colors"
                      style={{
                        cursor: "pointer",
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
                          <span className="pw-pill text-[11px] px-2.5 py-1 text-white whitespace-nowrap" style={{ background: "var(--pw-accent)" }}>
                            ▶ START HERE
                          </span>
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
                            className="pw-pill text-[12px] px-3 py-1.5 font-medium transition-colors"
                            style={{ background: "var(--pw-accent)", color: "#fff", opacity: completing === s.stage_number ? 0.6 : 1 }}
                          >
                            {completing === s.stage_number ? "Saving…" : "✓ Mark Stage Complete"}
                          </span>
                        )}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </motion.div>

        {/* CTA */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <Link to="/matches" className="pw-btn-primary inline-flex justify-center w-full px-7 py-4 text-[16px] font-medium">
            See My Matched Tutors & Courses →
          </Link>
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