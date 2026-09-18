// Site-wide link checker: every search-index URL (all 4 locales) and every
// sitemap URL must resolve to a built file in dist/.
// Run AFTER build: npm run content:links  (build first: npm run build)
import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const LOCALES = ['en', 'hi', 'ur', 'ar'];

const exists = async (p) => { try { await access(p, constants.F_OK); return true; } catch { return false; }; };
// /duas/x/ -> dist/duas/x/index.html ; / -> dist/index.html ; /404/ -> dist/404.html
const toFile = (url) => {
  const clean = url.split('?')[0].split('#')[0];
  if (clean === '/' || clean === '') return join(DIST, 'index.html');
  if (clean === '/404' || clean === '/404/') return join(DIST, '404.html');
  return join(DIST, clean.replace(/^\//, '').replace(/\/$/, ''), 'index.html');
};

let errors = 0;
const checked = new Set();

// 1. Search indexes
for (const locale of LOCALES) {
  const file = locale === 'en' ? join(DIST, 'search-index.json') : join(DIST, locale, 'search-index.json');
  let items = [];
  try { items = JSON.parse(await readFile(file, 'utf8')); }
  catch { console.error(`❌ cannot read ${file} — run npm run build first`); process.exit(1); }
  for (const it of items) {
    if (checked.has(it.url)) continue;
    checked.add(it.url);
    if (!(await exists(toFile(it.url)))) { errors++; console.error(`❌ 404 in ${locale} index: ${it.url} (${it.title})`); }
  }
  console.log(`✓ ${locale} search index: ${items.length} urls checked`);
}

// 2. Sitemaps (covers every generated route incl. surahs/paras/tools)
const indexXml = await readFile(join(DIST, 'sitemap-index.xml'), 'utf8');
const maps = [...indexXml.matchAll(/<loc>([^<]+sitemap-\d+\.xml)<\/loc>/g)].map((m) => m[1].split('/').pop());
let sitemapUrls = 0;
for (const map of maps) {
  const xml = await readFile(join(DIST, map), 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const u of urls) {
    const path = new URL(u).pathname;
    if (checked.has(path)) continue;
    checked.add(path);
    sitemapUrls++;
    if (!(await exists(toFile(path)))) { errors++; console.error(`❌ 404 in ${map}: ${path}`); }
  }
}
console.log(`✓ sitemaps: ${sitemapUrls} additional urls checked`);

console.log(`\n📊 ${checked.size} unique urls verified against dist/`);
if (errors) { console.error(`\n${errors} broken link(s).`); process.exit(1); }
console.log('✅ every indexed + sitemapped url resolves — no broken links.');
