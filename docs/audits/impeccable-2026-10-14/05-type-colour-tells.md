# 05 · Typography, colour and theming tells

Impeccable audit, 2026-10-14. Lens: type scale, monospace use, colour discipline, theme integrity, browser surfaces (tells 1, 2, 3, 15; `reference/craft-floor.md` › Type and › Browser surfaces; `reference/typeset.md`; `reference/colorize.md`; `reference/audit.md` › 3. Theming). The detector is not vendored, so every count below comes from a grep sweep of `src/` (routes, components, pathwise, lib, styles.css; `integrations/` and `routeTree.gen.ts` excluded). Each finding was then read in context.

Where this overlaps `01-visual-tells.md` (kickers, browser surfaces, DM Mono, stripes), this file adds only the type and colour side and points back to it.

## Verdict

**The tokens are good. The type system is not.** Tells 1, 3 and 15 are clean: no purple/indigo/blue gradient, no gradient text, no oversized italic serif. Tell 2 is clean too: Syne + Sora + DM Mono, no Inter, Geist or Roboto. All `text-*`/`bg-*` colours route through `--pw-*`/`qed-*` tokens, and there are 0 Tailwind palette classes in app code (4 `bg-black/80` + 1 `text-white` remain, in shadcn primitives). What reads as generated:

1. **No type scale.** 30 distinct computed font sizes, 8 of them between 11px and 14px. Page `h1`s come in 9 sizes. 110 of the 143 classed paragraphs are set below 16px, including the tutor bio and the legal pages.
2. **Uppercase, wide-tracked micro-labels are the house voice.** There are 177 `label-caps` plus 69 `.pw-pill`/`.pw-badge` uses, which are uppercase in the base CSS. That puts **controls in caps, against the brief's sentence-case rule**: quiz answers, booking time slots, filters, "View details". User prose gets caps too: the tutor headline.
3. **Theme leaks.** Sonner's `richColors` paints 33 success toasts green and 4 info toasts blue. The toast action button is white on `#e8913c` in dark mode (2.5:1). Dark-only `!important` overrides make the two themes behave differently, and about 10 CSS blocks are dead.
4. **Orange is sprinkled, and its names are stale.** There are 6 orange token names for 2 values, plus "teal"/"gold" labels in the style guide, in comments and in `docs/QED_DESIGN_SYSTEM.md`, which still prescribes teal and caps buttons. A third orange (`#c2560f`) is in use.

**Theming score (audit.md §3): 3/4**: full token system, both themes composed, a handful of hard-coded and leaking values.

Severity count: P1 × 4 · P2 × 7 · P3 × 7.

## Sweep counts

| # | Measure | Count | Note |
|---|---|---|---|
| 1 | Distinct font sizes (computed) | **30** + 1 clamp + 3 vw wordmarks | 146× `text-[0.8125rem]`, 110× `text-[0.75rem]`, 98× `text-sm`, 90× `text-[0.875rem]`. One-offs: 0.625, 0.7188, 0.7812, 0.8, 0.8438, 1.0625, 1.3125, 2.375, 2.875 rem |
| 2 | Page `h1` sizes | **9** (1.25 → 2.25rem) | 22× `text-2xl`, 9× `[1.75rem]`, 6× `text-3xl`, 4× `[2rem]`, 3× `[2.25rem]`, 2× `[1.875rem]`, 1× each `[2.125rem]`, `[1.625rem]`, `xl` |
| 3 | Weights | 5 (400/500/600/700/800) | Fine. `font-display font-normal` asks for Syne 400, which is not loaded (`styles.css:1` loads 600–800), so it renders 600 (roadmap.tsx:920) |
| 4 | Tracking | -0.025em ×109, 0.15em (label-caps, pill, badge), `tracking-widest` ×1 in app, body +0.3px | Display tracking is within the -0.04em floor. |
| 5 | Body text | 110/143 classed `<p>` at ≤15px; 5 at ≥16px; 28 inherit 16px | See P1-3 |
| 6 | Uppercase micro labels | `label-caps` **177** in 49 files · `.pw-pill` 52 · `.pw-badge` 17 · display headings with `uppercase` 115 lines | ~15 are true eyebrows (01 › P1-1/P2-1) |
| 7 | Monospace | `font-mono-pw` (DM Mono) 12 · `font-mono` (system mono, not DM Mono) 20 | 9 of 12 DM Mono sites are data. See P3-1 |
| 8 | Hard-coded colours outside styles.css | 4 hex (celebrate.ts) + 4 Google-logo hex · 14 `rgba()` | 0 off-palette hues in app code; the leak is via Sonner (P1-1) |
| 9 | Orange references | ~340 (`--pw-accent*`, `pw-secondary`, `qed-amber`, `qed-teal-ink`) | Tutor profile alone: 20 |
| 10 | `tabular-nums` | 8 sites | 0 on prices or time slots |
| 11 | `::selection` / `caret-color` / `scrollbar-color` | 0 / 0 / 0 | 01 › P2-5 |

