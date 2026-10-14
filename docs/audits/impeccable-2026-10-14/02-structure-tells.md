# 02 · Structure and layout tells

Impeccable audit, 2026-10-14. Lens: page structure and layout (card grids, nested cards, eyebrows, section numbers, hero metrics, modals, spacing rhythm) on the landing (`_app.index.tsx`, `components/landing/*`) and the main app pages: quiz, find-tutor, matches, tutor profile, course page, roadmap, library, booking, sessions, tutor dashboard, demo. The detector is not vendored, so this came from an AST scan (bordered containers nested in bordered containers; `label-caps` siblings directly above `h1`–`h3` or display-styled titles), a grep sweep for numbers in copy, and reading every hit in context. Pills, buttons, inputs and chips inside a card are controls, not nested cards, and are not counted.

Overlap with [01-visual-tells.md](01-visual-tells.md): the landing eyebrows (01 P1-1), the hero corner stats (01 P1-2) and the app kickers on roadmap, library, demo, matched-tutors and find-tutor (01 P2-1) are already written up there. They appear below only in the inventory, with a cross-reference, so the fix lands once.

## Verdict

**The landing's structure is mostly earned. The app pages are where the template shows, and some of the numbers are invented.** The landing uses hairline rows, one deck and a real roadmap sequence, not a card grid. The app pages fall back to "everything in a bordered box, a caps label over every title, one 16 or 24px gap between all of it". Four things matter most:

1. **Invented numbers shown as fact.** A tutor's "across N countries" is computed from their student count. The roadmap's "8–12 weeks · 3–4 sessions/week" is the same literal for every student. "94% accuracy" has no source.
2. **The booking flow has five steps, and two of them hold nothing**: a pre-filled timezone select, and a "Payment" step that says nothing is charged.
3. **The tutor dashboard is ten equal boxes at one 24px interval**, with two headings per panel. The one panel a tutor acts on ("Next up") sits under the earnings chart.
4. **The tutor profile shows two filled "Book" buttons with different labels in one view**, and turns the tutor's headline into an eyebrow above their name.

Worst pages, in order: **tutor dashboard**, **booking**, **tutor profile**, **roadmap**, then the **landing copy** (one slogan said four times).

Severity count: P0 × 2 · P1 × 5 · P2 × 7 · P3 × 4.

## Sweep counts

| # | Tell | Instances | Verdict |
|---|---|---|---|
| 1 | Grid or wall of identical boxes as page structure | Dashboard 10 boxes (`dashboard.index.tsx:284–346`), demo tutor view ~12 (`pathwise.demo.tsx:248–455`), course overview 4 (`_app.courses.$slug.tsx:557–620`), session detail 6 (`_app.sessions.$id.tsx:255–450`), landing StepDeck 4 icon+heading+text cards (`StepDeck.tsx:193–222`). | Walls: P1/P2. Catalog grids are fine (library, matches, find-tutor answer options, demo choice pair). |
| 2 | Cards inside cards | 7 verified: `_app.quiz.tsx:395→404`, `_app.tutor.$tutorId.tsx:328→385`, `_app.book.$tutorId.tsx:811→822`, `_app.book.$tutorId.tsx:601→681`, `StageDetailModal.tsx:36→51`, `MatchCard.tsx:49→121`, `dashboard.index.tsx:635→652` (5 bordered bars). | P2/P3. The book DST note (`:681`) is a real alert, so it is kept. |
| 3 | Eyebrow / kicker directly above a heading | 32 in scope. 25 are wrong: 24 pure decoration, plus the tutor headline (`tutor.$tutorId.tsx:361`), which is real information in eyebrow form. 7 carry real information (stage numbers, breadcrumbs, a category tag). Full table at the end. | See P1-3, P1-5, P2-6. Landing and kickers: 01 P1-1, P2-1. |
| 4 | Section numbers with no sequence | find-tutor `01`…`08` duplicates "Question N of 8" (01 P2-1). StepDeck "Step 01" + "Step 1 of 4" counter (real sequence, numbered twice). Roster 01/02/05, roadmap STAGE 01…N and the session-log title are real sequences. | Only the find-tutor kickers are a tell. |
| 5 | Hero metrics with no context, or untrue | "94% accuracy" ×2, "3 min" ×4 against "about two minutes" ×1, "across N countries", "Estimated journey" block, demo KPI deltas, "in 60 seconds". | P0 / P1 / P3 |
| 6 | Modal where no interruption is needed | 6 `Dialog` uses. 2 not needed: roadmap stage-complete (`_app.roadmap.tsx:915`) and stage session log (`StageDetailModal.tsx:34`). LoginModal, ConfirmationModal, ExitDemoModal and the avatar-crop dialog protect real focus. | P2 |
| 7 | Spacing rhythm | Landing Statement puts 96px between a heading and its own sentence (`Statement.tsx:18`). Dashboard uses `mt-6` ×4 with no larger interval. Session detail uses `mt-4` between all 7 blocks. | P1 / P2 |

