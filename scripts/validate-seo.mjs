// Phase 7 SEO validator: deterministic source-level checks for the shared
// SEO architecture (BaseLayout owns canonical/hreflang/robots/schema).
// No build required. Run: npm run content:seo
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFile(join(ROOT, p), 'utf8');

let errors = 0;
let warnings = 0;
const fail = (msg) => { errors++; console.error('X ' + msg); };
const warn = (msg) => { warnings++; console.warn('! ' + msg); };

async function allFiles(dir, ext) {
  const out = [];
  for (const e of await readdir(join(ROOT, dir), { withFileTypes: true })) {
    const rel = join(dir, e.name);
    if (e.isDirectory()) out.push(...await allFiles(rel, ext));
    else if (e.name.endsWith(ext)) out.push(rel);
  }
  return out;
}

/** Legacy moved-page stubs with hand-rolled HTML (canonical -> new URL,
 *  meta-refresh + noindex). These are the ONLY files allowed to hardcode
 *  SEO tags outside BaseLayout. Paths are repo-relative with / separators. */
const STUB_ALLOW = new Set([
  'src/pages/tools/zakat-calculator.astro',
  'src/pages/tools/classical-finance/ushr-guide.astro',
  'src/pages/[locale]/tools/zakat-calculator.astro',
  'src/pages/[locale]/tools/classical-finance/ushr-guide.astro',
]);

/** EN-only top-level pages (no [locale] mirror by design). */
const EN_ONLY = new Set(['404.astro', 'offline.astro', 'al-mushrif.astro']);

/** Schema @types that may appear in src (factual only — no ratings,
 *  reviews, or invented authority). */
const SCHEMA_ALLOW = new Set([
  'Article', 'CollectionPage', 'FAQPage', 'BreadcrumbList',
  'Question', 'Answer', 'ListItem', 'Organization',
]);

const astroFiles = await allFiles('src', '.astro');
const norm = (p) => p.replace(/\\/g, '/');

// BaseLayout opening tags can contain `>` inside {…} expressions
// (e.g. arrow functions in title/faq props), so scan with brace-depth
// tracking instead of a lazy `>` regex.
function baseLayoutProps(t) {
  const out = [];
  let i = 0;
  while (true) {
    const s = t.indexOf('<BaseLayout', i);
    if (s < 0) break;
    let depth = 0;
    let j = s + '<BaseLayout'.length;
    for (; j < t.length; j++) {
      const c = t[j];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) break;
    }
    out.push(t.slice(s, j + 1));
    i = j + 1;
  }
  return out;
}
// 1. No hardcoded SEO tags outside BaseLayout (except redirect stubs).
for (const f of astroFiles) {
  const key = norm(f);
  if (key === 'src/layouts/BaseLayout.astro' || STUB_ALLOW.has(key)) continue;
  const t = await read(f);
  if (t.includes('<link rel="canonical"')) fail(`${key}: hardcoded canonical (must come from BaseLayout canonicalPath)`);
  if (t.includes('hreflang')) fail(`${key}: hardcoded hreflang (must come from BaseLayout)`);
  if (/<meta name="robots"/.test(t)) fail(`${key}: hardcoded robots meta (must come from BaseLayout noindex)`);
}
console.log('  1. no hardcoded canonical/hreflang/robots outside BaseLayout (+4 stubs)');

// 2. BaseLayout type allowlist + description/canonicalPath/title presence.
const TYPE_ALLOW = new Set(['website', 'article', 'collection']);
for (const f of astroFiles) {
  const key = norm(f);
  const t = await read(f);
  for (const tag of baseLayoutProps(t)) {
    const props = tag.slice('<BaseLayout'.length);
    const tm = props.match(/type="([^"]+)"/);
    if (tm && !TYPE_ALLOW.has(tm[1])) fail(`${key}: invalid BaseLayout type="${tm[1]}"`);
    if (!/title=/.test(props)) fail(`${key}: BaseLayout usage missing title`);
    if (!/description=/.test(props)) fail(`${key}: BaseLayout usage missing description`);
    if (!/canonicalPath=/.test(props)) fail(`${key}: BaseLayout usage missing canonicalPath`);
    const dt = props.match(/description="([^"]*)"/);
    if (dt && !dt[1].trim()) fail(`${key}: empty literal description`);
  }
}
console.log('  2. BaseLayout type/title/description/canonicalPath present and valid');

