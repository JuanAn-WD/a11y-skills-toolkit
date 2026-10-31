# a11y-skills-toolkit

[Español](README.es.md)

Agent skills for **frontend accessibility** in Claude Code, Cursor and Codex. They don't stop at a list of problems. They run the whole loop:

**audit real routes → fix in your existing stack → re-scan to prove the fix → add a Playwright + axe regression test for CI**

> **Repository:** [JuanAn-WD/a11y-skills-toolkit](https://github.com/JuanAn-WD/a11y-skills-toolkit).

## Install (one command)

```bash
npx skills add JuanAn-WD/a11y-skills-toolkit -a claude-code -a cursor -a codex
```

This uses the open-source [`skills` CLI](https://github.com/vercel-labs/skills). It copies **all three skill folders** (with their `references/`, `scripts/` and `assets/`) into `.agents/skills/` (used by Cursor and Codex) and links them into `.claude/skills/` (Claude Code). Add `-g` to install for your user instead of the current project. Install all three skills together: the auditor and the implementer read the shared files in `a11y-reference`.

Other install methods (plugins, manual copy) are [further down](#other-install-methods).

## What's inside

| Skill | Use it when | What it does |
| --- | --- | --- |
| `a11y-auditor` | "Audit this app for accessibility", "Is this page WCAG 2.2 AA?" | **Read-only.** Detects the stack, starts (or reuses) the dev server, finds the real routes, scans them with Playwright + axe-core, runs keyboard, zoom and reflow checks, writes a report with Pass / Fail / Not tested per criterion and evidence, then stops any server it started. Never edits code. |
| `a11y-implementer` | "Fix these accessibility issues", "Build an accessible modal" | Builds or fixes components in the stack you already use (React/Next, Vue/Nuxt, Angular, Svelte, Tailwind, plain HTML). Uses native HTML before ARIA, keeps your design, re-scans to prove each fix, and offers a regression test. |
| `a11y-reference` | Questions about WCAG criteria, ARIA patterns, report wording, legal context | Shared knowledge and tools: WCAG 2.2 AA checklist (which criteria automation can and can't check), ARIA patterns, report format, severity and dated legal notes, the multi-route scanner `scan.mjs`, and the test template `a11y.spec.ts`. |

### How it reports

- No blanket "Conforms to AA". Every criterion gets **Pass**, **Fail** or **Not tested**, with evidence (rule id, selector, route, or the manual step done).
- Automated tools find only part of WCAG failures, so a clean scan reads: *"No automated failures detected; N criteria require manual verification."*
- One engine (axe-core via `@axe-core/playwright`). Lighthouse's accessibility audit also uses axe-core, so running both doesn't double your coverage. The skills don't add their results together.
- Best practices (such as skipped heading levels) are labelled as best practice, not as WCAG failures.

## The scanner

`skills/a11y-reference/scripts/scan.mjs` is a Node ESM script that scans many routes in one run:

```bash
DEPS=$(mktemp -d)
npm i --prefix "$DEPS" playwright @axe-core/playwright
npx --prefix "$DEPS" playwright install chromium

A11Y_SCAN_DEPS="$DEPS" node skills/a11y-reference/scripts/scan.mjs \
  --base-url http://localhost:5173 --routes /,/login,/checkout \
  --checks keyboard,reflow --out-dir "$DEPS/a11y-report"
```

- Routes can come from `--routes` or a JSON `--config`. Use `--storage-state` for logged-in pages; credentials come from env vars and are never written into files.
- It writes `results.json` and `summary.md`. Exit code `0` means no violations, `1` means violations were found, `2` means a usage or runtime error.
- `--checks keyboard,reflow` adds heuristics: no visible focus style, focus possibly covered by other content, and horizontal scroll at 320 px. They are marked "needs review" and don't change the exit code.
- Dependencies are installed in a temp folder, so your project's `package.json` stays untouched.

Details: [`skills/a11y-reference/scripts/README.md`](skills/a11y-reference/scripts/README.md).

## Regression test in CI

`skills/a11y-reference/assets/tests/a11y.spec.ts` is a Playwright test template using `@axe-core/playwright`. It has a list of routes, examples for interactive states (an open dialog and focus return) and a focus-indicator check. [`examples/github-actions/a11y.yml`](examples/github-actions/a11y.yml) runs it on every pull request.

## Comparison

| | Generic "check accessibility" prompt | Formal conformance-audit skill sets | **a11y-skills-toolkit** |
| --- | --- | --- | --- |
| Main goal | Quick advice | Thorough, criterion-by-criterion conformance review | Fix and verify loop in the codebase |
| Scans the running app | Rarely | Varies | Yes: multi-route Playwright + axe, auth via storageState |
| Edits code | Ad hoc | Usually not the focus | Yes, in a separate skill (`a11y-implementer`); the auditor is read-only |
| Proves the fix | No | Not the focus | Re-scans the same routes after fixing |
| Leaves a CI test | No | Not the focus | Playwright + axe template and GitHub Actions example |
| Honest verdicts | Often "looks compliant" | Yes | Pass / Fail / Not tested per criterion, no blanket claims |

To be fair: projects such as [masuP9/a11y-specialist-skills](https://github.com/masuP9/a11y-specialist-skills) put more depth into formal conformance auditing and review. If a full audit report is what you need, look at them. This toolkit is narrower on purpose: find, fix, prove, and stop regressions. The two approaches work fine together.

## Legal context (not legal advice)

The European Accessibility Act has applied since 28 June 2025. The harmonised standard currently cited for it, EN 301 549 V3.2.1, refers to WCAG 2.1 AA. EN 301 549 V4.1.1 (aligned with WCAG 2.2) was published in 2026, but it is not legally cited yet; citation in the EU Official Journal is expected later. Checked October 2026; see [`severity-and-legal.md`](skills/a11y-reference/references/severity-and-legal.md) for sources. The skills target WCAG 2.2 AA, which also covers 2.1 AA.

**Disclaimer:** these skills and their reports are engineering aids, not legal advice or a conformance certification. Automated checks find only part of accessibility barriers. Testing with disabled users and assistive technology is still needed.

## Other install methods

Install **all three folders**. The auditor and the implementer find the shared files at `../a11y-reference/`, so it has to sit next to them. If it's missing, they warn you once and fall back to static review without the scanner.

### Claude Code

Plugin (all three skills):

```text
/plugin marketplace add JuanAn-WD/a11y-skills-toolkit
/plugin install a11y-skills-toolkit@a11y-skills-toolkit
```

Manual: copy `skills/a11y-auditor`, `skills/a11y-implementer` and `skills/a11y-reference` into `.claude/skills/` (project) or `~/.claude/skills/` (user).

### Codex

Plugin: this repo has a marketplace at `.agents/plugins/marketplace.json` and a plugin manifest at `plugin.json`.

```bash
codex plugin marketplace add JuanAn-WD/a11y-skills-toolkit
```

Then install `a11y-skills-toolkit` from `/plugins`.

Manual: copy the three folders into `.agents/skills/` (repo) or `~/.agents/skills/` (user).

### Cursor

Copy the three folders into `.cursor/skills/` or `.agents/skills/` (project), or `~/.cursor/skills/` (user). Cursor also loads skills from `.claude/skills/` and `.codex/skills/`.

As a local plugin (the repo root has an Agent Plugins `plugin.json`): clone it to `~/.cursor/plugins/local/a11y-skills-toolkit` and restart Cursor. Teams can import the repo into a team marketplace.

`.cursorrules` is a legacy format. These skills don't use it.

### Manual, any agent

```bash
git clone https://github.com/JuanAn-WD/a11y-skills-toolkit /tmp/a11y-skills-toolkit
mkdir -p .agents/skills && cp -R /tmp/a11y-skills-toolkit/skills/. .agents/skills/
```

## Development

```bash
npm run validate       # checks SKILL.md frontmatter (name, description) and referenced paths
npm run test:scanner   # serves test/fixtures/site and checks that the scanner finds the planted violations
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CHANGELOG.md](CHANGELOG.md). License: [MIT](LICENSE).