---

## P0: users are told something untrue

### [P0-1] "Taught N students across N countries" is computed from the student count
- **Location:** `src/routes/_app.tutor.$tutorId.tsx:188` `setCountries(Math.max(1, Math.min(studentIds.size, Math.round(studentIds.size / 3 + 1))));` rendered at `:763–773` in a bordered box: `Taught {studentCount.toLocaleString()} students` / `across {countries} {countries === 1 ? "country" : "countries"}`.
- **Tell:** #11 (a stat that does not explain anything). craft-floor.md:26 (hero-metric template).
- **What:** No country data is read anywhere. A tutor with 9 students is shown as teaching "across 4 countries". The student count in the same box already appears in the hero stats (`:386` `<Stat value={studentCount.toString()} label="Students" />`).
- **Why:** This is a fabricated claim about a real person, on the page where a parent decides to book. PathWise serves Moldova, so a country count says nothing useful even if it were true.
- **Fix:** Delete the social-proof block `:763–773`, the `countries` state at `:140` and the setter at `:188`. Drop the `Globe2` import if unused.

### [P0-2] "94% accuracy" and "3 minutes" are stated as measured facts
- **Location:** `src/components/landing/StepDeck.tsx:15–16` `title: "Level check in 3 minutes"`, `body: "…pinpoints exactly what you know — and what you don't — with 94% accuracy."` · `PortalHero.tsx:109,112` "3 min avg", "94% accuracy" (01 P1-2) · `StageRoster.tsx:36` "3 min" · `_app.quiz.tsx:36` meta "3-minute" · against `_app.library.tsx:172` "The quiz takes about two minutes."
- **Tell:** #11. craft-floor.md:26.
- **What:** Nothing in the repo measures accuracy or completion time. "avg" implies a measurement that does not exist. The site gives two different durations for the same quiz. The one countable fact is that the level check is 8 adaptive questions (`adaptive-quiz.ts:19` `ADAPTIVE_LENGTH = 8`), after a subject pick and a goal pick.
- **Why:** An unsupported percentage on a product whose promise is "find exactly where you stand" is a credibility risk, not decoration. The 2026-10-12 live-site audit (06, line 317) flagged the 94% too. It is still in the deck copy.
- **Fix:** In `StepDeck.tsx:16`, delete ", with 94% accuracy". Pick one duration and state it as a count: `StepDeck.tsx:15` "Level check: 8 questions", `StageRoster.tsx:36` "3 min" → "8 questions", `_app.library.tsx:172` "about two minutes" → "8 questions". This is factual copy, so the owner should confirm the wording.

---

## P1: the template shows on a primary task

### [P1-1] The roadmap's "Estimated journey" is the same literal for every student
- **Location:** `src/routes/_app.roadmap.tsx:633–648`: `ESTIMATED JOURNEY` over `8–12 weeks`, `3–4 sessions / week`, `~45 min per session`, all hard-coded.
- **Tell:** #11 (numbers with no basis). craft-floor.md:26.
- **What:** A Beginner with 5 stages left and an Advanced student with 1 left see the same plan. It sits under the real progress figure (`:598` `{done} / {total} stages`), so it borrows that figure's credibility.
- **Why:** A roadmap is the product's personalised promise. A fixed estimate dressed as a computed one breaks it at the place the student checks most.
- **Fix:** Delete `:633–648` (the divider and the block). The progress bar already says where the student is. If an estimate is wanted later, compute it from `total - done` and say how.

