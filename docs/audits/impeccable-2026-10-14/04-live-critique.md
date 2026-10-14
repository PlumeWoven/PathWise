DEGRADED: single-context (run as a delegated sub-agent; the Impeccable detector/launcher is not vendored, so Assessment B is browser evidence only: Playwright screenshots, `document.getAnimations()`, computed styles and a contrast sweep)

# Impeccable critique: live site, rendered

Target: https://path-wise-seven.vercel.app (main, as deployed 2026-10-14), signed out.
Method: headless Chromium at 1440x900 and 390x844, `pw-theme` dark and light. Landing was captured full-page and per viewport (scroll steps of 0.85 viewport, 900 ms settle). App pages captured top and full-page. Followed links from /matches to a tutor profile (`/tutor/3ae6ea7e-…`) and its course (`/courses/untitled-course`). No sign-in, no form submissions, no bookings or messages.
Brief (owner decisions, not scored as defects): Moldova tutoring marketplace (Math, English); AMOLED black / chalk cream; amber-orange + orange accents only; sentence-case controls; one filled button per view; 8px grid; Syne + Sora; hero = wordmark + 2 CTAs; Voices kept.

## Verdict

The landing has a real authored idea: the PATHWISE wordmark splits on scroll to reveal a chalkboard of real mathematics, and one amber thread runs from there to the footer. That moment is not template work. Nearly everything around it is. On the landing, a kicker label sits over every heading, stat chips float in the hero corners, and glow halos sit on the comet and the footer wordmark. On the app pages, three category templates are dropped in unchanged: a Udemy course page, a LinkedIn profile header and a SaaS KPI dashboard. All three are filled with test data and with a coding/SaaS persona. On top of that, the UPPERCASE tracked labels appear 181 times across 50 files, and controls use them too, which contradicts the brief's sentence-case controls. A designer would say "an AI made this" within three clicks of the hero. The reason is not the palette. It is the parts nobody decided: a default blue focus ring, no `::selection`, a chart with no bars, two different subject lists, and "0 MDL", which reads as "o MDL" in Syne.

### Design health score

**Landing** (Persuade; 7 and 10 n/a): **20/32 (63%, Acceptable)**

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Step deck shows "Step 1 of 4"; nav marks the current page |
| 2 | Match system / real world | 2 | Voices cite "Learning Spanish" and "Front-end developer" on a Math/English site; "94% accuracy" has no source |
| 3 | User control and freedom | 2 | Step deck auto-advances; the demo pop-up stays over every section; the theme toggle does nothing on this page |
| 4 | Consistency and standards | 2 | The demo pop-up turns chalk-white on the forced-dark page; "Try demo mode" appears twice in one viewport |
| 5 | Error prevention | 3 | Little to get wrong |
| 6 | Recognition rather than recall | 3 | CTAs repeat at each section end |
| 7 | Flexibility and efficiency | n/a | Persuade surface |
| 8 | Aesthetic and minimalist design | 2 | Eyebrows ×4, corner stat chips, glow halos and a glowing ghost wordmark around one strong idea |
| 9 | Error recovery | 3 | Nothing to recover from |
| 10 | Help and documentation | n/a | Persuade surface |

**App surfaces** (/quiz, /find-tutor, /matches, tutor profile, course, /library, /pathwise/demo; Operate): **24/40 (Acceptable)**

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | /matches tells a signed-out visitor "based on your learning profile"; the demo earnings chart renders empty |
| 2 | Match system / real world | 2 | Raw IANA "EUROPE/CHISINAU"; the score formula is printed in the subtitle; coding/music/art subjects on a Math/English marketplace |
| 3 | User control and freedom | 3 | Clear filters, Exit demo, and a back path on the steppers |
| 4 | Consistency and standards | 2 | Quiz offers 6 subjects, find-tutor offers 8 with different names; two focus-ring styles; UPPERCASE controls against the brief |
| 5 | Error prevention | 3 | No risky actions reachable while signed out |
| 6 | Recognition rather than recall | 3 | Labels and icons on every choice |
| 7 | Flexibility and efficiency | 2 | Filters and sort only; the match breakdown sits behind a link on each card |
| 8 | Aesthetic and minimalist design | 2 | KPI-card rows, stat grids holding "0 / — / —", Udemy layout, mono used as costume |
| 9 | Error recovery | 3 | The /library locked state explains itself well |
| 10 | Help and documentation | 2 | "Show match breakdown" is the only in-product explanation |

