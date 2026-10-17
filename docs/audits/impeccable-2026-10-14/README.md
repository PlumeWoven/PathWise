# Impeccable audit: vibe-coded design tells, 2026-10-14

The site was checked against the **Impeccable** skill, vendored in `.agents/skills/impeccable`: its 15 AI design tells (`ai-design-tells.md`), the craft floor, and the audit/critique references. Five agents ran in parallel:
- four read the source: visual, structure, copy, and type/colour;
- one critiqued the live site at 1440 and 390 px in both themes, signed out.

Impeccable's detector binary was not vendored or run (it is an unreviewed executable), so every finding comes from a grep sweep checked in context, or from a live measurement.

**The brief wins.** The owner's decisions (AMOLED black / chalk cream, orange-only accents, sentence-case controls, one filled button per view, the 8px grid, Syne + Sora, keeping the Voices section, leaving subjects as they are) were treated as settled, not as defects.

| # | Report | Verdict |
|---|---|---|
| 01 | [visual tells](01-visual-tells.md) | Palette clean (no gradients, gradient text, glass, or hard shadows). Tells: section kickers, hero stat chips, decorative motion, browser defaults. 4 P1 · 7 P2 · 5 P3 |
| 02 | [structure tells](02-structure-tells.md) | Landing mostly authored; app pages templated (boxes, kickers, one gap everywhere), and some numbers are invented. 2 P0 · 5 P1 · 7 P2 · 4 P3 |
| 03 | [copy tells](03-copy-tells.md) | 132 em dashes in user-visible copy; invented numbers; buttons that promise actions nothing performs; the landing never says what PathWise is |
| 04 | [live critique](04-live-critique.md) | Landing 20/32, app 24/40. The hero is genuinely authored; test data stands in for the marketplace |
| 05 | [type & colour](05-type-colour-tells.md) | Tokens good (Theming 3/4); type system weak (30 sizes); toasts off-palette; pills still uppercase |

## Fixed in this pass
See the PR for the full per-file list.
- **Invented numbers removed:** "94% accuracy" and "3 min avg" in the hero and the step deck; the tutor-profile "N countries" stat (it was computed as students ÷ 3 + 1); the dashboard's fixed "~3 hours" response time; the roadmap's identical "8–12 weeks" estimate shown to every student. The level check is now described as **8 questions** everywhere.
- **Decorative kickers** above landing and app headings are deleted. Labels that carry real information stay (stage numbers, breadcrumbs).
- **Decorative motion removed:** find-tutor hover zooms and nudges, icons that wiggle forever, the rotating watermark, the roadmap's infinite pulse, the StepDeck bounce, and dead infinite keyframes.
- **Browser surfaces themed:** `::selection`, caret, scrollbar colour, and one amber `:focus-visible` ring for every focusable element.
- **Toasts:** `richColors` (mint green / blue) is off; the action button uses the amber fill with dark text.
- **Pills in sentence case**, with tabular numerals (they hold times and prices).
- **Honest UI:** fake "alert / waitlist / notify" buttons are removed; the demo's "Create my free account" now opens the real login dialog (it has no sign-up mode yet); the course page's wishlist (nothing read it) is gone; booking and publish confirmations say what actually happened.
- **Copy:** em dashes in user-visible copy cut from 132 to 27 (the rest sit in files no fix team owned), title separators changed to `·`, repeated slogans removed, and plain language about what PathWise does.
- **Docs:** `docs/QED_DESIGN_SYSTEM.md` now opens with the owner decisions that supersede it (no teal/gold, sentence-case controls). The style guide no longer shows Teal/Gold swatches.

## Needs the owner (not changed)
1. **Test data on the public marketplace.** "TEST" and "INISTORICA1" tutors at 0 MDL/hr, a selfie course cover, and a course called "Become a millionare" are the first things visitors see. Hide test accounts (an `is_test` flag or unverify them), or seed real tutors.
2. **Voices testimonials:** kept per your decision, but the quotes have no source, and two name subjects PathWise doesn't teach (Spanish, front-end development). The recommendation is to hide the section until real quotes exist.
3. **Certificates:** course pages and the editor offer a "Certificate of completion", but nothing issues one. Remove it, or keep it only if tutors issue certificates themselves.
4. **Booking: 5 steps → 3.** "Timezone" is pre-filled and "Pay" charges nothing; Type → Time → Confirm would do.
5. **Tutor dashboard order:** "Next up" (the panel tutors act on) sits below the earnings chart; ten boxes are equal in weight.
6. **Type scale:** 30 font sizes are in use; report 05 proposes 6 tokens (12/14/16/20/28/36px), and reading text should be ≥16px. This is a half-day mechanical pass, best done like the spacing grid, with a guard test.
7. **Subjects:** still inconsistent and still no "English" (left as-is by your earlier decision).
8. **The full Impeccable tool:** to get its detector and hooks, run `npx impeccable install --scope=project` yourself. It downloads a binary I did not run.