### [P1-2] Booking takes five steps, and two of them hold nothing
- **Location:** `src/routes/_app.book.$tutorId.tsx:88` `const STEPS = ["Type", "Time", "Timezone", "Summary", "Pay"]`. Step 3 (`:698–745`) is one pre-filled `<select>` ("Your timezone (auto-detected)") inside a `pw-card`. Step 5 (`:805–860`) is a `pw-card` that says "Nothing is charged here", with a nested bordered box (`:822`, `p-4 border border-[var(--pw-border)] bg-[var(--pw-surface-2)]`) that repeats the total already shown on the Summary step (`:779–787`).
- **Tell:** #9 (card in card). distill.md, Interaction: "Remove steps: Can the flow lose a step?"
- **What:** A Moldovan student booking a Moldovan tutor confirms a timezone that is already correct, then reads the price twice on two screens.
- **Why:** This is the conversion path. Every empty step is a chance to abandon, and the nested total box is the card-in-card tell on the money screen.
- **Fix:** `STEPS = ["Type", "Time", "Confirm"]`. Move the timezone `<label>`/`<select>` and the "Your time / Tutor's time" lines (`:705–741`, without the `pw-card` wrapper) to the bottom of the Time step, shown only when `tzMismatch` or when the user taps "Change timezone". Put the Pay step's sentence ("PathWise is free during the beta: you pay your tutor directly…") under the Summary card's Total row. Replace Summary's `<NavBar>` with the Pay step's Back + `handleConfirmAndPay` buttons. Delete the Pay step and the box at `:822–834`.

### [P1-3] The tutor dashboard is ten equal boxes, two headings each, at one interval
- **Location:** `src/routes/dashboard.index.tsx`. Rhythm: `:239` `mt-4`, then `mt-6` at `:846` (quick actions), `:284` (metrics) and `:324` (panels). No larger interval. Double headings: `:477` "Earnings" + range title, `:557–558` "Upcoming sessions" + "Next up", `:636–638` "Lead funnel" + "Conversion", `:680–682` "Profile" + "Completeness", `:753–755` "Reviews" + "Latest feedback", `:814–816` "Last 30 days" + "At a glance". Order: `:325–327` EarningsChart takes the first wide slot, and `:332–334` UpcomingSessions sits under it.
- **Tell:** #8 (identical cards, important items not given more space). craft-floor.md:24 and :27. layout.md › Rhythm ("one spacing value repeated until everything has equal weight").
- **What:** Four metric cards and six panels, all `pw-card p-6`, all the same weight. Every panel title is a `div`, not a heading, so the page has an `h1` and no `h2`. The earnings chart and the breakdown both read "Last 30 days".
- **Why:** On an Operate surface the squint test should show the next action first. For a tutor, that is the next session.
- **Fix:**
  1. Swap the two cells at `:325–327` and `:332–334`, so UpcomingSessions takes the `md:col-span-2 lg:col-span-2` slot first.
  2. One `<h2>` per panel, with the eyebrow line deleted: "Earnings, last 30 days / 12 weeks / 12 months" (`:477–484`), "Next up" (`:557`), "Lead funnel" (`:636–639`), "Profile completeness" (`:680–683`), "Latest reviews" (`:753–756`), "Last 30 days" (`:814–817`).
  3. Rhythm: welcome + quick actions stay tight (`:846` `mt-6` → `mt-4`). Metrics `:284` and panels `:324` go `mt-6` → `mt-12`. `gap-4` and `gap-6` stay inside the groups.
  4. `:846` `grid grid-cols-2 sm:grid-cols-4` holds 3 buttons and leaves an empty cell. Use `flex flex-wrap gap-2`.