---

## P1: users see it, or it breaks the brief

### [P1-1] Toasts leak green and blue, and the dark-mode action button fails contrast
- **Location:** `src/routes/__root.tsx:125` `<Toaster position="top-center" richColors />` · `src/components/ui/sonner.tsx:18` `actionButton: "group-[.toast]:bg-[var(--pw-accent)] group-[.toast]:text-white"`
- **Tell:** off-palette accent (colorize › Apply at system scale); theming, "values that don't update on theme change" (audit.md §3).
- **What:** `richColors` turns on Sonner 2.0.7's own palette. Success uses `hsl(143 85% 96%)` (mint), info uses `hsl(208 100% 97%)` (blue), and warning uses yellow. Its selector `[data-rich-colors=true][data-sonner-toast][data-type=success]` (specificity 0,3,0) beats the `group-[.toaster]:bg-[var(--pw-surface)]` classNames (0,2,0). So the 33 `toast.success` and 4 `toast.info` calls render green and blue on a chalk or AMOLED page. In dark mode the action button is `#ffffff` on `#e8913c`, which is **2.5:1** (needs 4.5:1).
- **Why:** The brief allows only amber-orange and orange, with red for errors. colorize › Contrast: body text needs 4.5:1.
- **Fix:** Remove `richColors` from `__root.tsx:125`. In `sonner.tsx` set `actionButton: "group-[.toast]:bg-pw-accent-fill group-[.toast]:text-pw-on-accent"` and add `error: "group-[.toaster]:text-[var(--pw-danger)] group-[.toaster]:border-[var(--pw-danger)]"`. Success and info stay ink on surface. The text already says what happened.

### [P1-2] Controls are uppercase because the base class forces it (contradicts the brief)
- **Location:** `src/styles.css:509-515` `.pw-pill { … letter-spacing: 0.15em; text-transform: uppercase; }` · `styles.css:568-581` `.pw-badge` (same) · call sites: `_app.quiz.tsx:374` (goal answers), `_app.book.$tutorId.tsx:576` (time slots, "9:00 AM" in caps and tracked), `_app.sessions.index.tsx:96`, `_app.matches.tsx:441/550/577`, `_app.library.tsx:317`, `_app.onboarding.tutor.tsx:794/911/1241`, `AvailabilityGrid.tsx:179`, `TutorSidebar.tsx:190` · plus `label-caps` on buttons: `CourseCard.tsx:134` "View Details", `dashboard.index.tsx:491` daily/weekly/monthly, `pathwise.demo.tsx:206/212`, `_app.find-tutor.tsx:145` (wraps the "← Back" button)
- **Tell:** the broadsheet micro-label as house style; brief: sentence-case controls.
- **What:** PR #29 made `.pw-btn-*` and `.pw-nav-item` sentence case, but `.pw-pill` is the class the app uses for every toggle, filter and choice chip, and it still sets caps + 0.15em at 12px. Quiz answers and booking times read as shouting labels.
- **Why:** Owner brief (sentence-case controls). typeset › Apply: keep repeated roles consistent across screens and states. Buttons are sentence case and pills are not.
- **Fix:** In `.pw-pill` replace the three lines with `font-size: 0.8125rem; letter-spacing: 0; text-transform: none;` (the same as `.pw-btn-secondary`). Swap `label-caps` for `text-[0.8125rem] font-semibold` at the 5 button call sites above. Write the copy in sentence case: "View details", "Daily". `.pw-badge` is status, not a control. It can keep caps, but it reads better as `text-transform: none` too (see P2-1).

