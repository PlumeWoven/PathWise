## Design review: PathWise, motion, response and interaction feel

Lens: motion, response and interaction feel. This audit covers the source only, at commit `9b64a11` on branch `claude/apple-design-skills-audit-084055`. Another agent covers the live site.
Skills: `apple-design` (primary, cited as `apple-design §N`) and `apple-hig` (cited as `file.md › Heading`; HIG pages read: motion, feedback, gestures, sheets, modality, scroll-views, loading, plus cross-platform.md). HIG wording is paraphrased here, not quoted.

### Summary

**Overall rating: Critical issues.**

The landing page has a real motion point of view. The thesis is "see where you stand, then the path": a scroll-driven portal splits the PATH/WISE wordmark, an amber comet follows the journey line, and the theme toggle reveals the new theme as a radial sweep from the button. Those three moments are what PathWise motion will be remembered by, and all three have reduced-motion fallbacks. The app behind the landing page is a different story:

- It uses generic fade-up staggers and bouncy springs.
- Timers make people wait in the main funnel: the quiz has about 12 to 18 s of fixed waiting, and there are fake "Analyzing…" screens.
- No button responds on press.
- Confetti fires in 4 live flows and ignores `prefers-reduced-motion`.

The 15 findings: 1 Critical, 3 High, 8 Medium, 3 Low or craft.

### Motion inventory

**framer-motion 12.40** is used in 19 files, with about 68 `motion.*` elements. Grouped by purpose:

| Purpose | Where | Values found |
| --- | --- | --- |
| Scroll-linked (landing) | `PortalHero.tsx:20-35`, `Statement.tsx:3-5`, `JourneyLine.tsx:121,138` | `useScroll`→`useTransform`: panels x 0→±105%, title scale 1→1.15, **letterSpacing −0.025→−0.065em**, image scale 1.1→1; ring y = scrollY·0.1, rotate = scrollY·0.05; comet `useSpring` 60/20/m0.8 (ζ≈1.44), fade 140/26 (ζ≈1.1) |
| Auto-play deck | `StepDeck.tsx:84-136` | imperative `animate()`: drop 0.55 s `[0.55,0,1,0.45]`; spring **110/14 (ζ≈0.67, ~6% overshoot)**; waits 260 + 160 ms; stagger 0.12 s; auto every 4.5 s |
| Step transitions | `AnimatedStepper.tsx:9-17` (quiz), `find-tutor.tsx:164-171`, `book.$tutorId.tsx:468-474` | stepSlide x ±20, spring 300/30 (ζ≈0.87), opacity/exit 0.2 s; find-tutor x ±40, 0.28 s easeOut; book x +12/−12, 0.2 s. **All three use `mode="wait"`** |
| Indicators | `AnimatedStepper.tsx:77-101`, `roadmap.tsx:601-606`, `find-tutor.tsx:154-157` | layoutId ring 300/30; connector scaleX 0.5 s power3; progress **width** 0.7 s / 0.4 s easeOut |
| Modals and overlays | `StageDetailModal.tsx:34-46`, `roadmap.tsx:897-935`, `MilestoneCelebration.tsx:44-66` (unused) | 0.2 s fade + scale 0.96; spring **260/26 (ζ≈0.81)** from scale 0.7 |
| Entrance fades and staggers | roadmap `528, 562, 699-705`; course-match `347, 525`; library `205`; availability `390`; AvailabilityGrid `66`; MatchCard `42`; choose-role `121`; book `372`; find-tutor option lists | opacity + y 6-20 px, 0.25-0.4 s or spring 260/26, stagger 0.04-0.08 s |
| Gesture props | `find-tutor.tsx` (6 buttons) | whileHover scale 1.03-1.04 / x 4 / y −4; **whileTap scale 0.96-0.98** (the only press feedback in the app) |
| Infinite loops | `roadmap.tsx:714-726`; `find-tutor.tsx:381, 683, 701` | boxShadow pulse 1.6 s ∞; rotate ±8° 2 s + 1 s delay ∞; rotate 360° 1.4 s linear ∞; rotate ±8° 6 s ∞ |
| Theme icon | `ThemeToggle.tsx:89-111` | spring 260/26, `mode="wait"`, scale 0 + rotate ±90 |
| Global | `__root.tsx:120` (duplicated at `_app.index.tsx:66`) | `MotionConfig reducedMotion="user"` |

