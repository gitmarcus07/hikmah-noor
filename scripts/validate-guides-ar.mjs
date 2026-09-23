// Arabic guide overlay validator (shape-only): no unknown/duplicate slugs,
// required fields per entry, steps where EN has steps, Arabic+Latin only.
// Run: npm run content:guides:ar
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let errors = 0;
const fail = (msg) => { errors++; console.error('X ' + msg); };

const main = await readFile(join(ROOT, 'src', 'data', 'guides.ts'), 'utf8');
let txt = '';
for (const f of ['guides-ar-1.ts', 'guides-ar-2.ts', 'guides-ar-3.ts', 'guides-ar-4.ts', 'guides-ar-5.ts']) {
  txt += '\n' + await readFile(join(ROOT, 'src', 'data', 'i18n', f), 'utf8');
}

const mainSlugs = [...main.matchAll(/\{ slug: '([^']+)', cat: '/g)].map((m) => m[1]);
const mainSet = new Set(mainSlugs);
const ovSlugs = [...txt.matchAll(/'([^']+)': \{ title:/g)].map((m) => m[1]);
if (new Set(ovSlugs).size !== ovSlugs.length) fail('duplicate overlay slugs');
for (const s of ovSlugs) if (!mainSet.has(s)) fail(`unknown guide slug in overlay: ${s}`);

const starts = [...txt.matchAll(/'[^']+': \{ title:/g)].map((m) => m.index);
const required = ['title:', 'intro:', 'sections:', 'faq:'];
starts.forEach((s, i) => {
  const e = i + 1 < starts.length ? starts[i + 1] : txt.length;
  const body = txt.slice(s, e);
  for (const f of required) if (!body.includes(f)) fail(`overlay ${ovSlugs[i]} missing ${f}`);
});
for (const s of mainSlugs) {
  const m = main.match(new RegExp("\\{ slug: '" + s + "'[\\s\\S]*?(?=\\{ slug: '|\\];\\nexport function guideCat)"));
  const hasSteps = m && m[0].includes('steps: [');
  const o = txt.match(new RegExp("'" + s + "': \\{[\\s\\S]*?(?='[^']+': \\{ title:|\\};\\s*$)"));
  if (hasSteps && o && !o[0].includes('steps:')) fail(`overlay ${s} missing steps (EN has steps)`);
}

// Arabic overlays: Arabic + Latin + digits/punct only (no Devanagari, no CJK/Cyrillic)
const bad = txt.match(/[\u0900-\u097F\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/);
if (bad) fail(`suspect non-Arabic character U+${bad[0].codePointAt(0).toString(16)}`);

console.log(`OK guides-ar: ${mainSlugs.length} guides, ${ovSlugs.length} Arabic overlays (${Math.round((ovSlugs.length / mainSlugs.length) * 100)}%)`);
if (errors) { console.error(`\n${errors} error(s). Fix before building.`); process.exit(1); }
console.log('All Arabic guide overlays valid.');
