// Nawawi library validator: 40 hadees, unique slugs/numbers 1-40,
// required fields, unique SEO keywords, no collisions (articles + kids slugs).
// Run: npm run content:nawawi
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const txt = await readFile(join(ROOT, 'src', 'data', 'hadees-nawawi.ts'), 'utf8');
const kids = await readFile(join(ROOT, 'src', 'data', 'hadees.ts'), 'utf8');

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

const slugs = [...txt.matchAll(/slug: '([^']+)', num: \d+, sabaq:/g)].map((m) => m[1]);
const nums = [...txt.matchAll(/num: (\d+), sabaq:/g)].map((m) => Number(m[1]));
if (slugs.length !== 40) fail(`expected 40 nawawi hadees, found ${slugs.length}`);
if (new Set(slugs).size !== slugs.length) fail('duplicate nawawi slugs');
if (JSON.stringify([...nums].sort((a, b) => a - b)) !== JSON.stringify(Array.from({ length: 40 }, (_, i) => i + 1))) fail('nawawi numbers must be 1-40');
if (!slugs.every((s) => s.startsWith('nawawi-'))) fail('all nawawi slugs must start with nawawi-');

const starts = [...txt.matchAll(/\{ slug: '[^']+', num: \d+, sabaq:/g)].map((m) => m.index);
const required = ['title:', 'arabic:', 'translit:', 'translation:', 'urdu:', 'lesson:', 'source:', 'grade:', 'keywords:', 'aliases:'];
starts.forEach((s, i) => {
  const e = i + 1 < starts.length ? starts[i + 1] : txt.length;
  const body = txt.slice(s, e);
  for (const f of required) if (!body.includes(f)) fail(`nawawi ${slugs[i]} missing ${f}`);
});

const kws = [...txt.matchAll(/keywords: '([^']+)'/g)].map((m) => m[1]);
if (new Set(kws).size !== kws.length) fail('duplicate SEO keywords');
for (const k of kws) if (k.split(',').length < 3) fail(`weak keywords: ${k.slice(0, 60)}…`);

const kidSlugs = new Set([...kids.matchAll(/slug: '([^']+)', num: \d+, sabaq:/g)].map((m) => m[1]));
for (const s of slugs) if (kidSlugs.has(s)) fail(`slug collision with kids hadees: ${s}`);

const artDir = join(ROOT, 'src', 'content', 'articles');
const artSlugs = new Set();
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.mdx?$/.test(e.name)) {
      const t = await readFile(p, 'utf8');
      if (/category:\s*["']?hadees/.test(t)) artSlugs.add(basename(e.name).replace(/\.mdx?$/, ''));
    }
  }
}
await walk(artDir);
for (const s of slugs) if (artSlugs.has(s)) fail(`slug collision with article: ${s}`);

for (const g of [...txt.matchAll(/grade: '([^']+)'/g)].map((m) => m[1])) {
  if (!['Sahih', 'Hasan'].includes(g)) fail(`bad grade: ${g}`);
}

console.log(`\n📊 Nawawi: ${slugs.length} — nums 1-40 ok`);
console.log(`📊 Search index entries per locale: +${slugs.length} (nawawi hadees)`);
if (errors) { console.error(`\n${errors} error(s).`); process.exit(1); }
console.log('✅ hadees-nawawi.ts valid — 40 hadees, unique SEO keywords, no collisions.');