**CSS keyframes** (`src/styles.css`):

| Keyframe | Values | Status |
| --- | --- | --- |
| `pw-flash-green`, `pw-flash-red` | 600 ms ease-out (box-shadow) | live: quiz answer feedback |
| `pw-float-up` | 1.2 s forwards | live: quiz "+XP" |
| `vt-reveal` | 620 ms `cubic-bezier(0.22,1,0.36,1)` / 560 ms `cubic-bezier(0.4,0,0.2,1)` reverse | live: theme sweep |
| `pw-bounce-chev`, `pw-float-1/2/3`, `pw-float-wrapper` | 1.6 / 4 / 5 / 3.5 / 6 s, infinite | **unused** (lines 719-854) |

`tw-animate-css` supplies `animate-in`/`animate-out` for dialog, dropdown, popover, tooltip and sheet, and the 0.2 s accordion height animation.

**CSS transitions and Tailwind classes:**
- 9 hand-written rules ease color, background and border over 0.3 s on `body`, `.pw-card`, `.pw-btn-*`, `.pw-pill`, `.pw-nav-item`, `.pw-row` and `.pw-input` (`styles.css:376, 460, 481, 506, 540, 562, 607, 675, 708`).
- `transition-colors` appears 128 times (9 of them at `duration-300`).
- `transition-transform` ×5, `transition-opacity` ×4, **`transition-all` ×9**.
- Durations of 500 ms or more: `quiz.tsx:457` (500), `ThemeToggle.tsx:82` (500), `Footer.tsx:93` (1000), `sheet.tsx:34` (500, unused).
- `animate-spin` ×10, `animate-pulse` ×6 (4 skeletons, 1 mail icon), `animate-float-up` ×1.

**Other motion:**
- canvas-confetti: 6 call sites in 5 files.
- The mobile `TutorSidebar` slides on Tailwind's default 150 ms transform transition.

**Direct-manipulation libraries:**
- `vaul` and `embla`: wrappers exist in `ui/drawer.tsx` and `ui/carousel.tsx`, but neither has a consumer.
- `@dnd-kit`: one consumer, `CourseEditor.tsx`.

### Critical

**1. [Critical] Confetti ignores reduced motion in every flow** (`quiz.tsx:180`, `roadmap.tsx:451-460`, `course-match.tsx:212`, `onboarding.tutor.tsx:385, 388`, `MilestoneCelebration.tsx:25`)
- **What:** None of the 6 `confetti()` calls passes `disableForReducedMotion`, whose default in canvas-confetti 1.9 is `false`. The bursts run across the full viewport:
  - quiz result: 80 particles
  - roadmap stage complete: 3 × 90 = 270
  - course complete: 70
  - tutor profile published: 140 + 80

  Neither the root `MotionConfig` nor the CSS kill rule at `styles.css:858` reaches a canvas, so this is the largest motion in the app and nothing stops it.
- **Why:** `apple-design §14` says reduced motion means replacing vestibular motion and avoiding full-viewport movement. `motion.md › Best practices` says to make motion optional and never the only carrier of meaning. Each of these flows also confirms success in text (toast or overlay), so dropping the particles loses nothing.
- **Fix:** Add `disableForReducedMotion: true` to every call. The four-color array is repeated in each call, so one shared helper removes the duplication too:
  ```ts
  // src/lib/celebrate.ts
  import confetti from "canvas-confetti";
  export const burst = (o: confetti.Options = {}) =>
    confetti({ colors: ["#e8913c", "#5fa3ab", "#ede7dc", "#2e6b72"], disableForReducedMotion: true, ...o });
  ```

### Improvements

**2. [High] No button responds when pressed** (`ui/button.tsx:8`, `styles.css:473-511, 667-686, 699-713`)
- **What:** No pressable in the app has an `:active` state:
  - the shadcn `Button`
  - `.pw-btn-primary`, `.pw-btn-secondary`, `.pw-btn-outline`
  - `.pw-pill`
  - quiz options and booking steps

  The only press feedback is `whileTap` on 6 buttons in `find-tutor.tsx` and `active:` in the unused `ui/sidebar.tsx`. Hover is a 300 ms color fade. A phone has no hover, so a tap gives no visual response until the next screen renders.
