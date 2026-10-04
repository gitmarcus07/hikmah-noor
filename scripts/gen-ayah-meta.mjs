// Generates functions/_lib/surahs.js from src/data/surahs-meta.json
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const meta = JSON.parse(fs.readFileSync(path.join(root, 'src/data/surahs-meta.json'), 'utf8'));
const out = `// Auto-generated from src/data/surahs-meta.json — do not edit by hand.
// Small metadata for dynamic ayah Functions (D1 holds verse text).
export const SURAHS = ${JSON.stringify(meta)};
const BY_SLUG = new Map(SURAHS.map((s) => [s.slug, s]));
const BY_NUM = new Map(SURAHS.map((s) => [s.num, s]));
export function surahBySlugOrNum(v) {
  if (!v) return undefined;
  const s = String(v).toLowerCase();
  if (BY_SLUG.has(s)) return BY_SLUG.get(s);
  const n = parseInt(String(s).split('-')[0], 10);
  if (Number.isInteger(n)) return BY_NUM.get(n);
  return undefined;
}
export function prevAyah(surahNum, ayahNum) {
  if (ayahNum > 1) return { surahNum, ayahNum: ayahNum - 1 };
  if (surahNum <= 1) return null;
  const p = BY_NUM.get(surahNum - 1);
  return p ? { surahNum: surahNum - 1, ayahNum: p.verseCount } : null;
}
export function nextAyah(surahNum, ayahNum) {
  const s = BY_NUM.get(surahNum);
  if (!s) return null;
  if (ayahNum < s.verseCount) return { surahNum, ayahNum: ayahNum + 1 };
  if (surahNum >= 114) return null;
  return { surahNum: surahNum + 1, ayahNum: 1 };
}
`;
fs.mkdirSync(path.join(root, 'functions/_lib'), { recursive: true });
fs.writeFileSync(path.join(root, 'functions/_lib/surahs.js'), out);
console.log('wrote surahs.js bytes=' + out.length + ' surahs=' + meta.length);
