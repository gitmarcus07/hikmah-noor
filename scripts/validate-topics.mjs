// Topics validator (Phase 3): 12 Hijri months, hub slug lists, routes,
// month i18n coverage. Relationship edges checked by content:relationships.
// Run: npm run content:topics
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFile(join(ROOT, p), 'utf8');

let errors = 0;
let warnings = 0;
const fail = (msg) => { errors++; console.error('X ' + msg); };
const warn = (msg) => { warnings++; console.warn('! ' + msg); };

const monthsTxt = await read('src/data/months.ts');
const siteUi4 = await read('src/lib/site-ui-4.ts');

// 1. 12 months, sequential nums, unique slugs, required fields.
const months = [...monthsTxt.matchAll(/\{ slug: '([^']+)', num: (\d+), name: '([^']+)', arabic: '([^']+)', sacred: (true|false)/g)]
  .map((m) => ({ slug: m[1], num: +m[2], name: m[3], arabic: m[4], sacred: m[5] === 'true' }));
console.log(`  months: ${months.length}`);
if (months.length !== 12) fail(`expected 12 months, found ${months.length}`);
const nums = months.map((m) => m.num).sort((a, b) => a - b);
if (!nums.every((v, i) => v === i + 1)) fail('month nums are not 1-12');
if (new Set(months.map((m) => m.slug)).size !== months.length) fail('duplicate month slugs');
for (const m of months) {
  if (!m.name || !m.arabic) fail(`month ${m.slug}: missing name/arabic`);
}
// prev/next chain integrity (wrap 12->1, 1->12).
const byNum = new Map(months.map((m) => [m.num, m]));
for (const m of months) {
  const prev = byNum.get(m.num === 1 ? 12 : m.num - 1);
  const next = byNum.get(m.num === 12 ? 1 : m.num + 1);
  if (!prev || !next) fail(`month ${m.slug}: broken prev/next chain`);
}
const sacred = months.filter((m) => m.sacred).map((m) => m.slug).sort();
const expectSacred = ['dhul-hijjah', 'dhul-qadah', 'muharram', 'rajab'].sort();
if (JSON.stringify(sacred) !== JSON.stringify(expectSacred)) fail(`sacred months mismatch: ${sacred.join(',')}`);

// 2. Month events reference resolvable targets (checked for existence here).
const guidesTxt = await read('src/data/guides.ts');
const seerahTxt = await read('src/data/seerah.ts');
const historyTxt = await read('src/data/history.ts');
const guideSlugs = new Set([...guidesTxt.matchAll(/\{ slug: '([^']+)', cat: '([^']+)'/g)].map((m) => m[1]));
const seerahSlugs = new Set([...seerahTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1]));
const historySlugs = new Set([...historyTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1]));
let eventCount = 0;
for (const m of monthsTxt.matchAll(/\{ d: (\d+|null), key: '([^']+)', target: \{ type: '(\w+)', slug: '([^']+)' \} \}/g)) {
  eventCount++;
  const set = m[3] === 'guide' ? guideSlugs : m[3] === 'seerah' ? seerahSlugs : m[3] === 'history' ? historySlugs : null;
  if (!set) { fail(`month event with unknown target type: ${m[3]}`); continue; }
  if (!set.has(m[4])) fail(`month event target not found: ${m[3]}:${m[4]}`);
}
console.log(`  month events: ${eventCount}`);