### [P1-3] No type scale: 30 sizes, 8 of them inside 3px, and 9 page-title sizes
- **Location:** sweep row 1–2. Worst clusters: 11px `0.6875` ×36 · 11.5px `0.7188` (`_app.onboarding.tutor.tsx:1150,1208`) · 12px · 12.5px `0.7812` (`onboarding.tutor:583`) · 12.8px `0.8` (`ui/form.tsx:131,153`, `ui/calendar.tsx:87`) · 13px · 13.5px `0.8438` (`onboarding.tutor:1405`) · 14px. Page titles: `_app.sessions.index.tsx:90` `text-2xl` (24px), `_app.find-tutor.tsx:754` `[1.75rem]`, `_app.roadmap.tsx:570` `[2rem]`, `_app.library.tsx:207` `[2.125rem]`, `_app.settings.verification.tsx:69` `[2.25rem]`, `_app.demo.tsx:45` `[2.875rem]`.
- **Tell:** craft-floor › Type: "obvious scale and weight steps". typeset › Scale and consistency: "a deliberate role scale, or a collection of arbitrary values?"
- **What:** Half-pixel steps cannot carry different jobs. The same role (page `h1`) changes size from route to route.
- **Why:** typeset › Hierarchy: adjacent sizes too close to carry different jobs.
- **Fix:** Add role tokens to the `@theme inline` block in `styles.css`, which Tailwind v4 turns into `text-*` utilities:
  ```css
  --text-meta: 0.75rem;   /* 12: labels, timestamps, chips */
  --text-ui: 0.875rem;    /* 14: buttons, secondary text, table cells */
  --text-body: 1rem;      /* 16: prose */
  --text-lead: 1.25rem;   /* 20: h3, card titles */
  --text-h2: 1.75rem;     /* 28 */
  --text-h1: 2.25rem;     /* 36: every page h1 */
  ```
  Then map 0.625–0.8 → `text-meta`, 0.8125–0.875 → `text-ui` (including `.pw-btn-*` `font-size`), 0.9375–1.0625 → `text-body`, 1.125–1.375 → `text-lead`, 1.5–1.875 → `text-h2`, 2–2.875 → `text-h1`. One `h1` size on every app route. Keep the landing's own clamp/vw display sizes.

### [P1-4] Reading text is below 16px where people actually read
- **Location:** tutor bio `_app.tutor.$tutorId.tsx:427` `text-[0.875rem]` (14px, in a ~628px column ≈ 78ch) · legal pages `pathwise/legal.tsx:23` `text-[0.9375rem]` · tutor experience `_app.tutor.$tutorId.tsx:528` `text-[0.8125rem]` · MatchCard headline `MatchCard.tsx:89` `text-[0.8125rem]` · 110/143 classed paragraphs ≤15px (sweep row 5)
- **Tell:** 15-tell checklist ("body text is 16px or larger"); typeset › Apply ("1rem / 16px as the ordinary web body floor").
- **What:** The bio is the text a parent reads to choose a tutor. It is 14px, and its measure is over 75ch.
- **Why:** craft-floor › Type: body measure 65–75ch. typeset › Apply: 16px floor unless a dense role justifies otherwise. Metadata may stay at 12–14px; prose may not.
- **Fix:** `_app.tutor.$tutorId.tsx:427` → `text-body max-w-[68ch] leading-relaxed`. `legal.tsx:23` → `text-body` (its `max-w-2xl` then gives ≈65ch). Course descriptions, the bio preview in MatchCard and the review text follow the same rule. Labels, meta and table cells stay `text-meta`/`text-ui`.

---

## P2: noticeable, fix in the next pass

### [P2-1] User prose and full sentences set in caps (the broadsheet tell at its worst)
- **Location:** `_app.tutor.$tutorId.tsx:361` `<p className="label-caps text-pw-accent order-first mb-4">{tutor.headline}</p>` (a tutor-written sentence of up to 140 chars, e.g. the placeholder "MIT-trained math tutor specializing in SAT prep") · `components/landing/Footer.tsx:36` `text-sm uppercase tracking-widest` on a full sentence · `CourseCard.tsx:89` course titles `uppercase` at 15px · `CourseCard.tsx:92/96` tutor name and stats in `label-caps` · literal caps in source: `_app.roadmap.tsx:569/590/615/636` "YOUR ROADMAP / YOUR RANK / YOUR MISSION / ESTIMATED JOURNEY", `_app.quiz.tsx:553`, `StageDetailModal.tsx:54`, `CourseEditor.tsx:1427`
- **Tell:** uppercase + wide tracking on micro labels everywhere. The headline is also an eyebrow above the `h1` (`order-first`), which craft-floor › Refuse bans outright.
- **What:** There are 177 `label-caps` uses in 49 files. Most are short meta labels and pass. The ones above are sentences or names, where caps cut reading speed. The hard-coded caps strings also stay caps if the class is ever removed.
- **Why:** typeset › Do not make type decorative at the expense of comprehension.
- **Fix:** Tutor headline: drop `label-caps text-pw-accent order-first mb-4`, render it after the `h1` as `<p className="mt-2 text-body text-[var(--pw-ink-2)] max-w-[60ch]">`. Footer.tsx:36 → `max-w-sm text-body text-qed-ink-2`. CourseCard:89 drop `uppercase`; :92/:96 `label-caps` → `text-meta`. Rewrite the literal caps strings in sentence case ("Your rank"), and let the class do any casing.

