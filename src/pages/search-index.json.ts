import { getCollection } from 'astro:content';
import surahsMeta from '../data/surahs-meta.json';
import parasMeta from '../data/paras-meta.json';
import { TAFSIR } from '../data/tafsir';
import { toolIndexItems, duaIndexItems, kalimaIndexItems, meaningIndexItems, waqiahIndexItems, prophetIndexItems, sahabaIndexItems, womenIndexItems, quizIndexItems, hadeesIndexItems, seerahIndexItems, guideIndexItems, historyIndexItems, tagSurah } from '../lib/search';

export async function GET() {
  const locale = 'en';
  let list = await getCollection('articles', ({ data }) => !data.draft && data.locale === locale);
  const surahItems = (surahsMeta as any[]).map(s => tagSurah({
    title: `Surah ${s.name} (${s.englishName})`,
    description: `Surah ${s.num} — ${s.verseCount} verses, ${s.revelation === 'Mecca' ? 'Makki' : 'Madani'}. Read in Arabic with Urdu, English & Hindi meaning, transliteration and audio.${(TAFSIR as any)[s.num] ? ` ${(TAFSIR as any)[s.num].intro}` : ''}`,
    category: 'surahs',
    url: `/surahs/${s.slug}/`,
    tags: ['quran', 'surah', 'juz', 'para', 'tafsir', s.name.toLowerCase(), s.englishName.toLowerCase(), String(s.num), ...(((TAFSIR as any)[s.num]?.themes || []) as string[]).map((t: string) => t.toLowerCase())],
    locale,
  }));
  const paraItems = (parasMeta as any[]).map(p => ({
    title: `Quran Para ${p.num} (${p.name})`,
    description: `Para ${p.num} (${p.name}) â€” ${p.range}. Read in Arabic with Urdu, English & Hindi meaning, transliteration and audio.`,
    category: 'quran',
    url: `/quran/${p.slug}/`,
    tags: ['quran', 'para', 'parah', 'juz', `para ${p.num}`, `juz ${p.num}`, p.name.toLowerCase(), String(p.num)],
    locale,
  }));
  const items = [...toolIndexItems(locale), ...duaIndexItems(locale), ...kalimaIndexItems(locale), ...meaningIndexItems(locale), ...waqiahIndexItems(locale), ...prophetIndexItems(locale), ...sahabaIndexItems(locale), ...womenIndexItems(locale), ...quizIndexItems(locale), ...hadeesIndexItems(locale), ...seerahIndexItems(locale), ...guideIndexItems(locale), ...historyIndexItems(locale), ...paraItems, ...surahItems, ...list.map(e => ({
    title: e.data.title,
    description: e.data.description,
    category: e.data.category,
    url: `/${e.data.category}/${e.id.split('/').pop()!.replace(/\.mdx?$/, '')}/`,
    tags: e.data.tags,
    locale,
  }))];
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}