## Findings, ranked

Each finding gives Location (page · viewport · theme · source), What, Why (cited) and Fix. Source paths are relative to `src/`.

### P1: major

**1. Test data is the marketplace.**
- Location: /matches, tutor profile, course page · all viewports · both themes. This is data in Supabase, not code. Display sites: `pathwise/MatchCard.tsx:58-85`, `routes/_app.tutor.$tutorId.tsx:364-394`, `routes/_app.courses.$slug.tsx:559,834`.
- What: The two tutors are "INISTORICA1" and "TEST". One shows "0 MDL/hr". Subject tags are Accounting, Architecture and Art. One course cover is a bathroom selfie. Course outcomes read "Become a millionare" and "Magic powers". "Students also viewed" shows the same Test course twice.
- Why: The critique's specificity test asks whether the content is real. Placeholder content makes everything around it read as scaffolding (critique.md › Design Specificity; persona "Jordan" below).
- Fix: Hide unpublished and test tutors from public queries, or seed 3-5 realistic Math/English tutors before anyone sees /matches. Design cannot fix this from code.

**2. Demo earnings chart renders no bars.**
- Location: /pathwise/demo · 1440 and 390 · both themes · `routes/pathwise.demo.tsx:301-306`.
- What: The bars use `height: N%` inside a column wrapper. The row has `items-end`, so the wrapper never stretches and has no definite height, and every bar resolves to 0px. Only the month letters J…D render.
- Why: An empty chart under a headline KPI is the "rounded rectangles standing in for content" failure (craft-floor › Refuse). It also breaks heuristic 1.
- Fix: Add `h-full` to the column wrapper, or give each bar a flex basis. Example: `className="flex-1 h-full flex flex-col justify-end items-center gap-2"`.

**3. Subject taxonomy contradicts the brief and itself.**
- Location: /quiz step 1 (`pathwise/data.ts:28-35`: Mathematics, Sciences, Literature, History, Programming, Languages) and /find-tutor Q1 (`routes/_app.find-tutor.tsx:~250-258`: Math, Science, Languages, Coding, Test prep, Music, Writing, Art) · all viewports and themes.
- What: The brief names two subjects. The quiz offers six and find-tutor offers eight. They use different names for the same thing (Mathematics/Math, Programming/Coding), and neither list contains "English".
- Why: Consistency and standards (H4). Coverage: "every brief requirement present and findable within seconds" (craft-floor › Verify). This is already listed as open ("subjects") in the 2026-10-12 audit.
- Fix: Use one shared list, Mathematics and English (plus "Something else" if needed). Have both routes import it.

### P2: minor, but these are the visible "AI made this" tells

**4. A kicker label sits above every landing heading, and above the find-tutor question.**
- Location: landing · all · both themes:
  - `components/landing/Statement.tsx:10` ("Learn deliberately")
  - `components/landing/StepDeck.tsx:141` ("How it works")
  - `components/landing/StageRoster.tsx:16` ("Your roadmap")
  - `components/landing/Voices.tsx:27` ("Loved by learners & tutors")
  - /find-tutor `routes/_app.find-tutor.tsx:271,753` ("01" over a heading that already sits under "Question 1 of 8")
- Why: "A kicker or eyebrow above a heading. This one is a ban, not a default: no brief earns it back" (craft-floor › Refuse). Also tell #12, numbered labels with no sequence (ai-design-tells).
- Fix: Delete them. The four landing headings already carry the meaning. On find-tutor, drop `kicker`.

**5. Hero corner stat chips: "3 MIN AVG", "94% ACCURACY", "NO SIGNUP".**
- Location: landing hero · 1440 (the corner chips are hidden below `md`, but "No signup" shows at 390) · both themes · `components/landing/PortalHero.tsx:108-119`.
- What: Floating metric chips with icons, and no source for "94%".
- Why: Tell #11, "giant hero stats … with no context. Only show a number if it explains the product" (ai-design-tells). It is also the hero-metric template (craft-floor › Refuse). The brief fixes the hero as wordmark + 2 CTAs, and these chips are outside that.
- Fix: Remove the chips. If "about 3 minutes" matters, put it in the CTA's supporting line ("Start your level check · about 3 minutes"). Drop "94%" unless it can be sourced.

