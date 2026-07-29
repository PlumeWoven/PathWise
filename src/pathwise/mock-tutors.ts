/**
 * src/pathwise/mock-tutors.ts
 *
 * A self-contained demo roster: 18 tutors across all six canonical subjects
 * and all five level bands, each with two courses pitched at different bands.
 *
 * This is the dataset the roadmap's "Your matched tutors" panel filters. It is
 * bundled rather than fetched so the panel works with no database, no seeded
 * auth users, and no migration applied — the whole quiz → roadmap → find-tutor
 * flow is demonstrable on a cold checkout.
 *
 * Every tutor is fictional. Real tutors coming from Supabase are matched
 * separately by ./course-matching, which this module deliberately does not
 * touch.
 */

// Explicit .ts extensions keep this module loadable by `node --test`, which
// resolves imports natively rather than through Vite (same reason as
// ./adaptive-quiz).
import type { Subject } from "./data.ts";
import { canonicalSubjectFromTutorQuiz, type LevelBand } from "./levels.ts";

// The tutor quiz's own vocabulary (see routes/_app.find-tutor.tsx).
export type TutorQuizGoal =
  | "ace_exam"
  | "master_skill"
  | "build_confidence"
  | "get_ahead"
  | "homework";
export type LearningStyle = "visual" | "auditory" | "kinesthetic";
export type TimeOfDay = "early_bird" | "midday" | "night_owl" | "weekend";
export type Frequency = "weekly" | "biweekly" | "intensive" | "flexible";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface MockCourse {
  id: string;
  title: string;
  subtitle: string;
  /** The level band this course is pitched at. */
  band: LevelBand;
  weeks: number;
  price: number;
  outcomes: string[];
}

export interface MockTutor {
  id: string;
  name: string;
  initial: string;
  color: string;
  headline: string;
  subjects: Subject[];
  /** Inclusive band range this tutor teaches, e.g. [2, 4]. */
  bands: [LevelBand, LevelBand];
  learningStyles: LearningStyle[];
  vibes: string[];
  goals: TutorQuizGoal[];
  timeOfDay: TimeOfDay[];
  frequencies: Frequency[];
  hourlyRate: number;
  rating: number;
  reviews: number;
  yearsExperience: number;
  verified: boolean;
  freeDiscoveryCall: boolean;
  firstSessionFree: boolean;
  courses: MockCourse[];
}

// ─────────────────────────────────────────────
// The roster
// ─────────────────────────────────────────────

