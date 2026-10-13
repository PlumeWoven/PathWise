## Design review: PathWise live site (signed-out), https://path-wise-seven.vercel.app

Audited 2026-10-12 against `.agents/skills/apple-hig` (principles and foundations; it's a web app, so
Apple's platform conventions like tab bars and sheets don't apply) and `.agents/skills/apple-design`
(reference only). References opened: `accessibility.md`, `layout.md`, `typography.md`, `color.md`,
`dark-mode.md`, `motion.md`, `modality.md`, `writing.md`, `cross-platform.md`.

**How it was measured.** Every number below comes from a script run against the live site, not from
reading source. Pages: `/`, `/quiz`, `/matches`, `/library`, `/find-tutor`, `/course-match` (opens the
sign-in modal), `/courses/untitled-course-777659b2`, `/tutor/176cedff-…`, `/privacy`, `/terms`,
`/contact`, `/demo` (redirects to `/demo?ref=&as=tutor`), `/roadmap` (redirects to `/quiz` signed-out),
and `/book/176cedff-…` for the cross-checks. Each page ran at 375×812 (mobile emulation, touch, DPR 2)
and 1440×900, in light and dark (`prefers-color-scheme`, fresh profile, no stored theme). That makes
52 page runs and 1,942 text nodes checked for contrast. Selectors are mapped to `file:line` where a grep
found them.

---

### Summary

**Overall rating: Critical issues.**

Contrast is the strongest part of the site. 1,942 text nodes across both themes produced 12 failures,
and all 12 are decorative elements on the landing page. Every image has alt text and every button has
a name. The problems sit elsewhere:

- The sign-in modal isn't built as a dialog.
- Most of the mobile UI is set in 9–10.5px all-caps text.
- Eight kinds of control are smaller than the 28pt mobile minimum.
- Three key screens break at 375px, and every page breaks when text is doubled.

**Thesis:** "Find exactly where you stand": a level check that leads to a roadmap and a tutor.
**Signature:** the landing page has one. An extended Syne wordmark splits open over a photo, and an
amber "journey line" runs down the page until the footer wordmark lights up. The app pages behind it
have no signature. They read as the warm-cream-and-burnt-amber template.

---

### Critical

**C1. The sign-in modal doesn't behave as a dialog** (all pages, both viewports, both themes)
- **What**: Opened from the header "Sign In" on `/quiz`, and auto-opened on `/course-match`. What was
  measured:
  - **Not a dialog.** The container `div.fixed.inset-0.z-50` has no `role="dialog"` or
    `aria-modal`, and no accessible name.
  - **Focus never moves in.** After opening, `document.activeElement` stays on the header SIGN IN
    button.
  - **Focus isn't trapped.** Twelve presses of Tab went MATHEMATICS → SCIENCES → … → LANGUAGES behind
    the scrim, and only then reached Close, the inputs and SIGN IN.
  - **The page behind stays live.** None of the `body` children are `inert` or `aria-hidden`.
  - **Escape doesn't close it.** The modal was still visible after pressing Escape. The backdrop click
    and the × button do close it.
  - **Fields have no names.** The `EMAIL` and `PASSWORD` `<label>`s have `htmlFor=""` and don't wrap
    their inputs, so both inputs have no accessible name. They also have `autocomplete=""`.
  - **Mobile zoom.** Input text is 14px, which makes iOS Safari zoom the page when a field gets focus.
  - **Tiny close button.** The × is **12×20px** on mobile and **14×24px** on desktop.
- **Why**: `modality.md › Best practices`: "Always give people an obvious way to dismiss a modal view."
  `accessibility.md › Speech`: "Let people use the keyboard alone to navigate and interact with your
  app." `accessibility.md › Vision`: "Describe your app's interface and content for VoiceOver."
  `writing.md › Best practices`: "label all fields clearly".
- **Fix**:
  - **Use a real dialog.** Replace the hand-rolled overlay in `src/pathwise/LoginModal.tsx:251-262`
    with the Radix/shadcn `Dialog` that's already in `src/components/ui/`. That gives role, aria-modal,
    focus move, focus trap, Escape, inert background and focus return.
  - **Fix the field.** In the `Field` component (`LoginModal.tsx:492-499`), generate an id
    (`useId()`), add `htmlFor`/`id`, set `autoComplete="email"` / `"current-password"` (or
    `"new-password"` for sign-up), and set the input font to `1rem` (16px).
  - **Enlarge the ×.** Give it `h-11 w-11 grid place-items-center` (44×44).

