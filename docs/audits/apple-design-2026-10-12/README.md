# Apple design audit — 2026-10-12

PathWise was audited against two vendored skills: `apple-hig`, Apple's Human Interface Guidelines with a review method, and `apple-design`, Apple's fluid-interface rules translated for the web. Both live in `.agents/skills/`. Six agents ran in parallel: five read the source, and one measured the live site (https://path-wise-seven.vercel.app) at 375 px and 1440 px in light and dark, signed out, with nothing submitted.

**Overall rating: Critical issues.** Every lens came back Critical. The color tokens are good: the live site checked 1,942 text nodes in both themes with 0 contrast failures. Focus rings are visible, and `MotionConfig reducedMotion="user"` covers the framer-motion animations. The failures are structural: modals that aren't dialogs, flows that hang or lose data, and text and tap targets sized for desktop.

| # | Report | Lens | Findings |
|---|--------|------|----------|
| 01 | [accessibility](01-accessibility.md) | HIG Lens 1 | 5 Critical · 6 High · 3 Medium |
| 02 | [visual-craft](02-visual-craft.md) | HIG Lens 3 + craft, apple-design §12/15/16 | 1 Critical · 5 High · 5 Medium · 1 Low |
| 03 | [motion](03-motion.md) | apple-design §1–14 | 1 Critical · 3 High · 8 Medium · 3 Low |
| 04 | [interaction-flows](04-interaction-flows.md) | HIG Lens 4 | 3 Critical · 7 High · 5 Medium · 1 Low |
| 05 | [content-navigation](05-content-navigation.md) | HIG Lens 5 + navigation | 1 Critical · 9 High · 5 Medium |
| 06 | [live-site](06-live-site.md) | Rendered pages, measured | Critical issues + cross-checks |

**Confidence.** A finding is marked ✔︎✔︎ when at least 2 agents found it independently or the live site confirmed it. The lead session re-read the source for 7 of the Critical findings, and all 7 held up.

---

## Fix order: 6 PRs

Estimates are rough and assume one person who knows the codebase.

### PR 1 — Broken flows (≈2–3 h)
These lose data or leave a user stuck. Fix them first.
1. ✔︎✔︎ The tutor "Sign out" is a `<Link to="/">` and never calls `logout()`: `src/components/dashboard/TutorSidebar.tsx:153-158`. Delete that branch, since the header's Sign Out already works. (04, 05)
2. Reset password hangs on "Verifying your reset link…" forever when the link is expired, already used, or opened in another browser: `src/routes/_app.reset-password.tsx:27-35`. Read `error_code` from the URL, add an 8 s timeout, and offer "Send a new link". (04)
3. Review submit ignores Supabase's `{ error }`, shows a success toast, and allows double posting: `src/routes/_app.sessions.$id.tsx:214-220`. Check the error, keep the typed text, and disable the button while it's pending. (04)
4. One tap on an unlabeled trash icon hard-deletes a course section and its lessons (cascade), and the item disappears even when the delete fails: `src/components/dashboard/CourseEditor.tsx:676-680, 783-788, 898-903`. Add an `AlertDialog` that names the lesson count, and update the UI only on success. (04, 01)
5. A recurring booking that fails part-way keeps the sessions already created and tells the user to pick another time, so retries create duplicates: `src/routes/_app.book.$tutorId.tsx:261-292`. Book the series in one transaction, or roll back the created IDs. (04)

### PR 2 — Dialogs, forms, names (≈½ day)
1. ✔︎✔︎ `LoginModal` is a bare `<div>`: it has no `role="dialog"`, Esc doesn't close it, focus isn't moved into it or trapped, and Tab passes 6 page buttons first (measured live): `src/pathwise/LoginModal.tsx:250-265`. Rebuild it on `src/components/ui/dialog.tsx`. Do the same for `StageDetailModal`, `MilestoneCelebration`, `ExitDemoModal` and the roadmap overlay, and drop their auto-close timers. (01, 03, 04, 06)
2. ✔︎✔︎ 26 labels have no `htmlFor`, and the password field has no accessible name: `LoginModal.tsx:491-499`. The same pattern is in reset-password, both onboarding flows, CourseEditor and find-tutor. Add `useId` + `htmlFor` + `autoComplete` in the shared `Field` helper, and `role="alert"` on errors. (01, 06)
3. The bell and 20+ tutor icon buttons have no name: `src/components/notifications/NotificationBell.tsx:114`, `tutor.courses.index.tsx:107-125`, CourseEditor. Add `aria-label`, e.g. `Notifications, 3 unread`. (01)
4. Keyboard users can't reach the roadmap stage card (`<div onClick>`, `_app.roadmap.tsx:733`), the photo/video pickers (`className="hidden"`, `_app.onboarding.tutor.tsx:590, 1144`), or the CourseEditor toolbar (mouse-down only, `:1155`). Make the card a real button, switch the pickers to `sr-only`, switch the toolbar to `onClick`, and add the dnd-kit `KeyboardSensor`. (01, 03)

### PR 3 — Fit phones (≈2–3 h)
1. ✔︎✔︎ `label-caps` renders at 10.5 px (223 uses, including every form label), the footer legal links at 9 px, and 174 text elements are under 12 px: `src/styles.css:128-133`, `Footer.tsx:64,74`, `StepDeck.tsx:234`. Set it to 0.75rem, set buttons to 0.8125rem, and remove `text-[0.5625rem]`. (01, 02, 06)
2. ✔︎✔︎ Tap targets are far below 44 px. Measured live: "Show match breakdown" 186×16, "Forgot password?" 122×16, footer links 51×12, filter chips 46×26, and the modal × 12×20. Use `min-h-11` or `py-3 -my-3`. (01, 06)
3. ✔︎✔︎ The booking stepper is 517 px wide in 335 px of space, which widens the page to 537 px: `_app.book.$tutorId.tsx:425-439`. Swap in the existing `<AnimatedStepper>`. Also add `overflow-x-auto` on `ui/tabs.tsx:15` (course tabs make the page 398 px wide) and stack the MatchCard actions (the Message button is clipped 65 of 104 px). (05, 06)
4. ✔︎✔︎ Sticky bars ignore the 58 px header: on `/find-tutor` the progress bar and Back control slide under it (`_app.find-tutor.tsx:143`). Add `--pw-header-h: 3.625rem` and use `top-(--pw-header-h)`. (02, 06)
5. At 200% text size the header runs to x=473 and Sign In goes off-screen. Add `flex-wrap` on `Header.tsx:172` and on the action rows. (06) The tutor sidebar on phones has a second menu toggle sitting on the logo, a drawer with no close button, and nested `<main>`s that leave 295 px of content (`TutorSidebar.tsx:60-66`). Move its items into the header menu. (05)

### PR 4 — Availability grid (≈½ day)
✔︎✔︎ This is the only way a tutor sets hours, and it's 168 `<div onMouseDown>` cells. It has no keyboard or touch path. Available vs Blocked is 1.11:1 in light and 1.15:1 in dark, so the states are told apart by color alone. It's `min-w-[40rem]` on phones and the copy says "Click… Drag": `src/pathwise/AvailabilityGrid.tsx:136-147`, with a duplicate in `_app.tutor.settings.availability.tsx:395, 446-458`. Delete the copy. Make the cells buttons with an `aria-label`, `aria-pressed` and a ✓/× glyph. Below `sm`, show one day plus "Copy Monday to all days". Change the copy to "Tap" and rename "Free" to "Not set". (01, 05)

### PR 5 — Feel (≈1–2 h)
1. All 6 `confetti()` calls skip `disableForReducedMotion` (bursts of 70–270 particles across the screen): `_app.quiz.tsx:180`, `_app.roadmap.tsx:452`, `_app.course-match.tsx:212`, `_app.onboarding.tutor.tsx:385,388`, `MilestoneCelebration.tsx:25`. Route them through one `burst()` helper with `disableForReducedMotion: true`. (03)
2. Buttons have no press state, only a 300 ms hover fade, so a tap on a phone shows nothing: `src/components/ui/button.tsx:8`, `styles.css:473-511, 667-713`. Add `active:scale-[0.97] active:duration-75`. (03)
3. Fake loaders take 1.6 s and 1.8 s before results that are computed instantly (`_app.quiz.tsx:164-187`, `_app.find-tutor.tsx:663-667`). The quiz also locks options for 0.9–1.7 s per answer, adding 12–18 s of waiting per run. Delete the timers, add a focused "Next" button, and switch to `AnimatePresence mode="popLayout"`. (03, 01)
4. ✔︎✔︎ Dark mode leaks light UI. `<Toaster>` comes straight from `sonner` with no theme (`__root.tsx:6,125`), so 117 toasts render light. There's no `color-scheme`, so native selects, date pickers and checkboxes stay light (live: `colorScheme: normal`). Use `ui/sonner.tsx` with `theme`, and add `:root{color-scheme:light} .dark{color-scheme:dark}`. (02, 06)

### PR 6 — Honest copy (≈1 h)
1. `UnverifiedBanner` promises "1–2 minutes", "government ID and a quick selfie" and "3× more bookings". The real process is a 10-minute video call with no ID upload: `src/pathwise/UnverifiedBanner.tsx:19-22`. (05)
2. Course pages promise a "14-day no-questions-asked refund", which contradicts the Terms, and "Enroll Now" actually books a session. (05)
3. The budget slider reads in MDL, but its end labels say "$15" and "$150+". (05)
4. The two quizzes offer different subject lists, and neither includes English, which is half the launch scope. (05)

---

## Owner decisions (not bugs)
From 02-visual-craft. These need a direction from you before anyone codes them.
- **Templated look.** Each theme matches one of the stock generated looks the skill warns about: dark mode is near-black with one amber accent, light mode is cream with a brown accent, and the layout uses broadsheet hairlines with zero radius. The signature that actually belongs to the product, the amber journey line on the landing page, never reaches the roadmap, which is the product's real path.
- **Amber does about 12 jobs.** It covers actions, KPIs, XP, avatars and decoration. Stars and XP are amber in some places and gold in others. Proposal: amber means interactive, selected or "you are here", and gold is used for stars and XP everywhere.
- **Too many primary buttons.** /matches shows up to 9 filled buttons, and "primary" has three different looks. Proposal: only the top match gets a filled button.

## Not covered
- Signed-in pages were audited from source only. The live auditor stayed signed out on production.
- Confetti and toasts weren't triggered live; those findings come from the source.
- Apple guideline text is paraphrased with `file.md › Heading` citations to keep Apple's copyrighted text out of the repo.