// 3. MONTH_UI coverage: every month slug has desc in all 4 locales;
// every event key has name+note in all 4 locales.
const eventKeys = new Set([...monthsTxt.matchAll(/key: '([^']+)'/g)].map((m) => m[1]));
for (const l of ['en', 'ur', 'hi', 'ar']) {
  const block = siteUi4.match(new RegExp(`export const MONTH_UI[\\s\\S]*?^  ${l}: \\{([\\s\\S]*?)(?=^  \\w+: \\{|^\\};)`, 'm'));
  const body = block ? block[1] : siteUi4;
  for (const m of months) {
    if (!body.includes(`'${m.slug}'`)) fail(`MONTH_UI ${l}: missing month ${m.slug}`);
  }
  for (const k of eventKeys) {
    if (!body.includes(`'${k}'`)) fail(`MONTH_UI ${l}: missing event ${k}`);
  }
  console.log(`  MONTH_UI ${l}: months + ${eventKeys.size} events present`);
}

// 4. Hub slug lists resolve (guides/duas/quiz/hadees).
const duasTxt = await read('src/data/duas.ts');
const duaSlugs = new Set([...duasTxt.matchAll(/\{ slug: '([^']+)', cat: '([^']+)'/g)].map((m) => m[1]));
const quizzesTxt = await read('src/data/quizzes.ts');
const quizSlugs = new Set([...quizzesTxt.matchAll(/\{ slug: '([^']+)', cat: '([^']+)'/g)].map((m) => m[1]));
const sahihTxt = await read('src/data/hadees-sahih.ts');
const sahihSlugs = new Set([...sahihTxt.matchAll(/\{ slug: '([^']+)', num: \d+, sabaq: \d+/g)].map((m) => m[1]));
const meaningsTxt = await read('src/data/meanings.ts');
const meaningSlugs = new Set([...meaningsTxt.matchAll(/\{ slug: '([^']+)', term:/g)].map((m) => m[1]));
const kalimasTxt = await read('src/data/kalimas.ts');
const kalimaSlugs = new Set([...kalimasTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1]));
const duaCatSlugs = new Set([...duasTxt.matchAll(/\{ slug: '([^']+)', title:/g)].map((m) => m[1]));
/** Every slug a hub can link: guides, duas, dua cats, meanings, hadees, kalimas. */
const hubUnion = new Set([...guideSlugs, ...duaSlugs, ...duaCatSlugs, ...meaningSlugs, ...sahihSlugs, ...kalimaSlugs]);
for (const hub of ['RamadanHub', 'EidHub', 'HajjHub', 'UmrahHub']) {
  const t = await read(`src/components/${hub}.astro`);
  for (const m of t.matchAll(/\['([a-z0-9-]+)'(?:,\s*'([a-z0-9-]+)')*\]/g)) {
    const arr = m[0];
    for (const s of arr.matchAll(/'([a-z0-9-]+)'/g)) {
      const slug = s[1];
      if (!guideSlugs.has(slug) && !duaSlugs.has(slug)) fail(`${hub}: slug not found in guides/duas: ${slug}`);
    }
  }
  for (const m of t.matchAll(/quizBySlug\('([^']+)'\)/g)) {
    if (!quizSlugs.has(m[1])) fail(`${hub}: quiz not found: ${m[1]}`);
  }
  for (const m of t.matchAll(/sahihBySlug\('([^']+)'\)/g)) {
    if (!sahihSlugs.has(m[1])) fail(`${hub}: sahih hadees not found: ${m[1]}`);
  }
}
// 4b. Phase 9 aggregator hubs: every hard-coded content slug must resolve
// (union check — hubs only link existing verified pages, never new data).
for (const hub of ['HalalHub', 'AdabHub', 'NewMuslimHub', 'ZakatHub']) {
  const t = await read(`src/components/${hub}.astro`);
  for (const m of t.matchAll(/\['([a-z0-9-]+)'(?:,\s*'([a-z0-9-]+)')*\]/g)) {
    for (const s of m[0].matchAll(/'([a-z0-9-]+)'/g)) {
      if (!hubUnion.has(s[1])) fail(`${hub}: slug not found in guides/duas/cats/meanings/hadees/kalimas: ${s[1]}`);
    }
  }
  for (const m of t.matchAll(/slug: '([a-z0-9-]+)'/g)) {
    if (!hubUnion.has(m[1])) fail(`${hub}: step slug not found: ${m[1]}`);
  }
}
console.log('  hub slug lists resolve');

// 5. Route files exist.
for (const f of [
  'src/pages/calendar/[month].astro',
  'src/pages/[locale]/calendar/[month].astro',
  'src/pages/umrah.astro',
  'src/pages/[locale]/umrah.astro',
]) {
  try { await read(f); }
  catch { fail(`missing route file: ${f}`); }
}

console.log(`\ntopics: ${errors} error(s), ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
