# 01 · Visual-surface tells

Impeccable audit, 2026-10-14. Lens: the visual surface tells (gradients, glows, glass, icon tiles, stripes, costume type, motion, browser surfaces), swept mechanically across `src/` (routes, components, pathwise, styles.css). The detector (`scripts/impeccable`) is not vendored, so every finding below came from a grep sweep, and each hit was then read in context. shadcn primitives in `src/components/ui/` were only counted where an app surface uses them.

## Verdict

**The palette and surface layer is clean. The tells are in labels and motion.** No purple, indigo or blue gradient anywhere. No gradient text, no hard offset shadows, no emoji, no glass cards. Every `0 0 0 1px` shadow is a hairline border, not a halo. What still reads as assembled rather than designed:

1. A **kicker label above almost every heading**, on the landing and in the app (craft-floor calls this a ban, not a default).
2. **Hero corner stats** that break the brief's "wordmark + two CTAs" hero.
3. **Decorative motion in the funnel**: hover zooms, wiggling icons forever and a pulsing ring, concentrated in `/find-tutor` and `/roadmap`.
4. **Unicode arrows** standing in for icons in about 49 controls, alongside two real icon libraries.
5. **Browser surfaces left at their defaults**: selection, caret, scrollbars, and focus rings on every link that is not a `.pw-*` class.

Severity count: P1 × 4 · P2 × 7 · P3 × 5.

## Sweep counts

| # | Pattern | Hits | Verdict |
|---|---|---|---|
| 1 | Gradients / gradient text | 7 gradients, 0 purple/indigo/blue, 0 `bg-clip-text` | All are scrims, the brand duotone, a hatch fill or the journey comet. Keep (see the end). |
| 2 | Glow halos / zero-offset coloured shadow | 1 `blur-2xl` (PortalHero:99), 1 SVG radial glow (JourneyLine:246–268), 1 infinite pulse ring (roadmap:726–736). 11 `0 0 0 1px` rings are hairlines. | Pulse ring = P1. The other two are kept. |
| 3 | `backdrop-blur` | 4 (Header:200, find-tutor:143, admin:61, dialog overlay) | Only admin:61 is decoration (P3). |
| 4 | Icon in a circle above a heading / glyph icons | 2 icon circles (router.tsx:10, ConfirmationModal:79/84). 49 unicode-arrow lines in 24 files, plus ▲▼ ↓ ○ ● •. 0 emoji. 2 icon systems (Streamline `Icon.tsx` + `lucide-react` in 26 files). | P2 |
| 5 | Coloured side stripe > 1px | 3 coloured (verification:156, availability:216, UnverifiedBanner:18), 1 neutral rail (tutor:514) | 1 × P2, 2 × P3, rail kept |
| 6 | Hard offset shadow / mono costume / pill or kicker above a heading | 0 hard shadows. `font-mono-pw` (DM Mono) at 13 sites. About 30 `label-caps` kickers within 6 lines above an h1–h3, across 20 files. 0 pill badges. | Kickers P1/P2, mono P2 |
| 7 | Pulse / bounce / hover zoom / infinite / stagger | 3 hover zooms + 3 hover nudges (all in find-tutor), 3 infinite loops in use (find-tutor:383, :688, roadmap:736), 1 `animate-pulse` icon, 1 autoplay deck. 1 underdamped spring (StepDeck ζ≈0.67). Unused infinite keyframes in styles.css and 3 unused motion hooks. | P1 / P3 |
| 8 | Browser surfaces | `::selection` 0, `caret-color` 0, `scrollbar-color` 0 (only `color-scheme`). `:focus-visible` covers `.pw-*` only: Header, LandingCtas, Footer and StageRoster have 0. `tabular-nums` at 6 sites, missing on MetricCard and the admin tables. | P2 / P3 |

---

## P1: reads as vibe-coded, and users see it

