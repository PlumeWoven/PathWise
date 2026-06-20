import { r as reactExports } from "../_libs/react.mjs";
const SUBJECTS = [
  { id: "Mathematics", emoji: "📐", label: "Mathematics" },
  { id: "Sciences", emoji: "🧪", label: "Sciences" },
  { id: "Literature", emoji: "📖", label: "Literature" },
  { id: "History", emoji: "🌍", label: "History" },
  { id: "Programming", emoji: "💻", label: "Programming" },
  { id: "Languages", emoji: "🗣️", label: "Languages" }
];
const GOALS = [
  { id: "exam", emoji: "🎓", label: "Pass an exam" },
  { id: "grades", emoji: "📈", label: "Improve my grades" },
  { id: "gaps", emoji: "⚡", label: "Fill in gaps" },
  { id: "advanced", emoji: "🚀", label: "Go to advanced level" },
  { id: "work", emoji: "💼", label: "Learn for work" }
];
const QUIZZES = {
  Mathematics: [
    { id: "m1", topic: "Foundations", question: "What is 15% of 200?", options: ["25", "30", "35", "40"], correctIndex: 1 },
    { id: "m2", topic: "Algebra", question: "Solve for x: 3x + 7 = 22", options: ["x = 4", "x = 5", "x = 6", "x = 7"], correctIndex: 1 },
    { id: "m3", topic: "Geometry", question: "Area of a circle with radius 5? (π ≈ 3.14)", options: ["15.7", "31.4", "78.5", "157"], correctIndex: 2 },
    { id: "m4", topic: "Functions", question: "If f(x) = 2x² − 3, what is f(3)?", options: ["9", "15", "18", "21"], correctIndex: 1 },
    { id: "m5", topic: "Reasoning", question: "A train travels 240km in 3h. How long to travel 400km at the same speed?", options: ["4h", "4h 30m", "5h", "5h 20m"], correctIndex: 2 },
    { id: "m6", topic: "Foundations", question: "Simplify the fraction 18/24.", options: ["2/3", "3/4", "4/5", "5/6"], correctIndex: 1 },
    { id: "m7", topic: "Foundations", question: "What is −7 − (−12)?", options: ["−19", "−5", "5", "19"], correctIndex: 2 },
    { id: "m8", topic: "Algebra", question: "Factor: x² − 9.", options: ["(x−3)(x−3)", "(x+3)(x+3)", "(x−3)(x+3)", "x(x−9)"], correctIndex: 2 },
    { id: "m9", topic: "Algebra", question: "If 2(x − 4) = 10, then x =", options: ["3", "7", "9", "12"], correctIndex: 2 },
    { id: "m10", topic: "Geometry", question: "Interior angles of a triangle sum to:", options: ["90°", "180°", "270°", "360°"], correctIndex: 1 },
    { id: "m11", topic: "Geometry", question: "Volume of a cube with side 4?", options: ["16", "32", "48", "64"], correctIndex: 3 },
    { id: "m12", topic: "Geometry", question: "Hypotenuse of a right triangle with legs 6 and 8?", options: ["10", "12", "14", "100"], correctIndex: 0 },
    { id: "m13", topic: "Functions", question: "Slope of the line through (1,2) and (4,11)?", options: ["1", "2", "3", "9"], correctIndex: 2 },
    { id: "m14", topic: "Functions", question: "Roots of x² − 5x + 6 = 0?", options: ["1 and 6", "2 and 3", "−2 and −3", "0 and 5"], correctIndex: 1 },
    { id: "m15", topic: "Functions", question: "Domain of f(x) = 1/(x − 2)?", options: ["x ≠ 0", "x ≠ 2", "x > 2", "all reals"], correctIndex: 1 },
    { id: "m16", topic: "Reasoning", question: "Average of 12, 18, 24 and 30?", options: ["18", "20", "21", "24"], correctIndex: 2 },
    { id: "m17", topic: "Reasoning", question: "A jacket costs €80 after a 20% discount. Original price?", options: ["€96", "€100", "€110", "€120"], correctIndex: 1 },
    { id: "m18", topic: "Reasoning", question: "Probability of rolling a sum of 7 with two dice?", options: ["1/12", "1/9", "1/6", "1/4"], correctIndex: 2 },
    { id: "m19", topic: "Algebra", question: "Solve: 5x − 3 ≥ 2x + 9.", options: ["x ≥ 2", "x ≥ 3", "x ≥ 4", "x ≥ 6"], correctIndex: 2 },
    { id: "m20", topic: "Functions", question: "log₂(32) equals:", options: ["3", "4", "5", "6"], correctIndex: 2 }
  ],
  Sciences: [
    { id: "s1", topic: "Foundations", question: "Chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correctIndex: 2 },
    { id: "s2", topic: "Physics", question: "SI unit of force?", options: ["Joule", "Newton", "Watt", "Pascal"], correctIndex: 1 },
    { id: "s3", topic: "Biology", question: "Which organelle is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correctIndex: 2 },
    { id: "s4", topic: "Chemistry", question: "pH of a neutral solution at 25°C is:", options: ["0", "7", "10", "14"], correctIndex: 1 },
    { id: "s5", topic: "Reasoning", question: "Object falls freely. After 2s its speed (g≈10 m/s²) is roughly:", options: ["5 m/s", "10 m/s", "20 m/s", "40 m/s"], correctIndex: 2 },
    { id: "s6", topic: "Foundations", question: "Closest planet to the Sun?", options: ["Venus", "Mercury", "Earth", "Mars"], correctIndex: 1 },
    { id: "s7", topic: "Physics", question: "Speed of light in vacuum is approximately:", options: ["3×10⁵ m/s", "3×10⁶ m/s", "3×10⁷ m/s", "3×10⁸ m/s"], correctIndex: 3 },
    { id: "s8", topic: "Physics", question: "Which is a vector quantity?", options: ["Mass", "Temperature", "Velocity", "Energy"], correctIndex: 2 },
    { id: "s9", topic: "Physics", question: "Newton's third law concerns:", options: ["Inertia", "F=ma", "Action–reaction", "Gravity"], correctIndex: 2 },
    { id: "s10", topic: "Biology", question: "DNA base that pairs with adenine is:", options: ["Cytosine", "Guanine", "Thymine", "Uracil"], correctIndex: 2 },
    { id: "s11", topic: "Biology", question: "Photosynthesis primarily occurs in the:", options: ["Mitochondria", "Chloroplast", "Nucleus", "Vacuole"], correctIndex: 1 },
    { id: "s12", topic: "Biology", question: "Largest organ of the human body?", options: ["Liver", "Brain", "Skin", "Lungs"], correctIndex: 2 },
    { id: "s13", topic: "Chemistry", question: "How many protons does carbon have?", options: ["4", "6", "8", "12"], correctIndex: 1 },
    { id: "s14", topic: "Chemistry", question: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Hydrogen", "Nitrogen", "Carbon dioxide"], correctIndex: 2 },
    { id: "s15", topic: "Chemistry", question: "NaCl is the formula for:", options: ["Sodium nitrate", "Table salt", "Baking soda", "Bleach"], correctIndex: 1 },
    { id: "s16", topic: "Reasoning", question: "A 10 N force on a 2 kg mass produces an acceleration of:", options: ["2 m/s²", "5 m/s²", "10 m/s²", "20 m/s²"], correctIndex: 1 },
    { id: "s17", topic: "Reasoning", question: "Half-life of an isotope is 5 years. After 15 years, fraction remaining?", options: ["1/2", "1/4", "1/8", "1/16"], correctIndex: 2 },
    { id: "s18", topic: "Foundations", question: "Boiling point of water at sea level (°C)?", options: ["90", "100", "110", "120"], correctIndex: 1 },
    { id: "s19", topic: "Biology", question: "Which blood cells fight infection?", options: ["Red", "White", "Platelets", "Plasma"], correctIndex: 1 },
    { id: "s20", topic: "Physics", question: "Unit of electrical resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], correctIndex: 2 }
  ],
  Literature: [
    { id: "l1", topic: "Foundations", question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Austen", "Wilde"], correctIndex: 1 },
    { id: "l2", topic: "Devices", question: "“Her smile was sunshine.” This is a:", options: ["Metaphor", "Simile", "Hyperbole", "Alliteration"], correctIndex: 0 },
    { id: "l3", topic: "Genre", question: "A 14-line poem with a strict rhyme scheme is a:", options: ["Haiku", "Ode", "Sonnet", "Limerick"], correctIndex: 2 },
    { id: "l4", topic: "Analysis", question: "Point of view 'I walked home' is:", options: ["First person", "Second person", "Third limited", "Omniscient"], correctIndex: 0 },
    { id: "l5", topic: "Reasoning", question: "The protagonist of '1984' is:", options: ["Winston Smith", "Big Brother", "O'Brien", "Julia"], correctIndex: 0 },
    { id: "l6", topic: "Foundations", question: "Who wrote 'Pride and Prejudice'?", options: ["Brontë", "Austen", "Eliot", "Woolf"], correctIndex: 1 },
    { id: "l7", topic: "Foundations", question: "'The Odyssey' is attributed to:", options: ["Virgil", "Homer", "Sophocles", "Plato"], correctIndex: 1 },
    { id: "l8", topic: "Devices", question: "'Peter Piper picked' is an example of:", options: ["Onomatopoeia", "Alliteration", "Assonance", "Personification"], correctIndex: 1 },
    { id: "l9", topic: "Devices", question: "'The wind whispered' uses:", options: ["Simile", "Metaphor", "Personification", "Irony"], correctIndex: 2 },
    { id: "l10", topic: "Devices", question: "Saying 'It's just a scratch' about a deep wound is:", options: ["Hyperbole", "Verbal irony", "Symbolism", "Allegory"], correctIndex: 1 },
    { id: "l11", topic: "Genre", question: "A 17-syllable Japanese poem in 5-7-5 is a:", options: ["Haiku", "Tanka", "Sonnet", "Villanelle"], correctIndex: 0 },
    { id: "l12", topic: "Genre", question: "A story passed down orally that explains nature is a:", options: ["Memoir", "Myth", "Novella", "Satire"], correctIndex: 1 },
    { id: "l13", topic: "Analysis", question: "The struggle a character faces is called:", options: ["Setting", "Theme", "Conflict", "Tone"], correctIndex: 2 },
    { id: "l14", topic: "Analysis", question: "The atmosphere a text creates in the reader is its:", options: ["Mood", "Plot", "Voice", "Diction"], correctIndex: 0 },
    { id: "l15", topic: "Analysis", question: "An object that stands for an idea is a:", options: ["Motif", "Symbol", "Foil", "Trope"], correctIndex: 1 },
    { id: "l16", topic: "Reasoning", question: "'Beloved' was written by:", options: ["Toni Morrison", "Maya Angelou", "Alice Walker", "Zora Neale Hurston"], correctIndex: 0 },
    { id: "l17", topic: "Reasoning", question: "'Crime and Punishment' was written by:", options: ["Tolstoy", "Chekhov", "Dostoevsky", "Pushkin"], correctIndex: 2 },
    { id: "l18", topic: "Foundations", question: "'To Kill a Mockingbird' is set in the:", options: ["1860s", "1930s", "1960s", "1980s"], correctIndex: 1 },
    { id: "l19", topic: "Genre", question: "A play with a sad, often fatal ending is a:", options: ["Comedy", "Tragedy", "Farce", "Pastoral"], correctIndex: 1 },
    { id: "l20", topic: "Devices", question: "A reference to another work or event is a/an:", options: ["Allusion", "Illusion", "Analogy", "Anecdote"], correctIndex: 0 }
  ],
  History: [
    { id: "h1", topic: "Foundations", question: "The Berlin Wall fell in:", options: ["1987", "1989", "1991", "1993"], correctIndex: 1 },
    { id: "h2", topic: "Ancient", question: "The Roman Republic became an Empire under:", options: ["Caesar", "Augustus", "Nero", "Trajan"], correctIndex: 1 },
    { id: "h3", topic: "Modern", question: "WWI began in which year?", options: ["1912", "1914", "1916", "1918"], correctIndex: 1 },
    { id: "h4", topic: "Geography", question: "Magna Carta was signed in:", options: ["France", "England", "Spain", "Italy"], correctIndex: 1 },
    { id: "h5", topic: "Reasoning", question: "Which came first chronologically?", options: ["French Revolution", "American Revolution", "Industrial Revolution", "Russian Revolution"], correctIndex: 1 },
    { id: "h6", topic: "Ancient", question: "The pyramids of Giza were built by the:", options: ["Sumerians", "Egyptians", "Babylonians", "Persians"], correctIndex: 1 },
    { id: "h7", topic: "Ancient", question: "Democracy is widely credited as originating in:", options: ["Rome", "Sparta", "Athens", "Babylon"], correctIndex: 2 },
    { id: "h8", topic: "Ancient", question: "Hannibal famously crossed the Alps fighting:", options: ["Greece", "Rome", "Egypt", "Carthage"], correctIndex: 1 },
    { id: "h9", topic: "Modern", question: "WWII ended in:", options: ["1943", "1944", "1945", "1946"], correctIndex: 2 },
    { id: "h10", topic: "Modern", question: "The Cold War was primarily between the US and:", options: ["China", "USSR", "Germany", "UK"], correctIndex: 1 },
    { id: "h11", topic: "Modern", question: "First person on the Moon (1969):", options: ["Yuri Gagarin", "Buzz Aldrin", "Neil Armstrong", "John Glenn"], correctIndex: 2 },
    { id: "h12", topic: "Foundations", question: "The Renaissance began in:", options: ["France", "England", "Italy", "Germany"], correctIndex: 2 },
    { id: "h13", topic: "Foundations", question: "Christopher Columbus reached the Americas in:", options: ["1392", "1492", "1592", "1692"], correctIndex: 1 },
    { id: "h14", topic: "Geography", question: "The Silk Road connected China to:", options: ["Australia", "South America", "Europe", "Antarctica"], correctIndex: 2 },
    { id: "h15", topic: "Geography", question: "The Ottoman Empire was centered in modern-day:", options: ["Iran", "Turkey", "Egypt", "Greece"], correctIndex: 1 },
    { id: "h16", topic: "Modern", question: "Apartheid was the system of racial segregation in:", options: ["Rwanda", "Nigeria", "South Africa", "Kenya"], correctIndex: 2 },
    { id: "h17", topic: "Reasoning", question: "Which event most directly triggered WWI?", options: ["Sinking of Lusitania", "Assassination of Franz Ferdinand", "Treaty of Versailles", "Russian Revolution"], correctIndex: 1 },
    { id: "h18", topic: "Reasoning", question: "Which empire was vastest in the early 20th century?", options: ["Russian", "Ottoman", "British", "French"], correctIndex: 2 },
    { id: "h19", topic: "Ancient", question: "Cuneiform writing was developed by the:", options: ["Egyptians", "Sumerians", "Phoenicians", "Mayans"], correctIndex: 1 },
    { id: "h20", topic: "Foundations", question: "The French Revolution began in:", options: ["1689", "1776", "1789", "1815"], correctIndex: 2 }
  ],
  Programming: [
    { id: "p1", topic: "Foundations", question: "Which is NOT a primitive type in JavaScript?", options: ["string", "number", "array", "boolean"], correctIndex: 2 },
    { id: "p2", topic: "Logic", question: "What does '===' check in JS?", options: ["Value only", "Type only", "Value and type", "Reference"], correctIndex: 2 },
    { id: "p3", topic: "Data", question: "Big-O of binary search on a sorted array:", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctIndex: 1 },
    { id: "p4", topic: "Functions", question: "A pure function must:", options: ["Use globals", "Have no side effects", "Mutate inputs", "Be async"], correctIndex: 1 },
    { id: "p5", topic: "Reasoning", question: "Which fixes a race condition best?", options: ["Random delay", "Locks/mutex", "Console logs", "More threads"], correctIndex: 1 },
    { id: "p6", topic: "Foundations", question: "Which keyword declares a block-scoped variable in JS?", options: ["var", "let", "function", "global"], correctIndex: 1 },
    { id: "p7", topic: "Foundations", question: "HTML stands for:", options: ["Hyper Trainer Marking Language", "HyperText Markup Language", "Hyperlinks Text Mark Lang", "Home Tool Markup Lang"], correctIndex: 1 },
    { id: "p8", topic: "Logic", question: "What does 'NaN === NaN' return in JS?", options: ["true", "false", "NaN", "TypeError"], correctIndex: 1 },
    { id: "p9", topic: "Logic", question: "Output of: typeof null", options: ["'null'", "'object'", "'undefined'", "'number'"], correctIndex: 1 },
    { id: "p10", topic: "Data", question: "Which structure is LIFO?", options: ["Queue", "Stack", "Heap", "Tree"], correctIndex: 1 },
    { id: "p11", topic: "Data", question: "Average lookup time of a hash map is:", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctIndex: 0 },
    { id: "p12", topic: "Data", question: "Which is NOT a SQL command?", options: ["SELECT", "MERGE", "FETCH", "PARSE"], correctIndex: 3 },
    { id: "p13", topic: "Functions", question: "A higher-order function is one that:", options: ["Always returns null", "Takes/returns functions", "Runs first", "Is recursive"], correctIndex: 1 },
    { id: "p14", topic: "Functions", question: "Recursion requires:", options: ["A loop", "A base case", "A class", "Async/await"], correctIndex: 1 },
    { id: "p15", topic: "Reasoning", question: "Best Big-O for sorting n comparable items in general?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correctIndex: 1 },
    { id: "p16", topic: "Reasoning", question: "REST APIs typically use which protocol?", options: ["FTP", "HTTP", "SMTP", "SSH"], correctIndex: 1 },
    { id: "p17", topic: "Logic", question: "In Python, '3' + '4' equals:", options: ["7", "'34'", "Error", "'7'"], correctIndex: 1 },
    { id: "p18", topic: "Foundations", question: "Git command to record changes locally:", options: ["git push", "git commit", "git pull", "git clone"], correctIndex: 1 },
    { id: "p19", topic: "Data", question: "JSON stands for:", options: ["Java Standard Object Notation", "JavaScript Object Notation", "Joined String Object Net", "JS Online Network"], correctIndex: 1 },
    { id: "p20", topic: "Functions", question: "A closure remembers:", options: ["Only globals", "Its outer scope", "Nothing", "The DOM"], correctIndex: 1 }
  ],
  Languages: [
    { id: "lg1", topic: "Foundations", question: "'Bonjour' (French) means:", options: ["Goodbye", "Hello", "Please", "Thanks"], correctIndex: 1 },
    { id: "lg2", topic: "Grammar", question: "In Spanish, 'I eat' is:", options: ["Yo como", "Yo comer", "Yo comiendo", "Yo comí"], correctIndex: 0 },
    { id: "lg3", topic: "Vocabulary", question: "German 'Buch' means:", options: ["Book", "Bag", "Boy", "Bread"], correctIndex: 0 },
    { id: "lg4", topic: "Phonetics", question: "Italian 'gn' as in 'gnocchi' sounds like:", options: ["g + n", "ny", "j", "silent"], correctIndex: 1 },
    { id: "lg5", topic: "Reasoning", question: "Which language has no grammatical gender?", options: ["French", "Spanish", "English", "German"], correctIndex: 2 },
    { id: "lg6", topic: "Foundations", question: "'Gracias' (Spanish) means:", options: ["Sorry", "Please", "Hello", "Thank you"], correctIndex: 3 },
    { id: "lg7", topic: "Foundations", question: "'Ciao' (Italian) is used for:", options: ["Only hello", "Only goodbye", "Hello and goodbye", "Sorry"], correctIndex: 2 },
    { id: "lg8", topic: "Vocabulary", question: "Japanese 'inu' (犬) means:", options: ["Cat", "Dog", "Bird", "Fish"], correctIndex: 1 },
    { id: "lg9", topic: "Vocabulary", question: "French 'pomme' means:", options: ["Pear", "Apple", "Plum", "Peach"], correctIndex: 1 },
    { id: "lg10", topic: "Vocabulary", question: "Spanish 'rojo' means:", options: ["Blue", "Green", "Red", "Yellow"], correctIndex: 2 },
    { id: "lg11", topic: "Grammar", question: "French 'le livre' is what gender?", options: ["Masculine", "Feminine", "Neuter", "Plural"], correctIndex: 0 },
    { id: "lg12", topic: "Grammar", question: "In German, the formal 'you' is:", options: ["du", "ihr", "Sie", "es"], correctIndex: 2 },
    { id: "lg13", topic: "Grammar", question: "Spanish past tense of 'hablar' (yo form, preterite):", options: ["hablo", "hablé", "hablaba", "hablaré"], correctIndex: 1 },
    { id: "lg14", topic: "Phonetics", question: "Spanish 'ñ' sounds closest to:", options: ["n", "ny", "ng", "silent"], correctIndex: 1 },
    { id: "lg15", topic: "Phonetics", question: "Mandarin is a ___ language.", options: ["Tonal", "Agglutinative", "Click-based", "Polysynthetic"], correctIndex: 0 },
    { id: "lg16", topic: "Reasoning", question: "Which language uses the Cyrillic alphabet?", options: ["Polish", "Russian", "Hungarian", "Romanian"], correctIndex: 1 },
    { id: "lg17", topic: "Reasoning", question: "Most spoken native language worldwide:", options: ["English", "Spanish", "Hindi", "Mandarin Chinese"], correctIndex: 3 },
    { id: "lg18", topic: "Foundations", question: "'Danke' (German) means:", options: ["Hello", "Goodbye", "Thanks", "Sorry"], correctIndex: 2 },
    { id: "lg19", topic: "Vocabulary", question: "Italian 'sette' is the number:", options: ["5", "6", "7", "8"], correctIndex: 2 },
    { id: "lg20", topic: "Grammar", question: "In English, an adverb most often modifies a:", options: ["Noun", "Verb", "Pronoun", "Conjunction"], correctIndex: 1 }
  ]
};
function pickQuizQuestions(subject, n = 5) {
  const pool = QUIZZES[subject] ?? [];
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}
function levelFromScore(score) {
  if (score <= 1) return "Seedling";
  if (score === 2) return "Spark";
  if (score === 3) return "Builder";
  if (score === 4) return "Sharpshooter";
  return "Mastermind";
}
const LEVEL_META = {
  Seedling: { emoji: "🌱", blurb: "You're just starting out — we'll build strong foundations." },
  Spark: { emoji: "⚡", blurb: "Basic foundations are there — let's strengthen and extend them." },
  Builder: { emoji: "🔥", blurb: "Solid foundation, with a few gaps to plug before advancing." },
  Sharpshooter: { emoji: "🎯", blurb: "Strong skills — you're ready for advanced material." },
  Mastermind: { emoji: "🏆", blurb: "Exceptional. We'll skip the basics and head straight to advanced." }
};
const initial = {
  subject: null,
  goal: null,
  answers: [],
  totalXP: 0,
  streak: 0,
  level: null
};
let state = { ...initial };
const listeners = /* @__PURE__ */ new Set();
function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
function resetState() {
  state = { ...initial, answers: [] };
  listeners.forEach((l) => l());
}
function usePW() {
  return reactExports.useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state
  );
}
const GOAL_LABELS = {
  exam: "Pass an exam",
  grades: "Improve my grades",
  gaps: "Fill in gaps",
  advanced: "Go to advanced level",
  work: "Learn for work"
};
export {
  GOAL_LABELS as G,
  LEVEL_META as L,
  SUBJECTS as S,
  GOALS as a,
  levelFromScore as l,
  pickQuizQuestions as p,
  resetState as r,
  setState as s,
  usePW as u
};