- The eyebrow pairs were first flagged on 2026-10-12 (apple-design 02, line 344) and are still in the code.

### [P1-4] The landing says the same three lines two to four times, and the Statement detaches its own sentence
- **Location:** "Learn deliberately": `Statement.tsx:10` (eyebrow), `StepDeck.tsx:143–145` (h2), `StepDeck.tsx:148` (body), `Footer.tsx:37`. "Find exactly where you stand and the path to where you want to be": `Statement.tsx:15–16` (h2), `Footer.tsx:37`. "No filler, no guesswork": `Statement.tsx:19–20`, `StepDeck.tsx:21`. Spacing: `Statement.tsx:10` `mb-8` above the h2 (32px), `:18` `mt-24` below it (96px).
- **Tell:** #14 (generic copy). distill.md, Content: "Remove redundant copy… say it once". craft-floor.md:12 ("tight groups… more space above a heading than below it").
- **What:** The Statement section is a full viewport (`min-h-screen`) holding an eyebrow, a sentence and a second sentence that is copied word for word from deck step 2. That second sentence sits 96px below its heading, three times the gap above the heading, so it reads as a separate element.
- **Why:** Repeating a slogan is filler, and filler on a persuade page dilutes the one line that should land.
- **Fix:** Keep the Statement section, because JourneyLine waypoints `S`/`H` (`JourneyLine.tsx:67–69`) anchor to it. Delete its eyebrow (`:10`, also 01 P1-1) and its body paragraph (`:18–21`), so it becomes one sentence. In `StepDeck.tsx:148`, cut "Everything you need to learn deliberately:" so the line starts "A level check, a roadmap, the right tutor, and every session tracked." Delete `Footer.tsx:36–38`, since its h2 "No guesswork. No wasted sessions." already closes the page.

### [P1-5] The tutor profile has two filled "Book" buttons with different names, and the headline is an eyebrow
- **Location:** `src/routes/_app.tutor.$tutorId.tsx:404–409` `<Button …>` (default variant = filled, `button.tsx:12`) "Book a call", and `:788–793` `<Button … className="w-full mt-4">` "Book a session". Both go to `/book/$tutorId`. Headline: `:361` `<p className="label-caps text-pw-accent order-first mb-4">{tutor.headline}</p>`.
- **Tell:** craft-floor.md:27 (eyebrow). Brief: one filled button per view.
- **What:** On `lg`, the hero card and the sticky price box are both in the first viewport, so two filled buttons and two Message buttons show at once. `order-first` lifts the tutor's own headline above their name as tracked caps in accent orange.
- **Why:** Two names for one action make the visitor wonder whether a "call" differs from a "session". The headline is real information, but in eyebrow form it competes with the name.
- **Fix:** Add `lg:hidden` to the hero CTA wrapper at `:403`, so the sticky aside carries Book + Message on desktop and the hero carries them on phones, where the aside drops below the content. Rename `:408` to "Book a session" and drop the `Phone` icon. At `:361`, use `<p className="mt-2 text-[0.9375rem] text-[var(--pw-ink-2)]">` (no `order-first`, no caps), so the headline sits under the name as a sentence.

---

## P2: noticeable, worth the next pass

### [P2-1] The tutor profile's stats are a box of boxes inside the hero box, and show blanks
- **Location:** `src/routes/_app.tutor.$tutorId.tsx:385` `grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--pw-border)] border border-[var(--pw-border)]` inside the bordered hero `:328`. Cells come from `Stat` (`:849–858`): big Syne number + caps label.
- **Tell:** #9, #11. craft-floor.md:24, :26.
- **What:** A new tutor shows "0 Students · 0 Courses · — Experience · — Avg rating · 0". That is four boxes of nothing above the bio.
- **Fix:** Delete the grid and the `Stat` component. Add the non-empty values to the existing meta row at `:363` as plain text: `{studentCount} students`, `{courses.length} courses`, `{years}y experience`, `★ {ratingAvg} ({reviews.length})`, each rendered only when it is above zero.

