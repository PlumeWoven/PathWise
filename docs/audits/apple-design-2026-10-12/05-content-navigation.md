## Design review: PathWise content, navigation and responsive layout

Lens: apple-hig Lens 5 (Content and writing), the Navigation structure mode, and `layout.md`.
Method: source audit only, at commit 9b64a11. I mapped navigation from `Header.tsx`,
`TutorSidebar.tsx`, `admin.tsx` and the landing footer, read every route that a nav item opens, and
grepped the whole of `src/` for labels, error handling, fixed widths and locale calls. I didn't
check the live site; a separate pass covers it.

PathWise is a web app, so Apple's platform conventions are translated with `cross-platform.md`:
tab bar → mobile nav, size classes → Tailwind breakpoints (sm 640, md 768, lg 1024 px), safe
area → `env(safe-area-inset-*)`. Widths marked **est.** are computed from CSS (Sora at 10.5–11.5 px,
uppercase, 0.15em tracking ≈ 8.5–9 px per glyph). They aren't measurements, so confirm them in the
live pass.

References opened: `writing.md`, `layout.md`, `searching.md`, `search-fields.md`, `tab-bars.md`,
`sidebars.md`, `toolbars.md`, `onboarding.md`, `inclusion.md`, `design-principles.md`,
`cross-platform.md`, and apple-design §16. HIG citations below are paraphrased, not quoted.

### Summary

The product's thesis is "find exactly where you stand": a level check that becomes a roadmap and a
shortlist of tutors. The copy undercuts that promise exactly where trust matters:

- a Sign out button that doesn't sign anyone out
- verification and refund promises that contradict the Terms
- two quizzes that name subjects differently and never say "English"
- a budget slider that mixes MDL and dollars

Every section is reachable at 375 px for every role, but finding your way is weak:

- tutors get two menus on phones, and one sits on top of the logo
- visitors have no navigation once they leave the landing page
- the booking stepper is wider than a phone

The writing itself is mostly plain and leads with actions. The design is remembered for its all-caps
QED look. What it lacks is a single shared vocabulary.

**Overall rating: Critical issues** (1 Critical, 9 High, 5 Medium).

### Navigation map

```text
VISITOR (signed out)   header: PathWise · theme · Sign In        <- no section links at any width
/  landing (always dark)
├─ CTA "Start your level check" → /quiz → /roadmap ─(sign-in wall)→ /matches
├─ CTA "Find a tutor" → /find-tutor (8-question quiz) → /matches → /tutor/$id → /book/$id
├─ Footer, landing only: Level check · Roadmaps · Find a tutor · Course library · Contact · Privacy · Terms
│    └─ /library → gate "The library opens after your quiz"
└─ DemoBanner "Try Demo Mode →" → /demo → /pathwise/demo  (sidebar shell, no header;
                                                            sidebar items exit the demo, see #10)
STUDENT   header ≥640px inline · <640px "Menu" ▾              <- no visible active state
├─ My Roadmap    /roadmap ── "Start here" → /library · stage → /course-match · CTA → /matches
├─ Find a tutor  /find-tutor → /matches
├─ My sessions   /sessions → /sessions/$id
├─ Messages      /messages
└─ Sign Out                                  not in nav: Library, Matches, account settings
TUTOR     header (Dashboard · Messages · Sign Out) + DashboardShell sidebar
│         phones: header "Menu" ▾ top-right AND sidebar ☰ top-left, over the logo
├─ Dashboard   /dashboard
├─ My Courses  /dashboard/courses → /new · /$courseId/edit
├─ Calendar    /dashboard/calendar        h1 "Your weekly availability"
├─ Messages    /dashboard/messages        header "Messages" → /messages (outside the shell)
├─ Settings    /dashboard/settings → Verification · "Availability (Calendar)" · Courses
└─ Sign out    → "/" only (stays signed in)        hidden: /dashboard/earnings, /dashboard/analytics
ADMIN     header "Admin" + AdminSidebar (phones: horizontally scrolling row)
├─ Dashboard   /admin            h1 "Admin Dashboard"
├─ Users       /admin/users
├─ Courses     /admin/courses    h1 "Courses Pending Review"
└─ Sessions    /admin/sessions   h1 "Disputes"
DUPLICATE ROUTES OUTSIDE THE SHELL: /settings/verification (linked from UnverifiedBanner),
  /tutor/settings/availability (no inbound links), /tutor/courses
```

Item counts are scannable: 4 student, 5 tutor and 4 admin sections, plus Sign out. Hierarchy is at
most two levels everywhere. The problems are visibility, duplication and naming, not depth.