export const MOCK_TUTORS: MockTutor[] = [
  // ── Mathematics ───────────────────────────────────────────────────────────
  {
    id: "mock-mth-1",
    name: "Amélie Laurent",
    initial: "A",
    color: "#E85D26",
    headline: "Rebuilds shaky arithmetic into real confidence",
    subjects: ["Mathematics"],
    bands: [1, 2],
    learningStyles: ["visual", "kinesthetic"],
    vibes: ["Patient", "Motivational"],
    goals: ["build_confidence", "homework", "master_skill"],
    timeOfDay: ["early_bird", "midday"],
    frequencies: ["weekly", "biweekly", "flexible"],
    hourlyRate: 22,
    rating: 4.9,
    reviews: 127,
    yearsExperience: 8,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: true,
    courses: [
      {
        id: "mock-crs-mth-1a",
        title: "Number Foundations, Properly",
        subtitle: "Fractions, decimals and ratios that finally click",
        band: 1,
        weeks: 6,
        price: 0,
        outcomes: ["Fractions", "Decimals", "Ratios", "Mental maths"],
      },
      {
        id: "mock-crs-mth-1b",
        title: "First Steps in Algebra",
        subtitle: "From arithmetic to solving for x",
        band: 2,
        weeks: 8,
        price: 45,
        outcomes: ["Equations", "Variables", "Expressions"],
      },
    ],
  },
  {
    id: "mock-mth-2",
    name: "Marcus Chen",
    initial: "M",
    color: "#2D6A4F",
    headline: "Exam-focused algebra and geometry, worked example by worked example",
    subjects: ["Mathematics"],
    bands: [2, 4],
    learningStyles: ["visual", "auditory"],
    vibes: ["Methodical", "Strict"],
    goals: ["ace_exam", "get_ahead", "master_skill"],
    timeOfDay: ["midday", "night_owl", "weekend"],
    frequencies: ["biweekly", "intensive"],
    hourlyRate: 38,
    rating: 4.8,
    reviews: 89,
    yearsExperience: 12,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: false,
    courses: [
      {
        id: "mock-crs-mth-2a",
        title: "Algebra Mastery",
        subtitle: "Factoring, inequalities and manipulation under time pressure",
        band: 3,
        weeks: 10,
        price: 89,
        outcomes: ["Factoring", "Inequalities", "Quadratics"],
      },
      {
        id: "mock-crs-mth-2b",
        title: "Functions & Graphs Deep Dive",
        subtitle: "Linear through exponential, and how examiners ask about them",
        band: 4,
        weeks: 9,
        price: 95,
        outcomes: ["Linear", "Quadratic", "Exponential", "Domain & range"],
      },
    ],
  },
  {
    id: "mock-mth-3",
    name: "Dr. Priya Raghunathan",
    initial: "P",
    color: "#F4C430",
    headline: "Olympiad and university-entrance mathematics",
    subjects: ["Mathematics"],
    bands: [4, 5],
    learningStyles: ["auditory", "visual"],
    vibes: ["Methodical", "Creative"],
    goals: ["get_ahead", "master_skill", "ace_exam"],
    timeOfDay: ["night_owl", "weekend"],
    frequencies: ["intensive", "weekly"],
    hourlyRate: 65,
    rating: 5.0,
    reviews: 64,
    yearsExperience: 15,
    verified: true,
    freeDiscoveryCall: false,
    firstSessionFree: false,
    courses: [
      {
        id: "mock-crs-mth-3a",
        title: "Calculus Foundations",
        subtitle: "Limits, derivatives and integrals from first principles",
        band: 5,
        weeks: 12,
        price: 180,
        outcomes: ["Limits", "Derivatives", "Integrals", "Proof technique"],
      },
      {
        id: "mock-crs-mth-3b",
        title: "Pre-Calculus Bridge",
        subtitle: "Sequences, vectors and the run-up to calculus",
        band: 4,
        weeks: 8,
        price: 120,
        outcomes: ["Sequences", "Vectors", "Trigonometry"],
      },
    ],
  },

  // ── Sciences ──────────────────────────────────────────────────────────────
  {
    id: "mock-sci-1",
    name: "Tobias Feld",
    initial: "T",
    color: "#2D6A4F",
    headline: "Hands-on physics — we build it before we derive it",
    subjects: ["Sciences"],
    bands: [1, 3],
    learningStyles: ["kinesthetic", "visual"],
    vibes: ["Fun", "Patient"],
    goals: ["build_confidence", "homework", "master_skill"],
    timeOfDay: ["early_bird", "midday", "weekend"],
    frequencies: ["weekly", "flexible"],
    hourlyRate: 28,
    rating: 4.7,
    reviews: 74,
    yearsExperience: 6,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: true,
    courses: [
      {
        id: "mock-crs-sci-1a",
        title: "Scientific Method in Practice",
        subtitle: "Units, variables and designing an experiment that works",
        band: 1,
        weeks: 5,
        price: 0,
        outcomes: ["Units", "Variables", "Lab safety"],
      },
      {
        id: "mock-crs-sci-1b",
        title: "Forces & Motion",
        subtitle: "Newton's laws through experiments you can run at home",
        band: 3,
        weeks: 9,
        price: 70,
        outcomes: ["Forces", "Motion", "Energy", "Momentum"],
      },
    ],
  },
  {
    id: "mock-sci-2",
    name: "Ngozi Adeyemi",
    initial: "N",
    color: "#E85D26",
    headline: "Biology and chemistry for students who want the whole picture",
    subjects: ["Sciences"],
    bands: [2, 4],
    learningStyles: ["visual", "auditory"],
    vibes: ["Motivational", "Methodical"],
    goals: ["ace_exam", "master_skill", "get_ahead"],
    timeOfDay: ["midday", "night_owl"],
    frequencies: ["biweekly", "intensive"],
    hourlyRate: 42,
    rating: 4.9,
    reviews: 156,
    yearsExperience: 11,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: false,
    courses: [
      {
        id: "mock-crs-sci-2a",
        title: "Cells, DNA and Systems",
        subtitle: "Molecular biology that sticks",
        band: 3,
        weeks: 10,
        price: 85,
        outcomes: ["Cells", "DNA", "Genetics", "Systems"],
      },
      {
        id: "mock-crs-sci-2b",
        title: "Organic Chemistry Essentials",
        subtitle: "Functional groups, mechanisms and synthesis",
        band: 4,
        weeks: 11,
        price: 110,
        outcomes: ["Functional groups", "Mechanisms", "Synthesis"],
      },
    ],
  },
  {
    id: "mock-sci-3",
    name: "Dr. Elena Vasquez",
    initial: "E",
    color: "#F4C430",
    headline: "Research methods and advanced physics",
    subjects: ["Sciences"],
    bands: [4, 5],
    learningStyles: ["auditory", "visual"],
    vibes: ["Methodical", "Strict"],
    goals: ["get_ahead", "master_skill"],
    timeOfDay: ["early_bird", "midday"],
    frequencies: ["weekly", "intensive"],
    hourlyRate: 70,
    rating: 4.9,
    reviews: 48,
    yearsExperience: 18,
    verified: true,
    freeDiscoveryCall: false,
    firstSessionFree: false,
    courses: [
      {
        id: "mock-crs-sci-3a",
        title: "Thermodynamics & Quantum Intro",
        subtitle: "Entropy, uncertainty and where classical physics stops",
        band: 5,
        weeks: 12,
        price: 190,
        outcomes: ["Entropy", "Quantum basics", "Relativity"],
      },
      {
        id: "mock-crs-sci-3b",
        title: "Designing Real Experiments",
        subtitle: "From hypothesis to publishable data",
        band: 4,
        weeks: 7,
        price: 130,
        outcomes: ["Experiment design", "Data analysis", "Write-up"],
      },
    ],
  },

  // ── Languages ─────────────────────────────────────────────────────────────
  {
    id: "mock-lng-1",
    name: "Sofia Rossi",
    initial: "S",
    color: "#E85D26",
    headline: "Conversation-first — you speak from session one",
    subjects: ["Languages"],
    bands: [1, 3],
    learningStyles: ["auditory", "kinesthetic"],
    vibes: ["Fun", "Motivational"],
    goals: ["build_confidence", "master_skill", "get_ahead"],
    timeOfDay: ["early_bird", "midday", "weekend"],
    frequencies: ["weekly", "biweekly", "flexible"],
    hourlyRate: 25,
    rating: 4.9,
    reviews: 203,
    yearsExperience: 9,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: true,
    courses: [
      {
        id: "mock-crs-lng-1a",
        title: "Sound & Script",
        subtitle: "Pronunciation and alphabet without the embarrassment",
        band: 1,
        weeks: 4,
        price: 0,
        outcomes: ["Phonetics", "Alphabet", "Greetings"],
      },
      {
        id: "mock-crs-lng-1b",
        title: "Idiomatic Speech",
        subtitle: "Idioms, slang and knowing which register to use",
        band: 3,
        weeks: 8,
        price: 65,
        outcomes: ["Idioms", "Slang", "Register", "Small talk"],
      },
    ],
  },
  {
    id: "mock-lng-2",
    name: "Kenji Nakamura",
    initial: "K",
    color: "#2D6A4F",
    headline: "Grammar architecture — the rules behind the rules",
    subjects: ["Languages"],
    bands: [2, 4],
    learningStyles: ["visual", "auditory"],
    vibes: ["Methodical", "Patient"],
    goals: ["master_skill", "ace_exam", "get_ahead"],
    timeOfDay: ["midday", "night_owl"],
    frequencies: ["weekly", "biweekly", "intensive"],
    hourlyRate: 34,
    rating: 4.8,
    reviews: 118,
    yearsExperience: 10,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: false,
    courses: [
      {
        id: "mock-crs-lng-2a",
        title: "Grammar Backbone",
        subtitle: "Tenses, mood and clause structure made systematic",
        band: 3,
        weeks: 10,
        price: 78,
        outcomes: ["Tenses", "Mood", "Clauses", "Word order"],
      },
      {
        id: "mock-crs-lng-2b",
        title: "Native Media Immersion",
        subtitle: "News, film and podcasts at full speed",
        band: 4,
        weeks: 9,
        price: 92,
        outcomes: ["Listening", "News", "Film", "Podcasts"],
      },
    ],
  },
  {
    id: "mock-lng-3",
    name: "Camille Dubois",
    initial: "C",
    color: "#F4C430",
    headline: "Near-native fluency: nuance, debate and register",
    subjects: ["Languages", "Literature"],
    bands: [4, 5],
    learningStyles: ["auditory", "visual"],
    vibes: ["Creative", "Strict"],
    goals: ["master_skill", "get_ahead", "ace_exam"],
    timeOfDay: ["night_owl", "weekend", "midday"],
    frequencies: ["intensive", "weekly"],
    hourlyRate: 55,
    rating: 5.0,
    reviews: 71,
    yearsExperience: 14,
    verified: true,
    freeDiscoveryCall: false,
    firstSessionFree: false,
    courses: [
      {
        id: "mock-crs-lng-3a",
        title: "Writing Mastery",
        subtitle: "Essays, style and finding your voice in a second language",
        band: 4,
        weeks: 10,
        price: 140,
        outcomes: ["Essays", "Style", "Voice", "Editing"],
      },
      {
        id: "mock-crs-lng-3b",
        title: "Debate & Nuance",
        subtitle: "Argue, persuade and read subtext like a native",
        band: 5,
        weeks: 12,
        price: 165,
        outcomes: ["Debate", "Nuance", "Culture", "Rhetoric"],
      },
    ],
  },

  // ── Programming ───────────────────────────────────────────────────────────
  {
    id: "mock-prg-1",
    name: "Diego Ferreira",
    initial: "D",
    color: "#2D6A4F",
    headline: "First lines of code to first working app",
    subjects: ["Programming"],
    bands: [1, 3],
    learningStyles: ["kinesthetic", "visual"],
    vibes: ["Patient", "Fun"],
    goals: ["build_confidence", "master_skill", "homework"],
    timeOfDay: ["night_owl", "weekend", "midday"],
    frequencies: ["weekly", "flexible", "biweekly"],
    hourlyRate: 30,
    rating: 4.8,
    reviews: 142,
    yearsExperience: 7,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: true,
    courses: [
      {
        id: "mock-crs-prg-1a",
        title: "Syntax & Variables",
        subtitle: "Types, loops and functions with zero hand-waving",
        band: 1,
        weeks: 6,
        price: 0,
        outcomes: ["Types", "Loops", "Functions", "Debugging"],
      },
      {
        id: "mock-crs-prg-1b",
        title: "Data Structures in Practice",
        subtitle: "Arrays, maps and sets — and when each one wins",
        band: 3,
        weeks: 9,
        price: 75,
        outcomes: ["Arrays", "Maps", "Sets", "Big-O basics"],
      },
    ],
  },
  {
    id: "mock-prg-2",
    name: "Ana Kowalski",
    initial: "A",
    color: "#E85D26",
    headline: "Interview-grade algorithms and system design",
    subjects: ["Programming"],
    bands: [3, 5],
    learningStyles: ["visual", "auditory"],
    vibes: ["Methodical", "Strict"],
    goals: ["ace_exam", "get_ahead", "master_skill"],
    timeOfDay: ["early_bird", "night_owl"],
    frequencies: ["intensive", "biweekly"],
    hourlyRate: 58,
    rating: 4.9,
    reviews: 97,
    yearsExperience: 13,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: false,
    courses: [
      {
        id: "mock-crs-prg-2a",
        title: "Algorithms & Big-O",
        subtitle: "Search, sort and recursion until the patterns are obvious",
        band: 4,
        weeks: 10,
        price: 130,
        outcomes: ["Search", "Sort", "Recursion", "Complexity"],
      },
      {
        id: "mock-crs-prg-2b",
        title: "System Design Foundations",
        subtitle: "Scaling, caching and database choices under real constraints",
        band: 5,
        weeks: 12,
        price: 175,
        outcomes: ["Scaling", "Caching", "Databases", "Trade-offs"],
      },
    ],
  },
  {
    id: "mock-prg-3",
    name: "Yusuf Demir",
    initial: "Y",
    color: "#F4C430",
    headline: "Ship real projects — portfolio over theory",
    subjects: ["Programming"],
    bands: [2, 4],
    learningStyles: ["kinesthetic", "visual"],
    vibes: ["Creative", "Motivational"],
    goals: ["get_ahead", "master_skill", "build_confidence"],
    timeOfDay: ["weekend", "night_owl", "midday"],
    frequencies: ["weekly", "flexible"],
    hourlyRate: 40,
    rating: 4.7,
    reviews: 63,
    yearsExperience: 8,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: true,
    courses: [
      {
        id: "mock-crs-prg-3a",
        title: "Async, APIs & Error Handling",
        subtitle: "Promises, fetch and failing gracefully",
        band: 3,
        weeks: 7,
        price: 68,
        outcomes: ["Promises", "Fetch", "Errors", "Testing"],
      },
      {
        id: "mock-crs-prg-3b",
        title: "Build & Deploy a Real Project",
        subtitle: "Architecture, testing and getting it live",
        band: 4,
        weeks: 12,
        price: 115,
        outcomes: ["Architecture", "Testing", "Deploy", "CI/CD"],
      },
    ],
  },

  // ── Literature ────────────────────────────────────────────────────────────
  {
    id: "mock-lit-1",
    name: "Beatrice Okonjo",
    initial: "B",
    color: "#E85D26",
    headline: "Close reading for students who think they hate reading",
    subjects: ["Literature"],
    bands: [1, 3],
    learningStyles: ["auditory", "visual"],
    vibes: ["Patient", "Fun"],
    goals: ["build_confidence", "homework", "master_skill"],
    timeOfDay: ["early_bird", "midday", "weekend"],
    frequencies: ["weekly", "flexible", "biweekly"],
    hourlyRate: 24,
    rating: 4.8,
    reviews: 91,
    yearsExperience: 6,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: true,
    courses: [
      {
        id: "mock-crs-lit-1a",
        title: "Reading Closely",
        subtitle: "Annotation, tone and theme without the dread",
        band: 1,
        weeks: 5,
        price: 0,
        outcomes: ["Annotation", "Tone", "Theme"],
      },
      {
        id: "mock-crs-lit-1b",
        title: "Literary Devices Decoded",
        subtitle: "Metaphor, symbolism and irony you can actually spot",
        band: 3,
        weeks: 8,
        price: 58,
        outcomes: ["Metaphor", "Symbolism", "Irony", "Imagery"],
      },
    ],
  },
  {
    id: "mock-lit-2",
    name: "Henry Whitfield",
    initial: "H",
    color: "#2D6A4F",
    headline: "Essay structure that earns the top band",
    subjects: ["Literature"],
    bands: [2, 4],
    learningStyles: ["visual", "auditory"],
    vibes: ["Methodical", "Strict"],
    goals: ["ace_exam", "get_ahead", "master_skill"],
    timeOfDay: ["midday", "night_owl"],
    frequencies: ["biweekly", "intensive", "weekly"],
    hourlyRate: 36,
    rating: 4.9,
    reviews: 134,
    yearsExperience: 12,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: false,
    courses: [
      {
        id: "mock-crs-lit-2a",
        title: "Critical Essays",
        subtitle: "Thesis, evidence and structure that examiners reward",
        band: 3,
        weeks: 9,
        price: 80,
        outcomes: ["Thesis", "Evidence", "Structure", "Voice"],
      },
      {
        id: "mock-crs-lit-2b",
        title: "Comparative Analysis",
        subtitle: "Reading two texts against each other",
        band: 4,
        weeks: 10,
        price: 98,
        outcomes: ["Comparison", "Context", "Argument"],
      },
    ],
  },
  {
    id: "mock-lit-3",
    name: "Dr. Ilse Brandt",
    initial: "I",
    color: "#F4C430",
    headline: "Literary theory and scholarly writing",
    subjects: ["Literature"],
    bands: [4, 5],
    learningStyles: ["auditory", "visual"],
    vibes: ["Creative", "Methodical"],
    goals: ["master_skill", "get_ahead"],
    timeOfDay: ["night_owl", "weekend"],
    frequencies: ["weekly", "intensive"],
    hourlyRate: 62,
    rating: 5.0,
    reviews: 39,
    yearsExperience: 20,
    verified: true,
    freeDiscoveryCall: false,
    firstSessionFree: false,
    courses: [
      {
        id: "mock-crs-lit-3a",
        title: "Theory & Criticism",
        subtitle: "Structuralism through post-colonial, applied to real texts",
        band: 5,
        weeks: 12,
        price: 170,
        outcomes: ["Theory", "Critique", "Movements"],
      },
      {
        id: "mock-crs-lit-3b",
        title: "Scholarly Writing",
        subtitle: "Citation, research and defending an original reading",
        band: 4,
        weeks: 9,
        price: 125,
        outcomes: ["Research", "Citation", "Original argument"],
      },
    ],
  },

  // ── History ───────────────────────────────────────────────────────────────
  {
    id: "mock-his-1",
    name: "Rafael Moreno",
    initial: "R",
    color: "#2D6A4F",
    headline: "History as story — chronology that finally sticks",
    subjects: ["History"],
    bands: [1, 3],
    learningStyles: ["auditory", "visual"],
    vibes: ["Fun", "Motivational"],
    goals: ["build_confidence", "homework", "master_skill"],
    timeOfDay: ["early_bird", "midday", "weekend"],
    frequencies: ["weekly", "flexible", "biweekly"],
    hourlyRate: 26,
    rating: 4.7,
    reviews: 88,
    yearsExperience: 7,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: true,
    courses: [
      {
        id: "mock-crs-his-1a",
        title: "Timeline Mastery",
        subtitle: "Eras, dates and maps that stay in your head",
        band: 1,
        weeks: 5,
        price: 0,
        outcomes: ["Eras", "Chronology", "Maps"],
      },
      {
        id: "mock-crs-his-1b",
        title: "Empires & Revolutions",
        subtitle: "Trade, power and why things changed when they did",
        band: 3,
        weeks: 9,
        price: 62,
        outcomes: ["Empires", "Trade", "Revolutions"],
      },
    ],
  },
  {
    id: "mock-his-2",
    name: "Zofia Kaminski",
    initial: "Z",
    color: "#E85D26",
    headline: "Source analysis and 20th-century depth",
    subjects: ["History"],
    bands: [2, 4],
    learningStyles: ["visual", "kinesthetic"],
    vibes: ["Methodical", "Patient"],
    goals: ["ace_exam", "master_skill", "get_ahead"],
    timeOfDay: ["midday", "night_owl"],
    frequencies: ["biweekly", "weekly", "intensive"],
    hourlyRate: 35,
    rating: 4.8,
    reviews: 112,
    yearsExperience: 11,
    verified: true,
    freeDiscoveryCall: true,
    firstSessionFree: false,
    courses: [
      {
        id: "mock-crs-his-2a",
        title: "20th Century in Depth",
        subtitle: "Two wars, a cold one, and decolonisation",
        band: 3,
        weeks: 10,
        price: 76,
        outcomes: ["WWI", "WWII", "Cold War", "Decolonisation"],
      },
      {
        id: "mock-crs-his-2b",
        title: "Working with Primary Sources",
        subtitle: "Archives, bias and building an argument from evidence",
        band: 4,
        weeks: 8,
        price: 94,
        outcomes: ["Sources", "Bias", "Argument", "Archives"],
      },
    ],
  },
  {
    id: "mock-his-3",
    name: "Dr. Samuel Adeoye",
    initial: "S",
    color: "#F4C430",
    headline: "Historiography and original research",
    subjects: ["History"],
    bands: [4, 5],
    learningStyles: ["auditory", "visual"],
    vibes: ["Strict", "Methodical"],
    goals: ["master_skill", "get_ahead"],
    timeOfDay: ["early_bird", "midday"],
    frequencies: ["weekly", "intensive"],
    hourlyRate: 60,
    rating: 4.9,
    reviews: 42,
    yearsExperience: 17,
    verified: true,
    freeDiscoveryCall: false,
    firstSessionFree: false,
    courses: [
      {
        id: "mock-crs-his-3a",
        title: "Historiography",
        subtitle: "Schools, methods and reading historians against each other",
        band: 5,
        weeks: 11,
        price: 160,
        outcomes: ["Schools", "Methods", "Critique"],
      },
      {
        id: "mock-crs-his-3b",
        title: "Archival Research",
        subtitle: "Finding, reading and citing what nobody has used yet",
        band: 4,
        weeks: 9,
        price: 118,
        outcomes: ["Archives", "Interpretation", "Citation"],
      },
    ],
  },
];

