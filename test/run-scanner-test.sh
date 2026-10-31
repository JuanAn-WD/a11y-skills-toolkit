#!/usr/bin/env bash
# Smoke test: serve test/fixtures/site, run scan.mjs, expect known violations and exit code 1.
# Installs Playwright + @axe-core/playwright into a temp dir unless A11Y_SCAN_DEPS is set.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-4321}"
DEPS="${A11Y_SCAN_DEPS:-}"
if [ -z "$DEPS" ]; then
  DEPS="$(mktemp -d)"
  npm i --silent --prefix "$DEPS" playwright @axe-core/playwright
  npx --prefix "$DEPS" playwright install chromium
fi
OUT="$(mktemp -d)"
python3 -m http.server "$PORT" --directory "$ROOT/test/fixtures/site" >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
for _ in $(seq 1 30); do curl -sf "http://localhost:$PORT/" >/dev/null && break; sleep 0.5; done

set +e
A11Y_SCAN_DEPS="$DEPS" node "$ROOT/skills/a11y-reference/scripts/scan.mjs" \
  --base-url "http://localhost:$PORT" --routes /,/form.html,/clean.html \
  --checks keyboard,reflow --out-dir "$OUT" >/dev/null
CODE=$?
set -e

fail() { echo "FAIL: $1"; exit 1; }
[ "$CODE" -eq 1 ] || fail "expected exit code 1, got $CODE"
for rule in image-alt button-name color-contrast html-has-lang target-size autocomplete-valid; do
  grep -q "\"id\": \"$rule\"" "$OUT/results.json" || fail "expected rule $rule"
done
node -e '
const r = require(process.argv[1]);
const by = Object.fromEntries(r.routes.map(x => [x.route, x]));
if (by["/clean.html"].violations.length) throw new Error("clean.html should have 0 violations");
if (!by["/"].reflow.horizontalScrollAt320) throw new Error("expected reflow flag on /");
if (by["/"].keyboard.noVisibleFocusStyle.length < 1) throw new Error("expected focus-style flag on /");
' "$OUT/results.json" || fail "results.json assertions"
echo "PASS: scanner detected expected violations (report: $OUT)"