### Critical

#### 1. The tutor sidebar's "Sign out" leaves the tutor signed in

- **What**: `src/components/dashboard/TutorSidebar.tsx:153-158` renders
  `<Link to="/">Sign out</Link>`. It goes to the landing page and never calls `logout()`. It's the
  last item in the drawer, the obvious place to sign out, and a tutor on a shared family phone or
  computer will think they're out when they aren't. The control that works is the header's
  "Sign Out" (`src/pathwise/Header.tsx:199-201`, handler `86-96`), which also clears the admin
  impersonation keys.
- **Why**: `writing.md › Best practices`: a label should say what the control does. `design-principles.md
  › Responsibility`: keep people's information safe. Lens 5: every label says what happens.
- **Fix**: delete the non-demo branch at `TutorSidebar.tsx:152-159`. The header's Sign Out already
  covers desktop (inline) and phones (in the Menu), including the impersonation cleanup. If you want
  it in the sidebar too, move `handleSignOut` from `Header.tsx` into `useAuth()` and call it from a
  `<button>` here. Don't keep a `Link`.

### Improvements

#### 2. [High] Tutors on phones get two menus, and one covers the logo

- **What**:
  - `/dashboard` renders the sticky 58 px `PWHeader` (`src/routes/dashboard.tsx:49`) and then
    `DashboardShell`. The shell's drawer toggle is `lg:hidden fixed top-3 left-3 z-50 w-10 h-10`
    (`TutorSidebar.tsx:60-66`). Below 1024 px it covers x 12–52, y 12–52, on top of the "PathWise"
    home link, which starts at x 20.
  - The header's own phone "Menu" (`Header.tsx:205-213`, top right) lists Dashboard · Messages · Sign
    Out. The drawer lists Dashboard · My Courses · Calendar · Messages · Settings · Sign out. The two
    "Messages" go to different routes (`/messages` vs `/dashboard/messages`). Message notifications
    use `/messages?thread=…` (`Inbox.tsx:180`), so tutors land outside the shell.
  - The drawer has no close control. The toggle stays above the open aside (z-50 over z-40) and only
    calls `setOpen(true)`. The backdrop is the only way out.
  - `pt-14` on the shell `<main>` (`TutorSidebar.tsx:166`) was meant to clear the toggle. Under the
    header it adds 56 px of empty space.
  - Three pages rendered inside the shell bring their own `<main className="px-5 sm:px-8 …">`:
    `_app.tutor.settings.availability.tsx:259`, `_app.settings.verification.tsx:63` and
    `CourseEditor.tsx:247`. Phone gutters double to 40 px a side, which leaves **295 px of content on a
    375 px screen** and two `<main>` landmarks.
  - On Verification, each `TierCard` row (`_app.settings.verification.tsx:167-183`) puts a
    `whitespace-nowrap` "Request verification" button (est. 215 px) beside the title. That leaves the
    "Identity Verified" title a column of est. 20–60 px.
- **Why**: `sidebars.md › Platform considerations (Mobile)`: on compact widths, prefer a tab bar or
  one converted control over a sidebar. `layout.md › Size classes`: keep the same functions at every
  size and make layout changes familiar. `toolbars.md › Navigation`: provide a standard way to
  close. apple-design §16 Familiarity: the same thing lives in the same place.
- **Fix**: one navigation control per width.
  1. Phones: put the tutor items in the header Menu. In `Header.tsx` `navLinks`, when
     `tutorSide && stacked`, add `My courses` → `/dashboard/courses`, `Availability` →
     `/dashboard/calendar` and `Settings` → `/dashboard/settings`. Point "Messages" at
     `/dashboard/messages` for tutor-side users. In `TutorSidebar.tsx`, render the toggle and backdrop
     only when `isDemo`, give the aside `hidden lg:flex` when `!isDemo`, and change `pt-14 lg:pt-6` to
     `pt-6`.
  2. Gutters: change those three inner `<main …px-5 sm:px-8 max-w-* mx-auto>` to plain `<div>`. Turn
     the standalone copies into redirects, the pattern `_app.tutor.courses.new.tsx:5-7` already uses:
     `/settings/verification` → `/dashboard/settings/verification`, and `/tutor/settings/availability`
     → `/dashboard/calendar`. Point `UnverifiedBanner.tsx:25` at the dashboard path.
  3. `TierCard` (`_app.settings.verification.tsx:167`): replace `flex items-start justify-between gap-4`
     with `flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`.

#### 3. [High] The booking stepper is wider than a phone

