// Phase 8 Hadith-collection validator: integrity of the canonical dataset
// (src/data/hadith/*.json), registry consistency, migration mapping,
// relationship edges, search wiring, i18n coverage and route files.
// Source-level (no build required). Run: npm run content:hadith
import { readFile, access, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFile(join(ROOT, p), 'utf8');
const exists = async (p) => { try { await access(join(ROOT, p), constants.F_OK); return true; } catch { return false; } };

let errors = 0;
let warnings = 0;
const fail = (msg) => { errors++; console.error('X ' + msg); };
const warn = (msg) => { warnings++; console.warn('! ' + msg); };

// 1. Dataset files present (one JSON per collection).
const dataDir = join(ROOT, 'src', 'data', 'hadith');
let datasets = [];
try {
  datasets = (await readdir(dataDir)).filter((f) => f.endsWith('.json'));
} catch { fail('src/data/hadith/ directory missing'); }
if (!datasets.length) fail('no collection datasets in src/data/hadith/');
console.log(`  datasets: ${datasets.join(', ') || '(none)'}`);

let totalHadith = 0;
for (const file of datasets) {
  const d = JSON.parse(await read(`src/data/hadith/${file}`));
  const tag = file;

  // 1a. Provenance block complete.
  for (const k of ['collection', 'compiler', 'sourceRepo', 'sourceLicense', 'editionsUsed', 'editionUrls', 'retrievedUtc', 'numbering', 'languages', 'missingLanguages', 'notes']) {
    if (d.provenance?.[k] === undefined) fail(`${tag}: provenance.${k} missing`);
  }

  // 1b. Collection + books shape; book ranges partition hadith exactly.
  if (!d.collection?.id || !d.collection?.slug || !d.collection?.name || !d.collection?.description) {
    fail(`${tag}: collection id/slug/name/description required`);
  }
  if (!Array.isArray(d.books) || !d.books.length) fail(`${tag}: at least one book required`);
  const bookNums = new Set();
  for (const b of d.books ?? []) {
    for (const k of ['id', 'num', 'slug', 'title', 'first', 'last']) {
      if (b[k] === undefined) fail(`${tag}: book missing ${k}`);
    }
    if (bookNums.has(b.num)) fail(`${tag}: duplicate book num ${b.num}`);
    bookNums.add(b.num);
  }

  // 1c. Hadith: sequential per collection, non-empty verified fields only.
  const ALLOWED_KEYS = new Set(['id', 'num', 'book', 'arabic', 'english', 'reference']);
  const ids = new Set();
  const nums = (d.hadith ?? []).map((h) => h.num);
  (d.hadith ?? []).forEach((h, i) => {
    for (const k of Object.keys(h)) {
      if (!ALLOWED_KEYS.has(k)) fail(`${tag} hadith ${h.num}: unexpected field '${k}' (only verified source fields allowed)`);
    }
    if (ids.has(h.id)) fail(`${tag}: duplicate hadith id ${h.id}`);
    ids.add(h.id);
    if (!h.arabic?.trim() || !h.english?.trim() || !h.reference?.trim()) fail(`${tag} hadith ${h.num}: empty arabic/english/reference`);
    if (/\(\?\)/.test(h.arabic) || /\(\?\)/.test(h.english)) fail(`${tag} hadith ${h.num}: encoding artifact "(?)"`);
    if (!bookNums.has(h.book)) fail(`${tag} hadith ${h.num}: orphan book ${h.book}`);
  });
  const sorted = [...nums].sort((a, b) => a - b);
  if (JSON.stringify(nums) !== JSON.stringify(sorted)) fail(`${tag}: hadith not in source order`);
  // Book ranges must cover every hadith number exactly once.
  for (const b of d.books ?? []) {
    for (let n = b.first; n <= b.last; n++) {
      const h = (d.hadith ?? []).find((x) => x.num === n && x.book === b.num);
      if (!h) fail(`${tag}: book ${b.num} range gap at hadith ${n}`);
    }
  }
  totalHadith += (d.hadith ?? []).length;
  console.log(`  ${tag}: ${(d.hadith ?? []).length} hadith, ${(d.books ?? []).length} book(s), ids unique, ranges exact`);
}

// 2. Registry consistency (hadith-collections.ts).
const regTxt = await read('src/data/hadith-collections.ts');
for (const file of datasets) {
  const d = JSON.parse(await read(`src/data/hadith/${file}`));
  if (!regTxt.includes(`'${d.collection.id}'`) && !regTxt.includes(`"${d.collection.id}"`)) {
    fail(`registry does not reference collection ${d.collection.id}`);
  }
}
// 2b. NAWAWI_STUDY: keys exactly 1-40, slugs exist in curated nawawi dataset.
const nawawiTxt = await read('src/data/hadees-nawawi.ts');
const curatedSlugs = new Set([...nawawiTxt.matchAll(/slug: '([^']+)', num: \d+, sabaq:/g)].map((m) => m[1]));
const studyBody = regTxt.match(/NAWAWI_STUDY[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? '';
const studyRows = [...studyBody.matchAll(/(\d+): '([^']+)'/g)].map((m) => ({ n: +m[1], slug: m[2] }));
const studyNums = studyRows.map((r) => r.n).sort((a, b) => a - b);
if (JSON.stringify(studyNums) !== JSON.stringify(Array.from({ length: 40 }, (_, i) => i + 1))) {
  fail(`NAWAWI_STUDY must map exactly numbers 1-40 (found ${studyNums.length})`);
}
for (const r of studyRows) {
  if (!curatedSlugs.has(r.slug)) fail(`NAWAWI_STUDY ${r.n}: curated slug not found: ${r.slug}`);
}
console.log(`  study mapping: ${studyRows.length} verified pairs (canonical 1-40 -> curated slugs)`);

// 3. Relationship edges: the 5n loop consumes NAWAWI_STUDY (study slugs are
// passed via variable, so assert the loop + import instead of literals);
// the explicit Jibril meaning edges ARE literal — assert them directly.
const relationsTxt = await read('src/data/relations.ts');
if (!/NAWAWI_STUDY/.test(relationsTxt)) fail('relations.ts: NAWAWI_STUDY not used');
if (!/for \(const \[num, studySlug\] of Object\.entries\(NAWAWI_STUDY\)\)/.test(relationsTxt)) {
  fail('relations.ts: missing 5n study-edge loop over NAWAWI_STUDY');
}
if (!relationsTxt.includes("addEntry('hadith-entry', '2'")) fail("relations.ts: missing hadith-entry '2' meaning edges");
for (const s of ['iman', 'ihsan']) {
  if (!relationsTxt.includes(`slug: '${s}'`)) fail(`relations.ts: Jibril meaning target missing: ${s}`);
}
console.log('  relations: 5n study-edge loop + Jibril meaning edges declared');

// 4. Search wiring: builder includes collection docs.
const searchTxt = await read('src/lib/search.ts');
if (!searchTxt.includes('hadithCollectionIndexItems')) fail('search.ts: hadithCollectionIndexItems missing');
console.log('  search: hadithCollectionIndexItems wired');

// 5. i18n: HADEES_UI coll key parity across en/ur/hi/ar.
// Isolate the HADEES_UI block first (other UI consts share locale keys).
const siteUi2 = await read('src/lib/site-ui-2.ts');
const hadeesBlock = siteUi2.match(/export const HADEES_UI[\s\S]*?^};/m)?.[0] ?? '';
if (!hadeesBlock) fail('site-ui-2.ts: HADEES_UI block not found');
const collKeySets = {};
for (const lm of hadeesBlock.matchAll(/^  (en|ur|hi|ar): \{/gm)) {
  const rest = hadeesBlock.slice(lm.index);
  // locale block ends where the next locale starts (or the const ends)
  const next = rest.slice(10).search(/^  (en|ur|hi|ar): \{/m);
  const body = next < 0 ? rest : rest.slice(0, 10 + next);
  const cs = body.indexOf('coll: {');
  if (cs < 0) { fail(`site-ui-2.ts: ${lm[1]} HADEES_UI coll block missing`); continue; }
  // balanced-brace scan for the coll object
  let depth = 0, end = -1;
  for (let i = cs + 'coll: '.length; i < body.length; i++) {
    if (body[i] === '{') depth++;
    else if (body[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) { fail(`site-ui-2.ts: ${lm[1]} coll block unbalanced`); continue; }
  const collBody = body.slice(cs, end + 1);
  // Object keys are `word: 'value'` pairs (values are single-line quoted
  // prose; the balanced scan above already isolated the coll object).
  collKeySets[lm[1]] = new Set([...collBody.matchAll(/([A-Za-z]\w*): '/g)].map((k) => k[1]));
  if (!collKeySets[lm[1]].size) fail(`site-ui-2.ts: ${lm[1]} coll keys empty`);
}
const ref = collKeySets.en ?? new Set();
for (const l of ['ur', 'hi', 'ar']) {
  for (const k of ref) if (!collKeySets[l]?.has(k)) fail(`site-ui-2.ts: coll.${k} missing in ${l}`);
  for (const k of collKeySets[l] ?? []) if (!ref.has(k)) fail(`site-ui-2.ts: coll.${k} extra in ${l} (not in en)`);
}
console.log(`  i18n: coll keys parity ok (${ref.size} keys x 4 locales)`);

// 6. Route files exist (EN + locale mirrors, static per collection).
for (const file of datasets) {
  const d = JSON.parse(await read(`src/data/hadith/${file}`));
  for (const b of d.books) {
    const base = `hadees/${d.collection.slug}`;
    for (const f of [
      `src/pages/${base}/index.astro`,
      `src/pages/${base}/${b.slug}/index.astro`,
      `src/pages/${base}/${b.slug}/[num].astro`,
      `src/pages/[locale]/${base}/index.astro`,
      `src/pages/[locale]/${base}/${b.slug}/index.astro`,
      `src/pages/[locale]/${base}/${b.slug}/[num].astro`,
    ]) {
      if (!(await exists(f))) fail(`missing route file: ${f}`);
    }
  }
}
console.log('  routes: collection/book/[num] EN + locale files present');

// 7. No parallel /hadith/ route namespace (repo convention is /hadees/).
// (Skips import lines — './hadith/nawawi.json' is a data path, not a route.)
const pagesTxt = await read('src/data/hadith-collections.ts');
for (const line of pagesTxt.split('\n')) {
  if (/^\s*import /.test(line)) continue;
  if (/[`'"]\/hadith\//.test(line)) fail(`hadith-collections.ts: parallel /hadith/ route namespace: ${line.trim().slice(0, 80)}`);
}
console.log('  canonical base: /hadees/ (no parallel namespace)');

console.log(`\nhadith: ${totalHadith} canonical entries, ${errors} error(s), ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
