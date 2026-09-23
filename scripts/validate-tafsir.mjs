// Tafsir validator: every surah in surahs-meta.json has a TAFSIR summary.
// Run: npm run content:tafsir
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const meta = JSON.parse(await readFile(join(ROOT, 'src', 'data', 'surahs-meta.json'), 'utf8'));
const txt = await readFile(join(ROOT, 'src', 'data', 'tafsir.ts'), 'utf8');

let errors = 0;
const fail = (msg) => { errors++; console.error('FAIL ' + msg); };

const nums = new Set([...txt.matchAll(/(\d+): \{ surahNum: \1/g)].map((m) => Number(m[1])));
for (const s of meta) {
  if (!nums.has(s.num)) fail(`missing tafsir for surah ${s.num} (${s.slug})`);
}
// Per-verse notes: keys must be positive ints within the surah's verseCount.
const verseBlock = txt.match(/export const VERSE_TAFSIR[\s\S]*$/);
let noteTotal = 0;
if (!verseBlock) {
  fail('missing VERSE_TAFSIR export');
} else {
  const surahBlocks = [...verseBlock[0].matchAll(/^  (\d+): \{([^}]*)\}/gm)];
  const verseCounts = new Map(meta.map((s) => [s.num, s.verseCount]));
  for (const [, numStr, body] of surahBlocks) {
    const num = Number(numStr);
    if (!verseCounts.has(num)) { fail(`VERSE_TAFSIR unknown surah ${num}`); continue; }
    const keys = [...body.matchAll(/^\s{4}(\d+): '/gm)].map((m) => Number(m[1]));
    noteTotal += keys.length;
    for (const v of keys) {
      if (v < 1 || v > verseCounts.get(num)) fail(`VERSE_TAFSIR ${num}:${v} out of range (1-${verseCounts.get(num)})`);
    }
    if (new Set(keys).size !== keys.length) fail(`VERSE_TAFSIR ${num} has duplicate verse keys`);
  }
}

const introMissing = [...txt.matchAll(/intro: '([^']*)'/g)].filter((m) => !m[1].trim());
if (introMissing.length) fail(`${introMissing.length} empty intros`);
const themesMissing = [...txt.matchAll(/themes: \[([^\]]*)\]/g)].filter((m) => !m[1].trim());
if (themesMissing.length) fail(`${themesMissing.length} empty themes`);

console.log(`\nSurahs: ${meta.length}, Tafsir entries: ${nums.size}, Verse notes: ${noteTotal}`);
if (errors) { console.error(`\n${errors} error(s). Fix before building.`); process.exit(1); }
console.log('\nOK tafsir.ts valid.');