// ─────────────────────────────────────────────
// Matching
// ─────────────────────────────────────────────

/** Answers as the tutor quiz stores them (localStorage + user_learning_profiles). */
export interface TutorQuizAnswers {
  subject?: string;
  multi_subject?: boolean;
  goal?: TutorQuizGoal;
  learning_style?: LearningStyle;
  pace?: number;
  time_of_day?: TimeOfDay;
  experience_level?: ExperienceLevel;
  frequency?: Frequency;
  budget_max?: number;
}

/** What the roadmap contributes to the intersection. */
export interface RoadmapContext {
  subject: Subject;
  /** The band the diagnostic placed the student in. */
  band: LevelBand;
  /** The band the stage they're on demands (band-shifted). */
  requiredBand: LevelBand;
}

export type CriterionKey =
  | "subject"
  | "level"
  | "learning_style"
  | "budget"
  | "time_of_day"
  | "frequency"
  | "goal";

export interface Criterion {
  key: CriterionKey;
  label: string;
  passed: boolean;
  /** True when the quiz never asked / the student skipped it. */
  skipped: boolean;
}

export interface MockTutorMatch {
  tutor: MockTutor;
  /** Courses of theirs within one band of what the stage requires. */
  courses: MockCourse[];
  /** The single best course — exact band if they have one. */
  bestCourse: MockCourse | null;
  criteria: Criterion[];
  /** 0..1, used only for ordering within the passing set. */
  score: number;
}

