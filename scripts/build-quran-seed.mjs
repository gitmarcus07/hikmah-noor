// One-time seed generator for verse search + mushaf pager.
// Run: node scripts/build-quran-seed.mjs  (needs internet for page boundaries)
// Then apply in order:
//   wrangler d1 execute hikmah-noor-habit --remote --file=./migrations/0005_quran_schema.sql
//   foreach ($f in (Get-ChildItem migrations/0006_quran_verses_*.sql | Sort-Object Name)) {
//     wrangler d1 execute hikmah-noor-habit --remote --file=$($f.FullName)
//   }
// NOTE: verses must stay one single-row INSERT per statement, chunked into
// ~150KB files. D1 rejects oversized multi-row statements (SQLITE_TOOBIG)
// and rolls back the whole file — do NOT re-batch rows into shared VALUES
// lists or grow the per-file byte cap.
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

// ---- 3) emit D1-safe chunked SQL ----
// Schema (CREATEs + 604 page boundaries) goes to 0005_quran_schema.sql alone.
// Verses go to 0006_quran_verses_01.sql ... as ONE row per INSERT statement,
// chunked at ~150KB per file. Multi-row VALUES batches exceed D1's
// per-statement limit (SQLITE_TOOBIG, whole file rolls back), so keep this
// single-row layout even though it produces more files.
const head =
  `CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(surah UNINDEXED, verse UNINDEXED, sname, ar, ur, en, hi);\n` +
  `CREATE TABLE IF NOT EXISTS mushaf_pages(page INTEGER PRIMARY KEY, ss INTEGER, sv INTEGER, es INTEGER, ev INTEGER);\n` +
  pages
    .map((p) => `INSERT OR IGNORE INTO mushaf_pages(page,ss,sv,es,ev) VALUES (${p.p},${p.ss},${p.sv},${p.es},${p.ev});`)
    .join('\n');
const parts = [];
const MAX_BYTES = 150 * 1024;
let cur = [];
let curBytes = 0;
for (const r of rows) {
  const stmt =
    `INSERT INTO verses_fts(surah,verse,sname,ar,ur,en,hi) VALUES ` +
    `(${r[0]},${r[1]},'${esc(r[2])}','${esc(r[3])}','${esc(r[4])}','${esc(r[5])}','${esc(r[6])}');`;
  const b = Buffer.byteLength(stmt + '\n', 'utf8');
  if (cur.length && curBytes + b > MAX_BYTES) {
    parts.push(cur);
    cur = [];
    curBytes = 0;
  }
  cur.push(stmt);
  curBytes += b;
}
if (cur.length) parts.push(cur);
writeFileSync(`${root}/migrations/0005_quran_schema.sql`, `${head}\n`);
console.log(`wrote 0005_quran_schema.sql (${(head.length / 1024).toFixed(0)} KB)`);
parts.forEach((chunk, i) => {
  const name = `0006_quran_verses_${String(i + 1).padStart(2, '0')}.sql`;
  const body = chunk.join('\n');
  writeFileSync(`${root}/migrations/${name}`, `${body}\n`);
  console.log(`wrote ${name} (${chunk.length} verses, ${(body.length / 1024).toFixed(0)} KB)`);
});
console.log(`done: ${rows.length} verses, ${pages.length} pages, ${parts.length + 1} files`);
