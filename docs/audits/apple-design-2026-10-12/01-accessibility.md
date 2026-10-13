## Design review: PathWise (web), accessibility lens

Audit date 2026-10-12. Scope: source only (`src/routes`, `src/pathwise`, `src/components`, `src/styles.css`). The live site is covered by a separate audit. Lens: apple-hig Lens 1 plus the skill's "Accessibility audit" mode. References opened: `accessibility.md`, `typography.md`, `color.md`, `dark-mode.md`, `layout.md`, `voiceover.md`, `modality.md`, `cross-platform.md`, and `apple-design` §10, §14 and §15.

How the numbers were measured. Contrast is WCAG 2.x, computed from the hex tokens in `src/styles.css`. Translucent colours were composited over the surface they sit on. Sizes are CSS px. Below 48rem the root font size is 100% (16px). At 48rem and wider it is 120% (19.2px; `styles.css:351-355`). So phone sizes are the binding case.

Citations use `file.md › Heading` for `.agents/skills/apple-hig/references/hig/`. The guidelines are paraphrased, not quoted. Open the cited heading for Apple's exact wording. "WCAG x.y.z" marks a rule that comes from WCAG rather than the HIG.

---

### Summary

**Overall rating: Critical issues.**

**Thesis.** PathWise is a square, ink-on-paper "QED" study tool: quiz, then a staged roadmap, then a verified tutor. People will remember it for two things: uppercase `label-caps` micro-type and 1px hairline squares.

**What's solid.** The colour work is good. Every text token passes AA in both themes, and the light theme correctly splits amber into a text-safe colour (`#8a4a0a`) and a fill colour (`#e8913c`).

**What fails.** The failures are structural, and they sit in the paths that matter most:
- The sign-in modal has no dialog semantics.
- Almost no form label is linked to its field.
- The header bell and the tutor tools are unnamed icon buttons.
- The tutor's availability grid can only be used with a mouse and shows its states by colour alone.

The two signature details also cause failures:
- The hairline is the only boundary on every input, at 1.32:1.
- The 10.5px label-caps type sits below the 11pt minimum on phones.

Most fixes reuse things already in the repo: the Radix `Dialog`, `ToggleSwitch`, `aria-pressed` as it is used in `auth.choose-role`, and dnd-kit's `KeyboardSensor`.

---

### Critical

#### 1. The sign-in modal and four other custom modals have no dialog semantics, no focus handling and no Esc key

- **What**
  - `LoginModal` (`src/pathwise/LoginModal.tsx:250-265`) is a plain `<div>` overlay:
    - It has no `role="dialog"`, no `aria-modal` and no `aria-labelledby`.
    - Nothing handles Esc. No `"Escape"` key handler exists anywhere in `src/` outside `components/ui/`.
    - Focus never moves into it (no `autoFocus` or `.focus()`), and nothing traps focus.
  - It renders after `<Outlet />` (`src/routes/__root.tsx:123-124`). After a keyboard or screen-reader user presses "Sign In", focus stays on the header button. Tab then walks every link on the page behind the 70% scrim before it reaches Email.
  - The close "×" is about 12×20px (`text-xl leading-none`, `:259-265`).
  - The same pattern appears in:
    - `StageDetailModal.tsx:34-66`, the roadmap session log.
    - `MilestoneCelebration.tsx:44-58`. It also closes itself after 3200ms (`:37`).
    - The roadmap "Stage complete" overlay (`_app.roadmap.tsx:899-933`). It has no dismiss control and no role, closes itself after 1500ms (`:467`), and is never announced. A screen-reader user never learns they finished a stage or earned XP.
    - The photo-crop dialog (`_app.onboarding.tutor.tsx:596-640`).
  - `ExitDemoModal.tsx:30-36` partly works: it has role, `aria-modal`, `aria-labelledby` and `autoFocus`, but no Esc handler and no focus trap.
- **Why**
  - `modality.md › Best practices`: always give people an obvious way to dismiss a modal view, and name its task.
  - `accessibility.md › Speech`: the keyboard alone must be enough to navigate and interact.
  - `voiceover.md › Navigation`: tell the screen reader when visible content changes.
  - `accessibility.md › Cognitive`: avoid views that dismiss themselves on a timer; prefer an explicit action.
