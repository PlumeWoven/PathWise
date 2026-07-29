import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  GOALS,
  LEVEL_META,
  SUBJECTS,
  Subject,
  GoalId,
  QuizQuestion,
} from "../pathwise/data";
import {
  ADAPTIVE_LENGTH,
  correctCount,
  createAdaptiveState,
  currentStreak,
  earnedXP,
  finalBand,
  nextQuestion,
  placementSummary,
  recordAnswer,
  topicBands,
  weakTopics,
  type AdaptiveState,
} from "../pathwise/adaptive-quiz";
import { BAND_META, BAND_TO_LEVEL, makeLevelId } from "../pathwise/levels";
import { setState, usePW, resetState } from "../pathwise/store";
import { generateStages } from "../pathwise/roadmap-gen";
import { toast } from "sonner";
import { RoleGate } from "../pathwise/RoleGate";
// ─── api.ts replaces inline supabase calls ───────────────────────────────────
import { getCurrentUser, saveDiagnosticResult, createRoadmap } from "../pathwise/api";

export const Route = createFileRoute("/_app/quiz")({
  head: () => ({
    meta: [
      { title: "Level Check — PathWise" },
      {
        name: "description",
        content: "Take a 3-minute gamified diagnostic to find your exact level.",
      },
      { property: "og:title", content: "Level Check — PathWise" },
      {
        property: "og:description",
        content: "A short, fun diagnostic to reveal your starting level.",
      },
      { property: "og:url", content: "/quiz" },
    ],
    links: [{ rel: "canonical", href: "/quiz" }],
  }),
  component: QuizPage,
});

type Phase = "subject" | "goal" | "intro" | "quiz" | "loading" | "result";

function QuizPage() {
  return (
    <RoleGate allow={["student", "both"]} allowAnonymous>
      <QuizPageInner />
    </RoleGate>
  );
}

