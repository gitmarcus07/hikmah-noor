// Relationship validator: checks every relationship target/source declared in
// src/data/relations.ts resolves to a real entity slug in the data files.
// Also sanity-checks Quran numeric citations (1-114).
// Run: npm run content:relationships
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFile(join(ROOT, p), 'utf8');

let errors = 0;
let warnings = 0;
const fail = (msg) => { errors++; console.error('X ' + msg); };
const warn = (msg) => { warnings++; console.warn('! ' + msg); };

const duasTxt = await read('src/data/duas.ts');
const guidesTxt = await read('src/data/guides.ts');
const waqiatTxt = await read('src/data/waqiat.ts');
const prophetsTxt = await read('src/data/prophets.ts');
const seerahTxt = await read('src/data/seerah.ts');
const sahabaTxt = await read('src/data/sahaba.ts');
const hadeesTxt = await read('src/data/hadees.ts');
const nawawiTxt = await read('src/data/hadees-nawawi.ts');
const sahihTxt = await read('src/data/hadees-sahih.ts');
const meaningsTxt = await read('src/data/meanings.ts');
const historyTxt = await read('src/data/history.ts');
const kalimasTxt = await read('src/data/kalimas.ts');
const womenTxt = await read('src/data/women.ts');
const quizzesTxt = await read('src/data/quizzes.ts');
const toolsTxt = await read('src/lib/finance/tools.js');
const namesAllahTxt = await read('src/data/names-allah.ts');
const namesProphetTxt = await read('src/data/names-prophet.ts');
const monthsTxt = await read('src/data/months.ts');
const relationsTxt = await read('src/data/relations.ts');
const surahsMeta = JSON.parse(await read('src/data/surahs-meta.json'));

