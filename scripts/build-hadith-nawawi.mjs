// Phase 8 dataset generator: vendors the Forty Hadith of an-Nawawi (42)
// VERBATIM from the pinned open corpus into src/data/hadith/nawawi.json.
// No text is authored, translated, reordered or renumbered here — the only
// transform is selecting {hadithnumber, arabic text, english text} per number
// and attaching provenance metadata. Re-run to re-verify: the script FAILS
// unless both editions contain exactly hadith 1-42, sequential, non-empty,
// mutually aligned, with zero encoding artifacts.
// Run: node scripts/build-hadith-nawawi.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PIN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
const SOURCES = {
  arabic: `${PIN}/editions/ara-nawawi.min.json`,
  english: `${PIN}/editions/eng-nawawi.min.json`,
};

const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed ${res.status}: ${url}`);
  return res.json();
};

const fail = (msg) => { console.error('X ' + msg); process.exit(1); };

const ara = await get(SOURCES.arabic);
const eng = await get(SOURCES.english);

for (const [label, ed] of [['arabic', ara], ['english', eng]]) {
  if (!Array.isArray(ed.hadiths) || ed.hadiths.length !== 42) fail(`${label}: expected 42 hadiths, got ${ed.hadiths?.length}`);
  ed.hadiths.forEach((h, i) => {
    if (h.hadithnumber !== i + 1) fail(`${label}: non-sequential number at index ${i} (got ${h.hadithnumber})`);
    if (!h.text || !h.text.trim()) fail(`${label}: empty text at hadith ${h.hadithnumber}`);
    if (/\(\?\)/.test(h.text)) fail(`${label}: encoding artifact "(?)" at hadith ${h.hadithnumber}`);
  });
}
const araNums = ara.hadiths.map((h) => h.hadithnumber).join(',');
const engNums = eng.hadiths.map((h) => h.hadithnumber).join(',');
if (araNums !== engNums) fail('arabic/english numbering mismatch');

const out = {
  provenance: {
    collection: 'Forty Hadith of an-Nawawi (Al-Arba‘in al-Nawawiyyah)',
    compiler: 'Imam Yahya ibn Sharaf al-Nawawi (d. 676 AH)',
    sourceRepo: 'https://github.com/fawazahmed0/hadith-api (branch 1)',
    sourceLicense: 'The Unlicense (public-domain dedication)',
    editionsUsed: ['ara-nawawi', 'eng-nawawi'],
    editionUrls: [SOURCES.arabic, SOURCES.english],
    retrievedUtc: new Date().toISOString().slice(0, 10),
    numbering: 'hadithnumber 1-42 sequential, identical in both editions; reference.book is 1 for all (single section)',
    languages: { arabic: 'Full classical matn with takhrij (public domain by age of authorship)', english: 'Full translation reproduced verbatim; translator unattributed in source dataset' },
    missingLanguages: ['ur', 'hi'],
    notes: [
      'Texts reproduced verbatim; no AI generation, no rewording, no renumbering.',
      'Dataset grades arrays are empty for all 42 — no grade is shown on canonical pages.',
      'Narrators are embedded in the matn (no separate narrator field) — none is extracted.',
      'Urdu/Hindi show the Arabic + English texts (project EN-fallback strategy); no translations invented.',
    ],
  },
  collection: {
    id: 'nawawi',
    slug: 'nawawi',
    name: 'Forty Hadith of an-Nawawi',
    arabicName: 'الأربعون النووية',
    compiler: 'Imam Yahya ibn Sharaf al-Nawawi',
    description: 'The complete Forty Hadith of Imam al-Nawawi — 42 hadith in collection order, with full Arabic matn and English translation.',
  },
  books: [
    {
      id: 'nawawi-b1',
      num: 1,
      slug: 'forty-hadith',
      title: 'Forty Hadith of an-Nawawi',
      first: 1,
      last: 42,
    },
  ],
  hadith: ara.hadiths.map((a, i) => ({
    id: `nawawi-b1-${String(i + 1).padStart(3, '0')}`,
    num: i + 1,
    book: 1,
    arabic: a.text,
    english: eng.hadiths[i].text,
    reference: `Al-Arba‘in al-Nawawiyyah · Hadith ${i + 1} of 42`,
  })),
};

await mkdir(join(ROOT, 'src', 'data', 'hadith'), { recursive: true });
await writeFile(join(ROOT, 'src', 'data', 'hadith', 'nawawi.json'), JSON.stringify(out, null, 2) + '\n');
console.log('hadith/nawawi.json: 42 hadith, books=1, texts verbatim from pinned source');