function QuizPageInner() {
  const navigate = useNavigate();
  const pw = usePW();
  const [phase, setPhase] = useState<Phase>("subject");
  const [feedback, setFeedback] = useState<"none" | "correct" | "wrong">("none");
  const [floatXP, setFloatXP] = useState(false);
  const [xpGain, setXpGain] = useState(0);
  const [loadingText, setLoadingText] = useState("Analyzing your answers...");
  // REMOVED: separate diagnosticId state — now handled inside the unified save function
  const [buildingRoadmap, setBuildingRoadmap] = useState(false);
  const savedRef = useRef(false);

  // ─── Adaptive run state ─────────────────────────────────────────────────────
  // The estimator lives in adaptive-quiz.ts; this component only serves the
  // question it hands back and feeds answers into it.
  const [run, setRun] = useState<AdaptiveState>(() => createAdaptiveState());
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const finalRunRef = useRef<AdaptiveState | null>(null);

  useEffect(() => {
    resetState();
    setPhase("subject");
    setRun(createAdaptiveState());
    setQuestion(null);
  }, []);

  const asked = run.answers.length;
  const answeredIndex = phase === "result" ? ADAPTIVE_LENGTH : asked;

  let progress = 0;
  if (phase === "subject") progress = 5;
  else if (phase === "goal") progress = 15;
  else if (phase === "intro") progress = 25;
  else if (phase === "quiz") progress = 25 + (answeredIndex / ADAPTIVE_LENGTH) * 60;
  else progress = 100;

  const pickSubject = (s: Subject) => {
    setState({ subject: s });
    setTimeout(() => setPhase("goal"), 300);
  };

  const pickGoal = (g: GoalId) => {
    setState({ goal: g });
    setTimeout(() => setPhase("intro"), 300);
  };

  const beginQuiz = () => {
    if (!pw.subject) return;
    const fresh = createAdaptiveState();
    setRun(fresh);
    setQuestion(nextQuestion(pw.subject, fresh));
    setPhase("quiz");
  };

  const answer = (i: number) => {
    if (feedback !== "none" || !question || !pw.subject) return;

    const next = recordAnswer(run, question, i);
    const correct = i === question.correctIndex;
    const gained = earnedXP(next) - earnedXP(run);

    setRun(next);
    setState({
      answers: next.answers,
      totalXP: earnedXP(next),
      streak: currentStreak(next),
    });

    if (correct) {
      setXpGain(gained);
      setFloatXP(true);
      setTimeout(() => setFloatXP(false), 1200);
    }

    setFeedback(correct ? "correct" : "wrong");
    const delay = correct ? 900 : 1700;
    setTimeout(() => {
      setFeedback("none");
      const following = nextQuestion(pw.subject!, next);
      if (!following) {
        finish(next);
      } else {
        setQuestion(following);
      }
    }, delay);
  };

  const finish = (state: AdaptiveState) => {
    const band = finalBand(state);
    finalRunRef.current = state;
    setState({
      level: BAND_TO_LEVEL[band],
      band,
      topicBands: topicBands(state),
      totalXP: earnedXP(state),
    });
    setPhase("loading");
    const phrases = [
      "Analyzing your answers...",
      "Calibrating difficulty...",
      "Placing you in a level band...",
    ];
    let i = 0;
    setLoadingText(phrases[0]);
    const t = setInterval(() => {
      i = (i + 1) % phrases.length;
      setLoadingText(phrases[i]);
    }, 500);
    setTimeout(() => {
      clearInterval(t);
      setPhase("result");
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.4 },
          colors: ["#E85D26", "#F4C430", "#2D6A4F"],
        });
      }, 200);
    }, 1600);
  };

  // ─── FIXED: one atomic function — diagnostic + roadmap saved together ────────
  // Previously these were split across saveResults() and buildRoadmap(),
  // meaning a tab-close between them left an orphaned diagnostic with no roadmap.
  // Now "Build My Roadmap" button triggers both writes in sequence.
  async function handleBuildRoadmap() {
    if (buildingRoadmap) return;
    if (!pw.subject || !pw.level || !pw.band) return;
    if (savedRef.current) return;
    savedRef.current = true;
    setBuildingRoadmap(true);

    // 1. Get current user (null = anonymous)
    let user = await getCurrentUser();
    let userId = user?.id ?? null;
    let session = user; // Store session for localStorage check

    // Initialize roadmapId to handle AuthSessionMissingError case
    let roadmapId: string | undefined;

    try {
      // 2. Compute results from the adaptive run
      const finalRun = finalRunRef.current;
      const score = finalRun ? correctCount(finalRun) : pw.answers.filter((a) => a.correct).length;
      const wrongTopics = finalRun
        ? weakTopics(finalRun)
        : Array.from(new Set(pw.answers.filter((a) => !a.correct).map((a) => a.topic)));

      // 3. Save diagnostic → get diagnostic_id.
      //    level_id is what courses are matched against downstream.
      const diagnosticId = await saveDiagnosticResult({
        user_id: userId,
        subject: pw.subject,
        goal: (pw.goal ?? "grades") as GoalId,
        score,
        level: pw.level,
        level_band: pw.band,
        level_id: makeLevelId(pw.subject, pw.band),
        topic_bands: pw.topicBands,
        xp_earned: pw.totalXP,
        wrong_topics: wrongTopics,
      });

      // 4. Generate stages locally (same logic as before)
      const stages = generateStages(pw.subject, pw.level, pw.goal);

      // 5. Save roadmap + all 5 stages → get roadmap_id.
      //    createRoadmap stamps each stage with the course level it requires.
      roadmapId = await createRoadmap({
        user_id: userId,
        diagnostic_id: diagnosticId,
        subject: pw.subject,
        goal: (pw.goal ?? "grades") as GoalId,
        stages,
        level_band: pw.band,
      });

      // 6. Persist roadmap_id to localStorage for the roadmap page
      try {
        console.log('[quiz] Storing roadmap ID:', roadmapId);
        console.log('[quiz] localStorage key: pathwise_roadmap_id');
        localStorage.setItem("pathwise_roadmap_id", roadmapId);

        if (diagnosticId) {
          console.log('[quiz] Storing diagnostic ID:', diagnosticId);
          localStorage.setItem("pathwise_diagnostic_id", diagnosticId);
        }
      } catch (err) {
        console.error('[quiz] Failed to store IDs in localStorage:', err);
      }

      // 7. Navigate — pass roadmapId in search params as before
      navigate({ to: "/roadmap", search: { roadmapId } as any });
    } catch (err: any) {
      console.error("[quiz] handleBuildRoadmap error", err);
      console.error("────────────────────────────────────────────────────────────");
      console.error("Error Details:");
      console.error("  • Error Code:", err?.code || "N/A");
      console.error("  • Error Name:", err?.name || "N/A");
      console.error("  • Error Message:", err?.message || "N/A");
      console.error("  • Error Hint:", err?.hint || "N/A");
      console.error("  • Error Details:", err?.details || "N/A");
      console.error("  • HTTP Status:", err?.status || "N/A");
      console.error("  • Location: src/routes/quiz.tsx, handleBuildRoadmap()");
      console.error("────────────────────────────────────────────────────────────");
      console.error("Diagnostic Information:");
      console.error("  • Auth Session Exists:", !!user);
      console.error("  • User ID:", user?.id ?? "anonymous (no session)");
      console.error("  • Current URL:", window.location.href);
      console.error("  • Attempting to insert diagnostic with user_id:", userId);
      console.error("  • Request Payload:", {
        user_id: userId,
        subject: pw.subject,
        goal: pw.goal,
        score,
        level: pw.level,
        level_band: pw.band,
        level_id: pw.subject && pw.band ? makeLevelId(pw.subject, pw.band) : null,
        xp_earned: pw.totalXP,
        wrong_topics: finalRunRef.current ? weakTopics(finalRunRef.current) : [],
      });
      console.error("  • Full Error Object:", JSON.stringify(err, null, 2));
      console.error("────────────────────────────────────────────────────────────");

      // Handle AuthSessionMissingError for anonymous users
      if (err?.name === 'AuthSessionMissingError') {
        console.log('[quiz] Authentication session missing, storing roadmap ID for later claim');
        try {
          localStorage.setItem("pathwise_roadmap_id", roadmapId || "");
          toast.success("Roadmap saved! Please sign in to view it.");
          navigate({ to: "/roadmap", search: { roadmapId: roadmapId || "" } as any });
        } catch (storageErr) {
          console.error('[quiz] Failed to store roadmap ID:', storageErr);
          toast.error("Failed to save your roadmap. Please try again.");
          savedRef.current = false;
          setBuildingRoadmap(false);
        }
        return;
      }

      toast.error(err?.message || "Couldn't build your roadmap. Please try again.");
      // Allow retry
      savedRef.current = false;
      setBuildingRoadmap(false);
    }
  }

  const score = pw.answers.filter((a) => a.correct).length;
  const lvl = pw.level;
  const interp = finalRunRef.current ? placementSummary(finalRunRef.current) : "";
  const topicEntries = Object.entries(pw.topicBands).sort((a, b) => a[1] - b[1]);

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)] relative">
      {/* top progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-50">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "var(--pw-accent)" }}
        />
      </div>

      {/* XP indicator (during quiz) */}
      {(phase === "quiz" || phase === "intro") && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40 flex items-center gap-2 pw-card px-3 py-1.5 font-mono-pw text-[12px]">
          <span style={{ color: "var(--pw-accent-3)" }}>✦</span>
          <span>{pw.totalXP} XP</span>
          {pw.streak >= 3 && <span className="ml-2 text-[var(--pw-accent)]">🔥 {pw.streak}</span>}
        </div>
      )}


      <main className="px-5 sm:px-8 pb-20">
        <AnimatePresence mode="wait">
          {phase === "subject" && (
            <Step key="subject" title="What do you want to get better at?" stepLabel="STEP 1 OF 2">
              <div className="grid grid-cols-2 gap-4 mt-8">
                {SUBJECTS.map((s) => {
                  const selected = pw.subject === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => pickSubject(s.id)}
                      className={`relative h-16 pw-card flex items-center justify-center gap-2 transition-all duration-250 ${selected ? "border-[var(--pw-accent)]" : "hover:border-[var(--pw-accent)]"
                        }`}
                      style={selected ? { background: "var(--pw-accent-soft)" } : undefined}
                    >
                      <span className="text-xl">{s.emoji}</span>
                      <span className="text-[14px] font-medium">{s.label}</span>
                      {selected && (
                        <span className="absolute top-1.5 right-2 text-[var(--pw-accent)] text-sm">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Step>
          )}

          {phase === "goal" && (
            <Step key="goal" title="What's your main goal right now?" stepLabel="STEP 2 OF 2">
              <div className="flex flex-wrap gap-2.5 mt-8 justify-center">
                {GOALS.map((g) => {
                  const selected = pw.goal === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => pickGoal(g.id)}
                      className={`pw-pill px-5 py-3 pw-border text-[14px] transition-all duration-250 ${selected
                        ? "text-[var(--pw-surface)] border-[var(--pw-accent)]"
                        : "bg-[var(--pw-surface)] hover:border-[var(--pw-accent)]"
                        }`}
                      style={selected ? { background: "var(--pw-accent)" } : undefined}
                    >
                      <span className="mr-2">{g.emoji}</span>
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </Step>
          )}

          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, duration: 0.4 }}
              className="max-w-[480px] mx-auto mt-16"
            >
              <div className="pw-card p-8 text-center">
                <div className="text-5xl">🎮</div>
                <h2 className="font-display text-[32px] mt-4 leading-tight">
                  Level Check: Unlocked
                </h2>
                <p className="text-[15px] text-[var(--pw-ink-2)] mt-3">
                  {ADAPTIVE_LENGTH} questions that adapt as you go — get one right and the next
                  gets harder, miss one and it eases off. That's how we place you precisely.
                </p>
                <div
                  className="mt-5 text-[13px] px-4 py-3 rounded-lg text-left"
                  style={{ background: "var(--pw-surface-2)" }}
                >
                  <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
                    Why it matters
                  </div>
                  <p className="mt-1.5 text-[var(--pw-ink-2)]">
                    Your level decides which of your matched tutors' courses unlock each stage of
                    your roadmap.
                  </p>
                </div>
                <button
                  onClick={beginQuiz}
                  className="pw-btn-primary mt-7 px-8 py-3.5 text-[15px] font-medium"
                >
                  Begin →
                </button>
              </div>
            </motion.div>
          )}

          {phase === "quiz" && question && (
            <motion.div
              key={`q-${question.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="max-w-[560px] mx-auto mt-12"
            >
              <div
                className={`pw-card p-6 sm:p-7 relative ${feedback === "correct" ? "flash-green" : feedback === "wrong" ? "flash-red" : ""
                  }`}
              >
                <div className="flex items-center justify-between text-[12px] text-[var(--pw-ink-2)]">
                  <span>
                    Question {asked + 1} of {ADAPTIVE_LENGTH}
                  </span>
                  <span
                    className="font-mono-pw text-[11px] px-2 py-0.5 pw-pill"
                    style={{ background: "var(--pw-accent-3)", color: "var(--pw-ink)" }}
                  >
                    ✦ {pw.totalXP} XP
                  </span>
                </div>
                <div className="mt-3 h-1 rounded-full bg-[var(--pw-surface-2)] overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${((asked + 1) / ADAPTIVE_LENGTH) * 100}%`,
                      background: "var(--pw-accent)",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <span className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
                    {question.topic}
                  </span>
                  <span
                    className="pw-pill text-[10px] px-2 py-0.5 font-mono-pw"
                    style={{ background: "var(--pw-surface-2)", color: "var(--pw-ink-2)" }}
                    title={`Tier ${question.difficulty} of 5 — the quiz picked this based on your answers so far`}
                  >
                    TIER {question.difficulty}
                  </span>
                </div>
                <h3 className="text-[18px] font-medium mt-2 leading-snug">{question.question}</h3>

                <div className="mt-5 space-y-3 relative">
                  {question.options.map((opt, i) => {
                    const last = run.answers[run.answers.length - 1];
                    const selectedThis =
                      feedback !== "none" &&
                      last?.questionId === question.id &&
                      last?.selected === i;
                    const isCorrect = i === question.correctIndex;
                    let cls = "bg-[var(--pw-surface)] hover:border-[var(--pw-accent)]";
                    if (feedback !== "none" && isCorrect) cls = "border-[var(--pw-accent-2)]";
                    if (feedback === "wrong" && selectedThis) cls = "border-[var(--pw-danger)]";
                    return (
                      <button
                        key={i}
                        onClick={() => answer(i)}
                        disabled={feedback !== "none"}
                        className={`w-full text-left pw-pill px-5 py-3 pw-border text-[15px] transition-all duration-250 relative ${cls}`}
                        style={
                          feedback !== "none" && isCorrect
                            ? { background: "rgba(45,106,79,0.08)" }
                            : undefined
                        }
                      >
                        {opt}
                        {selectedThis && feedback === "correct" && floatXP && (
                          <span
                            className="absolute right-4 top-1/2 -translate-y-1/2 font-mono-pw text-[13px] animate-float-up"
                            style={{ color: "var(--pw-accent-3)" }}
                          >
                            +{xpGain} XP
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {feedback === "correct" && (
                  <div className="mt-4 text-[13px]" style={{ color: "var(--pw-accent-2)" }}>
                    ✓ Correct — stepping up the difficulty.
                  </div>
                )}
                {feedback === "wrong" && (
                  <div className="mt-4 text-[13px] text-[var(--pw-ink-2)]">
                    Not quite — the answer was{" "}
                    <strong style={{ color: "var(--pw-accent-2)" }}>
                      {question.options[question.correctIndex]}
                    </strong>
                    . Easing off for the next one.
                  </div>
                )}

                {pw.streak >= 3 && feedback === "correct" && (
                  <div className="mt-2 text-[12px] text-[var(--pw-accent)]">
                    🔥 {pw.streak} in a row!
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center mt-24"
            >
              <div className="relative w-16 h-16">
                <svg
                  viewBox="0 0 50 50"
                  className="w-full h-full animate-spin"
                  style={{ animationDuration: "1.2s" }}
                >
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    stroke="var(--pw-surface-2)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    stroke="var(--pw-accent)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="125"
                    strokeDashoffset="80"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-5 text-[14px] text-[var(--pw-ink-2)]"
                >
                  {loadingText}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {phase === "result" && lvl && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 16 }}
              className="max-w-[440px] mx-auto mt-16"
            >
              <div
                className="pw-card p-8 text-center"
                style={{ borderWidth: 2, borderColor: "var(--pw-accent)" }}
              >
                <div className="flex justify-center">
                  <div
                    className="w-40 h-44 flex flex-col items-center justify-center text-white"
                    style={{
                      background: "var(--pw-accent)",
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }}
                  >
                    <div className="font-mono-pw text-[11px] pw-tracking-wide opacity-90">
                      YOUR LEVEL
                    </div>
                    <div className="text-3xl mt-1">{LEVEL_META[lvl].emoji}</div>
                    <div className="font-display text-[28px] font-bold leading-none mt-1">
                      {lvl}
                    </div>
                    <div className="font-mono-pw text-[12px] mt-2 opacity-90">
                      {score} / {ADAPTIVE_LENGTH} correct
                    </div>
                  </div>
                </div>

                {/* The level id is the key everything downstream matches on. */}
                {pw.band && pw.subject && (
                  <div className="mt-4 font-mono-pw text-[11px] text-[var(--pw-ink-2)]">
                    LEVEL ID ·{" "}
                    <span style={{ color: "var(--pw-accent)" }}>
                      {makeLevelId(pw.subject, pw.band)}
                    </span>
                  </div>
                )}

                <div
                  className="mt-3 font-mono-pw text-[14px]"
                  style={{ color: "var(--pw-accent)" }}
                >
                  ✦ {pw.totalXP} XP Earned
                </div>
                <p className="text-[15px] text-[var(--pw-ink-2)] mt-4">{interp}</p>

                {/* Per-topic breakdown — the strands the roadmap will lean on */}
                {topicEntries.length > 0 && (
                  <div className="mt-5 text-left">
                    <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2">
                      By topic
                    </div>
                    <div className="space-y-1.5">
                      {topicEntries.map(([topic, band]) => (
                        <div key={topic} className="flex items-center justify-between text-[13px]">
                          <span className="text-[var(--pw-ink-2)]">{topic}</span>
                          <span className="flex items-center gap-1.5">
                            <span className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <span
                                  key={n}
                                  className="w-1.5 h-3 rounded-sm"
                                  style={{
                                    background:
                                      n <= band ? "var(--pw-accent)" : "var(--pw-surface-2)",
                                  }}
                                />
                              ))}
                            </span>
                            <span className="text-[11px] text-[var(--pw-ink-2)] w-[92px] text-right">
                              {BAND_META[band].label}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Button now calls handleBuildRoadmap — does both saves in one go */}
                <button
                  onClick={handleBuildRoadmap}
                  disabled={buildingRoadmap}
                  className="pw-btn-primary mt-7 w-full px-7 py-3.5 text-[15px] font-medium disabled:opacity-60"
                >
                  {buildingRoadmap ? "Building..." : "Build My Roadmap →"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Step({
  title,
  stepLabel,
  children,
}: {
  title: string;
  stepLabel: string;
  children: React.ReactNode;
  key?: React.Key;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="max-w-[560px] mx-auto mt-12 text-center"
    >
      <div className="font-mono-pw text-[12px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
        {stepLabel}
      </div>
      <h2 className="font-display text-[32px] sm:text-[38px] leading-tight mt-3">{title}</h2>
      {children}
    </motion.div>
  );
}