### [P2-2] Completing a stage opens a modal to say "Stage complete"
- **Location:** `src/routes/_app.roadmap.tsx:913–942`: `<Dialog>` with a 48px target icon, "Stage {n} Complete!", "+{xp} XP earned", "Next: …", and a filled "Continue →".
- **Tell:** craft-floor.md:28 ("a modal for a task that needs neither interruption nor protected focus"). distill.md: "Inline actions: Replace modal flows with inline editing".
- **What:** The student pressed "Mark stage complete". The card already turns to Completed and the next card turns active behind the modal. The comment at `:913` says the dialog replaced a toast that vanished too fast. That is a real need, but it calls for a persistent message, not a modal.
- **Fix:** Delete the `Dialog` block. On the card where `overlay?.stageNumber === s.stage_number`, render `<p role="status" className="mt-4 text-[0.875rem]">Stage complete. Next: <strong>{overlay.nextTitle}</strong></p>` and clear it on the next action. It stays until it has been read, is announced, and blocks nothing. Drop the `Dialog*` imports if unused.

### [P2-3] The stage session log is a modal holding a card holding a form
- **Location:** `src/pathwise/StageDetailModal.tsx:34–36` (`DialogContent` with `pw-card`), `:51–53` `<form className="mt-6 pw-card p-4" style={{ background: "var(--pw-surface-2)" }}>`. Opened from every stage card (`_app.roadmap.tsx:760`, hint "Tap to view details & log sessions" at `:827`).
- **Tell:** #9. craft-floor.md:24 ("nested cards are always wrong"), :28.
- **Fix (minimum):** `:51–53` → `className="mt-6 border-t border-[var(--pw-border)] pt-6"`, and delete the `style`. **Fix (structural, owner call):** render the log as a disclosure under the clicked stage card, with `aria-expanded` on the stretched button at `roadmap.tsx:758`, instead of a modal. Logging a session is part of reading the roadmap, not an interruption.