- **Fix.** Use the Radix Dialog that is already in the repo (`src/components/ui/dialog.tsx`). It is already used by `ConfirmationModal` and the booking page. It provides role, `aria-modal`, the title and description links, a focus trap, Esc, focus return, and it hides the page behind the dialog.

  ```tsx
  // LoginModal.tsx: delete the hand-made overlay <div> and the "×" button; drop `if (!loginOpen) return null`
  import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

  <Dialog open={loginOpen} onOpenChange={(o) => !o && closeLogin()}>
    <DialogContent className="pw-card max-w-[32.5rem] p-7 shadow-pw-float">
      <DialogTitle className="font-display font-bold uppercase tracking-[-0.025em] text-[1.75rem] leading-none">
        {title}
      </DialogTitle>
      <DialogDescription className="mt-1 text-[0.875rem] text-[var(--pw-ink-2)]">{subtitle}</DialogDescription>
      {/* role cards + forms unchanged */}
    </DialogContent>
  </Dialog>
  ```

  Apply the same change to `StageDetailModal` and `MilestoneCelebration`. In `MilestoneCelebration`, delete `setTimeout(onClose, 3200)`; the "Continue" button already exists. For the roadmap overlay, either make it a `Dialog` with a Continue button, or also call `toast.success(\`Stage ${n} complete, +${xp} XP\`)` (sonner is already a live region).

#### 2. Form fields have no programmatic labels, and errors are silent

- **What**
  - 26 visible `<label>` elements have no `htmlFor` and do not wrap their control. Only 3 `htmlFor` exist in `src/` outside `ui/`.
  - Screen readers announce these as unnamed text fields. The sign-in Password field also has no placeholder, so it has no name at all.
  - Affected fields:
    - `LoginModal` `Field` (`LoginModal.tsx:491-499`): Email, Password, Full name.
    - `_app.reset-password.tsx:76,86`.
    - `_app.onboarding.student.tsx:65,82`.
    - Tutor onboarding's `Label`/`Input` helpers (`_app.onboarding.tutor.tsx:1546-1551`), used for about 15 fields starting at `:648`.
    - `CourseEditor`'s `Field` (`CourseEditor.tsx:1418-1433`), used for about 18 fields. This includes the `contentEditable` description at `:1040-1046`, which has no role and no name.
    - Availability selects (`_app.tutor.settings.availability.tsx:321,335`).
    - Booking recurrence (`_app.book.$tutorId.tsx:610,622`).
    - The two range sliders in find-tutor (`_app.find-tutor.tsx:421,607`): no label and no `aria-valuetext`.
  - Inline errors are not announced and not linked to their field: `ErrorLine` (`LoginModal.tsx:504-510`) and reset-password `:94-97`. Only 3 live regions exist in the whole app.
  - `ExitDemoModal` reports its validation error only through a 4-second toast (`ExitDemoModal.tsx:15-17`).
- **Why**
  - `voiceover.md › Descriptions`: give every key element a label, custom elements included.
  - `voiceover.md › Navigation`: describe relationships that are only visual, and report changes.
  - WCAG 1.3.1 and 4.1.3.
- **Fix.** Fix the three shared helpers; together they cover most fields.

  ```tsx
  // LoginModal.tsx › Field
  const id = useId();
  <label htmlFor={id} className="label-caps text-[var(--pw-ink-2)]">{label}</label>
  <input id={id} autoComplete={type === "email" ? "email" : type === "password" ? "current-password" : "name"} … />

  // LoginModal.tsx › ErrorLine (same for reset-password)
  <div role="alert" className="text-[0.75rem]" style={{ color: "var(--pw-danger)" }}>{msg}</div>
  ```

  - In `_app.onboarding.tutor.tsx` and `CourseEditor.tsx`, make `Label` render a `<span>`, and change each field's wrapper `<div>` to `<label className="block">`. Wrapping the control links it to the label, with no ids needed.
  - Description editor: add `role="textbox" aria-multiline="true" aria-label="Course description"`.
  - Sliders: add `aria-label="Learning pace"` with `aria-valuetext` set to the word for each step, and `aria-label="Budget per hour" aria-valuetext={formatPrice(value)}`.
  - ExitDemoModal: add an inline `role="alert"` message next to the email field.

#### 3. More than 20 icon-only controls have no accessible name