**C2. Mobile text falls below the 11pt minimum on every page** (375px, both themes)
- **What**: The root font size is 16px on phones (`html{font-size:120%}` only applies from 48rem up).
  At that size:
  - **Labels and controls: 10.4992px.** `.label-caps` (`0.6562rem`) renders at 10.4992px on every
    page: 25 elements on `/`, 19 on `/tutor/…`, 8 on `/quiz`, 7 on `/courses/…`, 6 on `/matches`.
    It carries the header **Sign In** button, all six `/quiz` subject answers, the eight `/find-tutor`
    answers, the course-page tabs (OVERVIEW / CURRICULUM / REVIEWS / FAQ), the sign-in modal's
    EMAIL / PASSWORD labels, and `h3` headings such as "WHO THIS IS FOR" and "WEEKLY AVAILABILITY".
  - **Buttons: 11.5px.** `.pw-btn-primary` / `.pw-btn-outline` text is 11.5008px.
  - **Footer legal line: 9px.** `text-[0.5625rem]` renders the © line and the Privacy, Terms and
    Streamline links at **9px**, and the StepDeck "Step 1 of 4" counter at 9px.
  - **Totals.** 174 text elements across the 12 distinct mobile pages are under 12px.
  - **All caps.** All of this is uppercase with 0.15em tracking, which costs legibility again.
- **Why**: `accessibility.md › Vision`: "Use recommended defaults for custom type sizes." iOS default
  is 17pt and the minimum is 11pt. `typography.md › Ensuring legibility`: "Use font sizes that most
  people can read easily." On iPhone one CSS px is one pt, so 10.5px fails the minimum. The miss is
  small but applies site-wide, and 9px fails clearly.
- **Fix**:
  - **Raise `.label-caps`.** In `src/styles.css:128-133`, change `font-size: 0.6562rem` to
    `0.75rem` (12px on phones, 14.4px on desktop). Raise `.pw-btn-*` from `0.7188rem` to `0.8125rem`
    (`styles.css:477, 500`).
  - **Drop the 9px class.** Delete `text-[0.5625rem]` in `src/components/landing/Footer.tsx:64,74`
    and `StepDeck.tsx:234`.
  - **Stop styling headings as labels.** Answer options and `h3`s shouldn't use label-caps at all.
    See the Craft notes.

**C3. Mobile controls under the 28pt minimum** (375px; some also fail the desktop 20pt minimum)
- **What** (width×height in CSS px):

  | Control | Mobile | Desktop | Source |
  | --- | --- | --- | --- |
  | Sign-in modal × | **12×20** | **14×24** | `LoginModal.tsx:259-262` |
  | "Forgot password?" / "Create account" | 122×16 / 105×16 | 147×19 / 126×19 | `LoginModal.tsx` |
  | "SHOW MATCH BREAKDOWN" | 186×16 | 223×19 | `MatchCard.tsx:~138` |
  | Breadcrumb "FIND A TUTOR" on /matches | 96×13 | 115×16 | `_app.matches.tsx` |
  | Footer © Privacy / Terms / Streamline | 51×12 / 39×12 / 73×12 | Streamline 88×13 | `Footer.tsx:64-83` |
  | Footer nav links (Level check, Roadmaps…) | 85×18 (row spacing 36px) | 102×21 | `Footer.tsx` |
  | Tutor course filter chips (ALL, MATHEMATICS) | 46×26 / 121×26 | 55×30 | `_app.tutor.$tutorId.tsx` |
  | Price range slider on /matches | – | 262×16, no label | `_app.matches.tsx:501` |

- **Why**: `accessibility.md › Mobility`: "Offer sufficiently sized controls." The iOS default is
  44×44pt and the minimum 28×28pt. macOS is 28×28 and 20×20. "Consider spacing between controls as
  important as size."
- **Fix**: Pad text links to a 44px hit area without changing how they look:
  `py-3 -my-3 inline-block`, or `min-h-11 inline-flex items-center` for standalone links. Use
  `min-h-11 px-3` for chips. Give the range input `aria-label="Maximum price per hour"` and a 44px-tall
  wrapper.

---

### Improvements

