## Design review: PathWise web app: visual design, typography, color, materials, craft

Source audit only (another pass checks the rendered site). Lens: apple-hig Lens 3 plus the craft lens, apple-design §12 / §15 / §16.

References opened: `color.md`, `typography.md`, `layout.md`, `icons.md`, `materials.md`, `liquid-glass.md`, `dark-mode.md`, `branding.md`, `design-principles.md`, `buttons.md`, `cross-platform.md`. PathWise is a web app, so per the SKILL.md scope rule only the principles and foundations apply. Native conventions (tab bars, menu bar) are out of scope.

> Citations are given as `file.md › Heading` with the guideline **paraphrased**. The quoting budget allows one verbatim line in the whole report, and it is used once, in H5.

---

### Summary

**Rating: Critical issues.** One Critical finding: text below the mobile minimum size. Five High findings, plus one High craft note.

- **Thesis.** "Find exactly where you stand", then follow a path to the goal. The landing hero, the quiz → roadmap flow and the brand name (Path·Wise) all carry this sentence.
- **Signature.** The landing's scroll-driven **PATH / WISE portal split** (`PortalHero.tsx:76-94`) is what people will remember. The element that actually belongs to the product is the **amber "journey line" comet** (`JourneyLine.tsx`), which draws a path down the page.
- **The problem.** That signature stops at the marketing page. The rest of the app inherits a generated "QED" look: a near-black or cream ground, one amber accent, zero radius, hairlines and uppercase micro-labels. Amber is used for about a dozen jobs. Type has no scale (31 fixed sizes). Dark mode breaks in toasts, native controls and one banner.
- **What is strong.** Token discipline is unusually good: no `bg-blue-500`-style classes anywhere, and every text token passes 4.5:1 in both themes. Radius discipline is also good.

---

### Critical

**C1. Text below the 11 pt mobile minimum, including every form label, chip and legal link**

- **What.** Below 48rem the root stays at 100% (`styles.css:351-355`), so these sizes land on phones as written:
  - **9 px** (`text-[0.5625rem]`): footer copyright, Privacy and Terms links (`Footer.tsx:64`, `Footer.tsx:74`), and the deck's live "Step N of 4" counter (`StepDeck.tsx:234`).
  - **10 px** (`text-[0.625rem]`): notification count badge and timestamps (`NotificationBell.tsx:117`, `:163`), inbox timestamps (`Inbox.tsx:247`), the funnel axis (`dashboard.index.tsx:648`), course meta (`_app.courses.$slug.tsx:876`) and demo caption (`pathwise.demo.tsx:532`).
  - **10.5 px**: the `label-caps` utility (`styles.css:128-133`, `font-size: 0.6562rem`). It is used at **223 call sites**: form labels (`_app.book.$tutorId.tsx:610`, `:622`), section labels, nav, status chips. `.pw-badge` uses the same size (`styles.css:583`).
  - All of these are uppercase with 0.15em tracking, which makes them harder to read than the size alone suggests.
  - The design doc itself sanctions "micro 9px" (`QED_DESIGN_SYSTEM.md:27`).
- **Why.** `typography.md › Ensuring legibility`: the iOS/iPadOS default is 17 pt and the minimum is 11 pt (paraphrased). Text smaller than that is an accessibility failure under apple-hig SKILL.md › Lens 1. apple-design §15 adds that small text needs a slightly *positive* tracking, never a size below the floor.
- **Fix.**
  ```css
  /* styles.css:128-133 */
  @utility label-caps { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; font-weight: 600; }
  /* styles.css:583 */
  .pw-badge { font-size: 0.75rem; letter-spacing: 0.08em; }
  ```
  - Delete every `text-[0.5625rem]` and `text-[0.625rem]` (9 sites, listed above) and replace each with `text-xs`.
  - Change `QED_DESIGN_SYSTEM.md:27` from "micro 9px" to "minimum 12px".

---

### Improvements

**H1. [High] Amber means about a dozen things, for both interactive and non-interactive text**

- **What.** There are 345 amber references (`pw-accent*`, `qed-amber`). Their jobs:
  - **Link hover**: `Header.tsx:20`, `Footer.tsx:50`.
  - **Active nav**: `styles.css:547`.
  - **Focus ring**: `styles.css:250`, `:640`.
  - **Progress fill**: `styles.css:630`.
  - **Primary-button hover**: `styles.css:484-487`.
  - **Selected quiz option**: `styles.css:419-422`.
  - **Rating stars**: `MatchCard.tsx:92`.
  - **Avatar fallbacks**: `MatchCard.tsx:60`, `_app.book.$tutorId.tsx:453`, `dashboard.index.tsx:870`.
  - **Static KPI numbers**: `dashboard.index.tsx:394`.
  - **Static headline words**: `matches.tsx:373-374` ("We found **N**"), `Statement.tsx:19`.
  - **XP**: `_app.quiz.tsx:451`, `:622`.
  - **Warning stripe**: `UnverifiedBanner.tsx:15`.
  - **Decorative icons**: `PortalHero.tsx:113-123`.
  - **Eyebrow**: `Voices.tsx:27`.
  - **Notification badge**: `NotificationBell.tsx:117`.

  The same concept also gets two colors:
  - **Rating stars** are amber on the match card (`MatchCard.tsx:92`) but gold on the tutor profile the card opens (`_app.tutor.$tutorId.tsx:396`, `:613`, `:635`).
  - **XP** is amber in the quiz pill (`_app.quiz.tsx:451`) but gold in the "+XP" float (`_app.quiz.tsx:502`) and on the roadmap (`_app.roadmap.tsx:919`).

  Meanwhile the primary button, the one place brand color is meant to go, is **ink**. It only turns amber on hover.