### [P2-4] The course page's Overview is a column of bordered boxes
- **Location:** `src/routes/_app.courses.$slug.tsx:557` (What you'll learn), `:575` and `:585` (Prerequisites / Who this is for, two boxes in a grid), `:597` (About the tutor). All use `border border-[var(--pw-border)] bg-[var(--pw-surface)] p-6`. "About this course" (`:546`) has no box, so the flow alternates boxed and unboxed. Reviews tab: `:734`, `:769` more boxes.
- **Tell:** #8, #9-adjacent. distill.md: "Remove unnecessary cards: Cards aren't needed for basic layout".
- **What:** The marketplace-course template: every block is a box, so none leads. This is a Read surface, and boxes break the reading line.
- **Fix:** Delete `border border-[var(--pw-border)] bg-[var(--pw-surface)] p-6` from `:557`, `:575`, `:585` and `:597`. The `space-y-8` on `TabsContent` (`:544`) and each `h2 mb-4` already separate them. Turn the two `label-caps` `h3`s (`:576`, `:586`) into `font-display text-xl` `h3`s to match their siblings.

### [P2-5] The session detail page is titled "Session" and stacks six boxes at 16px
- **Location:** `src/routes/_app.sessions.$id.tsx:249` `<h1 …>Session</h1>`. Boxes: `:255–258` two `PersonCard`s, `:260` details `pw-card`, `:365`, `:402` and `:411` `pw-card`s. Every block opens with `mt-4`.
- **Tell:** #8. layout.md › Rhythm, Reading order.
- **What:** The facts a person opens this page for (when, with whom) are row 1 of the third box. The heading carries no information. One 16px interval makes the actions, the details and the feedback form read as equals.
- **Fix:** Make the `h1` the date and time (the `start.toLocaleString(…)` already built at `:263–270`), with "with {other person's name}" under it. Replace the two `PersonCard`s with that line. Render the `Row` list as a hairline `divide-y` list without `pw-card`. Use `mt-8` between groups (details / tracker + actions / notes / feedback) and keep `mt-2`/`mt-4` inside them. The sessions list (`_app.sessions.index.tsx:113`) already uses hairline rows, so this matches it.

### [P2-6] Eyebrows not covered in 01, in app surfaces
- **Location:** `_app.find-tutor.tsx:692` "Your learning profile" above "The {trait}" (the sticky bar at `:146` already says "Your profile") · `pathwise/ExitDemoModal.tsx:29` "Ready for the real thing?" above the title "Start your own journey" · `pathwise.demo.tsx:599` "You're in demo mode" above "Ready to make it real?" (the DemoBar already says Demo) · the 6 dashboard pairs in P1-3.
- **Tell:** #4. craft-floor.md:27 (a ban: "delete the label and let the heading speak").
- **Fix:** Delete those three `label-caps` lines. The dashboard pairs are fixed in P1-3.

### [P2-7] The quiz intro nests a box in its card, and the quiz shows XP twice
- **Location:** `src/routes/_app.quiz.tsx:404–413`: a bordered `surface-2` box with a "Why it matters" label, inside the intro `pw-card` (`:395`). XP: the fixed indicator `:316–325` (shown during `quiz` and `intro`) and the in-card pill `:440–442`.
- **Tell:** #9. distill.md: "Remove redundancy".
- **Fix:** Replace `:404–413` with `<p className="mt-6 text-[0.8125rem] text-[var(--pw-ink-2)]">Your level decides which of your matched tutors' courses unlock each stage of your roadmap.</p>`. Delete the in-card XP pill `:440–442`, because the fixed indicator also carries the streak.

---

## P3: polish

### [P3-1] The match card boxes its featured course
- **Location:** `src/pathwise/MatchCard.tsx:121` `mt-4 flex items-center gap-4 pw-border p-2`, inside `pw-card` `:49`.
- **Fix:** Drop `pw-border p-2`. The thumbnail and the "Featured course" label already group it.

### [P3-2] The landing deck is the icon+heading+text card template, numbered twice
- **Location:** `src/components/landing/StepDeck.tsx:197–221` (four same-size cards: "Step 0N", icon, h3, body) and the counter `:234–235` "Step {front + 1} of {steps.length}".
- **Tell:** #8. craft-floor.md:24.
- **What:** The stack is the landing's one authored move, so it stays. Inside it, the cards are the template, and the sequence is numbered in two formats ("Step 01" and "Step 1 of 4").
- **Fix:** Delete the `Step 0N` span at `:208–210`. The counter already names the step and is the `aria-live` region. Whether the deck should become an ordered hairline list like StageRoster is an owner call.

### [P3-3] The demo invents its KPI deltas and asks for signup twice in a row
- **Location:** `src/routes/pathwise.demo.tsx:283` `delta="+18% MoM"`, `:284` `"+12 this month"`, `:290` `value="65%" delta="+5pp vs avg"` (literals, not from `data`). `:100–101` `<PersistentSignupLink />` directly above `<ConvertCTA />`. `_app.demo.tsx:46` "in 60 seconds", against `:50` "Your demo session lasts 60 minutes".
- **Tell:** #11, #8 (the tutor demo is about 12 `pw-card` boxes).
- **Fix:** Derive the deltas from `data.earnings`, or delete the `delta` line in `Kpi` (`:587`). Delete `:100` (PersistentSignupLink). In `_app.demo.tsx:46`, drop "in 60 seconds".

### [P3-4] The lead funnel bars are bordered boxes inside a card
- **Location:** `src/routes/dashboard.index.tsx:652` `relative h-9 overflow-hidden bg-[var(--pw-surface-2)] border border-[var(--pw-border)]`, ×5 inside `pw-card` `:635`.
- **Fix:** Drop `border border-[var(--pw-border)]`. The `surface-2` track already reads as the bar's container.

---

## Eyebrow inventory (label-caps directly above a heading or display title)

| Location | Text | Carries real info? | Action |
|---|---|---|---|
| `Statement.tsx:10` | Learn deliberately | No (repeats StepDeck h2) | Delete (01 P1-1, P1-4) |
| `StepDeck.tsx:141` | How it works | No | Delete (01 P1-1) |
| `StageRoster.tsx:16` | Your roadmap | No | Delete (01 P1-1) |
| `_app.roadmap.tsx:569` | YOUR ROADMAP | No | Delete (01 P2-1) |
| `_app.library.tsx:206` | Course Library | No | Delete (01 P2-1) |
| `_app.demo.tsx:44` | Live Demo | No | Delete (01 P2-1) |
| `_app.find-tutor.tsx:753` (×8 via `:271…:605`) | 01 … 08 | No (duplicates `:146`) | Delete (01 P2-1) |
| `_app.find-tutor.tsx:692` | Your learning profile | No | Delete (P2-6) |
| `MatchedTutorsPanel.tsx:48` | Your matched tutors | No (h2 says it) | Delete (01 P2-1) |
| `dashboard.index.tsx:477, 557, 636, 680, 753, 814` | 6 panel eyebrows | 2 of 6 add a word, but each duplicates a title | Merge into one h2 (P1-3) |
| `ExitDemoModal.tsx:29` | Ready for the real thing? | No | Delete (P2-6) |
| `pathwise.demo.tsx:599` | You're in demo mode | No | Delete (P2-6) |
| `_app.tutor.$tutorId.tsx:361` | {tutor.headline} | **Yes**, wrong form | Move under name, sentence case (P1-5) |
| `StageRoster.tsx:26` (×3) | Stage 01 / 02 / 05 | **Yes**, real sequence | Keep |
| `_app.roadmap.tsx:749–753` | STAGE 0N | **Yes**, real sequence | Keep |
| `StageDetailModal.tsx:40` | STAGE 0N · SESSION LOG | **Yes** | Keep |
| `StepDeck.tsx:208` | Step 0N | **Yes**, but numbered twice | See P3-2 |
| `_app.matches.tsx:370` | Find a tutor → Your matches | **Yes**, breadcrumb | Keep |
| `_app.sessions.$id.tsx:241` | My sessions → Session details | **Yes**, breadcrumb | Keep |
| `pathwise.demo.tsx:485` | {c.category} pill | **Yes**, tag | Keep |

Label/value pairs (`MetricCard` `dashboard.index.tsx:391`, `Kpi` `pathwise.demo.tsx:585`, `PersonCard` `_app.sessions.$id.tsx:469`, form labels, "YOUR LEVEL" inside the quiz result badge `_app.quiz.tsx:553`) are labels for a value, not kickers. Not counted.

## Keep on purpose

- **Landing roster "Stage 01 / 02 / · · · / 05"** (`StageRoster.tsx:3–7`): a real sequence in hairline rows, as the brief keeps.
- **Roadmap "STAGE 0N" cards and the timeline rail** (`_app.roadmap.tsx:667–876`): the cards are equivalent stages, the active and completed ones are marked, and the numbers are the sequence.
- **Voices** (`Voices.tsx`): kept by the brief, and already a hairline table, not a card grid. Its eyebrow is 01's call. Separately, the roles "Learning Spanish" and "Front-end developer" (`:6`, `:18`) fall outside Math/English for Moldova. That is content for the owner, not structure.
- **Catalog grids**: library `CourseCard` (`_app.library.tsx:265`), matches list, find-tutor answer options, the two-option demo chooser (`_app.demo.tsx:52`). These items really are equivalent, and the "at your level" / top-match item is already set apart (`border-[var(--pw-accent)]`, primary button).
- **Sessions list** (`_app.sessions.index.tsx:113`): hairline rows, no boxes. This is the model P2-5 points to.
- **Dashboard metric cards as data**: the values are real and carry "vs last month", so the numbers are not the problem. The fix is weight and order (P1-3), not deletion.
- **Modals that protect focus**: LoginModal (auth), ConfirmationModal, ExitDemoModal (an email form the user opened), the onboarding avatar crop. `window.confirm` before deletes.
- **Booking DST warning** (`_app.book.$tutorId.tsx:681`): a box inside a card, but it is a real alert. It stays boxed.
