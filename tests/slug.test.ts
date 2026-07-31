// Run with: node --test tests/slug.test.ts
// Uses Node's native TypeScript type-stripping (Node >= 22.6) so there is no
// build step or test-runner dependency to install.
import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, draftSlug } from "../src/pathwise/slug.ts";

test("draftSlug produces the expected shape", () => {
  assert.match(draftSlug(), /^untitled-course-[0-9a-f]{8}$/);
});

test("draftSlug never repeats itself", () => {
  // The bug this guards: courses.slug is globally UNIQUE and every draft shares
  // the same title, so a non-unique suffix means a 409 on the second course.
  const seen = new Set<string>();
  for (let i = 0; i < 1000; i++) seen.add(draftSlug());
  assert.equal(seen.size, 1000);
});

test("slugify lowercases and collapses punctuation to single hyphens", () => {
  assert.equal(slugify("Intro to Algebra"), "intro-to-algebra");
  assert.equal(slugify("C++ & Data Structures!"), "c-data-structures");
  assert.equal(slugify("Already-Slugged"), "already-slugged");
});

test("slugify strips leading and trailing hyphens", () => {
  // The live database has a published row titled "Trigonometry " (trailing space).
  assert.equal(slugify("Trigonometry "), "trigonometry");
  assert.equal(slugify("  spaced  out  "), "spaced-out");
  assert.equal(slugify("---dashes---"), "dashes");
});

test("slugify never returns an empty string", () => {
  // An empty slug would collide with every other empty slug on the UNIQUE index.
  for (const input of ["", "   ", "!!!", "---", "?!@#$%"]) {
    assert.equal(slugify(input), "course", `input: ${JSON.stringify(input)}`);
  }
});

test("slugify handles non-ASCII titles without producing an empty slug", () => {
  // Romanian/Cyrillic titles are realistic here; they strip to nothing, so the
  // fallback is what keeps them insertable.
  assert.equal(slugify("Матанализ"), "course");
  assert.equal(slugify("Analiză 2"), "analiz-2");
});