function bandCovers(tutor: MockTutor, band: LevelBand): boolean {
  return band >= tutor.bands[0] && band <= tutor.bands[1];
}

function bandFromExperience(level?: ExperienceLevel): LevelBand | null {
  if (level === "beginner") return 1;
  if (level === "intermediate") return 3;
  if (level === "advanced") return 5;
  return null;
}

/**
 * Applies every criterion the student actually answered. A question they
 * skipped can't disqualify anyone, but every question they *did* answer must
 * pass — this is the strict AND the brief calls for.
 */
export function evaluateTutor(
  tutor: MockTutor,
  answers: TutorQuizAnswers,
  ctx: RoadmapContext,
): Criterion[] {
  const quizSubject = canonicalSubjectFromTutorQuiz(answers.subject);
  const subjectOk =
    tutor.subjects.includes(ctx.subject) &&
    (answers.multi_subject || !quizSubject || tutor.subjects.includes(quizSubject));

  const experienceBand = bandFromExperience(answers.experience_level);
  const levelOk =
    bandCovers(tutor, ctx.requiredBand) &&
    (experienceBand === null || bandCovers(tutor, experienceBand));

  return [
    {
      key: "subject",
      label: "Subject",
      passed: subjectOk,
      skipped: false,
    },
    {
      key: "level",
      label: "Your level",
      passed: levelOk,
      skipped: false,
    },
    {
      key: "learning_style",
      label: "Learning style",
      passed: !answers.learning_style || tutor.learningStyles.includes(answers.learning_style),
      skipped: !answers.learning_style,
    },
    {
      key: "budget",
      label: "Budget",
      passed: answers.budget_max == null || tutor.hourlyRate <= answers.budget_max,
      skipped: answers.budget_max == null,
    },
    {
      key: "time_of_day",
      label: "Schedule",
      passed: !answers.time_of_day || tutor.timeOfDay.includes(answers.time_of_day),
      skipped: !answers.time_of_day,
    },
    {
      key: "frequency",
      label: "Frequency",
      passed: !answers.frequency || tutor.frequencies.includes(answers.frequency),
      skipped: !answers.frequency,
    },
    {
      key: "goal",
      label: "Goal",
      passed: !answers.goal || tutor.goals.includes(answers.goal),
      skipped: !answers.goal,
    },
  ];
}

