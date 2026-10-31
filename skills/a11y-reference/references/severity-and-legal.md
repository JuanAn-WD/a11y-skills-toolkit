# Severity model and legal context

## Severity

| Severity | Definition | Examples |
| --- | --- | --- |
| Critical | Blocks a critical user journey for some users: they cannot complete login, sign-up, checkout/payment, a required form, or reach primary navigation. | Pay button not keyboard operable; modal with no way out by keyboard; form errors not announced and fields unlabeled. |
| Serious | Major barrier or significant extra effort, but a workaround exists, or it affects important but non-critical content. | Low contrast body text; focus invisible on main nav; images of key information without alt. |
| Moderate | Noticeable barrier on secondary content or partial failure. | Small targets in a footer; inconsistent help placement. |
| Minor | Low impact, cosmetic or rare. | Decorative image announced; redundant labels. |

axe-core's `impact` (critical/serious/moderate/minor) is a rule-level hint, not the journey impact. Re-rate it: an axe "serious" issue on the checkout button can be Critical; an axe "critical" issue on an unused admin page can be lower.

## Legal context (status checked October 2026; re-check if this is more than six months old)

Use this wording; do not add legal conclusions.

- The European Accessibility Act (Directive (EU) 2019/882) has applied to in-scope products and services since **28 June 2025**.
- Conformity with harmonised standards cited in the Official Journal of the EU gives a presumption of conformity. For web content, the relevant standard is **EN 301 549**.
- The version currently cited (EN 301 549 **V3.2.1**, 2021) references **WCAG 2.1 Level AA** for web content (plus additional requirements beyond WCAG).
- **EN 301 549 V4.1.1** was published in September 2026 and aligns web, document and software requirements with **WCAG 2.2**. It becomes the legal reference only once the European Commission cites it in the Official Journal (expected around December 2026 at the time of writing).
- WCAG 2.2 AA is a superset of WCAG 2.1 AA (except the obsolete 4.1.1 Parsing). Targeting 2.2 AA therefore covers the 2.1 AA web baseline and prepares for the updated standard, but meeting WCAG alone does not cover every EN 301 549 or EAA requirement (e.g. documentation, support services, non-web ICT).

Sources: European Commission, Web Accessibility Directive - Standards and harmonisation (digital-strategy.ec.europa.eu); AccessibleEU, "The European accessibility standard EN 301 549 has been updated" (7 Sep 2026); ETSI EN 301 549 V4.1.1 (2026-09).

## Disclaimer (append to every audit report)

> Automated tools detect only part of WCAG failures. This report is a technical assessment, not legal advice, a legal opinion, or a conformance certification. For compliance decisions under the EAA or national law, consult a qualified legal or accessibility professional.