### [P2-2] The eyebrow kickers, from the type side: `/find-tutor`'s orange 01–08 duplicate the progress label
- **Location:** `_app.find-tutor.tsx:753` `<div className="label-caps text-pw-accent">{kicker}</div>` fed `"01"`…`"08"` (lines 271–605), directly under `:146` "Question {n} of {total}". Other true eyebrows: `_app.settings.verification.tsx:67`, `_app.library.tsx:206`, `auth.choose-role.tsx:128`, `_app.onboarding.student.tsx:55` ("Step 1 of 1"), `ExitDemoModal.tsx:29` (orange), `_app.demo.tsx:44` (orange), `legal.tsx:19`, plus the four landing ones in 01 › P1-1.
- **Tell:** tell 12 (numbered labels), craft-floor › Refuse (kicker above heading: "a ban, not a default"), and orange spent on static text.
- **What:** The step number is shown twice, once in orange. "Step 1 of 1" carries no information.
- **Why:** colorize › Operate: colour encodes action, selection, status and wayfinding, and "rarity gives an accent force".
- **Fix:** Drop the `kicker` prop and its `<div>` from `Heading` (find-tutor:750–756). The sticky progress label already numbers the steps. Delete the other eyebrows listed. `legal.tsx:19` "Last updated …" moves under the `h1` as `mt-2 text-meta text-[var(--pw-ink-2)]` (8px, on grid).

### [P2-3] Orange is sprinkled on static content instead of owning one job per view
- **Location:** `_app.tutor.$tutorId.tsx` (20 accent refs): `:361` headline, `:377` response time `text-pw-secondary`, `:688` quote icon, `:766` globe icon `text-[var(--pw-accent-2)]`, `:783/:786` "First session free" / "Free discovery call" `text-[var(--pw-accent-2)]`, `:339` initials avatar `bg-pw-accent-fill` · landing alternation by index `StepDeck.tsx:212` `i % 2 ? "text-qed-teal-ink" : "text-qed-amber"`, `StageRoster.tsx:4-6` tones alternate amber/orange/amber
- **Tell:** accent on decorative/static text; colorize › Apply ("let the strongest color own a deliberate region or role instead of scattering tiny accents").
- **What:** On the tutor profile, orange marks interactive links, the verified status, ratings, an icon, a perk line, a tagline and an avatar all at once. When everything is orange, the Book button's hover has nothing to stand out against. On the landing, amber and orange alternate with no meaning.
- **Why:** colorize › Apply: "do not spend [the primary action's] color on decoration".
- **Fix:** On the tutor page keep orange for links/hover, the verified badge and the star rating. Set `:377`, `:688`, `:766` to `text-[var(--pw-ink-2)]`. Set `:783/:786` to `text-[var(--pw-ink)]` with a `check` icon. Set `:339` to `bg-[var(--pw-surface-2)] text-[var(--pw-ink)]`. Landing: one tone, `text-qed-amber` for StepDeck:212 icons and for every StageRoster stage label.