- **Why.**
  - `color.md › Best practices` (paraphrased): avoid using the same color to mean different things. If brand color marks something as interactive, don't also use it on non-interactive text.
  - `branding.md › Best practices` (paraphrased): apply the accent judiciously, mainly for primary actions and status indicators.
- **Fix.** Adopt one rule: **amber means "interactive, selected, or where you are" (links, active nav, focus, progress, the current stage). Static text is never amber.**
  - `dashboard.index.tsx:394`: delete `style={{ color: "var(--pw-accent)" }}`.
  - `matches.tsx:374`: delete the amber `style` on the count. Do the same for `Statement.tsx:19` (`text-qed-amber` becomes `text-qed-ink`). Keep "Wise" in the hero, because that is the wordmark.
  - **Avatar fallbacks**: replace `style={{ background: "var(--pw-accent-fill)" }}` and `bg-pw-accent-fill` with `bg-[var(--pw-surface-2)] text-[var(--pw-ink)]` at `MatchCard.tsx:59-60`, `_app.book.$tutorId.tsx:453` and `dashboard.index.tsx:870`.
  - **Stars**: use gold everywhere. At `MatchCard.tsx:92`, `dashboard.index.tsx:778` and `_app.sessions.$id.tsx:407`, `var(--pw-accent)` becomes `var(--pw-accent-3)`.
  - **XP**: use gold everywhere. At `_app.quiz.tsx:451`, `text-pw-accent` becomes `text-[var(--pw-accent-3)]`. At `:622`, `var(--pw-accent)` becomes `var(--pw-accent-3)`.
  - **Decorative tones**: at `Voices.tsx:27` and `PortalHero.tsx:113,116,123`, `text-qed-amber` becomes `text-qed-ink-2`. Delete the parity tone at `StepDeck.tsx:212`: `className="h-5 w-5 text-qed-ink-2"`.

**H2. [High] No type scale: 31 fixed sizes, six of them between 12 and 14 px**

- **What.**
  - **Distinct effective sizes in TSX**: 9, 10, 10.5, 11, 11.5, 12, 12.5, 12.8, 13, 13.5, 14, 15, 16, 17, 18, 20, 21, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 46, 48, 56 and 72 px. On top of those come 6 `vw`/`clamp` sizes and the class-level 10.5, 11 and 11.5 px.
  - **Arbitrary rems duplicate Tailwind's own steps**: `text-[0.75rem]` ×107 is `text-xs`, `text-[0.875rem]` ×89 is `text-sm`, `text-[1.25rem]` ×21 is `text-xl`, `text-[1rem]` ×11 is `text-base`.
  - **The page-title role has five sizes across sibling key views**:
    - 24 px: booking (`_app.book.$tutorId.tsx:480`).
    - 28 → 34 px: matches (`_app.matches.tsx:372`) and dashboard (`dashboard.index.tsx:242`).
    - 32 px: roadmap (`_app.roadmap.tsx:569`).
    - 32 → 38 px: quiz steps (`_app.quiz.tsx:694`).
  - **Heading case flips inside one flow**: "LEVEL CHECK: UNLOCKED" is uppercase (`_app.quiz.tsx:408`), but the next step's h2 is sentence case (`_app.quiz.tsx:694`). Matches h1 is sentence case while roadmap and booking h1s are uppercase.
  - No `--text-*` tokens exist in `@theme`, and the style guide (`style-guide.tsx`) has no typography section.
- **Why.**
  - `typography.md › Conveying hierarchy` (paraphrased): use weight, size and color to show hierarchy, and keep that hierarchy distinct.
  - apple-design §15: build hierarchy from weight + size + leading as a set.
  - apple-design §16 (Craft): every value should be a deliberate choice you can defend. Six sizes in a 2 px band are not choices.
- **Fix.** Add a 7-step scale with leading and tracking built in. This also resolves M1.
  ```css
  /* styles.css, inside @theme inline */
  --text-caption: 0.75rem;   --text-caption--line-height: 1rem;      --text-caption--letter-spacing: 0.01em;
  --text-footnote: 0.8125rem; --text-footnote--line-height: 1.25rem;
  --text-body: 0.9375rem;    --text-body--line-height: 1.5rem;
  --text-headline: 1.125rem; --text-headline--line-height: 1.5rem;   --text-headline--letter-spacing: -0.01em;
  --text-title-2: 1.5rem;    --text-title-2--line-height: 1.75rem;   --text-title-2--letter-spacing: -0.02em;
  --text-title-1: 2rem;      --text-title-1--line-height: 2.25rem;   --text-title-1--letter-spacing: -0.025em;
  --text-display: clamp(2.25rem, 6vw, 4.5rem); --text-display--line-height: 1; --text-display--letter-spacing: -0.035em;
  ```
  - **Codemod**:
    - `text-[0.75rem]` → `text-caption`
    - `text-[0.8125rem]` → `text-footnote`
    - `text-sm`, `text-[0.875rem]`, `text-[0.9375rem]` → `text-body`
    - 1.125–1.25rem → `text-headline`
    - 1.375–1.75rem → `text-title-2`
    - 2–2.375rem → `text-title-1`
    - landing `clamp`/`vw` → `text-display`
  - Every page h1 becomes `font-display text-title-1 uppercase`.
  - Add a "Type" section to `style-guide.tsx` that renders the 7 steps.

