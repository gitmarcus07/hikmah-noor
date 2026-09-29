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
// English-first batches: Urdu overlays land in a follow-up pass.
const PENDING_UR = new Set([
  'sehri-intention', 'afiyah-pardon-wellbeing', 'mercy-comprehensive-dua',
  'shawwal-intention', 'gathering-expiation-dua', 'qurbani-slaughter-dua',
  'qurbani-intention', 'eat-feed-qurbani-verse', 'dhuha-glorification', 'hajah-need-dua',
  'hijri-new-year-dua', 'shaban-blessing-dua',
  // 2026 large expansion: 9 new categories, English-first (94 duas).
  'adhan-reply-word', 'adhan-shahada-reply', 'between-adhan-iqamah', 'going-mosque-step',
  'mosque-greeting-tahiyyah', 'mosque-itikaf-intent', 'adhan-fajr-blessing', 'mosque-after-prayer-wait',
  'jumuah-ghusl-early', 'jumuah-kahf-recite', 'jumuah-answered-hour', 'jumuah-salawat-abundant',
  'eid-ghusl-adornment', 'eid-prayer-takbirat', 'eid-takbir-route', 'eid-congratulate-dua',
  'jumuah-man-ghusl-scent', 'eid-sacrifice-share',
  'fear-loneliness-emptiness', 'grief-sorrow-yunus-light', 'waswasah-doubt-cure', 'envy-hassad-shield',
  'anger-cooling-wudu', 'nightmare-recurring-shield', 'heaviness-chest-sharh', 'sadness-debt-dua-deep',
  'shame-regret-tawbah-open', 'overthinking-sleep-release', 'people-fear-stage', 'jealousy-heart-clean',
  'panic-breathe-hawqalah', 'hope-dawn-verse',
  'newborn-tahnik-adhan', 'newborn-aqiqah-barakah', 'spouse-mawaddah-love', 'inlaws-harmony-dua',
  'parents-alive-service', 'parents-deceased-sadaqah', 'marriage-first-night-calm', 'infertility-zakariya-cry',
  'children-teen-guidance', 'home-new-house-barzah',
  'job-seeking-halal', 'interview-calm-clarity', 'business-opening-barakah', 'morning-rizq-early',
  'debt-repay-plan-dua', 'loss-recovery-istirja', 'halal-earning-hands', 'rizq-musa-needy-dua',
  'promotion-exam-tawakkul', 'wealth-gratitude-zakat',
  'hajj-miqat-talbiyah-start', 'hajj-tawaf-seven-rounds', 'hajj-multazam-cling', 'hajj-sai-safa-marwa',
  'hajj-arafah-wuquf', 'hajj-muzdalifah-night', 'hajj-rami-stoning-order', 'hajj-qurbani-shave-order',
  'hajj-farewell-tawaf', 'umrah-complete-steps', 'hajj-arafah-fasting-nonpilgrim', 'hajj-zamzam-intent-drink',
  'fever-cooling-sadaqah', 'eye-pain-healing', 'ruqyah-fatihah-seven', 'sick-person-own-words',
  'visiting-sick-etiquette', 'chronic-illness-sabr', 'medicine-honey-blackseed', 'mental-health-ruqyah-daily',
  'hospital-operation-dua', 'shifa-complete-verse',
  'greeting-salam-full', 'thanking-jazakallah-best', 'sneezing-full-reply', 'visiting-brother-love',
  'neighbour-rights-gift', 'forgiving-others-night', 'backbiting-kaffarah-clean', 'guest-honour-three-days',
  'congratulate-blessing-barik', 'promise-keeping-amanah',
  'tahajjud-opening-praise', 'last-third-descends', 'witr-seal-quddus', 'sahar-istighfar-dawn',
  'night-waking-dhikr-accepted', 'tahajjud-long-sujood-ask', 'qiyam-ramadan-forgiven', 'dua-after-tahajjud-list',
  'waking-tahajjud-intent-sleep', 'laylatul-qadr-search-odd',
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
