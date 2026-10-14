# Student journey audit 1: onboarding, level check, roadmap, next steps

Date: 2026-10-14. Auditor role: a new student, signed out, on production (https://path-wise-seven.vercel.app).

Method:
- Walked the public pages live with a headless browser. Every non-GET request to Supabase was blocked, and none was attempted except the three below.
- "Build my roadmap" writes three rows. Those three inserts were answered by a local mock in the browser, so the real roadmap page rendered without writing anything to the database. Result: 0 writes reached Supabase.
- Everything behind sign-in (sign-up, onboarding, course-match, booking confirm) was traced in code.
- Live schema, RLS policies and indexes were read from `information_schema` / `pg_policies` / `pg_indexes` (no user rows read).

Screenshots are in the session scratchpad, written below as `$SHOTS/`:
`/private/tmp/claude-501/-Users-ionnistorica-PathWise-PathWise--claude-worktrees-apple-design-skills-audit-084055/effd922f-a1a6-4099-8b30-fb50c356c9db/scratchpad/pw/journey/`
Scripts: `journey.js` and `journey2.js` in the folder above it.

---

## 1. Verdict

The first ten minutes work. The landing page, the level check and the result screen are clear and fast. After that the student gets lost. The roadmap shows five stages, but its first stage cannot be finished today: the gate needs a course at the student's level, and the live catalogue has 0 Seedling, 0 Spark and 0 Mastermind Math courses. The roadmap card offers two buttons that go to two different places, and only one of them can unlock the stage. Every roadmap button needs an account, but the page says "Free to browse" and the sign-in box opens as "Welcome back". A second "8 questions" quiz (Find a tutor) asks for the level again with different words, offers subjects PathWise does not teach, and its answers are lost when the student is signed out. The test result is shown once and never again: the roadmap keeps only the level name, and no tutor ever sees the score or weak topics.

---

## 2. The journey, step by step

L = seen live. C = traced in code. M = seen live with the three roadmap inserts mocked.

1. **Landing** (L, `$SHOTS/01-landing.png`). Headline: "Math and English tutors in Moldova, matched to your level". Main button "Start your level check" goes to `/quiz`. Second button "Find a tutor" goes to `/find-tutor`. "Try demo mode" goes to `/pathwise/demo`. Header: Level check, Find a tutor, Course library, Sign in.
2. **Level check: subject** (L, `02`). Six subjects: Mathematics, Sciences, Literature, History, Programming, Languages. No English. One tap moves on.
3. **Level check: goal** (L, `03`). Pass an exam, Improve my grades, Fill in gaps, Go to advanced level, Learn for work.
4. **Level check: intro** (L, `04`). "8 questions that adapt as you go." Button "Begin →".
5. **Questions 1 to 8** (L, `05`). Each card shows topic, "Tier N" badge, four options. After an answer: green "Correct. The next question is harder." or "Not quite. The answer was X. The next question is easier." plus "Next →". An XP counter sits top right.
6. **Result** (L, `06-quiz-result.png`). Hexagon "Your level: Seedling, 1 / 8 correct", "80 XP earned", one sentence ("You handled questions up to tier 1, but Reasoning and Geometry still need work."), a "By topic" list, and one button: "Build my roadmap →". No retake button, no explanation of the five levels.
7. **Build my roadmap** (M). Writes `diagnostic_results`, `roadmaps`, `roadmap_stages` as a guest (`user_id = null`), stores both ids in localStorage, and opens `/roadmap?roadmapId=…`.
8. **Roadmap** (M, `20-roadmap-1280.png`, `25-roadmap-375.png`). Banner "Sign up to save your progress permanently". Title "From Seedling to your goal". Left: level card, progress 0/5, goal, and "1 verified tutor for Mathematics" with "View profile" and "Book a session". Right: five stage cards. Stage 1 has "Start here" (outlined) and "Choose your course" (grey, lock icon). Stages 2 to 5 say "Locked". Each card says "Requires a <Level> course" and "Open for details and to log sessions". Bottom: "See my matched tutors & courses →" and "Free to browse · Book only when ready".
9. **Click a stage card** (M, `21`). Opens "Stage 01 · Session log": a form asking for date, tutor name, duration, notes. Nothing explains what the stage contains.
10. **Click "Start here", "Choose your course" or "See my matched tutors"** (M, `22`). All three open the sign-in box, titled "Welcome back / Choose how you're signing in". The student has to find "Create account".
11. **Create account** (M view, C submit, `24-signup-create.png`). Pick Student / Tutor / Both, name, email, password, 18+ consent, "Create free account →". Then "check your email". Google sign-in is turned off (`src/pathwise/LoginModal.tsx:11-13`).
12. **Confirm email** (C). `/confirm-email` waits 2 s and routes by role (`src/routes/_app.confirm-email.tsx:77-81`). Student goes to `/onboarding/student`. "Both" goes to the tutor onboarding (`src/pathwise/roles.ts:66-70`).
13. **Student onboarding** (C; signed out it only opens the sign-in box, `15`). "Step 1 of 1. Welcome, <name>". Grade (6 to 12, University) and a required free-text "What's your goal?". Button "Continue to my roadmap →" (`src/routes/_app.onboarding.student.tsx:55-98`).
14. **Roadmap, signed in** (C). The page claims the guest roadmap from localStorage (`src/routes/_app.roadmap.tsx:187-203`). If localStorage is empty (other browser, other device), it silently sends the student to `/quiz` (`:149-156`).
15. **"Start here"** (C + L for the page, `26-library-with-roadmap.png`). Goes to `/library?subject&band&roadmapId&stage`. Live: "Courses at your level. You placed at Seedling." The Seedling shelf says "No courses on this shelf yet." Shelf counts for Math: Seedling 0, Spark 0, Builder 2, Sharpshooter 1, Mastermind 0. Library cards open the course page, which offers "Book a session" but no way to pick the course for the stage.
16. **"Choose your course"** (C). Goes to `/course-match?roadmapId&stage` (sign-in only, `src/routes/_app.course-match.tsx:79`). Header "<Stage> needs a <Level> course". "Your level ∩ Your tutors" cards. Course cards with "Choose this course" (enrols). Then "I've completed this course" (self-reported) unlocks "Mark stage complete" on the roadmap. With today's catalogue a Seedling student gets "No matching course yet" (`:605-640`).
17. **"See my matched tutors & courses"** (C; page itself L, `11-matches-direct.png`). Goes to `/matches` with no parameters, so the roadmap's subject and level are dropped. Live: "We found 2 verified tutors", ranked by a learning-style score the student never gave.
18. **Find a tutor quiz** (L, `08`, `09`, `10`). Eight questions: subject (8 options incl. Music, Art, Coding), goal, learning style, pace, time, experience level (Beginner/Intermediate/Advanced), frequency, budget. Results card, "View my matches →", "Retake the quiz". Live: Math → "No math tutors yet. Here are all 2 verified tutors", although one listed tutor teaches Algebra and has a Trigonometry course.
19. **Book a trial** (L up to step 2, `12`, `13`; C after). Stepper Type → Time → Timezone → Summary → Pay. Sign-in is only asked when pressing "Confirm booking" on the last step (`src/routes/_app.book.$tutorId.tsx:220-225`). After sign-up, only the tutor id is remembered, so the chosen slot is gone (`:125-133`).

---

## 3. Friction points (most severe first)

### P0

**[P0] Stage 1 cannot be completed for most students: no course exists at their level**
- Step: 15-16.
- What the student sees: "Requires a Seedling course". Start here → "No courses on this shelf yet." Choose your course → "No matching course yet".
- Why stuck: the roadmap gate needs a completed course at the stage's exact band (`src/routes/_app.roadmap.tsx:372-380`, DB trigger `roadmap_stages_course_gate`). Live Math shelf: Seedling 0, Spark 0, Mastermind 0. A Seedling student cannot pass stage 1 or 2, and no student can pass stage 5. The roadmap is a dead end on day one.
- Evidence: `$SHOTS/26-library-with-roadmap.png`; `src/routes/_app.course-match.tsx:605-640`; `src/pathwise/levels.ts:211-213`.
- Fix: until the catalogue covers every band, let a booked and attended tutor session (or a near-band course) satisfy the gate, and say so on the card.

### P1

**[P1] Two buttons on the same stage, two destinations, only one works**
- Step: 8, 15, 16.
- What the student sees: "Start here" (looks primary, has a play icon) and "Choose your course" (grey, with a lock icon, looks disabled).
- Why confused: "Start here" opens the library, which has no "use this course for my stage" action. Only "Choose your course" (course-match) can enrol and unlock. The one that looks disabled is the one that works.
- Evidence: `src/routes/_app.roadmap.tsx:742-754` and `:400-420` (Start here → `/library`), `:798-840` (Choose your course → `/course-match`), `src/routes/_app.library.tsx:331-388` (cards only link to the course page).
- Fix: one button per active stage, "Choose a course for this stage", going to `/course-match`; drop the lock icon.

**[P1] Every roadmap action needs an account, but the page says "Free to browse" and the box says "Welcome back"**
- Step: 10.
- What the student sees: clicking anything on the roadmap opens "Welcome back / Choose how you're signing in".
- Why confused: nothing before "Build my roadmap" or on the roadmap says an account is needed. A first-time student is greeted as a returning user and must find "Create account". The line under the CTA says "Free to browse · Book only when ready", which reads as "no account needed".
- Evidence: `src/lib/authGuard.ts:10-28`; `src/pathwise/LoginModal.tsx:21,37` (mode always starts at "signin"); `src/routes/_app.roadmap.tsx:852-869`; `$SHOTS/22-roadmap-start-here.png`.
- Fix: open the modal in sign-up mode from guest flows with "Create a free account to save your roadmap and pick courses", and state this on the result screen.

**[P1] Landing promises Math and English; the level check has no English**
- Step: 1-2.
- What the student sees: "Math and English tutors in Moldova", then six subjects (Sciences, Literature, History, Programming, Languages, Mathematics). "Languages" is general trivia (for example "Most spoken native language worldwide").
- Why confused: an English learner has no matching option and ends up in a quiz that does not test English.
- Evidence: `src/routes/_app.index.tsx:16-26`; `src/pathwise/data.ts:4-10,28-35,195-215`; `$SHOTS/02-quiz-subject.png`.
- Fix: show only Mathematics and English, with an English question bank.

**[P1] Two "8 questions" quizzes with clashing level words**
- Step: 17-18.
- What the student sees: after placing at "Seedling" in the level check, "Refine matches → Answer 8 questions to change your matches" leads to another quiz that asks "What's your experience level? Beginner / Intermediate / Advanced" and lists Music, Art, Coding, Test prep.
- Why confused: the student has already answered the level question. The two quizzes use different subject lists and level scales, and both are called "the quiz" ("Take the quiz", "Retake the tutor quiz").
- Evidence: `src/routes/_app.find-tutor.tsx:32-40,256-265,483-522`; `src/routes/_app.matches.tsx:403-413`; `src/routes/_app.library.tsx:169-176`.
- Fix: drop subject and level from the tutor quiz (take them from the roadmap) and call it "Tutor preferences", 5 questions.

**[P1] Find-a-tutor answers are lost when signed out, and its subject finds no tutors**
- Step: 18.
- What the student sees: "Your answers are saved locally. Sign up to keep them." Then "No math tutors yet. Here are all 2 verified tutors", with an Algebra tutor in the list.
- Why: the quiz saves to `pw_find_tutor_answers` but `/matches` reads `pathwise_find_tutor_answers`, so learning style (30% of the score) is never used. The subject is sent as `math`, but tutors store full names, so the filter finds nothing. `course-matching.ts` maps `math → Mathematics`; `/matches` does not. After sign-up the answers are never copied to the account, so course-match says "Take the tutor quiz" again.
- Evidence: `src/routes/_app.find-tutor.tsx:59,114-138,687-698`; `src/routes/_app.matches.tsx:107-110,120-136,378-383`; `src/pathwise/course-matching.ts:122-141`; `$SHOTS/10-matches-from-find-tutor.png`.
- Fix: use one storage key, map subjects with `canonicalSubjectFromTutorQuiz` on `/matches`, and upsert the local answers after sign-in.

**[P1] The roadmap's "matched tutors" CTA drops the roadmap**
- Step: 17.
- What the student sees: "See my matched tutors & courses →" leads to "We found 2 verified tutors", with no subject, level or course shown.
- Why confused: the button promises tutors and courses for this roadmap. The page gets no parameters and shows neither the level nor any course.
- Evidence: `src/routes/_app.roadmap.tsx:853-866` (`navigate({ to: "/matches" })`); `$SHOTS/11-matches-direct.png`.
- Fix: pass `subject` and the active stage's band, and send "courses" to `/course-match` for the active stage.

**[P1] The guest roadmap is lost if the confirmation email is opened elsewhere**
- Step: 11-14.
- What the student sees: after confirming on their phone's mail app, onboarding then "Continue to my roadmap" silently lands on `/quiz`.
- Why: the guest roadmap id lives only in the first browser's localStorage. `/confirm-email` does not claim anything. `auth.tsx` only claims on `/` or `/login`. The roadmap page claims the roadmap but never the diagnostic.
- Evidence: `src/routes/_app.confirm-email.tsx:18-81`; `src/pathwise/auth.tsx:113-117,261-284`; `src/routes/_app.roadmap.tsx:119-156,187-203`.
- Fix: put the roadmap id (or a guest token) in the sign-up `emailRedirectTo` URL and claim roadmap plus diagnostic on `/confirm-email`.

### P2

**[P2] The result is never explained or shown again**
- Step: 6, 8.
- What the student sees: "Seedling, 1 / 8 correct", "Tier 1", "80 XP". On the roadmap only "Seedling" remains.
- Why confused: the five level names are not explained (the blurbs in `BAND_META` exist but are not shown). "Tier" is jargon. XP is never used. Score, topic bars and weak topics disappear after "Build my roadmap" and cannot be found again.
- Evidence: `src/routes/_app.quiz.tsx:441-446,524-598`; `src/pathwise/levels.ts:44-50`; `src/routes/_app.roadmap.tsx:576-631`.
- Fix: on the result and on the roadmap's level card, show "Level 1 of 5: Foundations from scratch" and the weak topics.

**[P2] The roadmap ignores what the test found**
- Step: 8.
- What the student sees: weak in Geometry and Reasoning, but stages are a fixed template per level. The goal only renames stage 5 ("Pass an exam", still with Quadratics/Systems/Polynomials).
- Why confused: the roadmap does not look personal, and stage 5's title does not match its skills.
- Evidence: `src/pathwise/roadmap-gen.ts:237-246`; mock stage insert in `journey2.log`.
- Fix: order or label stages by `wrong_topics`, and keep the template title on stage 5 with the goal shown separately.

**[P2] Stage level climbs one band per stage, whatever the start**
- Step: 8.
- What the student sees: Seedling → Spark → Builder → Sharpshooter → Mastermind. A Sharpshooter student needs Mastermind for stages 2 to 5.
- Why confused: a beginner is asked to reach the top level in five steps. Stronger students repeat the same band four times.
- Evidence: `src/pathwise/levels.ts:211-213`; `src/pathwise/api.ts:188-199`.
- Fix: spread the base band to the goal's target band instead of `base + stage - 1`.

**[P2] Clicking a stage opens a session-log form, not stage details**
- Step: 9.
- What the student sees: "Session log", a form asking for a tutor's name and duration. Locked stages open it too. Entries are kept in this browser only.
- Why confused: the card says "Open for details", but there are no details: no explanation of what to learn or how to unlock.
- Evidence: `src/pathwise/StageDetailModal.tsx:38-99`; `src/routes/_app.roadmap.tsx:728-734,796`; `$SHOTS/21-roadmap-stage-modal.png`.
- Fix: make the modal show the stage's skills, the required level and the one next action; move session logging to `/sessions`.

**[P2] "Matched tutors" means three different things**
- Step: 8, 16, 17.
- What the student sees: "1 verified tutor for Mathematics… for your next step at Seedling" on the roadmap, "2 verified tutors" on /matches, "N matched" on course-match.
- Why confused: the roadmap panel ignores the band entirely (`fetchMatchedTutors(subject)`), so "at Seedling" is not true. /matches uses its own score. Course-match uses a score threshold.
- Evidence: `src/pathwise/MatchedTutorsPanel.tsx:30-41,58-66`; `src/pathwise/api.ts:413-429`; `src/pathwise/course-matching.ts:115-192`.
- Fix: one `getMatchedTutors` used by all three, and drop "at <level>" until it filters by level.

**[P2] Course-match labels the stage's band as "Your level"**
- Step: 16.
- What the student sees: for stage 3, a Seedling student sees "Your level: Builder".
- Evidence: `src/routes/_app.course-match.tsx:286-287`.
- Fix: label it "This stage needs" and show the student's own level next to it.

**[P2] Course completion is a self-report button**
- Step: 16.
- What the student sees: "I've completed this course", one click, then "Course complete. This stage is unlocked."
- Why confused: nothing explains how to take the course (lessons, sessions, tutor). One click unlocks the stage, so the gate means little.
- Evidence: `src/routes/_app.course-match.tsx:204-219,364-378`.
- Fix: say what "complete" means (for example, the tutor confirms it or N sessions are done), or tie it to finished sessions.

**[P2] Onboarding repeats the goal question and throws the answer away**
- Step: 13.
- What the student sees: "Step 1 of 1", a required free-text goal, after already picking a goal in the level check.
- Why: only `grade` and `onboarding_completed` are saved. Live `profiles` has no goal column. `grade` is read nowhere.
- Evidence: `src/routes/_app.onboarding.student.tsx:30-33,82-90`; live schema.
- Fix: prefill from the roadmap's goal and drop the textarea, or save it where a tutor can see it.

**[P2] "Both" sends a student into the tutor onboarding**
- Step: 12.
- Evidence: `src/pathwise/roles.ts:66-70` (1,531-line `_app.onboarding.tutor.tsx`).
- Fix: run student onboarding first, then offer tutor setup.

**[P2] Booking asks for sign-in at the last step and forgets the slot**
- Step: 19.
- What the student sees: Type, Time, Timezone, Summary, then the step "Pay" (nothing is charged). "Confirm booking" opens sign-in. After sign-up and onboarding, the booking restarts at step 1.
- Evidence: `src/routes/_app.book.$tutorId.tsx:88,125-133,220-225,814-829`.
- Fix: say "You'll need a free account to confirm" on step 1, save the slot in the pending-booking key, and rename "Pay" to "Confirm".

**[P2] Find-a-tutor results show "—" for questions the student answered**
- Step: 18.
- What the student sees: "Pace —", "Budget —" when the slider was left at its default.
- Evidence: `src/routes/_app.find-tutor.tsx:201,233` (default shown but never stored), `:674,680`; `$SHOTS/09-find-tutor-results.png`.
- Fix: store the default value when "Continue" is pressed.

**[P2] Retaking silently starts a new roadmap**
- Step: 6-8.
- What the student sees: no "Retake" button. Going back to "Level check" starts fresh; "Build my roadmap" makes a new roadmap at stage 1. The old roadmap, its enrollments and completed stages disappear from view without warning.
- Evidence: `src/routes/_app.quiz.tsx:92-97,182-252`; `src/routes/_app.roadmap.tsx:119-138`.
- Fix: on a retake by a student who has a roadmap, ask "Replace your roadmap or keep it?" and show the old level next to the new.

**[P2] Test accounts shown as verified tutors**
- Step: 8, 17.
- What the student sees: tutors named "TEST" (tags Accounting, Architecture, Art) and "INISTORICA1" at 0 MDL/hr.
- Evidence: `$SHOTS/10-matches-from-find-tutor.png`, `$SHOTS/20-roadmap-1280.png`.
- Fix: unverify or hide test accounts on production.

### P3

**[P3] "Try demo mode" from the student story opens a tutor dashboard for a software engineer**
- Evidence: `src/routes/pathwise.demo.tsx:61` (`initialView` defaults to "tutor"); `$SHOTS/18-demo.png`.
- Fix: link the landing's student section to `/pathwise/demo?as=student` with Math/English sample data.

**[P3] `/roadmap` with no roadmap silently bounces to `/quiz`**
- Evidence: `src/routes/_app.roadmap.tsx:149-156`.
- Fix: show "You don't have a roadmap yet. Take the 8-question level check."

**[P3] A shared `/roadmap?roadmapId=…` link is ignored**
- The page reads localStorage first and never reads `search.roadmapId`.
- Evidence: `src/routes/_app.roadmap.tsx:98,119-145`.
- Fix: read the search param first.

**[P3] On a phone, stage 1 sits below the tutor panel**
- About two screens of scrolling before the first action.
- Evidence: `$SHOTS/25-roadmap-375.png`.
- Fix: on narrow screens, put the active stage card first.

**[P3] `/auth/choose-role` is unreachable**
- It is only reached after Google sign-in, which is off. Its copy says "You're signed in with Google" and "you can't change it later".
- Evidence: `src/routes/auth.choose-role.tsx:133`; `src/pathwise/LoginModal.tsx:11-13`.
- Fix: none needed now; keep in mind when Google is turned on.

---

## 4. What happens to the test results

### During the quiz (client only)
- Answers, XP, streak, level, band and per-topic bands live in an in-memory store (`src/pathwise/store.ts:4-49`). Nothing is saved while answering.
- The store is wiped when `/quiz` mounts (`src/routes/_app.quiz.tsx:92-97`). A reload or a revisit loses an unsaved result.
- If the student never presses "Build my roadmap", nothing is stored anywhere.

### On "Build my roadmap" (DB writes, one click)
`handleBuildRoadmap` (`src/routes/_app.quiz.tsx:182-252`) does three inserts in order:

1. `diagnostic_results` via `saveDiagnosticResult` (`src/pathwise/api.ts:113-133`).
   Columns written: `user_id` (null for guests), `subject` (display name, e.g. "Mathematics"), `goal` (`exam|grades|gaps|advanced|work`), `score` (correct count of 8), `level` (Seedling…Mastermind), `level_band` (1-5), `level_id` (`mathematics.L1`), `topic_bands` (jsonb, e.g. `{"Algebra":1}`), `xp_earned`, `wrong_topics` (text[]).
   Not stored: the individual answers, question ids, tier per question.
2. `roadmaps` via `createRoadmap` (`src/pathwise/api.ts:159-184`): `user_id`, `diagnostic_id`, `subject`, `goal`, `current_stage = 1`, `total_stages = 5`, `level_band`, `level_id`.
3. `roadmap_stages`, five rows (`src/pathwise/api.ts:188-205`): `stage_number`, `title`, `skills`, `status` (`active` for 1, else `locked`), `required_level_band = base + stage - 1` capped at 5, `required_level_id`.

Then `localStorage.pathwise_roadmap_id` and `localStorage.pathwise_diagnostic_id` are set (`src/routes/_app.quiz.tsx:238-249`).

Exact payloads captured from the mock run are in `journey2.log`.

### Retakes: append, never overwrite
- Live DB has no unique index on `diagnostic_results.user_id` or `roadmaps.user_id` (only primary keys). Each retake plus "Build my roadmap" appends a new diagnostic and a new roadmap with five new stages.
- localStorage is overwritten with the newest ids.
- The roadmap page shows the localStorage id first, else the newest roadmap by `created_at` (`src/routes/_app.roadmap.tsx:119-138`). Old roadmaps, their stage progress and their `course_enrollments` (keyed to the old `roadmap_stage_id`) stay in the DB but are no longer shown anywhere.
- Contrast: the tutor quiz's `user_learning_profiles` is upserted on `user_id` (unique index `user_learning_profiles_user_id_key`), so it overwrites (`src/routes/_app.find-tutor.tsx:130-132`). It is saved only if the student is signed in when reaching its results.

### Guest claim after sign-up (three code paths, not equal)
- `LoginModal.routeAfterAuth` (email sign-in): claims both rows by id (`src/pathwise/LoginModal.tsx:62-84`).
- `auth.tsx` `claimAnonymousRecords`: claims both, but only when the SIGNED_IN event fires on `/` or `/login` (`src/pathwise/auth.tsx:113-117,261-284`).
- Roadmap page: claims the roadmap only (`src/routes/_app.roadmap.tsx:187-203`). `src/lib/claimRoadmap.ts` does the same but is never called.
- `/auth/callback` (Google, currently off): claims the roadmap by id, then every anonymous diagnostic with the same subject created in the last five minutes, which can include other guests' results (`src/routes/auth.callback.tsx:46-57`).
- `/confirm-email` (the normal email sign-up path) claims nothing (`src/routes/_app.confirm-email.tsx:18-81`). So after the usual sign-up, the roadmap gets claimed later by the roadmap page, but the `diagnostic_results` row keeps `user_id = null` forever. It stays linked only through `roadmaps.diagnostic_id`.

### Live RLS on these tables (from `pg_policies`)
- `diagnostic_results`: anon can insert rows with `user_id is null` and read every row with `user_id is null`. Authenticated users read their own rows and can claim any row with `user_id is null`.
- `roadmaps`: anyone can insert. Anon and authenticated can read every unclaimed roadmap. Authenticated can claim any unclaimed roadmap.
- `roadmap_stages`: anyone can insert (`with check true`). **Anon can read every stage of every roadmap, claimed or not** (`anon_select_stages`, `qual true`). Authenticated can update stages of unclaimed roadmaps.
- No policy lets a tutor read `diagnostic_results`, `roadmaps` or `roadmap_stages`.
- `course_enrollments`: tutors can read enrollments in their own courses, which include `required_level_id` and `match_kind`.

### Is the result shown back to the student?
- Result screen: yes, once (level, score of 8, XP, one summary sentence, per-topic bands).
- Afterwards: only the level name and band. `score`, `topic_bands`, `wrong_topics` and `xp_earned` are written but never read by any page. `getLatestDiagnostic` (`src/pathwise/api.ts:138-149`) is never called. The roadmap reads `diagnostic_results` only to recover a missing band (`src/routes/_app.roadmap.tsx:343-366`).
- No history of past attempts exists in the UI.

### Does anything reach tutors?
- No. No tutor-side route (`dashboard.*`, `_app.tutor.*`, `_app.sessions.*`) or the inbox reads `diagnostic_results`, `roadmaps` or `user_learning_profiles`. RLS would block it anyway.
- Booking sends no level or roadmap data: the `book_session` RPC takes tutor, times, duration, timezone, type, amount, meeting URL and recurrence only (`src/routes/_app.book.$tutorId.tsx:266-277`).
- Onboarding's grade is saved to `profiles.grade` but read nowhere. The onboarding goal text is not saved at all.
- The only level signal a tutor could get is a course enrollment (`course_enrollments.required_level_id`, `match_kind`), and no tutor page shows it today.

---

## 5. Open questions for the product owner

1. Is PathWise Math and English only? If yes, should the level check and tutor quiz drop the other subjects, and who writes the English question bank?
2. Until the catalogue has courses at every band, what should unlock a stage: a booked session, a tutor's sign-off, a near-band course, or nothing (stages as guidance only)?
3. Should the level check require an account before "Build my roadmap", or keep guest roadmaps? Guest rows today are readable by anyone and claimable by any signed-in user.
4. Should tutors see a student's level, weak topics and goal when the student books a trial? If yes, through which table and with what consent?
5. On a retake, should the new result replace the roadmap, sit beside it, or only update the level?
6. Is the second quiz (Find a tutor) still wanted, or should its useful questions (style, schedule, budget) move into onboarding?
7. What does "complete a course" mean: a student's click, a tutor's confirmation, or a number of attended sessions?
8. Should the "TEST" and "INISTORICA1" tutor accounts stay verified on production?
