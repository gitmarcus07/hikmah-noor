// Urdu story overlay validator: every prophets/sahaba/women/waqiat slug covered,
// required Urdu fields per entry, no unknown slugs.
// Run: npm run content:stories:ur
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let errors = 0;
const fail = (msg) => { errors++; console.error('X ' + msg); };

const JOBS = [
  { main: ['src', 'data', 'prophets.ts'], files: [['src', 'data', 'i18n', 'prophets-ur.ts']], kind: 'prophets' },
  { main: ['src', 'data', 'sahaba.ts'], files: [['src', 'data', 'i18n', 'sahaba-ur.ts'], ['src', 'data', 'i18n', 'sahaba-ur-2.ts']], kind: 'sahaba' },
  { main: ['src', 'data', 'women.ts'], files: [['src', 'data', 'i18n', 'women-ur.ts']], kind: 'women' },
  { main: ['src', 'data', 'waqiat.ts'], files: [['src', 'data', 'i18n', 'waqiat-ur.ts']], kind: 'waqiat' },
];

for (const job of JOBS) {
  const main = await readFile(join(ROOT, ...job.main), 'utf8');
  let txt = '';
  for (const f of job.files) txt += '\n' + await readFile(join(ROOT, ...f), 'utf8');
  const mainSlugs = [...main.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1]);
  const mainSet = new Set(mainSlugs);
  const ovSlugs = [...txt.matchAll(/'([^']+)': \{ title:/g)].map((m) => m[1]);
  if (new Set(ovSlugs).size !== ovSlugs.length) fail(`${job.kind}: duplicate overlay slugs`);
  for (const s of ovSlugs) if (!mainSet.has(s)) fail(`${job.kind}: unknown slug in overlay: ${s}`);
  const missing = mainSlugs.filter((s) => !ovSlugs.includes(s));
  if (missing.length) fail(`${job.kind}: missing Urdu for ${missing.length}: ${missing.join(', ')}`);
  const starts = [...txt.matchAll(/'[^']+': \{ title:/g)].map((m) => m.index);
  const required = ['title:', 'summary:', 'narrative:', 'events:', 'lessons:'];
  starts.forEach((s, i) => {
    const e = i + 1 < starts.length ? starts[i + 1] : txt.length;
    const body = txt.slice(s, e);
    for (const f of required) if (!body.includes(f)) fail(`${job.kind}: overlay ${ovSlugs[i]} missing ${f}`);
  });
  // No stray non-Arabic/Latin scripts (CJK/Cyrillic mojibake guard).
  const bad = txt.match(/[\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/);
  if (bad) fail(`${job.kind}: suspect non-Urdu character U+${bad[0].codePointAt(0).toString(16)}`);
  console.log(`OK ${job.kind}: ${mainSlugs.length} stories, ${ovSlugs.length} Urdu overlays`);
}

if (errors) { console.error(`\n${errors} error(s). Fix before building.`); process.exit(1); }
console.log('\nAll Urdu story overlays valid — full coverage, required fields present.');