### [P1-1] A kicker above every landing section heading, one of which repeats the next heading
- **Location:** `src/components/landing/Statement.tsx:10` `<p className="label-caps mb-8 text-qed-ink-2">Learn deliberately</p>` · `StepDeck.tsx:141` `label-caps mb-6 text-qed-teal-ink` "How it works" · `StageRoster.tsx:16` `label-caps mb-12` "Your roadmap" · `Voices.tsx:27` `label-caps mb-8 text-qed-amber` "Loved by learners & tutors"
- **Tell:** #4 (label above the headline). craft-floor.md:27.
- **What:** Four sections in a row open with the same tracked-caps eyebrow. Statement's eyebrow "Learn deliberately" is the literal h2 of the very next section (StepDeck.tsx:142–146, "Learn deliberately."), so a visitor reads the same phrase twice within one scroll.
- **Why:** craft-floor.md:27 says a kicker above a heading is "a ban, not a default: no brief earns it back". A repeated eyebrow on every section is the most recognisable template rhythm.
- **Fix:** Delete those four `<p>` lines. Voices has no heading of its own, but the brief keeps that section, not its eyebrow, and the quote table with its column header (Voices.tsx:29) already says what it is. If the owner wants a title there, make it a real `<h2>` in the section-heading style, not a caps label.

### [P1-2] Hero corner stats contradict the brief's hero
- **Location:** `src/components/landing/PortalHero.tsx:108–120` (four absolutely placed `label-caps` `<p>`s: "3 min avg", "94% accuracy", "Scroll to begin", "No signup")
- **Tell:** #11 (hero stats with no context). Also craft-floor.md:26 (the hero-metric template).
- **What:** A sci-fi HUD in each corner of the first viewport. "94% accuracy" has no referent. "No signup", a positive message, carries `CircleXIcon`, an X.
- **Why:** The brief fixes the hero as the PATHWISE wordmark + two CTAs. Three of these four labels are an extra layer the brief did not ask for, and they are the template's default dressing.
- **Fix:** Delete lines 108–113 and 118–120 ("3 min avg", "94% accuracy", "No signup"), then drop the now-unused `ClockIcon`, `CircleCheckIcon` and `CircleXIcon` imports. Keep "Scroll to begin" (114–117): the hero is a sticky, scroll-scrubbed stage, so the cue does a job.

### [P1-3] `/find-tutor` has decorative motion on every step
- **Location:** `src/routes/_app.find-tutor.tsx`
  - Hover zoom: `:281` `whileHover={{ scale: 1.04 }}`, `:474` and `:556` `whileHover={{ scale: 1.03 }}`
  - Hover nudge: `:339` and `:524` `whileHover={{ x: 4 }}`, `:375` `whileHover={{ y: -4 }}`
  - Infinite wiggle: `:381–383` `animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}` on every learning-style icon
  - Infinite watermark: `:685–690` a 128px `target` icon at `opacity-10`, `rotate: [0, 8, -8, 0]`, `repeat: Infinity`, behind the results card
  - Stagger on every step: `transition={{ delay: i * 0.04 | 0.05 | 0.08 }}` with `initial={{ opacity: 0, y: 8–10 }}` (or `scale: 0.9`) on all 8 question grids
- **Tell:** #13 (bouncy easing, hover zooms, animation where nothing changes). craft-floor.md:13 ("one authored moment… not one identical entrance on every section").
- **What:** This is the main funnel, and every option card zooms or slides on hover while icons wiggle forever. Each question replays the same stagger.
- **Why:** None of this signals a state change. The selected state already has `border-[var(--pw-ink)] ring-1 ring-[var(--pw-accent)]`, and hover already has `hover:border-[var(--pw-ink)]`.
- **Fix:** Delete every `whileHover` prop, the `animate`/`transition` on the motion.div at :381–383 (turn it into a plain `div`), and the whole watermark block at :685–690. Drop the per-item `initial`/`animate`/`delay` from the option buttons. Keep `whileTap={{ scale: 0.96–0.98 }}`, which is press feedback, and the progress-bar width tween at :155.

### [P1-4] The active roadmap stage pulses forever, even with reduced motion on
- **Location:** `src/routes/_app.roadmap.tsx:724–737`: `boxShadow: ["0 0 0 0 rgba(232,145,60,0.55)", "0 0 0 10px rgba(232,145,60,0)"]`, `transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}`
- **Tell:** #13 (pulsing dots). craft-floor.md:10 (a zero-offset coloured halo is decoration).
- **What:** A sonar ring that never stops, on the page a student comes back to most.
- **Why:** The active stage is already marked by `nodeBg`/`nodeBorder` and by the card's `border-[var(--pw-accent)]` (:744). `<MotionConfig reducedMotion="user">` (`__root.tsx:120`) only suppresses transform and layout animation, not `boxShadow` keyframes, and the CSS kill in styles.css:872 does not reach Framer's JS animation. So the ring keeps pulsing for reduced-motion users too.
- **Fix:** Delete the `animate={…}` and `transition={…}` props at :724–737. If the dot needs more weight, give it a static `boxShadow: "0 0 0 3px var(--pw-accent-soft)"` when `isActive`.