**H3. [High] Dark mode breaks in toasts, native controls, a status banner and the toggle**

- **What.** Four separate breaks:
  1. **Toasts.** `__root.tsx:6` imports `Toaster` straight from `sonner`, and `__root.tsx:125` renders it with `richColors` and no `theme`. Sonner's default is `theme = 'light'` (verified in `node_modules/sonner/dist/index.mjs:920`), so all **117 toast calls** render as light, green or red cards with an 8 px radius and the system font, even in dark mode. The token-styled wrapper `src/components/ui/sonner.tsx` is never imported.
  2. **Native controls.** There is no `color-scheme` anywhere, so in dark mode **17 native `<select>`s** and **3 date pickers** keep light popups and light scrollbars. The date pickers are at `_app.book.$tutorId.tsx:659`, `StageDetailModal.tsx:80` and `CourseEditor.tsx:1213`.
  3. **Unverified banner.** `styles.css:275-278` (`.dark .unverified-banner { … border-color: … !important }`) overrides the inline amber warning stripe (`UnverifiedBanner.tsx:15`). The status stripe disappears in dark mode only, and the surface swaps from card to page.
  4. **Theme toggle.** The toggle is rendered on `/` (`Header.tsx:181`), but the landing is fixed dark (`_app.index.tsx:67`), so pressing it changes nothing visible there. The theme is read once at load: `DarkMode.tsx` never listens for the OS `prefers-color-scheme` change, and there is no "System" choice.

  Minor: the one float shadow is `rgb(0 0 0 / 0.5)` in both themes (`styles.css:108`, `:115-117`). It is heavy on paper and invisible on `#0a0c0e`.
- **Why.**
  - `dark-mode.md › Best practices` (paraphrased): the app must look right in both modes. People may switch to Auto while the app is running. An appearance switch that doesn't respond makes people think the app is broken.
  - `color.md › Best practices` (paraphrased): every color needs working light and dark variants.
- **Fix.**
  ```tsx
  // __root.tsx:6 and :125
  import { Toaster } from "@/components/ui/sonner";
  <Toaster position="top-center" />
  // ui/sonner.tsx
  const { theme } = useDarkMode();
  <Sonner theme={theme} toastOptions={{ classNames: { toast: "… rounded-none font-sans", actionButton: "group-[.toast]:bg-pw-accent-fill group-[.toast]:text-pw-on-accent" } }} />
  ```
  ```css
  /* styles.css :root (line 140) and .dark (line 207) */
  :root { color-scheme: light; }   .dark { color-scheme: dark; }
  ```
  - Delete `styles.css:274-282`, the unverified-banner overrides.
  - `Header.tsx:181`: change to `{!qed && <ThemeToggle />}`.
  - In `DarkMode.tsx`, add a `matchMedia("(prefers-color-scheme: dark)")` `change` listener that applies the theme only when `localStorage["pw-theme"]` is unset.
  - Make the shadow theme-aware. In `@theme inline`: `--shadow-pw-float: var(--pw-shadow-float)`. In `:root`: `--pw-shadow-float: 0 10px 30px -5px rgb(10 12 14 / .18)`. In `.dark`: `--pw-shadow-float: 0 10px 30px -5px rgb(0 0 0 / .6), 0 0 0 1px var(--pw-border)`.

**H4. [High] Sticky bars and rails slide under the 58 px sticky header; glass stacks on glass**

- **What.** The header is `sticky top-0 z-40 h-[3.625rem]` and turns translucent with a blur once you scroll (`Header.tsx:172-173`). Everything below it uses offsets that ignore its height:
  - **Quiz progress bar.** The find-tutor quiz's progress bar, which holds the "← Back" control, is `sticky top-0 z-30 bg/90 backdrop-blur` (`_app.find-tutor.tsx:143`). It sticks under the header: one blurred bar slides beneath another and takes Back with it.
  - **Side rails.** The matches filter card (`_app.matches.tsx:494`, `top-4`), the tutor-profile rail (`_app.tutor.$tutorId.tsx:761`, `lg:top-6`) and the course sidebar (`_app.courses.$slug.tsx:445`, `top-6`) each tuck about 34–41 px of their top edge under the header. The "Filters" title and the course thumbnail are what get cut.
  - **Impersonation banner.** It is also `sticky top-0` (`Header.tsx:151`), so it and the header fight for the same spot.
  - **Magic number.** The header height is repeated as `3.625rem` in 4 places (`Header.tsx:31`, `:172`, `PortalHero.tsx:38`, `:40`).