- **Why:** `apple-design §1` says to respond on pointer-down, not on release, and that directness drops sharply the moment lag appears. `gestures.md › Best practices` asks for immediate feedback during a gesture. `motion.md › Providing feedback` asks for brief feedback on frequent interactions.
- **Fix:**
  - In `ui/button.tsx:8`, replace `transition-colors duration-300` with `transition-[color,background-color,border-color,scale] duration-150 active:scale-[0.97] active:duration-75`. In Tailwind v4, `scale-*` sets the `scale` property, so the transition must list `scale`, not `transform`.
  - In `styles.css`, cut the `.pw-btn-*` and `.pw-pill` transitions to `0.15s`, add `scale 80ms ease-out` to their transition lists, and add this rule:
    ```css
    :is(.pw-btn-primary,.pw-btn-secondary,.pw-btn-outline,.pw-pill):active:not(:disabled) { scale: .97; }
    ```

**3. [High] Fake loading screens in both onboarding funnels** (`quiz.tsx:164-187, 576-587`; `find-tutor.tsx:663-667, 681-684`)
- **What:**
  - **Quiz:** `finish()` shows "Analyzing your answers..." for a fixed **1600 ms**, although `finalBand()` and `topicBands()` are synchronous. It changes the phrase every **500 ms**, and each change runs a **300 ms out + 300 ms in** cross-fade under `mode="wait"`. That cross-fade takes longer than the interval, so the second phrase peaks at about 67% opacity and the text is fully legible for only about 200 ms of the 1.6 s.
  - **find-tutor:** `Results` shows "Finding your perfect match…" for a fixed **1800 ms** while a sparkle spins forever. `deriveTraits()` is synchronous and nothing is fetched.

  Together that is 3.4 s of waiting with no work behind it, in the two flows that sell "3 minutes".
- **Why:** `loading.md` says the best loading experience finishes before people notice it, and `loading.md › Best practices` says to show something as soon as possible. `apple-design §1` names artificial timers as latency to remove.
- **Fix:**
  - Quiz: delete the interval and the outer `setTimeout` in `finish()` and call `setPhase("result")` directly.
  - find-tutor: delete `matching` state at `find-tutor.tsx:663-667` and render the card immediately.
  - If a beat of anticipation is wanted, use one static line for at most 400 ms, never cycling copy.

**4. [High] Input is locked during step transitions** (`quiz.tsx:104-112, 143-152, 347`; `find-tutor.tsx:164, 285, 299`; `book.$tutorId.tsx:468`)
- **What:**
  - Quiz subject and goal picks wait **300 ms** (`setTimeout`) before advancing.
  - Each answer disables the options for **900 ms** (correct) or **1700 ms** (wrong) with no way to skip.
  - Every step change then waits for the **200 ms** exit under `AnimatePresence mode="wait"` before the next step mounts.

  Across subject, goal, 8 questions and the fake loader, that adds up to about **11.8-18.2 s of fixed waiting**. find-tutor and booking use the same `mode="wait"` gate (280 ms and 200 ms per step), and find-tutor Q1 adds another 150-200 ms `setTimeout`.
- **Why:** `apple-design §3` says never to lock out input during a transition. `motion.md › Providing feedback` says to let people cancel motion rather than wait for it to finish.
- **Fix:**
  1. Keep the correct/wrong feedback, but render a focused "Next →" button with it. Click or Enter advances immediately; keep the timer only as a fallback (correct ≤ 600 ms).
  2. Delete the 300 ms and 150-200 ms pre-advance timeouts.
  3. Switch the three step containers to `<AnimatePresence mode="popLayout" custom={direction}>`. The incoming step mounts while the old one exits. `Step` in the quiz must pass `ref` through to its `motion.div` (React 19 treats `ref` as a plain prop).

**5. [Medium] Modal and step paths are asymmetric and inconsistent** (`StageDetailModal.tsx:33`, `roadmap.tsx:885`, `ui/dialog.tsx:39`, `LoginModal.tsx:49, 250`, `ExitDemoModal.tsx:11, 26`, `book.$tutorId.tsx:468-474`)
- **What:** The 5 live modal surfaces show 4 different behaviors:
  - **StageDetailModal** fades and scales in but **disappears instantly**. It wraps itself in its own `<AnimatePresence>`, nested inside the roadmap's. framer-motion 12's default `propagate={false}` stops the nested child from registering with the outer one, so the `exit` never runs.
  - **ConfirmationModal** (`ui/dialog.tsx`) keeps shadcn's `slide-in-from-left-1/2 slide-in-from-top-[48%]`. Under Tailwind v4 the centering uses the separate `translate` property, so the tw-animate `transform` adds −50% / −48% on top. The dialog swoops in diagonally from the top-left and leaves the same way.
  - **LoginModal** and **ExitDemoModal** pop in and out with no motion.
  - **The roadmap completion overlay** springs in from scale 0.7 with bounce.
  - **Booking:** the step slide always enters from +12 and exits to −12, so Back (`:216`) slides the wrong way.