### [P2-4] Six orange token names for two values, plus stale "teal"/"gold" naming, and a design doc that contradicts the brief
- **Location:** `styles.css:147/158/159` and `:211/221/222`: `--pw-accent` = `--pw-accent-3` and `--pw-secondary` = `--pw-accent-2` in both themes. `--pw-muted` = `--pw-ink-2` = `--pw-ink-3` (`:146/155/156`, `:210/218/219`) · visible labels `style-guide.tsx:171` "Teal (text)", `:172` "Gold (text)" · comments `TrustBadge.tsx:4`, `MatchCard.tsx:33`, `VerificationBadge.tsx:15`, `_app.onboarding.tutor.tsx:33`, `styles.css:776`, `styles.css:94` `--color-qed-teal` · `docs/QED_DESIGN_SYSTEM.md:7,21` (teal `#2e6b72`, gold), `:12,27` (`label-caps` = 10.5px, "buttons, nav, chips"), `:38-41` (caps buttons), `:55` (ink `#0a0c0e`)
- **Tell:** audit.md §3 "Inconsistent tokens: using wrong tokens, mixing token types".
- **What:** Status tiers still read "teal = verified, gold = pending" in code, but both now resolve to the same two oranges. 39 `--pw-accent-3` uses are indistinguishable from `--pw-accent`. The design doc agents are told to follow still prescribes teal and uppercase buttons, so the next generated screen will reintroduce them.
- **Why:** colorize › Apply: "Define primitive values and semantic tokens … Theme changes should normally remap semantic roles". Duplicate names for one value are not roles.
- **Fix:** Find/replace `--pw-accent-3` → `--pw-accent`, `--pw-accent-2` → `--pw-secondary`, and `--pw-ink-3`/`--pw-muted` → `--pw-ink-2` (one `text-pw-muted` utility ×10 → `text-[var(--pw-ink-2)]`). Then delete the aliases from both blocks. Rename the style-guide swatches to "Orange (text)" and drop "Gold". Rename `qed-teal-ink` → `qed-orange` (5 call sites). Rewrite `docs/QED_DESIGN_SYSTEM.md` lines 7, 12, 21, 27, 38–41 and 55 to the brief: orange-only, sentence-case controls, `label-caps` = 12px meta only, light ink `#121110`.

### [P2-5] Dark-only `!important` overrides make the themes diverge
- **Location:** `styles.css:324-335` `.dark .chart-range-pill { color: var(--pw-ink) !important }` · `styles.css:273-280` `.dark .unverified-banner { background: var(--pw-bg) !important }` · `styles.css:313-321` `.dark .admin-impersonate-btn { border: 1px solid var(--pw-accent-2) !important }`
- **Tell:** audit.md §3 "Theme switching issues".
- **What:** In light mode, the inactive daily/weekly/monthly pills are `ink-2` with an orange hover (`dashboard.index.tsx:491`). In dark mode the override forces full ink and kills the hover. The unverified banner is `pw-card` surface in light mode and ground in dark mode. The Impersonate button gets an orange border in dark mode only. `.dark .unverified-banner .text-\[var\(--pw-ink-2\)\]` (`:278`) sets a value to itself.
- **Why:** colorize › Verify: "Light and dark themes are each composed, not mechanically inverted". The same component should keep the same role in both themes.
- **Fix:** Delete `styles.css:272-280`, `:312-335`. The call sites already set both states with tokens. If the Impersonate button needs emphasis, add `border-[var(--pw-secondary)]` at `admin.users.tsx:196` so it applies in both themes. Fold `.dark .impersonation-banner` (`:283-295`) into the classes on `Header.tsx:178`.

### [P2-6] Prices, times and live numbers use proportional figures
- **Location:** `_app.find-tutor.tsx:607` 3.5rem Syne budget value that changes as the slider moves · `_app.book.$tutorId.tsx:576` time-slot pills · `_app.tutor.$tutorId.tsx:773` `formatPrice` in `font-display text-2xl` · `dashboard.index.tsx:539` and `:287` earnings · `_app.roadmap.tsx:597`. Only 8 `tabular-nums` sites exist (sweep row 10).
- **Tell:** craft-floor › Browser surfaces ("the numerals in tabular data").
- **What:** The budget figure shifts sideways on every slider step, and slot times do not align in their grid.
- **Why:** typeset › Apply: "Use numeric, tabular … features when their content benefits."
- **Fix:** Add `tabular-nums` at each location above, and to `.pw-pill` in `styles.css` (`font-variant-numeric: tabular-nums;`), since pills hold times and prices. DM Mono sites already have fixed-width digits and need nothing.