- **What**: `src/routes/_app.book.$tutorId.tsx:425-439` renders five steps, "Type · Time · Timezone ·
  Summary · Pay", in one `flex` row with no wrap and no overflow handling. Each step is a 24 px
  circle, an uppercase label, a 16 px rule and gaps: **est. ≈ 500 px against 335 px of content at
  375 px**. The flow that books lessons scrolls sideways, or zooms out on Android Chrome. PR #19
  checked nine routes at 375 px, and `/book/*` wasn't one of them. The course page tabs are probably a
  smaller case of the same problem: four `label-caps` triggers with `px-4` in an `inline-flex` list
  (`_app.courses.$slug.tsx:531-536`, `components/ui/tabs.tsx:15`), est. ≈ 370 px.
- **Why**: `layout.md › Adaptability`: layouts adapt to every display size. `layout.md › Size
  classes`: decide layout from the space available.
- **Fix**: reuse the stepper the quiz already uses. It shows only the active label below `sm`. Replace
  lines 425-439 with:
  ```tsx
  <AnimatedStepper steps={[...STEPS]} currentStep={step + 1} className="mt-4" />
  ```
  For the tabs: `<TabsList className="max-w-full overflow-x-auto">`.

#### 4. [High] Tutors can't realistically set availability on a phone

- **What**: a 7-day × 24-hour grid sits in `min-w-[40rem]` inside `overflow-x-auto`
  (`_app.tutor.settings.availability.tsx:395-396`, `AvailabilityGrid.tsx:71-72`; the grid also
  appears in tutor onboarding at `_app.onboarding.tutor.tsx:1255`). At 375 px about half the week is
  off-screen.
  - Painting is mouse-only: `onMouseDown`/`onMouseEnter` (lines 408-409, 454-455). On touch a drag
    scrolls instead of painting, so all 168 cells must be tapped one at a time.
  - The instructions say "Click a cell to mark it available… Drag to paint multiple cells" (line 266).
  - Row labels are 12-hour ("9am", lines 433-437), but the cell tooltips are 24-hour ("9:00", line
    458).
  - The legend puts "Available" next to "Free" (lines 371-374), and the two read as synonyms. "Free"
    actually means not set.
  - A tutor with no availability can't be booked, and onboarding requires this step.
- **Why**: `layout.md › Size classes`: keep functionality the same at every size.
  `writing.md › Best practices`: describe gestures correctly for each device ("tap", not "click").
  apple-design §16 Simplicity: plain, specific words.
- **Fix**, the lazy version. Below `sm`, show one day at a time and rely on the existing "Copy Monday
  to all days" button (line 379):
  - Add a row of seven `pw-pill` day buttons and a `grid-cols-[3.75rem_1fr]` column for the selected
    day. Change `min-w-[40rem]` to `sm:min-w-[40rem]`.
  - Copy for phones: "Tap an hour to mark it available. Tap again to block it for time off." Add at
    `sm:` and up: "Click or drag to paint several hours."
  - Rename the legend's "Free" to "Not set". Label hours in 24-hour time with
    `` `${String(hour).padStart(2, "0")}:00` ``, since Moldova uses 24-hour time.
  - Pointer-event drag painting is an interaction-lens follow-up.

#### 5. [High] Verification is described three different ways

- **What**:
  - The dashboard banner (`UnverifiedBanner.tsx:19-22`) says: "Get verified to appear higher in
    search results and earn 3× more bookings", and "Verification takes 1–2 minutes. Upload a
    government ID and a quick selfie."
  - The Verification page says: "Only verified tutors appear in search and can be booked by new
    students" (`_app.settings.verification.tsx:72`), and "A 10-minute video call with the PathWise
    team" (line 94).
  - The code comment says no ID documents are uploaded (line 18), and the confirmation toast says
    "we'll email you to book a short video call" (line 57).
  - The app has no search field anywhere in `src/`.

  So the banner promises the wrong process, the wrong duration, a ranking boost that is really a
  listing gate, and a 3× figure with no source.
- **Why**: `design-principles.md › Responsibility`: be transparent about what the product does.
  `writing.md › Getting started`: be clear, and keep one list of terms.
- **Fix**, in `UnverifiedBanner.tsx:19-27`:
  - Title: "Get verified so students can find and book you"
  - Body: "Request a 10-minute video call. The PathWise team checks your ID and teaching background."
  - Button: "Request verification →", with `to="/dashboard/settings/verification"`.
  - Also change page line 72 to: "Only verified tutors appear in student matches and can take
    bookings."

#### 6. [High] Course pages promise refunds and lifetime access that the Terms rule out

