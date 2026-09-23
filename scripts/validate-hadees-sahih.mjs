// Sahih Selections validator: 40 hadees, unique slugs/numbers, required fields,
// unique SEO keywords per hadees.
// Run: npm run content:sahih
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src', 'data', 'hadees-sahih.ts');
const txt = await readFile(FILE, 'utf8');

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

const slugs = [...txt.matchAll(/slug: '([^']+)', num: \d+, sabaq:/g)].map((m) => m[1]);
const nums = [...txt.matchAll(/num: (\d+), sabaq:/g)].map((m) => Number(m[1]));
if (slugs.length !== 40) fail(`expected 40 hadees, found ${slugs.length}`);
if (new Set(slugs).size !== slugs.length) fail('duplicate hadees slugs');
if (JSON.stringify([...nums].sort((a, b) => a - b)) !== JSON.stringify(Array.from({ length: 40 }, (_, i) => i + 1))) fail(`hadees numbers must be 1-40, found ${nums}`);

const starts = [...txt.matchAll(/\{ slug: '[^']+', num: \d+, sabaq:/g)].map((m) => m.index);
const required = ['title:', 'arabic:', 'translit:', 'translation:', 'urdu:', 'lesson:', 'source:', 'grade:', 'keywords:', 'aliases:'];
starts.forEach((s, i) => {
  const body = txt.slice(s, i + 1 < starts.length ? starts[i + 1] : txt.length);
  for (const f of required) if (!body.includes(f)) fail(`hadees ${slugs[i]} missing ${f}`);
});

const kws = [...txt.matchAll(/keywords: '([^']+)'/g)].map((m) => m[1]);
if (new Set(kws).size !== kws.length) fail('duplicate SEO keywords — every hadees needs its own keywords');
for (const k of kws) if (k.split(',').length < 3) fail(`weak keywords (need 3+ phrases): ${k.slice(0, 60)}…`);

for (const g of [...txt.matchAll(/grade: '([^']+)'/g)].map((m) => m[1])) {
  if (!['Sahih', 'Hasan'].includes(g)) fail(`bad grade: ${g}`);
}

// No slug collisions with the other two hadees collections
const kids = await readFile(join(ROOT, 'src', 'data', 'hadees.ts'), 'utf8');
const nawawi = await readFile(join(ROOT, 'src', 'data', 'hadees-nawawi.ts'), 'utf8');
const other = new Set([
  ...[...kids.matchAll(/slug: '([^']+)', num: \d+, sabaq:/g)].map((m) => m[1]),
  ...[...nawawi.matchAll(/slug: '([^']+)'/g)].map((m) => m[1]),
]);
for (const s of slugs) if (other.has(s)) fail(`slug collision with kids/nawawi: ${s}`);

console.log(`\n📊 Sahih selections: ${slugs.length} — nums 1-40 ok`);
if (errors) { console.error(`\n${errors} error(s).`); process.exit(1); }
console.log('✅ hadees-sahih.ts valid — 40 hadees, unique SEO keywords, no collisions.');
