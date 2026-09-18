import { getCollection } from 'astro:content';

export async function getByLocale(locale: string, category?: string, limit?: number) {
  let list = await getCollection('articles', ({ data }) => !data.draft && data.locale === locale);
  // fallback to English if translation missing
  if (list.length === 0 && locale !== 'en') {
    list = await getCollection('articles', ({ data }) => !data.draft && data.locale === 'en');
  }
  if (category) list = list.filter((e) => e.data.category === category);
  list = list.sort((a, b) => +b.data.pubDate - +a.data.pubDate);
  return limit ? list.slice(0, limit) : list;
}

/**
 * Native articles first, then English fill-ins (deduped by slug) so
 * hi/ur/ar pages never look empty. Renderers show an "EN" badge whenever
 * `entry.data.locale !== pageLocale` (see ArticleCard `entryLocale` prop).
 * For `locale === 'en'` this is just the English list.
 */
export async function getMixedLocale(locale: string, category?: string) {
  const list = await getCollection('articles', ({ data }) => !data.draft && (data.locale === locale || data.locale === 'en'));
  const wanted = category ? list.filter((e) => e.data.category === category) : list;
  const byDate = (a: any, b: any) => +b.data.pubDate - +a.data.pubDate;
  const native = wanted.filter((e) => e.data.locale === locale).sort(byDate);
  if (locale === 'en') return native;
  const seen = new Set(native.map((e) => slugFromId(e.id)));
  const fill = wanted.filter((e) => e.data.locale === 'en' && !seen.has(slugFromId(e.id))).sort(byDate);
  return [...native, ...fill];
}

export function entryUrl(locale: string, category: string, slug: string) {
  if (locale === 'en') return `/${category}/${slug}/`;
  return `/${locale}/${category}/${slug}/`;
}

export function slugFromId(id: string) {
  // id like "en/dua-for-travel.mdx" -> "dua-for-travel"
  const parts = id.split('/');
  const file = parts[parts.length - 1];
  return file.replace(/\.mdx?$/, '');
}
