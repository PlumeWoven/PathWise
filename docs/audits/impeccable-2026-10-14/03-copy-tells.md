## Copy tells: PathWise user-visible strings

Lens: Impeccable tell #14 ("generic copy and em dashes; say what the product does in plain words"), `reference/clarify.md`, and the Copy line of `reference/craft-floor.md` ("controls name their action; errors name the problem and the recovery").
Method: source audit at `ba4af84`. No launcher or detector (see the vendoring note in `SKILL.md`). I parsed every `.ts`/`.tsx` file under `src/` with the TypeScript compiler and pulled out string literals, template text and JSX text. Code comments are excluded by construction. `src/components/ui/`, `routeTree.gen.ts` and the Supabase types are skipped. Then I read the landing page and the primary flows in full.

Brief used: a tutoring marketplace for Moldova (Math and English). It offers a 3-minute level check, a stage-by-stage roadmap, matching with verified tutors, booking and messaging. Students pay tutors directly. Owner decisions respected: sentence-case controls, no visible hero tagline, Voices kept for now.

Not re-reported: anything already in `docs/audits/apple-design-2026-10-12/05-content-navigation.md`. The items from it that are **still open** are listed once at the end.

### Verdict

**Copy rating: High issues.** The landing page reads like a template, not like PathWise. It never says Math, English, Moldova, or that you pay the tutor directly. Most of its space goes to four slogans repeated 4 or 5 times each ("Learn deliberately", "Find exactly where you stand", "No guesswork", "No wasted sessions"). The bigger problem is truthfulness. In 14 places the copy claims something the product doesn't do or can't measure:

- a "94% accuracy" figure with no source
- three "notify me" buttons that store nothing
- a "Create my free account" button that creates no account
- a "countries" count calculated from the student count
- a hard-coded "~3 hours" response time

The in-app copy is mostly plain and practical, more so than the landing page.

**Em dashes in user-visible copy: 132** (string literals and JSX text only, comments excluded):

| Kind | Count | Verdict |
| --- | --- | --- |
| Inside sentences (toasts, body, labels, meta descriptions) | **58** in 29 files | The tell. Rewrite every one; see Tell 2. |
| Page-title separators (`"X — PathWise"` in `head()` and `document.title`) | 41 in 27 files | One mechanical change: `" — PathWise"` → `" · PathWise"`, the separator the UI already uses. |
| Empty-value placeholders (`?? "—"` in tables, stats and summaries) | 29 in 10 files | A normal table convention, not a tell. Keep it in tables. Where the blank means something, say what: rating "—" → "No ratings yet", price "—" → "Ask the tutor". |
| `/style-guide` (internal reference page) | 4 | Low priority. |

The 58 in-sentence dashes, by file: `_app.book.$tutorId.tsx` 6, `_app.quiz.tsx` 4, `_app.course-match.tsx` 5, `_app.tutor.settings.availability.tsx` 3, `DemoContext.tsx` 3, `pathwise.demo.tsx` 3, `data.ts` 3, `course-matching.ts` 2, `_app.contact.tsx` 2, `_app.privacy.tsx` 2, `_app.onboarding.tutor.tsx` 2, `_app.matches.tsx` 2, `_app.demo.tsx` 2, `_app.courses.$slug.tsx` 3, `StepDeck.tsx` 2 (one sentence), and 1 each in `Voices.tsx`, `ExitDemoModal.tsx`, `Inbox.tsx`, `MatchedTutorsPanel.tsx`, `adaptive-quiz.ts`, `courses.ts`, `levels.ts`, `_app.library.tsx`, `_app.settings.verification.tsx`, `_app.tutor.$tutorId.tsx`, `auth.choose-role.tsx`, `admin.sessions.tsx`, `admin.users.tsx`, `dashboard.courses.new.tsx`.

### Top 5

1. **Invented numbers on the landing page and tutor profiles.** "94% accuracy" (`PortalHero.tsx:112`, `StepDeck.tsx:16`) has no source anywhere in the repo. "Taught N students across M countries" (`_app.tutor.$tutorId.tsx:771`) calculates M as `round(N/3 + 1)` (line 188). It's made up. "You typically respond in ~3 hours" (`dashboard.index.tsx:760`) is a hard-coded string.
2. **Buttons that promise actions nobody performs.**
   - On `/matches`, "Create alert", "Join waitlist" and "Notify me when matching tutors join" (`_app.matches.tsx:620-638`) only show a success toast ("we'll email you…"). Nothing is stored.
   - In the demo, "Create my free account →" (`ExitDemoModal.tsx:52`) writes the email to localStorage, says "Welcome to Pathwise! Setting up your account…" and creates no account.
3. **The landing page never says what PathWise is.** Math, English, Moldova and "you pay the tutor directly" appear nowhere on `/` or in the site-wide meta. Instead it repeats "Learn deliberately" 4 times, "Find exactly where you stand" 5 times and "guesswork" 5 times (Tell 3).
4. **Booking and publishing confirmations overstate.**
   - "You're booked!" (`_app.book.$tutorId.tsx:401`) shows for paid sessions. Those are saved as `scheduled`, which the app itself labels "Awaiting tutor confirmation" (`sessions.ts:19`).
   - "Profile published!" (`_app.onboarding.tutor.tsx:393`) shows while the profile is still hidden from students until verification.
   - The "Instant bookings" switch (`_app.tutor.settings.availability.tsx:284`) is never read by the booking flow.