- **Why:** `apple-design §7` says things should enter and exit along the same path, anchored to their source. `motion.md › Providing feedback` warns that feedback motion that doesn't make sense disorients people.
- **Fix:**
  - Delete the inner `<AnimatePresence>` at `StageDetailModal.tsx:33` and add `y: 10` to its exit so it mirrors the entrance.
  - Delete the four `slide-*` classes at `ui/dialog.tsx:39` and keep fade + `zoom-95`.
  - Move LoginModal and ExitDemoModal onto `ui/dialog` (Radix). This gives them the same motion, plus Esc and a focus trap.
  - Booking: reuse `stepSlide` and `useStepDirection` from `AnimatedStepper.tsx`, as the quiz does.

**6. [Medium] Bounce on UI that had no momentum** (`roadmap.tsx:704, 910`; `ThemeToggle.tsx:107-111`; `find-tutor.tsx:433`; `MilestoneCelebration.tsx:56`; `StepDeck.tsx:93`)
- **What:**
  - `stiffness 260, damping 26` (mass 1) gives ζ = 26/(2√260) ≈ **0.81**, Apple's response ≈ 0.39 s. That is Apple's drawer/flick spring, used here for modal entrances, list staggers, the pace icon and the theme icon.
  - StepDeck's autoplay uses `110/14` (ζ ≈ **0.67**, about **6% overshoot**, roughly 30 px on the ~500 px return trip), so the deck wobbles on its own every 4.5 s.
  - The theme icon also uses `mode="wait"`, which plays the exit and entrance one after the other.
- **Why:** `apple-design §4`: start UI at critical damping (1.0) and add bounce of about 0.8 only after a gesture that carried momentum. A fade-in or a timer has no momentum.
- **Fix:**
  - Use one critically damped default: `{ type: "spring", bounce: 0, visualDuration: 0.3 }`. The stiffness/damping equivalent is `stiffness: 260, damping: 32`.
  - StepDeck: same default, stagger 0.06 s.
  - ThemeToggle: drop `mode="wait"` and make the swap opacity-only, 0.15 s.
  - Keep `bounce: 0.2` for a future drag release only.

**7. [Medium] The StepDeck drops input while a swap plays** (`StepDeck.tsx:58, 84-127`)
- **What:** `busy.current` rejects Next clicks, arrow keys and taps on the front card for the whole swap. That is the 260 ms and 160 ms awaits, plus up to 240 ms of stagger, plus springs of about 0.6 s: roughly **1.3 s**. The drop uses a fixed 0.55 s ease-in that cannot be retargeted. A second press is silently lost.
- **Why:** `apple-design §3`: animations must be interruptible and start from the current on-screen value, and fixed-duration scripted motion can't respond to new input.
- **Fix:** Commit `order.current = [...rest, first]` at the **start** of `swap()`, then call `animate(el, slot, spring)` for every card. framer's `animate` retargets from the live value and keeps the current velocity, so a second press redirects the cards mid-flight. Delete `busy`, `wait()` and the scripted drop. If the "drop" flourish should stay, give the old front card keyframes `y: [null, 420, s.y]` in the same spring call.

**8. [Medium] The roadmap's active-stage pulse loops forever and ignores reduced motion** (`roadmap.tsx:714-726`)
- **What:** The active stage node animates `boxShadow` from 0 to a 10 px ring every **1.6 s** with `repeat: Infinity`. `MotionConfig reducedMotion="user"` only disables positional keys (width, height, top, left, right, bottom and transforms; see `motion-dom keys-position`). boxShadow is not one of them, so the loop keeps running under reduced motion. It also repaints the shadow on every frame.
- **Why:** `apple-design §14` says to avoid looping motion and respect reduced motion. `apple-design §11` says to animate only transform and opacity. `motion.md › Best practices` says to add motion purposefully.
- **Fix:** Gate the loop with `const reduce = useReducedMotion()`. Move the pulse to an inner ring `span` animating `{ scale: [1, 1.8], opacity: [0.6, 0] }` with `repeat: 2` (three pulses, then stop) and only when `isActive && !reduce`. A gate is required: with only MotionConfig, the scale would snap while the opacity kept blinking.

