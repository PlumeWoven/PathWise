# Improvement Loop — Program (Run 2, score-driven)

Goal: Maximize SCORE = tests_pass − tsc_errors − lint_real_errors, where lint_real_errors counts ESLint problems in src/ excluding the prettier/prettier formatting rule. Higher is better.

Allowed: edit files under src/ only. Loop bookkeeping (program.md, experiments.md) at repo root may be written for metadata only.
Forbidden: tests/, package.json, tsconfig.json, eslint.config.js, package-lock.json, bun.lockb, vite.config.ts, .loop-verifier.sh, any config/migration file. No new dependencies. No `npm run format` (prettier noise is excluded from the score on purpose). Do not weaken the verifier.

Constraints:
- Keep src/pathwise/roles.ts API/behavior identical (it backs tests/roles.test.ts).
- Never delete or alter a test.
- Each change is hypothesis-driven and minimal.
- Every change is reversible; revert if the score does not improve or tests break.

Verifier (run from repo root; add `sleep 2` before tsc when a route file was edited so routeTree.gen.ts settles):
  TOUT=$(node --test tests/*.test.ts 2>&1)
  TPASS=$(echo "$TOUT" | grep "pass " | grep -oE "[0-9]+" | head -1)
  TFAIL=$(echo "$TOUT" | grep "fail " | grep -oE "[0-9]+" | head -1)
  TSC=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
  LINT=$(npx eslint src --max-warnings=-1 < /dev/null 2>&1 | grep -E "error|warning" | grep -vc "prettier/prettier")
  SCORE=$(( TPASS - TSC - LINT ))
Hard gate: tests_fail>0 or tests_pass<10 → revert regardless of score.

Baseline (cycle 0): tests_pass=10, tests_fail=0, tsc_errors=5, lint_real=140, SCORE=−135.
  tsc errors in: _app.courses.$slug.tsx, _app.onboarding.student.tsx, _app.tutor.courses.$courseId.edit.tsx, dashboard.calendar.tsx.
  lint_real: 106 no-explicit-any, 18 react-refresh/only-export-components, 6 no-empty, 4 prefer-const, 3 react-hooks/exhaustive-deps, 1 ban-ts-comment.

Done when: 10 cycles completed.
Stop early if: 3 consecutive cycles with no score improvement.
After each cycle: append cycle number, hypothesis, change, result, kept/reverted, lesson to experiments.md (Run 2 section). Do not repeat a failed experiment unless there is a specific reason the outcome would differ.
