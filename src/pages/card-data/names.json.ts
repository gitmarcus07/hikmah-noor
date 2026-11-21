/* Static Names of Allah data — the Share Card Studio's source for Name cards.
 * One JSON carrying the 99 names with the Arabic, transliteration, meaning and
 * the canonical detail path, so the studio can build a card (and its return
 * link) without touching the database. Fetched on demand only when the user
 * picks a Name card and cached for the session. Data asset, not a page:
 * nothing links to it and it stays out of the sitemap.
 * Companion files: /card-data/hadith.json, /card-data/duas/<cat>.json.
 */
import { ALLAH } from '../../data/names';

export function GET() {
  const payload = ALLAH.map((e) => ({
    n: e.n,
    s: e.slug,
    // Transliteration doubles as the card's display name (Ar-Rahman, ...).
    t: e.translit,
    a: e.arabic,
    m: e.meaning,
    p: `/names-of-allah/${e.slug}/`,
  }));
  return new Response(JSON.stringify({ names: payload }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  });
}
