// Arabic dua overlay validator (shape-only): no unknown/duplicate slugs,
// required fields per entry, Arabic+Latin only.
// Run: npm run content:duas:ar
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = await readFile(join(ROOT, 'src', 'data', 'duas.ts'), 'utf8');
const parts = [];
for (const f of ['duas-ar-1.ts', 'duas-ar-2.ts', 'duas-ar-3.ts', 'duas-ar-4.ts', 'duas-ar-5.ts', 'duas-ar-6.ts', 'duas-ar-7.ts']) {
  parts.push(await readFile(join(ROOT, 'src', 'data', 'i18n', f), 'utf8'));
}
const txt = parts.join('\n');

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

const mainSlugs = [...main.matchAll(/\{ slug: '([^']+)', cat: '/g)].map((m) => m[1]);
const mainSet = new Set(mainSlugs);
const ovSlugs = [...txt.matchAll(/'([^']+)': \{ title:/g)].map((m) => m[1]);

if (new Set(ovSlugs).size !== ovSlugs.length) fail('duplicate overlay slugs');
for (const s of ovSlugs) if (!mainSet.has(s)) fail(`unknown dua slug in overlay: ${s}`);

const starts = [...txt.matchAll(/'[^']+': \{ title:/g)].map((m) => m.index);
const required = ['title:', 'use:', 'translation:', 'virtue:', 'when:'];
starts.forEach((s, i) => {
  const e = i + 1 < starts.length ? starts[i + 1] : txt.length;
  const body = txt.slice(s, e);
  for (const f of required) if (!body.includes(f)) fail(`overlay ${ovSlugs[i]} missing ${f}`);
});

const bad = txt.match(/[\u0900-\u097F\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/);
if (bad) fail(`suspect non-Arabic character U+${bad[0].codePointAt(0).toString(16)}`);

console.log(`\n📊 Duas: ${mainSlugs.length} — Arabic overlay: ${ovSlugs.length} (${Math.round((ovSlugs.length / mainSlugs.length) * 100)}%)`);
if (errors) { console.error(`\n${errors} error(s). Fix before building.`); process.exit(1); }
console.log('\n✅ Arabic dua overlays valid.');