/** Slugify mirror of src/data/names.ts nameSlug (+ Majid overrides). */
const nameSlugify = (s) => s.toLowerCase().replace(/[’‘'`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const parseNames = (txt, overrides = {}) => {
  const rows = [...txt.matchAll(/\{ n: (\d+), arabic: ('[^']*'|"[^"]*"), translit: ('[^']*'|"[^"]*"), meaning: ('[^']*'|"[^"]*") \}/g)]
    .map((m) => ({ n: +m[1], translit: m[3].slice(1, -1) }));
  const seen = new Set();
  return new Set(rows.map((r) => {
    let slug = overrides[r.n] ?? nameSlugify(r.translit);
    if (seen.has(slug)) slug = `${r.n}-${slug}`;
    seen.add(slug);
    return slug;
  }));
};

/** slug sets per content type */
const S = {
  dua: new Set([...duasTxt.matchAll(/\{ slug: '([^']+)', cat: '([^']+)'/g)].map((m) => m[1])),
  guide: new Set([...guidesTxt.matchAll(/\{ slug: '([^']+)', cat: '([^']+)'/g)].map((m) => m[1])),
  waqiah: new Set([...waqiatTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1])),
  prophet: new Set([...prophetsTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1])),
  seerah: new Set([...seerahTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1])),
  sahaba: new Set([...sahabaTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1])),
  hadees: new Set([
    ...[...hadeesTxt.matchAll(/\{ slug: '([^']+)', num: \d+, sabaq: \d+/g)].map((m) => m[1]),
    ...[...nawawiTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1]),
    ...[...sahihTxt.matchAll(/\{ slug: '([^']+)', num: \d+, sabaq: \d+/g)].map((m) => m[1]),
  ]),
  meaning: new Set([...meaningsTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1])),
  history: new Set([...historyTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1])),
  kalima: new Set([...kalimasTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1])),
  women: new Set([...womenTxt.matchAll(/\{ slug: '([^']+)'/g)].map((m) => m[1])),
  quiz: new Set([...quizzesTxt.matchAll(/\{ slug: '([^']+)', cat: '([^']+)'/g)].map((m) => m[1])),
  tool: new Set([...toolsTxt.matchAll(/\bslug: '([^']+)', cat: '([^']+)'/g)].map((m) => m[1])),
  surah: new Set(surahsMeta.map((s) => s.slug)),
  'allah-name': parseNames(namesAllahTxt, { 49: '49-al-majid', 66: '66-al-majid' }),
  'prophet-name': parseNames(namesProphetTxt),
  month: new Set([...monthsTxt.matchAll(/\{ slug: '([^']+)', num: \d+/g)].map((m) => m[1])),
  ayah: (() => {
    const set = new Set();
    for (const s of surahsMeta) for (let v = 1; v <= s.verseCount; v++) set.add(`${s.num}:${v}`);
    return set;
  })(),
};

for (const [t, set] of Object.entries(S)) {
  console.log(`  ${t}: ${set.size} entities`);
  if (set.size === 0) fail(`no entities parsed for type ${t}`);
}

// 1. Every declared { type, slug } target must exist.
const decls = [...relationsTxt.matchAll(/\{ type: '(\w+)', slug: '([^']+)'/g)].map((m) => ({ type: m[1], slug: m[2] }));
console.log(`  declared edges: ${decls.length}`);
for (const d of decls) {
  if (!S[d.type]) { fail(`unknown content type in declaration: ${d.type} (slug ${d.slug})`); continue; }
  if (!S[d.type].has(d.slug)) fail(`target not found: ${d.type}:${d.slug}`);
}

// 2. GUIDE_DUAS keys must be real guides; values must be real duas.
for (const m of relationsTxt.match(/const GUIDE_DUAS[\s\S]*?^};/m)?.[0].matchAll(/'([\w-]+)': \[([^\]]*)\]/g) ?? []) {
  if (!S.guide.has(m[1])) fail(`GUIDE_DUAS source guide not found: ${m[1]}`);
  for (const s of m[2].matchAll(/'([\w-]+)'/g)) {
    if (!S.dua.has(s[1])) fail(`GUIDE_DUAS target dua not found: ${s[1]} (from guide ${m[1]})`);
  }
}
// 3. DUA_LINKS keys must be real duas; inner arrays must resolve.
for (const m of relationsTxt.match(/const DUA_LINKS[\s\S]*?^};/m)?.[0].matchAll(/'([\w-]+)': \{([^}]*)\}/g) ?? []) {
  if (!S.dua.has(m[1])) fail(`DUA_LINKS source dua not found: ${m[1]}`);
  for (const inner of m[2].matchAll(/(prophets|waqiat|women): \[([^\]]*)\]/g)) {
    const set = inner[1] === 'prophets' ? S.prophet : inner[1] === 'waqiat' ? S.waqiah : S.women;
    for (const s of inner[2].matchAll(/'([\w-]+)'/g)) {
      if (!set.has(s[1])) fail(`DUA_LINKS target ${inner[1]} not found: ${s[1]} (from dua ${m[1]})`);
    }
  }
}
// 4. SEERAH/HISTORY/SAHABA/WOMEN/QUIZ/HADEES link-map keys must exist.
const keyChecks = [
  ['SEERAH_LINKS', 'seerah'], ['HISTORY_LINKS', 'history'], ['SAHABA_LINKS', 'sahaba'],
  ['WOMEN_LINKS', 'women'], ['QUIZ_LINKS', 'quiz'], ['HADEES_LINKS', 'hadees'],
  ['TOOL_GUIDES', 'tool'], ['GUIDE_TOOLS', 'guide'],
];
for (const [block, type] of keyChecks) {
  const body = relationsTxt.match(new RegExp(`const ${block}[\\s\\S]*?^};`, 'm'))?.[0] ?? '';
  for (const m of body.matchAll(/'([\w-]+)': [\[]/g)) {
    if (!S[type].has(m[1])) fail(`${block} source ${type} not found: ${m[1]}`);
  }
}
// TOOL_GUIDES/GUIDE_TOOLS values use ':' arrays of strings too — covered by (1)? Values are
// plain string arrays ('slug'), not { type, slug } tuples, so check them here.
for (const m of (relationsTxt.match(/const TOOL_GUIDES[\s\S]*?^};/m)?.[0] ?? '').matchAll(/'([\w-]+)': \[([^\]]*)\]/g)) {
  if (!S.tool.has(m[1])) fail(`TOOL_GUIDES source tool not found: ${m[1]}`);
  for (const s of m[2].matchAll(/'([\w-]+)'/g)) {
    if (s[1] !== m[1] && !S.guide.has(s[1])) fail(`TOOL_GUIDES target guide not found: ${s[1]} (from tool ${m[1]})`);
  }
}
for (const m of (relationsTxt.match(/const GUIDE_TOOLS[\s\S]*?^};/m)?.[0] ?? '').matchAll(/'([\w-]+)': \[([^\]]*)\]/g)) {
  if (!S.guide.has(m[1])) fail(`GUIDE_TOOLS source guide not found: ${m[1]}`);
  for (const s of m[2].matchAll(/'([\w-]+)'/g)) {
    if (!S.tool.has(s[1])) fail(`GUIDE_TOOLS target tool not found: ${s[1]} (from guide ${m[1]})`);
  }
}
for (const m of (relationsTxt.match(/const ALLAH_MEANINGS[\s\S]*?^};/m)?.[0] ?? '').matchAll(/'([\w-]+)': \[([^\]]*)\]/g)) {
  if (!S['allah-name'].has(m[1])) fail(`ALLAH_MEANINGS source name not found: ${m[1]}`);
  for (const s of m[2].matchAll(/'([\w-]+)'/g)) {
    if (!S.meaning.has(s[1])) fail(`ALLAH_MEANINGS target meaning not found: ${s[1]} (from ${m[1]})`);
  }
}
for (const m of (relationsTxt.match(/const PROPHET_NAME_SURAHS[\s\S]*?^};/m)?.[0] ?? '').matchAll(/'([\w-]+)': \[([^\]]*)\]/g)) {
  if (!S['prophet-name'].has(m[1])) fail(`PROPHET_NAME_SURAHS source name not found: ${m[1]}`);
  for (const s of m[2].matchAll(/'([\w-]+)'/g)) {
    if (!S.surah.has(s[1])) fail(`PROPHET_NAME_SURAHS target surah not found: ${s[1]} (from ${m[1]})`);
  }
}
{
  const body = relationsTxt.match(/const MONTH_LINKS[\s\S]*?^};/m)?.[0] ?? '';
  for (const m of body.matchAll(/'([\w-]+)': \[/g)) {
    if (!S.month.has(m[1])) fail(`MONTH_LINKS source month not found: ${m[1]}`);
  }
}
for (const m of (relationsTxt.match(/const GUIDE_MONTHS[\s\S]*?^};/m)?.[0] ?? '').matchAll(/'([\w-]+)': \[([^\]]*)\]/g)) {
  if (!S.guide.has(m[1])) fail(`GUIDE_MONTHS source guide not found: ${m[1]}`);
  for (const s of m[2].matchAll(/'([\w-]+)'/g)) {
    if (!S.month.has(s[1])) fail(`GUIDE_MONTHS target month not found: ${s[1]} (from guide ${m[1]})`);
  }
}

// 5. Quran numeric citations in source/reference fields must be 1-114.
const refFields = [duasTxt, guidesTxt, waqiatTxt, prophetsTxt, seerahTxt, sahabaTxt, historyTxt, meaningsTxt, kalimasTxt, womenTxt];
let cites = 0;
for (const txt of refFields) {
  for (const m of txt.matchAll(/Qur['’]?an\s+(\d+)/gi)) {
    cites++;
    const n = parseInt(m[1], 10);
    if (n < 1 || n > 114) fail(`Quran citation out of range: Quran ${n}`);
  }
}
console.log(`  Quran citations scanned: ${cites}`);

// 6. No self-referencing { type, slug } inside its own source block (spot check).
// (Full self-ref validation runs at build time via validateRelationships.)

console.log(`\nrelationships: ${errors} error(s), ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
