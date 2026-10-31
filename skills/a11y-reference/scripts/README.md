# scan.mjs

Multi-route accessibility scanner using Playwright (Chromium) and `@axe-core/playwright`.

```bash
# Dependencies: in the project, or in a temp dir referenced by A11Y_SCAN_DEPS
DEPS=$(mktemp -d)
npm i --prefix "$DEPS" playwright @axe-core/playwright
npx --prefix "$DEPS" playwright install chromium

A11Y_SCAN_DEPS="$DEPS" node scan.mjs \
  --base-url http://localhost:5173 \
  --routes /,/login,/checkout \
  --checks keyboard,reflow \
  --out-dir "$DEPS/a11y-report"
```

Config file alternative (`a11y.config.json`):

```json
{
  "baseUrl": "http://localhost:5173",
  "routes": ["/", "/login", "/checkout"],
  "storageState": "/tmp/a11y-auth.json",
  "waitFor": "main",
  "checks": ["keyboard", "reflow"]
}
```

Outputs `results.json` (machine-readable) and `summary.md` (human-readable). Exit code `0` = no axe violations, `1` = violations, `2` = usage/runtime error (e.g. every route failed to load).

`--checks keyboard,reflow` are heuristics (missing focus style, focus possibly covered, horizontal scroll at 320px). They never change the exit code; confirm them manually.

Authenticated routes: create a Playwright `storageState` file with a login script that reads credentials from environment variables, pass it with `--storage-state`, and do not commit it.