**9. [Medium] Reduced motion means hard cuts, not gentler motion** (`ThemeToggle.tsx:23-29`, `styles.css:858-866`)
- **What:**
  - **Theme switch:** with reduced motion on, the theme flips instantly. The global rule also cuts the body's 0.3 s background transition to 0.001 ms, so the whole screen jumps from `#0a0c0e`-dark to paper in one frame.
  - **Spinners:** the global rule sets every animation to 0.001 ms and one iteration. The 10 `animate-spin` spinners freeze, which looks like a hang (examples: `confirm-email.tsx:120`, `quiz.tsx:552`, `CourseEditor.tsx:258`).
  - **Quiz feedback:** the `forwards` "+XP" float (`quiz.tsx:501`) jumps straight to its last frame, `opacity: 0`, so it is never seen.
- **Why:** `apple-design §14`: reduced motion is a gentler, non-vestibular equivalent such as a short cross-fade; keep opacity and color changes that aid comprehension, and ease dark↔light changes. `feedback.md › Best practices` asks for status feedback that stays in the interface.
- **Fix:**
  1. ThemeToggle: when `reduceMotion` is set, still call `startViewTransition`, but add class `vt-fade` with:
     ```css
     html.vt-fade::view-transition-old(root){animation:200ms ease both vt-out}
     html.vt-fade::view-transition-new(root){animation:200ms ease both vt-in}
     @keyframes vt-out{to{opacity:0}} @keyframes vt-in{from{opacity:0}}
     ```
     The global `*` rule does not match view-transition pseudo-elements, so this survives.
  2. In the global block, exempt spinners with `*:not(.animate-spin)`. Replace the `transition-duration` kill with `transition-property: color, background-color, border-color, opacity !important;`. Movement then snaps, but color and opacity still ease.

**10. [Medium] Celebrations and toasts don't match the size of the moment** (`quiz.tsx:179-186`; `course-match.tsx:212-218`; `roadmap.tsx:451-467, 897-905`; `ExitDemoModal.tsx:16`; `availability.tsx:200`; `sessions.$id.tsx:195`)
- **What:**
  - **Quiz:** confetti fires 200 ms after **any** placement, including "you are a Beginner".
  - **Course completion:** confetti plus a success toast for the same event.
  - **Roadmap stage complete:**
    - three bursts (270 particles)
    - a full-screen `fixed inset-0` overlay with an 8 px backdrop blur
    - the overlay auto-dismisses after **1500 ms**, with no click, Esc or button, so it blocks the page
  - **Toast counts:** 33 `toast.success` and 80 `toast.error` calls.
  - **Field validation shown as top-center toasts:** "Please enter a valid email", "must start with https://" and "Please give a reason". The error appears far from the field it concerns.
- **Why:**
  - `apple-design §13` (Utility): reserve celebration for meaningful moments, because too much feedback trains people to ignore it.
  - `apple-design §16`: validate inline.
  - `feedback.md › Best practices`: confirm completion only when the task is important enough, and put status feedback near the item it describes.
  - `modality.md › Best practices`: always give people an obvious way to dismiss a modal view.
- **Fix:**
  - Keep confetti for one true milestone, roadmap stage completion, as a single burst.
  - Remove it from the quiz and course-match.
  - Make the stage overlay dismissible: add `onClick={() => setOverlay(null)}` and `pointer-events-auto`, and listen for Esc.
  - Show validation errors as inline text under the field with `aria-describedby`.

**11. [Medium] dnd-kit runs on its defaults** (`CourseEditor.tsx:625, 754, 771-776`)
- **What:** Both `useSensors(useSensor(PointerSensor), useSensor(TouchSensor))` calls have:
  - **no `activationConstraint`**, so a drag starts at 0 px of movement
  - a `TouchSensor` that is redundant (PointerSensor already covers touch, and the grip is `touch-none`)
  - **no `KeyboardSensor`**, so drag is the only way to reorder sections and lessons
  - no axis lock, so rows wander sideways in a vertical list
  - a grip `<button>` with no accessible name

  What works: tracking is 1:1 and keeps the grab offset, because rows follow `CSS.Transform` deltas. The drop uses dnd-kit's default 250 ms ease.