**6. Glow halos.**
- Location: landing · all · both themes:
  - Comet tip radial glow: `components/landing/JourneyLine.tsx:246-268`
  - Footer ghost wordmark with `text-shadow: 0 0 32px` glow on a 1s transition: `components/landing/Footer.tsx:96-98`
  - `blur-2xl` scrim halo behind the hero text: `components/landing/PortalHero.tsx:99`
- Why: Tell #5, glowing halos (ai-design-tells). "A zero-offset colored halo is decoration" (craft-floor › Verify › Depth).
- Fix: Keep the thread and its solid amber head, and drop the radial glow. Make the footer wordmark a flat `--qed-ink` at low opacity with no text-shadow.

**7. Step deck motion: bouncy, self-advancing, and "hover to pause" on touch.**
- Location: landing "How it works" · all · both themes · `components/landing/StepDeck.tsx:91-93` (spring stiffness 110 / damping 14, damping ratio about 0.67, so it overshoots), `:101` (ease-in drop `[0.55,0,1,0.45]`), `:132` (`setInterval` auto-advance), `:237` ("hover to pause" also shown at 390 on touch).
- Why: Tell #13, bouncy easing and auto-play (ai-design-tells). "Exponential ease-out from an already-visible default" (craft-floor › Motion). H3: content changes without the user asking.
- Fix: Make the spring critically damped (damping ≥ 2·√stiffness, about 21). Advance on click/arrow and on scroll progress, not on a timer. Say "Tap to advance" below `md`.

**8. Demo pop-up covers the landing and changes theme on its own.**
- Location: landing · 390 (covers about 14% of every viewport, from hero to footer) and 1440 · light theme renders a chalk card on the forced-dark page · `pathwise/DemoBanner.tsx:13-15`, `routes/_app.index.tsx:65,76`.
- What: A fixed card with a film-reel icon (there is no video). It duplicates the StepDeck's own "Try demo mode" button: two in one viewport at 390.
- Why: Tell #13-adjacent persistent chrome. Consistency (H4). The film icon misnames the action (craft-floor › Copy: "controls name their action").
- Fix: Drop the pop-up on `/`, because the landing already has the demo CTA in StepDeck. On app pages, keep it but inside the page's theme wrapper. Replace the film icon with none.

**9. Browser surfaces left at Chrome defaults.**
- Location: every page · both themes · `styles.css` (no `::selection`, no `scrollbar-color`, no global `:focus-visible`; component-only focus at `styles.css:626-633`).
- Measured:
  - `::selection` background resolves to the browser default.
  - `scrollbar-color: auto`.
  - Tabbing to the header nav ("Level check") shows Chrome's blue `auto 1px` outline on landing, quiz and matches. The demo sidebar shows the amber 2px ring.
  - `font-variant-numeric: tabular-nums` appears only on the demo countdown and session times. Prices, KPIs and availability grid hours are proportional.
- Why: "The parts you did not draw still carry the design … the cheapest signal that a page was built rather than assembled" (craft-floor › Browser surfaces).
- Fix: in `styles.css`:
  ```css
  ::selection { background: var(--pw-accent-fill); color: var(--pw-on-accent); }
  :root { scrollbar-color: var(--pw-border) transparent; accent-color: var(--pw-accent-fill); }
  :where(a, button, [tabindex], summary, input, select, textarea):focus-visible { outline: 2px solid var(--pw-accent); outline-offset: 2px; }
  ```
  Also add `tabular-nums` to the `MDL` price and KPI classes.

**10. Syne numerals make prices ambiguous.**
- Location: /matches, tutor profile, course page, demo KPIs · all · both themes · `pathwise/MatchCard.tsx` price block, `routes/_app.tutor.$tutorId.tsx:~790`, `routes/_app.courses.$slug.tsx` price, `routes/pathwise.demo.tsx:283`.
- What: Syne's zero is a small round "o". "0 MDL" reads as "o MDL", "100 MDL" as "1oo MDL", "13440 MDL" as "1344o".
- Why: Type › real copy at every size (craft-floor › Verify). Numbers in data are tabular-data territory (craft-floor › Browser surfaces).
- Fix: Keep Syne for words. Set every numeric value in Sora with `tabular-nums` (`.pw-num { font-family: Sora; font-variant-numeric: tabular-nums; }`).