- **What.** lucide 0.575 hides its SVGs automatically, so each of these controls is announced only as "button" or "link":
  - **Header bell, on every signed-in page.** `NotificationBell.tsx:114-121`, a `<Button size="icon">` that contains only `<Bell>` and the unread count. It is announced as "button" or "3, button".
  - **Tutor course list** (`tutor.courses.index.tsx:107-125`, rendered at `/dashboard/courses`). Edit, View and Delete on every row are all unnamed, and Delete is destructive.
  - **CourseEditor:**
    - Add tag `+` (`:494`).
    - Remove tag/prerequisite/outcome/resource "×" (`:469`, `:1088`, `:1060`, `:969`).
    - Delete section/lesson (`:783`, `:898`).
    - Expand lesson chevron (`:895`), which also lacks `aria-expanded`.
    - Drag handles (`:771`, `:875`).
    - The five rich-text toolbar buttons (`ToolBtn`, `:1024-1038` → `:1151`).
  - **Tutor onboarding:** add/remove specialisation (`_app.onboarding.tutor.tsx:912`, `:930`).
- **Why**
  - `voiceover.md › Descriptions`: label every key element.
  - `accessibility.md › Mobility`: Voice Control needs labels to target elements.
- **Fix**

  ```tsx
  <Button variant="ghost" size="icon"
    aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}>
    <Bell … />{unreadCount > 0 && <span aria-hidden="true" …>{…}</span>}
  </Button>

  <Link … aria-label={`Edit ${course.title}`}> / aria-label={`View ${course.title}`} / <button aria-label={`Delete ${course.title}`}>
  <button aria-label={`Remove tag ${t}`}>   <button aria-label={open ? "Collapse lesson" : "Expand lesson"} aria-expanded={open}>
  <button {...attributes} {...listeners} aria-label={`Reorder ${section.title}`}>
  function ToolBtn({ label, … }) { return <button aria-label={label} …> }  // "Bold", "Italic", "Heading", "Bulleted list", "Numbered list"
  ```

#### 4. The availability grid works only with a mouse and shows state by colour alone, and it is the only way tutors set their hours

- **What**
  - Both grids render 168 `<div onMouseDown onMouseEnter>` cells with no role, no `tabIndex`, no key handler, and the state only in `title`:
    - `src/pathwise/AvailabilityGrid.tsx:136-147`, the tutor onboarding step at `_app.onboarding.tutor.tsx:1255`.
    - A copy in `_app.tutor.settings.availability.tsx:446-458`.
  - A keyboard-only or screen-reader tutor therefore can't publish availability. The booking page then shows "This tutor hasn't published availability yet" (`_app.book.$tutorId.tsx:522-524`).
  - Drag-to-paint uses mouse events only, so touch has no drag path.
  - Available and Blocked are told apart by hue alone at nearly the same luminance:

    | Theme | Available | Blocked | Ratio |
    | --- | --- | --- | --- |
    | Light | `#2a5f66` | `#4a5257` | 1.11:1 |
    | Dark | `#5fa3ab` | `#9ea5a8` | 1.15:1 |

    Teal and slate are hard to separate with deuteranopia.
  - Cells are 28px tall with 1px gaps.
  - The two copies already disagree: Blocked is `ink-2/40` in one and solid `ink-2` in the other.
- **Why**
  - `accessibility.md › Speech`: the keyboard alone must work.
  - `accessibility.md › Vision` and `color.md › Inclusive color`: never carry meaning by colour alone.
  - `accessibility.md › Mobility`: offer on-screen alternatives to gestures, and use 44×44 controls.
- **Fix**
  - Delete the copy in `availability.tsx` and render `<AvailabilityGrid>` there.
  - Make each cell a button with a glyph:

  ```tsx
  <button type="button"
    data-cell={`${day}-${hour}`}
    tabIndex={day === focus.day && hour === focus.hour ? 0 : -1}          // roving focus; arrows move it
    aria-label={`${DAY_NAMES[day]} ${hour}:00, ${state}`}
    onMouseDown={() => onMouseDown(day, hour)}                            // mouse drag-paint unchanged
    onMouseEnter={() => onMouseEnter(day, hour)}
    onClick={(e) => { if (e.detail === 0) { onMouseDown(day, hour); dragMode.current = null; } }} // Enter/Space
    onKeyDown={moveFocusWithArrows}
    className={`h-7 [@media(pointer:coarse)]:h-11 pw-border … ${bgClass}`}>
    {state === "available" && <Check className="size-3.5 mx-auto" aria-hidden />}
    {state === "blocked" && <X className="size-3.5 mx-auto" aria-hidden />}
  </button>
  ```

  - Wrap the grid in `role="group" aria-label="Weekly availability"`.
  - Add a pattern to Blocked so it doesn't depend on hue, for example `bg-[repeating-linear-gradient(45deg,var(--pw-ink-2)_0_2px,transparent_2px_6px)]`.
  - Bring the existing "Copy Monday to all days" button (`availability.tsx:375-380`) into onboarding, so tutors don't have to set 168 cells one by one.

