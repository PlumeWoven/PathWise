# Course Library — build spec

The library is a catalogue of every published course, shelved by **level band** and indexed by
**tutor**, open only to signed-in students who have taken the quiz. Its job is to put courses in
front of a student immediately after placement, rather than leaving them to find courses on their
own.

Status: **route and entry point built; the rest of this doc is the plan for what follows.**

---

## Where it sits

| | Route | Layout | Purpose |
|---|---|---|---|
| Roadmap | `/roadmap` — [`_app.roadmap.tsx`](../src/routes/_app.roadmap.tsx) | `_app` | The 5-stage journey. Entry point to the library. |
| **Library** | **`/library`** — [`_app.library.tsx`](../src/routes/_app.library.tsx) | `_app` | **Browse the whole shelf, by band.** |
| Course match | `/course-match` — [`_app.course-match.tsx`](../src/routes/_app.course-match.tsx) | `_app` | Pick *the* course for *one* stage, and enrol. |
| Course detail | `/courses/$slug` — [`_app.courses.$slug.tsx`](../src/routes/_app.courses.$slug.tsx) | `_app` | Public course page. |
| Tutor matches | `/matches` — [`_app.matches.tsx`](../src/routes/_app.matches.tsx) | `_app` | Matched tutors. |

**Why `_app` and not the dashboard shell.** `DashboardLayout` ([`dashboard.tsx`](../src/routes/dashboard.tsx))
wraps children in `DashboardShell` and gates on `isTutorSide(role)` — it is the *tutor* surface.
Every student page (`/roadmap`, `/matches`, `/course-match`) lives under the pathless `_app`
layout ([`_app.tsx`](../src/routes/_app.tsx)), which supplies `PWHeader` and nothing else. The
library follows the students. The dashboard is the model for *shape* — a sticky rail beside a
content grid — not for the route tree.

**Library vs course-match.** They are deliberately different tools and should not be merged:

- `/course-match` is **narrow and transactional**. Given `?roadmapId&stage`, it resolves that
  stage's `required_level_band` and shows only courses that satisfy it, tiered by
  `exact_matched` / `near_matched` / `exact_other`, with an enrol action.
- `/library` is **broad and exploratory**. It shows the whole subject catalogue with the bands
  above and below visible, so a student can stretch or consolidate. It links out to course pages;
  it does not enrol.

---

## Access — three layers

1. **Signed in.** `RoleGate allow={["student","both"]}`
   ([`RoleGate.tsx`](../src/pathwise/RoleGate.tsx)). Anonymous users get the login modal; a tutor
   who lands here gets the "not available for your account" screen.
2. **Has taken the quiz.** Enforced by requiring a `roadmaps` row for the user. A roadmap only
   exists post-quiz, so its presence *is* the quiz check. No roadmap → a screen pointing at
   `/quiz`. This is what makes the library "accessible to people that have taken the quiz".
3. **RLS.** `courses` is filtered to `status = 'published'` by the
   `Anyone can view published courses` policy, so drafts can never leak here.

> Layer 2 currently reads `roadmaps.level_band` and `roadmaps.subject`. Both were added by
> `20260729120000_course_level_matching.sql`.

---

## Entry points ("anchored in a few ways")

| Anchor | Where | State |
|---|---|---|
| **`▶ START HERE`** on the active roadmap stage | [`_app.roadmap.tsx`](../src/routes/_app.roadmap.tsx) → `handleStartHere(stage)` | **Built** |
| `🔒 Choose your course` on a gated stage | `_app.roadmap.tsx` → `goToCourseMatch(stage)` → `/course-match` | Existing, unchanged |
| Header nav link for students | [`Header.tsx`](../src/pathwise/Header.tsx) | To do |
| Post-quiz hand-off | [`_app.quiz.tsx`](../src/routes/_app.quiz.tsx) | To do |
| `Find my tutor` panel | [`MatchedTutorsPanel.tsx`](../src/pathwise/MatchedTutorsPanel.tsx) | To do |

### The Start Here button (built)

It previously found the already-active stage, wrote `status:'active'` back over itself — a no-op —
and opened the session-log modal. So the first thing a student saw after placement was a form
asking them to log a session for a course they had not picked yet.

It now deep-links into the library at the band the stage requires:

```
/library?subject=<Subject>&band=<1-5>&roadmapId=<uuid>&stage=<n>
```

Band resolution: `stage.required_level_band` when set, else the roadmap's `baseBand`, so roadmaps
created before course matching still land somewhere sensible. `e.stopPropagation()` is required —
the whole stage card is a click target that opens the stage modal.

---

## Data

All of it already exists; the library adds one query helper.

| Concern | Definition |
|---|---|
| Bands 1–5 | `BAND_META` in [`levels.ts`](../src/pathwise/levels.ts) — Seedling, Spark, Builder, Sharpshooter, Mastermind |
| A course's band | `courseBand(course)` — prefers `level_band`, falls back to `level_id`, then legacy `difficulty` |
| Subject fit | `courseMatchesSubject(course, subject)` — checks `subject`, `category`, `subcategory_tags` |
| Matched tutors | `getMatchedTutors(userId, subject)` in [`course-matching.ts`](../src/pathwise/course-matching.ts) — same scoring `/matches` shows |
| **Catalogue** | **`fetchLibraryCourses({ userId, subject })`** — new; published courses + band + tutor + `fromMatchedTutor` |
| **Shelving** | **`groupByBand(courses)`** — new; buckets 1–5 plus `open` for "All Levels" courses |

`fetchLibraryCourses` deliberately does **not** filter by band — seeing the shelves above and
below is the point. Band-less courses surface on every shelf, since "All Levels" fits any band.

### Schema touched

- `courses` — `level_band`, `level_id`, `status`, `tutor_id`, `slug`, `price`, `discount_price`
- `roadmaps` — `subject`, `level_band` (gate 2)
- `roadmap_stages` — `required_level_band` (band for the deep link)
- `user_learning_profiles` — read by `getMatchedTutors` for the tutor scoring

> ⚠️ `user_learning_profiles` is missing six columns the quiz writes. Until
> `20260801120000_fix_user_learning_profiles_columns.sql` is applied, `getMatchedTutors` falls
> back to subject-only scoring (`missingProfile: true`) and the ★ Your match markers will be
> sparse. The library still works — it just ranks less well.

---

## Still to build

1. **Header + post-quiz anchors** — the three entry points marked "To do" above.
2. **Subject switcher.** Today `subject` comes from the URL or the roadmap. Students with more
   than one subject need to switch shelves.
3. **Tutor index.** The user's framing is "it indexes the tutors and their courses" — a
   tutor-grouped view alongside the band-grouped one, reusing `getMatchedTutors`.
4. **Enrol from the library.** Currently cards link to `/courses/$slug`. Wiring
   `enrollInStageCourse` ([`api.ts`](../src/pathwise/api.ts)) needs a `roadmap_stage_id`, which
   only exists when the student arrived via `?stage=` — so it belongs behind that condition, and
   must respect `course_enrollments_active_stage_unique`.
5. **Search and sort** — by title, price, duration (`estimated_weeks`).
6. **Empty-catalogue state.** Only one published course exists in the live database today, so
   most shelves render empty. Worth seeding before judging the design.

## Verified

`npm run build` passes, 62/62 tests green, `tsc --noEmit` clean. `/library` returns 200, sets its
title, opens the login modal for anonymous visitors, and logs no console errors. The signed-in
path is untested — it needs a student account with a roadmap.