**[High] H1. Three key screens break at 375px**
- **What**:
  - **Booking stepper.** On `/book/<tutorId>` the step row "1 TYPE 2 TIME 3 TIMEZONE 4 SUMMARY 5 PAY"
    has `scrollWidth` **517** against `clientWidth` **335**, so the page's layout viewport widens to
    **537px**. SUMMARY and PAY sit off-screen.
  - **Course tabs.** On `/courses/<slug>` the TabsList is 378px wide (FAQ ends at x=398), so the
    whole page scrolls sideways by 23px. The page measures `scrollWidth` 398 against a 375 viewport.
  - **Match card actions.** On `/matches` the VIEW PROFILE / BOOK TRIAL / MESSAGE row sits on one
    line. MESSAGE spans x=316–420, but the card (`.pw-card overflow-hidden`, 335 wide) clips at 355,
    so **65 of its 104px are hidden** in both themes. "0 MDL" also wraps onto two lines beside the
    buttons.
- **Why**: `layout.md › Adaptability`: "Design a layout that adapts gracefully and consistently."
  `layout.md › Size classes`: "Keep functionality the same as size classes change." The Message action
  is effectively lost on phones.
- **Fix**:
  - **Booking.** At `src/routes/_app.book.$tutorId.tsx:425`, show only numbered dots plus the current
    step's label under `sm`, or use `overflow-x-auto` with `scroll-snap`.
  - **Course tabs.** In `src/components/ui/tabs.tsx:15`, add `max-w-full overflow-x-auto` to
    `TabsList`, and a fade on the trailing edge so the scroll is visible.
  - **Match card.** At `src/pathwise/MatchCard.tsx:157,171`, stack the price above the buttons on
    mobile (`flex-col sm:flex-row`), and lay the buttons out as `grid grid-cols-2`, with Book trial
    spanning both columns.

**[High] H2. Doubled text breaks the header and key actions on every page**
- **What**: All type is in rem, so setting the root to 200% stands in for a user who has doubled the
  browser's default font size. At 375px:
  - **Header.** The row runs to x=**473** on every page, so **Sign In sits 98px off-screen**.
  - **/tutor.** MESSAGE ends at x=691.
  - **/courses.** The tabs end at x=796.
  - **/quiz.** The stepper ends at x=440.
  - **/matches.** The Sort select ends at x=428.
  - **/privacy.** The email link (an unbreakable string) ends at x=522.
- **Why**: `accessibility.md › Vision`: "Ideally, give people the option to enlarge text by at least
  200 percent." `layout.md › Adaptability`: "horizontally adjacent views may need to stack vertically
  to provide more space for text." `typography.md › Supporting Dynamic Type`: "Consider adjusting your
  layout at large font sizes."
- **Fix**:
  - **Header** (`src/pathwise/Header.tsx:172`): add `flex-wrap`, or move the theme toggle out of the
    bar below `sm`.
  - **Long strings**: add `break-words` / `overflow-wrap:anywhere` on prose links.
  - **Action rows**: `flex-wrap` on the tutor page's action row.

**[High] H3. On /find-tutor, the progress bar and Back slide under the header** (confirmed live, see cross-check 1)
- **What**:
  - **375×667 (iPhone SE size).** Question 2 scrolls naturally by 52px. The `sticky top-0 z-30` bar
    then sits at top 6px, under the 58px `sticky top-0 z-40` header, and `elementFromPoint` on Back
    returns the header's Sign In button.
  - **375×812.** The same happens at any scroll. With 400px of scroll the bar sits at 0–51px, fully
    covered.
- **Why**: `layout.md › Guides and safe areas`: a safe area is the region "isn't covered on the edge
  by … another view within the window, like a toolbar"; "Respecting the safe area is essential". It is
  also the wayfinding rule in apple-design §16: "How do I get out?"
- **Fix**: At `src/routes/_app.find-tutor.tsx:143`, change `sticky top-0` to `sticky top-[3.625rem]`.
  Better, make the header's height a token, `--header-h: 3.625rem`, and use `top-[var(--header-h)]`
  everywhere.

**[High] H4. Signed-out visitors get no navigation off the landing page** (see cross-check 5)
- **What**:
  - **Header.** At both 375 and 1440 the header holds three items: the PATHWISE logo, the theme toggle
    and SIGN IN. It has no nav links and no menu button.
  - **Footer.** Product links (Level check, Roadmaps, Find a tutor, Course library) and Company links
    (Contact, Privacy, Terms) appear **only on `/`**. Every other page has no footer and no site
    navigation. The only `<nav>` elements are the quiz stepper and a course breadcrumb.
  - **Dead ends.** From `/privacy` or a tutor profile, the only way anywhere is the logo.
  - **Current location.** No element on `/matches` or `/library` carries `aria-current`.
