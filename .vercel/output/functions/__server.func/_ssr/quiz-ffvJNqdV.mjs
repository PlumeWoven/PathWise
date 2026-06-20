import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { c as confetti } from "../_libs/canvas-confetti.mjs";
import { P as PWHeader, g as getCurrentUser, a as saveDiagnosticResult, b as createRoadmap } from "./router-C4GolrgT.mjs";
import { u as usePW, r as resetState, p as pickQuizQuestions, S as SUBJECTS, a as GOALS, L as LEVEL_META, s as setState, G as GOAL_LABELS, l as levelFromScore } from "./store-BHvhbBzf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as RoleGate } from "./RoleGate-BYZ2pTkR.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__zod-adapter.mjs";
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-scroll-area.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/date-fns.mjs";
import "../_libs/date-fns-tz.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const TEMPLATES = {
  Mathematics: {
    Seedling: [
      { stage_number: 1, title: "Number Foundations", skills: ["Fractions", "Decimals", "Ratios"] },
      { stage_number: 2, title: "Basic Algebra", skills: ["Equations", "Variables", "Expressions"] },
      { stage_number: 3, title: "Geometry Basics", skills: ["Shapes", "Area", "Perimeter"] },
      { stage_number: 4, title: "Functions & Graphs", skills: ["Linear functions", "Plotting", "Slope"] },
      { stage_number: 5, title: "Advanced Math", skills: ["Quadratics", "Systems", "Polynomials"] }
    ],
    Spark: [
      { stage_number: 1, title: "Strengthen Arithmetic", skills: ["Fractions", "Percentages", "Ratios"] },
      { stage_number: 2, title: "Algebra Foundations", skills: ["Equations", "Inequalities", "Expressions"] },
      { stage_number: 3, title: "Geometry & Measurement", skills: ["Area", "Volume", "Angles"] },
      { stage_number: 4, title: "Functions & Graphs", skills: ["Linear", "Plotting", "Slope"] },
      { stage_number: 5, title: "Quadratics & Beyond", skills: ["Quadratics", "Systems", "Polynomials"] }
    ],
    Builder: [
      { stage_number: 1, title: "Plug the Gaps", skills: ["Fractions", "Ratios", "Percentages"] },
      { stage_number: 2, title: "Algebra Mastery", skills: ["Equations", "Inequalities", "Factoring"] },
      { stage_number: 3, title: "Geometry Essentials", skills: ["Shapes", "Area", "Angles"] },
      { stage_number: 4, title: "Functions & Graphs", skills: ["Linear", "Quadratic", "Slope"] },
      { stage_number: 5, title: "Advanced Algebra", skills: ["Quadratics", "Systems", "Polynomials"] }
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Sharpen Algebra", skills: ["Factoring", "Inequalities", "Manipulation"] },
      { stage_number: 2, title: "Functions Deep Dive", skills: ["Linear", "Quadratic", "Exponential"] },
      { stage_number: 3, title: "Trigonometry Basics", skills: ["Sin/Cos/Tan", "Identities", "Triangles"] },
      { stage_number: 4, title: "Pre-Calculus", skills: ["Sequences", "Limits intro", "Vectors"] },
      { stage_number: 5, title: "Advanced Topics", skills: ["Calculus intro", "Series", "Modeling"] }
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Foundations"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Algebra"] },
      { stage_number: 3, title: "Calculus Foundations", skills: ["Limits", "Derivatives", "Integrals"] },
      { stage_number: 4, title: "Advanced Calculus", skills: ["Series", "Multivariable", "Diff Eq"] },
      { stage_number: 5, title: "Specialized Topics", skills: ["Linear algebra", "Proofs", "Modeling"] }
    ]
  },
  Sciences: {
    Seedling: [
      { stage_number: 1, title: "Scientific Method", skills: ["Units", "Variables", "Method"] },
      { stage_number: 2, title: "Forces & Motion", skills: ["Forces", "Motion", "Energy"] },
      { stage_number: 3, title: "Cells & Life", skills: ["Cells", "DNA", "Systems"] },
      { stage_number: 4, title: "Chemistry Basics", skills: ["Atoms", "Bonds", "Reactions"] },
      { stage_number: 5, title: "Applied Sciences", skills: ["Modeling", "Lab work", "Analysis"] }
    ],
    Spark: [
      { stage_number: 1, title: "Lab Skills", skills: ["Units", "Method", "Measurement"] },
      { stage_number: 2, title: "Mechanics", skills: ["Forces", "Motion", "Energy"] },
      { stage_number: 3, title: "Cell Biology", skills: ["Cells", "Genetics", "Systems"] },
      { stage_number: 4, title: "Chemistry Basics", skills: ["Atoms", "Bonds", "Reactions"] },
      { stage_number: 5, title: "Applied Sciences", skills: ["Modeling", "Lab work", "Analysis"] }
    ],
    Builder: [
      { stage_number: 1, title: "Method & Units", skills: ["Method", "Units", "Variables"] },
      { stage_number: 2, title: "Mechanics & Energy", skills: ["Forces", "Motion", "Energy"] },
      { stage_number: 3, title: "Life Sciences", skills: ["Cells", "Ecology", "Genetics"] },
      { stage_number: 4, title: "Chemistry Core", skills: ["Atoms", "Reactions", "Stoichiometry"] },
      { stage_number: 5, title: "Applied Problem Solving", skills: ["Modeling", "Lab work", "Analysis"] }
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Advanced Mechanics", skills: ["Dynamics", "Energy", "Momentum"] },
      { stage_number: 2, title: "Waves & Fields", skills: ["Waves", "Optics", "Electromagnetism"] },
      { stage_number: 3, title: "Molecular Biology", skills: ["DNA", "Proteins", "Cells"] },
      { stage_number: 4, title: "Organic Chemistry", skills: ["Functional groups", "Mechanisms", "Synthesis"] },
      { stage_number: 5, title: "Integrated Sciences", skills: ["Modeling", "Lab", "Cross-disciplinary"] }
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Foundations"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Core sciences"] },
      { stage_number: 3, title: "Advanced Physics", skills: ["Quantum intro", "Relativity", "Thermo"] },
      { stage_number: 4, title: "Advanced Chemistry", skills: ["Organic", "Physical chem", "Spectroscopy"] },
      { stage_number: 5, title: "Research Methods", skills: ["Experiment design", "Data", "Publishing"] }
    ]
  },
  Literature: {
    Seedling: [
      { stage_number: 1, title: "Reading Closely", skills: ["Annotation", "Tone", "Theme"] },
      { stage_number: 2, title: "Literary Devices", skills: ["Metaphor", "Symbolism", "Imagery"] },
      { stage_number: 3, title: "Forms & Genres", skills: ["Poetry", "Prose", "Drama"] },
      { stage_number: 4, title: "Critical Essays", skills: ["Thesis", "Evidence", "Voice"] },
      { stage_number: 5, title: "Advanced Analysis", skills: ["Theory", "Comparative", "Context"] }
    ],
    Spark: [
      { stage_number: 1, title: "Active Reading", skills: ["Annotation", "Theme", "Tone"] },
      { stage_number: 2, title: "Literary Devices", skills: ["Metaphor", "Symbolism", "Imagery"] },
      { stage_number: 3, title: "Forms & Genres", skills: ["Poetry", "Prose", "Drama"] },
      { stage_number: 4, title: "Critical Essays", skills: ["Thesis", "Evidence", "Voice"] },
      { stage_number: 5, title: "Advanced Analysis", skills: ["Theory", "Comparative", "Context"] }
    ],
    Builder: [
      { stage_number: 1, title: "Close Reading", skills: ["Annotation", "Tone", "Theme"] },
      { stage_number: 2, title: "Devices & Voice", skills: ["Metaphor", "Irony", "Voice"] },
      { stage_number: 3, title: "Genre Mastery", skills: ["Poetry", "Prose", "Drama"] },
      { stage_number: 4, title: "Argument Essays", skills: ["Thesis", "Evidence", "Structure"] },
      { stage_number: 5, title: "Advanced Analysis", skills: ["Theory", "Comparative", "Context"] }
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Critical Reading", skills: ["Subtext", "Voice", "Form"] },
      { stage_number: 2, title: "Theory Foundations", skills: ["Structuralism", "Feminism", "Post-colonial"] },
      { stage_number: 3, title: "Comparative Studies", skills: ["Cross-cultural", "Periods", "Influence"] },
      { stage_number: 4, title: "Original Essays", skills: ["Argument", "Research", "Voice"] },
      { stage_number: 5, title: "Scholarly Writing", skills: ["Citation", "Publication", "Critique"] }
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Reading"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Devices"] },
      { stage_number: 3, title: "Theory & Criticism", skills: ["Theory", "Critique", "Movements"] },
      { stage_number: 4, title: "Comparative Mastery", skills: ["Cross-period", "Cross-culture", "Influence"] },
      { stage_number: 5, title: "Scholarly Output", skills: ["Research", "Publication", "Defense"] }
    ]
  },
  History: {
    Seedling: [
      { stage_number: 1, title: "Timeline Mastery", skills: ["Eras", "Dates", "Maps"] },
      { stage_number: 2, title: "Ancient Worlds", skills: ["Egypt", "Greece", "Rome"] },
      { stage_number: 3, title: "Medieval to Modern", skills: ["Empires", "Revolutions", "Trade"] },
      { stage_number: 4, title: "20th Century", skills: ["WWI", "WWII", "Cold War"] },
      { stage_number: 5, title: "Historical Thinking", skills: ["Sources", "Bias", "Argument"] }
    ],
    Spark: [
      { stage_number: 1, title: "Chronology", skills: ["Eras", "Dates", "Maps"] },
      { stage_number: 2, title: "Ancient Worlds", skills: ["Egypt", "Greece", "Rome"] },
      { stage_number: 3, title: "Medieval to Modern", skills: ["Empires", "Trade", "Revolutions"] },
      { stage_number: 4, title: "Modern Era", skills: ["WWI", "WWII", "Cold War"] },
      { stage_number: 5, title: "Source Analysis", skills: ["Sources", "Bias", "Argument"] }
    ],
    Builder: [
      { stage_number: 1, title: "Timelines", skills: ["Eras", "Dates", "Maps"] },
      { stage_number: 2, title: "Ancient Civilizations", skills: ["Egypt", "Greece", "Rome"] },
      { stage_number: 3, title: "Empires & Revolutions", skills: ["Empires", "Trade", "Revolutions"] },
      { stage_number: 4, title: "20th Century", skills: ["WWI", "WWII", "Cold War"] },
      { stage_number: 5, title: "Historical Argument", skills: ["Sources", "Bias", "Argument"] }
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Historiography", skills: ["Schools", "Methods", "Bias"] },
      { stage_number: 2, title: "Comparative History", skills: ["Cross-region", "Cross-period", "Themes"] },
      { stage_number: 3, title: "Primary Sources", skills: ["Archives", "Interpretation", "Critique"] },
      { stage_number: 4, title: "20th Century Deep Dive", skills: ["WWI/II", "Cold War", "Decolonization"] },
      { stage_number: 5, title: "Original Research", skills: ["Question", "Sources", "Argument"] }
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Chronology"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Ancient/Modern"] },
      { stage_number: 3, title: "Historiography", skills: ["Schools", "Methods", "Critique"] },
      { stage_number: 4, title: "Archival Research", skills: ["Primary sources", "Interpretation", "Argument"] },
      { stage_number: 5, title: "Scholarly Output", skills: ["Research", "Writing", "Publication"] }
    ]
  },
  Programming: {
    Seedling: [
      { stage_number: 1, title: "Syntax & Variables", skills: ["Types", "Loops", "Functions"] },
      { stage_number: 2, title: "Data Structures", skills: ["Arrays", "Objects", "Maps"] },
      { stage_number: 3, title: "Algorithms", skills: ["Search", "Sort", "Big-O"] },
      { stage_number: 4, title: "Async & APIs", skills: ["Promises", "Fetch", "Errors"] },
      { stage_number: 5, title: "Build a Project", skills: ["Architecture", "Testing", "Deploy"] }
    ],
    Spark: [
      { stage_number: 1, title: "Core Syntax", skills: ["Types", "Loops", "Functions"] },
      { stage_number: 2, title: "Data Structures", skills: ["Arrays", "Objects", "Maps"] },
      { stage_number: 3, title: "Algorithms", skills: ["Search", "Sort", "Big-O"] },
      { stage_number: 4, title: "Async & APIs", skills: ["Promises", "Fetch", "Errors"] },
      { stage_number: 5, title: "Ship a Project", skills: ["Architecture", "Testing", "Deploy"] }
    ],
    Builder: [
      { stage_number: 1, title: "Refine Syntax", skills: ["Types", "Functions", "Modules"] },
      { stage_number: 2, title: "Data Structures", skills: ["Arrays", "Maps", "Sets"] },
      { stage_number: 3, title: "Algorithms & Big-O", skills: ["Search", "Sort", "Recursion"] },
      { stage_number: 4, title: "Async & APIs", skills: ["Promises", "Fetch", "Errors"] },
      { stage_number: 5, title: "Production Project", skills: ["Architecture", "Testing", "Deploy"] }
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Advanced Patterns", skills: ["Generics", "Closures", "Patterns"] },
      { stage_number: 2, title: "System Design", skills: ["Scaling", "Caching", "DBs"] },
      { stage_number: 3, title: "Testing & CI/CD", skills: ["Unit", "Integration", "Pipelines"] },
      { stage_number: 4, title: "Performance", skills: ["Profiling", "Memory", "Optimization"] },
      { stage_number: 5, title: "Open Source / Job", skills: ["Portfolio", "Interviews", "Shipping"] }
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Syntax"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Data structures"] },
      { stage_number: 3, title: "System Design", skills: ["Scaling", "Distributed", "Patterns"] },
      { stage_number: 4, title: "Specialization", skills: ["ML/Infra/Web", "Deep dive", "Mastery"] },
      { stage_number: 5, title: "Lead & Ship", skills: ["Architecture", "Mentorship", "Delivery"] }
    ]
  },
  Languages: {
    Seedling: [
      { stage_number: 1, title: "Sound & Script", skills: ["Phonetics", "Alphabet", "Greetings"] },
      { stage_number: 2, title: "Core Vocabulary", skills: ["Nouns", "Verbs", "Numbers"] },
      { stage_number: 3, title: "Grammar Backbone", skills: ["Present", "Past", "Future"] },
      { stage_number: 4, title: "Conversations", skills: ["Listening", "Speaking", "Idioms"] },
      { stage_number: 5, title: "Fluent Use", skills: ["Reading", "Writing", "Culture"] }
    ],
    Spark: [
      { stage_number: 1, title: "Pronunciation", skills: ["Phonetics", "Alphabet", "Greetings"] },
      { stage_number: 2, title: "Vocabulary Building", skills: ["Nouns", "Verbs", "Numbers"] },
      { stage_number: 3, title: "Grammar Basics", skills: ["Present", "Past", "Future"] },
      { stage_number: 4, title: "Conversations", skills: ["Listening", "Speaking", "Idioms"] },
      { stage_number: 5, title: "Real-world Use", skills: ["Reading", "Writing", "Culture"] }
    ],
    Builder: [
      { stage_number: 1, title: "Refine Pronunciation", skills: ["Phonetics", "Stress", "Rhythm"] },
      { stage_number: 2, title: "Expand Vocabulary", skills: ["Themes", "Idioms", "Collocations"] },
      { stage_number: 3, title: "Grammar Mastery", skills: ["Tenses", "Mood", "Clauses"] },
      { stage_number: 4, title: "Real Conversations", skills: ["Listening", "Speaking", "Slang"] },
      { stage_number: 5, title: "Comfortable Fluency", skills: ["Reading", "Writing", "Culture"] }
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Advanced Grammar", skills: ["Subjunctive", "Conditional", "Style"] },
      { stage_number: 2, title: "Idiomatic Speech", skills: ["Idioms", "Slang", "Register"] },
      { stage_number: 3, title: "Native Media", skills: ["News", "Film", "Podcasts"] },
      { stage_number: 4, title: "Writing Mastery", skills: ["Essays", "Style", "Voice"] },
      { stage_number: 5, title: "Near-Native Use", skills: ["Debate", "Nuance", "Culture"] }
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Foundations"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Grammar"] },
      { stage_number: 3, title: "Cultural Fluency", skills: ["Idioms", "Humor", "Subtext"] },
      { stage_number: 4, title: "Specialized Domains", skills: ["Business", "Academic", "Literary"] },
      { stage_number: 5, title: "Native Mastery", skills: ["Voice", "Debate", "Writing"] }
    ]
  }
};
function generateStages(subject, level, goal) {
  const tpl = TEMPLATES[subject][level];
  const goalLabel = goal ? GOAL_LABELS[goal] : null;
  return tpl.map((s, i) => ({
    ...s,
    // Replace last stage title with the user's goal when provided.
    title: i === tpl.length - 1 && goalLabel ? goalLabel : s.title,
    status: i === 0 ? "active" : "locked"
  }));
}
function QuizPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RoleGate, { allow: ["student", "both"], allowAnonymous: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(QuizPageInner, {}) });
}
function QuizPageInner() {
  const navigate = useNavigate();
  const pw = usePW();
  const [phase, setPhase] = reactExports.useState("subject");
  const [qIndex, setQIndex] = reactExports.useState(0);
  const [feedback, setFeedback] = reactExports.useState("none");
  const [floatXP, setFloatXP] = reactExports.useState(false);
  const [loadingText, setLoadingText] = reactExports.useState("Analyzing your answers...");
  const [buildingRoadmap, setBuildingRoadmap] = reactExports.useState(false);
  const savedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    resetState();
    setPhase("subject");
    setQIndex(0);
  }, []);
  const questions = reactExports.useMemo(() => pw.subject ? pickQuizQuestions(pw.subject, 5) : [], [pw.subject]);
  let progress = 0;
  if (phase === "subject") progress = 5;
  else if (phase === "goal") progress = 15;
  else if (phase === "intro") progress = 25;
  else if (phase === "quiz") progress = 25 + qIndex / questions.length * 60;
  else progress = 100;
  const pickSubject = (s) => {
    setState({
      subject: s
    });
    setTimeout(() => setPhase("goal"), 300);
  };
  const pickGoal = (g) => {
    setState({
      goal: g
    });
    setTimeout(() => setPhase("intro"), 300);
  };
  const answer = (i) => {
    if (feedback !== "none") return;
    const q = questions[qIndex];
    const correct = i === q.correctIndex;
    const newAnswers = [...pw.answers, {
      questionId: q.id,
      selected: i,
      correct,
      topic: q.topic
    }];
    let xp = pw.totalXP;
    let streak = pw.streak;
    if (correct) {
      xp += 100;
      streak += 1;
      if (streak >= 3) xp += 20;
      setFloatXP(true);
      setTimeout(() => setFloatXP(false), 1200);
    } else {
      streak = 0;
    }
    setState({
      answers: newAnswers,
      totalXP: xp,
      streak
    });
    setFeedback(correct ? "correct" : "wrong");
    const delay = correct ? 900 : 1700;
    setTimeout(() => {
      setFeedback("none");
      if (qIndex + 1 >= questions.length) {
        finish(newAnswers);
      } else {
        setQIndex(qIndex + 1);
      }
    }, delay);
  };
  const finish = (answers) => {
    const score2 = answers.filter((a) => a.correct).length;
    const lvl2 = levelFromScore(score2);
    setState({
      level: lvl2
    });
    setPhase("loading");
    const phrases = ["Analyzing your answers...", "Calculating your level...", "Almost ready..."];
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
          origin: {
            y: 0.4
          },
          colors: ["#E85D26", "#F4C430", "#2D6A4F"]
        });
      }, 200);
    }, 1600);
  };
  async function handleBuildRoadmap() {
    if (buildingRoadmap) return;
    if (!pw.subject || !pw.level) return;
    if (savedRef.current) return;
    savedRef.current = true;
    setBuildingRoadmap(true);
    try {
      const user = await getCurrentUser();
      const userId = user?.id ?? null;
      const score2 = pw.answers.filter((a) => a.correct).length;
      const wrongTopics2 = Array.from(new Set(pw.answers.filter((a) => !a.correct).map((a) => a.topic)));
      const diagnosticId = await saveDiagnosticResult({
        user_id: userId,
        subject: pw.subject,
        goal: pw.goal ?? "grades",
        score: score2,
        level: pw.level,
        xp_earned: pw.totalXP,
        wrong_topics: wrongTopics2
      });
      const stages = generateStages(pw.subject, pw.level, pw.goal);
      const roadmapId = await createRoadmap({
        user_id: userId,
        diagnostic_id: diagnosticId,
        subject: pw.subject,
        goal: pw.goal ?? "grades",
        stages
      });
      try {
        localStorage.setItem("pathwise_roadmap_id", roadmapId);
        localStorage.setItem("pathwise_diagnostic_id", diagnosticId);
      } catch {
      }
      navigate({
        to: "/roadmap",
        search: {
          roadmapId
        }
      });
    } catch (err) {
      console.error("[quiz] handleBuildRoadmap error", err);
      toast.error(err?.message || "Couldn't build your roadmap. Please try again.");
      savedRef.current = false;
      setBuildingRoadmap(false);
    }
  }
  const score = pw.answers.filter((a) => a.correct).length;
  const lvl = pw.level;
  const wrongTopics = Array.from(new Set(pw.answers.filter((a) => !a.correct).map((a) => a.topic)));
  const interp = lvl ? wrongTopics.length === 0 ? "You answered everything correctly — you're ready to go straight to advanced material." : `You have solid skills overall, but ${wrongTopics.slice(0, 2).join(" and ")} need some work.` : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)] relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-0 left-0 right-0 h-[3px] bg-transparent z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full transition-all duration-500", style: {
      width: `${progress}%`,
      background: "var(--pw-accent)"
    } }) }),
    (phase === "quiz" || phase === "intro") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed top-4 right-4 sm:top-6 sm:right-6 z-40 flex items-center gap-2 pw-card px-3 py-1.5 font-mono-pw text-[12px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
        color: "var(--pw-accent-3)"
      }, children: "✦" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        pw.totalXP,
        " XP"
      ] }),
      pw.streak >= 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-[var(--pw-accent)]", children: [
        "🔥 ",
        pw.streak
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "px-5 sm:px-8 pb-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
      phase === "subject" && /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { title: "What do you want to get better at?", stepLabel: "STEP 1 OF 2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 mt-8", children: SUBJECTS.map((s) => {
        const selected = pw.subject === s.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => pickSubject(s.id), className: `relative h-16 pw-card flex items-center justify-center gap-2 transition-all duration-250 ${selected ? "border-[var(--pw-accent)]" : "hover:border-[var(--pw-accent)]"}`, style: selected ? {
          background: "var(--pw-accent-soft)"
        } : void 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: s.emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[14px] font-medium", children: s.label }),
          selected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1.5 right-2 text-[var(--pw-accent)] text-sm", children: "✓" })
        ] }, s.id);
      }) }) }, "subject"),
      phase === "goal" && /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { title: "What's your main goal right now?", stepLabel: "STEP 2 OF 2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2.5 mt-8 justify-center", children: GOALS.map((g) => {
        const selected = pw.goal === g.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => pickGoal(g.id), className: `pw-pill px-5 py-3 pw-border text-[14px] transition-all duration-250 ${selected ? "text-white border-[var(--pw-accent)]" : "bg-white hover:border-[var(--pw-accent)]"}`, style: selected ? {
          background: "var(--pw-accent)"
        } : void 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-2", children: g.emoji }),
          g.label
        ] }, g.id);
      }) }) }, "goal"),
      phase === "intro" && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
        opacity: 0,
        scale: 0.85
      }, animate: {
        opacity: 1,
        scale: 1
      }, exit: {
        opacity: 0,
        scale: 0.95
      }, transition: {
        type: "spring",
        stiffness: 200,
        damping: 18,
        duration: 0.4
      }, className: "max-w-[480px] mx-auto mt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl", children: "🎮" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[32px] mt-4 leading-tight", children: "Level Check: Unlocked" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[15px] text-[var(--pw-ink-2)] mt-3", children: "Answer 5 quick questions. We'll calculate your exact starting point." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[12px] text-[var(--pw-ink-2)] mb-2", children: "XP: 0 / 500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-[var(--pw-surface-2)] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", style: {
            width: "0%",
            background: "var(--pw-accent)"
          } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPhase("quiz"), className: "pw-btn-primary mt-7 px-8 py-3.5 text-[15px] font-medium", children: "Begin →" })
      ] }) }, "intro"),
      phase === "quiz" && questions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, animate: {
        opacity: 1,
        y: 0
      }, exit: {
        opacity: 0,
        y: -12
      }, transition: {
        duration: 0.25,
        ease: "easeOut"
      }, className: "max-w-[560px] mx-auto mt-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `pw-card p-6 sm:p-7 relative ${feedback === "correct" ? "flash-green" : feedback === "wrong" ? "flash-red" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[12px] text-[var(--pw-ink-2)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Question ",
            qIndex + 1,
            " of ",
            questions.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono-pw text-[11px] px-2 py-0.5 pw-pill", style: {
            background: "var(--pw-accent-3)",
            color: "var(--pw-ink)"
          }, children: [
            "✦ ",
            pw.totalXP,
            " XP"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-1 rounded-full bg-[var(--pw-surface-2)] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full transition-all duration-500", style: {
          width: `${(qIndex + 1) / questions.length * 100}%`,
          background: "var(--pw-accent)"
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mt-5", children: questions[qIndex].topic }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[18px] font-medium mt-2 leading-snug", children: questions[qIndex].question }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 space-y-2.5 relative", children: questions[qIndex].options.map((opt, i) => {
          const selectedThis = feedback !== "none" && pw.answers[pw.answers.length - 1]?.questionId === questions[qIndex].id && pw.answers[pw.answers.length - 1]?.selected === i;
          const isCorrect = i === questions[qIndex].correctIndex;
          let cls = "bg-white hover:border-[var(--pw-accent)]";
          if (feedback !== "none" && isCorrect) cls = "border-[var(--pw-accent-2)]";
          if (feedback === "wrong" && selectedThis) cls = "border-[var(--pw-danger)]";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => answer(i), disabled: feedback !== "none", className: `w-full text-left pw-pill px-5 py-3 pw-border text-[15px] transition-all duration-250 relative ${cls}`, style: feedback !== "none" && isCorrect ? {
            background: "rgba(45,106,79,0.08)"
          } : void 0, children: [
            opt,
            selectedThis && feedback === "correct" && floatXP && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 font-mono-pw text-[13px] animate-float-up", style: {
              color: "var(--pw-accent-3)"
            }, children: "+100 XP" })
          ] }, i);
        }) }),
        feedback === "correct" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-[13px]", style: {
          color: "var(--pw-accent-2)"
        }, children: "✓ Correct!" }),
        feedback === "wrong" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 text-[13px] text-[var(--pw-ink-2)]", children: [
          "Not quite — the answer was ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: {
            color: "var(--pw-accent-2)"
          }, children: questions[qIndex].options[questions[qIndex].correctIndex] })
        ] }),
        pw.streak >= 3 && feedback === "correct" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-[12px] text-[var(--pw-accent)]", children: [
          "🔥 ",
          pw.streak,
          " in a row!"
        ] })
      ] }) }, `q-${qIndex}`),
      phase === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, exit: {
        opacity: 0
      }, className: "flex flex-col items-center justify-center mt-24", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-16 h-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 50 50", className: "w-full h-full animate-spin", style: {
          animationDuration: "1.2s"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "25", cy: "25", r: "20", stroke: "var(--pw-surface-2)", strokeWidth: "4", fill: "none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "25", cy: "25", r: "20", stroke: "var(--pw-accent)", strokeWidth: "4", fill: "none", strokeDasharray: "125", strokeDashoffset: "80", strokeLinecap: "round" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
          opacity: 0
        }, animate: {
          opacity: 1
        }, exit: {
          opacity: 0
        }, transition: {
          duration: 0.3
        }, className: "mt-5 text-[14px] text-[var(--pw-ink-2)]", children: loadingText }, loadingText) })
      ] }, "loading"),
      phase === "result" && lvl && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
        opacity: 0,
        scale: 0.85
      }, animate: {
        opacity: 1,
        scale: 1
      }, transition: {
        type: "spring",
        stiffness: 180,
        damping: 16
      }, className: "max-w-[420px] mx-auto mt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-8 text-center", style: {
        borderWidth: 2,
        borderColor: "var(--pw-accent)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-40 h-44 flex flex-col items-center justify-center text-white", style: {
          background: "var(--pw-accent)",
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] pw-tracking-wide opacity-90", children: "YOUR LEVEL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl mt-1", children: LEVEL_META[lvl].emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[28px] font-bold leading-none mt-1", children: lvl }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono-pw text-[12px] mt-2 opacity-90", children: [
            score,
            " / 5 correct"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 font-mono-pw text-[14px]", style: {
          color: "var(--pw-accent)"
        }, children: [
          "✦ ",
          pw.totalXP,
          " XP Earned"
        ] }),
        pw.answers.some((a, i) => a.correct && pw.answers.slice(0, i + 1).filter((x) => x.correct).length >= 3) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)] mt-1", children: "🔥 streak bonus included" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[15px] text-[var(--pw-ink-2)] mt-4", children: interp }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleBuildRoadmap, disabled: buildingRoadmap, className: "pw-btn-primary mt-7 w-full px-7 py-3.5 text-[15px] font-medium disabled:opacity-60", children: buildingRoadmap ? "Building..." : "Build My Roadmap →" })
      ] }) }, "result")
    ] }) })
  ] });
}
function Step({
  title,
  stepLabel,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    y: 12
  }, animate: {
    opacity: 1,
    y: 0
  }, exit: {
    opacity: 0,
    y: -12
  }, transition: {
    duration: 0.25,
    ease: "easeOut"
  }, className: "max-w-[560px] mx-auto mt-12 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[12px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: stepLabel }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[32px] sm:text-[38px] leading-tight mt-3", children: title }),
    children
  ] });
}
export {
  QuizPage as component
};
