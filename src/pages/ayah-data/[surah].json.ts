/* Static per-surah verse data — the Ayah Card Maker's fallback verse source.
 * /api/verse reads the D1 `verses_fts` table, which answers 503 whenever that
 * database is over its daily read limit or otherwise down; the card then looked
 * like a dead button (Random redrew nothing, the Meaning switch stayed English).
 * This endpoint publishes the same verse texts — the same src/data/surahs files
 * the D1 seed (scripts/build-quran-seed.mjs) is generated from — as one static
 * JSON per surah, fetched on demand only when the API cannot answer. Data asset,
 * not a page: nothing links to it and it stays out of the sitemap.
 */
import surahsMeta from '../../data/surahs-meta.json';

const surahFiles = import.meta.glob('../../data/surahs/*.json');

interface Verse {
  v: number;
  ar?: string;
  ur?: string;
  en?: string;
  hi?: string;
}
interface SurahFile {
  verses?: Verse[];
}

export function getStaticPaths() {
  return surahsMeta.map((s) => ({ params: { surah: String(s.num) } }));
}

export async function GET({ params }: { params: Record<string, string> }) {
  const num = Number(params.surah);
  const meta = surahsMeta.find((s) => s.num === num);
  const load = surahFiles[`../../data/surahs/${num}.json`];
  if (!meta || !load) {
    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const mod = (await load()) as { default?: SurahFile };
  const data = mod.default ?? (mod as unknown as SurahFile);
  const payload = {
    n: num,
    slug: meta.slug,
    // Same name the D1 API returns as `sname`, so both paths draw an identical card.
    sname: meta.name,
    vs: (data.verses || []).map((v) => ({
      v: v.v,
      ar: v.ar || '',
      ur: v.ur || '',
      en: v.en || '',
      hi: v.hi || '',
    })),
  };
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  });
}