- **Why:**
  - `apple-design §10`: about 10 px of hysteresis before committing to a drag.
  - `gestures.md › Best practices`: give people more than one way to interact, and don't make a custom gesture the only way to do an important action.
- **Fix:**
  ```ts
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const vertical: Modifier = ({ transform }) => ({ ...transform, x: 0 }); // no @dnd-kit/modifiers needed
  // <DndContext sensors={sensors} modifiers={[vertical]} …>, grip: aria-label="Reorder section"
  ```

**12. [Medium] The tutor's mobile sidebar is a scripted drawer you can't drag** (`TutorSidebar.tsx:68-80`)
- **What:**
  - The panel slides on Tailwind's default `transition-transform` (150 ms, `cubic-bezier(0.4,0,0.2,1)`).
  - The scrim is conditionally rendered, so it pops in and out with no fade while the panel slides.
  - There is no drag or swipe to close.
  - `vaul` is installed (with a `ui/drawer.tsx` wrapper) and unused anywhere. It would supply 1:1 tracking, release velocity and snapping.
- **Why:**
  - `sheets.md › Mobile (iOS, iPadOS)`: support swiping to dismiss.
  - `apple-design §2` and `§5`: content follows the finger, and release velocity hands off into the close animation.
  - `cross-platform.md › Vocabulary` maps sheet to a drawer or panel on the web.
- **Fix:**
  - Lazy fix: always render the scrim with `transition-opacity duration-200` and `opacity-0 pointer-events-none` when closed.
  - Full fix: `<DrawerPrimitive.Root direction="left">` from `vaul`, used directly. The `ui/drawer.tsx` wrapper hard-codes a bottom sheet and a horizontal grabber.

**13. [Low] Layout properties are animated** (`PortalHero.tsx:25, 79`; `find-tutor.tsx:430-433`; progress fills at `quiz.tsx:457`, `StepDeck.tsx:229`, `roadmap.tsx:601-606`, `find-tutor.tsx:154-157`, `CourseEditor.tsx:274`, `dashboard.index.tsx:654`)
- **What:**
  - **PortalHero:** the scroll-linked `letterSpacing` on 8-10vw display type re-lays out the text on every scroll frame. Fix this one first.
  - **find-tutor pace slider:** the icon springs `left`.
  - **Progress bars:** six of them animate `width`, at 0.3 to 0.7 s.
  - **`transition-all`:** 9 uses, including `ToggleSwitch.tsx:29`, which only needs `transform`.
- **Why:** `apple-design §11`: animate only compositor-friendly `transform` and `opacity`.
- **Fix:**
  - Drop the `titleSpacing` transform; scale and split already sell the reveal.
  - Pace icon: `animate={{ x: … }}` instead of `left`.
  - Progress fills: `className="origin-left"` with `animate={{ scaleX: pct / 100 }}` (CSS: `scale: <n> 1`).
  - Replace `transition-all` with the specific property.

**14. [Low] Decorative infinite loops in find-tutor** (`find-tutor.tsx:379-383, 699-703, 681-684`)
- **What:**
  - Q3 rotates three 48 px icons ±8° every 3 s (≈0.33 Hz) for as long as the question is open.
  - The results card rotates a 128 px target over **6 s (≈0.17 Hz)**, close to the 0.2 Hz band the skill flags.
  - The fake loader spins a sparkle.

  `MotionConfig` disables these rotations under reduced motion, but everyone else sees them indefinitely.
- **Why:**
  - `apple-design §14`: avoid slow looping oscillations near 0.2 Hz.
  - `motion.md › Best practices`: don't add motion for its own sake, because excess animation distracts.
- **Fix:** Delete the three `repeat: Infinity` transitions. The sparkle goes away with finding 3.

### Craft notes

**15. [Low] Delete the motion code nobody uses.**

