// One-time seed generator for verse search + mushaf pager.
// Run: node scripts/build-quran-seed.mjs  (needs internet for page boundaries)
// Then apply each part:
//   wrangler d1 execute hikmah-noor-habit --remote --file=./migrations/0005_quran_verses_1.sql
//   ... _2, _3, _4
// Sources: local src/data/surahs/*.json (text) + api.quran.com v4 (Madani page
// boundaries, keyless). Output is static SQL — runtime stays fully offline.
import { readFileSync, writeFileSync } from 'node:fs';

// Run from the repo root: node scripts/build-quran-seed.mjs
const root = '.';
const esc = (s) => String(s ?? '').replace(/'/g, "''");

// ---- 1) verses from local data ----
const surahsMeta = JSON.parse(readFileSync(`${root}/src/data/surahs-meta.json`, 'utf8'));
const snameOf = Object.fromEntries(surahsMeta.map((s) => [s.num, s.name]));
const rows = [];
for (let n = 1; n <= 114; n++) {
  const j = JSON.parse(readFileSync(`${root}/src/data/surahs/${n}.json`, 'utf8'));
  for (const v of j.verses || []) {
    rows.push([n, v.v, snameOf[n] || '', v.ar || '', v.ur || '', v.en || '', v.hi || '']);
  }
}
if (rows.length !== 6236) throw new Error(`expected 6236 verses, got ${rows.length}`);
console.log(`verses: ${rows.length}`);

// ---- 2) Madani page boundaries via api.quran.com (30 juz, paginated) ----
async function getJson(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 25000);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r.json();
  } finally {
    clearTimeout(t);
  }
}
const bounds = new Map();
for (let juz = 1; juz <= 30; juz++) {
  let page = 1;
  for (;;) {
    const d = await getJson(`https://api.quran.com/api/v4/verses/by_juz/${juz}?words=false&per_page=50&page=${page}`);
    for (const v of d.verses || []) {
      const [s, vv] = String(v.verse_key).split(':').map(Number);
      const p = v.page_number;
      if (!bounds.has(p)) bounds.set(p, { p, ss: s, sv: vv, es: s, ev: vv });
      else {
        const b = bounds.get(p);
        b.es = s;
        b.ev = vv;
      }
    }
    if (!d.pagination || !d.pagination.next_page) break;
    page = d.pagination.next_page;
    await new Promise((r) => setTimeout(r, 200));
  }
  await new Promise((r) => setTimeout(r, 300));
  console.log(`juz ${juz} done, pages so far: ${bounds.size}`);
}
const pages = [...bounds.values()].sort((a, b) => a.p - b.p);
if (pages.length !== 604) console.warn(`WARN: expected 604 pages, got ${pages.length} — verify before applying`);
if (pages[0]?.ss !== 1 || pages[pages.length - 1]?.es !== 114) {
  throw new Error('unexpected first/last page range — refusing to emit');
}

// ---- 3) emit chunked SQL (~1.8MB per file) ----
const head =
  `CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(surah UNINDEXED, verse UNINDEXED, sname, ar, ur, en, hi);\n` +
  `CREATE TABLE IF NOT EXISTS mushaf_pages(page INTEGER PRIMARY KEY, ss INTEGER, sv INTEGER, es INTEGER, ev INTEGER);\n` +
  pages
    .map((p) => `INSERT OR IGNORE INTO mushaf_pages(page,ss,sv,es,ev) VALUES (${p.p},${p.ss},${p.sv},${p.es},${p.ev});`)
    .join('\n');
const parts = [head];
const BATCH = 100;
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows
    .slice(i, i + BATCH)
    .map(
      (r) =>
        `(${r[0]},${r[1]},'${esc(r[2])}','${esc(r[3])}','${esc(r[4])}','${esc(r[5])}','${esc(r[6])}')`
    )
    .join(',');
  const stmt = `INSERT INTO verses_fts(surah,verse,sname,ar,ur,en,hi) VALUES ${chunk};`;
  const last = parts[parts.length - 1];
  if ((last + '\n' + stmt).length > 1800000) parts.push(stmt);
  else parts[parts.length - 1] = `${last}\n${stmt}`;
}
parts.forEach((p, i) => {
  writeFileSync(`${root}/migrations/0005_quran_verses_${i + 1}.sql`, `${p}\n`);
  console.log(`wrote 0005_quran_verses_${i + 1}.sql (${(p.length / 1048576).toFixed(2)} MB)`);
});
console.log(`done: ${rows.length} verses, ${pages.length} pages, ${parts.length} files`);
