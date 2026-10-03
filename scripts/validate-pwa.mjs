// Phase 10 PWA/platform validator: manifest, icons, service-worker policy,
// and local-state schema parity (store Bookmark kinds vs favourites labels).
// Source-level (no build required). Run: npm run content:pwa
import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFile(join(ROOT, p), 'utf8');
const exists = async (p) => { try { await access(join(ROOT, p), constants.F_OK); return true; } catch { return false; } };

let errors = 0;
let warnings = 0;
const fail = (msg) => { errors++; console.error('X ' + msg); };
const warn = (msg) => { warnings++; console.warn('! ' + msg); };

// 1. Manifest: valid JSON, installability fields, PNG icon set.
let manifest;
try {
  manifest = JSON.parse(await read('public/manifest.webmanifest'));
} catch { fail('public/manifest.webmanifest is not valid JSON'); }
if (manifest) {
  for (const k of ['name', 'short_name', 'start_url', 'scope', 'display', 'background_color', 'theme_color', 'icons']) {
    if (manifest[k] === undefined) fail(`manifest: missing field ${k}`);
  }
  if (manifest.display !== 'standalone') fail(`manifest: display must be standalone (got ${manifest.display})`);
  if (manifest.start_url !== '/' || manifest.scope !== '/') fail('manifest: start_url/scope must be /');
  const icons = manifest.icons || [];
  const has = (sizes, purpose) => icons.some((i) => i.sizes === sizes && String(i.purpose || 'any').split(' ').includes(purpose) && /\.png$/i.test(i.src || ''));
  if (!has('192x192', 'any')) fail('manifest: missing 192x192 any-purpose PNG icon');
  if (!has('512x512', 'any')) fail('manifest: missing 512x512 any-purpose PNG icon');
  if (!has('512x512', 'maskable')) fail('manifest: missing 512x512 maskable PNG icon');
  for (const i of icons) {
    if (!i.src.startsWith('/')) fail(`manifest: icon src must be site-relative: ${i.src}`);
    else if (!(await exists(`public${i.src}`))) fail(`manifest: icon file missing: ${i.src}`);
  }
  console.log(`  manifest: ${icons.length} icons, installability fields ok`);
}

// 2. Icon PNGs: valid signature + IHDR dimensions matching the manifest.
function pngDims(rel) {
  return readFile(join(ROOT, rel)).then((b) => {
    const sig = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v);
    return { ok: sig, w: b.readUInt32BE(16), h: b.readUInt32BE(20), bytes: b.length };
  }).catch(() => null);
}
if (manifest) {
  for (const i of manifest.icons || []) {
    if (!/\.png$/i.test(i.src || '')) continue;
    const d = await pngDims(`public${i.src}`);
    if (!d) { fail(`icons: cannot read ${i.src}`); continue; }
    const [w, h] = String(i.sizes || '').split('x').map(Number);
    if (!d.ok || d.w !== w || d.h !== h || d.w !== d.h) fail(`icons: ${i.src} invalid (${d.w}x${d.h}, expected ${i.sizes} square)`);
    if (d.bytes > 300 * 1024) fail(`icons: ${i.src} too large (${Math.round(d.bytes / 1024)}KB > 300KB)`);
  }
  console.log('  icons: PNG dims + size ok');
}

// 3. Service worker: versioned, bounded, media/API guards, offline fallback.
const sw = await read('public/sw.js');
for (const [label, re] of [
  ['version marker', /const V = 'hn-v\d+'/],
  ['CORE precache incl /offline/', /'\/offline\/'/],
  ['/api/* never cached', /pathname\.startsWith\('\/api\/'\)/],
  ['media exclusion', /mp3\|m4a/],
  ['cache caps', /_CAP = \d+/],
  ['skipWaiting', /skipWaiting/],
  ['clients.claim', /clients\.claim/],
  ['old-cache cleanup', /caches\.delete/],
]) {
  if (!re.test(sw)) fail(`sw.js: missing ${label}`);
}
console.log('  sw: versioned bounded policy ok');

// 4. Local-state parity: store.ts Bookmark kinds == favourites KIND maps.
const storeTxt = await read('src/lib/store.ts');
const storeIface = storeTxt.match(/export interface Bookmark \{([\s\S]*?)\}/)?.[1] ?? '';
const storeKinds = new Set([...storeIface.matchAll(/'([a-z]+)'/g)].map((m) => m[1]));
for (const f of ['src/pages/favourites.astro', 'src/pages/[locale]/favourites.astro']) {
  const t = await read(f);
  const m = t.match(/const KIND = \{([^}]*)\}/);
  if (!m) { fail(`${f}: KIND map missing`); continue; }
  const favKinds = new Set([...m[1].matchAll(/(\w+):/g)].map((x) => x[1]));
  for (const k of storeKinds) if (!favKinds.has(k)) fail(`${f}: KIND label missing for bookmark kind '${k}'`);
  for (const k of favKinds) if (!storeKinds.has(k)) fail(`${f}: KIND label '${k}' has no store.ts Bookmark kind`);
}
console.log(`  bookmarks: store/favourites kind parity ok (${storeKinds.size} kinds)`);

// 5. No cookies anywhere in client source (local-first guarantee).
const walk = async (dir, out = []) => {
  const { readdir } = await import('node:fs/promises');
  for (const e of await readdir(join(ROOT, dir), { withFileTypes: true })) {
    const rel = join(dir, e.name);
    if (e.isDirectory()) await walk(rel, out);
    else if (/\.(astro|ts|js)$/.test(e.name) && !/node_modules/.test(rel)) out.push(rel);
  }
  return out;
};
for (const f of await walk('src')) {
  const t = await read(f);
  if (/document\.cookie/.test(t)) fail(`${f}: document.cookie usage (local-first: no cookies)`);
}
console.log('  cookies: none in client source');

console.log(`\npwa: ${errors} error(s), ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