- **Why**: apple-design §16 "Wayfinding": "Every screen should answer: Where am I? Where can I go?
  What's there? How do I get out?" `layout.md › Visual hierarchy`: "Order content by relative
  importance."
- **Fix**:
  - **Header links.** Add the four Product links to the signed-out header from `sm` up, and put them
    in a disclosure menu below `sm` (`Header.tsx`).
  - **Current page.** Set `aria-current="page"` plus a visible active style through TanStack
    `<Link activeProps>`.
  - **Footer.** Render the slim legal footer (© · Privacy · Terms · Contact) in the `_app` layout, not
    only on the landing page.

**[High] H5. Header controls are under 44pt on every page** (mobile)
- **What**: Sign In is **80×34**, the theme toggle **36×36**, and the `/quiz` stepper buttons
  **32×32** (`src/components/AnimatedStepper.tsx:~60`). Tap targets under 44px per mobile page, not
  counting inline links:

  | Page | Under 44 | Of which under 28 |
  | --- | --- | --- |
  | / | 14 | 9 |
  | /courses | 17 | 4 |
  | /matches | 11 | 6 |
  | /course-match | 9 | 4 |
  | /tutor | 9 | 3 |
  | /quiz | 7 | 1 |
  | /library, /find-tutor | 4 each | 1 each |
  | legal pages | 3 each | 1 each |

- **Why**: `accessibility.md › Mobility`: the iOS default control size is 44×44pt.
- **Fix**:
  - **Header** (`Header.tsx:13,28`): `px-3 py-2` → `min-h-11 px-4`.
  - **Theme toggle** (`src/components/ThemeToggle.tsx:72`): `h-9 w-9` → `h-11 w-11`.
  - **Stepper**: `h-8 w-8` → `h-11 w-11`, keeping the 32px circle visual inside it.

**[Medium] M1. Field and control outlines nearly disappear** (non-text contrast, light theme)
- **What**:
  - **Sign-in inputs.** The fill `#e3dccf` on card `#f6f2ea` is **1.22:1**. The 1px border
    `rgba(10,12,14,.13)` is **1.60:1**.
  - **Hairline borders.** These outline the quiz answer tiles, filter chips and secondary buttons, and
    are the only cue that those are buttons. They measure **1.32:1** on paper `#ede7dc`, and 1.33:1 in
    dark.
  - **Rating stars.** Empty stars (`#8a4a0a` at `opacity-30`, `MatchCard.tsx:97`) blend to `#d6c0a7`,
    **1.58:1**, and opacity is the only thing that separates them from filled stars.
- **Why**: `color.md › Inclusive color`: "insufficient contrast can cause icons and text to blend with
  the background". `accessibility.md › Vision`: "Convey information with more than color alone."
- **Fix**:
  - **Borders.** Use a `--pw-border-strong` of `rgba(10,12,14,.45)` (about 3.1:1) for input and
    control borders, and keep `.13` for decorative rules.
  - **Stars.** Draw empty stars as outlines (`fill-none stroke-current`) at full opacity.

**[Medium] M2. Dark theme leaves native controls and toasts light** (see cross-check 2)
- **What**:
  - **No dark color-scheme.** In dark theme, `getComputedStyle(html).colorScheme` is `normal` on
    `/matches`, `/book` and `/quiz`, and there's no `<meta name="color-scheme">`.
  - **Visible result.** The "Available this week" checkbox draws as a **white box** on the dark
    filters card (screenshot). The Sort `<select>` popup and the scrollbars use light system styling.
  - **Toasts.** `<Toaster position="top-center" richColors />` (`src/routes/__root.tsx:125`) has no
    `theme` prop, so sonner renders light toasts in dark mode. That comes from source; no toast was
    triggered live.
- **Why**: `dark-mode.md › Best practices`: "Ensure that your app looks good in both appearance
  modes." `dark-mode.md › Text`: "Use system views to draw text fields and text views."
- **Fix**:
  - **Color scheme.** Add `html{color-scheme:light} html.dark{color-scheme:dark}` to
    `src/styles.css`.
  - **Toasts.** Pass `theme={isDark ? "dark" : "light"}` to the Toaster, or use the existing
    `src/components/ui/sonner.tsx` wrapper and give it the theme.

