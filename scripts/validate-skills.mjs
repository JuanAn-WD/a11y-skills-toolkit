#!/usr/bin/env node
// Validates every skills/<name>/SKILL.md: frontmatter present, `name` and `description`
// set, name matches folder and is kebab-case, description within 1024 chars, and
// relative Markdown links / `../a11y-reference/...` paths resolve. No dependencies.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(root, 'skills');
const errors = [];
let count = 0;

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^['"]|['"]$/g, '').trim();
  }
  return fm;
}

for (const name of readdirSync(skillsDir)) {
  const dir = join(skillsDir, name);
  if (!statSync(dir).isDirectory()) continue;
  const file = join(dir, 'SKILL.md');
  if (!existsSync(file)) { errors.push(`${name}: missing SKILL.md`); continue; }
  count++;
  const text = readFileSync(file, 'utf8');
  const fm = frontmatter(text);
  if (!fm) { errors.push(`${name}: missing YAML frontmatter`); continue; }
  if (!fm.name) errors.push(`${name}: frontmatter "name" missing`);
  else {
    if (fm.name !== name) errors.push(`${name}: name "${fm.name}" does not match folder`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) errors.push(`${name}: name must be lowercase kebab-case`);
  }
  if (!fm.description) errors.push(`${name}: frontmatter "description" missing`);
  else if (fm.description.length > 1024) errors.push(`${name}: description is ${fm.description.length} chars (max 1024)`);

  // Referenced relative paths must exist (skills are installed side by side).
  const refs = new Set();
  for (const m of text.matchAll(/`(\.\.?\/[^`\s]+)`/g)) refs.add(m[1]);
  for (const m of text.matchAll(/\]\((\.\.?\/[^)\s]+)\)/g)) refs.add(m[1]);
  for (const m of text.matchAll(/`((?:references|scripts|assets)\/[^`\s]+)`/g)) refs.add(m[1]);
  for (const ref of refs) {
    const clean = ref.split('#')[0];
    if (!existsSync(resolve(dir, clean))) errors.push(`${name}: referenced path not found: ${ref}`);
  }
}

if (count === 0) errors.push('no skills found under skills/');
if (errors.length) {
  console.error(`Skill validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`OK: ${count} skills valid.`);
