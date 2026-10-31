/**
 * Accessibility regression test (template).
 * Requires: @playwright/test, @axe-core/playwright (devDependencies).
 * Adapt ROUTES and the interaction steps, set baseURL in playwright.config.ts
 * (or A11Y_BASE_URL), and run: npx playwright test tests/a11y.spec.ts
 *
 * Passing this test means "no automated axe violations for these states".
 * It does not prove WCAG conformance; keep manual checks in your process.
 */
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// Routes that must stay free of automated violations.
const ROUTES: string[] = ['/', '/login'];

// Known, tracked exceptions (rule ids). Keep this empty if you can; link each to an issue.
const DISABLED_RULES: string[] = [];

const base = process.env.A11Y_BASE_URL;
const url = (route: string) => (base ? new URL(route, base).href : route);

async function scan(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS).disableRules(DISABLED_RULES);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  const readable = violations.map((v) => `${v.id} (${v.impact}): ${v.help} -> ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(readable, 'axe violations').toEqual([]);
}

for (const route of ROUTES) {
  test(`a11y: ${route} has no automated WCAG A/AA violations`, async ({ page }) => {
    await page.goto(url(route));
    await page.locator('main').first().waitFor();
    await scan(page);
  });
}

// Example: scan an interactive state (open dialog) and check keyboard behaviour.
test.skip('a11y: settings dialog (open state) and focus return', async ({ page }) => {
  await page.goto(url('/'));
  const trigger = page.getByRole('button', { name: 'Settings' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Settings' });
  await expect(dialog).toBeVisible();
  await scan(page, 'dialog');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

// Example: every Tab stop shows a focus indicator (2.4.7 heuristic).
test.skip('a11y: focus indicator is visible on the first 20 tab stops', async ({ page }) => {
  await page.goto(url('/'));
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    const visible = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return true;
      const cs = getComputedStyle(el);
      return !(cs.outlineStyle === 'none' && cs.boxShadow === 'none');
    });
    expect(visible, `focus indicator on tab stop ${i + 1}`).toBe(true);
  }
});
