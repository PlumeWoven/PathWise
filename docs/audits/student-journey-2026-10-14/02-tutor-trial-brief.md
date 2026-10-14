# Student journey audit 2: the level check as a trial-lesson brief

Date: 2026-10-14. Auditor role: product engineer checking whether the level check can become a "level brief" that a tutor sees on a trial request.

Method:
- Read the quiz, scoring, booking and tutor-side code in this worktree.
- Read the live schema, RLS policies, grants, indexes, triggers and function bodies on project `tarnqywokrildahzhmjv` through `information_schema`, `pg_policies`, `pg_indexes` and `pg_proc`. No user rows were read. Nothing was written.
- Ran the real adaptive engine (`src/pathwise/adaptive-quiz.ts`) 4,000 times per ability level with a simulated student, to see which topics a run actually covers. Script: `/private/tmp/claude-501/-Users-ionnistorica-PathWise-PathWise--claude-worktrees-apple-design-skills-audit-084055/effd922f-a1a6-4099-8b30-fb50c356c9db/scratchpad/brief/sim.ts` (session scratchpad, next to Agent 1's `pw/`).
- Builds on `01-student-onboarding.md` (Agent 1). Its section 4 is not repeated here, only checked.

---

## 1. Verdict

The level check cannot be a trial brief yet. Three things block it. First, the data is too thin: 8 questions, topics picked by chance, no strengths computed, and most "weak topics" rest on one wrong answer. A strong student never sees a Geometry question. There is no English at all. Second, the results are not owned: on today's RLS the diagnostic claim almost certainly updates zero rows, so every result stays a guest row with `user_id = null`, readable by any signed-out visitor and invisible to the student who took it. Third, nothing connects a result to a booking: `sessions` has no subject, no diagnostic link and no consent flag, and no tutor policy or page reads `diagnostic_results`. The good news is that the pieces are small. The adaptive engine already holds every answer in memory, the guest-token columns and a claim function already exist in the live DB, the booking RPC is one function, and the tutor already opens one page (`/sessions/$id`) to confirm a request. A first version (Math only, latest attempt plus a history line, explicit consent at booking) is about 25 to 35 hours. Adding English is another 15 to 20 hours, mostly writing questions.

---

## 2. Agent 1's security claims, checked

| Claim (01, section 4) | Verdict | Evidence |
|---|---|---|
| Guest rows are readable by anyone | **True, and wider than stated.** | `diagnostic_results` policy "Anon can read own results": anon `SELECT` where `user_id IS NULL`. The name says "own", but it matches every guest row. `roadmaps.anon_select_roadmaps` and `authenticated_select_roadmaps` both expose every unclaimed roadmap. `roadmap_stages.anon_select_stages` is `qual true`: every stage of every roadmap, claimed or not. Because diagnostic claims fail (next row), in practice **every diagnostic ever taken** is readable by a signed-out visitor. |
| Any signed-in user can claim any guest row | **True for `roadmaps`. For `diagnostic_results` the policy allows it, but the claim most likely does nothing.** | `roadmaps`: authenticated can `SELECT` unclaimed rows and `UPDATE` them to their own id (`authenticated_claim_roadmaps`). So a signed-in user can list and take every guest roadmap. `diagnostic_results`: the `UPDATE` policy allows `user_id IS NULL → auth.uid()`, but the only authenticated `SELECT` policy is `user_id = auth.uid()`. Postgres applies `SELECT` policies to the existing row when an `UPDATE` has a `WHERE` on table columns, and every claim filters on `id` / `user_id`. The guest row is invisible, so 0 rows change and no error is returned. I could not run a check: an `EXPLAIN` under the `authenticated` role was blocked by this session's permission rules. Confirm with a test account (see section 9, question 9). |
| The Google callback claims other people's diagnostics | **The code tries to. RLS blocks it today, by accident.** | `src/routes/auth.callback.tsx:48-56` updates every anonymous diagnostic with the same subject from the last 5 minutes. Same RLS effect as above: 0 rows. Google sign-in is off (`src/pathwise/LoginModal.tsx:11-13`). It becomes a real leak the day someone "fixes" the claim with a broader policy or a `SECURITY DEFINER` function. Delete that block. |

Three new findings in the same area:

- **Students cannot read their own result after signing up.** The guest diagnostic stays `user_id = null`, and authenticated users can only read `user_id = auth.uid()`. The roadmap's band fallback (`src/routes/_app.roadmap.tsx:350-354`) gets nothing for a signed-in student.
- **Deleting an account makes its results public.** `diagnostic_results_user_id_fkey` is `ON DELETE SET NULL`. A deleted user's results become guest rows, readable by anon and claimable. `roadmaps` uses `ON DELETE CASCADE`, so the two disagree.
- **A safe guest flow is half-built and switched off.** Live `diagnostic_results`, `roadmaps` and `roadmap_stages` all have a `guest_token uuid` column, with partial indexes `idx_diagnostic_results_guest_token` and `idx_roadmaps_guest_token`. The function `claim_guest_roadmaps(p_guest_token)` (SECURITY DEFINER) claims all three by token. But no client code writes `guest_token` (grep finds it only in generated types), and `supabase/migrations/20261009120000_m1_lockdown.sql:263` revokes execute on the function from everyone. None of this is in the repo's migrations except the revoke, which matches the known migration drift.

---

## 3. Data captured: what the quiz really measures

### The question bank
- Defined in code, not the DB: `QUIZZES` in `src/pathwise/data.ts:47-222`. Six subjects: Mathematics, Sciences, Literature, History, Programming, Languages (`data.ts:4-10`).
- **No English.** "Languages" (`data.ts:195-222`) is trivia across French, Spanish, German, Italian, Japanese and linguistics ("Mandarin is a ___ language"). One question (`lg20`) is about English grammar. It cannot place an English learner.
- Mathematics has 27 questions (`data.ts:48-75`) in 5 topics. Coverage by topic and tier:

| Topic | T1 | T2 | T3 | T4 | T5 | Total |
|---|---|---|---|---|---|---|
| Foundations | 3 | | | | | 3 |
| Algebra | | 2 | 2 | 1 | 1 | 6 |
| Geometry | 1 | 3 | | | | 4 |
| Functions | | | 2 | 3 | 3 | 8 |
| Reasoning | 1 | | 2 | 2 | 1 | 6 |

  Geometry stops at tier 2. Foundations exists only at tier 1. Functions starts at tier 3. Calculus (`m23`, `m24`, `m26`), logs and quadratics are all filed under "Functions". Probability and sequences are under "Reasoning". Statistics and trigonometry have no questions.
- **Tutor subjects use different words.** The live `subjects` table lists Mathematics as Algebra, Calculus, Geometry, Statistics, Trigonometry, and English under Languages. The quiz has no "Calculus", "Statistics" or "Trigonometry" topic, and tutors have no "Functions", "Foundations" or "Reasoning". A brief that says "weak in Functions" does not line up with what a tutor says they teach.
- Questions have no curriculum tag (grade, Moldovan programme, BAC topic). The goal "Pass an exam" is stored but changes nothing in the questions.

### How a run picks questions
- `pickQuestionAtTier` (`data.ts:246-258`) picks a random unused question at the target tier, widening ±1, ±2. **It ignores topic.** Topic coverage is luck plus whatever topics exist at that tier.
- The staircase starts at tier 3 and moves by `STEPS` (`adaptive-quiz.ts:29`).

What a run covers (simulation, 4,000 runs per ability; the answer model is my assumption, so treat the numbers as indicative):

| True ability | Topics seen per run | Topics seen only once | Runs that see Geometry | Runs that see Foundations | "Weak" topics per run | Of those, from a single miss |
|---|---|---|---|---|---|---|
| 1 | 4.0 | 1.5 | 100% | 79% | 3.2 | 55% |
| 2 | 3.8 | 1.1 | 85% | 19% | 2.9 | 57% |
| 3 | 3.2 | 0.5 | 23% | 1% | 2.4 | 57% |
| 4 | 3.0 | 0.6 | 3% | 0% | 2.1 | 65% |
| 5 | 3.0 | 0.7 | 0% | 0% | 1.2 | 84% |

Plain reading: a typical run tests 3 of 5 topics. A student at tier 3 or above almost never meets Geometry, so the brief cannot say anything about it. More than half of all "weak topics" come from one wrong answer.

### Scoring
- Level: `finalBand` rounds the staircase estimate to 1..5 (`adaptive-quiz.ts:86-88`).
- Per-topic band: `topicBands` averages "tier if right, tier − 1 if wrong" per topic (`adaptive-quiz.ts:121-134`). One question can set a topic's band.
- Weak topics: `weakTopics` = any topic with at least one wrong answer (`adaptive-quiz.ts:137-139`). A tier-5 miss by a strong student counts the same as a tier-1 miss.
- **Strengths: not computed.** No function returns them. They could be derived from `topic_bands` (topics at or above the overall band with no miss).
- **Confidence: computed, never used.** `confidence()` (`adaptive-quiz.ts:145-153`) has no caller and is not stored.
- `score` is the raw correct count out of 8 (`adaptive-quiz.ts:156-158`). With an adaptive test, 4/8 is the expected result at any level, so a tutor should not see "4/8" as a grade.

### What is stored
- Stored in `diagnostic_results`: `subject`, `goal`, `score`, `level`, `level_band`, `level_id`, `topic_bands` (jsonb), `wrong_topics` (text[]), `xp_earned`, `created_at` (`src/pathwise/api.ts:113-131`, called from `src/routes/_app.quiz.tsx:209-221`).
- Not stored, though it sits in memory at that moment: the 8 answers with question id, chosen option, correct flag, topic and tier (`AdaptiveAnswer`, `adaptive-quiz.ts:31-37`), confidence, the placement sentence (`placementSummary`, `adaptive-quiz.ts:164-178`).
- Nothing is stored unless the student presses "Build my roadmap" (`_app.quiz.tsx:182-252`). Leaving the result screen loses the run.

**Enough for a tutor?** Partly. Band plus goal is useful. "Weak in Reasoning and Geometry" is a hint, not a diagnosis: the tutor cannot see which question was missed, at what tier, or how many questions the topic had. Storing the 8 answers fixes most of that for about an hour of work. Balanced topic coverage needs more questions.

---

## 4. Persistence and history

| Need | Today | Evidence |
|---|---|---|
| Every attempt stored | Yes, if "Build my roadmap" is pressed. Append-only, no unique key. | `pg_indexes`: only `diagnostic_results_pkey` and the guest-token index. |
| Per-topic detail | `topic_bands` and `wrong_topics` only. No per-question detail. | Section 3. |
| Linked to the student | **No, in practice.** Claims update 0 rows (section 2). The only link is `roadmaps.diagnostic_id`, and the roadmap claim does work. | `LoginModal.tsx:62-76`, `auth.tsx:261-284`, `auth.callback.tsx:48-56`. |
| Ordered as a history | `created_at` exists. No index on `user_id` (fine at this size). Nothing reads more than one row. | `getLatestDiagnostic` (`api.ts:138-149`) has no caller. |
| Retake keeps history | Rows are kept, but a retake can only be saved by building a new roadmap. There is no "retake only" save. | `_app.quiz.tsx:182-252`. |
| Survives email confirmation on another device | No. Ids live in the first browser's localStorage. `/confirm-email` claims nothing. | Agent 1, P1 "guest roadmap is lost". Confirmed: `src/routes/_app.confirm-email.tsx` has no claim call. |
| Survives account deletion correctly | No. Results become public guest rows. | `ON DELETE SET NULL`, section 2. |

Fix direction, using what already exists: write a `guest_token` (random uuid in localStorage) on every guest insert. Pass it in the sign-up metadata (`LoginModal.tsx:160-172` already sends `role`, `display_name` in `options.data`). Claim by token in `handle_new_user` (it already reads `raw_user_meta_data`) or in a re-enabled `claim_guest_roadmaps`. This works on any device, because the token travels with the account, not the browser. Then drop the anon "read all guest rows" policies.

---

## 5. Student profile: where the report would live

- **There is no student profile page or record.** Student nav is Roadmap, Find a tutor, Library, Sessions (`src/pathwise/Header.tsx:137-153`). No `/profile`, no student settings route. `profiles` is one row per user with tutor-heavy columns; the student-only column is `grade` (written by `_app.onboarding.student.tsx:30-33`, read nowhere).
- **After the result screen the student sees only the level name** on the roadmap's level card (Agent 1, P2). Score, topics, past attempts: never shown again.
- The tutor-quiz answers live in `user_learning_profiles` (subject, goal, learning style, pace, schedule, budget), one row per user, overwritten. Useful for a brief, but only saved when the student is signed in at the end of that quiz.

Smallest home for the report: a "Your level checks" panel on the roadmap's level card, plus one route `/progress` (or a tab on `/sessions`) listing attempts newest first. `diagnostic_results` already allows `SELECT` on `user_id = auth.uid()`, so this needs no new policy once claims work.

---

## 6. Trial booking flow and what the tutor sees

### What a booking carries
- Real tables: `sessions` (the booking), `session_state_history`, `notifications`, `message_threads` / `messages`, `tutor_students`, `lead_events`. There is no `bookings` or `trial_requests` table.
- `sessions` columns: `student_id`, `tutor_id`, `scheduled_start`, `scheduled_end`, `duration_minutes`, `timezone`, `session_type`, `amount`, `meeting_url`, `notes`, `rating`, `status_v2`, `payment_status`, `cancellation_reason`, `cancelled_by`, `actual_start`, `actual_end`. **No `subject`.** A tutor who teaches Math and English cannot tell which the trial is for.
- The booking page (`src/routes/_app.book.$tutorId.tsx`) defaults to `type = "trial"` (`:103`). Steps: Type, Time, Timezone, Summary, Pay (`:88`). It calls `book_session` (`:266-277`) with tutor, times, duration, timezone, type, amount, meeting URL, recurrence.
- Live `book_session` (SECURITY DEFINER) inserts those fields with `student_id = auth.uid()` and `status_v2 = 'scheduled'` (or `'confirmed'` for instant-booking tutors). It ignores the recurrence params. It never writes `notes`, subject, goal or level. No field for a message to the tutor.
- Trigger `notify_session_change` sends the tutor "New booking request: A student wants a session with you. Confirm it from the session page." with a link to `/sessions/<id>`. No student detail.

### What the tutor sees
- **Dashboard "Next up"** (`src/routes/dashboard.index.tsx:546-613`): avatar, name, `session_type · status` ("trial · scheduled"), time, Join / Message / Reschedule.
- **Session page** `/sessions/$id` (`src/routes/_app.sessions.$id.tsx`): student name and avatar (`:94-99`), timezone, type, duration, amount, payment (`:271-283`), state tracker, a **Confirm** button when `scheduled` (`:310-312`), Message, and a "Notes" block that shows "No notes yet." (`:400-405`). This is where the tutor accepts a trial. **The brief belongs here.**
- `dashboard.calendar.tsx` is only the availability editor (11 lines). `_app.sessions.index.tsx` lists sessions with type, status, amount and the other person's name.
- Messages: threads are created by `ensure_thread` from a "Message" button. Booking does not create a thread or post anything.
- `lead_events` has a "trial" stage in the dashboard funnel (`dashboard.index.tsx:620-625`), but the only writer is `/matches` (`_app.matches.tsx:293`). Bookings never write it.

### Already available to the tutor at zero cost
- `profiles` policy "Users can view people they work with" lets a tutor read a student's profile row once a session exists. That includes `grade`. Today the session page only selects `display_name, avatar_url`.

---

## 7. Access and privacy

### Today
- No policy on `diagnostic_results`, `roadmaps`, `roadmap_stages` or `user_learning_profiles` grants a tutor anything. Tutors see nothing, which is correct for now.
- The real exposure is the other way: guest rows (that is, nearly all results) are readable by anyone signed out (section 2).
- `sessions` "Participants can update sessions" lets both sides update any column. `guard_session_update` freezes only `amount`, `payment_status`, `student_id`, `tutor_id`. Any new consent or link column on `sessions` must be added to that guard, or the tutor could switch sharing on, or point the session at another diagnostic.

### What would let only the requested tutor see the results
Two options. I recommend the first.

**A. One read-only function (recommended).** `trial_brief(p_session_id uuid)`, SECURITY DEFINER, returns JSON. It checks, in order:
1. `auth.uid() = sessions.tutor_id` for that session.
2. `sessions.brief_shared = true` (the student's consent, set at booking).
3. The session is not `cancelled`.
4. The linked diagnostic's `user_id = sessions.student_id` and its `subject = sessions.subject`.

It returns the linked attempt and a short history (date, band, score) of the same student's attempts in that subject, plus `profiles.grade`. No table policy for tutors is added, so a tutor can never query `diagnostic_results` directly. Revoking consent is one update by the student. Grant execute to `authenticated` only.

**B. A row policy.** On `diagnostic_results`, for `authenticated`, `SELECT` where an un-cancelled `sessions` row exists with `tutor_id = auth.uid()`, `student_id = diagnostic_results.user_id`, `subject = diagnostic_results.subject` and `brief_shared`. It works, but it hands the tutor raw rows and every future column, and it opens all of that student's attempts in that subject for as long as any session exists.

### Consent
- Today nothing asks. The sign-up consent (`LoginModal.tsx:154-171`) covers terms and age only.
- Students may be minors. The sign-up asks for "18+ or a parent/guardian", and onboarding offers grades 6 to 12. Test results of a minor shared with a third party need a clear, per-tutor, revocable opt-in, worded for a parent too. Moldova's data law (Law 133/2011) follows GDPR principles. This is not legal advice: the owner should confirm the wording.
- Smallest consent model: a checkbox on the booking Summary step, "Share my level check with <tutor>", with a preview of exactly what is shared. Stored per session (`brief_shared`). The student can turn it off from the session page before the lesson.

---

## 8. Gap list

| # | Requirement | What exists | What's missing | Effort |
|---|---|---|---|---|
| 1 | Results are owned by the student | Roadmap claim works. Guest-token columns and `claim_guest_roadmaps` exist live. | Diagnostic claim updates 0 rows. No token is written. Email-confirm on another device loses everything. | M, 4-6 h |
| 2 | Results are private | Owner `SELECT` policy. | Anon reads every guest row; `roadmap_stages` readable by all; deleted accounts' results go public (`ON DELETE SET NULL`). Delete the Google-callback subject claim. | S, 2-3 h (with #1) |
| 3 | Gaps a tutor can act on | `topic_bands`, `wrong_topics`. | Per-question answers (id, topic, tier, correct) and `confidence` not stored. One miss = "weak". | S, 1-2 h |
| 4 | Strengths | Nothing. | A rule from `topic_bands` (topic at or above overall band, no miss) and a column or computed field. | S, 1 h |
| 5 | Even topic coverage | Staircase ignores topic. | Picker that rotates topics at the target tier; Math bank with every topic at tiers 1-5 (about 15 more questions). Topic names mapped to tutor subjects. | M, 8-12 h (mostly writing questions) |
| 6 | English | None ("Languages" is trivia). | English bank (grammar, vocabulary, reading, use of English; about 30-40 questions over 5 tiers), checked by an English teacher. | L, 15-20 h |
| 7 | Subjects match tutors | Quiz has 6 subjects; tutors pick from 40+ `subjects`. | Show only Mathematics and English in the level check; map tutor subjects to them. | S, 1-2 h |
| 8 | History on the student's profile | Rows are appended; owner can read them once claimed. | A "Your level checks" list; a retake that saves without forcing a new roadmap. | M, 4-6 h |
| 9 | Booking carries subject and the result | `book_session` RPC, `sessions` table. | `sessions.subject`, `sessions.diagnostic_id`, `sessions.brief_shared`; new RPC params; guard trigger covering them. | M, 3-4 h |
| 10 | Student consents | Nothing. | Checkbox and preview on the Summary step; "Stop sharing" on the session page. | S, 2-3 h |
| 11 | Only the requested tutor can read it | No tutor access at all. | `trial_brief(session_id)` function (section 7, option A). | M, 3-4 h |
| 12 | Tutor sees the brief on the request | Session page with Confirm; dashboard row. | "Level brief" block on `/sessions/$id`; one-line chip on "Next up"; mention in the booking notification. | M, 4-6 h |
| 13 | Booking requires a level check (if chosen) | Nothing. | A soft prompt on step 1, or a hard gate for trials. | S, 1-2 h |

First version (rows 1-4, 7-12, Math only): about 25-35 hours. Rows 5 and 6 (question writing) add 23-32 hours.

---

## 9. Sketch: the smallest "level brief on the trial request"

Description only. No code was changed.

### Data model
1. **`diagnostic_results`** (keep append-only; each row is one attempt):
   - add `answers jsonb`: the 8 `{question_id, topic, tier, correct}` objects already in memory at `_app.quiz.tsx:203`.
   - add `confidence real` from the existing `confidence()`.
   - add `strong_topics text[]`, computed at save time next to `wrong_topics`.
   - change the FK to `ON DELETE CASCADE`.
   - write `guest_token` for guests; drop the anon "read all guest rows" policy.
2. **`sessions`**: add `subject text`, `diagnostic_id uuid references diagnostic_results on delete set null`, `brief_shared boolean not null default false`. Add all three to `guard_session_update` so only the student can change `brief_shared`, and nobody can change `diagnostic_id` after insert.
3. **`book_session`**: three new optional params (`p_subject`, `p_diagnostic_id`, `p_share_brief`). It checks that the diagnostic belongs to `auth.uid()` and matches the subject.
4. **`trial_brief(p_session_id)`**: the read function from section 7. Returns:
   - `latest`: date, level and band label ("Builder, level 3 of 5: solid core, plugging gaps"), confidence (high/medium/low), goal, gaps (topic, the tier of the missed question), strengths.
   - `history`: earlier attempts in the same subject, as date and band.
   - `grade` from `profiles`.

No new tables. No tutor policy on `diagnostic_results`.

### UI
1. **Student, booking Summary step** (`_app.book.$tutorId.tsx`, step 3): a card "Your level check". If one exists for the tutor's subject: a preview of what the tutor will see, and a checkbox "Share it with <tutor> for this trial". If none: "Take the 8-question level check first (about 3 minutes)", with a link back to this booking, and "Book without it".
2. **Tutor, session page** (`_app.sessions.$id.tsx`, above "Notes"): "Level brief" block shown when `trial_brief` returns data. Level line, gaps as a short list with the tier, strengths, goal and grade, one line of history ("Spark on 12 Sep → Builder on 10 Oct"). If not shared: "The student didn't share a level check."
3. **Tutor, dashboard "Next up"**: one chip on trial rows, "Builder · gaps: Geometry".
4. **Student, roadmap level card**: "Your level checks" list, newest first, each row expanding into the per-topic view the result screen already renders (`_app.quiz.tsx:560-590`). A "Retake" button that saves a new attempt and asks whether to rebuild the roadmap.

Skipped on purpose: a student profile page for tutors, a tutor-wide student directory, AI-written summaries. Add them when tutors ask for more than the session view.

---

## 10. Decisions the owner must make

1. **What does the tutor see?**
   a) Level and goal only. b) Level, goal, gaps and strengths (recommended). c) All of b plus every question and answer.