### [P2-7] Selection, caret, scrollbar and underline offset are browser defaults (type and colour half of 01 › P2-5)
- **Location:** `styles.css` has 0 `::selection`, 0 `caret-color`, 0 `scrollbar-color`. Underline offsets are mixed: `underline-offset-2` ×6 and `underline-offset-4` ×9 (e.g. `_app.course-match.tsx:322` vs `dashboard.settings.index.tsx:18`).
- **Tell:** craft-floor › Browser surfaces.
- **Fix:** In `@layer base`:
  ```css
  ::selection { background: var(--pw-accent-fill); color: var(--pw-on-accent); }
  :root { caret-color: var(--pw-accent); scrollbar-color: color-mix(in srgb, var(--pw-ink) 30%, transparent) var(--pw-bg); }
  a { text-underline-offset: 0.25em; }
  ```
  Then delete the call-site `underline-offset-*` classes. Focus colour is already amber everywhere (see Keep).

---

## P3: polish

### [P3-1] DM Mono is mostly honest. Two costume uses remain, and `font-mono` is not DM Mono
- **Location:** data uses (keep): `_app.roadmap.tsx:597,609`, `MatchCard.tsx:92,206`, `AvailabilityGrid.tsx:206`, `SessionStateTracker.tsx:28`, `_app.quiz.tsx:558`, `_app.onboarding.tutor.tsx:656` (char counter). Costume: `_app.quiz.tsx:490,565` and `_app.roadmap.tsx:924` ("+XP earned" with a sparkles icon). Wrong: `_app.onboarding.tutor.tsx:678`, a prose bio textarea in mono. Two mono stacks: `font-mono` (20 uses: `router.tsx:33`, 18× in `style-guide.tsx`, `ui/chart.tsx:224`) is Tailwind's default `ui-monospace`, because `--font-mono` is never set in `@theme`.
- **Tell:** craft-floor › Refuse: "Monospace as a costume … rather than for code, data, or measurement". This disagrees in part with 01 › P2-3: 9 of 12 sites are counts, percentages and times, which is the legitimate use.
- **Fix:** Add `--font-mono: 'DM Mono', ui-monospace, monospace;` to `@theme inline`. Replace the 12 `font-mono-pw` with `font-mono` and delete `.font-mono-pw` (`styles.css:376-378`). Drop the mono class at the 3 XP lines (`font-semibold tabular-nums`) and at `onboarding.tutor:678`.

### [P3-2] Two class names per typeface, and the base rule duplicates the call sites
- **Location:** `styles.css:97-98` `--font-syne`/`--font-sora` duplicate `--font-display`/`--font-sans` (`:83-84`). There are `font-syne` ×10 (landing, `Header.tsx:16,33`) and `font-sora` ×1 (`_app.index.tsx:67`). The base `.font-display { letter-spacing: -0.025em }` (`styles.css:371-374`) is repeated by 109 `tracking-[-0.025em]` call sites. `body { letter-spacing: 0.3px }` (`:367`) adds tracking to every Sora line, including 13px UI.
- **Fix:** `font-syne` → `font-display`, `font-sora` → `font-sans`, then delete `:97-98`. Remove `tracking-[-0.025em]` wherever `font-display` is present (no visual change). Consider `letter-spacing: 0` on body for app routes: the comment pins it for the landing, which can set `tracking-[0.3px]` on its own wrapper (`_app.index.tsx:67`).

### [P3-3] A third orange, `#c2560f`, outside the brief
- **Location:** `styles.css:94` `--color-qed-teal: #c2560f` · `lib/celebrate.ts:8` confetti `"#c2560f"` · `PortalHero.tsx:54` `to-qed-teal` duotone, `:73` `bg-qed-teal` dot
- **Fix:** Replace it with `qed-teal-ink` (`#fb7a2c`) at PortalHero:54 and :73, drop it from the celebrate.ts colours, then delete `--color-qed-teal`.

### [P3-4] Literal `rgba()` scrims: four different values and one off-palette blue-black
- **Location:** `CourseCard.tsx:76,88,120` `rgba(10,12,14,…)` (a blue-tinted black that is neither `#000` nor `#0e0e0e`) · overlays: `ui/dialog.tsx:22` `rgba(0,0,0,0.7)` + 6px blur, `ui/sheet.tsx:24` / `ui/drawer.tsx:26` / `ui/alert-dialog.tsx:19` `bg-black/80`, `TutorSidebar.tsx:80` and `CourseEditor.tsx:612` `rgba(0,0,0,0.6)` · `_app.roadmap.tsx:729-730` pulse ring `rgba(232,145,60,…)` (motion side in 01 › P1-4) · `Footer.tsx:98` `text-[rgba(239,235,227,0.3)] [text-shadow:0_0_32px_rgba(239,235,227,0.35)]` glow
- **Fix:** CourseCard → `bg-qed-ground/70`, `from-qed-ground/90 via-qed-ground/60`, `bg-qed-ground/50`. Use one scrim, `bg-qed-ground/70`, on all six overlays. Footer:98 → `text-qed-ink/30` and drop the `text-shadow`. Remove the pulse ring (per 01) rather than tokenising it.

