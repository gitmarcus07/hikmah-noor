// Search validator: checks built search payloads (dist) for structural
// integrity, duplicate ids/urls, resolvable URLs, valid refs and aliases.
// Run AFTER build: npm run content:search
import { readFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = async (f) => JSON.parse(await readFile(join(ROOT, f), 'utf8'));

const KNOWN_CATS = new Set(['tools', 'duas', 'kalimas', 'meanings', 'waqiat', 'prophets', 'quran', 'surahs',
  'hadees', 'seerat', 'learn', 'history', 'quiz', 'names', 'calendar', 'hajj', 'ramadan', 'eid',
  'sahaba', 'women']);

let errors = 0;
let warnings = 0;
const fail = (msg) => { errors++; console.error('X ' + msg); };
const warn = (msg) => { warnings++; console.warn('! ' + msg); };

const urlToFile = (url) => join(ROOT, 'dist', url, 'index.html');

for (const locale of ['en', 'hi', 'ur', 'ar']) {
  const prefix = locale === 'en' ? 'dist' : `dist/${locale}`;
  const core = await load(`${prefix}/search-index.json`);
  const ayahs = await load(`${prefix}/search-ayahs.json`);
  if (core.v !== 1) fail(`${locale}: core payload version != 1`);
  if (ayahs.v !== 1) fail(`${locale}: ayah payload version != 1`);
  if (!Array.isArray(core.surahs) || core.surahs.length !== 114) fail(`${locale}: surah table != 114`);
  const verseCounts = new Map(core.surahs.map((s) => [s[0], s[4]]));

  const seenId = new Set();
  const seenUrl = new Set();
  let badUrl = 0;
  const checkDoc = (d, i, kind) => {
    const [a, b, c] = kind === 'core' ? [d[0], d[1], core.cats[d[2]]] : [null, null, 'quran'];
    const title = kind === 'core' ? d[0] : d[3];
    const url = kind === 'core' ? d[1] : d[4];
    const cat = kind === 'core' ? (core.cats[d[2]] || '') : 'quran';
    if (!title) fail(`${locale} ${kind}[${i}]: missing title`);
    if (!url || !url.startsWith('/')) fail(`${locale} ${kind}[${i}]: bad url ${url}`);
    if (!KNOWN_CATS.has(cat)) fail(`${locale} ${kind}[${i}]: unknown category ${cat}`);
    const id = kind === 'core' ? url : `ayah:${url}`;
    if (seenId.has(id)) fail(`${locale}: duplicate id ${id}`);
    seenId.add(id);
    if (seenUrl.has(url)) fail(`${locale}: duplicate url ${url}`);
    seenUrl.add(url);
    if (!existsSync(urlToFile(url))) {
      if (badUrl < 5) fail(`${locale}: url does not resolve ${url}`);
      badUrl++;
    }
  };
  core.docs.forEach((d, i) => checkDoc(d, i, 'core'));
  if (badUrl >= 5) fail(`${locale}: ... and more unresolvable urls (${badUrl} total)`);

  const ayahRefs = new Set();
  ayahs.docs.forEach((d, i) => {
    const [ref, s, v, title, url] = d;
    if (!/^\d+:\d+$/.test(ref)) fail(`${locale} ayah[${i}]: malformed ref ${ref}`);
    const max = verseCounts.get(s);
    if (!max) fail(`${locale} ayah[${i}]: unknown surah ${s}`);
    else if (v < 1 || v > max) fail(`${locale} ayah[${i}]: ayah out of range ${ref}`);
    if (ayahRefs.has(ref)) fail(`${locale}: duplicate ayah ref ${ref}`);
    ayahRefs.add(ref);
    if (!title || !url.startsWith('/')) fail(`${locale} ayah[${i}]: missing title/url`);
    if (seenUrl.has(url)) fail(`${locale}: duplicate url ${url}`);
    seenUrl.add(url);
    if (!existsSync(urlToFile(url))) fail(`${locale}: ayah url does not resolve ${url}`);
  });
  if (ayahRefs.size !== 6236) fail(`${locale}: expected 6236 ayah docs, found ${ayahRefs.size}`);

  for (const [alias, ref] of Object.entries(core.aliases || {})) {
    if (!ayahRefs.has(ref)) fail(`${locale}: alias "${alias}" -> unknown ayah ${ref}`);
    if (!alias.trim()) fail(`${locale}: empty alias key`);
  }
  console.log(`  ${locale}: core ${core.docs.length} docs, ayahs ${ayahs.docs.length}, urls ok`);
}

console.log(`\nsearch: ${errors} error(s), ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
