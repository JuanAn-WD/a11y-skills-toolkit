#!/usr/bin/env node
/**
 * a11y multi-route scanner: Playwright + @axe-core/playwright.
 *
 * Usage:
 *   node scan.mjs --base-url http://localhost:5173 --routes /,/login,/checkout
 *   node scan.mjs --config a11y.config.json
 *
 * Options:
 *   --base-url <url>        Base URL of the running site (required unless in config)
 *   --routes <list>         Comma-separated paths (default "/")
 *   --config <file>         JSON: { baseUrl, routes, storageState, tags, waitFor, checks, outDir, timeout }
 *   --storage-state <file>  Playwright storageState JSON for authenticated routes
 *   --tags <list>           axe tags (default wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa)
 *   --wait-for <selector>   Wait for this selector before scanning each route (SPAs)
 *   --checks <list>         Extra heuristic checks: keyboard,reflow (reported as "needs review")
 *   --out-dir <dir>         Output folder for results.json and summary.md (default ./a11y-report)
 *   --timeout <ms>          Navigation timeout per route (default 30000)
 *   --include-best-practice Also run axe "best-practice" rules (reported separately)
 *
 * Exit codes: 0 = no axe violations, 1 = violations found, 2 = usage or runtime error.
 *
 * Dependencies are resolved from the current working directory (your project's
 * node_modules) or from the folder in the A11Y_SCAN_DEPS environment variable,
 * so the script can live outside the project.
 */
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

const list = (v) => (Array.isArray(v) ? v : String(v).split(',')).map((s) => s.trim()).filter(Boolean);

async function loadDeps() {
  const bases = [process.env.A11Y_SCAN_DEPS, process.cwd()].filter(Boolean);
  for (const base of bases) {
    const req = createRequire(path.join(path.resolve(base), 'noop.js'));
    try {
      const pw = await import(pathToFileURL(req.resolve('playwright')).href);
      const axe = await import(pathToFileURL(req.resolve('@axe-core/playwright')).href);
      let axeVersion = 'unknown';
      try { axeVersion = JSON.parse(await readFile(req.resolve('axe-core/package.json'), 'utf8')).version; } catch {}
      return { chromium: pw.chromium ?? pw.default?.chromium, AxeBuilder: axe.default ?? axe.AxeBuilder, axeVersion };
    } catch { /* try next base */ }
  }
  throw new Error('Cannot find "playwright" and "@axe-core/playwright". Install them in the project or in a temp dir and set A11Y_SCAN_DEPS=<dir>.');
}