#### 5. Other core paths that only a mouse can use

- **What**
  - **Roadmap stage card.** It is a `<div onClick>` (`_app.roadmap.tsx:733-736`) and is the only way to open the stage session log. It can't receive focus.

    The nested "Mark complete" `<span>` at `:811-830` gets this right (`role="button"`, `tabIndex={0}`, Enter/Space), so the pattern already exists here.
  - **File pickers use `className="hidden"` (display:none) inside a `<label>`.** Neither the input nor the label can receive focus:
    - Profile photo: `_app.onboarding.tutor.tsx:588-591`.
    - Intro video: `:1142-1145`.
    - Course video: `CourseEditor.tsx:924-933`.

    Keyboard-only tutors can't add the photo or the video that the Review step lists as missing (`:1419`, `:1421`).
  - **Rich-text toolbar.** It runs its command on `onMouseDown` only (`CourseEditor.tsx:1155-1158`), so Enter and Space on a focused toolbar button do nothing.
  - **Curriculum reorder.** It sets up `useSensors(useSensor(PointerSensor), useSensor(TouchSensor))` (`:625`, `:754`) with no `KeyboardSensor`, so the focusable drag handles do nothing from the keyboard.
- **Why**
  - `accessibility.md › Speech`.
  - `accessibility.md › Mobility`: alternatives to gestures.
- **Fix**

  ```tsx
  // roadmap.tsx: card stays a div (drop onClick/cursor-pointer, add `relative`); a real button stretches over it
  <h3 …><button type="button" onClick={() => setOpenStage(s.stage_number)}
    className="text-left after:absolute after:inset-0">{s.title}</button></h3>
  // the nested START HERE button and Mark-complete span get `relative z-10`

  // file pickers: keep the input focusable, show focus on the label
  <label className="… has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--pw-accent)]">
    <input type="file" accept="image/*" className="sr-only" onChange={onPick} />

  // ToolBtn: keep the selection with preventDefault, act on click (fires for Enter/Space too)
  <button type="button" aria-label={label} onMouseDown={(e) => e.preventDefault()} onClick={onClick} …>

  // dnd-kit (both packages already installed)
  import { KeyboardSensor } from "@dnd-kit/core";
  import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
  useSensors(useSensor(PointerSensor), useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  ```

---

### Improvements

#### 6. [High] Control boundaries are about 1.3:1, so fields and unselected states are barely visible

- **What**
  - `--pw-border` is the only edge on every text field: base `input, select, textarea` (`styles.css:389-395`), `.pw-input` (`:554-563`), and `ui/input.tsx:11`.
  - Its contrast:

    | Theme | Token value | Against | Composite | Ratio |
    | --- | --- | --- | --- | --- |
    | Light | `rgba(10,12,14,.13)` | bg `#ede7dc` | `#cfcbc1` | 1.32:1 |
    | Light | `rgba(10,12,14,.13)` | surface | | 1.33:1 |
    | Dark | `rgba(237,231,220,.13)` | surface `#16191e` | `#323437` | 1.41:1 |

  - The field fill barely differs from what is around it: `#e3dccf` on `#ede7dc` is 1.11:1 (light), and `#101317` on card `#16191e` is 1.06:1 (dark).
  - The same token colours the unselected stars in the review form (`_app.sessions.$id.tsx:407`, 1.33:1).
  - The struck-through original price uses `opacity-60`: `#8f9292` on `#f6f2ea` is 2.81:1 at 12px (`_app.library.tsx:378`).
  - Focus states are fine: the amber `#8a4a0a` ring is 5.57:1.
- **Why**
  - `layout.md › Visual hierarchy`: keep controls visually distinct from content.
  - `accessibility.md › Vision`: meet contrast minimums.
  - WCAG 1.4.11 asks for 3:1 on component boundaries. The HIG gives no separate number for non-text contrast.
- **Fix.** Add one token for control edges, and keep the hairline for dividers.

  ```css
  :root { --pw-control-border: rgba(10, 12, 14, 0.5); }    /* 3.43:1 on surface-2, 3.48 on bg, 3.59 on surface */
  .dark { --pw-control-border: rgba(237, 231, 220, 0.45); } /* 3.88–3.90:1 on bg/surface/surface-2 */
  ```

  - Use it in the base `input, select, textarea` rule, in `.pw-input`, and as `border-[var(--pw-control-border)]` in `ui/input.tsx`. The `.dark` block stays declarations-only, as the note at `styles.css:266-272` requires.
  - Unselected review stars: `var(--pw-ink-2)` (5.84:1 or better).
  - Old price: drop `opacity-60` and keep `line-through` in ink-2 (6.47:1 or better).

