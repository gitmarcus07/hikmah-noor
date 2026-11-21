/* Static hadith data — the Share Card Studio's source for Hadith cards.
 * Merges the three hadith collections into one JSON (children's Hadees,
 * Sahih Selections, 40 Hadith of Imam Nawawi) with only the fields a card
 * needs: Arabic, transliteration, English, Urdu, source, narrator, grade,
 * collection label and the canonical detail path. Fetched on demand only
 * when the user picks a Hadith card and cached for the session.
 * Data asset, not a page: nothing links to it and it stays out of the sitemap.
 * Companion files: /card-data/names.json, /card-data/duas/<cat>.json.
 */
import { HADEES } from '../../data/hadees';
import { NAWAWI } from '../../data/hadees-nawawi';
import { SAHIH } from '../../data/hadees-sahih';

interface CardHadees {
  s: string; t: string; a: string; lt: string; e: string; u: string;
  src: string; nar: string; gr: string; col: string; p: string;
}

const row = (h: {
  slug: string; title: string; arabic: string; translit: string;
  translation: string; urdu: string; source: string; narrator?: string;
  grade: string;
}, col: string): CardHadees => ({
  s: h.slug,
  t: h.title,
  a: h.arabic,
  lt: h.translit,
  e: h.translation,
  u: h.urdu,
  src: h.source,
  nar: h.narrator || '',
  gr: h.grade,
  col,
  p: `/hadees/${h.slug}/`,
});

export function GET() {
  const payload = [
    ...HADEES.map((h) => row(h, 'Hadees for children')),
    ...SAHIH.map((h) => row(h, 'Sahih Selections')),
    ...NAWAWI.map((h) => row(h, '40 Hadith of Imam Nawawi')),
  ];
  return new Response(JSON.stringify({ hadith: payload }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  });
}
