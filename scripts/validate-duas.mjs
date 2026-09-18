// Dua library validator: checks required fields, unique slugs, valid categories,
// sourcing fields for new entries, and reports counts per category/origin.
// Run: npm run content:duas
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src', 'data', 'duas.ts');
const txt = await readFile(FILE, 'utf8');

const cats = [...txt.matchAll(/slug: '([^']+)', title:/g)].map((m) => m[1]);
const catSet = new Set(cats);
const duaBlocks = [...txt.matchAll(/\{ slug: '([^']+)', cat: '([^']+)'/g)].map((m) => ({ slug: m[1], cat: m[2] }));

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

// 1. Unique slugs (slug alone must be unique — hub popularSlugs lookup is by slug)
const seen = new Set();
for (const d of duaBlocks) {
  if (seen.has(d.slug)) fail(`duplicate dua slug: ${d.slug}`);
  seen.add(d.slug);
  if (!catSet.has(d.cat)) fail(`dua ${d.slug} has unknown category: ${d.cat}`);
}
// 2. Unique full routes
const routes = new Set(duaBlocks.map((d) => `${d.cat}/${d.slug}`));
if (routes.size !== duaBlocks.length) fail('duplicate dua routes detected');

// 3. Required fields per dua object (slice text between consecutive dua starts)
const starts = [...txt.matchAll(/\{ slug: '[^']+', cat: '/g)].map((m) => m.index);
const required = ['title:', 'arabic:', 'translit:', 'translation:', 'source:', 'when:', 'repeat:'];
starts.forEach((s, i) => {
  const e = i + 1 < starts.length ? starts[i + 1] : txt.length;
  const body = txt.slice(s, e);
  const slug = duaBlocks[i]?.slug ?? `#${i + 1}`;
  for (const f of required) if (!body.includes(f)) fail(`dua ${slug} missing ${f}`);
  // New sourcing fields: warn (not fail) for legacy entries
  if (!body.includes('origin:') && !body.includes('grade:')) {
    console.warn(`⚠️  legacy entry without origin/grade (ok, derived at runtime): ${slug}`);
  }
});

// 4. Counts
const byCat = {};
for (const d of duaBlocks) byCat[d.cat] = (byCat[d.cat] || 0) + 1;
console.log(`\n📊 Categories: ${cats.length} — ${cats.join(', ')}`);
console.log(`📊 Duas: ${duaBlocks.length}`);
for (const [c, n] of Object.entries(byCat)) console.log(`   - ${c}: ${n}`);
console.log(`📊 Search index entries per locale: ${1 + cats.length + duaBlocks.length} (hub + cats + duas)`);

if (errors) { console.error(`\n${errors} error(s). Fix before building.`); process.exit(1); }
console.log('\n✅ duas.ts valid — no duplicates, all categories resolve, required fields present.');