#### 7. [High] Touch targets on phones are well under 44px, and several are under the 28px minimum

- **What.** Sizes at phone width (16px root):

  | Control | Location | Size | Spacing |
  | --- | --- | --- | --- |
  | Sign-in close × | `LoginModal.tsx:259-265` | ≈12×20 | |
  | Stage-log close × | `StageDetailModal.tsx:60-66` | ≈14×24 | |
  | Radix dialog close (ConfirmationModal, booking) | `ui/dialog.tsx:45-48` | 16×16, icon at `opacity-70` | |
  | "Forgot password?", "Create account", "Sign in", "Back to sign in" | `LoginModal.tsx:320-341, 389-399, 416-426` | ≈16 tall | |
  | Inbox "← Back" | `Inbox.tsx:226` | ≈16 tall | |
  | Review stars | `_app.sessions.$id.tsx:402-410` / `_app.courses.$slug.tsx:768` | 24×32 / 20×24 | 4px |
  | Course row Edit / View / Delete | `tutor.courses.index.tsx:107-125` | ≈24×24 | 8px |
  | Availability cells | `AvailabilityGrid.tsx:142` | 28 tall | 1px |
  | Time-slot pills | `_app.book.$tutorId.tsx:571` | ≈30 tall | 8px |
  | Header nav links, phone "Menu" | `Header.tsx:20, 37, 206` | ≈32 tall | |
  | Theme toggle | `ThemeToggle.tsx:72` | 36×36 | |

- **Why**
  - `accessibility.md › Mobility`: on iOS, 44×44 is the default and 28×28 the minimum, and spacing between controls matters as much as their size.
  - `apple-design §10`: add hit padding around the target.
- **Fix**
  - Icon buttons: `min-h-11 min-w-11 grid place-items-center` (2.75rem = 44px).
  - Stars: `p-2.5`, which brings a 24px icon to 44px.
  - Dialog close: `absolute right-2 top-2 grid size-11 place-items-center`, and drop `opacity-70`.
  - Header links: add `max-sm:py-3.5`.
  - Theme toggle: `size-11` on phones.
  - Text buttons that must stay visually small get an invisible hit area:

  ```css
  @utility hit-44 {
    position: relative;
    &::after { content: ""; position: absolute; left: 50%; top: 50%;
      width: max(100%, 2.75rem); height: max(100%, 2.75rem); transform: translate(-50%, -50%); }
  }
  ```

#### 8. [High] Selected state is only visual (no `aria-pressed` or `aria-checked`), and often colour-only

- **What.** The app has only 2 `aria-pressed` (ThemeToggle, `auth.choose-role.tsx:147`). Everywhere else, selection shows only as a border or fill:
  - **Sign-up role cards** (`LoginModal.tsx:461-468`): amber border and tint, no check mark.
  - **Booking-mode pills in tutor onboarding** (`_app.onboarding.tutor.tsx:1237-1246`): colour only.
  - **Booking time slots** (`_app.book.$tutorId.tsx:566-572`).
  - **Quiz goal pills** (`_app.quiz.tsx:384-385`).
  - **Review stars** (`_app.sessions.$id.tsx:402-410`; `_app.courses.$slug.tsx:768-772`). A screen reader hears five "N stars" buttons and never which one is chosen.
  - **Earnings range pills** (`dashboard.index.tsx:488-495`).
  - **"Instant bookings"**, a button styled as a field with no role (`_app.tutor.settings.availability.tsx:336-344`).
  - **Library "your level"**: an amber "●" with only a `title` (`_app.library.tsx:322-324`), plus an amber card border (`:339`).
- **Why**
  - `color.md › Inclusive color`: never rely on colour alone to communicate state.
  - `accessibility.md › Vision`.
  - `voiceover.md › Descriptions`.
- **Fix**
  - Add `aria-pressed={selected}` to single-select pills and cards, copying `auth.choose-role.tsx:147`.
  - Make stars a radio group: `role="radiogroup" aria-label="Rating"` on the wrapper, and `role="radio" aria-checked={n === rating}` on each star.
  - Instant bookings: reuse `src/components/ui/ToggleSwitch.tsx` (`role="switch"`, `aria-checked`). Today it is only used on the style guide.
  - Add the check-mark cue that quiz subject cards already use (`_app.quiz.tsx:363-366`) to role cards and booking-mode pills.
  - Library: replace "●" with a visible "Your level" tag on matching cards.

