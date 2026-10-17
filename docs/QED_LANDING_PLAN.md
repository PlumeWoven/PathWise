# QED Math Portal → PathWise landing: what was built

## 1. Source and decision

Source: Superdesign project `3d7bbcc2-892a-4b44-9210-c0cdbe7907e9`, draft `06a1ccb2-85ab-45e9-8757-fddbf045b573` (v1).
The draft is a single dark, editorial landing page (static HTML, Tailwind CDN, inline JS).

This file used to be the pre-implementation plan. Decision taken before building: **keep the design language of each section, but use the numbers, slogans and trust icons PathWise already had.** So there is no subjects data, no tutor counts, no `landing_subject_stats` RPC and no react-query hook. All content is static copy. Brand stays PathWise, with a `PATH` / `WISE` wordmark split. Route change is limited to `src/routes/_app.index.tsx`.

Removed: `Hero.tsx`, `Features.tsx`, `Testimonials.tsx`, `FloatingCluster.tsx` (all in `src/components/landing/`).

## 2. Section map

| Design section | Component | Content source |
|---|---|---|
| Fixed nav | `src/pathwise/Header.tsx` | Dark QED style on `/` only via a `QED` class lookup (opaque `bg-qed-ground`, 58px, Syne wordmark with amber dot). Other routes render the original `PW` classes. |
| Portal hero | `PortalHero.tsx` | h1 "Find exactly where you stand."; "A 3-minute quiz..." line; corner labels 3 min avg (`Clock`), 94% accuracy (`CircleCheck`), No signup (`CircleX`) |
| CTA pair | `LandingCtas.tsx` | Used by hero and footer. Tutors: "Go to your dashboard" `/dashboard`. Everyone else: "Start your level check" `/quiz`, "Find a tutor" `/find-tutor` |
| Statement fold | `Statement.tsx` | "Learn deliberately", "Find exactly where you stand and the path to where you want to be.", outline "01" with the roadmap line |
| Subject deck | `StepDeck.tsx` | The 4 "how it works" steps (`ClipboardCheck`, `Route`, `Users`, `LineChart`). Links: `/quiz`, `/pathwise/demo` ("Try demo mode") |
| Category roster | `StageRoster.tsx` | Roadmap stages 01 Foundations, 02 Core Skills, 05 Your Goal, plus a "Find your stage" link to `/quiz` |
| Seminars table | `Voices.tsx` | The three existing testimonials in hairline rows |
| Footer | `Footer.tsx` | "No guesswork. No wasted sessions.", `LandingCtas`, three link columns, giant `PathWise` wordmark |
| Page shell | `src/routes/_app.index.tsx` | Composes the sections, `DemoBanner`, head meta |

## 3. Tokens and utilities (`src/styles.css`)

Colors are in `@theme inline`, so `bg-qed-*`, `text-qed-*` and `border-qed-*` work. Fonts: `font-syne`, `font-sora`. The Google Fonts `@import` on line 1 now includes `Sora:wght@400;600` and `Syne:wght@600;700;800`.

| Token | Value |
|---|---|
| `--color-qed-ground` | `#0a0c0e` |
| `--color-qed-ground-2` | `#101317` |
| `--color-qed-card` | `#16191e` |
| `--color-qed-ink` | `#ede7dc` |
| `--color-qed-ink-2` | `#9ea5a8` |
| `--color-qed-muted` | `#6c7378` |
| `--color-qed-amber` | `#e8913c` |
| `--color-qed-teal` | `#2e6b72` |
| `--color-qed-teal-ink` | `#5fa3ab` |
| `--color-qed-hairline` | `rgba(237, 231, 220, 0.13)` |

Utilities: `label-caps` (uppercase, 0.15em tracking, 10.5px, weight 600) and `text-outline` (1px hairline text stroke, transparent fill).

Always-dark is done by the wrapper in `_app.index.tsx` (`bg-qed-ground font-sora text-qed-ink`), not by a scoped `.qed` class as first planned.

