// Prophets library validator: 25 stories in order, unique slugs/motifs/orders,
// required fields, no collisions with waqiat slugs or prophets article slugs.
// Run: npm run content:prophets
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src', 'data', 'prophets.ts');
const WAQIAT_FILE = join(ROOT, 'src', 'data', 'waqiat.ts');
const txt = await readFile(FILE, 'utf8');
const waqiatTxt = await readFile(WAQIAT_FILE, 'utf8');

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

const slugs = [...txt.matchAll(/slug: '([^']+)', order:/g)].map((m) => m[1]);
if (slugs.length !== 25) fail(`expected 25 prophets, found ${slugs.length}`);
if (new Set(slugs).size !== slugs.length) fail('duplicate prophet slugs');

const orders = [...txt.matchAll(/order: (\d+), name:/g)].map((m) => Number(m[1]));
const sorted = [...orders].sort((a, b) => a - b);
if (JSON.stringify(sorted) !== JSON.stringify(Array.from({ length: 25 }, (_, i) => i + 1))) fail(`orders must be 1-25 exactly once, found: ${orders.join(',')}`);

const starts = [...txt.matchAll(/\{ slug: '[^']+', order:/g)].map((m) => m.index);
const required = ['title:', 'name:', 'era:', 'arabic:', 'translit:', 'summary:', 'narrative:', 'events:', 'lessons:', 'quranRef:', 'aliases:', 'motif:', 'accent:'];
starts.forEach((s, i) => {
  const body = txt.slice(s, i + 1 < starts.length ? starts[i + 1] : txt.length);
  for (const f of required) if (!body.includes(f)) fail(`prophet ${slugs[i]} missing ${f}`);
  const era = (body.match(/era: '([^']+)'/) || [])[1];
  if (!['Early', 'Patriarchs', 'Exodus & Kings', 'Late & Final'].includes(era)) fail(`prophet ${slugs[i]} bad era: ${era}`);
});

const motifList = [...txt.matchAll(/motif: '([^']+)'/g)].map((m) => m[1]);
if (new Set(motifList).size !== motifList.length) fail('motifs must be unique per prophet');

// No collisions with waqiat data slugs (separate hubs, distinct URLs)
const waqiatSlugs = new Set([...waqiatTxt.matchAll(/slug: '([^']+)', title:/g)].map((m) => m[1]));
for (const s of slugs) if (waqiatSlugs.has(s)) fail(`slug collision with waqiat: ${s}`);

// No collisions with prophets article slugs (EN + locale share /prophets/:slug/)
const artDir = join(ROOT, 'src', 'content', 'articles');
const artSlugs = new Set();
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.mdx?$/.test(e.name)) {
      const t = await readFile(p, 'utf8');
      if (/category:\s*["']?prophets/.test(t)) artSlugs.add(basename(e.name).replace(/\.mdx?$/, ''));
    }
  }
}
await walk(artDir);
for (const s of slugs) if (artSlugs.has(s)) fail(`slug collision with article: ${s}`);

console.log(`\n📊 Prophets: ${slugs.length} — orders ${sorted[0]}-${sorted[sorted.length - 1]}`);
console.log(`📊 Search index entries per locale: ${1 + slugs.length} (hub + prophets)`);
if (errors) { console.error(`\n${errors} error(s).`); process.exit(1); }
console.log('✅ prophets.ts valid — 25 in order, unique slugs/motifs, no collisions, fields present.');
