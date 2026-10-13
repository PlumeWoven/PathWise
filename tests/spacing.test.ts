// Run with: node --test tests/spacing.test.ts
// The one spacing rule: every margin, padding and gap is 0 or a step of an 8px grid —
// 8, 16, 24, 32, 48, 64, 96 or 128px (Tailwind 2, 4, 6, 8, 12, 16, 24, 32) — in class
// names and in the component styles in src/styles.css. This test fails on anything else,
// so the rule holds as the code changes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ALLOWED = new Set(["0", "2", "4", "6", "8", "12", "16", "24", "32", "px"]);

// Not spacing between elements, so outside the rule:
const EXCEPTIONS = new Set([
  "p-[1px]", // scroll-area thumb hairline
  "-mb-[2.7vw]", // landing footer wordmark: offset scales with its vw-sized lettering
  "md:-mb-[4.5vw]",
  "-ml-[0.1875rem]", // PortalHero dots: half of their own 6px size, to centre them
  "-mt-[0.1875rem]",
]);

const UTIL =
  /(?<![\w\-[/])((?:[\w\-[\]&_:.()*>~+@='"/%]+:)*)(!?)(-?)(p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-(\d+(?:\.\d+)?|px|\[[^\]\s]+\])(?![\w.\-[])/g;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

test("every spacing utility in src is on the 8px grid", () => {
  const offGrid: string[] = [];
  for (const file of files("src")) {
    for (const m of readFileSync(file, "utf8").matchAll(UTIL)) {
      const [whole, , , , , value] = m;
      if (ALLOWED.has(value) || EXCEPTIONS.has(whole)) continue;
      offGrid.push(`${file}: ${whole}`);
    }
  }
  assert.deepEqual(offGrid, [], `off-grid spacing:\n${offGrid.join("\n")}`);
});

test("component styles in styles.css use the same 8px grid", () => {
  const css = readFileSync("src/styles.css", "utf8");
  const offGrid: string[] = [];
  for (const m of css.matchAll(/^\s*(padding|margin|gap|row-gap|column-gap)[a-z-]*:\s*([^;]+);/gm)) {
    for (const v of m[2].trim().split(/\s+/)) {
      if (v === "0" || v === "auto") continue;
      const rem = v.match(/^(-?\d*\.?\d+)rem$/);
      const px = rem ? Number(rem[1]) * 16 : NaN;
      if (!Number.isFinite(px) || px % 8 !== 0) offGrid.push(`${m[0].trim()}`);
    }
  }
  assert.deepEqual(offGrid, [], `off-grid spacing in styles.css:\n${offGrid.join("\n")}`);
});

test("the root font size never steps with screen width", () => {
  const css = readFileSync("src/styles.css", "utf8");
  assert.doesNotMatch(css, /html\s*\{\s*font-size:\s*\d+%/);
});