- **Why.**
  - `liquid-glass.md › Review checklist` #2 (paraphrased): glass stacked on glass blurs the hierarchy.
  - apple-design §12: never stack one translucent surface on another.
  - `layout.md › Guides and safe areas` (paraphrased): the safe area excludes regions covered by bars, so content and controls are never obscured.
- **Fix.**
  ```css
  :root { --pw-header-h: 3.625rem; }
  ```
  - `Header.tsx:31` and `:172`: `h-[3.625rem]` → `h-(--pw-header-h)`.
  - `_app.find-tutor.tsx:143`: `sticky top-(--pw-header-h) z-30 bg-[var(--pw-bg)]`, which is opaque with no `backdrop-blur`.
  - `_app.matches.tsx:494`: `top-[calc(var(--pw-header-h)+1rem)]`.
  - `_app.tutor.$tutorId.tsx:761` and `_app.courses.$slug.tsx:445`: `top-[calc(var(--pw-header-h)+1.5rem)]`.
  - Wrap the impersonation banner and the `<header>` in one `<div className="sticky top-0 z-40">` and drop `sticky` from both children.

**H5. [High] Too many prominent actions per view, and "primary" has three looks**

- **What.** Counts of filled (prominent) actions per key view:

  | View | Filled actions | Where |
  | --- | --- | --- |
  | Landing, first viewport | 2: "Start your level check" plus the DemoBanner's "Try Demo Mode →". In light theme the banner is a cream card floating on the dark hero. | `LandingCtas.tsx:28`, `DemoBanner.tsx:24`, `_app.index.tsx:76-77` |
  | Quiz (each step) | 1 ✓ | `_app.quiz.tsx:425`, `:662` |
  | Roadmap, active stage on screen | 4–5: "START HERE" pill, "Mark Stage Complete" pill (both in one card), "Book" per matched tutor, "See My Matched Tutors", anonymous "Sign up" | `_app.roadmap.tsx:761`, `:832`, `:875`, `:544`; `MatchedTutorsPanel.tsx:148` |
  | Matches | 1 + up to 8: "Find my tutor →" (which sends the user *back* to a quiz) plus "Book trial" on every card (`PAGE_SIZE = 8`) | `_app.matches.tsx:384`, `:60`; `MatchCard.tsx:176` |
  | Booking (each step) | 1 ✓ | `_app.book.$tutorId.tsx:841`, `:918` |
  | Tutor dashboard (new, unverified) | 3 + 1 per session: "Get verified →", "Complete profile" and "Complete your profile" (the same action twice), "Join" on every row | `UnverifiedBanner.tsx:27`, `dashboard.index.tsx:274`, `:732`, `:587` |

  "Primary" also has three visual treatments:
  - **Ink square**: `.pw-btn-primary`.
  - **Amber pill**: `_app.roadmap.tsx:761`, `:832`, `_app.find-tutor.tsx:717`.
  - **Amber square**: `_app.roadmap.tsx:544`, `Header.tsx:161`.
- **Why.** `buttons.md › Style`: "Keep the number of prominent buttons to one or two per view." `buttons.md › Style` also says (paraphrased) to use style, not size, to mark the preferred option.
- **Fix.** One prominent action per view. Rows use the outline style.
  - `MatchCard.tsx:176`: `className={rank === 0 ? "pw-btn-primary px-4 py-2 flex-1" : "pw-btn-outline px-4 py-2 flex-1"}`. Pass `rank` from `_app.matches.tsx:450`.
  - `_app.matches.tsx:384`: replace with `<Link to="/find-tutor" className="label-caps text-pw-accent hover:underline">Refine matches</Link>`.
  - `MatchedTutorsPanel.tsx:148`: `pw-btn-primary` → `pw-btn-outline`.
  - `_app.roadmap.tsx:761`: turn "START HERE" into a status chip, `pw-pill text-pw-accent border-[var(--pw-accent)]`. Keep `:832` as the single amber action.
  - `_app.roadmap.tsx:544`: becomes `pw-btn-outline px-3 py-1.5`.
  - `dashboard.index.tsx:732`: `pw-btn-primary` → `pw-btn-outline`. At `:587`, "Join" becomes `pw-btn-outline`.
  - `DemoBanner.tsx:24`: `pw-btn-primary` → `pw-btn-outline`. Don't render `<DemoBanner/>` on `/`, or render it inside the dark wrapper.

**M1. [Medium] Tracking isn't size-specific, and one typeface has two names with different tracking**

- **What.**
  - **Two utilities for Syne.** `font-display` sets −0.025em (via `.font-display`, `styles.css:379-382`). `font-syne` (`styles.css:97`) sets no tracking, so it inherits the body's +0.3 px (`styles.css:375`).
  - **Display text at positive tracking.** As a result the hero h1, 22–36 px (`PortalHero.tsx:101`), the Voices quotes, 20–24 px (`Voices.tsx:41`), and the 10.8vw footer wordmark (`Footer.tsx:93`) are set with positive tracking.
  - **One value for every size.** Everything on `font-display` gets the same −0.025em, from the 18 px tutor name (`MatchCard.tsx:73`) to `text-7xl` (`Footer.tsx:31`) and 16vw (`Statement.tsx:23`).
  - **Duplicates.** 112 call sites repeat `tracking-[-0.025em]`, which `.font-display` already sets.