| Unused code | Where |
| --- | --- |
| `MilestoneCelebration.tsx` | the roadmap inlines its own copy at `roadmap.tsx:897-935` |
| `hooks/useDVDFloat.ts` | no callers |
| `pathwise/CourseCard.tsx` | `library.tsx:332` defines its own |
| `.animate-chev`, `.animate-pw-float-1/2/3`, `.animate-pw-float-wrapper` with their keyframes | `styles.css:719-733, 791-854` |
| `ui/drawer.tsx`, `ui/carousel.tsx`, `ui/sheet.tsx` | no consumers |
| the second `MotionConfig` | `_app.index.tsx:66` (root already sets it) |

Fewer motion vocabularies make the house spec below enforceable.

**Point of view.** The landing page has one and the app does not:

- **Landing:** PortalHero, JourneyLine and the radial theme sweep are specific to this product. They are about finding where you stand and following a path.
- **App interior:** the default "fade-up 8-20 px, stagger 0.05-0.08 s, spring 260/26". Six different step and progress speeds (0.2, 0.25, 0.28, 0.3, 0.4, 0.7 s) show that nobody chose a speed deliberately.
- **Where the boldness should go:** the roadmap. A completed stage could draw its segment of the vertical line in amber, the way JourneyLine draws its comet, instead of confetti plus an overlay. That would carry the landing's signature into the product. Everything else in the app should stay quiet.

### What works

- **Root `MotionConfig reducedMotion="user"`** (`__root.tsx:120`) covers every declarative transform and layout animation.
- **Landing scroll motion:** reduced-motion fallbacks are written in CSS so server and client markup match. The section collapses to one viewport, the panels and dots hide, and transforms reset with `!important` (`PortalHero.tsx:15-16, 38-90`; `Statement.tsx:37`; `JourneyLine.tsx:232`).
- **StepDeck auto-play** pauses on hover, on focus, when off-screen (`useInView` 0.4) and when the tab is hidden. It never auto-plays under reduced motion and offers arrow keys plus a Next button (`StepDeck.tsx:129-136, 184-189`).
- **ThemeToggle radial sweep** is a textbook `apple-design §7`: it starts at the button's measured center, its radius reaches the farthest corner, and it contracts back into the icon in the other direction (`ThemeToggle.tsx:31-46`, `styles.css:877-907`).
- **Radix transform-origin variables** are wired on dropdown, popover and tooltip, so menus scale from their trigger (`ui/dropdown-menu.tsx:49, 67`). NotificationBell uses this.
- **AnimatedStepper** has a direction-aware `stepSlide`, a shared `layoutId` ring and a connector that animates `scaleX`, not width (`AnimatedStepper.tsx:9-28, 77-101`). Booking and find-tutor should reuse it.
- **find-tutor's `whileTap` scale 0.96** is the only pointer-down feedback in the app. Use it as the model for finding 2.
- **dnd-kit rows** track by transform delta, so the grab offset is kept.

### Platform notes

PathWise is a web app. Apple's platform conventions apply here as principles, translated with `cross-platform.md`:

- **No hover on phones.** Any feedback that lives only in `hover:` is invisible on a phone. That makes finding 2 more urgent on mobile.
- **iOS Safari `:active`.** It fires only when a touch listener sits in the element's ancestry. React's root listeners provide one, so the CSS `:active` fix works there.
- **View Transitions.** Supported in current Chromium, Safari and Firefox. Without support, the theme toggle flips instantly while the `.pw-*` 0.3 s color transitions run, so some surfaces fade and others snap. The cross-fade path in finding 9 covers this as well.

### Proposed house motion spec

1. Default motion is `{ type: "spring", bounce: 0, visualDuration: 0.3 }`, and opacity-only changes take 0.15 s. Use `bounce: 0.2` with the release `velocity` only after a drag or flick.
2. Every pressable gets `active:scale-[0.97]` at 75 ms. Hover color changes take 150 ms, never 300 ms.
3. Enter and exit along the same path. Modals use scrim opacity plus panel opacity and scale 0.98→1. Menus scale from the Radix origin variables. Step flows use `mode="popLayout"`, never `"wait"`.
4. No artificial waits: no `setTimeout` before the UI and no fake loaders. Feedback holds at most 600 ms and can be skipped.
5. Animate `transform` and `opacity` only. Progress bars use `scaleX`. No `transition-all`.
6. Reduced motion: `MotionConfig` covers transforms. Every canvas, imperative or infinite effect checks `useReducedMotion()` and swaps to a cross-fade of 200 ms or less, never a hard cut.
