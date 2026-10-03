// Search quality suite: deterministic queries against built payloads.
// Reads dist/search-index.json + dist/search-ayahs.json per locale, loads
// the real client engine, and asserts expected top results.
// Run AFTER build: node scripts/test-search.mjs
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createIndex, search, suggest, didYouMean, parseRef } from '../src/lib/search-engine.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = async (f) => JSON.parse(await readFile(join(ROOT, f), 'utf8'));

let pass = 0;
let fail = 0;
const results = [];
function check(locale, query, expect, opts = {}) {
  return { locale, query, expect, ...opts };
}
async function runSuite(locale, cases, idx) {
  for (const c of cases) {
    let ok = false;
    let actual = '';
    let detail = '';
    if (c.dym !== undefined) {
      const ranked = search(idx, c.query, { limit: 1 });
      actual = didYouMean(idx, c.query, ranked[0]?.tier);
      ok = actual === c.dym;
      detail = `didYouMean=${JSON.stringify(actual)}`;
    } else if (c.ref) {
      const r = parseRef(c.query, idx.surahTable);
      actual = r ? `${r.surah}:${r.ayah}` : null;
      ok = actual === c.ref;
      detail = `parseRef=${actual}`;
    } else {
      const ranked = search(idx, c.query, { limit: c.limit ?? 10, types: c.types ? new Set(c.types) : null });
      actual = ranked.length ? ranked[0].d.u : '(none)';
      const topN = ranked.slice(0, c.top ?? 1).map((r) => r.d.u);
      ok = c.contains ? topN.some((u) => u.includes(c.contains)) : topN.includes(c.expect);
      detail = `top=${actual}${ranked.length > 1 ? ` (+${ranked.length - 1} more)` : ''}`;
    }
    if (ok) pass++;
    else fail++;
    results.push(`${ok ? 'PASS' : 'FAIL'} [${locale}] "${c.query}" → ${detail} (expected ${c.expect ?? c.contains ?? c.dym ?? c.ref})`);
  }
}

const EN = [
  check('en', 'Ramadan', null, { contains: '/ramadan/' }),
  check('en', '2:255', '/quran/2-al-baqara/255/'),
  check('en', '2 255', '/quran/2-al-baqara/255/'),
  check('en', 'Baqarah 255', '/quran/2-al-baqara/255/'),
  check('en', 'Ayatul Kursi', '/quran/2-al-baqara/255/'),
  check('en', 'ramdan', null, { dym: 'ramadan' }),
  check('en', 'dua for forgiveness', null, { contains: 'duas', top: 3 }),
  check('en', 'ar rahman', '/names-of-allah/ar-rahman/'),
  check('en', 'Ibrahim', null, { contains: 'ibrahim', top: 3 }),
  check('en', 'Muharram', '/calendar/muharram/'),
  check('en', 'hajj', null, { contains: '/hajj/', top: 3 }),
  check('en', 'umrah', '/umrah/'),
  check('en', 'hadith on kindness', null, { contains: 'hadees', top: 5 }),
  check('en', 'surah rahman', '/surahs/55-ar-rahmaan/'),
  check('en', 'dua before sleeping', null, { contains: 'duas', top: 3 }),
  check('en', 'Laylatul Qadr', null, { contains: 'laylatul-qadr', top: 3 }),
  check('en', 'Names of Allah', '/names-of-allah/'),
  check('en', 'Sahaba', null, { contains: 'sahaba', top: 3 }),
  check('en', '2:256', '/quran/2-al-baqara/256/', { }),
  check('en', '999:999', null, { dym: null }),
  check('en', 'wudu', null, { contains: 'wudu', top: 5 }),
  check('en', 'seerah', null, { contains: 'seerat', top: 5 }),
  check('en', 'kalima', null, { contains: 'kalima', top: 5 }),
  check('en', 'zakat', null, { contains: 'zakat', top: 5 }),
  check('en', 'tawakkul', '/meanings/tawakkul/'),
  check('en', 'yusuf', null, { contains: 'yusuf', top: 5 }),
  check('en', 'khadija', null, { contains: 'khadija', top: 5 }),
  check('en', 'badr', null, { contains: 'badr', top: 5 }),
  check('en', 'quiz', null, { contains: 'quiz', top: 5 }),
  check('en', 'forty hadith nawawi', '/hadees/nawawi/'),
  check('en', 'nawawi forty', '/hadees/nawawi/'),
  check('en', 'nawawi 42', '/hadees/nawawi/forty-hadith/42/'),
  check('en', 'it is narrated on the authority of amirul muminin', null, { contains: '/hadees/nawawi/forty-hadith/1/', top: 3 }),
  check('en', 'is it halal', '/halal-haram/'),
  check('en', 'halal haram', null, { contains: '/halal-haram/', top: 3 }),
  check('en', 'islamic manners', '/adab/'),
  check('en', 'new muslim guide', null, { contains: '/new-muslim/', top: 3 }),
  check('en', 'zakat guide', null, { contains: '/zakat/', top: 5 }),
];
const UR = [
  check('ur', 'رمضان', '/ur/ramadan/'),
  check('ur', '2:255', '/ur/quran/2-al-baqara/255/'),
  check('ur', 'nawawi 42', '/ur/hadees/nawawi/forty-hadith/42/'),
];
const HI = [
  check('hi', 'रमज़ान', '/hi/ramadan/'),
  check('hi', '2:255', '/hi/quran/2-al-baqara/255/'),
];
const AR = [
  check('ar', 'الرحمن', null, { contains: 'ar-rahman', top: 5 }),
  check('ar', '2:255', '/ar/quran/2-al-baqara/255/'),
];

for (const [locale, cases] of [['en', EN], ['ur', UR], ['hi', HI], ['ar', AR]]) {
  const core = await load(locale === 'en' ? 'dist/search-index.json' : `dist/${locale}/search-index.json`);
  const ayahs = await load(locale === 'en' ? 'dist/search-ayahs.json' : `dist/${locale}/search-ayahs.json`);
  const idx = createIndex(core, ayahs);
  console.log(`-- locale ${locale}: ${idx.docs.length} docs, ${idx.tok.size} tokens`);
  await runSuite(locale, cases, idx);
}
console.log(results.join('\n'));
console.log(`\nsearch quality: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