#### 9. [High] On phones, labels, nav and buttons fall below the 11pt minimum text size

- **What.** Below 48rem the root stays at 100%, so:
  - `label-caps` is 0.6562rem = 10.5px (`styles.css:131`). It has 223 uses: form labels, nav, section labels, buttons.
  - `.pw-badge` is 10.5px (`:583`) and `.pw-pill` 11px (`:519`).
  - These are 10px (`0.625rem`):
    - Notification time and unread badge (`NotificationBell.tsx:117, 163`).
    - Message timestamps (`Inbox.tsx:247`).
    - `dashboard.index.tsx:648`, `_app.courses.$slug.tsx:876` and `pathwise.demo.tsx:532`.
  - The footer Privacy/Terms links are 9px (`Footer.tsx:64, 74`).
  - Body copy is mostly 13–14px, against a 17pt default.
  - Contrast is fine; size is the problem. At 48rem and wider, the 120% root lifts label-caps to 12.6px, so desktop passes.
- **Why**
  - `typography.md › Ensuring legibility`: the iOS minimum is 11pt and the default is 17pt.
  - `accessibility.md › Vision`: use the recommended defaults for custom type sizes.
- **Fix.** Raise the small sizes on phones only, which keeps the desktop look that the design doc specifies:

  ```css
  @media (max-width: 47.999rem) {
    .label-caps, .pw-badge, .pw-pill { font-size: 0.75rem; } /* 12px */
  }
  ```

  Replace the 8 uses of `text-[0.625rem]` and `text-[0.5625rem]` listed above with `text-[0.75rem]`.

#### 10. [High] Quiz feedback is silent and time-limited, and focus is lost after every answer

- **What**
  - After an answer, every option becomes `disabled` (`_app.quiz.tsx:487`), so focus drops to `<body>`.
  - The result text ("Correct…" or "Not quite — the answer was …", `:512-528`) is not in a live region.
  - The next question then replaces it after 900ms for a correct answer or 1700ms for a wrong one (`:143-152`).
  - Screen-reader users never hear the result and start again from the top of the page on every question. Everyone else gets 1.7s to read the correct answer.
  - The page has no `<h1>`: step titles are h2 (`:694`) and the question is h3 (`:470`).
- **Why**
  - `voiceover.md › Navigation`: report content changes, and provide useful headings.
  - `accessibility.md › Cognitive`: avoid time-limited elements.
- **Fix**

  ```tsx
  // always mounted, so changes are announced
  <div role="status" aria-live="polite" className="mt-4 min-h-5 text-[0.8125rem]">
    {feedback === "correct" && …}{feedback === "wrong" && …}
  </div>

  const qRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { qRef.current?.focus(); }, [question?.id]);
  <h2 ref={qRef} tabIndex={-1} className="… focus:outline-none">{question.question}</h2>
  ```

  - Keep the 900ms auto-advance for correct answers.
  - For a wrong answer, show a "Next question" button instead of the 1700ms timer.
  - Promote `Step`'s title to `<h1>` (`:694`).

#### 11. [High] Tutor dashboard drawer: off-screen links stay in the tab order on phones

- **What**
  - `DashboardShell` hides its drawer with `-translate-x-full` only (`TutorSidebar.tsx:77-81`).
  - Below `lg`, keyboard and screen-reader users tab through 6–8 hidden nav links and "Sign out" before they reach content, and the focus ring is off-screen the whole time.
  - The open button (`:60-66`) has no `aria-expanded` or `aria-controls`.
  - The open drawer has no close button and no Esc handler; only a backdrop click closes it (`:69-74`).
- **Why**
  - `accessibility.md › Speech`.
  - `modality.md › Best practices`: there must be an obvious way to dismiss.
- **Fix**

  ```tsx
  <aside id="dashboard-nav"
    onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    className={`… transition-[transform,visibility] ${open ? "translate-x-0" : "-translate-x-full max-lg:invisible lg:translate-x-0"}`}>
  <button aria-label="Open menu" aria-expanded={open} aria-controls="dashboard-nav" …>
  ```

  `visibility: hidden` takes the closed drawer out of both the tab order and the accessibility tree. Also add a labelled "Close menu" button inside the drawer.