- **What**: `_app.courses.$slug.tsx:37-54` hard-codes FAQ answers onto every course. They are also
  published as FAQ structured data (line 79), so search engines show them too. The answers include
  "We offer a 14-day no-questions-asked refund on every paid course", lifetime access and automatic
  certificates. The phone sticky bar repeats "14-day refund" (line 877). The Terms say the opposite
  (`_app.terms.tsx:36-41`, "Payments during the beta"): PathWise takes no payments, and student and
  tutor agree any refund between them. The course call to action, "Enroll Now" (lines 430, 479,
  890), opens `/book/$tutorId`, which books a session with the tutor. The next screens say "Pick a
  session type", then "Book session", then "You're booked!". The action changes its name mid-flow.
- **Why**: `design-principles.md › Responsibility`. Lens 5: an action keeps its name through the
  whole flow. `writing.md › Best practices`: use consistent language across multi-step processes.
- **Fix**:
  - Keep only true answers in `DEFAULT_FAQ`:
    - "How do I pay?" → "You pay your tutor directly, by cash or bank transfer, as you agree together.
      PathWise charges nothing during the beta."
    - "What if I need a refund?" → "You and your tutor agree refunds between you. See the Terms."
    - "Can I message the tutor?" → "Yes. Open the tutor's profile and tap Message."
  - Change line 877 from "14-day refund" to "Pay your tutor directly".
  - Change all three "Enroll Now" buttons to "Book a session".

#### 7. [High] Two quizzes, two subject lists, and no "English"

- **What**:
  - The level check (`/quiz`, `src/pathwise/data.ts:28-35`) offers Mathematics, Sciences, Literature,
    History, Programming and Languages.
  - "Find a tutor" (`_app.find-tutor.tsx:248-257`) offers Math, Science, Languages, Coding, Test
    prep, Music, Writing and Art.
  - The marketplace teaches Math and English, yet neither list says "English". The same subject also
    gets different names: "Mathematics"/"Math", "Programming"/"Coding", "Sciences"/"Science".
  - Goals differ too: "Pass an exam / Improve my grades…" (`data.ts:37-43`) vs "Ace an exam / Master
    a skill…" (`_app.find-tutor.tsx:315-323`).
  - A student who picks History gets a roadmap with no tutors behind it. On `/matches`, an empty
    subject filter silently refetches every verified tutor (`_app.matches.tsx:150-165`), while the
    heading still reads "We found N tutors based on your learning profile" (lines 373-375).
- **Why**: `writing.md › Getting started`: keep a list of common terms and reuse it. Lens 5: names
  come from what people recognize. `design-principles.md › Responsibility`.
- **Fix**:
  - Make one subject list in `data.ts` and use it in both quizzes: `[{ id: "Mathematics", label:
    "Math" }, { id: "Languages", label: "English" }]`. Keep the ids so stored roadmaps still resolve,
    and delete the other subjects.
  - Trim the Languages question bank to English questions. Items `lg5` and `lg17` are general
    language trivia.
  - When the fallback runs, set a flag and change the heading to: "No {subject} tutors yet. Here are
    all verified tutors."

#### 8. [High] The budget slider mixes lei and dollars

- **What**: `_app.find-tutor.tsx:600-619`. The slider runs from 100 to 1000 MDL and its value reads
  `formatPrice(value)`, for example "250 MDL". But the end labels are "$15" and "$150+" (lines
  617-618), and a "+" is added from 150 MDL up (`value >= 150`, line 604). So 18 of 19 positions read
  "… MDL+", and neither end label matches the real range or currency. The demo adds a third currency:
  "€" and "€ MDL equivalent" (`pathwise.demo.tsx:282, 298, 505-511`).
