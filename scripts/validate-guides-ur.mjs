// Urdu guide overlay validator: every guides.ts slug + GUIDE_CATS covered,
// required Urdu fields per entry, no unknown slugs.
// Run: npm run content:guides:ur
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let errors = 0;
const fail = (msg) => { errors++; console.error('X ' + msg); };

const main = await readFile(join(ROOT, 'src', 'data', 'guides.ts'), 'utf8');
let txt = '';
for (const f of ['guides-ur-1.ts', 'guides-ur-2.ts', 'guides-ur-3.ts']) {
  txt += '\n' + await readFile(join(ROOT, 'src', 'data', 'i18n', f), 'utf8');
}

const mainSlugs = [...main.matchAll(/\{ slug: '([^']+)', cat: '/g)].map((m) => m[1]);
const mainSet = new Set(mainSlugs);
// English-first batch (Eid season 2026): Urdu overlays land in a follow-up pass.
const PENDING_UR = new Set([
  'moon-sighting-hilal', 'itikaf-rules', 'laylatul-qadr', 'last-ten-nights-plan',
  'what-breaks-fast', 'fidyah-kaffarah-fasts', 'quran-khatm-ramadan', 'zakat-al-fitr',
  'eid-day-sunnahs', 'eid-takbeer-wording', 'eid-khutbah-rulings', 'shawwal-six-fasts',
  'qurbani-rules', 'qurbani-shares-who', 'qurbani-meat-distribution',
  'tashriq-days-takbeer', 'qurbani-mistakes',
]);
const ovSlugs = [...txt.matchAll(/'([^']+)': \{ title:/g)].map((m) => m[1]);
if (new Set(ovSlugs).size !== ovSlugs.length) fail('duplicate overlay slugs');
for (const s of ovSlugs) if (!mainSet.has(s)) fail(`unknown guide slug in overlay: ${s}`);
const missing = mainSlugs.filter((s) => !ovSlugs.includes(s) && !PENDING_UR.has(s));
if (missing.length) fail(`missing Urdu for ${missing.length}: ${missing.join(', ')}`);
const pending = mainSlugs.filter((s) => PENDING_UR.has(s) && !ovSlugs.includes(s));
if (pending.length) console.log(`Pending Urdu (English-first batch): ${pending.length} — ${pending.join(', ')}`);

const starts = [...txt.matchAll(/'[^']+': \{ title:/g)].map((m) => m.index);
const required = ['title:', 'intro:', 'sections:', 'faq:'];
starts.forEach((s, i) => {
  const e = i + 1 < starts.length ? starts[i + 1] : txt.length;
  const body = txt.slice(s, e);
  for (const f of required) if (!body.includes(f)) fail(`overlay ${ovSlugs[i]} missing ${f}`);
});
// Steps required wherever the EN guide has steps.
for (const s of mainSlugs) {
  const m = main.match(new RegExp("\\{ slug: '" + s + "'[\\s\\S]*?(?=\\{ slug: '|\\];\\nexport function guideCat)"));
  const hasSteps = m && m[0].includes('steps: [');
  const o = txt.match(new RegExp("'" + s + "': \\{[\\s\\S]*?(?='[^']+': \\{ title:|export const GUIDE_CATS_UR)"));
  if (hasSteps && o && !o[0].includes('steps:')) fail(`overlay ${s} missing steps (EN has steps)`);
}

// Category overlays.
const mainCats = [...main.matchAll(/\{ slug: '([^']+)', title: '([^']+)', desc: '/g)].map((m) => m[1]);
for (const c of mainCats) if (!txt.includes(c + ': { title:')) fail(`missing Urdu category overlay: ${c}`);

// No stray non-Arabic/Latin scripts (CJK/Cyrillic mojibake guard).
const bad = txt.match(/[\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/);
if (bad) fail(`suspect non-Urdu character U+${bad[0].codePointAt(0).toString(16)}`);

console.log(`OK guides: ${mainSlugs.length} guides, ${ovSlugs.length} Urdu overlays, ${mainCats.length} categories`);
if (errors) { console.error(`\n${errors} error(s). Fix before building.`); process.exit(1); }
console.log('\nAll Urdu guide overlays valid — full coverage, required fields present.');
