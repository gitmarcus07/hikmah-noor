// Seerat library validator: 16 chapters, unique slugs/numbers, required fields,
// unique SEO keywords per chapter, no collisions with article slugs.
// Run: npm run content:seerat
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src', 'data', 'seerah.ts');
const txt = await readFile(FILE, 'utf8');

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

const slugs = [...txt.matchAll(/slug: '([^']+)', num: \d+, era:/g)].map((m) => m[1]);
const nums = [...txt.matchAll(/num: (\d+), era:/g)].map((m) => Number(m[1]));
if (slugs.length !== 16) fail(`expected 16 chapters, found ${slugs.length}`);
if (new Set(slugs).size !== slugs.length) fail('duplicate chapter slugs');
if (JSON.stringify([...nums].sort((a, b) => a - b)) !== JSON.stringify(Array.from({ length: 16 }, (_, i) => i + 1))) fail(`chapter numbers must be 1-16, found ${nums}`);

// Required fields per entry
const starts = [...txt.matchAll(/\{ slug: '[^']+', num: \d+, era:/g)].map((m) => m.index);
const required = ['title:', 'arabic:', 'translit:', 'summary:', 'events:', 'lessons:', 'narrative:', 'references:', 'keywords:', 'aliases:', 'motif:', 'accent:'];
starts.forEach((s, i) => {
  const body = txt.slice(s, i + 1 < starts.length ? starts[i + 1] : txt.length);
  for (const f of required) if (!body.includes(f)) fail(`chapter ${slugs[i]} missing ${f}`);
});

// Unique SEO keywords per chapter
const kws = [...txt.matchAll(/keywords: '([^']+)'/g)].map((m) => m[1]);
if (new Set(kws).size !== kws.length) fail('duplicate SEO keywords — every chapter needs its own keywords');
for (const k of kws) if (k.split(',').length < 3) fail(`weak keywords (need 3+ phrases): ${k.slice(0, 60)}…`);

// Every chapter should be findable via seerah/seerat/serat spellings
for (let i = 0; i < kws.length; i++) {
  const k = kws[i].toLowerCase();
  if (!k.includes('seer') && !k.includes('serat') && !k.includes('serat')) fail(`chapter ${slugs[i]} keywords miss seerah/seerat/serat coverage`);
}

// No collisions with article slugs (EN + locale share /seerat/:slug/)
const artDir = join(ROOT, 'src', 'content', 'articles');
const artSlugs = new Set();
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.mdx?$/.test(e.name)) {
      const t = await readFile(p, 'utf8');
      if (/category:\s*["']?seerat/.test(t)) artSlugs.add(basename(e.name).replace(/\.mdx?$/, ''));
    }
  }
}
await walk(artDir);
for (const s of slugs) if (artSlugs.has(s)) fail(`slug collision with article: ${s}`);

console.log(`\n📊 Seerat chapters: ${slugs.length} — nums 1-16 ok`);
console.log(`📊 Search index entries per locale: ${1 + slugs.length} (hub + chapters)`);
if (errors) { console.error(`\n${errors} error(s).`); process.exit(1); }
console.log('✅ seerah.ts valid — 16 chapters, unique SEO keywords, no collisions.');
