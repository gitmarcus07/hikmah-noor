/* Maps legacy frontmatter image paths (/images/x.jpg) and category fallbacks
 * to premium SVG art keys rendered by SiteArt.astro. */
const ART_KEYS = [
  'hero-quran',
  'card-quran', 'card-surahs', 'card-duas', 'card-kalimas',
  'card-meanings', 'card-waqiat',
  'article-kaaba', 'article-prayer', 'article-istiqlal',
  'article-dates', 'article-desert',
] as const;

export type ArtName = (typeof ART_KEYS)[number];

function keyOf(name: string): ArtName | null {
  const base = name.split('/').pop()!.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  return (ART_KEYS as readonly string[]).includes(base) ? (base as ArtName) : null;
}

/** Frontmatter stores '/images/x.jpg' — resolve to an SVG art key, falling back per category. */
export function artFor(image: string | undefined, category: string): ArtName {
  if (image) {
    const k = keyOf(image);
    if (k) return k;
  }
  const fallback = `card-${category}`;
  if ((ART_KEYS as readonly string[]).includes(fallback)) return fallback as ArtName;
  return 'card-quran';
}
