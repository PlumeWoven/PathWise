## Design review: PathWise interaction flows (feedback, loading, errors, modality, forms, destructive actions)

Lens: apple-hig Lens 4 (Interaction) plus the Agency and Responsibility principles.
Method: source audit only. I traced handlers, Supabase calls and state for flows A to E. I didn't
check the live site or live DB schema.

References opened: `cross-platform.md`, `feedback.md`, `loading.md`, `progress-indicators.md`,
`modality.md`, `alerts.md`, `sheets.md`, `undo-and-redo.md`, `entering-data.md`, `text-fields.md`,
`onboarding.md`, `managing-accounts.md`, `writing.md`, `design-principles.md`, and apple-design §1
and §16. HIG citations below are paraphrased, not quoted.

### Summary

PathWise's job is to get a Moldovan student from a 3-minute level check to a booked tutor, and to
get a tutor from sign-up to a bookable profile. The happy paths mostly work: anonymous browsing,
skeleton loaders on matches, an inline cancel form, and a careful reschedule rollback. The failure
paths are where the app breaks. Three bugs lose data or trap people:

- A password-reset link that fails leaves the page on "Verifying..." forever.
- A student's review can be dropped while the UI reports success.
- One tap on an unlabeled trash icon permanently deletes course content.

Beyond those, errors often become blank pages or fake empty states. Several controls report work
they never did, and the most-used modal has no Esc key or focus handling.

**Overall rating: Critical issues** (3 Critical, 7 High, 5 Medium, 1 Low).

| Flow | Findings |
| --- | --- |
| A. Sign up / log in | 1, 6, 9, 10, 11 |
| B. Student: quiz → roadmap → booking → sessions | 2, 4, 7, 8, 9, 14, 15, 16 |
| C. Tutor: onboarding → courses → availability | 3, 5, 7, 12, 13 |
| D. Messages | 7, 16 |
| E. Admin | 7, 13 |

---

### Critical

#### 1. A failed password-reset link waits forever (Flow A)

- **What**: `src/routes/_app.reset-password.tsx:27-35` sets `ready` only when Supabase emits
  `PASSWORD_RECOVERY` or a session exists. The client uses PKCE (`src/integrations/supabase/client.ts:25`),
  so the code exchange fails in three cases:
  - the link expired;
  - the link was already used;
  - the link was opened in another browser or device than the one that asked for it. The code
    verifier lives in that first browser's localStorage, and "request on a laptop, open the email
    on a phone" is the common case.

  Supabase then appends `error_code=otp_expired` (or similar) to the URL, and the page never reads
  it. Lines 69-72 render "Verifying your reset link..." with no timeout, no error and no way to
  request a new link. The person is stuck, and the header is the only way out.
- **Why**: `feedback.md › Best practices`: when a command can't be carried out, show it and explain
  why. `design-principles.md › Agency`: recovering from the unexpected shouldn't cost people time or
  work. apple-design §16 Wayfinding: never trap the user.
