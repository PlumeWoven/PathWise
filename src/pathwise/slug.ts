// Slug helpers for course URLs.
//
// Deliberately dependency-free: `courses.ts` imports the Supabase client, which
// reads `import.meta.env` and throws when env vars are missing, so anything that
// lives there cannot be exercised by the bare `node --test` suite. Keeping these
// here is what makes them testable.

/**
 * Turn a human title into a URL-safe slug.
 *
 * Falls back to "course" rather than returning an empty string: `courses.slug`
 * is globally UNIQUE, and a run of empty slugs would collide with each other.
 */
export function slugify(title: string): string {
  const base = (title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    // Titles routinely carry trailing whitespace (the live "Trigonometry " row
    // is one), which would otherwise leave a dangling hyphen.
    .replace(/^-+|-+$/g, "");
  return base || "course";
}

/**
 * Slug for a freshly created draft.
 *
 * Every draft starts life with the same title, and the `set_course_slug` trigger
 * derives the slug from the title with no de-duplication — so letting the database
 * generate it makes every insert after the first collide with `courses_slug_key`
 * and fail with SQLSTATE 23505 (surfacing as an HTTP 409). Supplying our own slug
 * keeps the trigger's `IF NEW.slug IS NULL OR NEW.slug = ''` guard from firing.
 */
export function draftSlug(): string {
  return `untitled-course-${randomSuffix()}`;
}

/** 8 hex chars — short enough to stay readable in a URL, wide enough (2^32) to not collide. */
function randomSuffix(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}