---

## P2: noticeable, worth the next pass

### [P2-1] App pages keep the kicker-above-heading habit, including a number sequence that duplicates the progress bar
- **Location:** `_app.roadmap.tsx:569` "YOUR ROADMAP" · `_app.library.tsx:206` "Course Library" · `pathwise/MatchedTutorsPanel.tsx:48` · `auth.choose-role.tsx:128` "One last step" · `_app.onboarding.student.tsx:55` "Step 1 of 1" · `_app.demo.tsx:44` "Live Demo" · `_app.find-tutor.tsx:753` `<div className="label-caps text-pw-accent">{kicker}</div>`, fed `kicker="01"`…`"08"` at :271–605
- **Tell:** #4 and #12. craft-floor.md:27–28.
- **What:** "Step 1 of 1" is a sequence of one. The find-tutor 01–08 kickers repeat the sticky header's "Question {step + 1} of {totalQ}" (find-tutor.tsx:147), which sits 1 cm above them. "YOUR ROADMAP" is in uppercase source text, so it ignores the sentence-case rule as well.
- **Fix:** Delete each of these `label-caps` lines. In find-tutor, delete the `kicker` prop and line 753, leaving `Heading` as just the `<h1>`. Keep `legal.tsx:19` "Last updated …": it is metadata, not a kicker.

### [P2-2] Unicode arrows stand in for an icon system that already exists twice
- **Location:** 49 JSX lines in 24 files, for example `_app.find-tutor.tsx:149` "← Back", `:450` "Continue →" · `_app.quiz.tsx:415` "Begin →", `:608` "Build My Roadmap →" · `_app.roadmap.tsx:896`, `:938` · `UnverifiedBanner.tsx:35` · `auth.choose-role.tsx:171`. Other glyphs: `dashboard.index.tsx:403` "▲"/"▼", `:649` "↓ … conv", `:722` `"○"` beside an `<Icon name="check">` in the same list, `_app.library.tsx:323` "●", `_app.courses.$slug.tsx:579,589` "• "
- **Tell:** #7 (icon treatment). craft-floor.md:40 ("Unicode glyphs or emoji standing in for an icon system").
- **What:** The landing uses lucide `ArrowRightIcon` (LandingCtas.tsx:14, StepDeck.tsx:246). The app uses typed "→" in Sora, which sits on a different baseline and weight in every button. Meanwhile Streamline bold (`Icon.tsx`) and lucide line icons are mixed across 26 files, which means two stroke languages.
- **Fix:** Add `arrowRight`/`arrowLeft` to `Icon.tsx` (or standardise on lucide `ArrowRight`/`ArrowLeft` at `size-3.5`, as LandingCtas does) and replace the 49 arrow glyphs. Replace ▲/▼ with `ArrowUp`/`ArrowDown` (dashboard:403). Replace `"○"` with an empty 12px circle `<span className="size-3 rounded-full border border-current" />` (dashboard:722). Change the `• {p}` lists to `<ul className="list-disc pl-4">` (courses:579, 589). Then choose one icon family. That last step is an owner call, so it is noted here, not prescribed.

### [P2-3] DM Mono is a third font, used as a "game / technical" costume
- **Location:** `src/styles.css:1` (`family=DM+Mono:wght@400;500` in the Google Fonts import), `:376–378` `.font-mono-pw`. Used at `_app.quiz.tsx:490` "+{xpGain} XP", `:558`, `:565` "{totalXP} XP Earned" · `_app.roadmap.tsx:597`, `:609`, `:924` · `MatchCard.tsx:92`, `:206` · `SessionStateTracker.tsx:28` (step numbers) · `AvailabilityGrid.tsx:206` (hour labels) · `_app.onboarding.tutor.tsx:656`, `:678`
- **Tell:** craft-floor.md:38 ("Monospace as a costume for 'technical' rather than for code, data, or measurement").
- **What:** The brief's type system is Syne + Sora. Mono here mostly dresses up XP counters and step numbers. The real data cases (hour labels, `3 / 5 stages`) only need aligned digits.
- **Fix:** Replace `font-mono-pw` with `tabular-nums` at all 13 sites, delete `.font-mono-pw` (styles.css:376–378), and drop `family=DM+Mono:wght@400;500&` from the import on line 1. That also saves a font request. `router.tsx:33` (`<pre>` error dump) and `style-guide.tsx` `<code>` are real code, so leave them.