**11. UPPERCASE tracked controls, against the sentence-case brief.**
- Location: all app pages · both themes · `styles.css:128-133` (`label-caps`; 181 uses in 50 files). Controls affected:
  - Quiz subject buttons (MATHEMATICS)
  - Find-tutor tiles (MATH)
  - /matches filter pills (ANY, MOTIVATIONAL, PATIENT) and subject tags
  - Tutor-profile filter chips (ALL, MATHEMATICS)
  - Demo mobile TUTOR/STUDENT toggle
- Why: The brief says controls are sentence case. Label-caps on controls also reads as the tracked-caps template voice (tell #14 territory).
- Fix: Keep `label-caps` for non-interactive metadata only. Switch it to `normal-case tracking-normal` on any `<button>`, pill or chip. One rule covers it: `.pw-pill { text-transform: none; letter-spacing: 0; }`.

**12. Tutor profile: LinkedIn header, empty stat grid, two filled CTAs.**
- Location: tutor profile · 1440 and 390 · both themes · `routes/_app.tutor.$tutorId.tsx:364-367` (raw `tutor.timezone` shown as "EUROPE/CHISINAU"), `:390-394` (STUDENTS 0 / COURSES 2 / EXPERIENCE — / AVG RATING · 0), `:400-408` ("Book a call", filled) plus `:785-792` ("Book a session", filled). Both buttons navigate to `/book/$tutorId`.
- Why: The brief's one filled button per view. Hero-metric template with no data (craft-floor › Refuse). H2: a raw timezone ID.
- Fix: Make one action, "Book a session", the only filled button, and make the header button outline. Hide stat cells whose value is 0 or "—". Render the timezone as "Chișinău".

**13. Course page is the Udemy template.**
- Location: course page · all · both themes · `routes/_app.courses.$slug.tsx`. Breadcrumb; sidebar price card with "Add to wishlist" and a share row with a Twitter bird (`:17,513-514`); tabs; "What you'll learn" checklist (`:559`); "Students also viewed" (`:834`). At 390, the inline "Book a session" (`:431`) and the sticky bar's "Book a session" are both filled in one viewport. "1 lessons" (`:416`).
- Why: The specificity test: "could an unrelated product use it unchanged?" Yes, any course marketplace (critique.md › Design Specificity). It also breaks one filled button per view.
- Fix: Cut wishlist and share, which are speculative for a 1:1 tutoring market. Lead with the tutor, the level band, and the next open slot. Use the stage/level language from the landing ("Stage 02 · Core skills") instead of "Intermediate". Hide the inline CTA when the sticky bar is visible. Pluralise "lesson(s)".

**14. /matches copy and type costume.**
- Location: /matches · all · both themes:
  - `routes/_app.matches.tsx:386-393`: "based on your learning profile" shown signed out; the weight formula printed as the subtitle
  - `:18`: "Best Match", title case in the select
  - `pathwise/MatchCard.tsx:92,206`: monospace for "0.0 · (0 reviews)" and the percentage
  - Both cards show an identical "63% MATCH"
- Why: Monospace as costume for "technical" (craft-floor › Refuse). The copy claims a state that doesn't exist (H1). Identical scores make the score look fake.
- Fix: When there is no saved profile, say "2 tutors teaching Mathematics". Move the weights into "Show match breakdown". Set ratings in Sora. Hide the score when every candidate ties.

**15. Demo dashboard: KPI row, side stripes, off-brief persona.**
- Location: /pathwise/demo · all · both themes:
  - `routes/pathwise.demo.tsx:283-290`: four identical KPI cards with delta lines
  - `:357`: a 2px amber bar on every session row
  - `pathwise/DemoContext.tsx:22,38,53`: "Senior Software Engineer", "Full-Stack JavaScript", "Indie SaaS"
- Why:
  - Tell #8, grids of identical cards, and the hero-metric template.
  - Tell #10, colored side stripes, which craft-floor reserves for status.
  - The persona contradicts a Math/English Moldova marketplace.
- Fix: Make the demo tutor a Chișinău maths teacher (BAC prep, Algebra stage 02) with an English counterpart. Merge the KPIs into one sentence-level summary line above the chart. Drop the row stripe and use the time column for emphasis.

**16. Find-tutor Q1 is the icon-tile grid.**
- Location: /find-tutor · all · both themes · `routes/_app.find-tutor.tsx:~250-258` plus the tile render.
- What: Eight same-size squares, each with a large filled icon above an UPPERCASE label.
- Why: Tells #7 and #8, icons in boxes above labels and grids of identical cards (ai-design-tells).
- Fix: Once the list is two subjects (finding 3), use two wide rows with the icon beside a sentence-case label and one line of what each covers ("Mathematics: gymnasium to BAC").

### P3: polish

17. **Voices content is off-brief.** Landing · all · `components/landing/Voices.tsx:6,18`. "Learning Spanish" and "Front-end developer". Voices stay (owner decision), but the roles should be Math/English learners and tutors in Moldova.
18. **Landing body copy is 14px at 390.** `components/landing/Statement.tsx:18` and `components/landing/StepDeck.tsx:219` (`text-sm`). ai-design-tells' closing check asks for body ≥16px. Use `text-base`.
19. **The theme toggle looks broken on `/`.** Landing · light theme shows the sun icon on a page that stays black (`routes/_app.index.tsx:65`). Hide the toggle on `/`, or label it "Theme applies inside the app".
20. **Mobile quiz stepper label clips past the gutter.** /quiz · 390 · "SUBJECT" starts at x≈5px, outside the 24px gutter (`routes/_app.quiz.tsx` stepper). Align the first label to the left, or put the labels under the bar.
21. **Uppercase Syne headings on every app card** ("ABOUT THIS COURSE", "MY COURSES", "EARNINGS · LAST 12 MONTHS"). Uppercase display on the landing is the voice. Repeated on every card heading in Operate screens, it flattens hierarchy. Consider sentence-case Syne for in-app section heads.

## Motion inventory (measured)

- **On load:** `document.getAnimations()` is empty on every page. Nothing animates in, which is correct.
- **On scroll (landing):** two scroll-linked WAAPI effects (`linear`): the portal overlay in `PortalHero` and the JourneyLine comet. One 1000ms colour + text-shadow transition on the footer wordmark (`Footer.tsx:96`).
- **Infinite loops:** none on any captured page. `animate-pulse` exists only in loading skeletons (`_app.matches.tsx:461` and others).
- **Bouncy easing:** StepDeck spring (finding 7). MatchCard has a per-card entrance (`MatchCard.tsx:46`, opacity + y).
- **Reduced motion:** 3 `prefers-reduced-motion` rules are in the stylesheet, and StepDeck has a `still` path. Good.

## Persona red flags

- **Jordan, a first-time parent in Chișinău:** picks "Find a tutor", is asked about Music and Art, reaches "TEST" at 0 MDL and a selfie course cover. Leaves before step 3.
- **Casey, distracted on a phone:** the demo pop-up sits over every section. "Hover to pause" can't be done. Two filled "Book a session" buttons on the course page compete. Prices read "o MDL".
- **Sam, keyboard user:** gets the Chrome-blue default ring on all public nav and links and the amber ring only inside the demo. The step deck changes under focus every few seconds.

## What already feels authored: keep it

- **The portal hero.** The wordmark splits on scroll to reveal a chalkboard of real equations and geometry (`PortalHero.tsx`). This is the one moment nothing else in the category does. It is the "one authored moment" craft-floor asks for, so protect it.
- **The single amber thread** from hero to footer (`JourneyLine.tsx`) as a literal "path". Keep the line and drop only the glow.
- **StageRoster as type, not cards.** "Stage 01 Foundations / Stage 02 Core skills / … / Stage 05 Your goal" as a hairline-ruled list is specific, scannable, and a real sequence, so its numbers earn their place.
- **Voices as a ruled table** (learning · words · name) instead of avatar testimonial cards.
- **Palette and edge discipline:** true AMOLED black, chalk cream, amber/orange only, square hairline cards. No purple, no gradients-as-brand, no glass cards.
- **The /library locked state:** a plain explanation ("Courses here are shelved by level, so we need to know where you're starting from") and one filled action.
- **The demo bar:** "Sample data · expires in 59:56" with tabular numerals, and a clear Exit demo.

## Questions to consider

- If the marketplace only teaches Mathematics and English, what would the find-tutor and quiz first steps look like with two big, specific choices instead of a menu?
- Could the course page borrow the landing's stage language, so a course is "Stage 02 of your roadmap" rather than an Udemy product?
- What would the tutor profile look like if it led with the next open slot instead of the stat grid?
