# Audit report format

Use this structure for every a11y-auditor report. Reply in the user's language; keep criterion numbers and rule ids as-is.

## Allowed verdict wording

Pick exactly one:

- "**N automated failures** across R routes (S critical). M criteria require manual verification."
- "**No automated failures detected** on R routes. M criteria require manual verification; this is not a conformance claim."
- "**Static review only** (no runtime available). Findings are based on source code; runtime criteria are Not tested."

Forbidden: "Conforms to WCAG 2.2 AA", "Cumple AA", "100% accessible", "EAA compliant", any score presented as conformance.

## Template

```markdown
# Accessibility audit - <project> - <YYYY-MM-DD>

## Scope and method
- Target: <app / routes / component>; assumption: <if scope was defaulted>
- Routes (R): / , /login , /checkout  (discovered from: <router config | sitemap | crawl | user>)
- Standard: WCAG 2.2 Level A + AA
- Tools: @axe-core/playwright <version> (axe-core <version>), Playwright <version>, Chromium <version>; manual keyboard, focus and 320px reflow checks
- Not tested: <routes or criteria and why, e.g. "/account - authentication required">

## Verdict
<one allowed verdict line>

## Findings
| ID | Severity | WCAG SC | Status | Route | Element | Evidence | Suggested fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F1 | Critical | 2.1.1 Keyboard | Fail | /checkout | `div.pay-btn` | Not reachable with Tab (manual) | Use `<button>` |
| F2 | Serious | 1.4.3 Contrast (Minimum) | Fail | / | `.hero p` | axe `color-contrast`: 2.9:1 (needs 4.5:1) | Use token `--gray-700` (7.1:1) |

## Criteria status
| SC | Name | Status | Evidence |
| --- | --- | --- | --- |
| 1.1.1 | Non-text Content | Fail | F3 |
| 2.4.11 | Focus Not Obscured (Minimum) | Pass | Manual Tab pass on /, /login with sticky header |
| 1.2.2 | Captions (Prerecorded) | Not applicable | No video content |
| 3.3.8 | Accessible Authentication (Minimum) | Not tested | Login requires credentials not provided |

## Best practice (not WCAG failures)
- Heading levels skip from h2 to h4 on /blog.

## Next steps
- Fix F1-F2 with a11y-implementer, then re-scan the same routes.
- Add `tests/a11y.spec.ts` regression test for / , /login , /checkout.

## Cleanup
- Stopped dev server (PID 12345) started by this audit; removed temp deps folder.

---
Automated tools detect only part of WCAG failures. This report is a technical assessment, not a legal opinion or a conformance certification.
```

## Status rules

- **Pass**: evidence exists for this criterion (relevant axe rules passed AND the manual check, where one is needed, was performed).
- **Fail**: at least one confirmed failure; link the finding IDs.
- **Not tested**: could not be evaluated (no runtime, auth, needs content owner, out of time). Always give the reason.
- **Not applicable**: no content of that type in scope (e.g. no media for 1.2.x).
- axe "incomplete" (needs review) results are never Pass; verify manually or mark Not tested.
