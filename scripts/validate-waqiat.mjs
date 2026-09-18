// Waqiat library validator: 10 stories, unique slugs/motifs, required fields,
// no collisions with waqiat article slugs.
// Run: npm run content:waqiat
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src', 'data', 'waqiat.ts');
const txt = await readFile(FILE, 'utf8');

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

const slugs = [...txt.matchAll(/slug: '([^']+)', title:/g)].map((m) => m[1]);
if (slugs.length < 8) fail(`expected 8+ stories, found ${slugs.length}`);
if (new Set(slugs).size !== slugs.length) fail('duplicate waqiah slugs');

const starts = [...txt.matchAll(/\{ slug: '[^']+', title:/g)].map((m) => m.index);
const required = ['title:', 'prophet:', 'arabic:', 'translit:', 'summary:', 'narrative:', 'events:', 'lessons:', 'quranRef:', 'aliases:', 'motif:', 'accent:'];
starts.forEach((s, i) => {
  const body = txt.slice(s, i + 1 < starts.length ? starts[i + 1] : txt.length);
  for (const f of required) if (!body.includes(f)) fail(`waqiah ${slugs[i]} missing ${f}`);
  const motifs = (body.match(/motif: '([^']+)'/) || [])[1];
  if (!['well', 'fire', 'waves', 'ship', 'whale', 'mountain', 'crown', 'sling', 'palm', 'cave'].includes(motifs)) fail(`waqiah ${slugs[i]} bad motif: ${motifs}`);
});

// No collisions with waqiat article slugs (EN + locale share /waqiat/:slug/)
const artDir = join(ROOT, 'src', 'content', 'articles');
const artSlugs = new Set();
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.mdx?$/.test(e.name)) {
      const t = await readFile(p, 'utf8');
      if (/category:\s*["']?waqiat/.test(t)) artSlugs.add(basename(e.name).replace(/\.mdx?$/, ''));
    }
  }
}
await walk(artDir);
for (const s of slugs) if (artSlugs.has(s)) fail(`slug collision with article: ${s}`);

const motifList = [...txt.matchAll(/motif: '([^']+)'/g)].map((m) => m[1]);
if (new Set(motifList).size !== motifList.length) fail('motifs must be unique per story');

console.log(`\n📊 Waqiat: ${slugs.length} — ${slugs.join(', ')}`);
console.log(`📊 Search index entries per locale: ${1 + slugs.length} (hub + stories)`);
if (errors) { console.error(`\n${errors} error(s).`); process.exit(1); }
console.log('✅ waqiat.ts valid — unique slugs/motifs, no collisions, fields present.');
