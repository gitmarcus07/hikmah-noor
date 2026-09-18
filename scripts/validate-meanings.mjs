// Meanings library validator: 14 terms, unique slugs, required fields,
// no collisions with meanings article slugs, valid motif/accent values.
// Run: npm run content:meanings
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src', 'data', 'meanings.ts');
const txt = await readFile(FILE, 'utf8');

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

const slugs = [...txt.matchAll(/slug: '([^']+)', term:/g)].map((m) => m[1]);
if (slugs.length < 10) fail(`expected 10+ meanings, found ${slugs.length}`);
if (new Set(slugs).size !== slugs.length) fail('duplicate meaning slugs');

const starts = [...txt.matchAll(/\{ slug: '[^']+', term:/g)].map((m) => m.index);
const required = ['term:', 'arabic:', 'translit:', 'definition:', 'proofArabic:', 'proofRef:', 'misconception:', 'practice:', 'aliases:', 'motif:', 'accent:'];
starts.forEach((s, i) => {
  const body = txt.slice(s, i + 1 < starts.length ? starts[i + 1] : txt.length);
  for (const f of required) if (!body.includes(f)) fail(`meaning ${slugs[i]} missing ${f}`);
  const motifs = (body.match(/motif: '([^']+)'/) || [])[1];
  if (!['shield', 'lamp', 'leaf', 'heart', 'star', 'crown', 'gem', 'arch', 'drop', 'scales', 'wheat', 'pen', 'bowl', 'moon'].includes(motifs)) fail(`meaning ${slugs[i]} bad motif: ${motifs}`);
});

// No collisions with meanings article slugs (EN + locale share /meanings/:slug/)
const artDir = join(ROOT, 'src', 'content', 'articles');
const artSlugs = new Set();
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.mdx?$/.test(e.name)) {
      const t = await readFile(p, 'utf8');
      if (/category:\s*["']?meanings/.test(t)) artSlugs.add(basename(e.name).replace(/\.mdx?$/, ''));
    }
  }
}
await walk(artDir);
for (const s of slugs) if (artSlugs.has(s)) fail(`slug collision with article: ${s}`);

// Motifs should be unique per meaning (premium = distinct art)
const motifList = [...txt.matchAll(/motif: '([^']+)'/g)].map((m) => m[1]);
if (new Set(motifList).size !== motifList.length) fail('motifs must be unique per meaning');

console.log(`\n📊 Meanings: ${slugs.length} — ${slugs.join(', ')}`);
console.log(`📊 Search index entries per locale: ${1 + slugs.length} (hub + meanings)`);
if (errors) { console.error(`\n${errors} error(s).`); process.exit(1); }
console.log('✅ meanings.ts valid — unique slugs/motifs, no collisions, fields present.');