#### 12. [Medium] Messages: screen readers can't tell who sent what, and new messages are not announced

- **What**
  - "Mine" versus "theirs" is shown only by alignment and fill colour (`Inbox.tsx:236-249`). There is no visible or hidden sender name.
  - The message list has no `role="log"`, so realtime messages arrive silently.
  - The selected thread is shown only by a tint (`:122-123`).
  - Timestamps are 10px (`:247`).
- **Why.** `voiceover.md › Navigation`: describe relationships that are only visual, and report changes.
- **Fix**
  - On the message list: `role="log" aria-live="polite" aria-label={\`Conversation with ${otherName}\`}`.
  - In each bubble, before the text: `<span className="sr-only">{mine ? "You" : otherName}: </span>`.
  - On the thread button: `aria-current={t.id === threadId ? "true" : undefined}`.
  - Timestamps: `text-[0.75rem]`.

#### 13. [Medium] There is no skip link, and heading levels skip

- **What**
  - No skip link exists in `_app.tsx:12-17`, `dashboard.tsx` or `admin.tsx`.
  - The sticky header puts 6 or more links before the content of every signed-in page.
  - The roadmap jumps from h1 (`_app.roadmap.tsx:569`) to h3 (`:744`), and the quiz has no h1 (see finding 10).
  - `html lang="en"` is set (`__root.tsx:105`), and the layouts use `<main>`.
- **Why**
  - `voiceover.md › Navigation`: use titles and accurate headings for the hierarchy.
  - `accessibility.md › Speech`.
- **Fix**

  ```tsx
  // _app.tsx
  <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] pw-btn-primary px-4 py-3">
    Skip to content
  </a>
  <PWHeader />
  <div id="main" tabIndex={-1}><Outlet /></div>
  ```

  Put `id="main"` on `<main>` in `TutorSidebar.tsx:166` and `admin.tsx:42`. Change the roadmap stage titles from h3 to h2.

#### 14. [Medium] Nothing responds to Increase Contrast or Reduce Transparency

- **What**
  - No `prefers-contrast`, `prefers-reduced-transparency` or `forced-colors` rule exists in `src/`.
  - Text sits on these translucent or blurred surfaces:
    - Header after scroll: `bg-[var(--pw-bg)]/95 backdrop-blur-md` (`Header.tsx:173`).
    - Find-tutor sticky bar: `/90 backdrop-blur` (`_app.find-tutor.tsx:143`).
    - Admin sidebar: `bg-[var(--pw-surface)]/80 backdrop-blur-md` (`admin.tsx:61`).
    - Modal scrims with 6–8px blur: `LoginModal.tsx:252`, `StageDetailModal.tsx:39`, `MilestoneCelebration.tsx:49`, `_app.roadmap.tsx:904`, `ExitDemoModal.tsx:27`.
  - Default contrast still holds on these surfaces. Worst case, with ink-coloured content behind, ink-2 text measures:

    | Surface | Light | Dark |
    | --- | --- | --- |
    | Header | 5.84:1 | 7.20:1 |
    | Find-tutor bar | 5.24:1 | 6.38:1 |

  - What's missing is the path for users who ask for more. When the OS requests higher contrast, the 1.3:1 hairlines and default secondary text stay exactly as they are.
- **Why**
  - `accessibility.md › Vision`: provide a higher-contrast scheme when Increase Contrast is on.
  - `color.md › Best practices`: colours must work in light, dark and increased contrast.
  - `dark-mode.md › Best practices`: test with Increase Contrast and Reduce Transparency, separately and together.
  - `apple-design §14`.
- **Fix.** Append to `styles.css`, outside the `.dark` block:

  ```css
  @media (prefers-contrast: more) {
    :root { --pw-border: rgba(10, 12, 14, 0.5);    --pw-ink-2: #2f3539; } /* ink-2 9.1–10.1:1 */
    .dark { --pw-border: rgba(237, 231, 220, 0.45); --pw-ink-2: #c4c9cb; } /* ink-2 10.5–11.7:1 */
  }
  @media (prefers-reduced-transparency: reduce) {
    .backdrop-blur, .backdrop-blur-sm, .backdrop-blur-md, [style*="backdrop-filter"] { backdrop-filter: none !important; }
    header.sticky, .sticky { background-color: var(--pw-bg) !important; }
  }
  ```

---

### What works

