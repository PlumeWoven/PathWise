// Run with: node --test tests/roles.test.ts
// Uses Node's native TypeScript type-stripping (Node >= 22.6) so there is no
// build step or test-runner dependency to install.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeRole,
  isTutorSide,
  isStudentSide,
  isAdmin,
  roleHome,
  roleOnboarding,
  postAuthDestination,
  canAccess,
} from "../src/pathwise/roles.ts";

test("normalizeRole accepts the four valid roles", () => {
  assert.equal(normalizeRole("student"), "student");
  assert.equal(normalizeRole("tutor"), "tutor");
  assert.equal(normalizeRole("both"), "both");
  assert.equal(normalizeRole("admin"), "admin");
});

test("normalizeRole NEVER defaults unknown/missing input to a concrete role", () => {
  for (const bad of [null, undefined, "", "Student", "STUDENT", "teacher", 0, {}, []]) {
    assert.equal(normalizeRole(bad as unknown), null, `expected null for ${JSON.stringify(bad)}`);
  }
});

test("isTutorSide / isStudentSide treat 'both' as belonging to both sides", () => {
  assert.equal(isTutorSide("tutor"), true);
  assert.equal(isTutorSide("both"), true);
  assert.equal(isTutorSide("student"), false);
  assert.equal(isTutorSide(null), false);

  assert.equal(isStudentSide("student"), true);
  assert.equal(isStudentSide("both"), true);
  assert.equal(isStudentSide("tutor"), false);
  assert.equal(isStudentSide(null), false);
});

test("isAdmin reads app_metadata.role only", () => {
  assert.equal(isAdmin({ role: "admin" }), true);
  assert.equal(isAdmin({ role: "tutor" }), false);
  assert.equal(isAdmin({}), false);
  assert.equal(isAdmin(null), false);
  assert.equal(isAdmin(undefined), false);
});

test("roleHome routes each role to the correct landing", () => {
  assert.equal(roleHome("student"), "/roadmap");
  assert.equal(roleHome("tutor"), "/dashboard");
  assert.equal(roleHome("both"), "/dashboard");
  assert.equal(roleHome("admin"), "/admin");
  // Unknown role must not land on a student/tutor page.
  assert.equal(roleHome(null), "/");
});

test("roleOnboarding routes each role to the correct onboarding", () => {
  assert.equal(roleOnboarding("student"), "/onboarding/student");
  assert.equal(roleOnboarding("tutor"), "/onboarding/tutor");
  assert.equal(roleOnboarding("both"), "/onboarding/tutor");
  assert.equal(roleOnboarding(null), "/");
});

test("postAuthDestination picks onboarding vs home based on completion", () => {
  // Not onboarded → onboarding flow.
  assert.equal(postAuthDestination("tutor", false), "/onboarding/tutor");
  assert.equal(postAuthDestination("both", false), "/onboarding/tutor");
  assert.equal(postAuthDestination("student", false), "/onboarding/student");

  // Onboarded → role home.
  assert.equal(postAuthDestination("tutor", true), "/dashboard");
  assert.equal(postAuthDestination("both", true), "/dashboard");
  assert.equal(postAuthDestination("student", true), "/roadmap");

  // Regression guard: an unknown role is never sent to the student experience.
  assert.equal(postAuthDestination(null, true), "/");
  assert.equal(postAuthDestination(null, false), "/");
  assert.equal(postAuthDestination(undefined, true), "/");
});

test("canAccess: explicit role must be listed", () => {
  assert.equal(canAccess("student", ["student"]), true);
  assert.equal(canAccess("tutor", ["tutor"]), true);
  assert.equal(canAccess("student", ["tutor"]), false);
  assert.equal(canAccess("tutor", ["student"]), false);
});

test("canAccess: 'both' satisfies any student- or tutor-allowing gate", () => {
  assert.equal(canAccess("both", ["student"]), true);
  assert.equal(canAccess("both", ["tutor"]), true);
  assert.equal(canAccess("both", ["both"]), true);
  assert.equal(canAccess("both", ["student", "both"]), true);
  // An empty allow-list permits no one.
  assert.equal(canAccess("both", []), false);
});

test("canAccess: admin is a superuser; null is never allowed", () => {
  assert.equal(canAccess("admin", ["student"]), true);
  assert.equal(canAccess("admin", []), true);
  assert.equal(canAccess(null, ["student", "tutor", "both"]), false);
  assert.equal(canAccess(undefined, ["student"]), false);
});