/** Courses within one band of the requirement, exact matches first. */
function relevantCourses(tutor: MockTutor, requiredBand: LevelBand): MockCourse[] {
  return tutor.courses
    .filter((c) => Math.abs(c.band - requiredBand) <= 1)
    .sort((a, b) => Math.abs(a.band - requiredBand) - Math.abs(b.band - requiredBand));
}

/**
 * Tutors satisfying every answered criterion, ordered by how well they fit.
 * Tutors with a course at exactly the required band rank above those with only
 * a neighbouring one.
 */
export function matchMockTutors(
  answers: TutorQuizAnswers,
  ctx: RoadmapContext,
): MockTutorMatch[] {
  const out: MockTutorMatch[] = [];

  for (const tutor of MOCK_TUTORS) {
    const criteria = evaluateTutor(tutor, answers, ctx);
    if (!criteria.every((c) => c.passed)) continue;

    const courses = relevantCourses(tutor, ctx.requiredBand);
    if (courses.length === 0) continue; // nothing they teach fits this stage

    const exact = courses.find((c) => c.band === ctx.requiredBand) ?? null;
    const applied = criteria.filter((c) => !c.skipped).length;

    // Ordering only: exact-band course, then rating, then value for money.
    const score =
      (exact ? 0.45 : 0.2) +
      (tutor.rating / 5) * 0.3 +
      Math.min(1, tutor.reviews / 150) * 0.15 +
      (applied / criteria.length) * 0.1;

    out.push({ tutor, courses, bestCourse: exact ?? courses[0] ?? null, criteria, score });
  }

  return out.sort((a, b) => b.score - a.score);
}

/**
 * When nothing matches, this names the criteria doing the excluding so the
 * empty state can say something useful instead of just "no results".
 */
export function blockingCriteria(
  answers: TutorQuizAnswers,
  ctx: RoadmapContext,
): { label: string; blocked: number }[] {
  const counts = new Map<string, number>();

  for (const tutor of MOCK_TUTORS) {
    for (const c of evaluateTutor(tutor, answers, ctx)) {
      if (!c.passed) counts.set(c.label, (counts.get(c.label) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([label, blocked]) => ({ label, blocked }))
    .sort((a, b) => b.blocked - a.blocked);
}