Contrast (ratios as written in the `styles.css` comments):
- `qed-muted` is about 4.1:1 on ground. Decorative only. It is used for the `aria-hidden` "· · ·" row in `StageRoster.tsx`.
- Small text uses `qed-ink-2`.
- Teal text uses `qed-teal-ink` `#5fa3ab` (about 6.5:1 on ground-2), never `qed-teal` `#2e6b72`. `qed-teal` is used for fills and borders.

## 4. Motion and accessibility, as built

- **Hero:** `useScroll({ target, offset: ["start start", "end end"] })` feeds `useTransform`. One progress value drives the panel slide, title scale and letter-spacing, the PATH / WISE split, image scale, duotone opacity and the two dots. The section is `h-[250vh]` with a sticky `h-screen` stage.
- **Reduced motion:** two layers. CSS: `motion-reduce:h-screen` on the section, `motion-reduce:hidden` on the panels and dots, `motion-reduce:transform-none!` on the image, wordmark and `Statement` ring. CSS is used instead of `useReducedMotion` so server and client markup match. JS: the route wraps the page in `<MotionConfig reducedMotion="user">`.
- **Deck (`StepDeck.tsx`):** works three ways. Drag (top card only, `drag="x"`; thrown at offset over 100 or velocity over 500). Left/Right arrow keys on the focusable stack (`tabIndex={0}`, `role="group"`, `aria-roledescription="card stack"`). The "Next step" button. The counter "Step N of 4 · drag to discard" is `aria-live="polite"`. Cards behind the top one are `aria-hidden`. Drag uses framer-motion, so there are no window listeners.
- **Headings:** one `h1` (hero). The hero wordmark is `aria-hidden`; the footer wordmark is a `<p aria-hidden>`.
- **Icons and decoration:** lucide icons, all `aria-hidden`. Hero image has `alt=""`.

## 5. Carried over from the old plan: "don't port from the draft"

| Item | Status |
|---|---|
| Invented numbers (4,821 tutors, 342 tutors, ...) | Handled. No counts anywhere. The only figures are PathWise's existing "3 min avg" and "94% accuracy" (copied from the old `Hero.tsx`; not re-verified). |
| Fake metadata (EST. MMXXIV, LONDON / NYC, 2024 seminar dates) | Handled. None present in `src/components/landing/`. |
| Listener leak (window `pointermove`/`pointerup` per card) | Handled. framer-motion `drag`. |
| CDN scripts (Tailwind CDN, Iconify) | Handled. Tailwind v4 from the app and `lucide-react`. |
| Undefined `animate-spin-slow` | Handled. `Statement.tsx` uses a scroll-linked `rotate` on the ring. |
| Contrast of `#6c7378` | Handled. See section 3. |
| Drag-only deck | Handled. Keys and button. |
| Duplicate `h1` | Handled. See section 4. |

## 6. Open items

1. Hero image is hotlinked from Unsplash (`HERO_IMG` in `PortalHero.tsx`), with no `loading` or width/height attributes. The old plan said to self-host it in `public/`.
2. `src/hooks/useDVDFloat.ts` is unused now (its only consumer was `FloatingCluster.tsx`). Delete it, or keep it on purpose.
3. Footer column links and Privacy / Terms are still `href="#"`. They were before too.
4. The deck has no Previous control. ArrowLeft also advances; it only changes the throw direction.
5. "Try demo mode" (`/pathwise/demo`) in `StepDeck.tsx` is new copy, not in the old landing page.
6. Under reduced motion the hero is static but still shows the "Scroll to begin" label.
7. Browser QA done 2026-10-04 (desktop 1440, mobile 375, reduced motion, light/dark OS); fixes applied. Still open: Lighthouse accessibility run on `/`; DemoBanner toast covers the hero's "No signup" label on first view.
8. Run `graphify update .` once the landing changes are merged.