- **Why**: `inclusion.md › Languages`: format money for the person's region. `writing.md › Getting
  started`: be clear.
- **Fix**:
  ```tsx
  {value >= 1000 ? `${formatPrice(1000)}+` : `Up to ${formatPrice(value)}`}
  …
  <span>{formatPrice(100)}</span>
  <span>{formatPrice(1000)}+</span>
  ```
  The results summary already says "Up to {price}/hr" (line 729), so the copy will match. In the
  demo, use `formatPrice` instead of `€`.

#### 9. [High] The header never shows where you are, and visitors can't get around

- **What**:
  - Signed out, the header holds only the logo, the theme toggle and "Sign In" (`Header.tsx:215-219`).
    The only links to Level check, Find a tutor and Library are the landing CTAs and the footer
    (`Footer.tsx:5-23`), and both exist only on `/`. From `/library`, `/find-tutor` or `/terms`, a
    visitor has to go home and scroll to the bottom.
  - Signed in, only the tutor's "Dashboard" link gets an active style (`Header.tsx:118`,
    `activeProps`). "My Roadmap", "Find a tutor", "My sessions", "Messages" and every item in the phone
    Menu look the same on every page. TanStack already sets `aria-current="page"` on them, so only the
    visual state is missing.
  - Students have no nav entry for Library. They reach it only through the roadmap's "Start here"
    (`_app.roadmap.tsx:405`).
- **Why**: apple-design §16 Wayfinding: "Where am I? Where can I go? What's there? How do I get out?"
  `tab-bars.md › Best practices`: keep top-level navigation visible in every section, and label each
  item with what it contains. `searching.md › Best practices`: give an important way of finding
  things a primary position.
- **Fix**:
  - Add one CSS rule that covers every header link, inline and in the Menu: `header
    a[aria-current="page"] { color: var(--pw-accent); }` in `styles.css`. Then delete the one-off
    `activeProps` on line 118.
  - For signed-out visitors, have `navLinks` return `<Link to="/quiz">Level check</Link>` and
    `<Link to="/find-tutor">Find a tutor</Link>`, and render the existing `nav` and `details` in both
    states.
  - For students, add `<Link to="/library" className={secondary}>Library</Link>` after "Find a tutor".
  - The bigger option, for later: a bottom tab bar for students on phones (Roadmap · Tutors · Sessions
    · Messages), per `tab-bars.md › Platform considerations (Phone)`.

#### 10. [High] The demo's sidebar takes visitors out of the demo

- **What**: `pathwise.demo.tsx:87-102` renders `DashboardShell` with `isDemo` but no `onItemClick`.
  - In tutor view, every item is a real `<Link>` to `/dashboard/*` (`TutorSidebar.tsx:116-126`). Any
    tap drops a signed-out visitor on "Sign in to continue".
  - In student view, "Dashboard" and "Browse courses" leave for the real `/roadmap` and `/find-tutor`.
    "Messages", "Progress" and "Settings" have no `to` and no handler, so tapping them does nothing
    (lines 27-29, 128-139).
  - The student items also rename things. `/roadmap` is "Dashboard" here but "My Roadmap" in the
    header. `/find-tutor` is "Browse courses" here but "Find a tutor" in the header.
- **Why**: `onboarding.md › Best practices`: let people learn by trying things safely.
  `design-principles.md › Agency`: freedom to explore, and easy recovery. apple-design §16: never trap
  the user.
- **Fix**: don't render the nav items in the demo. At `TutorSidebar.tsx:99`, wrap the nav as
  `{!isDemo && <nav …>…</nav>}`. The DemoBar already switches between Tutor view and Student view.
  `STUDENT_ITEMS` and the `role` prop are then unused, so delete them.

#### 11. [Medium] Raw database errors reach people, and one error page has no way out

- **What**: 46 call sites in 21 files pass `error.message` straight into a toast or a page. Examples:
  - `Inbox.tsx:215`: `toast.error(error.message)` when a message fails. A Postgres row-level security
    refusal reads "new row violates row-level security policy…".
  - `_app.courses.$slug.tsx:303` (submitting a review), `_app.settings.verification.tsx:54`, and
    `CourseEditor.tsx:674-705`.
  - `errorMessage()` in `_app.course-match.tsx:468-470` prefers the raw message over its own friendly
    fallback.
  - `_app.sessions.$id.tsx:20-22` renders "Couldn't load session: {message}" in a bare `p-6` with no
    link back.
  - `_app.book.$tutorId.tsx:55` prints the raw message under "Booking unavailable".

  The router's default error page already does this right (`router.tsx:30-50`): it shows the message
  only in dev, then offers "Try again" and "Go home".
- **Why**: `writing.md › Best practices`: error messages say how to fix the problem, and avoid robotic
  text that doesn't help. Lens 5: don't leak internals.
- **Fix**:
  - Move `errorMessage` to `src/lib/errors.ts` with the body `console.error(err); return fallbackText;`.
    Use it at all 46 call sites, each with a specific fallback, for example:
    - Inbox: "Message not sent. Check your connection and try again."
    - Review: "Review not saved. Try again in a minute."
  - Delete the custom `errorComponent` in `_app.sessions.$id.tsx:20-22` so the router default, with
    "Go home", shows instead. Change its `notFoundComponent` to "Session not found." plus
    `<Link to="/sessions">Back to sessions</Link>`.
  - Change `_app.book.$tutorId.tsx:55` to: "This tutor can't take bookings right now. Pick another
    tutor from your matches."
  - Change the SLOT_TAKEN message (line 279) to: "Someone just booked that time. Pick another slot."
    Lines 337-345 already reload the available slots, so "please refresh" is wrong.

#### 12. [Medium] Some labels don't say what's behind them

- **What**:

  | Where | Label says | What's actually there |
  | --- | --- | --- |
  | `TutorSidebar.tsx:17` | Calendar | The page h1 is "Your weekly availability"; the settings list calls it "Availability (Calendar)" (`dashboard.settings.index.tsx:28`) |
  | `_app.roadmap.tsx:876` | See My Matched Tutors & Courses → | `/matches`, which shows tutors only |
  | `_app.sessions.index.tsx:109` | Find a tutor → | `/matches`, while the header's "Find a tutor" opens the 8-question quiz |
  | `dashboard.index.tsx:797-799` | View all reviews → | A toast saying "Reviews page coming soon" |
  | `_app.book.$tutorId.tsx:87, 804` | Step "Pay", h1 "Payment" | "Nothing is charged here." (line 815) |
  | `admin.tsx:56` | Sessions | The h1 is "Disputes" (`admin.sessions.tsx:86`) |
  | `Header.tsx:125, 131`, `TutorSidebar.tsx:16` | My Roadmap, My sessions, My Courses | "My" on 3 of the 9 nav labels, and nowhere else |

- **Why**: apple-design §16: name nav items for what they contain. `writing.md › Best practices`:
  label actions with verbs, and use possessive pronouns sparingly and consistently.
- **Fix**:
  - Change "Calendar" to "Availability", in both places.
  - On the roadmap and in the sessions empty state, use "See your matched tutors →".
  - Delete "View all reviews →" until the reviews page exists.
  - Rename the "Pay" step to "Confirm", and the h1 to "Confirm booking".
  - Rename the admin "Sessions" item to "Disputes".
  - Drop "My": "Roadmap", "Sessions", "Courses".

#### 13. [Medium] Internal terms and English idioms show up in the UI

- **What**:
  - "Band" appears as a user-facing word: "Placing you in a level band..." (`_app.quiz.tsx:168`),
    "Courses at your band come first" (`_app.library.tsx:213`), and "Roadmap level band" with the hint
    "Drives roadmap matching" (`CourseEditor.tsx:523`).
  - Level names have no reference point. "You placed at Spark" (`_app.library.tsx:213`): the names
    Seedling to Mastermind (`levels.ts:44-50`) are never tied to a school grade, even though onboarding
    asks for one (`_app.onboarding.student.tsx:64-77`).
  - Metaphors: "No course clears both bars yet" (`_app.course-match.tsx:639`) and
    "{stage.title} needs a {band} course" (line 286).
  - Sales jargon on the tutor dashboard: "Lead funnel", "Conversion", "↓ 40% conv"
    (`dashboard.index.tsx:636-649`).
  - English idioms for an audience that mostly speaks Romanian or Russian: "Early Bird", "Night Owl",
    "Weekend Warrior" (`_app.find-tutor.tsx:454-457`) and "Crush that upcoming test" (line 316).
  - "hover to pause" also shows on touch screens (`StepDeck.tsx:237`).
  - "QED" appears only in class names and comments, never in the UI, so it's fine.
- **Why**: `inclusion.md › Welcoming language`: define specialized terms or avoid them, and replace
  colloquial expressions with plain language. Lens 5: names come from what people recognize.
  apple-design §16 Simplicity.
- **Fix** (exact copy):

  | Current | Replace with |
  | --- | --- |
  | "Placing you in a level band..." | "Working out your level…" |
  | "Courses at your band come first" | "Courses at your level come first" |
  | Level name shown alone, e.g. "Spark" | Name plus its existing blurb: "Spark · Basics in place, building up" (`BAND_META[b].blurb`) |
  | "No course clears both bars yet" | "No course fits this stage yet" |
  | "{stage.title} needs a {band} course" | "Choose a {band}-level course for {stage.title}" |
  | Editor label "Roadmap level band" | "Student level" |
  | Editor hint "Drives roadmap matching" | "Students at this level see your course first" |
  | "Lead funnel" | "How students find you" |
  | "Conversion" | "From profile view to repeat booking" |
  | "↓ 40% conv" | "40% went on" |
  | "Early Bird", "Night Owl", "Weekend Warrior" | "Mornings (before 12:00)", "Afternoons (12:00–17:00)", "Evenings (after 17:00)", "Weekends" |
  | "Crush that upcoming test" | "Prepare for a test or exam" |

  For StepDeck, change the span to:
  `<span className="motion-reduce:hidden [@media(hover:none)]:hidden">hover to pause</span>`.

#### 14. [Medium] Capitalization: all caps on screen, mixed underneath

- **What**: CSS renders almost every button, nav item, tab and h1 in uppercase:
  - `label-caps` (`styles.css:128-133`)
  - `.pw-btn-primary`, `.pw-btn-secondary`, `.pw-pill` and `.pw-nav-item` (`styles.css:473-541`)
  - the shadcn `Button` base class (`components/ui/button.tsx:8`)
  - `uppercase` on most h1s

  So source casing only shows to screen readers and on surfaces that aren't uppercased: toasts, body
  text, and sentence-case h1s such as `_app.find-tutor.tsx:770`.

  Underneath, the source mixes conventions. Of the multi-word labels in buttons, links and headings,
  about 148 are sentence case and about 25 are Title Case:
  - On one tutor dashboard screen, the header says "Sign Out" (`Header.tsx:200`) and the sidebar says
    "Sign out" (`TutorSidebar.tsx:157`).
  - The login modal has both "Sign In →" (`LoginModal.tsx:312`) and "Sign in" (line 399).
  - Other Title Case strings:
    - "My Roadmap"
    - "Exit Impersonation"
    - "Enroll Now"
    - "Book a Session"
    - "Save as Draft"
    - "Submit for Review"
    - "Email Confirmed!"
    - "Go Home"
    - "Resend Email"
    - "Verification Center"
    - "Admin Dashboard"
    - "Courses Pending Review"
    - "Level Check: Unlocked"
    - "Try Demo Mode →"
    - the onboarding step names "Basic Info" and "Video Intro"

  The brand is also spelled "Pathwise" in about 10 demo strings: `_app.demo.tsx:15-46`,
  `pathwise.demo.tsx:21-26, 92, 472`, `ExitDemoModal.tsx:20` and `DemoBanner.tsx:18`.
- **Why**: `writing.md › Best practices`: pick one capitalization style for each type of element and
  use it everywhere. Lens 5: mixed conventions are a finding.
- **Fix**:
  - Use sentence case in the source for every label and heading. It's already the majority, it suits
    the brand's direct voice, and CSS supplies the caps. Change the ~25 strings above, and spell the
    brand "PathWise" everywhere.
  - Trade-off: the all-caps look is the QED identity. Keep it for short eyebrows (`label-caps`, three
    words or fewer). Consider dropping `uppercase` from `.pw-btn-*` and `Button` for longer labels such
    as "SEE MY MATCHED TUTORS & COURSES →" (`_app.roadmap.tsx:876`). In all caps at 11.5 px with 0.15em
    tracking, words lose the shapes readers recognize them by.

#### 15. [Medium] The copy isn't sure who it's talking to

- **What**:
  - Accounts are for adults. The Terms say "You must be 18 or older. Parents or guardians book on
    behalf of a child." (`_app.terms.tsx:29`). The sign-up checkbox says "I'm 18 or older (or a
    parent/guardian signing up for my child)" (`LoginModal.tsx:360`).
  - Onboarding then addresses the account holder as the learner. It greets them by name and asks for
    their grade and goal: "Welcome, {name}", "Grade level", "What's your goal?"
    (`_app.onboarding.student.tsx:57-81`).
  - The goal placeholder is American: "e.g. Pass my algebra final, prep for SAT…" (line 88). Moldovan
    students sit the BAC and the gymnasium exam, not the SAT.
  - The shared Inbox tells tutors "No conversations yet. Message a tutor from their profile."
    (`Inbox.tsx:114-118`). It offers students no link either.
- **Why**: `inclusion.md › Welcoming language`: pay attention to how you refer to people. `inclusion.md
  › Avoiding stereotypes`: avoid context-specific references that not everyone shares. `writing.md ›
  Best practices`: empty states should name the next step and link to it.
- **Fix**:
  - Onboarding subtitle: "Signing up for your child? Answer for them. You'll manage their bookings
    from this account."
  - Placeholder: "e.g. Pass the BAC in math, catch up on English grammar".
  - Make the Inbox empty state depend on role:
    - Student: "No conversations yet." plus `<Link to="/matches">Message one of your matched tutors
      →</Link>`.
    - Tutor: "No conversations yet. Students can message you from your profile."

### What works

- **Inbox on phones.** It's a proper list-then-detail layout: the list hides when a thread opens, and
  the conversation has a back action (`Inbox.tsx:111-145`). That's the compact split-view pattern.
- **Responsive grids.** Every custom `grid-cols-[…]` grid sits behind an `sm:`, `md:` or `lg:` prefix
  and stacks on phones. Below `lg`, matches tucks its filters behind "Show filters"
  (`_app.matches.tsx:395-433`).
- **`AnimatedStepper`.** It hides inactive step labels below `sm` and tells screen readers
  "Step n: label, done" (`AnimatedStepper.tsx:62, 87-95`). It's the stepper to reuse in booking
  (#3).
- **Tutor onboarding wayfinding.**
  - It shows "Step n of 6" with the step name as the h1, and offers "Skip for now"
    (`_app.onboarding.tutor.tsx:423-452, 466-473`).
  - "Publish profile" is answered by "Profile published!" (line 397), so the action keeps its name.
- **Few generic labels.** I found no "Submit", "OK", "Click here" or "Learn more" buttons. Flows use
  "Continue →" consistently and end on specific verbs: "Confirm booking", "Book session", "Send reset
  link →".
- **Empty states mostly invite a next step.**
  - The library gate pairs "The library opens after your quiz" with a "Take the quiz →" button
    (`_app.library.tsx:169-176`).
  - The course-match empty state explains why it's empty and offers two actions
    (`_app.course-match.tsx:639-656`).
  - The sessions list links onward (`_app.sessions.index.tsx:107-110`).
- **Error recovery basics.** The router's default error page and the 404 both offer "Go home"
  (`router.tsx:46-48`, `__root.tsx:25-27`). `RoleGate` explains the wrong-role case and offers a route
  to your own home (`RoleGate.tsx:46-62`).
- **Legal pages** are short, plain and dated (`legal.tsx:16-27`).
- **The phone header from PR #19** has one Menu that closes after you navigate (keyed by path), and
  the notification bell stays visible. The admin nav becomes a scrolling row, and admin tables sit in
  `overflow-x-auto`.

### Locale and language (observation only)

- `<html lang="en">` (`__root.tsx:105`). There's no i18n library in `package.json` and no locale
  files; every string is English JSX.
- Dates follow the browser's locale: 13 `toLocale*` calls pass no locale, for example
  `_app.sessions.index.tsx:129` and `_app.book.$tutorId.tsx:389`. A browser set to Romanian or Russian
  will show Romanian or Russian month names inside English sentences.
- Times: the availability grid uses 12-hour labels ("9am"). Booking and sessions follow the browser.
  Moldova uses 24-hour time.
- Money is inconsistent:
  - `formatPrice` hard-codes "{n} MDL" (`sessions.ts:91-93`).
  - Course pages print whatever currency is stored, and the course editor still offers USD
    (`CourseEditor.tsx:1194-1195`).
  - The find-tutor slider uses "$", and the demo uses "€".
  - People in Moldova say "lei"; "MDL" is the ISO code. If Romanian or Russian is added later, format
    prices with `Intl.NumberFormat("ro-MD", { style: "currency", currency: "MDL" })` rather than string
    templates.
- Exam vocabulary is American ("SAT", "final"; see #15), and the time-of-day idioms are English
  (see #13).

### Platform notes

- **Safe area.** Three fixed bottom bars use `bottom-0` or `bottom-3` with no
  `env(safe-area-inset-bottom)`:
  - the course sticky bar (`_app.courses.$slug.tsx:866`)
  - `DemoBanner` (`DemoBanner.tsx:13`)
  - the demo view switch (`pathwise.demo.tsx:202`)

  The viewport meta is `width=device-width, initial-scale=1` without `viewport-fit=cover`
  (`__root.tsx:38`), and there's no web manifest. Browsers therefore keep the page inside the safe
  area, and the insets would read 0 anyway, so nothing is needed now. If you later add
  `viewport-fit=cover` or a manifest, add `pb-[max(0.75rem,env(safe-area-inset-bottom))]` to all
  three.
- **Thumb reach.**
  - On phones, the course page's main action sits in a bottom sticky bar, and booking's "Continue →"
    is in the page flow. Both are reachable.
  - Navigation lives in the top corners for every role, the hardest place to reach one-handed. Fixing
    #2 keeps that. A bottom tab bar (#9) is the full answer.
- **Desktop shell (please confirm live).** The header (`sticky top-0 z-40`) and the dashboard aside
  (`lg:sticky top-0 h-screen z-40`) both pin to the top of the viewport. Two effects are likely:
  - Once the page scrolls about 58 px, the aside, which comes later in the DOM, should paint over the
    header's left 260 px, logo included.
  - Before any scroll, the aside's bottom 58 px, which holds the sidebar's "Sign out", sits below the
    fold.

  A fix is `lg:top-[3.625rem] lg:h-[calc(100vh-3.625rem)]` on the aside.