**[Medium] M3. Missing landmarks, a missing h1, and no skip link**
- **What**:
  - **Skip link.** No page has one (`a[href^="#"]` with "skip" returned 0).
  - **Landing.** `/` has no `<main>` (`src/routes/_app.index.tsx:67` wraps it in a `div`).
  - **/quiz.** It has **no `h1`**. The first heading is an `h2`, "What do you want to get better at?"
    (`_app.quiz.tsx:694`).
  - **Focus rings.** These *are* visible. On all 48 recorded tab stops (/, /quiz, /matches × 2
    viewports) every stop had an outline or a ring.
- **Why**: `accessibility.md › Speech`: "Let people use the keyboard alone to navigate and interact
  with your app."
- **Fix**:
  - **Skip link.** Add `<a href="#main" class="sr-only focus:not-sr-only …">Skip to content</a>` as
    the first child of the `_app` layout.
  - **Landmarks.** Wrap the landing page in `<main id="main">`.
  - **Headings.** Render the quiz step title as `h1`.

**[Medium] M4. The auto-advancing StepDeck can't be paused on a phone**
- **What**:
  - **Autoplay.** With motion allowed, the card stack on `/` advanced "Step 1 of 4" → "Step 2 of 4"
    within about 4.5s while in view. With `prefers-reduced-motion: reduce` it stayed on Step 1 for 9s,
    which is correct.
  - **Pausing.** It pauses on hover or focus (`StepDeck.tsx:168-172`), but a touch pauses it only
    while the finger is down. Phones have no persistent pause.
  - **Copy.** The visible label on phones reads "hover to pause".
- **Why**: `accessibility.md › Cognitive`: "Minimize use of time-boxed interface elements."
  `writing.md › Best practices`: "Make sure you describe gestures correctly on each device."
- **Fix**: Add a Pause/Play button next to "Next step", and stop autoplay after the first tap. Show
  "tap Next" on `(hover: none)` devices instead of "hover to pause".

**[Medium] M5. Production shows test data and hits failing requests**
- **What**:
  - **Test data.**
    - `/matches` lists two tutors. One is "TEST" (bio "Test", 100 MDL). The other is named after an
      account handle and costs **0 MDL/hr**.
    - The tutor profile reads "TEST", "PhD · Test" and "About: Test".
    - The only course is `/courses/untitled-course-777659b2`, titled "Test", with "**1 lessons**" and
      "**0 min**" (`_app.courses.$slug.tsx:416`).
  - **Console.** It logs `401` for `tutor_packages` on `/matches`, and for `message_threads` and
    `profile_views` on `/tutor/<id>`, for every signed-out visit. Package discounts and the response
    time silently never render for visitors.
- **Why**: apple-design §16 Craft: "Nothing is random … Jittery scroll, misaligned icons, and layouts
  that break … read as carelessness." That covers trust. `writing.md › Best practices`: "Consider each
  screen's purpose."
- **Fix**:
  - **Test data.** Hide profiles that have no rate, no reviews and placeholder bios from public
    queries, or delete the test rows.
  - **Plural.** Use a plural helper for "lesson(s)".
  - **Failing requests.** Skip those queries when `!user`, or expose the needed columns through an
    anon-readable view.

**[Medium] M6. Copy contradicts itself across the funnel**
- **What**:
  - **Quiz length.** The level quiz is a "3-minute quiz" (`PortalHero.tsx:105`, StepDeck), "about two
    minutes" (`_app.library.tsx:172`), and the matches page offers a "60-second quiz"
    (`_app.matches.tsx:388`).
  - **Demo.** The page promises "Experience PathWise in 60 seconds" and also says "Your demo session
    lasts 60 minutes".
  - **Subjects.** `/quiz` offers 6 (Mathematics, Sciences, Literature, History, Programming,
    Languages). `/find-tutor` offers 8 different ones (Math, Science, Languages, Coding, Test prep,
    Music, Writing, Art).
  - **Sign-in modal.** It says "Choose how you're signing in" (`LoginModal.tsx:243`) but offers one
    method.
  - **Matches heading.** "We found 2 tutors based on your learning profile" (`_app.matches.tsx:375`)
    appears for a visitor with no profile.
  - **Unsupported claim.** The hero claims "94% accuracy" (`PortalHero.tsx:116`) with nothing to back
    it up.
