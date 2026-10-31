# Changelog

All notable changes to this project are documented here. Format based on Keep a Changelog; versions follow SemVer.

## [0.1.0] - 2026-10-31

### Added
- `a11y-auditor` skill: read-only WCAG 2.2 AA audit of real routes (dev server lifecycle, route discovery, auth via storageState, keyboard/zoom/reflow checks, per-criterion Pass / Fail / Not tested report).
- `a11y-implementer` skill: stack-aware fixes (React/Next, Vue/Nuxt, Angular, Svelte, Tailwind, plain HTML), native HTML before ARIA, fix-then-re-scan loop, regression test hand-off.
- `a11y-reference` skill: WCAG 2.2 AA checklist, ARIA patterns, report format, severity and dated legal context, multi-route scanner (`scan.mjs`), Playwright test template.
- Plugin manifests for Claude Code (`.claude-plugin/`), Codex and Cursor (`plugin.json`, `.agents/plugins/marketplace.json`).
- Skill validator, scanner smoke test with deliberately broken fixtures, example GitHub Actions workflow.
- Evolved from the earlier single-file `a11y-frontend-auditor` skill.
