// Sahaba library validator: 24 companions in order, unique slugs/motifs/orders,
// required fields, no collisions with waqiat slugs or sahaba article slugs.
// Run: npm run content:sahaba
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src', 'data', 'sahaba.ts');
const WAQIAT_FILE = join(ROOT, 'src', 'data', 'waqiat.ts');
const txt = await readFile(FILE, 'utf8');
const waqiatTxt = await readFile(WAQIAT_FILE, 'utf8');

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

const slugs = [...txt.matchAll(/slug: '([^']+)', order:/g)].map((m) => m[1]);
if (slugs.length !== 24) fail(`expected 24 companions, found ${slugs.length}`);
if (new Set(slugs).size !== slugs.length) fail('duplicate sahabi slugs');

const orders = [...txt.matchAll(/order: (\d+), name:/g)].map((m) => Number(m[1]));
const sorted = [...orders].sort((a, b) => a - b);
if (JSON.stringify(sorted) !== JSON.stringify(Array.from({ length: 24 }, (_, i) => i + 1))) fail(`orders must be 1-24 exactly once, found: ${orders.join(',')}`);

const starts = [...txt.matchAll(/\{ slug: '[^']+', order:/g)].map((m) => m.index);
const required = ['title:', 'name:', 'era:', 'arabic:', 'translit:', 'summary:', 'narrative:', 'events:', 'lessons:', 'references:', 'aliases:', 'motif:', 'accent:'];
starts.forEach((s, i) => {
  const body = txt.slice(s, i + 1 < starts.length ? starts[i + 1] : txt.length);
  for (const f of required) if (!body.includes(f)) fail(`sahabi ${slugs[i]} missing ${f}`);
  const era = (body.match(/era: '([^']+)'/) || [])[1];
  if (!['Makkah', 'Madinah'].includes(era)) fail(`sahabi ${slugs[i]} bad era: ${era}`);
});

const motifList = [...txt.matchAll(/motif: '([^']+)'/g)].map((m) => m[1]);
if (new Set(motifList).size !== motifList.length) fail('motifs must be unique per companion');

const waqiatSlugs = new Set([...waqiatTxt.matchAll(/slug: '([^']+)', title:/g)].map((m) => m[1]));
for (const s of slugs) if (waqiatSlugs.has(s)) fail(`slug collision with waqiat: ${s}`);

const artDir = join(ROOT, 'src', 'content', 'articles');
const artSlugs = new Set();
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.mdx?$/.test(e.name)) {
      const t = await readFile(p, 'utf8');
      if (/category:\s*["']?sahaba/.test(t)) artSlugs.add(basename(e.name).replace(/\.mdx?$/, ''));
    }
  }
}
await walk(artDir);
for (const s of slugs) if (artSlugs.has(s)) fail(`slug collision with article: ${s}`);

console.log(`\n📊 Sahaba: ${slugs.length} — orders ${sorted[0]}-${sorted[sorted.length - 1]}`);
console.log(`📊 Search index entries per locale: ${1 + slugs.length} (hub + companions)`);
if (errors) { console.error(`\n${errors} error(s).`); process.exit(1); }
console.log('✅ sahaba.ts valid — 24 in order, unique slugs/motifs, no collisions, fields present.');