- **Why**: `writing.md › Best practices`: "Build language patterns. Consistency builds familiarity."
  `writing.md › Getting started`: "Create a list of common terms, and reference that list to keep
  your language consistent." Apple's Responsibility principle covers being transparent about claims.
- **Fix**: Pick one quiz duration and one subject taxonomy and reuse them. Say "Sign in" in the modal.
  Say "Here are tutors to start with" when the visitor has no profile. Cite the 94% figure or remove
  it.

**[Medium] M7. Landing is always dark, and the in-app theme toggle overrides the system setting**
- **What**:
  - **Default theme.** A fresh light-mode visitor gets the cream app (`body #ede7dc`). That is
    correct.
  - **Landing.** `/` is hard-wired dark (`#0a0c0e`; comment at `_app.index.tsx:65`). Every click from
    the landing into the app is therefore a full brightness jump. The demo banner on `/` is a cream
    card floating on the black page.
  - **Toggle.** Clicking it writes `pw-theme` to localStorage. After a reload the page stays dark
    while `prefers-color-scheme` is light, and nothing offers "System" again.
- **Why**: `dark-mode.md › Best practices`: "Avoid offering an app-specific appearance setting."
  apple-design §14: avoid "abrupt brightness jumps (ease dark↔light theme changes)".
- **Fix**:
  - **Toggle.** Keep it, but make it three-state (System / Light / Dark), defaulting to System.
  - **Landing.** Either give the landing a light variant, or cross-fade the ground colour on the first
    navigation out of it.

**[Low] L1. Three different focus-ring styles**
- **What**: All 48 stops showed a ring, in three styles:
  - Links and header buttons use the browser default `outline:auto` (a blue/white ring with rounded
    corners on a square design).
  - Quiz tiles and buttons use `2px solid #8a4a0a` (5.57:1 on paper).
  - The theme toggle and the StepDeck use a white plus amber `box-shadow` ring.
- **Why**: `color.md › Best practices`: "Avoid using the same color to mean different things." The
  converse applies too: one state should get one treatment.
- **Fix**: Add a global `:focus-visible{outline:2px solid var(--pw-accent);outline-offset:2px}` and
  remove the per-component rings.

**[Low] L2. Tracking and leading don't change with size**
- **What**:
  - **Tracking.** Body `letter-spacing:0.3px` (`src/styles.css:374-375`) is applied at every size:
    14, 15, 16.8, 19.2 and 21.6px paragraphs, and also the 37.4px landing `h1` (Syne 600, `+0.3px`).
    The other display headings use `-0.025em`.
  - **Leading.** Legal-page `h2`s are 21.6px with 35.1px line-height (1.63, body leading on a
    heading).
  - **Type families.** There are three: Syne, Sora, and DM Mono, which is used only for "0.0 · (0
    reviews)".
- **Why**: apple-design §15: "Tracking (letter-spacing) is size-specific — never one value for all
  sizes … Leading tracks size inversely." `typography.md › Conveying hierarchy`: "Minimize the number
  of typefaces you use."
- **Fix**:
  - **Tracking.** Set `letter-spacing:0` on body copy, keep `-0.025em` on Syne display, and give the
    landing `h1` `tracking-[-0.02em]`.
  - **Leading.** Use `leading-tight` on `h2`.
  - **Mono.** Set ratings in Sora with `font-variant-numeric: tabular-nums`.

---

### Craft notes

- **[High] The app pages are a template; the landing page isn't.**
  - **The landing.** It has a point of view. The extended Syne PATHWISE wordmark splits open as you
    scroll, the amber/teal duotone photo sits behind it, and the amber journey line ends by lighting
    the footer wordmark. That signature belongs to "finding where you stand on a path".
  - **The app.** Behind it, every page combines four things: paper `#ede7dc`, ink `#0a0c0e`, a
    burnt-amber accent (`#8a4a0a` for text, `#e8913c` for fills), and extended display caps. Add zero
    radius, hairline rules and letter-spaced eyebrows everywhere.
  - **The diagnosis.** That is the skill's "warm cream … with a terracotta accent" look, swapping the
    serif for an extended sans, crossed with the "broadsheet of hairline rules, zero radius" look. The
    dark landing is the third template: "near-black with one … vermilion accent".
  - **Why it reads as a default.** Nothing on `/quiz`, `/matches` or a tutor profile carries the path
    or journey idea. Those screens could belong to any product.