### [P2-4] Default browser focus ring on the header, landing CTAs and footer
- **Location:** `styles.css:625–633` styles `:focus-visible` only for `.pw-btn-primary/.pw-btn-secondary/.pw-btn-outline/.pw-pill/.pw-nav-item/.pw-card`. `focus-visible` count is 0 in `pathwise/Header.tsx` (links at :114–166), `landing/LandingCtas.tsx` (`primary`/`secondary` at :5–8), `landing/Footer.tsx:50–53, 69, 73` and `landing/StageRoster.tsx:34`.
- **Tell:** craft-floor.md:15 (Browser surfaces: focus rings).
- **What:** If you tab through the landing, the first stops (header links, both hero CTAs) show the UA's blue or black auto ring on AMOLED black, while app buttons get the amber 2px ring. Two different focus languages.
- **Fix:** In styles.css, replace the selector list at :626–631 with `:where(a, button, [role="button"], summary, [tabindex]):focus-visible`, keeping the `outline: 2px solid var(--pw-accent); outline-offset: 2px;` body. One rule covers every control.

### [P2-5] Text selection, caret and scrollbar are left at browser defaults
- **Location:** `src/styles.css`, which has 0 hits for `::selection`, `caret-color` and `scrollbar-color`. Only `color-scheme` is set (:135).
- **Tell:** craft-floor.md:15 ("the cheapest signal that a page was built rather than assembled, and the one models skip most reliably").
- **What:** Selecting text on an orange-only, AMOLED-black page paints it system blue.
- **Fix:** Add to the base layer next to `body` (styles.css:361):
  ```css
  ::selection { background: var(--pw-accent-fill); color: var(--pw-on-accent); }
  :root { caret-color: var(--pw-accent); scrollbar-color: var(--pw-ink-2) transparent; }
  ```

### [P2-6] Decorative coloured stripe on the verification status card
- **Location:** `src/routes/_app.settings.verification.tsx:156`: `style={{ borderLeft: \`3px solid ${accent}\` }}`
- **Tell:** #10. craft-floor.md:35.
- **What:** A stripe on a `.pw-card` whose status is already carried by the tinted pill right beside the title (:162–175, same `accent` colour, border and background).
- **Fix:** Delete the `style` prop. The pill alone says the status.

### [P2-7] Icon in a circle above the heading, and a pulsing envelope, in the signup confirmation
- **Location:** `src/components/ConfirmationModal.tsx:79` and `:84`: `w-16 h-16 rounded-full bg-[var(--pw-accent-soft)] border … flex items-center justify-center`, with `animate-pulse` at :84. Same pattern in `src/router.tsx:10` (error page: `h-16 w-16 … rounded-full border … bg-[var(--pw-surface-2)]` around a warning SVG above the `<h1>`).
- **Tell:** #7 (icons in containers above headings). #13 (pulsing).
- **What:** The template "success/empty-state medallion". The pulse fakes activity while nothing is happening: the app is waiting on the user's inbox.
- **Fix:** In ConfirmationModal, delete both wrapper `div`s and render `<Mail className="size-8 text-[var(--pw-accent)]" />` / `<CheckCircle …/>` bare, without `animate-pulse`. In router.tsx:10, drop the circle wrapper classes and keep the SVG inline with the heading, or delete it, since the heading text already says "error".

---

## P3: polish

### [P3-1] Stripes on real alerts: allowed by tell #10, refused by craft-floor
- **Location:** `_app.tutor.settings.availability.tsx:216` `border-l-4 border-l-[var(--pw-accent-3)]` (timezone mismatch) · `pathwise/UnverifiedBanner.tsx:18–19` `border-l-4` + `borderLeftColor: "var(--pw-accent)"`
- **Tell:** #10 (keep for real alerts) vs craft-floor.md:35 (refuses them "on … callouts, or alerts").
- **Fix:** Swap `border-l-4 …` for a full 1px accent border (`border-[var(--pw-accent-3)]` / `borderColor: var(--pw-accent)`). The alert still reads as an alert without the template stripe.

### [P3-2] The admin sidebar blurs nothing
- **Location:** `src/routes/admin.tsx:61`: `bg-[var(--pw-surface)]/80 backdrop-blur-md`
- **Tell:** #6. craft-floor.md:34.
- **What:** The aside is a flex column, not an overlay, so no content ever scrolls under it. The blur and translucency are pure decoration.
- **Fix:** Change to `bg-[var(--pw-surface)]` and delete `backdrop-blur-md`.