- **Why.** apple-design §15: tracking is size-specific and never one value for every size. Tighten headings as they grow and leave body near 0.
- **Fix.** With H2's scale carrying letter-spacing per step:
  - Delete `--font-syne` (`styles.css:97`) and replace the 12 `font-syne` uses with `font-display`.
  - Delete `letter-spacing` from `.font-display` (`styles.css:381`) and remove the 112 `tracking-[-0.025em]` classes.
  - Set body `letter-spacing: 0` (`styles.css:375`). To keep the landing visually unchanged, as the comment there asks, add `tracking-[0.3px]` to the landing wrapper at `_app.index.tsx:67`.

**M2. [Medium] Three icon languages, with mismatched weights**

- **What.**
  - **Streamline "Ultimate Bold"** filled glyphs: `Icon.tsx`, 66 icons, used in 25 files.
  - **lucide-react** 2 px outline icons: 25 files.
  - **Unicode glyphs used as icons**, about 20 sites: "→" in button labels (`_app.quiz.tsx:426`, `_app.roadmap.tsx:877`, `_app.matches.tsx:385`, `_app.find-tutor.tsx:446`), "×" dismiss (`_app.roadmap.tsx:553`, `_app.matches.tsx:423`), "←" back (`_app.find-tutor.tsx:149`), "○" (`dashboard.index.tsx:722`).
  - Seven files mix both sets. For example, `MatchCard.tsx:3` uses a lucide `StarIcon` while `MatchCard.tsx:127` uses a Streamline bold `books` glyph in the same card.
  - The same meaning gets two forms: the landing arrow is lucide `ArrowRightIcon` (`LandingCtas.tsx:14`), while in-app arrows are a text "→".
  - The bold filled glyphs sit next to 10.5–13 px Sora text and outweigh it.
- **Why.** `icons.md › Best practices` (paraphrased): keep every interface icon consistent in size, detail, stroke weight and perspective, and match icon weight to the adjacent text. `cross-platform.md › Vocabulary` maps SF Symbols to "one consistent, weight-matched icon system".
- **Fix.** Standardize on lucide, which is already installed and already used on the landing.
  - Re-implement `Icon.tsx` as a name→component map (`{ books: BookOpen, lock: Lock, check: Check, … }`) that renders `<C className={className} strokeWidth={1.75} aria-hidden />`. All 25 call sites keep working.
  - Replace the text glyphs with `<ArrowRight className="size-3.5" aria-hidden />`, `<X …/>` and `<ArrowLeft …/>`.
  - Then delete the Streamline credit (`Footer.tsx:74-84`).

**M3. [Medium] Materials: six scrim recipes, decorative glass with nothing behind it, no reduced-transparency path**

- **What.**
  - **Six modal dims for one job**:
    - `bg-black/80`: `ui/dialog.tsx:22`, used via `ConfirmationModal`.
    - `rgba(10,12,14,.7)` + `blur(6px)`: `LoginModal.tsx:252`, `StageDetailModal.tsx:39`.
    - `.7` + `blur(8px)`: `MilestoneCelebration.tsx:49`.
    - `.6` + `blur(8px)`: `_app.roadmap.tsx:904`.
    - `.7` + `backdrop-blur-sm`: `ExitDemoModal.tsx:27`.
    - `.6`, no blur: `TutorSidebar.tsx:71`, `_app.onboarding.tutor.tsx:597`.

    In total there are 15 `rgba(10,12,14,…)` literals at 7 different opacities.
  - **Glass with nothing behind it.** The admin sidebar is a static column with `bg-[var(--pw-surface)]/80 backdrop-blur-md` (`admin.tsx:61`). Nothing scrolls beneath it, so the blur only costs paint.
  - **No accessibility fallbacks.** The codebase has no `prefers-reduced-transparency` or `prefers-contrast` rule anywhere.
  - Modal panels themselves are opaque `pw-card`s, which is good: no glass on glass inside modals.
- **Why.**
  - `materials.md › Liquid Glass` (paraphrased): keep glass to the functional layer, and use it sparingly.
  - `liquid-glass.md › Review checklist` #5: Reduce Transparency needs an opaque fallback.
  - apple-design §12: one material weight per role, and reduced transparency makes surfaces frostier or solid.
  - apple-design §14 (`prefers-reduced-transparency`).
- **Fix.**
  ```css
  :root { --pw-scrim: rgb(10 12 14 / 0.7); }
  .pw-scrim { background: var(--pw-scrim); backdrop-filter: blur(6px); }
  @media (prefers-reduced-transparency: reduce) {
    .pw-scrim, header { backdrop-filter: none; }
    header { background-color: var(--pw-bg) !important; }
  }
  ```
  - Use `className="fixed inset-0 … pw-scrim"` at the 7 sites and delete their inline `style`.
  - `ui/dialog.tsx:22`: `bg-black/80` → `pw-scrim`.
  - `admin.tsx:61`: drop `/80 backdrop-blur-md`.