### [P3-5] Dead CSS that still ships
- **Location:** `styles.css:297-310` `.course-hero` (0 uses) · `:339-343` `input.bg-white` (0) · `:404-414` `.quiz-option`/`.step-container` (0) · `:433-444` `.pw-raised*`/`.pw-inset` (0) · `:729-731` `.pw-tracking-wide` (0) · `:150-151, :213-214` `--pw-shadow-*` (0) · `:189-193, :249-253` `--chart-1..5` (0 consumers; `--chart-5` would also put red outside errors) · `--pw-input-text` is used only by the base input rule. `.pw-well`, `.pw-row` and `.pw-divider` are used only in `style-guide.tsx`.
- **Fix:** Delete the zero-use blocks. Keep the three style-guide-only classes only if the style guide stays public.

### [P3-6] Coloured left stripes on status cards
- **Location:** `UnverifiedBanner.tsx:18-19` `border-l-4` + `borderLeftColor: var(--pw-accent)` · `_app.tutor.settings.availability.tsx:216` `border-l-4 border-l-[var(--pw-accent-3)]`
- **Tell:** craft-floor › Refuse ("A colored border-left … above 1px on cards … callouts, or alerts"). See 01 › P2-6/P3-1.
- **Fix:** Drop `border-l-4` and the inline style. Use `border-[var(--pw-accent)]` (full 1px frame) so the status still reads as orange.

### [P3-7] Fonts load through a CSS `@import` chain with no preconnect
- **Location:** `styles.css:1` `@import url("https://fonts.googleapis.com/css2?…")`. There is no `preconnect` in `__root.tsx`.
- **Tell:** typeset › Delivery ("loading strategy … avoid invisible text and disruptive reflow").
- **Fix:** Move the stylesheet into the `links` of `__root.tsx` `head()` with `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` (crossorigin). Keep the weight list as is: Syne 600/700/800 and Sora 400–700 are all in use.

---

## Keep on purpose

- **The palette itself.** Every token used as text is ≥4.5:1 in both themes. `--pw-accent` is `#94510a` in light and `#e8913c` in dark, and text oranges are split from fills (`--pw-accent-fill` + `--pw-on-accent`). That is a real two-theme system, not an inversion. 0 Tailwind palette classes in app code.
- **Tells 1, 2, 3 and 15 pass.** Syne + Sora is a characterful pair (owner decision). There is no gradient text. The only gradients are image scrims, the landing photo duotone (brand orange, `mix-blend-overlay`), the availability hatch and the journey comet. The cream ground is the owner's chalk, and it comes with a square grotesque, not an italic serif.
- **Uppercase Syne headings** (115 lines) at -0.025em. This is a consistent display voice within the -0.04em floor. Only the sentence-length and 15px cases in P2-1 should change.
- **Short `label-caps` meta labels** (table headers, stat labels such as `dashboard.index.tsx:391`, `admin.index.tsx:53`) at 12px. That is a legitimate small-caps data role once controls and prose stop using it.
- **Landing wordmarks above 6rem.** `PortalHero.tsx:80` `text-[10vw] md:text-[8vw]` and `Footer.tsx:96` `text-[10.8vw]` exceed the craft-floor display cap, but they are the brand wordmark (the first is `aria-hidden`, the second decorative), not headings.
- **Landing always dark, independent of the theme.** This is an owner decision (`_app.index.tsx:65`). The toggle still renders on `/` and does nothing there (`Header.tsx:208`), which is already logged in `apple-design-2026-10-12/02-visual-craft.md` #4.
- **Focus colour.** Amber everywhere: `--ring`, `.pw-*:focus-visible` 2px/offset 2, and input border + 1px ring. The gaps are coverage, not colour (01 › P2-4).
- **Google "G" logo hex** (`LoginModal.tsx:567-579`). These are brand-mandated colours.
- **DM Mono on counts, percentages, times and the character counter** (P3-1, data list).
