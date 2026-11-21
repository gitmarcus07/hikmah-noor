/* Static per-category dua data — the Share Card Studio's source for Dua cards.
 * One JSON per Dua category (there are 38, ~573 duas in total): Arabic,
 * transliteration, English meaning, source, narrator, grade and the canonical
 * detail path. Split per category for the same reason /ayah-data/ is per surah —
 * the studio only ever fetches the category the user is looking at, never the
 * whole 500KB library. Fetched on demand and cached for the session.
 * Data asset, not a page: nothing links to it and it stays out of the sitemap.
 * Companion files: /card-data/names.json, /card-data/hadith.json.
 */
import { DUA_CATS, DUAS } from '../../../data/duas';

interface CardDua {
  s: string; t: string; a: string; lt: string; e: string;
  src: string; nar: string; gr: string; p: string;
}

export function getStaticPaths() {
  return DUA_CATS.map((c) => ({ params: { cat: c.slug } }));
}

export async function GET({ params }: { params: Record<string, string> }) {
  const cat = DUA_CATS.find((c) => c.slug === params.cat);
  if (!cat) {
    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const payload: CardDua[] = DUAS.filter((d) => d.cat === cat.slug).map((d) => ({
    s: d.slug,
    t: d.title,
    a: d.arabic,
    lt: d.translit,
    e: d.translation,
    src: d.source,
    nar: d.narrator || '',
    gr: d.grade || '',
    p: `/duas/${d.cat}/${d.slug}/`,
  }));
  return new Response(JSON.stringify({ cat: cat.slug, title: cat.title, duas: payload }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  });
}