### [P3-3] Dead decorative motion still shipped
- **Location:** `src/styles.css:733–746` (`pw-bounce-chev` + `.animate-chev`) and `:805–866` (`pw-float-1/2/3`, `pw-float-wrapper` and their `.animate-pw-float-*` classes, all `infinite`). 0 references in `src/`. Also `src/hooks/useDVDFloat.ts`, `useFloatingElements.ts` and `useMouseParallax.ts`, with 0 imports.
- **Tell:** #13 (leftovers of floating or bouncing decoration).
- **Fix:** Delete those CSS blocks and the three hook files. Keep `pw-float-up` and `flash-green`/`flash-red` (used in quiz feedback).

### [P3-4] Underdamped spring on the landing step deck, and autoplay
- **Location:** `src/components/landing/StepDeck.tsx:93`: `{ type: "spring", stiffness: 110, damping: 14 }` (damping ratio ≈ 0.67, a visible overshoot). Autoplay is at :129–136.
- **Tell:** #13 (bouncy easing, auto-advancing content).
- **What:** Every other spring in the app sits at ζ ≥ 0.8 (AnimatedStepper 300/30, ThemeToggle and roadmap 260/26, JourneyLine 60/20). The deck is the outlier. Autoplay is already well guarded: it pauses on hover/focus, on hidden tabs, off-screen and under reduced motion.
- **Fix:** `damping: 21` (ζ ≈ 1.0). Autoplay is the owner's call. If it goes, the "hover to pause" copy at :237 goes too.

### [P3-5] Metric and table numerals are proportional
- **Location:** `src/routes/dashboard.index.tsx:391–396` (MetricCard value, Syne, no `tabular-nums`). Admin tables in `admin.sessions.tsx:148–159` and `admin.users.tsx` (dates and counts, 0 `tabular-nums`).
- **Tell:** craft-floor.md:15 ("the numerals in tabular data").
- **Fix:** Add `tabular-nums` to the MetricCard value `div` and to the `<table>` element in both admin routes. It inherits from there.

---

## Keep on purpose

These match a grep pattern but serve the product or the brief:

- **Hero duotone + vignette + scrim**: `PortalHero.tsx:54` (`bg-linear-135 from-qed-amber to-qed-teal mix-blend-overlay`; `qed-teal` is now orange `#c2560f`, styles.css:94), `:56` (radial vignette), `:99` (`bg-qed-ground/70 blur-2xl` behind the CTAs). This is the brand's two accents as a photo treatment, and the scrim keeps the CTAs legible over the photo. It is not a coloured glow: it is ground-coloured.
- **JourneyLine comet**: `JourneyLine.tsx:233–270` (gradient stroke, 3 widths, radial tip glow). The landing's one authored moment, and it hides under reduced motion (:230). If it ever needs quieting, drop the `w: 10` glow stroke and the `r={18}` tip glow first.
- **Image scrims**: `CourseCard.tsx:88` (`bg-gradient-to-t` under the title) and `_app.tutor.$tutorId.tsx:322` (cover image). Text over photos needs them.
- **Unavailable-slot hatch**: `AvailabilityGrid.tsx:37` `repeating-linear-gradient`. It encodes "unavailable", so it carries meaning.
- **Sticky blur**: `Header.tsx:200` (`/95 backdrop-blur-md` only once scrolled), `_app.find-tutor.tsx:143` (sticky progress bar), `components/ui/dialog.tsx:22` (modal overlay). These solve a real layering problem: content scrolls under them.
- **`0 0 0 1px` rings** (styles.css:103–106, 395, 437, 443, 460, 563; ThemeToggle:85; WaveSlider:67). These are the hairline-border system, not halos. `flash-green`/`flash-red` (styles.css:779, 797) is answer feedback, a real state change.
- **Neutral timeline rail**: `_app.tutor.$tutorId.tsx:514` `border-l-2 border-[var(--pw-border)]`. It is the spine of the experience timeline, not a coloured card stripe.
- **Theme-toggle radial reveal** (styles.css:883–928). An authored view transition, disabled under reduced motion.
- **Spinners and skeleton `animate-pulse`** (CourseEditor, library, matches, course-match, dashboard MetricCard skeleton). These are loading state, so something really is changing.
- **Voices section**: kept per the brief. Only its eyebrow is flagged (P1-1).
- **"Scroll to begin" cue** (PortalHero:114–117), with its static dot. It does a job on a scroll-scrubbed hero.
