# QED design system (site-wide)

Applies to every route. The landing page `/` is always dark (fixed `qed-*` tokens); every other page uses the theme-aware `--pw-*` tokens below in both light (paper) and dark (ground) themes. Source of truth: `src/styles.css`.

## Tokens now available (theme-aware: light paper / dark ground)
CSS vars: --pw-bg, --pw-surface, --pw-surface-2, --pw-ink, --pw-ink-2, --pw-ink-3, --pw-muted, --pw-accent (TEXT-safe amber: #8a4a0a light / #e8913c dark),
--pw-accent-fill (#e8913c both), --pw-on-accent (#0a0c0e both), --pw-accent-soft, --pw-secondary / --pw-accent-2 (teal, text-safe), --pw-accent-3 (gold, text-safe),
--pw-danger, --pw-border (hairline).
Tailwind: bg-pw-bg, bg-pw-surface, text-pw-ink, text-pw-muted, text-pw-accent, bg-pw-accent-fill, text-pw-on-accent, text-pw-secondary; arbitrary: bg-[var(--pw-surface-2)], border-[var(--pw-border)], text-[var(--pw-ink-2)], text-[var(--pw-danger)] etc.
Radius: every rounded-sm…3xl is now 0 (square). rounded-full still round. Use rounded-full ONLY for pills, chips, avatars, dots.
Shadows: neomorphic gone. shadow-lg/xl/2xl and shadow-pw-float = one floating shadow (modals, popovers, dropdowns only).
Fonts: font-display = Syne (headings), body = Sora. `label-caps` utility = 10.5px/600/0.15em/uppercase.
Component classes already QED-styled: .pw-card .pw-btn-primary .pw-btn-secondary .pw-btn-outline .pw-pill .pw-nav-item .pw-input .pw-badge .pw-row .pw-divider .pw-progress. They are UNLAYERED: Tailwind utilities on the same element for type/radius/bg lose — don't fight them; remove now-dead call-site type (text-[Npx], font-medium, uppercase) on those elements only when you're already editing that line.


## Color (dark = exact landing palette)
- ground #0a0c0e (page) · ground-2 #101317 (alternating sections) · card #16191e (cards)
- ink #ede7dc (text + primary button fill) · ink-2 #9ea5a8 (secondary text, labels; 7.1–7.8:1)
- muted #6c7378 — decorative only (4.1:1, fails AA for small text)
- amber #e8913c (accent word, dots, hover, progress fill; 8:1)
- teal #2e6b72 fills/borders only (3.2:1) · teal-ink #5fa3ab for teal text/icons (6.5:1)
- hairline rgba(237,231,220,.13) — every border/divider

## Type
- Syne (600/700/800) = headings/wordmark/quotes, usually UPPERCASE, tracking -0.025em, leading-none..1.15
- Sora (400/600) = body, leading-relaxed
- `label-caps` = 10.5px / 600 / 0.15em / uppercase (section labels, buttons, nav, chips); micro 9px
- Unweighted Syne resolves to 600 (only 600+ loaded)

## Shape
- Buttons, cards, inputs, icon buttons: SQUARE corners (radius 0)
- rounded-full ONLY for pills/chips, dots, rings
- 1px hairline borders; NO neomorphic raised/inset shadows
- One shadow allowed: 0 10px 30px -5px rgba(0,0,0,.5) for floating cards (deck, modals, popovers)
- Dividers: divide-y hairline; h-px hairline bars

## Components
- Primary btn: label-caps px-8 py-4 bg-ink text-ground hover:bg-amber transition-colors
- Secondary btn: label-caps px-8 py-4 border hairline text-ink hover:border-ink
- Pill CTA: rounded-full border hairline px-4 py-2 label-caps hover:bg-ink hover:text-ground
- Nav link: label-caps text-ink-2 hover:text-amber; active = amber
- Card: bg-card, 1px hairline, square, p-8
- Hairline row: py-8, label-caps tag + Syne title, hover title translate-x-2 / amber, arrow-up-right icon
- Table: label-caps header row in ink-2 with border-b hairline; rows divide-y hairline
- Section: px-6 md:px-24 py-32; inner mx-auto max-w-7xl; section label `label-caps mb-8`
- Input: square, hairline border, transparent/ground-2 bg, focus ring 2px amber

## Motion
- framer-motion: useScroll+useTransform (linear), drag-x w/ dragSnapToOrigin, spring 260/26, AnimatePresence exits 0.4s easeIn
- Hover: transition-colors; titles translate-x-2; arrows translate-x-0.5; 300ms
- Reduced motion: CSS motion-reduce:* + <MotionConfig reducedMotion="user">

## Theme
- Landing `/` always dark (fixed qed-* tokens). Rest of site: keep light/dark toggle (html.dark).
- Dark = palette above. Light = QED light variant: paper ground (~#ede7dc family), ink #0a0c0e, same amber/teal (darken for TEXT use to pass AA), hairline rgba(10,12,14,.13), same type/shape/motion.

## Mapping for existing PathWise primitives (src/styles.css ~410+)
- .pw-card → card · .pw-btn-primary/.pw-btn-secondary → primary/secondary btn · .pw-pill → pill CTA
- .pw-badge → rounded-full hairline chip, label-caps, no shadow · .pw-input → input
- .pw-row → hairline row · .pw-divider → h-px hairline · .pw-progress → h-px track, amber fill
- .pw-nav-item → nav link · .pw-raised*/.pw-inset/.pw-well → hairline border, no shadow