2. **Does the student consent, and how?**
   a) Opt-in checkbox per booking, off by default (safest for minors). b) Opt-in, on by default with a clear preview (recommended; most students will want it shared). c) Always shared, stated in the terms.
3. **Latest attempt or full history?**
   a) Latest only. b) Latest in full plus a one-line history of earlier levels (recommended). c) Every attempt in full.
4. **Add English to the level check?**
   a) Yes, before launch; write a 30-40 question bank with an English teacher (recommended, since the landing page promises English). b) Later; until then hide "Languages" and send English learners straight to tutors with no brief.
5. **Which subjects stay in the level check?**
   a) Mathematics and English only (recommended). b) Keep all six.
6. **Does booking a trial require a level check?**
   a) No, but prompt for it on step 1 (recommended). b) Required for trials only. c) Required for every booking.
7. **What happens to guest results?**
   a) Keep guest level checks, claim them by token at sign-up, delete unclaimed rows after 30 days (recommended). b) Require an account before saving any result. c) Keep today's behaviour (not acceptable: nearly all results are public).
8. **Does a retake replace the roadmap?**
   a) Save the attempt only; offer "Rebuild my roadmap" as a separate choice (recommended). b) Always rebuild, as today.
9. **Confirm the diagnostic-claim finding.** Sign up after a guest level check, then check in the Supabase dashboard whether that `diagnostic_results` row has your `user_id`. If it is still null, section 2 is confirmed and row 1 of the gap list is urgent.
10. **What should a tutor be able to do with the brief after the trial?** a) Read-only, for that session (recommended). b) Keep seeing new attempts while the student books with them. Option b needs a standing consent, not a per-session one.

## 11. Owner decisions (2026-10-14)
1. Tutor sees level, gaps and strengths, plus a one-line history of earlier attempts.
2. Consent is an opt-in checkbox on the booking, ticked by default, with a preview.
3. All six subjects stay in the level check.
4. A level check is not required to book; booking step 1 prompts for it.
5. Guest results are claimed by a private token at sign-up, locked down, and deleted after 30 days if unclaimed.
6. Every retake is saved to the history; the roadmap is rebuilt only when the student asks.
7. Tutor access is standing: the tutor keeps seeing new attempts while the student books with them, and the student can revoke it.
8. A completed trial lesson, or any course in that subject and level band, unlocks the next roadmap stage.