**M4. [Medium] Layout rhythm: 12 primary-button sizes, 14 card paddings, small hit targets**

- **What.**
  - **Primary buttons.** `.pw-btn-primary` appears with **12 padding combinations**, from `px-3 py-1.5` to `px-8 py-4`. Rendered heights run from about 29 px to 46 px. The smallest are "Join" (`dashboard.index.tsx:587`), "Book" (`MatchedTutorsPanel.tsx:148`) and the demo CTA (`DemoBanner.tsx:24`), all `py-1.5`, so about 29 px tall on phones.
  - **Cards.** `.pw-card` appears with **14 padding variants** (`p-2.5` through `p-12`).
  - **Doc vs code.** The doc says primary is `px-8 py-4` and card is `p-8`. The classes default to `px-7 py-3.5` (`styles.css:662`) and `p-7` (`styles.css:652`).
  - **Spacing scale.** Gap and padding use 16 and 21 Tailwind steps, which is fine. There are 63 arbitrary sizes, mostly `max-w-[…]`.
- **Why.**
  - `liquid-glass.md › Review checklist` #7 / apple-hig SKILL.md › Lens 1: 44×44 pt default and 28×28 pt minimum on mobile.
  - `buttons.md › Style` (paraphrased): use style, not size, to tell options apart. Buttons of different sizes side by side look inconsistent.
- **Fix.** Two sizes, set in the class rather than at call sites.
  ```css
  .pw-btn-primary, .pw-btn-outline, .pw-btn-secondary { min-height: 2.75rem; padding-inline: 1.5rem; }
  @media (min-width: 48rem) { .pw-btn-sm { min-height: 2.25rem; padding-inline: 1rem; } }
  ```
  - Delete the per-call `px-*`/`py-*` on `pw-btn-*`. Use `pw-btn-sm` only in dense desktop rows.
  - Card: default `p-6`, plus one `.pw-card-tight { padding: 1rem }`.
  - Update `QED_DESIGN_SYSTEM.md:38` and `:42` to match.

**M5. [Medium] Header wayfinding: one active state, and nav dressed as buttons**

- **What.**
  - **Active state.** Only "Dashboard" gets an active state, a soft amber *background* (`Header.tsx:118`). "My Roadmap", "Find a tutor", "My sessions" and "Messages" show none.
  - **Nav that looks like buttons.** On desktop, "Dashboard", "My Roadmap" and "Admin" render in the boxed CTA style (`Header.tsx:111`, `primary = c.accent`), the same box as "Sign In". Their sibling nav links are plain text.
- **Why.**
  - apple-design §16, Wayfinding (paraphrased): every screen should answer "Where am I?".
  - `design-principles.md › Familiarity` (paraphrased): keep visuals and interactions consistent.
- **Fix.**
  - `Header.tsx:111`: `const primary = stacked ? \`${c.link} px-2\` : c.link;`
  - Add `activeProps={{ className: "text-pw-accent" }}` to every nav `<Link>` and delete the inline `style` at `:118`. This also matches the doc's "active = amber".

**L1. [Low] Font loading and weights**

- **What.**
  - **Loading path.** The fonts come in through `@import url(fonts.googleapis.com…)` inside the app stylesheet (`styles.css:1`), with no preconnect (`__root.tsx:73-78`). That is a 3-hop chain: HTML → app CSS → Google CSS → woff2.
  - **Weights.** It loads 9 weights across 3 families: DM Mono 400/500, Sora 400/500/600/700, Syne 600/700/800.
  - **DM Mono's use.** DM Mono serves 14 numeric call sites (`font-mono-pw`). `font-mono` (18 uses, style guide only) resolves to the system mono instead.
- **Why.**
  - `typography.md › Conveying hierarchy` (paraphrased): use as few typefaces as possible.
  - apple-design §15: default to system type unless you have a reason.
- **Fix.**
  - Delete `styles.css:1`. In `__root.tsx` `links`, add preconnects to `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (`crossOrigin: "anonymous"`), plus the stylesheet link for `Sora:wght@400;500;600;700&family=Syne:wght@600;700;800`.
  - Replace `.font-mono-pw` (`styles.css:384-386`) with `font-variant-numeric: tabular-nums;` on Sora. Judgment call: confirm Sora ships `tnum` first, and if it doesn't, keep DM Mono 400 only.

---

### Craft notes

**CN1. [High] It reads as a template, not as PathWise**

- **What.** The palette and shape language were imported from a generated "QED Math Portal" draft and kept as-is (`QED_LANDING_PLAN.md:5-8`). They match all three generated looks the skill names:
  - **Near-black with one warm accent**: `#0a0c0e` with amber `#e8913c` (`styles.css:209-214`).
  - **Warm cream with a brown-terracotta accent** in light mode: `#ede7dc` with `#8a4a0a` (`styles.css:146-150`).
  - **A broadsheet**: radius forced to 0 site-wide (`styles.css:26-37`), hairline `divide-y` rows, uppercase eyebrows over every block, a table header over three testimonials (`Voices.tsx:28-35`), and a 16vw outline "01" on content that isn't a sequence (`Statement.tsx:22-27`).

  The only product roots are a chalkboard photo and the word "path". Nothing speaks to Moldova, to Math *and* English, or to students. The Voices section quotes a Spanish learner and a front-end developer (`Voices.tsx:6`, `:18`).
