/* Hikmah Noor — canonical Ayah layer (Phase 4).
 * Derives individual-ayah identity, navigation and Para mapping from the
 * existing canonical data (surahs-meta.json + paras-meta.json) without
 * duplicating verse text. Verse text itself loads per-page from the
 * existing src/data/surahs/*.json files (same as SurahReader).
 */
import surahsMeta from '../data/surahs-meta.json';
import parasMeta from '../data/paras-meta.json';

export interface SurahMeta {
  num: number;
  slug: string;
  name: string;
  englishName: string;
  arabicName: string;
  revelation: string;
  verseCount: number;
}

export const SURAHS = surahsMeta as SurahMeta[];
const SURAH_BY_NUM = new Map(SURAHS.map((s) => [s.num, s]));
const SURAH_BY_SLUG = new Map(SURAHS.map((s) => [s.slug, s]));

export function surahByNum(num: number): SurahMeta | undefined {
  return SURAH_BY_NUM.get(num);
}
export function surahBySlug(slug: string): SurahMeta | undefined {
  return SURAH_BY_SLUG.get(slug);
}

/** Canonical ayah identifier: `surahNumber:ayahNumber` (e.g. `2:255`). */
export function ayahId(surahNum: number, ayahNum: number): string {
  return `${surahNum}:${ayahNum}`;
}

export interface AyahRef {
  surahNum: number;
  ayahNum: number;
  id: string;
  surah: SurahMeta;
}

/** Resolve and validate an ayah reference against canonical metadata. */
export function ayahRef(surahNum: number, ayahNum: number): AyahRef | null {
  const surah = SURAH_BY_NUM.get(surahNum);
  if (!surah) return null;
  if (!Number.isInteger(ayahNum) || ayahNum < 1 || ayahNum > surah.verseCount) return null;
  return { surahNum, ayahNum, id: ayahId(surahNum, ayahNum), surah };
}

export interface ParaRef {
  num: number;
  slug: string;
  name: string;
  range: string;
}

/** Map an ayah to its Para using the canonical paras-meta ranges. */
export function paraForAyah(surahNum: number, ayahNum: number): ParaRef | null {
  for (const p of parasMeta as any[]) {
    const s = p.start.surah, e = p.end.surah;
    if (surahNum < s || surahNum > e) continue;
    if (s === e && (ayahNum < p.start.verse || ayahNum > p.end.verse)) continue;
    if (surahNum === s && ayahNum < p.start.verse) continue;
    if (surahNum === e && ayahNum > p.end.verse) continue;
    return { num: p.num, slug: p.slug, name: p.name, range: p.range };
  }
  return null;
}

/** Previous ayah across Surah boundaries (null at 1:1). */
export function prevAyah(surahNum: number, ayahNum: number): AyahRef | null {
  if (ayahNum > 1) return ayahRef(surahNum, ayahNum - 1);
  if (surahNum <= 1) return null;
  const prev = SURAH_BY_NUM.get(surahNum - 1);
  if (!prev) return null;
  return ayahRef(surahNum - 1, prev.verseCount);
}

/** Next ayah across Surah boundaries (null at 114:6). */
export function nextAyah(surahNum: number, ayahNum: number): AyahRef | null {
  const surah = SURAH_BY_NUM.get(surahNum);
  if (!surah) return null;
  if (ayahNum < surah.verseCount) return ayahRef(surahNum, ayahNum + 1);
  if (surahNum >= 114) return null;
  return ayahRef(surahNum + 1, 1);
}

/** Total canonical ayah count (drives validator + reports). */
export function totalAyahs(): number {
  return SURAHS.reduce((n, s) => n + s.verseCount, 0);
}
