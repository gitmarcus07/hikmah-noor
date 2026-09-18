// One-time (re-runnable) builder: downloads all 114 surahs (Arabic + UR/EN/HI + transliteration)
// from the free fawazahmed0/quran-api CDN and writes local JSON data files.
// Run: npm run content:surahs
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'src', 'data', 'surahs');
const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1';
const EDITIONS = {
  ar: 'ara-quranuthmanihaf',
  ur: 'urd-fatehmuhammadja',
  en: 'eng-mustafakhattaba',
  hi: 'hin-suhelfarooqkhan',
  tr: 'ara-quran-la',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, tries = 4) {
  const variants = url.endsWith('.min.json') ? [url, url.replace('.min.json', '.json')] : [url];
  let lastErr;
  for (let t = 0; t < tries; t++) {
    for (const u of variants) {
      try {
        const res = await fetch(u, { headers: { 'User-Agent': 'HikmahNoor/1.0 (educational Quran site)' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        lastErr = e;
      }
    }
    await sleep(800 * (t + 1));
  }
  throw lastErr;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s_]+/g, '-');
}

async function buildChapter(n, meta) {
  const data = {};
  await Promise.all(
    Object.entries(EDITIONS).map(async ([lang, ed]) => {
      const j = await getJSON(`${CDN}/editions/${ed}/${n}.min.json`);
      const map = new Map();
      for (const v of j.chapter) map.set(v.verse, v.text);
      data[lang] = map;
    }),
  );
  const verseNums = [...data.ar.keys()].sort((a, b) => a - b);
  if (verseNums.length !== meta.verseCount) {
    console.warn(`! surah ${n}: arabic verses=${verseNums.length} expected=${meta.verseCount}`);
  }
  const verses = verseNums.map((v) => ({
    v,
    ar: data.ar.get(v) ?? '',
    ur: data.ur.get(v) ?? '',
    en: data.en.get(v) ?? '',
    hi: data.hi.get(v) ?? '',
    tr: data.tr.get(v) ?? '',
  }));
  return {
    num: n,
    slug: `${n}-${slugify(meta.name)}`,
    name: meta.name,
    englishName: meta.englishName,
    arabicName: meta.arabicName,
    revelation: meta.revelation,
    verseCount: verseNums.length,
    verses,
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const info = await getJSON(`${CDN}/info.min.json`);
  const chapters = info.chapters.map((c) => ({
    num: c.chapter,
    name: c.name,
    englishName: c.englishname,
    arabicName: c.arabicname,
    revelation: c.revelation,
    verseCount: c.verses.length,
  }));
  console.log(`Metadata for ${chapters.length} surahs loaded.`);

  const CONC = 6;
  const results = new Array(chapters.length);
  for (let i = 0; i < chapters.length; i += CONC) {
    const batch = chapters.slice(i, i + CONC);
    const built = await Promise.all(batch.map((m) => buildChapter(m.num, m)));
    built.forEach((s) => {
      results[s.num - 1] = s;
    });
    for (const s of built) {
      await writeFile(join(OUT_DIR, `${s.num}.json`), JSON.stringify(s));
      console.log(`wrote surah ${s.num} ${s.slug} (${s.verseCount} verses)`);
    }
  }
  const meta = results.map(({ verses, ...m }) => m);
  await writeFile(join(ROOT, 'src', 'data', 'surahs-meta.json'), JSON.stringify(meta));
  console.log(`DONE: ${results.length} surahs, meta written.`);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