async function keyboardCheck(page, maxStops = 40) {
  // Heuristic: tab through the page; flag stops with no visible focus style or covered by other content.
  await page.locator('body').focus().catch(() => {});
  const stops = [];
  for (let i = 0; i < maxStops; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const noOutline = cs.outlineStyle === 'none' || parseFloat(cs.outlineWidth) === 0;
      const noShadow = cs.boxShadow === 'none';
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const top = (cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight) ? document.elementFromPoint(cx, cy) : null;
      const covered = top ? !(el === top || el.contains(top) || top.contains(el)) : false;
      const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').trim().slice(0, 60);
      const sel = el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''}`;
      return { sel, name, noVisibleFocusStyle: noOutline && noShadow, possiblyObscured: covered, key: sel + '|' + name + '|' + r.top + '|' + r.left };
    });
    if (!info) break;
    if (stops.length && stops[0].key === info.key) break; // wrapped around
    stops.push(info);
  }
  return {
    tabStops: stops.length,
    noVisibleFocusStyle: stops.filter((s) => s.noVisibleFocusStyle).map(({ sel, name }) => ({ sel, name })),
    possiblyObscured: stops.filter((s) => s.possiblyObscured).map(({ sel, name }) => ({ sel, name })),
  };
}

async function reflowCheck(page) {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.waitForTimeout(300);
  const res = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  await page.setViewportSize({ width: 1280, height: 800 });
  return { ...res, horizontalScrollAt320: res.scrollWidth > res.clientWidth + 1 };
}

function mdEscape(s) { return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' '); }

function toMarkdown(report) {
  const L = [];
  L.push(`# Accessibility scan summary`, '');
  L.push(`- Base URL: ${report.baseUrl}`);
  L.push(`- Routes scanned: ${report.routes.length}`);
  L.push(`- Tools: axe-core ${report.tools.axeCore}, Playwright Chromium ${report.tools.browser}`);
  L.push(`- axe tags: ${report.tags.join(', ')}`);
  L.push(`- Date: ${report.date}`, '');
  const v = report.totals.violations;
  L.push(v > 0
    ? `**${v} automated violation(s)** (${report.totals.nodes} element(s)) across ${report.routes.length} route(s). Manual verification is still required for most WCAG criteria.`
    : `**No automated violations detected** on ${report.routes.length} route(s). This is not a conformance claim: automated tools detect only part of WCAG failures.`);
  L.push('');
  for (const r of report.routes) {
    L.push(`## ${r.route}`, '');
    if (r.error) { L.push(`Error: ${mdEscape(r.error)}`, ''); continue; }
    L.push(`Title: ${mdEscape(r.title)} | violations: ${r.violations.length} | needs review: ${r.incomplete.length} | rules passed: ${r.passes}`, '');
    if (r.violations.length) {
      L.push('| Impact | Rule | WCAG | Elements | Example target | Help |', '| --- | --- | --- | --- | --- | --- |');
      for (const x of r.violations) {
        L.push(`| ${x.impact} | \`${x.id}\` | ${x.wcag.join(', ') || '-'} | ${x.nodes.length} | \`${mdEscape(x.nodes[0]?.target)}\` | [${mdEscape(x.help)}](${x.helpUrl}) |`);
      }
      L.push('');
    }
    if (r.incomplete.length) L.push(`Needs review (axe incomplete): ${r.incomplete.map((x) => '`' + x.id + '`').join(', ')}`, '');
    if (r.bestPractice?.length) L.push(`Best practice (not WCAG failures): ${r.bestPractice.map((x) => '`' + x.id + '`').join(', ')}`, '');
    if (r.keyboard) {
      L.push(`Keyboard heuristic (needs manual confirmation): ${r.keyboard.tabStops} tab stops; ` +
        `${r.keyboard.noVisibleFocusStyle.length} without outline/box-shadow on focus (2.4.7 candidates); ` +
        `${r.keyboard.possiblyObscured.length} possibly obscured (2.4.11 candidates).`);
      for (const s of r.keyboard.noVisibleFocusStyle.slice(0, 10)) L.push(`  - no focus style: \`${mdEscape(s.sel)}\` "${mdEscape(s.name)}"`);
      for (const s of r.keyboard.possiblyObscured.slice(0, 10)) L.push(`  - possibly obscured: \`${mdEscape(s.sel)}\` "${mdEscape(s.name)}"`);
      L.push('');
    }
    if (r.reflow) L.push(`Reflow heuristic at 320px: ${r.reflow.horizontalScrollAt320 ? `horizontal scroll (scrollWidth ${r.reflow.scrollWidth}px) - 1.4.10 candidate` : 'no horizontal scroll'}.`, '');
  }
  L.push('---', 'Automated tools detect only part of WCAG failures. Not a legal opinion or conformance certification.');
  return L.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    console.log((await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0]);
    return 0;
  }
  let cfg = {};
  if (args.config) cfg = JSON.parse(await readFile(path.resolve(args.config), 'utf8'));
  const baseUrl = args['base-url'] ?? cfg.baseUrl;
  if (!baseUrl) { console.error('Missing --base-url (or "baseUrl" in --config).'); return 2; }
  const routes = list(args.routes ?? cfg.routes ?? ['/']);
  const tags = list(args.tags ?? cfg.tags ?? DEFAULT_TAGS);
  const storageState = args['storage-state'] ?? cfg.storageState;
  const waitFor = args['wait-for'] ?? cfg.waitFor;
  const checks = list(args.checks ?? cfg.checks ?? []);
  const outDir = path.resolve(args['out-dir'] ?? cfg.outDir ?? 'a11y-report');
  const timeout = Number(args.timeout ?? cfg.timeout ?? 30000);
  const bestPractice = Boolean(args['include-best-practice'] ?? cfg.includeBestPractice);

  if (storageState && !existsSync(storageState)) { console.error(`storageState file not found: ${storageState}`); return 2; }

  const { chromium, AxeBuilder, axeVersion } = await loadDeps();
  const browser = await chromium.launch();
  const report = { baseUrl, tags, date: new Date().toISOString(), tools: { axeCore: axeVersion, browser: browser.version() }, routes: [], totals: { violations: 0, nodes: 0, errors: 0 } };
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...(storageState ? { storageState } : {}) });
    for (const route of routes) {
      const url = new URL(route, baseUrl).href;
      const page = await context.newPage();
      const entry = { route, url };
      try {
        const resp = await page.goto(url, { waitUntil: 'load', timeout });
        if (resp && resp.status() >= 400) throw new Error(`HTTP ${resp.status()}`);
        if (waitFor) await page.waitForSelector(waitFor, { timeout });
        entry.title = await page.title();
        const res = await new AxeBuilder({ page }).withTags(tags).analyze();
        entry.violations = res.violations.map((v) => ({
          id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl,
          wcag: v.tags.filter((t) => /^wcag\d{3,4}$/.test(t)).map((t) => t.replace(/^wcag(\d)(\d)(\d+)$/, '$1.$2.$3')),
          nodes: v.nodes.map((n) => ({ target: n.target.join(' '), html: n.html.slice(0, 300), summary: n.failureSummary })),
        }));
        entry.incomplete = res.incomplete.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.length }));
        entry.passes = res.passes.length;
        if (bestPractice) {
          const bp = await new AxeBuilder({ page }).withTags(['best-practice']).analyze();
          entry.bestPractice = bp.violations.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.length }));
        }
        if (checks.includes('keyboard')) entry.keyboard = await keyboardCheck(page);
        if (checks.includes('reflow')) entry.reflow = await reflowCheck(page);
        report.totals.violations += entry.violations.length;
        report.totals.nodes += entry.violations.reduce((n, v) => n + v.nodes.length, 0);
      } catch (e) {
        entry.error = e.message.split('\n')[0];
        report.totals.errors++;
      } finally {
        await page.close();
        report.routes.push(entry);
      }
    }
    await context.close();
  } finally {
    await browser.close();
  }

  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'results.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(outDir, 'summary.md'), toMarkdown(report));
  console.log(toMarkdown(report));
  console.log(`\nWrote ${path.join(outDir, 'results.json')} and summary.md`);
  if (report.totals.errors === routes.length) return 2;
  return report.totals.violations > 0 ? 1 : 0;
}

main().then((code) => process.exit(code), (e) => { console.error(e.message); process.exit(2); });
