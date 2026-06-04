# Course Management System

A complete tutor course CMS at `/tutor/courses` with list, multi-step wizard editor, public student view, and admin review.

## 1. Database (single migration)

Extend `courses` table and add `course_sections` + `course_lessons`.

**Extend `courses`** (existing has: id, tutor_id, title, subject, level, description, file_url, status, metadata, thumbnail_url, trailer_url, subtitle_url, category, hourly_rate, created_at, updated_at):

Add columns: `subtitle text`, `subcategory_tags text[]`, `difficulty text`, `language text`, `learning_outcomes text[]`, `prerequisites text[]`, `target_audience text[]`, `estimated_weeks int`, `price numeric`, `currency text default 'MDL'`, `discount_price numeric`, `discount_expiry timestamptz`, `certificate_enabled boolean default false`, `seo_title text`, `seo_description text`, `slug text unique`.

Status values: `draft | published | under_review | archived` (text, no enum change).

**`course_sections`**: id, course_id (fk), title, position int, created_at.

**`course_lessons`**: id, section_id (fk), course_id (fk), title, description, video_url, duration_minutes int, is_free_preview bool, position int, resources jsonb default '[]', created_at.

**RLS**:
- Sections/lessons: tutor (course owner) full CRUD; public read where parent course `status='published'`; lessons additionally readable when `is_free_preview=true` regardless of status.
- Courses: keep existing tutor-owns policies; public read already covers published.
- Admin role check via existing `get_user_role` for `under_review` visibility.

**Slug**: trigger to auto-generate from title on insert if null + ensure unique by appending short suffix.

## 2. Routes (file-based)

```
src/routes/
  tutor.courses.index.tsx          // list page
  tutor.courses.new.tsx             // already exists → repurpose to redirect into wizard or rewrite
  tutor.courses.$courseId.edit.tsx  // wizard editor
  courses.$slug.tsx                 // public student view
  admin.review.tsx                  // admin queue (simple list of under_review)
```

Tutor routes gated by role check (existing pattern via `RoleGate`/profile.role==='tutor'). Editor checks `tutor_id === auth.uid()`.

## 3. Course List (`/tutor/courses`)

- Header: "My Courses", count, "+ New Course" button → creates draft row then navigates to `/tutor/courses/{id}/edit`.
- Filter tabs: All / Published / Drafts / Under Review (client-side filter on fetched list).
- Grid of glassmorphic cards: thumbnail (placeholder gradient if none), title, status badge (color per status), student count (count of distinct sessions.student_id where course_id=...), last updated, price.
- Quick actions per card: Edit (link), Preview (open `/courses/{slug}` in new tab), Delete (AlertDialog confirm).
- Empty state: simple SVG illustration + CTA.

## 4. Wizard Editor (`/tutor/courses/{id}/edit`)

Single component with 5 steps, top progress bar, step nav (Back/Next), persistent draft.

**Persistence**:
- Local state hydrated from DB row on mount.
- `localStorage` key `course-draft-{id}` mirrors form on every change (instant).
- Auto-save to DB every 30s if dirty; "Saved · 2s ago" indicator. Manual Save button always available.

**Step 1 — Basic Info**: title (120), subtitle (80), category (select from `subjects`), subcategory_tags (chip multi-input), difficulty (4 radio cards), language (select), thumbnail upload to `course-assets` bucket (drag/drop, preview). Skip crop tool — use object-cover preview at 16:9.

**Step 2 — Content**: sections list with drag-handle (use `@dnd-kit/sortable` — already may need install). Each section: inline title edit, "Add Lesson" → lesson card (title, video URL or upload to `course-assets`, description textarea, duration mins, free-preview switch, expandable Resources list — array of `{type:'pdf'|'link'|'snippet', label, value}`). Total duration shown in header.

**Step 3 — Description & Details**: rich text via simple `contentEditable` toolbar (bold/italic/H2/H3/UL/OL) — avoid heavy tiptap install; store as HTML. "What you'll learn" repeater (3-10), prerequisites tag input, target_audience checkboxes, estimated_weeks number.

**Step 4 — Pricing & Settings**: price + currency toggle (MDL/USD), discount_price + expiry, certificate switch, SEO fields, slug (auto from title, editable).

**Step 5 — Review & Publish**: read-only preview rendered with same component as public page. Validation checklist (title, category, thumbnail, ≥1 section with ≥1 lesson, description, ≥3 outcomes, price). "Save Draft" / "Submit for Review" buttons. Confetti-ish success toast on submit.

## 5. Public Course Page (`/courses/{slug}`)

Hero (thumbnail, title, subtitle, tutor info, price, Enroll CTA → existing booking flow with `course_id` param), tabs: Overview (description, outcomes, prereqs, audience), Curriculum (collapsible sections, lessons with free-preview play badge), Reviews (existing reviews table filtered by tutor).

`head()` populated from seo_title/seo_description, og:image=thumbnail_url.

## 6. Admin Review (`/admin.review.tsx`)

List courses where status='under_review'. Approve → 'published'. Reject → 'draft' with note. Gated by `get_user_role(auth.uid())='admin'`.

## Technical Notes

- New file: `src/pathwise/courses.ts` — typed CRUD helpers (createDraft, updateCourse, listMyCourses, getCourseFull, upsertSection, upsertLesson, deleteSection, deleteLesson, reorderSections, reorderLessons, publishForReview).
- Reuse existing `course-assets` storage bucket (already public).
- Install `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop curriculum.
- All UI uses existing glassmorphic tokens (`pw-surface-2`, `pw-border`, etc.) seen in `CourseCard.tsx`.
- Mobile: wizard step header collapses, content stacks; curriculum drag still works via touch sensors.

## Out of Scope (explicit)

- Real video transcoding / streaming (just store URL).
- Image cropping UI (use natural upload + object-cover).
- Payments capture for course purchase (booking flow already separate).
- Rich tiptap editor — using lightweight contentEditable toolbar instead.

Approve to proceed; on approval I'll run the migration first, then build the routes and helpers.