5. **58 em dashes inside sentences**, concentrated in the quiz, booking and course-match flows. Each one has a plain rewrite below.

---

### Tell 1: generic AI marketing copy

Ranked by visibility. Proposed copy that names subjects ("Math and English") assumes the subject list is trimmed to those two. Today the quizzes offer 6 and 8 subjects (open item 05 #7).

**Landing (`/`)**

| file:line | Current | Proposed |
| --- | --- | --- |
| `components/landing/PortalHero.tsx:103` (sr-only h1) | PathWise: find exactly where you stand | PathWise: Math and English tutors in Moldova, matched to your level |
| `components/landing/Statement.tsx:10` | Learn deliberately | Math and English, in Moldova |
| `components/landing/Statement.tsx:15-16` | Find exactly where you stand and the path to where you want to be. | Find out your level, then follow a plan to your goal. (keep the amber span on the second clause) |
| `components/landing/Statement.tsx:19-20` | Get a clear, stage-by-stage path from your current level to your goal. No filler, no guesswork. | An 8-question check places you at one of five levels. Your roadmap then lists five stages, each with courses and tutors at your level. |
| `components/landing/StepDeck.tsx:142-145` (h2) | Learn deliberately. | From level check to lessons |
| `components/landing/StepDeck.tsx:148-149` | Everything you need to learn deliberately: a level check, a roadmap, the right tutor, and every session tracked. | Take the level check, follow your roadmap, book a verified tutor, and keep every session in one list. |
| `components/landing/StepDeck.tsx:15-16` | Level check in 3 minutes / A focused adaptive quiz pinpoints exactly what you know — and what you don’t — with 94% accuracy. | Level check in about 3 minutes / Eight questions that get harder when you're right and easier when you're not. They place you at one of five levels. |
| `components/landing/StepDeck.tsx:20-21` | A roadmap built for you / Get a clear, stage-by-stage path… No filler, no guesswork. | Five stages to your goal / Each stage names the level it needs. Finish a course at that level to unlock the next stage. |
| `components/landing/StepDeck.tsx:25-26` | Matched with the right tutor / We pair you with verified tutors who specialize in the exact stage you’re working through. | Tutors ranked for you / We rank verified tutors by subject, learning style, schedule, budget and rating. Book a trial or send a message first. (Matching is by subject and preferences, not by stage: `api.ts:414`, `matching.ts:46`.) |
| `components/landing/StepDeck.tsx:30-31` | Track every session / See your progress, hours, and momentum in one calm dashboard that keeps you moving forward. | Your sessions in one place / See upcoming and past sessions, message your tutor, and mark stages complete on your roadmap. |
| `components/landing/Footer.tsx:32-34` (h2) | No guesswork. / No wasted sessions. | Know your level before you book. |
| `components/landing/Footer.tsx:37` | Learn deliberately. Find exactly where you stand and the path to where you want to be. | Math and English tutoring in Moldova. You pay your tutor directly. |
| `routes/_app.index.tsx:20` (meta description) | A 3-minute quiz reveals your level, builds your roadmap, and finds the right tutor. No guesswork. No wasted sessions. | A free level check in Math or English, a five-stage roadmap, and verified tutors in Moldova. Book here and pay your tutor directly. |
| `routes/_app.index.tsx:26` (og:description) | Discover your level, get a personalized roadmap, and meet matched tutors. Free, no signup. | Find your level in Math or English, get a five-stage roadmap and meet verified tutors. The level check is free and needs no account. |
| `routes/__root.tsx:43, 50, 60` (site-wide description) | PathWise is a learning platform that matches students with tutors and courses via a gamified experience. | PathWise matches students in Moldova with verified Math and English tutors, starting from a free level check. |
| `routes/__root.tsx:39, 46, 56` (site-wide title) | PathWise — Personalized Tutor Matching & Roadmaps | PathWise · Math and English tutors in Moldova |
| `routes/_app.index.tsx:39` (JSON-LD) | PathWise matches students with tutors and personalized learning roadmaps. | Same text as the site-wide description. |

**Primary flows**

| file:line | Current | Proposed |
| --- | --- | --- |
| `routes/_app.quiz.tsx:36` | Take a 3-minute gamified diagnostic to find your exact level. | Answer 8 questions in about 3 minutes to find your level in Math or English. |
| `routes/_app.quiz.tsx:41` | A short, fun diagnostic to reveal your starting level. | Same as line 36. |
| `routes/_app.find-tutor.tsx:17, 22` | Take a quick 8-question quiz and we'll match you with the perfect tutor. | Answer 8 questions and we'll rank verified tutors by how well they fit you. |
| `routes/_app.find-tutor.tsx:271` | What subject brings you here today? | Which subject do you need help with? |
| `routes/_app.find-tutor.tsx:317-326` (goal labels / descriptions) | Ace an exam / Crush that upcoming test · Master a skill / Go deep, become great · Build confidence / Believe you can do it · Get ahead / Stay one step in front · Homework help / Tackle assignments together | Pass an exam / Prepare for a test or exam · Learn one topic well / Go through it step by step · Build confidence / Feel sure of the basics · Get ahead / Learn ahead of your class · Homework help / Get help with assignments. ("Pass an exam" matches the level check's own goal, `data.ts:38`.) |
| `routes/_app.find-tutor.tsx:399, 416, 419` (pace) | Take it slow / Easygoing / Just right / Push me / Sprint mode; "I need time to absorb" / "Challenge me!" | Slow / Fairly slow / Medium / Fairly fast / Fast; "Slower" / "Faster" |
| `routes/_app.find-tutor.tsx:540-543` (frequency descriptions) | Steady & consistent / Build momentum / Go all in / As needed | Delete. The labels already say it ("Once a week", "Twice a week", "3 or more a week", "Flexible"). |
| `routes/_app.find-tutor.tsx:650-665, 694` (result card) | "The Visual Explorer", "Deep Diver", "Night Thinker", "Morning Riser", fallback "The Curious Learner" | Heading "Your answers", then plain rows: "Learns best by: seeing examples", "Pace: fast", "Sessions: twice a week", "Best time: evenings". |
| `routes/_app.roadmap.tsx:72, 77` | A personalized 5-stage learning roadmap built around your level and goal. / Visual learning journey from where you are to where you want to be. | A five-stage roadmap from your level to your goal. (both) |
| `routes/_app.roadmap.tsx:590, 615, 617` | YOUR RANK / YOUR MISSION / Master {subject} up to {stage}, starting from {level}. | Your level / Your goal / Reach {stage} in {subject}, starting from {level}. |
| `routes/_app.matches.tsx:53` | Personalized tutor matches with a transparent score breakdown. | Verified tutors ranked by subject, learning style, schedule, budget and rating. |
| `routes/_app.matches.tsx:566` (filter heading) | Vibe | Teaching style |
| `routes/dashboard.index.tsx:268` | Your live dashboard is ready | Your dashboard |
| `routes/_app.onboarding.tutor.tsx:1096` | Introduce yourself, share your teaching philosophy, and what makes you unique. | Say who you are, what you teach and what a lesson with you looks like. |
| `routes/_app.onboarding.tutor.tsx:1354` | A risk-free way for students to try you out | Students can try one lesson before paying. |
| `components/dashboard/CourseEditor.tsx:432, 437` | Subtitle (hook) / A short, punchy line that sells the course | Subtitle / One line on what students will be able to do. |

**Demo**

| file:line | Current | Proposed |
| --- | --- | --- |
| `routes/_app.demo.tsx:46` | Experience Pathwise in 60 seconds | See PathWise with sample data |
| `routes/_app.demo.tsx:19, 24` and `pathwise/DemoBanner.tsx:21` | Experience Pathwise… / Explore the full tutor & student experience with sample data. | See PathWise as a tutor or a student, with sample data. No account needed. |
| `routes/pathwise.demo.tsx:25, 30` | Real-looking sample data. / See the full tutor dashboard and student experience in 60 seconds. | Sample data, no account needed. |
| `pathwise/ExitDemoModal.tsx:29, 31` and `routes/pathwise.demo.tsx:601` | Ready for the real thing? / Start your own journey / Ready to make it real? | Create your account |

### Tell 2: em dashes in sentences (58)

Rewrites use periods, commas, colons or parentheses. Rows that another tell rewrites are marked "see Tell N".

| file:line | Current | Proposed |
| --- | --- | --- |
| `components/landing/StepDeck.tsx:16` | …what you know — and what you don’t — with 94% accuracy. | see Tell 1 |
| `components/landing/Voices.tsx:4` | …matched where I was — not where a generic course… | see Tell 4 (Voices) |
| `routes/_app.quiz.tsx:401` | {N} questions that adapt as you go — get one right and the next gets harder, miss one and it eases off. That's how we place you precisely. | {N} questions that adapt as you go. Get one right and the next is harder; miss one and the next is easier. |
| `routes/_app.quiz.tsx:454` | Tier {n} of 5 — the quiz picked this based on your answers so far | Tier {n} of 5. The quiz picked it from your answers so far. |
| `routes/_app.quiz.tsx:507` | Correct — stepping up the difficulty. | Correct. The next question is harder. |
| `routes/_app.quiz.tsx:512-516` | Not quite — the answer was {x}. Easing off for the next one. | Not quite. The answer was {x}. The next question is easier. |
| `pathwise/adaptive-quiz.ts:174` | You cleared every question we threw at you, up to tier {n} — straight to advanced material. | You answered every question right, up to tier {n}. Your roadmap starts at advanced material. |
| `pathwise/data.ts:280` | You're just starting out — we'll build strong foundations. | You're just starting out. We'll build the foundations first. |
| `pathwise/data.ts:281` | Basic foundations are there — let's strengthen and extend them. | You have the basics. Next, strengthen and extend them. |
| `pathwise/data.ts:283` | Strong skills — you're ready for advanced material. | Strong skills. You're ready for advanced material. |
| `pathwise/levels.ts:48` | Strong — ready for depth | Strong, ready for harder material |
| `routes/_app.library.tsx:213` | …Courses at your band come first — the shelves above and below are open too, so you can stretch or consolidate. | …Courses at your level come first. You can also open the levels above and below, to move ahead or to review. |
| `routes/_app.course-match.tsx:213` | Course complete — this stage is unlocked. | Course complete. This stage is unlocked. |
| `routes/_app.course-match.tsx:228` | Course released — pick another below. | Course removed from this stage. Pick another below. |
| `routes/_app.course-match.tsx:297` | Level id {id} — {blurb}. | {blurb}. (drop the internal id) |
| `routes/_app.course-match.tsx:315` | Based on subject alone — take the tutor quiz to sharpen this. | Based on your subject only. Take the tutor quiz for closer matches. |
| `routes/_app.course-match.tsx:363` | You've finished this course — head back and mark the stage complete. | You've finished this course. Go back to your roadmap and mark the stage complete. |
| `pathwise/course-matching.ts:215` | Pitched at {level} — exactly where you placed, and {tutor} is one of your matched tutors. | At {level}, the level you placed at. {tutor} is one of your matched tutors. |
| `pathwise/course-matching.ts:219` | a step above/below your {level} standing, from your matched tutor {tutor} — useful if you want to stretch/consolidate. | One level above/below yours, from your matched tutor {tutor}. Good if you want a challenge / a review. (Also fixes the lowercase sentence start.) |
| `pathwise/MatchedTutorsPanel.tsx:66` | …{level} — {stage title}. | …{level}, for {stage title}. |
| `routes/_app.book.$tutorId.tsx:222` | Sign in to complete your booking — we'll bring you back here. | Sign in to finish booking. We'll bring you back here. |
| `routes/_app.book.$tutorId.tsx:281` | This slot was just booked by someone else — please refresh and pick another time. | Someone just booked that time. Pick another slot. (05 #11 wording; the slots already reload) |
| `routes/_app.book.$tutorId.tsx:509` | Save {n}% — {s} × 60 min | {s} sessions × 60 min, save {n}% |
| `routes/_app.book.$tutorId.tsx:684` | Heads up — daylight-saving change between occurrences. Local clock-time is preserved across all instances. | Clocks change during this series. Each session stays at the same local time. |
| `routes/_app.book.$tutorId.tsx:735` | You and your tutor are in different timezones — double-check the times match. | You and your tutor are in different time zones. Check both times above. |
| `routes/_app.book.$tutorId.tsx:814` | No payment required for this trial — just confirm below. | This trial is free. Confirm below. |
| `routes/_app.tutor.$tutorId.tsx:694` | — {student name} (testimonial attribution) | {student name} (drop the dash) |
| `routes/_app.courses.$slug.tsx:62, 67` | Explore this course on PathWise — lessons, reviews, and tutor details. | Course lessons, reviews and tutor details on PathWise. |
| `routes/_app.courses.$slug.tsx:798` | No reviews yet — be the first. | No reviews yet. |
| `routes/_app.matches.tsx:622, 635` | Alert created — we'll email you… / …we'll notify you… | see Tell 4 (delete) |
| `pathwise/Inbox.tsx:233` | Say hello — introduce yourself and what you'd like to learn. | Say hello. Introduce yourself and say what you'd like to learn. |
| `routes/auth.choose-role.tsx:133` | …Tell us how you'll use PathWise — this decides your dashboard, and you can't change it later, so pick the one that fits. | …Choose how you'll use PathWise. This sets your dashboard and can't be changed later. |
| `routes/_app.settings.verification.tsx:60` | Request sent — we'll email you to book a short video call. | Request sent. We'll email you to book a short video call. |
| `routes/_app.tutor.settings.availability.tsx:189` | Tutors only — please sign in. | This page is for tutors. Sign in to continue. |
| `routes/_app.tutor.settings.availability.tsx:284` (×2) | On — auto-confirm / Off — you confirm each one | see Tell 4 |
| `routes/_app.onboarding.tutor.tsx:856` | Highlighted on your profile — what you're truly best at | Shown at the top of your profile: what you teach best. |
| `routes/_app.onboarding.tutor.tsx:1209` | Auto-detected — you can change it. | Detected from your browser. You can change it. |
| `routes/_app.contact.tsx:19` | Reporting inappropriate behaviour — we act on these first. | Reporting inappropriate behaviour. We handle these first. |
| `routes/_app.contact.tsx:22` | A copy of your data or deleting your account — send it from your account's email address. | A copy of your data, or deleting your account. Send these from your account's email address. |
| `routes/_app.privacy.tsx:44` | Supabase — database, sign-in and file storage, hosted in the EU (Ireland). | Supabase: database, sign-in and file storage, hosted in the EU (Ireland). |
| `routes/_app.privacy.tsx:45` | Vercel — website hosting and anonymous analytics. | Vercel: website hosting and anonymous analytics. |
| `pathwise/courses.ts:123` | Course wasn't updated — you may not have permission. | Course not updated. You may not have permission to edit it. |
| `routes/dashboard.courses.new.tsx:46` | Could not create course — that URL is already taken. Please try again. | Course not created. Try again. (The code comment says this case is now unreachable.) |
| `routes/_app.demo.tsx:49` | …Your demo session lasts 60 minutes — choose which experience you want to start with. | …The demo lasts 60 minutes. Choose a side to start with. |
| `routes/_app.demo.tsx:63` | Dashboard with earnings, students, courses, messages — everything tutors get. | Dashboard with earnings, students, courses and messages: the same tools tutors get. |
| `pathwise/ExitDemoModal.tsx:34` | …keep your courses, students and earnings — for real this time. | see Tell 4 |
| `routes/pathwise.demo.tsx:428` | Demo mode — changes won't be saved. | Demo mode: changes aren't saved. |
| `routes/pathwise.demo.tsx:534` | Demo mode — payment disabled | see Tell 4 |
| `routes/pathwise.demo.tsx:604` | …Free to start — no credit card. | see Tell 4 |
| `pathwise/DemoContext.tsx:29` | MSc Computer Science — TU Delft | MSc Computer Science, TU Delft (see Tell 6: demo data isn't Math/English) |
| `pathwise/DemoContext.tsx:74` | Hi Alex! Loved lesson 12 — quick question about async patterns… | Hi Alex! Loved lesson 12. Quick question about… |
| `pathwise/DemoContext.tsx:90` | Just finished the SaaS course — thank you, this was incredible. | Just finished the course. Thank you! |
| `routes/admin.sessions.tsx:73`, `routes/admin.users.tsx:35` | Not updated — are you signed in as an admin? | Not updated. Check that you're signed in as an admin. |

**Page titles (41).** Change `" — PathWise"` to `" · PathWise"` in every `head()`, and in `_app.courses.$slug.tsx:200` and `_app.tutor.$tutorId.tsx:244`. In the same pass, put the Title Case titles in sentence case:
- "Find Your Tutor" → "Find a tutor"
- "Your Roadmap" → "Your roadmap"
- "Course Library" → "Course library"
- "Your Matches" → "Your matches"
- "Level Check" → "Level check"
- "Find Your Stage Course" → "Choose a course for this stage"
- "Edit Course" → "Edit course"
- "New Course" → "New course"
- "Verification Center" → "Verification"
- "Privacy Policy" → "Privacy policy"
- "Terms of Use" → "Terms of use"
- "Try Pathwise — Live Demo" and "Pathwise Demo — Try the platform with sample data" → "PathWise demo"

### Tell 3: repeated taglines

| Phrase | Where | Keep |
| --- | --- | --- |
| "Find exactly where you stand" | `_app.index.tsx:16, 22` (title, og:title), `PortalHero.tsx:103` (h1), `Statement.tsx:15`, `Footer.tsx:37` | Statement h2 only, reworded (Tell 1). Title and h1 should say what PathWise is. |
| "Learn deliberately" | `Statement.tsx:10`, `StepDeck.tsx:143-144` (h2), `StepDeck.tsx:148`, `Footer.tsx:37` | None. It names no action or outcome. |
| "guesswork" | `_app.index.tsx:20`, `Statement.tsx:20`, `StepDeck.tsx:21`, `Footer.tsx:32`, `Voices.tsx:10` | None. |
| "No wasted sessions" / "wasting sessions" | `_app.index.tsx:20`, `Footer.tsx:34`, `Voices.tsx:16` | None. |
| "Get a clear, stage-by-stage path from your current level to your goal. No filler, no guesswork." | `Statement.tsx:19-20` and `StepDeck.tsx:21`, word for word | Neither (Tell 1 gives each its own text). |
| "…to where you want to be" | `Statement.tsx:16`, `Footer.tsx:37`, `_app.roadmap.tsx:77` | None. |
| "journey" | `_app.roadmap.tsx:77`, `_app.roadmap.tsx:636` ("ESTIMATED JOURNEY"), `ExitDemoModal.tsx:31` | None. |
| Quiz length | "3 min avg" `PortalHero.tsx:109`, "3 min" `StageRoster.tsx:36`, "3 minutes" `StepDeck.tsx:15`, "3-minute" `_app.index.tsx:20` and `_app.quiz.tsx:36`, but "about two minutes" `_app.library.tsx:171` | One figure everywhere: "about 3 minutes" (8 questions, `adaptive-quiz.ts:19`). |
| Tutor-quiz length | "quick 8-question quiz" `_app.find-tutor.tsx:17` vs "60-second quiz" `_app.matches.tsx:408` | "8 questions" |
| Demo length | "in 60 seconds" `_app.demo.tsx:46`, `pathwise.demo.tsx:30` vs "lasts 60 minutes" `_app.demo.tsx:49` | Drop "60 seconds"; keep the 60-minute session fact. |

### Tell 4: claims nothing backs up

Every row here either states a number with no source or promises behavior the code doesn't have. This is the group to fix first.

**Landing**

| file:line | Current | Proposed |
| --- | --- | --- |
| `components/landing/PortalHero.tsx:112`, `StepDeck.tsx:16` | 94% accuracy | Delete. Nothing in the repo measures it. Corner label: "8 questions". |
| `components/landing/PortalHero.tsx:109` | 3 min avg | About 3 min ("avg" claims a measurement) |
| `components/landing/Voices.tsx:3-27` | Eyebrow "Loved by learners & tutors". Three quotes from "Maya Okonkwo, Learning Spanish", "Daniel Reyes, Verified Math Tutor", "Priya Sharma, Front-end developer" ("hit my goal three weeks early"). | The owner kept Voices, so this is a flag, not a rewrite. Nothing in the repo shows these are real users. Two of them name subjects PathWise doesn't teach (Spanish, front-end development). I won't write replacement quotes. Options: (a) recommended: hide the section until you have real, consented quotes from Moldovan students and tutors; (b) at minimum, delete the "Loved by learners & tutors" eyebrow and label the block "Sample quotes". |
| `routes/_app.index.tsx:50-53` (JSON-LD `SearchAction` → `/find-tutor?q=`) | Declares a site search | `/find-tutor` has no `q` parameter. Delete the `WebSite`/`SearchAction` block. |

**Student flows**

| file:line | Current | Proposed |
| --- | --- | --- |
| `routes/_app.matches.tsx:620-638` | "Create alert", "Join waitlist", "Notify me when matching tutors join", plus toasts "Alert created — we'll email you when matches join." / "Added to waitlist." | Nothing is stored or emailed. Delete all three buttons and their toasts. Keep "Clear all filters", and rename "Try related subjects" (Tell 5). |
| `routes/_app.matches.tsx:408` | Take a 60-second quiz to refine your matches | Answer 8 questions to change your matches |
| `routes/_app.roadmap.tsx:636-645` | ESTIMATED JOURNEY · 8–12 weeks · 3–4 sessions / week · ~45 min per session | The same hard-coded values for every student. Sessions are 60 min in booking (`_app.book.$tutorId.tsx:500`). Delete the block, or show the chosen course's `estimated_weeks` as "About {n} weeks". |
| `routes/_app.book.$tutorId.tsx:401` | You're booked! (also for paid sessions) | Paid bookings are saved as `scheduled` (line 291), which the app shows as "Awaiting tutor confirmation" (`sessions.ts:19`). Use "You're booked" for free trials (saved `confirmed`). For paid sessions: "Booking sent. {tutor} will confirm it." |
| `pathwise/sessions.ts:20` | Confirmed: "Locked in your calendars" | Your tutor accepted this session. (Nothing adds sessions to calendars; there's only the manual "Add to Google Calendar" button.) |
| `pathwise/sessions.ts:21` | Reminder sent: "We pinged both of you" | Nothing in `src/` or `supabase/` sends reminders, so this status is never reached. If you keep it: "Reminder sent to you both". |
| `routes/_app.courses.$slug.tsx:834` | Students also viewed | More {category} courses (the query is same-category courses, lines 165-172) |
| `routes/_app.courses.$slug.tsx:502`, `components/dashboard/CourseEditor.tsx:1301` | Certificate of completion / Issue a certificate of completion | Nothing issues certificates (comment at `_app.courses.$slug.tsx:38-40`). Owner to decide: delete both, or "Your tutor gives a certificate on completion" if tutors really do. |
| `routes/_app.tutor.$tutorId.tsx:771` (line 188 computes it) | Taught {N} students across {round(N/3+1)} countries | Delete the "across … countries" line. If you keep the count, say "{N} students booked" (it counts students with any session, line 187). |

**Tutor flows**

| file:line | Current | Proposed |
| --- | --- | --- |
| `routes/dashboard.index.tsx:759-760` | You typically respond in ~3 hours (hard-coded) | Delete, or reuse the real `tutor_response_minutes` value the profile page already reads (`_app.tutor.$tutorId.tsx:190`). |
| `routes/_app.tutor.settings.availability.tsx:275-284`, `_app.onboarding.tutor.tsx:1229-1233` | Instant bookings: "On — auto-confirm" / "Off — you confirm each one"; "Manual approval / Instant bookings" | The booking flow never reads `instant_bookings`. Paid sessions always wait for the tutor, and trials are always confirmed. Wire it up or remove the control. No accurate label exists for a switch that does nothing. |
| `routes/_app.onboarding.tutor.tsx:393` | Profile published! | Profile saved. We'll email you to book your verification call. Students can find you once you're verified. (Publishing sets `pending`, and only verified tutors are listed: `_app.settings.verification.tsx:75`.) |
| `routes/_app.onboarding.tutor.tsx:1087` | A 60-90s intro video doubles your booking rate. | Students see this on your profile. Keep it to 60 to 90 seconds. |
| `routes/_app.onboarding.tutor.tsx:1532` | You can still publish, but a complete profile gets 3× more bookings. | You can publish now and fill these in later. |
| `routes/_app.onboarding.tutor.tsx:1359` vs `_app.book.$tutorId.tsx:491-492` | "Free 15-min discovery call" vs "Trial / discovery call · 30 min" | Pick one length. To match booking: "Free 30-min trial call". |
| `routes/_app.onboarding.tutor.tsx:1471` | ${rate} /hr | {formatPrice(rate)} /hr (rates are in MDL, `:1296`) |
| `routes/dashboard.index.tsx:286, 819-821` | Earnings (MTD) / Total earned / Sessions paid / Avg / session | PathWise takes no payments, so it can't know what was paid. Use "Booked this month" / "Value of booked sessions" / "Sessions booked" / "Average per session". |

**Demo**

| file:line | Current | Proposed |
| --- | --- | --- |
| `pathwise/ExitDemoModal.tsx:21, 34, 52, 63` | "Create my free account →" (saves the email to localStorage only), toast "Welcome to Pathwise! Setting up your account…", "…keep your courses, students and earnings…", "No credit card · Cancel anytime" | No account is created, demo data isn't kept, and there's nothing to cancel. The button should open the real sign-up (`LoginModal`), with label "Sign up free" and description "Demo data isn't kept. Your account starts empty." Delete the email field, the toast and the footer line. |
| `routes/pathwise.demo.tsx:604` | Sign up to keep your courses, students, and earnings. Free to start — no credit card. | Sign up free. Demo data isn't kept. |
| `routes/pathwise.demo.tsx:568, 574` | 12% complete · keep going to earn your certificate / Get my certificate → | Delete (no certificates). |
| `routes/pathwise.demo.tsx:534` | Demo mode — payment disabled | Demo only. Nothing is booked. (PathWise has no payments to disable.) |

### Tell 5: labels that don't name the action, and errors with no recovery

**Labels**

| file:line | Current | Proposed |
| --- | --- | --- |
| `routes/_app.tutor.$tutorId.tsx:408` / `:792`, `pathwise/MatchCard.tsx:184`, `pathwise/MatchedTutorsPanel.tsx:150` | "Book a call" / "Book a session" / "Book trial" / "Book". All four open `/book/$tutorId` with nothing preselected. | Book a session (all four) |
| `routes/_app.matches.tsx:619` | Try related subjects (goes to `/find-tutor`) | Retake the tutor quiz (same as `_app.course-match.tsx:643`) |
| `routes/_app.book.$tutorId.tsx:750` | Order summary | Booking summary |
| `routes/_app.book.$tutorId.tsx:401` | You're moved! | Session moved |
| `routes/_app.book.$tutorId.tsx:634, 676` | Ongoing (cap 26) / Books up to 26 occurrences from your selected start. | Ongoing (up to 26 sessions) / Books up to 26 sessions from the first date you picked. |
| `routes/_app.sessions.$id.tsx:153` | toast `Session ${status}` → "Session reminder sent", "Session in progress" | Use the `label` from `STATUS_META` (`sessions.ts:18-27`) so toasts and badges use the same words. |
| `pathwise/VerificationBadge.tsx:35` vs `_app.tutor.$tutorId.tsx:346`, `MatchedTutorsPanel.tsx:124`, `_app.settings.verification.tsx:96` | "ID Verified" / "Verified tutor" / "Identity Verified" | Verified tutor (one term; it's also the Terms' word, `_app.terms.tsx:56`) |
| `routes/_app.onboarding.tutor.tsx:855` vs `_app.tutor.$tutorId.tsx:456` | Superpowers (editor) / Strengths (profile) | Strengths |
| `routes/dashboard.settings.index.tsx:13` | Choose a setting category: | Delete; the list explains itself. |

**Errors.** Each one says what failed and what to do next, per `clarify.md`.

| file:line | Current | Proposed |
| --- | --- | --- |
| `routes/_app.confirm-email.tsx:142-145` | Confirmation Failed / Something went wrong. | Email not confirmed / This link may have expired. Send a new one below. |
| `routes/_app.confirm-email.tsx:110` | Failed to resend | Email not sent. Wait a minute and try again. |
| `routes/auth.callback.tsx:191` | Authentication failed (or the raw error) | Sign-in didn't finish. Try again, or sign in with email and password. |
| `pathwise/LoginModal.tsx:111` | Google sign-in failed | Google sign-in didn't finish. Try again, or use email and password. |
| `pathwise/sessions.ts:70` → shown by `_app.sessions.$id.tsx:156` | Cannot move from {status} to {status} / Could not update session | This session's status changed. Reload the page to see where it stands. |
| `routes/_app.find-tutor.tsx:135` | Couldn't save your profile, but here are your matches! | Your answers weren't saved to your account. Your matches below still use them. |
| `routes/_app.onboarding.tutor.tsx:999` | Couldn't access camera/microphone. | Camera or microphone blocked. Allow them in your browser settings, or upload a video file. |
| `routes/_app.onboarding.tutor.tsx:559, 1039` | Upload failed. | Photo not uploaded. Try again. / Video not uploaded. Try again; files must be under 60 MB. |
| `routes/_app.tutor.settings.availability.tsx:176` | Could not save | Availability not saved. Check your connection and press Save again. |
| `components/dashboard/CourseEditor.tsx:134, 161, 202, 407, 655, 667, 713, 892` | Not authorized / Failed to load / Save failed / Upload failed / Add section failed / Reorder failed / Add lesson failed / Upload failed | You can only edit your own courses. / Course not loaded. Reload the page. / Changes not saved. Check your connection and press Save again. / Image not uploaded. Try a smaller image. / Section not added. Try again. / New order not saved. Drag it again. / Lesson not added. Try again. / Video not uploaded. Try again. |

### Tell 6: jargon and English idioms for a Romanian- and Russian-speaking audience

New since 05 #13:

| file:line | Current | Proposed |
| --- | --- | --- |
| `routes/_app.course-match.tsx:284-286` | You can't tick this stage off until you've taken a course that fits it. We only show courses that clear two bars at once: pitched at the level your quiz placed you in, and taught by a tutor you were matched with. | To complete this stage, take a course at your level, taught by one of your matched tutors. These are the courses that fit. |
| `routes/_app.course-match.tsx:297` | Level id {mathematics.L3} | Delete (internal id) |
| `pathwise/StageDetailModal.tsx:94` | What did you cover? What clicked? | What did you cover? What was hard? |
| `pathwise/sessions.ts:25` | Closed: "All wrapped up" | Finished and reviewed |
| `routes/dashboard.index.tsx:575` | 1on1 | One-to-one |
| `routes/pathwise.demo.tsx:283, 290` | +18% MoM / +5pp vs avg | +18% on last month / 5 points above average |
| `components/dashboard/CourseEditor.tsx:1306, 1312, 1319` | Meta title / Meta description / URL slug | Title in search results / Description in search results / Page address |
| `components/dashboard/CourseEditor.tsx:580` | Pick a category to generate a level id | Pick a category first |
| `components/dashboard/CourseEditor.tsx:1337, 1342` | ≥ 3 learning outcomes / ≥ 1 section with ≥ 1 lesson | At least 3 learning outcomes / At least one section with a lesson |
| `routes/_app.onboarding.tutor.tsx:648, 667, 715, 842` | Jane Doe / MIT-trained math tutor specializing in SAT prep / Stanford University / AP Calculus, SAT Prep, Dyslexia Specialist | Ana Rusu / Math tutor, 8 years preparing students for the BAC / Moldova State University / BAC preparation, gymnasium exam, English grammar |
| `components/dashboard/CourseEditor.tsx:429, 472, 1175, 90, 91` | Master Python in 6 weeks / Python, React, Calculus / Basic JavaScript / languages incl. Spanish, French, German, Mandarin / audience "Hobbyists, Career Changers" | Algebra for the gymnasium exam in 8 weeks / Algebra, geometry, grammar / Basic fractions / Romanian, Russian, English / Students, Parents, Adults |
| `pathwise/DemoContext.tsx` (whole sample tutor) | A coding tutor: "MSc Computer Science — TU Delft", a SaaS course, async patterns, "€" | Swap in a Math or English tutor with MDL prices, so the demo shows the real product. |
| `routes/dashboard.index.tsx:286` | Earnings (MTD) | see Tell 4 |

### Still open from 05-content-navigation (not re-detailed)

- **#7** Two subject lists, and no "English": `data.ts:28-35` (6 subjects), `_app.find-tutor.tsx:249-257` (8). This blocks the "Math and English" copy above.
- **#11** Raw `error.message` still reaches people at about 31 call sites in 16 files. `src/lib/errors.ts` doesn't exist yet. "please refresh" is still at `_app.book.$tutorId.tsx:281`.
- **#12**
  - "Calendar" (`TutorSidebar.tsx:18`)
  - "See my matched tutors & courses →" (`_app.roadmap.tsx:896`)
  - "View all reviews →" opens a "coming soon" toast (`dashboard.index.tsx:797-799`)
  - Step "Pay" and h1 "Payment" (`_app.book.$tutorId.tsx:88, 809`)
- **#13**
  - "level band" / "band" (`_app.library.tsx:32, 213`, `CourseEditor.tsx:536-538`)
  - "needs a {band} course" (`_app.course-match.tsx:281`)
  - "No course clears both bars yet" (`:634`)
  - "Lead funnel" / "Conversion" / "% conv" (`dashboard.index.tsx:636-649`)
  - "Early Bird / Night Owl / Weekend Warrior" (`_app.find-tutor.tsx:458-461`)
  - "Crush that upcoming test" (`:317`)
  - "hover to pause" on touch screens (`StepDeck.tsx:237`)
- **#14** Title Case left in headings and badges:
  - "Email Confirmed!" (`_app.confirm-email.tsx:131`, `ConfirmationModal.tsx:62`)
  - "Level Check: Unlocked" (`_app.quiz.tsx:398`)
  - "Build My Roadmap →" (`:608`)
  - "Mark Stage Complete" (`_app.roadmap.tsx:859`)
  - "Admin Dashboard", "Courses Pending Review"
  - "My Courses" (`TutorSidebar.tsx:17`)
  - "Pathwise" spelled lowercase in about 10 demo strings
- **#15** "SAT" placeholder (`_app.onboarding.student.tsx:88`), and the role-blind Inbox empty state (`Inbox.tsx:116`).

### What works

- **Booking copy is honest about money.** "PathWise is free during the beta: you pay your tutor directly… Nothing is charged here." (`_app.book.$tutorId.tsx:819`) matches the Terms. So do the course FAQ (`_app.courses.$slug.tsx:43-52`) and the sticky "Pay your tutor directly".
- **Recurring-booking failures name problem and recovery**: "Session 3 of 8 couldn't be booked, so none of the series was booked. Pick another start time." (`_app.book.$tutorId.tsx:351`).
- **The reset-password expiry message is a model to copy**: "This reset link has expired, was already used, or was opened in a different browser. Enter your email and we'll send a new one." (`_app.reset-password.tsx:92`).
- **The review failure keeps the text and says so**: "Your review wasn't saved. Your text is still here, so try again." (`_app.sessions.$id.tsx:229`).
- **Verification copy is now one story.** The banner, page and Terms all say: a 10-minute video call, and only verified tutors are listed (fixed since 05 #5).
- **Destructive confirms name the object**: `Delete "{title}"? This can't be undone.` (`CourseEditor.tsx:698, 722`).
