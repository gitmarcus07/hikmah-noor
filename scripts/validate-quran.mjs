// Quran validator: checks the canonical dataset behind individual Ayah pages.
// Verifies 114 surah files, sequential numbering, verseCount agreement,
// total ayah count, non-empty Arabic + ur/en/hi translations, no dupes,
// and that every para range resolves to real verses.
// Run: npm run content:quran
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFile(join(ROOT, p), 'utf8');

let errors = 0;
let warnings = 0;
const fail = (msg) => { errors++; console.error('X ' + msg); };
const warn = (msg) => { warnings++; console.warn('! ' + msg); };

const meta = JSON.parse(await read('src/data/surahs-meta.json'));
if (meta.length !== 114) fail(`surahs-meta: expected 114, found ${meta.length}`);
const metaByNum = new Map(meta.map((s) => [s.num, s]));
for (let n = 1; n <= 114; n++) {
  if (!metaByNum.has(n)) fail(`surahs-meta: missing surah ${n}`);
}

const files = (await readdir(join(ROOT, 'src', 'data', 'surahs'))).filter((f) => f.endsWith('.json'));
if (files.length !== 114) fail(`surahs dir: expected 114 files, found ${files.length}`);

let total = 0;
for (let n = 1; n <= 114; n++) {
  let s;
  try {
    s = JSON.parse(await read(`src/data/surahs/${n}.json`));
  } catch {
    fail(`surah file missing/unparseable: ${n}.json`);
    continue;
  }
  const m = metaByNum.get(n);
  if (!m) continue;
  if (s.num !== n) fail(`surah ${n}.json: num field is ${s.num}`);
  if (s.slug !== m.slug) fail(`surah ${n}.json: slug mismatch (${s.slug} vs ${m.slug})`);
  const verses = Array.isArray(s.verses) ? s.verses : [];
  if (verses.length !== m.verseCount) {
    fail(`surah ${n}: file has ${verses.length} verses, meta says ${m.verseCount}`);
    continue;
  }
  const seen = new Set();
  verses.forEach((v, i) => {
    if (v.v !== i + 1) fail(`surah ${n}: verse at index ${i} has v=${v.v} (expected ${i + 1})`);
    if (seen.has(v.v)) fail(`surah ${n}: duplicate verse ${v.v}`);
    seen.add(v.v);
    if (!v.ar || !String(v.ar).trim()) fail(`surah ${n}:${v.v}: empty Arabic text`);
    for (const k of ['ur', 'en', 'hi']) {
      if (!v[k] || !String(v[k]).trim()) fail(`surah ${n}:${v.v}: empty ${k} translation`);
    }
  });
  total += verses.length;
}
console.log(`  surahs: 114 files, total ayahs: ${total}`);
if (total !== 6236) warn(`total is ${total}, expected 6236 per standard Madani mushaf counting`);

// Para ranges must resolve to real verses.
const paras = JSON.parse(await read('src/data/paras-meta.json'));
if (paras.length !== 30) fail(`paras-meta: expected 30, found ${paras.length}`);
const counts = new Map();
for (const p of paras) {
  for (const k of ['start', 'end']) {
    const r = p[k];
    const m = metaByNum.get(r.surah);
    if (!m) { fail(`para ${p.num}: unknown surah ${r.surah}`); continue; }
    if (r.verse < 1 || r.verse > m.verseCount) fail(`para ${p.num}: verse out of range ${r.surah}:${r.verse}`);
  }
  counts.set(p.num, (counts.get(p.num) ?? 0) + 1);
}
console.log('  paras: 30 ranges resolve');

console.log(`\nquran: ${errors} error(s), ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