- **[Medium] The boldness is spread across everything.**
  - **Where it goes.** `.label-caps` (uppercase, 0.15em tracking, weight 600) styles buttons, tabs,
    form labels, eyebrows, chips, badges, stepper labels, breadcrumbs and footer text: 25 instances on
    `/` and 19 on a tutor profile. Long labels such as "I NEED HELP WITH MULTIPLE SUBJECTS" become
    hard to read.
  - **Remove one accessory.** Keep label-caps for eyebrows only. Set controls and answers in sentence
    case Sora at 15–16px. That fixes C2 at the same time.
- **[Medium] Big numbers sit over small labels where they say nothing.**
  - **Hero chips.** "3 MIN AVG / 94% ACCURACY" are decoration.
  - **Tutor stat grid.** "0 STUDENTS · 1 COURSES · — EXPERIENCE · — AVG RATING · 0" makes a new tutor's
    emptiness the headline.
  - **Fix.** Hide stats that are zero or empty, and lead with the bio and subjects.
- **Typography personality: works.** Syne's extended caps give the brand a voice in display sizes, and
  Sora is a sensible reading face. Keep Syne for display and the wordmark only.

---

### What works

- **Text contrast passes in both themes.**
  - **The numbers.** 1,942 text nodes across 13 pages × 2 viewports × 2 themes: 0 real failures. The
    12 failures are decorative: an `aria-hidden` outline "01" numeral, the unlit footer wordmark
    (1.33:1, by design) and a "· · ·" separator in `qed-muted` (4.07:1).
  - **Tokens to keep.** Ink-2 `#4a5257` on paper is 6.47:1. Accent text `#8a4a0a` is 5.57:1. Dark
    ink-2 `#9ea5a8` on `#0a0c0e` is 7.84:1, and amber `#e8913c` is 7.97:1.
- **Names and alt text.** No unnamed buttons or links, and no `<img>` without `alt`, on any page.
- **Visible focus.** Every recorded tab stop showed a ring, and tab order follows reading order on
  `/`, `/quiz` and `/matches`.
- **Reduced motion is honoured.**
  - **Hero.** It collapses from 2,250px of scroll-driven portal to an 830px static block.
  - **Scroll motion.** Scroll-linked style changes drop from 10 to 2.
  - **Autoplay.** The StepDeck stops auto-advancing. Per source, the theme toggle also skips its
    radial wipe; that wasn't observable live.
- **Theme follows the system on first visit, with no flash.** The head bootstrap script sets
  `html.dark` before paint, and fresh light or dark profiles got the matching theme.
- **No sideways scrolling on 12 of the 13 pages at 375px, in both themes.** The exception is
  `/courses`; `/book`, checked separately, also overflows. All sizes are rem-based, and phones keep the
  user's root size (16px).
- **Proper progress semantics on the quiz stepper.** Step buttons are labelled "Step 1: Subject", and
  so on.

### Platform notes

- **What applies.** This is a web app. The HIG principles and foundations apply (accessibility,
  colour, type, layout, writing). Apple's tab-bar and sheet conventions don't.
- **Vocabulary.** Dynamic Type corresponds to the browser's font-size setting, and a sheet
  corresponds to a dialog (`cross-platform.md › Vocabulary`).
- **Desktop at 1440px is in better shape.** The root is 19.2px, so `.label-caps` is 12.6px and buttons
  13.8px. Only the Streamline link (88×13), breadcrumbs, the modal × (14×24) and the range input (16px
  tall) fall below the macOS 20pt minimum.
- **Limits.**
  - **Emulation.** Mobile was Chromium's emulation, not real iOS Safari. Wherever the measurement
    reports `innerWidth` above 375, real phones will zoom out or scroll sideways.
  - **Not testable here.** Native `<select>` popups can't be captured headless. VoiceOver and Increase
    Contrast weren't tested.

---

### Cross-checks

Requested by the coordinator to confirm or refute claims from the source audit. Same rules applied:
signed out, nothing submitted.

