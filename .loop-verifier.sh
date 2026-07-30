#!/usr/bin/env bash
set -euo pipefail

BASELINE_ERRORS="${1:-5}"  # default: current pre-existing tsc errors
PASS=0
FAIL=1

echo "═══════════════════════════════════════════"
echo "  VERIFIER"
echo "═══════════════════════════════════════════"

# ── Check 1: tests pass ──
echo ""
echo "── [1/3] npm test ──"
if npm test 2>&1; then
  echo "  ✓ Tests pass"
  TESTS_PASS=true
else
  echo "  ✗ Tests FAILED"
  TESTS_PASS=false
fi

# ── Check 2: tests/ directory unchanged ──
echo ""
echo "── [2/3] tests/ directory unchanged ──"
if git diff --stat tests/ 2>&1 | grep -q .; then
  echo "  ✗ tests/ has been modified!"
  TESTS_CLEAN=false
else
  echo "  ✓ tests/ untouched"
  TESTS_CLEAN=true
fi

# ── Check 3: type errors not increased ──
echo ""
echo "── [3/3] TypeScript type errors ──"
TSC_OUTPUT=$(npx tsc --noEmit 2>&1 || true)
ERROR_COUNT=$(echo "$TSC_OUTPUT" | grep -c "error TS" || true)

echo "  Current error count: $ERROR_COUNT"
echo "  Baseline error count: $BASELINE_ERRORS"

if [ "$ERROR_COUNT" -le "$BASELINE_ERRORS" ]; then
  echo "  ✓ Type errors did not increase"
  TYPES_OK=true
else
  echo "  ✗ Type errors INCREASED (new errors introduced)"
  TYPES_OK=false
fi

# ── Final verdict ──
echo ""
echo "═══════════════════════════════════════════"
if [ "$TESTS_PASS" = true ] && [ "$TESTS_CLEAN" = true ] && [ "$TYPES_OK" = true ]; then
  echo "  RESULT: PASS ✓"
  exit 0
else
  echo "  RESULT: FAIL ✗"
  exit 1
fi