- **Colour tokens are accessible in both themes.** Every token used as text clears 4.5:1 on bg, surface and surface-2 (see the appendix). The light theme splits amber into `--pw-accent #8a4a0a` for text and `--pw-accent-fill #e8913c` for fills, with the reasoning recorded at `styles.css:142-145` and `:79-80`. No raw Tailwind palette colours or hex text colours appear in TSX; everything goes through `--pw-*`. Keep this discipline.
- **Text scales with the user's setting.** Sizing is rem throughout. The desktop bump is a percentage, `html { font-size: 120% }` (`styles.css:351-355`), and the viewport meta has no `maximum-scale`. This matches `apple-design §15`.
- **Keyboard focus is visible.** The `.pw-*:focus-visible` rule draws a 2px amber outline with offset 2 (`styles.css:633-642`). Inputs show an amber border and ring (`:398-404`), and the Button component has a focus ring (`ui/button.tsx:8`). Contrast is 5.57:1 (light) and 7.97:1 (dark).
- **Images and icons are handled correctly.** Every `<img>` has alt text, with `alt=""` where the image is decorative. `Icon` hides itself unless given a `label` (`Icon.tsx:95-96`), and lucide hides SVGs by default. Read-only ratings use `role="img" aria-label="N out of 5 stars"` (`_app.tutor.$tutorId.tsx:657-659`, `dashboard.index.tsx:776-777`).
- **Patterns to copy across the app:**
  - `aria-pressed` on role choice (`auth.choose-role.tsx:147`).
  - `ToggleSwitch` with `role="switch"` and `aria-checked` (`ui/ToggleSwitch.tsx:18-20`).
  - The "Mark complete" span with role, `tabIndex` and Enter/Space handling (`_app.roadmap.tsx:811-830`).
  - `aria-current="step"` in `AnimatedStepper`.
  - `aria-expanded` in `MatchCard`.
  - The phone header menu built on native `<details>` (`Header.tsx:205`), which gets keyboard and screen-reader support for free.
  - Status shown with text, not just colour: verification badges, roadmap "Completed"/"Locked" pills, and "% Match" labels.
- **Translucent bars keep their contrast.** Composited worst cases are 5.2:1 or better (finding 14).

### Platform notes

- **Platform.** PathWise is a web app, so Apple's native platform conventions were not applied (`cross-platform.md`). The phone layout below 48rem is where almost every size finding applies. On desktop, the 120% root clears the text minimums and the 28px desktop control default for most controls.
- **App-level theme toggle.** The header's ThemeToggle is an app-level appearance setting, which `dark-mode.md › Best practices` advises against. It does follow the OS by default (the bootstrap script reads `prefers-color-scheme`), so it acts as an override. That is a conventions question, not an accessibility failure, and is left to the conventions audit.
- **Not scored.** `src/pathwise/CourseCard.tsx` is not imported anywhere; the library uses its own `CourseCard`. Its hover-only "View details" button has no handler.

### Appendix: measured contrast (WCAG 2.x)

| Pair | Light | Dark |
| --- | --- | --- |
| ink on bg / surface / surface-2 | 15.92 / 17.55 / 14.37 | 15.92 / 14.32 / 15.13 |
| ink-2 (muted-foreground, placeholder) on bg / surface / surface-2 | 6.47 / 7.14 / 5.84 | 7.84 / 7.05 / 7.45 |
| accent (text amber) on bg / surface / surface-2 | 5.57 / 6.14 / 5.03 | 7.97 / 7.17 / — |
| secondary / accent-2 (teal) on bg / surface-2 | 5.83 / 5.26 | 6.82 / 6.14 (surface) |
| accent-3 (gold) on bg / surface-2 | 5.62 / 5.08 | 9.81 (surface) |
| danger on bg / surface / surface-2 | 5.31 / 5.85 / 4.79 | 7.09 / 6.38 / — |
| primary-foreground on primary | 15.92 | 15.92 |
| destructive-foreground on destructive | 5.31 | 7.09 |
| on-accent (`#0a0c0e`) on accent-fill (`#e8913c`) | 7.97 | 7.97 |
| ink-2 on accent-soft (notifications, selected chips) | 5.89 | 6.69 |
| **border hairline on bg / surface** | **1.32 / 1.33** | **1.33 / 1.41** |
| **input fill vs surrounding surface** | **1.11 (bg)** | **1.06 (card)** |
| **availability Available vs Blocked** | **1.11** | **1.15** |
| accent-fill used as text (not found in light-mode code) | 2.00 | — |
| `qed-muted #6c7378` on ground (one use, `aria-hidden`) | — | 4.07 |