// 3. Hub/detail schema convention: hubs are CollectionPage, details never are.
for (const f of astroFiles) {
  const key = norm(f);
  const t = await read(f);
  const isHub = /Hub\.astro$/.test(key) || /(DuaCategory|GuideCategory)\.astro$/.test(key);
  const isDetail = /Detail\.astro$/.test(key);
  if (isHub && !t.includes('type="collection"')) fail(`${key}: hub must use type="collection"`);
  if (isDetail && t.includes('type="collection"')) fail(`${key}: detail page must not use type="collection"`);
}
console.log('  3. hub=collection / detail!=collection convention holds');

// 4. Every noindex canonical URL must be excluded from the sitemap filter.
const configTxt = await read('astro.config.mjs');
const filterRes = [...configTxt.matchAll(/!\/((?:[^/]|\\.)+)\/\.test\(page\)/g)]
  .map((m) => { try { return new RegExp(m[1]); } catch { fail(`astro.config: unparsable sitemap regex ${m[1]}`); return null; } })
  .filter(Boolean);
if (!filterRes.length) fail('astro.config: no sitemap filter regexes parsed');
const noindexUrls = new Map(); // url -> first file seen
for (const f of astroFiles) {
  const key = norm(f);
  const t = await read(f);
  if (key.endsWith('404.astro')) continue; // 404.html is Astro-internal, never a sitemap entry
  for (const tag of baseLayoutProps(t)) {
    const props = tag.slice('<BaseLayout'.length);
    if (!/noindex=\{true\}/.test(props)) continue;
    const cm = props.match(/canonicalPath="([^"]+)"/);
    if (cm && !noindexUrls.has(cm[1])) noindexUrls.set(cm[1], key);
  }
}
// Hardcoded-robots stubs must also be sitemap-excluded (their live URLs).
const stubUrls = ['/tools/zakat-calculator/', '/tools/classical-finance/ushr-guide/'];
for (const u of stubUrls) {
  const full = 'https://hikmahnoor.in' + u;
  if (!filterRes.some((re) => re.test(full))) fail(`sitemap filter does not exclude stub ${u}`);
}
for (const [u, from] of noindexUrls) {
  const full = 'https://hikmahnoor.in' + u;
  if (!filterRes.some((re) => re.test(full))) fail(`noindex page ${u} (from ${from}) is not excluded by the sitemap filter`);
}
console.log(`  4. ${noindexUrls.size} noindex canonicals + ${stubUrls.length} stubs excluded from sitemap`);

// 5. Top-level static page files: EN <-> [locale] mirror parity.
const top = async (dir) => (await readdir(join(ROOT, dir), { withFileTypes: true }))
  .filter((e) => e.isFile() && (e.name.endsWith('.astro') || e.name.endsWith('.ts')))
  .map((e) => e.name);
const enTop = new Set(await top('src/pages'));
const locTop = new Set(await top('src/pages/[locale]'));
for (const n of enTop) {
  if (n === 'index.astro') continue;
  if (!EN_ONLY.has(n) && !locTop.has(n)) fail(`EN page ${n} has no [locale] mirror`);
}
for (const n of locTop) {
  if (!enTop.has(n)) fail(`[locale] page ${n} has no EN source`);
}
console.log(`  5. top-level mirror parity ok (EN-only: ${[...EN_ONLY].join(', ')})`);

// 6. Schema @type allowlist (no fabricated ratings/reviews/claims).
for (const f of astroFiles) {
  const key = norm(f);
  const t = await read(f);
  for (const m of t.matchAll(/['"]@type['"]\s*:\s*['"]([^'"]+)['"]/g)) {
    if (!SCHEMA_ALLOW.has(m[1])) fail(`${key}: disallowed schema @type "${m[1]}"`);
  }
}
console.log('  6. schema @types within factual allowlist');

console.log(`\nseo: ${errors} error(s), ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
