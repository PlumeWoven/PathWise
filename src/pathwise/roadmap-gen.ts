import { Subject, Level, GoalId } from "./data";
import { GOAL_LABELS } from "./store";

export interface GeneratedStage {
  stage_number: number;
  title: string;
  skills: string[];
  status: "active" | "locked";
}

/** Per-subject, per-level 5-stage templates. Final stage is replaced with the user's goal. */
const TEMPLATES: Record<Subject, Record<Level, Omit<GeneratedStage, "status">[]>> = {
  Mathematics: {
    Seedling: [
      { stage_number: 1, title: "Number Foundations", skills: ["Fractions", "Decimals", "Ratios"] },
      { stage_number: 2, title: "Basic Algebra", skills: ["Equations", "Variables", "Expressions"] },
      { stage_number: 3, title: "Geometry Basics", skills: ["Shapes", "Area", "Perimeter"] },
      { stage_number: 4, title: "Functions & Graphs", skills: ["Linear functions", "Plotting", "Slope"] },
      { stage_number: 5, title: "Advanced Math", skills: ["Quadratics", "Systems", "Polynomials"] },
    ],
    Spark: [
      { stage_number: 1, title: "Strengthen Arithmetic", skills: ["Fractions", "Percentages", "Ratios"] },
      { stage_number: 2, title: "Algebra Foundations", skills: ["Equations", "Inequalities", "Expressions"] },
      { stage_number: 3, title: "Geometry & Measurement", skills: ["Area", "Volume", "Angles"] },
      { stage_number: 4, title: "Functions & Graphs", skills: ["Linear", "Plotting", "Slope"] },
      { stage_number: 5, title: "Quadratics & Beyond", skills: ["Quadratics", "Systems", "Polynomials"] },
    ],
    Builder: [
      { stage_number: 1, title: "Plug the Gaps", skills: ["Fractions", "Ratios", "Percentages"] },
      { stage_number: 2, title: "Algebra Mastery", skills: ["Equations", "Inequalities", "Factoring"] },
      { stage_number: 3, title: "Geometry Essentials", skills: ["Shapes", "Area", "Angles"] },
      { stage_number: 4, title: "Functions & Graphs", skills: ["Linear", "Quadratic", "Slope"] },
      { stage_number: 5, title: "Advanced Algebra", skills: ["Quadratics", "Systems", "Polynomials"] },
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Sharpen Algebra", skills: ["Factoring", "Inequalities", "Manipulation"] },
      { stage_number: 2, title: "Functions Deep Dive", skills: ["Linear", "Quadratic", "Exponential"] },
      { stage_number: 3, title: "Trigonometry Basics", skills: ["Sin/Cos/Tan", "Identities", "Triangles"] },
      { stage_number: 4, title: "Pre-Calculus", skills: ["Sequences", "Limits intro", "Vectors"] },
      { stage_number: 5, title: "Advanced Topics", skills: ["Calculus intro", "Series", "Modeling"] },
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Foundations"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Algebra"] },
      { stage_number: 3, title: "Calculus Foundations", skills: ["Limits", "Derivatives", "Integrals"] },
      { stage_number: 4, title: "Advanced Calculus", skills: ["Series", "Multivariable", "Diff Eq"] },
      { stage_number: 5, title: "Specialized Topics", skills: ["Linear algebra", "Proofs", "Modeling"] },
    ],
  },
  Sciences: {
    Seedling: [
      { stage_number: 1, title: "Scientific Method", skills: ["Units", "Variables", "Method"] },
      { stage_number: 2, title: "Forces & Motion", skills: ["Forces", "Motion", "Energy"] },
      { stage_number: 3, title: "Cells & Life", skills: ["Cells", "DNA", "Systems"] },
      { stage_number: 4, title: "Chemistry Basics", skills: ["Atoms", "Bonds", "Reactions"] },
      { stage_number: 5, title: "Applied Sciences", skills: ["Modeling", "Lab work", "Analysis"] },
    ],
    Spark: [
      { stage_number: 1, title: "Lab Skills", skills: ["Units", "Method", "Measurement"] },
      { stage_number: 2, title: "Mechanics", skills: ["Forces", "Motion", "Energy"] },
      { stage_number: 3, title: "Cell Biology", skills: ["Cells", "Genetics", "Systems"] },
      { stage_number: 4, title: "Chemistry Basics", skills: ["Atoms", "Bonds", "Reactions"] },
      { stage_number: 5, title: "Applied Sciences", skills: ["Modeling", "Lab work", "Analysis"] },
    ],
    Builder: [
      { stage_number: 1, title: "Method & Units", skills: ["Method", "Units", "Variables"] },
      { stage_number: 2, title: "Mechanics & Energy", skills: ["Forces", "Motion", "Energy"] },
      { stage_number: 3, title: "Life Sciences", skills: ["Cells", "Ecology", "Genetics"] },
      { stage_number: 4, title: "Chemistry Core", skills: ["Atoms", "Reactions", "Stoichiometry"] },
      { stage_number: 5, title: "Applied Problem Solving", skills: ["Modeling", "Lab work", "Analysis"] },
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Advanced Mechanics", skills: ["Dynamics", "Energy", "Momentum"] },
      { stage_number: 2, title: "Waves & Fields", skills: ["Waves", "Optics", "Electromagnetism"] },
      { stage_number: 3, title: "Molecular Biology", skills: ["DNA", "Proteins", "Cells"] },
      { stage_number: 4, title: "Organic Chemistry", skills: ["Functional groups", "Mechanisms", "Synthesis"] },
      { stage_number: 5, title: "Integrated Sciences", skills: ["Modeling", "Lab", "Cross-disciplinary"] },
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Foundations"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Core sciences"] },
      { stage_number: 3, title: "Advanced Physics", skills: ["Quantum intro", "Relativity", "Thermo"] },
      { stage_number: 4, title: "Advanced Chemistry", skills: ["Organic", "Physical chem", "Spectroscopy"] },
      { stage_number: 5, title: "Research Methods", skills: ["Experiment design", "Data", "Publishing"] },
    ],
  },
  Literature: {
    Seedling: [
      { stage_number: 1, title: "Reading Closely", skills: ["Annotation", "Tone", "Theme"] },
      { stage_number: 2, title: "Literary Devices", skills: ["Metaphor", "Symbolism", "Imagery"] },
      { stage_number: 3, title: "Forms & Genres", skills: ["Poetry", "Prose", "Drama"] },
      { stage_number: 4, title: "Critical Essays", skills: ["Thesis", "Evidence", "Voice"] },
      { stage_number: 5, title: "Advanced Analysis", skills: ["Theory", "Comparative", "Context"] },
    ],
    Spark: [
      { stage_number: 1, title: "Active Reading", skills: ["Annotation", "Theme", "Tone"] },
      { stage_number: 2, title: "Literary Devices", skills: ["Metaphor", "Symbolism", "Imagery"] },
      { stage_number: 3, title: "Forms & Genres", skills: ["Poetry", "Prose", "Drama"] },
      { stage_number: 4, title: "Critical Essays", skills: ["Thesis", "Evidence", "Voice"] },
      { stage_number: 5, title: "Advanced Analysis", skills: ["Theory", "Comparative", "Context"] },
    ],
    Builder: [
      { stage_number: 1, title: "Close Reading", skills: ["Annotation", "Tone", "Theme"] },
      { stage_number: 2, title: "Devices & Voice", skills: ["Metaphor", "Irony", "Voice"] },
      { stage_number: 3, title: "Genre Mastery", skills: ["Poetry", "Prose", "Drama"] },
      { stage_number: 4, title: "Argument Essays", skills: ["Thesis", "Evidence", "Structure"] },
      { stage_number: 5, title: "Advanced Analysis", skills: ["Theory", "Comparative", "Context"] },
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Critical Reading", skills: ["Subtext", "Voice", "Form"] },
      { stage_number: 2, title: "Theory Foundations", skills: ["Structuralism", "Feminism", "Post-colonial"] },
      { stage_number: 3, title: "Comparative Studies", skills: ["Cross-cultural", "Periods", "Influence"] },
      { stage_number: 4, title: "Original Essays", skills: ["Argument", "Research", "Voice"] },
      { stage_number: 5, title: "Scholarly Writing", skills: ["Citation", "Publication", "Critique"] },
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Reading"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Devices"] },
      { stage_number: 3, title: "Theory & Criticism", skills: ["Theory", "Critique", "Movements"] },
      { stage_number: 4, title: "Comparative Mastery", skills: ["Cross-period", "Cross-culture", "Influence"] },
      { stage_number: 5, title: "Scholarly Output", skills: ["Research", "Publication", "Defense"] },
    ],
  },
  History: {
    Seedling: [
      { stage_number: 1, title: "Timeline Mastery", skills: ["Eras", "Dates", "Maps"] },
      { stage_number: 2, title: "Ancient Worlds", skills: ["Egypt", "Greece", "Rome"] },
      { stage_number: 3, title: "Medieval to Modern", skills: ["Empires", "Revolutions", "Trade"] },
      { stage_number: 4, title: "20th Century", skills: ["WWI", "WWII", "Cold War"] },
      { stage_number: 5, title: "Historical Thinking", skills: ["Sources", "Bias", "Argument"] },
    ],
    Spark: [
      { stage_number: 1, title: "Chronology", skills: ["Eras", "Dates", "Maps"] },
      { stage_number: 2, title: "Ancient Worlds", skills: ["Egypt", "Greece", "Rome"] },
      { stage_number: 3, title: "Medieval to Modern", skills: ["Empires", "Trade", "Revolutions"] },
      { stage_number: 4, title: "Modern Era", skills: ["WWI", "WWII", "Cold War"] },
      { stage_number: 5, title: "Source Analysis", skills: ["Sources", "Bias", "Argument"] },
    ],
    Builder: [
      { stage_number: 1, title: "Timelines", skills: ["Eras", "Dates", "Maps"] },
      { stage_number: 2, title: "Ancient Civilizations", skills: ["Egypt", "Greece", "Rome"] },
      { stage_number: 3, title: "Empires & Revolutions", skills: ["Empires", "Trade", "Revolutions"] },
      { stage_number: 4, title: "20th Century", skills: ["WWI", "WWII", "Cold War"] },
      { stage_number: 5, title: "Historical Argument", skills: ["Sources", "Bias", "Argument"] },
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Historiography", skills: ["Schools", "Methods", "Bias"] },
      { stage_number: 2, title: "Comparative History", skills: ["Cross-region", "Cross-period", "Themes"] },
      { stage_number: 3, title: "Primary Sources", skills: ["Archives", "Interpretation", "Critique"] },
      { stage_number: 4, title: "20th Century Deep Dive", skills: ["WWI/II", "Cold War", "Decolonization"] },
      { stage_number: 5, title: "Original Research", skills: ["Question", "Sources", "Argument"] },
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Chronology"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Ancient/Modern"] },
      { stage_number: 3, title: "Historiography", skills: ["Schools", "Methods", "Critique"] },
      { stage_number: 4, title: "Archival Research", skills: ["Primary sources", "Interpretation", "Argument"] },
      { stage_number: 5, title: "Scholarly Output", skills: ["Research", "Writing", "Publication"] },
    ],
  },
  Programming: {
    Seedling: [
      { stage_number: 1, title: "Syntax & Variables", skills: ["Types", "Loops", "Functions"] },
      { stage_number: 2, title: "Data Structures", skills: ["Arrays", "Objects", "Maps"] },
      { stage_number: 3, title: "Algorithms", skills: ["Search", "Sort", "Big-O"] },
      { stage_number: 4, title: "Async & APIs", skills: ["Promises", "Fetch", "Errors"] },
      { stage_number: 5, title: "Build a Project", skills: ["Architecture", "Testing", "Deploy"] },
    ],
    Spark: [
      { stage_number: 1, title: "Core Syntax", skills: ["Types", "Loops", "Functions"] },
      { stage_number: 2, title: "Data Structures", skills: ["Arrays", "Objects", "Maps"] },
      { stage_number: 3, title: "Algorithms", skills: ["Search", "Sort", "Big-O"] },
      { stage_number: 4, title: "Async & APIs", skills: ["Promises", "Fetch", "Errors"] },
      { stage_number: 5, title: "Ship a Project", skills: ["Architecture", "Testing", "Deploy"] },
    ],
    Builder: [
      { stage_number: 1, title: "Refine Syntax", skills: ["Types", "Functions", "Modules"] },
      { stage_number: 2, title: "Data Structures", skills: ["Arrays", "Maps", "Sets"] },
      { stage_number: 3, title: "Algorithms & Big-O", skills: ["Search", "Sort", "Recursion"] },
      { stage_number: 4, title: "Async & APIs", skills: ["Promises", "Fetch", "Errors"] },
      { stage_number: 5, title: "Production Project", skills: ["Architecture", "Testing", "Deploy"] },
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Advanced Patterns", skills: ["Generics", "Closures", "Patterns"] },
      { stage_number: 2, title: "System Design", skills: ["Scaling", "Caching", "DBs"] },
      { stage_number: 3, title: "Testing & CI/CD", skills: ["Unit", "Integration", "Pipelines"] },
      { stage_number: 4, title: "Performance", skills: ["Profiling", "Memory", "Optimization"] },
      { stage_number: 5, title: "Open Source / Job", skills: ["Portfolio", "Interviews", "Shipping"] },
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Syntax"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Data structures"] },
      { stage_number: 3, title: "System Design", skills: ["Scaling", "Distributed", "Patterns"] },
      { stage_number: 4, title: "Specialization", skills: ["ML/Infra/Web", "Deep dive", "Mastery"] },
      { stage_number: 5, title: "Lead & Ship", skills: ["Architecture", "Mentorship", "Delivery"] },
    ],
  },
  Languages: {
    Seedling: [
      { stage_number: 1, title: "Sound & Script", skills: ["Phonetics", "Alphabet", "Greetings"] },
      { stage_number: 2, title: "Core Vocabulary", skills: ["Nouns", "Verbs", "Numbers"] },
      { stage_number: 3, title: "Grammar Backbone", skills: ["Present", "Past", "Future"] },
      { stage_number: 4, title: "Conversations", skills: ["Listening", "Speaking", "Idioms"] },
      { stage_number: 5, title: "Fluent Use", skills: ["Reading", "Writing", "Culture"] },
    ],
    Spark: [
      { stage_number: 1, title: "Pronunciation", skills: ["Phonetics", "Alphabet", "Greetings"] },
      { stage_number: 2, title: "Vocabulary Building", skills: ["Nouns", "Verbs", "Numbers"] },
      { stage_number: 3, title: "Grammar Basics", skills: ["Present", "Past", "Future"] },
      { stage_number: 4, title: "Conversations", skills: ["Listening", "Speaking", "Idioms"] },
      { stage_number: 5, title: "Real-world Use", skills: ["Reading", "Writing", "Culture"] },
    ],
    Builder: [
      { stage_number: 1, title: "Refine Pronunciation", skills: ["Phonetics", "Stress", "Rhythm"] },
      { stage_number: 2, title: "Expand Vocabulary", skills: ["Themes", "Idioms", "Collocations"] },
      { stage_number: 3, title: "Grammar Mastery", skills: ["Tenses", "Mood", "Clauses"] },
      { stage_number: 4, title: "Real Conversations", skills: ["Listening", "Speaking", "Slang"] },
      { stage_number: 5, title: "Comfortable Fluency", skills: ["Reading", "Writing", "Culture"] },
    ],
    Sharpshooter: [
      { stage_number: 1, title: "Advanced Grammar", skills: ["Subjunctive", "Conditional", "Style"] },
      { stage_number: 2, title: "Idiomatic Speech", skills: ["Idioms", "Slang", "Register"] },
      { stage_number: 3, title: "Native Media", skills: ["News", "Film", "Podcasts"] },
      { stage_number: 4, title: "Writing Mastery", skills: ["Essays", "Style", "Voice"] },
      { stage_number: 5, title: "Near-Native Use", skills: ["Debate", "Nuance", "Culture"] },
    ],
    Mastermind: [
      { stage_number: 1, title: "Skipped — Mastered", skills: ["Foundations"] },
      { stage_number: 2, title: "Skipped — Mastered", skills: ["Grammar"] },
      { stage_number: 3, title: "Cultural Fluency", skills: ["Idioms", "Humor", "Subtext"] },
      { stage_number: 4, title: "Specialized Domains", skills: ["Business", "Academic", "Literary"] },
      { stage_number: 5, title: "Native Mastery", skills: ["Voice", "Debate", "Writing"] },
    ],
  },
};

export function generateStages(subject: Subject, level: Level, goal: GoalId | null): GeneratedStage[] {
  const tpl = TEMPLATES[subject][level];
  const goalLabel = goal ? GOAL_LABELS[goal] : null;
  return tpl.map((s, i) => ({
    ...s,
    // Replace last stage title with the user's goal when provided.
    title: i === tpl.length - 1 && goalLabel ? goalLabel : s.title,
    status: i === 0 ? "active" : "locked",
  }));
}