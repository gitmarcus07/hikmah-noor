// Names validator: 99 Allah names + 99 Prophet names.
// Checks counts, sequential numbering, required fields, slug uniqueness
// (mirrors src/data/names.ts), translation completeness (ur/hi/ar),
// prophet source-kind buckets, and duplicate slugs.
// Run: npm run content:names
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFile(join(ROOT, p), 'utf8');

let errors = 0;
let warnings = 0;
const fail = (msg) => { errors++; console.error('X ' + msg); };
const warn = (msg) => { warnings++; console.warn('! ' + msg); };

const nameSlugify = (s) => s.toLowerCase().replace(/[’‘'`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const parseNames = (txt) => [...txt.matchAll(/\{ n: (\d+), arabic: ('[^']*'|"[^"]*"), translit: ('[^']*'|"[^"]*"), meaning: ('[^']*'|"[^"]*")[^}]*\}/g)]
  .map((m) => ({ n: +m[1], arabic: m[2].slice(1, -1), translit: m[3].slice(1, -1), meaning: m[4].slice(1, -1), detail: /detail: ('[^']*'|"[^"]*")/.test(m[0]) }));

const checkList = (label, rows, overrides = {}) => {
  console.log(`  ${label}: ${rows.length} entries`);
  if (rows.length !== 99) fail(`${label}: expected 99 entries, found ${rows.length}`);
  const ns = rows.map((r) => r.n).sort((a, b) => a - b);
  if (!ns.every((v, i) => v === i + 1)) fail(`${label}: numbering is not sequential 1-99`);
  for (const r of rows) {
    if (!r.arabic) fail(`${label} n=${r.n}: missing arabic`);
    if (!r.translit) fail(`${label} n=${r.n}: missing translit`);
    if (!r.meaning) fail(`${label} n=${r.n}: missing meaning`);
    if (label === 'allah' && !r.detail) fail(`${label} n=${r.n}: missing detail`);
  }
  const seen = new Map();
  const slugs = new Map();
  for (const r of rows) {
    let slug = overrides[r.n] ?? nameSlugify(r.translit);
    if (seen.has(slug)) slug = `${r.n}-${slug}`;
    if (seen.has(slug)) fail(`${label} n=${r.n}: duplicate slug even after numbering: ${slug}`);
    seen.set(slug, r.n);
    slugs.set(r.n, slug);
  }
  return slugs;
};

const allahTxt = await read('src/data/names-allah.ts');
const prophetTxt = await read('src/data/names-prophet.ts');
const allahSlugs = checkList('allah', parseNames(allahTxt), { 49: '49-al-majid', 66: '66-al-majid' });
const prophetSlugs = checkList('prophet', parseNames(prophetTxt));

// Translation completeness (keyed by number in names-{ur,hi,ar}.ts).
for (const l of ['ur', 'hi', 'ar']) {
  const t = await read(`src/data/i18n/names-${l}.ts`);
  for (const [name, map] of [['NAMES_ALLAH', allahSlugs], ['NAMES_PROPHET', prophetSlugs]]) {
    const m = t.match(new RegExp(`export const ${name}_${l.toUpperCase()}[^=]*= \\{([\\s\\S]*?)\\n\\};`));
    if (!m) { fail(`names-${l}.ts: missing ${name}_${l.toUpperCase()}`); continue; }
    const keys = new Set([...m[1].matchAll(/['"]?(\d+)['"]?\s*:/g)].map((x) => +x[1]));
    const missing = [...map.keys()].filter((n) => !keys.has(n));
    if (missing.length) fail(`names-${l}.ts ${name}: missing translations for n=${missing.join(',')}`);
    else console.log(`  ${l} ${name}: 99/99 translations`);
  }
}

// Prophet source-kind buckets must match the repo-documented sets.
const relationsTxt = await read('src/data/relations.ts');
const namesTxt = await read('src/data/names.ts');
for (const slug of ['taha', 'yasin', 'muhammad', 'ahmad', 'muzammil', 'mudaththir', 'abdullah']) {
  if (!namesTxt.includes(`'${slug}'`)) fail(`names.ts: quranic bucket missing ${slug}`);
}
for (const slug of ['shahid', 'bashir', 'nadhir', 'siraj', 'munir', 'mahi', 'hashir', 'aqib']) {
  if (!namesTxt.includes(`'${slug}'`)) fail(`names.ts: hadith bucket missing ${slug}`);
}
// Every prophet-name->surah edge source must be a quranic-kind slug.
const edgeSrcs = [...relationsTxt.match(/const PROPHET_NAME_SURAHS[\s\S]*?^};/m)?.[0].matchAll(/'([\w-]+)': \[/g) ?? []].map((m) => m[1]);
const quranic = new Set(['taha', 'yasin', 'muhammad', 'ahmad', 'muzammil', 'mudaththir', 'abdullah']);
for (const s of edgeSrcs) {
  if (!quranic.has(s)) fail(`PROPHET_NAME_SURAHS source is not a Quranic-kind title: ${s}`);
  if (!prophetSlugs.has([...prophetSlugs.entries()].find(([, v]) => v === s)?.[0] ?? -1) && ![...prophetSlugs.values()].includes(s)) fail(`PROPHET_NAME_SURAHS source slug not found: ${s}`);
}

// Route files must exist.
for (const f of [
  'src/pages/names-of-allah/[slug].astro',
  'src/pages/[locale]/names-of-allah/[slug].astro',
  'src/pages/names-muhammad/[slug].astro',
  'src/pages/[locale]/names-muhammad/[slug].astro',
]) {
  try { await readFile(join(ROOT, f)); }
  catch { fail(`missing route file: ${f}`); }
}

console.log(`\nnames: ${errors} error(s), ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