1. **Sticky overlap: confirmed on /find-tutor; at 1440 the geometry is right but the panels barely
   stick.**
   - **`/find-tutor` @375.** The header is 0–58px at `z-40`. The progress bar is `sticky top-0 z-30`,
     51px tall.
     - **At rest.** The bar sits at 58–109.
     - **At 375×667, natural scroll.** Q2 scrolls 52px, the bar moves to top 6, and Back (48×16) is
       covered: `elementFromPoint` hits the header's Sign In button.
     - **At 375×812, 400px of scroll** (spacer added). The bar sits at 0–51, fully under the header.
     - **How Back was reached.** It only appears from question 2, so Q1 was answered "Math" in a
       throwaway context. Signed-out answers stay in localStorage; the source writes to the server only
       for signed-in users, at the results step.
   - **1440 side panels.** By geometry, each panel's `top` sits under the 69.6px header:

     | Panel | Sticky top | Would sit under header by | Travel left in its container |
     | --- | --- | --- | --- |
     | `/matches` filters | `top-4` = 19.2px | 50px | 40px (card 655px in a 695px aside) |
     | `/tutor` aside | `lg:top-6` = 28.8px | 41px | none: the aside is the taller column (1,215px, the main's whole content box, and taller than the viewport) |
     | `/courses` sidebar | `top-6` = 28.8px | 41px | none |

     - **What happens live.** With the current data, `/matches` sticks for only 40px of scroll, and
       `/tutor` never sticks: between scrollY 300 and 700 its aside moved the full 400px.
     - **`/courses` never sticks.** Its sidebar sits inside `section.relative.overflow-hidden` with no
       room to travel. At scrollY 300/700/1200 its top was −142 / −542 / −1042, scrolling away
       normally.
     - **Verdict.** "Tucks 34–41px under the header" is right in geometry (41–50px). It will show up
       once the lists or main columns grow. The live defect today is `/find-tutor`.
2. **Dark-mode native controls: confirmed. Toasts: confirmed from source only.**
   - **Color scheme.** In dark theme `getComputedStyle(document.documentElement).colorScheme` is
     `"normal"` on `/matches`, `/book/<id>` and `/quiz`. There's no `<meta name="color-scheme">`.
   - **Controls.** The `/matches` checkbox and range report `colorScheme: normal`, with accent
     `#e8913c`. The checkbox draws as a white box on the dark card.
   - **The select.** It is styled dark (`bg #16191e`, text `#ede7dc`), but its options have a
     transparent background and the popup follows `color-scheme: normal`, which is light.
   - **Dates.** No date or time inputs exist on signed-out pages; `/book` step 1 has none.
   - **Toasts.** No read-only signed-out action produces one, so none was triggered. The live DOM has
     the sonner `<section aria-label="Notifications…">` but no `[data-sonner-toaster]` until a toast
     fires. Source (`__root.tsx:125`) passes no `theme`, so sonner falls back to its light default.
3. **Small text: confirmed.**
   - **Mobile (root 16px).** Every `.label-caps` on the six pages sampled renders at **10.4992px**.
     The exceptions are three StepDeck/footer spans at **9px**.
   - **Footer legal line on `/`.** "© 2026 PathWise · Privacy / Terms" and "Icons by Streamline" are
     **9px**. The links are Privacy 51×12, Terms 39×12 and Streamline 73×12.
   - **Buttons.** `.pw-btn-*` renders at 11.5008px.
   - **Desktop (root 19.2px).** The same classes render at 12.6px and 10.8px.
4. **Booking stepper overflow: confirmed, and reachable signed-out.**
   - **Access.** `/book/176cedff-…` loads without sign-in and shows "Pick a session type". Nothing was
     picked.
   - **Measurements @375.** The step row (`div.mt-4.flex.items-center.gap-2.label-caps`,
     `_app.book.$tutorId.tsx:425`) has `scrollWidth` **517** against `clientWidth` **335**, with
     `overflow-x: visible`. The layout viewport grows to `innerWidth` **537**.
   - **Verdict.** The source estimate (about 500 against 335) holds.
5. **Signed-out navigation: confirmed, there is none.**
   - **Header at both widths.** On `/` at 375 and at 1440 it has `A "PATHWISE" href=/
     aria-current=page`, `BUTTON "Turn the lights off (switch to dark mode)"` and `BUTTON "SIGN IN"`.
     No nav links, no menu or hamburger button, and no `aria-expanded` anywhere.
   - **Footer.** Only `/` has one: Product (Level check, Roadmaps, Find a tutor, Course library) and
     Company (Contact, Privacy, Terms).
   - **Active state.** On `/matches` and `/library`, at both widths, the header has the same three
     items and none is marked active. No element on either page carries `aria-current`.
