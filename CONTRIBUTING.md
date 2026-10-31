# Contributing

Thanks for helping. Keep changes small and verifiable.

- **Skills** live in `skills/<name>/SKILL.md`. Frontmatter must have `name` (same as the folder, kebab-case) and `description` (max 1024 chars). Keep each SKILL.md focused; put long material in `skills/a11y-reference/references/`.
- **Accuracy over confidence.** Cite the WCAG success criterion for every rule. Do not add claims of conformance, legal compliance or detection rates that you cannot source. Legal text must carry a date and a source.
- **No secrets.** Never add credentials, tokens or storageState files, including in examples.
- **Before opening a PR**, run:

  ```bash
  npm run validate        # frontmatter and referenced paths
  npm run test:scanner    # needs Node 18+, Python 3 and network to install Playwright in a temp dir
  ```

- If you change the scanner output, update `test/run-scanner-test.sh` and `skills/a11y-reference/scripts/README.md`.
- Add a line to `CHANGELOG.md`.