- **Fix**: read the error, add a timeout, and offer a new link on the page itself.

  ```tsx
  const [linkError, setLinkError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
    if (p.get("error_code") || p.get("error")) {
      setLinkError("This reset link has expired or was opened in a different browser.");
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => session && setReady(true));
    const t = setTimeout(() => setLinkError("This reset link couldn't be verified."), 8000);
    return () => { clearTimeout(t); sub.subscription.unsubscribe(); };
  }, []);

  // in render, before the `!ready` branch:
  {linkError && !ready && (
    <form role="alert" className="mt-6 space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/reset-password` });
      setInfo("New link sent. Open it in this browser.");
    }}>
      <p className="text-[0.875rem]">{linkError} Enter your email to get a new one.</p>
      <input type="email" autoComplete="email" required value={email}
             onChange={(e) => setEmail(e.target.value)} className="pw-input" aria-label="Email" />
      <button className="pw-btn-primary w-full px-6 py-3">Send a new link</button>
    </form>
  )}
  ```

#### 2. A student's review can be lost while the UI reports success (Flow B)

- **What**: `src/routes/_app.sessions.$id.tsx:214-219` awaits `supabase.from("reviews").insert(...)`
  but never reads its `{ error }`. supabase-js returns errors instead of throwing, so the
  `try/catch` (213-223) never catches them. `doTransition("closed")` (220) then moves the session
  out of `awaiting_review`, and the form disappears (the condition on line 398). The success toast
  reads "Session closed" (149); the `title: "Thanks for your review!"` argument is ignored. Any RLS,
  constraint or network error leaves the student believing the review posted, with no way to try
  again. "Submit review" (421-423) has no pending or disabled state, so a double click can insert
  two reviews.
- **Why**: `feedback.md › Best practices`: confirm that significant actions completed, and show when
  a command can't be carried out. `design-principles.md › Responsibility`: people trust you to keep
  their data intact.
- **Fix**:

  ```tsx
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState("");

  async function handleSubmitReview() {
    if (!user || !session?.tutor_id || reviewBusy) return;
    setReviewBusy(true);
    setReviewError("");
    const { error } = await supabase.from("reviews").insert({
      student_id: user.id, tutor_id: session.tutor_id, rating: reviewRating, body: reviewBody || null,
    });
    if (error) {
      setReviewBusy(false);
      setReviewError("Review not saved. Your text is still here. Check your connection and submit again.");
      return;
    }
    await doTransition("closed", { title: "" });
    toast.success("Review posted. Thanks!");
    setReviewBusy(false);
  }

  {reviewError && <p role="alert" className="mt-2 text-[0.75rem] text-[var(--pw-danger)]">{reviewError}</p>}
  <button onClick={handleSubmitReview} disabled={reviewBusy} className="pw-btn-primary px-4 py-2 mt-3 disabled:opacity-50">
    {reviewBusy ? "Posting…" : "Post review"}
  </button>
  ```

#### 3. One tap on a trash icon permanently deletes course sections and lessons (Flow C)

- **What**: in `src/components/dashboard/CourseEditor.tsx`, the section trash button (783-788) sits
  right next to the section title input. The lesson trash button is at 898-903. Neither has an
  accessible name, and both delete on the first click:
  - Sections: `onDelete` at 676-680 calls `deleteSection`, which runs a hard `DELETE`
    (`src/pathwise/courses.ts:146-149`).
  - Lessons: `onLessonDelete` at 694-697 calls `deleteLesson`, also a hard `DELETE` (`courses.ts:176-179`).

  The migration declares `course_lessons.section_id … ON DELETE CASCADE`
  (`supabase/migrations/20260511091258_f8b01277-….sql:94`). So a section can take its lessons and
  their uploaded videos with it. (Live schema not checked; project notes say early migrations
  drifted. Either way, a lesson delete is final.) Both handlers also remove the row from state
  *after* `.catch(toast)`, so a failed delete still disappears from the UI and comes back on reload.
- **Why**: `alerts.md › Best practices`: an uncommon destructive action that can't be undone needs
  an alert. `undo-and-redo.md › Best practices`: undo lets people recover. `feedback.md › Best
  practices`: warn before unexpected, irreversible data loss. `design-principles.md › Agency`: help
  people recover from mistakes.
- **Fix**: confirm the rare, large delete (a section) and offer undo for the frequent one (a lesson).
  Update state only after the server succeeds.

  ```tsx
  // SectionCard: replace the bare trash button
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <button aria-label={`Delete section ${section.title}`} className="text-[var(--pw-danger)] p-1.5">
        <Trash2 className="size-4" />
      </button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete “{section.title}”?</AlertDialogTitle>
        <AlertDialogDescription>
          Its {lessons.length} lessons and their videos are deleted too. This can't be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onDelete}>Delete Section</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  // Step2Content: only drop from state on success
  onDelete={async () => {
    try {
      await deleteSection(sec.id);
      setSections((a) => a.filter((s) => s.id !== sec.id));
      setLessons((a) => a.filter((l) => l.section_id !== sec.id));
    } catch {
      toast.error("Couldn't delete the section. Nothing was removed.");
    }
  }}

  // Lessons: hide now, delete when the undo window closes
  onLessonDelete={(id) => {
    const removed = lessons.find((l) => l.id === id)!;
    setLessons((a) => a.filter((l) => l.id !== id));
    let undone = false;
    const commit = () => !undone && deleteLesson(id).catch(() => {
      setLessons((a) => [...a, removed]);
      toast.error("Couldn't delete the lesson. It's been restored.");
    });
    toast("Lesson deleted", {
      action: { label: "Undo", onClick: () => { undone = true; setLessons((a) => [...a, removed]); } },
      onAutoClose: commit,
      onDismiss: commit,
    });
  }}
  ```

---

### Improvements

#### 4. [High] A recurring booking that fails part-way leaves sessions the student doesn't know about (Flow B)

- **What**: `src/routes/_app.book.$tutorId.tsx:261-292` books each occurrence with its own
  `book_session` RPC inside a loop. Suppose occurrence 3 of 4 hits `SLOT_TAKEN`:
  - occurrences 1 and 2 already exist, and the tutor has been notified (trigger, comment on 304);
  - the catch (319-347) shows "This slot was just booked by someone else — please refresh and pick
    another time." and clears the slot (347);
  - the success screen never appears.

  The student thinks nothing was booked, and each retry adds more sessions. `createdIds` is declared
  inside `try` (260), so the catch couldn't report the created sessions even if it tried. The
  `session_state_history` insert errors are ignored too (286-291).
- **Why**: `feedback.md › Best practices`: report the success or failure of an important task.
  `design-principles.md › Responsibility`: keep people's data intact.
- **Fix**: the real fix is one RPC that books the whole series in a single transaction. Until then,
  undo the partial series:

  ```tsx
  const createdIds: string[] = [];          // hoisted above `try`
  try { /* loop as today */ }
  catch (err) {
    if (createdIds.length) {
      await supabase.from("sessions")
        .update({ status_v2: "cancelled", cancellation_reason: "Series booking failed" })
        .in("id", createdIds);
      toast.error(`Session ${createdIds.length + 1} of ${recurrenceInstances.length} was just taken, so none were booked. Pick another start time.`);
    } else {
      toast.error(err instanceof Error ? err.message : "Couldn't complete the booking.");
    }
    // …existing restore + refresh
  }
  ```

#### 5. [High] The dashboard's "Sign out" doesn't sign out (Flow C)

- **What**: `src/components/dashboard/TutorSidebar.tsx:153-158` is a `<Link to="/">` labelled "Sign
  out". It goes to the home page and leaves the Supabase session in localStorage. The header has a
  real sign-out with the same label (`src/pathwise/Header.tsx:80-96` → `logout()`). On a shared or
  school computer, the next person stays signed in as the tutor, with access to earnings and student
  messages.
- **Why**: `design-principles.md › Responsibility`: keep people's information safe. apple-design §16
  Familiarity: things that look the same must behave the same.
- **Fix**:

  ```tsx
  const { logout } = useAuth();
  const navigate = useNavigate();
  <button
    onClick={async () => { await logout(); navigate({ to: "/" }); }}
    className="block w-full text-center label-caps py-2 text-[var(--pw-ink-2)] hover:text-[var(--pw-accent)]"
  >
    Sign out
  </button>
  ```

  `logout()` already clears the impersonation keys (`auth.tsx:177-189`).

#### 6. [High] A lost confirmation email has no recovery path, and the confirm page shows raw errors (Flow A)

- **What**:
  - Signing in with an unconfirmed address shows Supabase's raw "Email not confirmed"
    (`src/pathwise/LoginModal.tsx:129-131`) with no resend action. The branch meant to open
    `ConfirmationModal` (which has Resend) is at 135-139, but it can't run: with confirmations on,
    `signInWithPassword` returns an error, not a user.
  - `src/routes/_app.confirm-email.tsx:24-26, 86-90`: under PKCE, opening the link on another device
    confirms the email on the server but creates no session here. `getUser` fails, so the page says
    "Confirmation Failed" with the raw "Auth session missing!", even though the account is now
    confirmed. Its "Resend Email" button (96-111) needs a session, so it fails with "No email found".
  - The modal tells people the link expires in 24 hours (`ConfirmationModal.tsx:88`), so recovering
    from an expired link has to work.
- **Why**: `writing.md › Write clear error messages`: put the error near the problem and say what
  to do. `feedback.md › Best practices`: explain why a command failed. `design-principles.md ›
  Agency`: recovery shouldn't cost people time or work.
- **Fix**:

  ```tsx
  // LoginModal.handleSignIn
  if (err) {
    if (err.code === "email_not_confirmed") {
      setSignupEmail(email.trim());
      setShowConfirmation(true);           // shows "Resend email"
      return;
    }
    setError(err.code === "invalid_credentials"
      ? "That email and password don't match. Try again, or reset your password."
      : "Sign-in didn't go through. Check your connection and try again.");
    return;
  }

  // confirm-email: a missing session isn't a failure
  if (!user) { setStatus("signin"); return; }
  {status === "signin" && (<>
    <h1 className="…">Almost there</h1>
    <p className="…">If you opened the newest link, your email is confirmed. Sign in to continue.</p>
    <Button onClick={openLogin}>Sign In</Button>
  </>)}
  ```

#### 7. [High] Load failures become blank pages, endless spinners or fake empty states (Flows B, C, D, E)

- **What**:
  - Roadmap: `src/routes/_app.roadmap.tsx:292-303` toasts the raw error, then 493 runs
    `if (!roadmap) return null;`. The page under the header is blank, with no retry.
  - Course match: `src/routes/_app.course-match.tsx:166-170` errors, then 259 returns `null`.
  - Course editor: `src/components/dashboard/CourseEditor.tsx:149-151` toasts "Failed to load",
    then 205-213 spins forever because `course` stays `null`.
  - Sessions: `src/routes/_app.sessions.index.tsx:40-45` ignores `error`. A failed query shows
    "Nothing here yet. Find a tutor →" (105-111) to a student who has sessions.
  - Inbox: `src/pathwise/Inbox.tsx:68-71` ignores errors and shows "No conversations yet" (114-118).
    A failed message fetch (169-173) shows "Say hello…" (232-234).
  - Admin users: `src/routes/admin.users.tsx:18-22` ignores errors and renders an empty table.
- **Why**: `loading.md › Best practices`: people read missing content as a problem with the app.
  `alerts.md › Best practices`: when there's a problem, prefer a quiet label in context.
  `writing.md › Write clear error messages`.
- **Fix**: give each page one `loadError` state. Here it is for the roadmap; course-match and
  CourseEditor work the same way, and sessions/Inbox should check `error` before treating `[]` as
  empty.

  ```tsx
  const [loadError, setLoadError] = useState(false);
  // in fetchRoadmap catch: setLoadError(true);  (drop the raw-message toast)
  if (loadError) return (
    <main className="px-5 sm:px-8 pt-20 max-w-md mx-auto text-center" role="alert">
      <h1 className="font-display text-[1.5rem]">Roadmap didn't load</h1>
      <p className="mt-2 text-[0.875rem] text-[var(--pw-ink-2)]">Check your connection, then try again.</p>
      <button className="pw-btn-primary mt-5 px-5 py-2.5"
              onClick={() => { setLoadError(false); roadmapId && fetchRoadmap(roadmapId); }}>
        Try Again
      </button>
    </main>
  );
  ```

#### 8. [High] The interface reports things it didn't do, and asks for input it throws away (Flows B, demo)

- **What**:
  - Matches empty state: "Create alert", "Join waitlist" and "Notify me when matching tutors join"
    (`src/routes/_app.matches.tsx:600-617`) only fire success toasts. Nothing is stored and nobody
    gets notified.
  - Demo exit: `src/pathwise/ExitDemoModal.tsx:13-23` asks for an email under "Create my free
    account →". It toasts "Welcome to Pathwise! Setting up your account…", then navigates to
    `/dashboard`, which shows a sign-in wall. The email only goes to localStorage
    (`DemoContext.tsx:248-251`), and no account is created.
  - Student onboarding: the required "What's your goal?" textarea
    (`src/routes/_app.onboarding.student.tsx:81-90`) is never sent. `updateProfile` gets only
    `grade` and `onboarding_completed` (30-33). The page still promises to "tailor your roadmap"
    (60), and its error says "Failed to save your grade and goal" (39).
- **Why**: `design-principles.md › Responsibility`: be transparent about what the product does,
  and collect only what it needs. `feedback.md › Best practices`: confirm completion only when the
  action actually completed.
- **Fix**:
  - Delete the three matches buttons until an alerts table exists. Keep "Clear all filters" and
    "Try related subjects".
  - ExitDemoModal: drop the email field and make the button open real sign-up:
    `onClick={() => { onClose(); openLogin(); }}`, labelled "Create Free Account".
  - Student onboarding: delete the goal textarea. The quiz already captures the goal as a `GoalId`
    (`_app.quiz.tsx:109-112`). If you keep it, add a column and send it in `updateProfile`.

#### 9. [High] Signing in moves people off the page they were on, and an old booking hijacks later sign-ins (Flows A, B)

- **What**:
  - `src/pathwise/LoginModal.tsx:86-89` always navigates after an email sign-in: to a pending
    booking, or to the role's home (`/roadmap`, `/dashboard`). For example, a student who signs in
    from a tutor's "Message" button (`Inbox.tsx:38-40`) lands on `/roadmap` and has to find the
    tutor again. The Google path already returns people to where they were (105-108); the email
    path doesn't.
  - `src/routes/_app.book.$tutorId.tsx:125-132` writes `pathwise_pending_booking` whenever a
    signed-out visitor merely opens a booking page. It is cleared only after a successful booking
    (305-309). From then on, every sign-in by an onboarded student is redirected to that tutor's
    booking page, days later and from any page (`LoginModal.tsx:87-88`, `_app.confirm-email.tsx:78-79`,
    `_app.onboarding.student.tsx:45-46`).
  - Only the tutor id is saved. A new student who signs up mid-wizard loses the session type,
    slot and recurrence after confirm-email and onboarding.
- **Why**: `design-principles.md › Agency`: let people move freely instead of locking them into
  flows. `managing-accounts.md › Best practices`: delay sign-in. PathWise does this well, but the
  sign-in moment has to return people to their task. apple-design §16 Wayfinding.
- **Fix**:

  ```tsx
  // routeAfterAuth: stay put unless onboarding is needed or they came from the home page
  closeLogin();
  if (!onboarded) return navigate({ to: postAuthDestination(r, false) });
  const pending = pendingBookingTutorId();
  if (pending) { localStorage.removeItem("pathwise_pending_booking"); return navigate({ to: "/book/$tutorId", params: { tutorId: pending } }); }
  if (window.location.pathname === "/") navigate({ to: postAuthDestination(r, true) });

  // book page: record intent only when they actually try to book (handleConfirmAndPay, signed out)
  localStorage.setItem("pathwise_pending_booking",
    JSON.stringify({ tutorId, type, slot: slot?.toISOString(), at: Date.now() }));
  ```

  Then ignore entries older than an hour in `pendingBookingTutorId()`.

#### 10. [High] The login modal has no Esc key or focus handling, opens by itself, and stacks a second modal (Flow A)

- **What**:
  - `src/pathwise/LoginModal.tsx:250-265` is a plain fixed `<div>`. It has no `role="dialog"`, no
    `aria-modal`, no labelled title, and no focus move or trap. Esc does nothing: there's no
    `keydown`/`Escape` handler anywhere in `src/` outside `components/ui`. Keyboard users tab
    through the page behind it.
  - It opens without a click on every guarded page (`RequireOnboarding.tsx:18-20`,
    `RoleGate.tsx:24-27`, `_app.messages.tsx:20-22`, both onboarding pages).
  - After sign-up, `ConfirmationModal` (a Radix Dialog) opens *on top of* the still-open login
    modal (434-440). Closing it shows the filled sign-up form again. Pressing "Create Free Account"
    a second time returns "An account with this email already exists."
  - `ConfirmationModal.tsx:72-74` says "Redirecting you to your dashboard...", but its effect
    (38-45) only closes itself after 2 s.
  - A backdrop click (253) throws away a half-filled sign-up form without warning.
  - `ExitDemoModal`, `StageDetailModal` and `MilestoneCelebration` use the same custom overlay,
    also without Esc.
- **Why**: `modality.md › Best practices`: always give an obvious way to dismiss; dismiss one modal
  before presenting another; confirm before closing if user content would be lost.
  `alerts.md › Buttons`: Escape should cancel. `alerts.md › Best practices`: avoid interrupting
  people at launch.
- **Fix**: rebuild on the vendored shadcn `Dialog`, which gives Esc, focus trap, `role="dialog"`
  and `aria-labelledby` for free. Make confirmation a fourth mode of the same dialog, not a second
  dialog:

  ```tsx
  type Mode = "signin" | "signup" | "forgot" | "confirm";

  <Dialog open={loginOpen} onOpenChange={(o) => { if (!o) closeLogin(); }}>
    <DialogContent className="pw-card max-w-[32.5rem] p-7">
      <DialogTitle className="font-display …">{title}</DialogTitle>
      <DialogDescription>{subtitle}</DialogDescription>
      {mode === "confirm" ? <ConfirmBody email={signupEmail} onResend={…} /> : /* forms */}
    </DialogContent>
  </Dialog>
  // after signUp succeeds: setMode("confirm") instead of setShowConfirmation(true)
  ```

  Delete the "Redirecting you…" sentence; the confirm-email page does the routing. On guarded
  pages, show `SignInPrompt` inline and open the modal only when its "Sign in" button is pressed.

#### 11. [Medium] Auth fields: no autofill hints, unlinked labels, and rules hidden until the server rejects (Flow A)

- **What**:
  - `autoComplete` appears **0 times** in `src/` outside `components/ui`. Password managers and
    mobile autofill can't tell sign-in from sign-up, and can't offer a generated password.
  - `LoginModal.tsx:479-501` `Field` renders a `<label>` without `htmlFor` and an `<input>` without
    `id`, so screen readers don't announce the label. The same pattern appears in
    `_app.reset-password.tsx:76-93` and `_app.onboarding.student.tsx:65, 82`.
  - Rules show up only as raw server messages after submit, via `setError(err.message)` at 130,
    185 and 231. Examples: "Password should be at least 6 characters." and "Invalid login
    credentials".
  - Sign-up's submit button stays disabled until a role and the 18+ box are set (371-375), with no
    explanation. The inline messages written for those cases (147-158) can never fire.
  - `consent` isn't reset when the modal reopens (the reset effect at 34-47 skips it).
- **Why**: `entering-data.md › Best practices`: get information from the system, validate
  dynamically, and make required data clear before people can proceed. `text-fields.md › Best
  practices`: label fields and validate at the right moment. `writing.md › Write clear error
  messages`.
- **Fix**:

  ```tsx
  function Field({ label, type, value, onChange, autoComplete, hint }: FieldProps) {
    const id = useId();
    return (
      <div>
        <label htmlFor={id} className="label-caps text-[var(--pw-ink-2)]">{label}</label>
        <input id={id} type={type} required value={value} autoComplete={autoComplete}
               aria-describedby={hint ? `${id}-hint` : undefined}
               onChange={(e) => onChange(e.target.value)} className="pw-input mt-1 text-[0.875rem]" />
        {hint && <p id={`${id}-hint`} className="mt-1 text-[0.6875rem] text-[var(--pw-ink-2)]">{hint}</p>}
      </div>
    );
  }
  <Field label="Full name" type="text" autoComplete="name" … />
  <Field label="Email" type="email" autoComplete="email" … />
  <Field label="Password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"}
         hint={mode === "signup" ? "At least 6 characters" : undefined} … />
  // reset-password inputs: autoComplete="new-password"
  // keep the sign-up button enabled; handleSignUp's existing messages explain what's missing
  ```

#### 12. [Medium] Tutor onboarding: requirements show up only at the last step, "Skip" doesn't skip, and saving can wipe availability (Flow C)

- **What**:
  - In `src/routes/_app.onboarding.tutor.tsx`, `publish` (359-371) is the first place that says a
    subject and an hourly rate are required. From the Review step, the tutor is sent back to step 2
    or 5 with only a toast.
  - "Skip for now" (`goSkip`, 355-357; button 426-435) calls `goNext`, so it saves exactly like
    Continue. It also appears on required steps (Expertise, Pricing).
  - `saveStep` (313-336) deletes all `tutor_availability` and `tutor_packages` rows, then inserts
    the new ones without reading either result. If an insert fails, the tutor's schedule or packages
    are gone and the wizard still advances. The settings page checks these errors
    (`_app.tutor.settings.availability.tsx:207-216`), but it also deletes before inserting.
- **Why**: `entering-data.md › Best practices`: make sure people know what's required before they
  can proceed, and validate dynamically. `onboarding.md › Additional requests`: optional setup can
  be postponed, so "skip" has to mean skip.
- **Fix**:

  ```tsx
  const stepBlocker =
    state.step === 2 && state.subject_ids.length === 0 ? "Pick at least one subject you teach." :
    state.step === 5 && !(Number(state.hourly_rate) > 0) ? "Set an hourly rate above 0 MDL." : null;

  {stepBlocker && <p className="text-[0.75rem] text-[var(--pw-ink-2)] mr-auto">{stepBlocker}</p>}
  <button onClick={goNext} disabled={saving || !!stepBlocker} …>Continue</button>
  {[3, 4].includes(state.step) && (
    <button onClick={() => setState((p) => ({ ...p, step: p.step + 1 }))}>Skip for now</button>
  )}

  // saveStep: check every write
  const { error: aDel } = await supabase.from("tutor_availability").delete().eq("user_id", profile.id);
  if (aDel) throw aDel;
  const { error: aIns } = await supabase.from("tutor_availability").insert(rows);
  if (aIns) throw aIns;   // same for packages; ideally one RPC that replaces both in a transaction
  ```

#### 13. [Medium] Destructive actions get the wrong protection: native confirm, no names, no undo (Flows B, C, E)

- **What**:
  - Native `confirm()` is used to suspend a user (`src/routes/admin.users.tsx:44`), cancel a
    session (`admin.sessions.tsx:113`) and delete a course (`tutor.courses.index.tsx:36`). The
    browser dialog's confirm button is a generic "OK". It doesn't name the user or course and can't
    style the destructive button.
  - Suspend also clears verification (`admin.users.tsx:66-67`). The confirm doesn't say so, and
    Restore doesn't re-verify.
  - Impersonate (`admin.users.tsx:128-136`) signs the admin out *before* `verifyOtp`. If that fails,
    the admin is logged out and `AdminLayout` bounces to `/` (`admin.tsx:17-21`). Nothing warns
    before the click.
  - Some actions that need protection have none:
    - "Choose a different course" (`_app.course-match.tsx:408-414`) stays visible on a *completed*
      enrollment. One click marks it `dropped` (`api.ts:388-395`) and re-locks the stage.
    - "Copy Monday to all days" (`_app.tutor.settings.availability.tsx:136-151`) overwrites six days
      and toasts success, with no undo.
  - The delete-course trash icon has no accessible name (`tutor.courses.index.tsx:121-126`).
- **Why**: `alerts.md › Buttons`: avoid OK as the default, title the button with the action, and
  include Cancel. `alerts.md › Best practices`: skip alerts for common undoable actions.
  apple-design §16 Agency: easy undo for slips, and a confirmation only for actions that are truly
  destructive and irreversible.
- **Fix**: use the vendored `AlertDialog` (as in finding 3), naming the target and the consequence:

  ```tsx
  <AlertDialogTitle>Suspend {u.display_name}?</AlertDialogTitle>
  <AlertDialogDescription>They can't sign in, and their tutor verification is removed.</AlertDialogDescription>
  <AlertDialogCancel>Cancel</AlertDialogCancel>
  <AlertDialogAction onClick={() => setSuspended(u.id, true)}>Suspend</AlertDialogAction>
  ```

  Use the same pattern for "Delete “{course.title}”?" (and add `aria-label="Delete course"`) and for
  "Impersonate {name}? You'll be signed out of your admin account."

  For the reversible actions, use an undo toast:

  ```tsx
  function copyMondayToAll() {
    const prev = grid;
    setGrid(/* …as today */);
    toast.success("Copied Monday to every day", { action: { label: "Undo", onClick: () => setGrid(prev) } });
  }
  ```

  Wrap "Choose a different course" in `{!isComplete && …}`.

#### 14. [Medium] Session actions: no pending state, a failed cancel looks finished, and Join can be popup-blocked (Flow B)

- **What** (all in `src/routes/_app.sessions.$id.tsx`):
  - `doTransition` (136-154) turns errors into a toast and returns normally. `handleCancel` and
    `handleReport` then run `setShowCancel(false)` (189, 207), so a failed cancel closes the form.
  - No button disables while a transition runs: "Confirm cancel" (369-375), "Accept booking"
    (300-305) and "Mark completed" (308-310). A double click writes twice.
  - An empty reason gets a toast (194-196) instead of a message under the textarea.
  - Internal status names leak to users: `Cannot move from ${from} to ${to}` (`sessions.ts:70`).
  - `handleJoin` (156-165) waits for a network round-trip before calling `window.open`. Browsers
    that need a direct user gesture for popups (Safari especially) can block it, so "Join session"
    may appear to do nothing at lesson time.
  - `handleComplete` fires two transitions 600 ms apart, producing two toasts (167-181).
- **Why**: `feedback.md › Best practices`. `writing.md › Write clear error messages`: put the error
  next to the problem. apple-design §1: respond on press.
- **Fix**:

  ```tsx
  const [busy, setBusy] = useState(false);
  async function doTransition(to: SessionStatus, opts: …): Promise<boolean> {
    setBusy(true);
    try { await transitionSession({ … }); await load(); return true; }
    catch { toast.error("Couldn't update the session. Try again."); return false; }
    finally { setBusy(false); }
  }
  async function handleCancel() {
    if (!cancelReason.trim()) return setReasonError("Add a short reason so the other person knows why.");
    if (await doTransition("cancelled", { … })) setShowCancel(false);
  }
  // Join: open first, record second
  function handleJoin() {
    if (session?.meeting_url) window.open(session.meeting_url, "_blank", "noopener");
    if (session && session.status_v2 !== "in_progress") void doTransition("in_progress", { … });
  }
  <button disabled={busy} …>{busy ? "Cancelling…" : "Cancel Session"}</button>
  ```

#### 15. [Medium] Quiz: a fake 1.6-second "analysis", and results that vanish on reload (Flow B)

- **What** (in `src/routes/_app.quiz.tsx`):
  - After the last answer, a spinner cycles "Analyzing your answers… / Calibrating difficulty…"
    for a fixed 1600 ms (165-187). The band was already computed synchronously (156-163).
  - Answers and results live in a module variable (`src/pathwise/store.ts:34-49`) that is reset
    on mount (90-95). They are saved only when "Build My Roadmap" is pressed (194-247). A reload, a
    back-swipe or a closed tab on the result screen loses the 3-minute quiz.
  - A failed save shows the raw error in a toast (312).
- **Why**: `loading.md › Best practices`: the best loading finishes before people notice it.
  `progress-indicators.md › Best practices`: avoid vague text like "loading". apple-design §1: audit
  artificial timers. `design-principles.md › Agency`: recovery shouldn't cost time or work.
- **Fix**: in `finish()`, replace the interval and timeout with `setPhase("result")` and keep the
  confetti. Persist the run so the result screen survives a reload:

  ```ts
  // store.ts
  export function setState(patch: Partial<PWState>) {
    state = { ...state, ...patch };
    try { sessionStorage.setItem("pw-quiz", JSON.stringify(state)); } catch {}
    listeners.forEach((l) => l());
  }
  ```

  Restore from `sessionStorage` in the quiz mount effect when `state.level` is set, instead of
  calling `resetState()`. Replace the raw toast with "Roadmap not saved. Check your connection and
  press Build again."

#### 16. [Low] Blank screens while auth loads, placeholder prices on booking, and empty states with no next step (all flows)

- **What**:
  - Several components `return null` during loading: `RequireOnboarding.tsx:27-29`,
    `RoleGate.tsx:29`, `_app.onboarding.student.tsx:50`, `_app.onboarding.tutor.tsx:401` and
    `dashboard.tsx:44`.
  - A signed-in user with no role and incomplete onboarding is never redirected
    (`RequireOnboarding.tsx:22` needs a role) and stays blank forever (29). This is rare while
    Google sign-up is off.
  - The booking page has no loading state. Until the tutor row arrives, options show "Free" or
    "0 MDL" (`_app.book.$tutorId.tsx:488-507`), then jump. A nonexistent tutor id still walks all
    five steps: `notFoundComponent` (62-71) never fires because nothing throws `notFound()`.
  - Empty states with no action:
    - "This tutor hasn't published availability yet. Try messaging them first." has no Message
      button (521-524).
    - "Sign in to see your sessions." has no button (`_app.sessions.index.tsx:70-76`).
    - "Session not found." has no link (`_app.sessions.$id.tsx:110-115`).
    - "No conversations yet. Message a tutor from their profile." has no link and is wrong for
      tutors (`Inbox.tsx:114-118`).
    - "Reviews page coming soon" is a button that does nothing (`dashboard.index.tsx:797`).
- **Why**: `loading.md › Best practices`: show something as soon as possible. apple-design §16
  Wayfinding: every screen answers "where can I go?".
- **Fix**:
  - Swap the `return null`s for the one-line "Loading…" `<main>` already used in `dashboard.tsx:35-37`.
  - On the booking page, add `const [tutorLoaded, setTutorLoaded] = useState(false)`, set it after
    the profile query, and render
    `if (!tutorLoaded) return <Loading/>; if (!tutor) return <TutorNotFound/>` (reuse the markup
    at 62-71).
  - Add the missing actions, e.g. `<button onClick={() => startConversation(tutorId)}>Message
    {tutor.display_name}</button>`, a "Sign in" button that calls `openLogin`, and
    `<Link to="/sessions">Back to My Sessions</Link>`.

---

### What works

- **Delayed sign-in.** Quiz, roadmap and matches allow anonymous use
  (`RoleGate allowAnonymous`, `_app.quiz.tsx:65`, `_app.roadmap.tsx:81`). Booking asks for an
  account only at "Book session" (`_app.book.$tutorId.tsx:220-223`). This follows
  `managing-accounts.md › Best practices`. Keep it, and fix finding 9 so sign-in returns people to
  the page they started from.
- **18+ consent at the right moment.** It's asked at sign-up next to the Terms and Privacy links,
  and the timestamp is recorded (`LoginModal.tsx:352-370, 170-172`). That's the right place and
  purpose (`design-principles.md › Responsibility`).
- **Honest reschedule.** The old slot is released, the new one booked, and the original restored
  with a clear toast if the new booking fails (`_app.book.$tutorId.tsx:229-257, 319-334`).
- **Inline cancel instead of a modal.** It requires a reason and labels the safe exit "Keep session"
  (`_app.sessions.$id.tsx:352-387`). Keep the pattern and add the pending state from finding 14.
- **Message sending done right.** The draft is cleared only after a successful insert, Send is
  disabled while sending or empty, realtime dedupes by id, and the input has `aria-label` and
  `maxLength` (`Inbox.tsx:203-221, 257-267`).
- **Content-shaped skeletons and useful empty states.** Matches (`_app.matches.tsx:438-445`) and
  course match (`_app.course-match.tsx:242-257`) show skeletons. The course-match empty state
  explains why it's empty and offers two routes forward (635-658).
- **Visible save status.** The course editor shows "Saving… / Unsaved changes / Saved"
  (`CourseEditor.tsx:255-266`), autosaves every 30 s and mirrors to localStorage.
- **Resumable tutor onboarding.** The draft persists locally and the step resumes from the DB
  (`_app.onboarding.tutor.tsx:142-249`).
- **Quiz feedback.** Right and wrong answers get text plus color ("Not quite — the answer was …"),
  and subject or goal can be revisited until the quiz starts (`_app.quiz.tsx:101-102, 512-528`).
- **Role picker.** `auth.choose-role.tsx:132-135` says plainly that the role can't be changed later,
  uses `aria-pressed`, and explains the disabled Continue ("Pick a role to continue.").
- **Admin verify can't report false success.** It uses `.select("id")`, so an RLS-blocked update
  isn't reported as success (`admin.users.tsx:27-39`). Copy this into findings 2 and 12.
- **Wrong-role and signed-out fallbacks always offer a way out** (`RoleGate.tsx:37-66, 71-89`).

### Platform notes

PathWise is a web app (TanStack Start, React, shadcn/ui). Per the apple-hig scope rule, this review
applies the principles and Lens 4 patterns, not Apple's native component conventions. Apple terms
map onto what's already in the repo (`cross-platform.md › Vocabulary`):

| HIG pattern | Use in PathWise |
| --- | --- |
| Alert (destructive confirm) | `src/components/ui/alert-dialog.tsx` with Cancel, plus a specific action label |
| Sheet / modal view | `src/components/ui/dialog.tsx` or `sheet.tsx` (Esc, focus trap, labelled title built in) |
| Undo | sonner `toast(msg, { action: { label: "Undo", onClick } })`, already used in `DemoContext.tsx:221-224` |
| Secure text field, keyboard type | `type="password"` + `autoComplete`, `type="email"`, `inputMode` |
| Activity indicator | the existing spinner in `auth.callback.tsx:206-229`, with `role="status"` |

One cross-cutting rule would remove most of findings 2, 4, 7 and 12: supabase-js returns
`{ error }` instead of throwing, so every `await supabase…` result must be read. The app already
says this in comments (`dashboard.index.tsx:35`, `admin.users.tsx:27`) but doesn't apply it
everywhere.
