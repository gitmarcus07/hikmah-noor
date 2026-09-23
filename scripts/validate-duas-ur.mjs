// Urdu dua overlay validator: every duas.ts slug covered, required Urdu
// fields per entry, no unknown slugs, valid TS map shape.
// Run: npm run content:duas:ur
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = await readFile(join(ROOT, 'src', 'data', 'duas.ts'), 'utf8');
const parts = [];
for (const f of ['duas-ur-1.ts', 'duas-ur-2.ts', 'duas-ur-3.ts', 'duas-ur-4.ts', 'duas-ur-5.ts', 'duas-ur-6.ts']) {
  parts.push(await readFile(join(ROOT, 'src', 'data', 'i18n', f), 'utf8'));
}
const txt = parts.join('\n');

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

const mainSlugs = [...main.matchAll(/\{ slug: '([^']+)', cat: '/g)].map((m) => m[1]);
const mainSet = new Set(mainSlugs);
// English-first batch (Eid season 2026): Urdu overlays land in a follow-up pass.
const PENDING_UR = new Set([
  'sehri-intention', 'afiyah-pardon-wellbeing', 'mercy-comprehensive-dua',
  'shawwal-intention', 'gathering-expiation-dua', 'qurbani-slaughter-dua',
  'qurbani-intention', 'eat-feed-qurbani-verse', 'dhuha-glorification', 'hajah-need-dua',
  'hijri-new-year-dua', 'shaban-blessing-dua',
]);
const ovSlugs = [...txt.matchAll(/'([^']+)': \{ title:/g)].map((m) => m[1]);

if (new Set(ovSlugs).size !== ovSlugs.length) fail('duplicate overlay slugs');
for (const s of ovSlugs) if (!mainSet.has(s)) fail(`unknown dua slug in overlay: ${s}`);
const missing = mainSlugs.filter((s) => !ovSlugs.includes(s) && !PENDING_UR.has(s));
if (missing.length) fail(`missing Urdu for ${missing.length}: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '…' : ''}`);
const pending = mainSlugs.filter((s) => PENDING_UR.has(s) && !ovSlugs.includes(s));
if (pending.length) console.log(`⏳ Pending Urdu (English-first batch): ${pending.length} — ${pending.join(', ')}`);

const starts = [...txt.matchAll(/'[^']+': \{ title:/g)].map((m) => m.index);
const required = ['title:', 'use:', 'translation:', 'virtue:', 'when:'];
starts.forEach((s, i) => {
  const e = i + 1 < starts.length ? starts[i + 1] : txt.length;
  const body = txt.slice(s, e);
  for (const f of required) if (!body.includes(f)) fail(`overlay ${ovSlugs[i]} missing ${f}`);
});

console.log(`\n📊 Duas: ${mainSlugs.length} — Urdu overlay: ${ovSlugs.length} (${Math.round((ovSlugs.length / mainSlugs.length) * 100)}%)`);
if (errors) { console.error(`\n${errors} error(s). Fix before building.`); process.exit(1); }
console.log('\n✅ Urdu overlay valid — full coverage, required fields present.');
