// Guides validator: unique slugs, valid categories, required fields.
// Run: npm run content:guides
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const txt = await readFile(join(ROOT, 'src', 'data', 'guides.ts'), 'utf8');

const cats = [...txt.matchAll(/slug: '([^']+)', title:/g)].map((m) => m[1]);
const catSet = new Set(cats);
const guides = [...txt.matchAll(/\{ slug: '([^']+)', cat: '([^']+)'/g)].map((m) => ({ slug: m[1], cat: m[2] }));

let errors = 0;
const fail = (msg) => { errors++; console.error('FAIL ' + msg); };

const seen = new Set();
for (const g of guides) {
  if (seen.has(g.slug)) fail(`duplicate guide slug: ${g.slug}`);
  seen.add(g.slug);
  if (!catSet.has(g.cat)) fail(`guide ${g.slug} has unknown category: ${g.cat}`);
}
const routes = new Set(guides.map((g) => `${g.cat}/${g.slug}`));
if (routes.size !== guides.length) fail('duplicate guide routes detected');

const starts = [...txt.matchAll(/\{ slug: '[^']+', cat: '/g)].map((m) => m.index);
const required = ['title:', 'intro:', 'sections:', 'ref:', 'faq:'];
starts.forEach((s, i) => {
  const e = i + 1 < starts.length ? starts[i + 1] : txt.length;
  const body = txt.slice(s, e);
  const slug = guides[i]?.slug ?? `#${i + 1}`;
  for (const f of required) if (!body.includes(f)) fail(`guide ${slug} missing ${f}`);
});

console.log(`\nCategories: ${cats.length} - ${cats.join(', ')}`);
console.log(`Guides: ${guides.length}`);
if (errors) { console.error(`\n${errors} error(s). Fix before building.`); process.exit(1); }
console.log('\nOK guides.ts valid.');
