// Kalima library validator: 6 kalimas, unique slugs/numbers, required fields,
// no collisions with kalima article slugs, valid origin/grade values.
// Run: npm run content:kalimas
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src', 'data', 'kalimas.ts');
const txt = await readFile(FILE, 'utf8');

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

const slugs = [...txt.matchAll(/slug: '([^']+)', num:/g)].map((m) => m[1]);
const nums = [...txt.matchAll(/num: (\d), title:/g)].map((m) => Number(m[1]));
if (slugs.length !== 6) fail(`expected 6 kalimas, found ${slugs.length}`);
if (new Set(slugs).size !== slugs.length) fail('duplicate kalima slugs');
if (JSON.stringify([...nums].sort((a, b) => a - b)) !== '[1,2,3,4,5,6]') fail(`kalima numbers must be 1-6, found ${nums}`);

// Required fields per entry
const starts = [...txt.matchAll(/\{ slug: '[^']+', num:/g)].map((m) => m.index);
const required = ['title:', 'arabic:', 'translit:', 'translation:', 'virtue:', 'source:', 'when:', 'repeat:', 'origin:', 'grade:', 'aliases:'];
starts.forEach((s, i) => {
  const body = txt.slice(s, i + 1 < starts.length ? starts[i + 1] : txt.length);
  for (const f of required) if (!body.includes(f)) fail(`kalima ${slugs[i]} missing ${f}`);
});

// No collisions with kalima article slugs (EN + locale share /kalimas/:slug/)
const artDir = join(ROOT, 'src', 'content', 'articles');
const artSlugs = new Set();
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.mdx?$/.test(e.name)) {
      const t = await readFile(p, 'utf8');
      if (/category:\s*["']?kalimas/.test(t)) artSlugs.add(basename(e.name).replace(/\.mdx?$/, ''));
    }
  }
}
await walk(artDir);
for (const s of slugs) if (artSlugs.has(s)) fail(`slug collision with article: ${s}`);

// Valid origin/grade values
for (const o of [...txt.matchAll(/origin: '([^']+)'/g)].map((m) => m[1])) {
  if (!['quran', 'hadith', 'sahaba', 'scholarly'].includes(o)) fail(`bad origin: ${o}`);
}
for (const g of [...txt.matchAll(/grade: '([^']+)'/g)].map((m) => m[1])) {
  if (!['Quranic', 'Sahih', 'Hasan', 'Daif', 'Scholarly compilation'].includes(g)) fail(`bad grade: ${g}`);
}

console.log(`\n📊 Kalimas: ${slugs.length} — ${slugs.join(', ')}`);
console.log(`📊 Search index entries per locale: ${1 + slugs.length} (hub + kalimas)`);
if (errors) { console.error(`\n${errors} error(s).`); process.exit(1); }
console.log('✅ kalimas.ts valid — 6 kalimas, no collisions, sourcing fields present.');
