import { getCollection } from 'astro:content';
import { nonDefaultLocales } from '../../i18n/utils';
import surahsMeta from '../../data/surahs-meta.json';
import parasMeta from '../../data/paras-meta.json';
import { toolIndexItems, duaIndexItems, kalimaIndexItems, meaningIndexItems, waqiahIndexItems, prophetIndexItems, hadeesIndexItems, seerahIndexItems, guideIndexItems, tagSurah } from '../../lib/search';

export async function getStaticPaths() {
  return nonDefaultLocales.map(locale => ({ params: { locale } }));
}

export async function GET({ params }: any) {
  const { locale } = params;
  // Native articles first, then EN fill-ins (deduped by slug) so hi/ur/ar
  // search never looks empty. EN fill-ins keep EN URLs + locale:'en' so the
  // frontend shows the EN badge and links to the real page (no 404).
  const all = await getCollection('articles', ({ data }) => !data.draft && (data.locale === locale || data.locale === 'en'));
  const slugOf = (id: string) => id.split('/').pop()!.replace(/\.mdx?$/, '');
  const native = all.filter((e) => e.data.locale === locale);
  const seen = new Set(native.map((e) => slugOf(e.id)));
  const fill = locale === 'en' ? [] : all.filter((e) => e.data.locale === 'en' && !seen.has(slugOf(e.id)));
  const list = [...native, ...fill];
  const surahItems = (surahsMeta as any[]).map(s => tagSurah({
    title: `Surah ${s.name} (${s.englishName})`,
    description: `Surah ${s.num} â€” ${s.verseCount} verses, ${s.revelation === 'Mecca' ? 'Makki' : 'Madani'}. Read in Arabic with Urdu, English & Hindi meaning, transliteration and audio.`,
    category: 'surahs',
    url: `/${locale}/surahs/${s.slug}/`,
    tags: ['quran', 'surah', 'juz', 'para', s.name.toLowerCase(), s.englishName.toLowerCase(), String(s.num)],
    locale,
  }));
  const paraItems = (parasMeta as any[]).map(p => ({
    title: `Quran Para ${p.num} (${p.name})`,
    description: `Para ${p.num} (${p.name}) â€” ${p.range}. Read in Arabic with Urdu, English & Hindi meaning, transliteration and audio.`,
    category: 'quran',
    url: `/${locale}/quran/${p.slug}/`,
    tags: ['quran', 'para', 'parah', 'juz', `para ${p.num}`, `juz ${p.num}`, p.name.toLowerCase(), String(p.num)],
    locale,
  }));
  const items = [...toolIndexItems(locale), ...duaIndexItems(locale), ...kalimaIndexItems(locale), ...meaningIndexItems(locale), ...waqiahIndexItems(locale), ...prophetIndexItems(locale), ...hadeesIndexItems(locale), ...seerahIndexItems(locale), ...guideIndexItems(locale), ...paraItems, ...surahItems, ...list.map(e => ({
    title: e.data.title,
    description: e.data.description,
    category: e.data.category,
    // EN fill-ins link to the real EN page (no /hi prefix) to avoid 404s.
    url: e.data.locale === 'en' ? `/${e.data.category}/${slugOf(e.id)}/` : `/${locale}/${e.data.category}/${slugOf(e.id)}/`,
    tags: e.data.tags,
    locale: e.data.locale,
  }))];
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}