- **Why.** apple-hig SKILL.md › Lens 3 craft lens (paraphrased): a palette, type pairing or layout with no reason rooted in the product is a default, not a choice. That includes 01/02/03 markers on non-sequences.
- **Fix.** Don't flatten it. Anchor it to the one product-true idea, **the path**:
  - **Carry the journey line into the roadmap.** The roadmap is the product's actual path, but it is drawn as a generic grey hairline with dots (`_app.roadmap.tsx:667`). Add the completed segment in amber:
    ```tsx
    <div className="absolute left-3 top-2 w-px bg-pw-accent-fill" style={{ height: `${pct}%` }} />
    ```
    Put it next to `:667` so the line you followed on the landing is the line you're on.
  - **Replace the off-product testimonials** with real Moldovan Math/English students, or remove the Voices section until they exist.

**CN2. [Medium] Boldness is spent in five places, and the logo appears three times**

- **What.** The landing stacks five set-pieces:
  1. The 250vh portal with duotone, two flying dots and animated letter-spacing (`PortalHero.tsx`).
  2. A 16vw outline numeral plus a rotating dashed ring (`Statement.tsx:21-40`).
  3. A 3D skewed auto-playing card stack (`StepDeck.tsx`).
  4. The amber comet (`JourneyLine.tsx`).
  5. A glowing 10.8vw footer wordmark (`Footer.tsx:87-101`).

  The wordmark itself appears three times in one scroll: `Header.tsx:178`, `PortalHero.tsx:86-93` and `Footer.tsx:92-100`. The copy repeats too: "Find exactly where you stand" (`PortalHero.tsx:102`, `Statement.tsx:18`, `Footer.tsx:37`) and "Learn deliberately" (`Statement.tsx:13`, `StepDeck.tsx:143-145`, `:148`, `Footer.tsx:37`).
- **Why.**
  - apple-hig SKILL.md › craft lens: have one signature element and keep everything around it quiet.
  - `branding.md › Best practices` (paraphrased): don't show your logo throughout the app unless context needs it.
  - `design-principles.md › Delight` (paraphrased): don't mistake delight for decoration.
- **Remove one accessory:** delete `Statement.tsx:21-40`, the outline "01" and the rotating ring. That section's headline also repeats the hero h1. Second candidate: the footer wordmark (`Footer.tsx:87-101`).

**CN3. [Medium] Structure that says something untrue**

- **What.**
  - **Voices table.** The "Learning" column header (`Voices.tsx:32`) sits over "Verified Math Tutor" and "Front-end developer" (`:12`, `:18`).
  - **Dashboard labels.** Card eyebrows repeat their own titles: "Upcoming sessions / Next up" (`dashboard.index.tsx:557-558`), "Profile / Completeness" (`:680-682`), "Reviews / Latest feedback" (`:753-755`), "Lead funnel / Conversion" (`:636-638`).
  - **Color by position.** Colors alternate by array index with no meaning: `StepDeck.tsx:212` (`i % 2 ? teal : amber`) and `StageRoster.tsx:4-6` (Stage 01 amber, 02 teal, 05 amber).
  - **Honest structure exists too.** The landing's "Stage 01 / 02 / · · · / 05" is good: the ellipsis says something true.
- **Why.**
  - apple-hig SKILL.md › craft lens: numbering, eyebrows and dividers should say something true.
  - `color.md › Best practices`: one color means one thing.
- **Fix.**
  - Delete the header row `Voices.tsx:28-35`.
  - In dashboard cards, keep the title and drop the eyebrow, except where it adds information ("Last 30 days", `:814`).
  - Set the `StageRoster.tsx` `tone` to `text-qed-ink-2` for all rows.

**CN4. [Medium] Controls speak in the brand's micro-voice**

- **What.** Every button, nav item, pill, badge and form label uses `label-caps`: uppercase, 0.15em tracking, 10.5–11.5 px (`styles.css:128-133`, `:477-480`, `:533-537`). Syne already carries the personality in display text, which is the right place for it. Uppercase micro-labels on every control is also the broadsheet tell from CN1.
- **Why.**
  - apple-hig SKILL.md › craft lens: system type suits navigation and controls, and brand belongs in display text, content and moments.
  - `branding.md › Best practices` (paraphrased): a custom font suits headlines, with system fonts for body and small sizes.
- **Fix.** After C1, move buttons and nav to sentence case: `text-transform: none; letter-spacing: 0; font-size: 0.8125rem; font-weight: 600`. Keep `label-caps` for eyebrows and chips only.

---

### Drift from `docs/QED_DESIGN_SYSTEM.md`

1. **Fonts.** The doc says "Sora (400/600)" (`:26`). The code loads Sora 400/500/600/700 **plus DM Mono 400/500** (`styles.css:1`), and uses `font-medium` 64 times. `QED_LANDING_PLAN.md:28` repeats the stale list.
2. **Micro size.** The doc says "label-caps … micro 9px" (`:27`). That conflicts with the 11 pt floor (C1).
3. **Nav active state.** The doc says "Nav link … active = amber" (`:41`). Only Dashboard has an active state, and it uses an `accent-soft` *background* (`Header.tsx:118`).
4. **Primary button.** The doc says "px-8 py-4" (`:38`). The class default is `px-7 py-3.5` (`styles.css:662`), and call sites use 12 variants.
5. **Card.** The doc says "p-8" (`:42`). The class default is `p-7` (`styles.css:652`), and call sites use 14 variants.
6. **Progress bar.** The doc says ".pw-progress → h-px track" (`:60`). The code uses `height: 2px` (`styles.css:621`). This one is deliberate per the code comment; update the doc.
7. **"Muted".** The doc says "muted #6c7378 decorative only" (`:19`). But `--pw-muted` is `#9ea5a8` / `#4a5257` (`styles.css:212`, `:149`) and serves as nav text (`styles.css:538`). The two "muted" tokens mean different things. `--pw-ink-3` is a copy of `--pw-ink-2` in both themes (`styles.css:158-159`, `:220-221`).
8. **Syne case.** The doc says "Syne … usually UPPERCASE" (`:25`). Sentence-case Syne headings appear at `_app.matches.tsx:372`, `_app.quiz.tsx:694`, `PortalHero.tsx:101` and `Voices.tsx:41`.
9. **Toggle on the landing.** The doc says "Landing always dark … Rest of site: keep light/dark toggle" (`:54`). The toggle renders on `/` (`Header.tsx:181`), and the DemoBanner follows the app theme over the dark hero (`_app.index.tsx:76-77`).
10. **Shadow.** The doc allows one shadow, tokenized as `shadow-pw-float`. `StepDeck.tsx:205` re-types the literal as `shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)]`.
11. **Spring.** The doc's motion spring is "260/26" (`:49`). `StepDeck.tsx:93` uses `stiffness: 110, damping: 14`, which bounces. The motion audit (03) covers this.
12. **Dead overrides.** The doc lists component classes but not the dark-only overrides in `styles.css:274-337`. `.course-hero` / `.course-title` (`:300-312`) match no element, and `.unverified-banner` breaks the status stripe (H3).

---

### What works

- **Token discipline.**
  - **Zero** Tailwind palette classes (`bg-blue-500`, `text-gray-*`) in app code.
  - **Zero** `[#hex]` in classNames.
  - The remaining hex values are confetti arrays and the Google logo. The confetti array is copied in 5 files (`_app.roadmap.tsx:456`, `_app.quiz.tsx:184`, `_app.course-match.tsx:216`, `_app.onboarding.tutor.tsx:33`, `MilestoneCelebration.tsx:29`), so move it into one constant.
  - Out-of-palette `qed-*` use outside the landing is limited to media letterboxes (`_app.onboarding.tutor.tsx:607`, `pathwise.demo.tsx:548`). `src/pathwise/CourseCard.tsx` (17 `qed-*` refs) is never imported, so it is dead code.
- **Contrast is engineered, not hoped for.** Text tokens in both themes, computed from the hex values:

  | Token | Light | Dark |
  | --- | --- | --- |
  | ink-2 | 6.47:1 | 7.84:1 |
  | amber text | 5.57:1 | 7.97:1 |
  | teal | 5.83:1 | 6.82:1 |
  | gold | 5.62:1 | 10.9:1 |

  The text-safe vs fill amber split (`styles.css:79-82`, `:144-145`, `:167-169`) is exactly the right move.
- **Radius discipline.** Corners are either 0 or `rounded-full`, with 72 `rounded-full` uses for pills, avatars and dots. There are no stray `rounded-lg`s in app code.
- **Leading tracks size inversely.** Display text is set at `leading-none` to 1.15, card titles at 1.05, and body at `leading-relaxed`.
- **Dynamic Type equivalent.** Sizing is rem-based and the root goes to 120% at ≥48rem (`styles.css:348-355`), so text and spacing scale with the user's browser font size.
- **Modal surfaces** are opaque cards over a dim, so there is no glass-on-glass inside dialogs.
- **Syne in display sizes** gives the brand a voice that system type wouldn't.

### Platform notes

- **Web app.** apple-hig Lens 2 native conventions (tab bar, menu bar, settings window) are not applied. Only the principles and foundations are.
- **The theme toggle.** `dark-mode.md` advises against an app-level appearance switch. On the web there is no per-site OS setting, so a toggle is defensible. It still needs a "System" state that follows `prefers-color-scheme` live (H3).
- **The 120% root at ≥48rem** means every desktop px figure above is ×1.2 (for example, header height is 69.6 px on desktop). Phone figures are as stated.
- **Rendered checks to confirm** in the live-site pass:
  - The sticky overlaps in H4.
  - The light toasts in dark mode (H3).
  - The date-picker icon on `#101317` in dark mode (H3).

### Suggested fix order (who executes: whoever picks up the PR)

1. **C1** sizes (about 30 min).
2. **H3** dark parity (about 1 h).
3. **H4** sticky offsets (about 30 min).
4. **H5** prominent actions (about 1 h).
5. **H1** amber roles (about 1–2 h).
6. **H2 + M1** type scale and codemod (half a day, mostly mechanical).
7. **M2–M5**, then the craft notes.
