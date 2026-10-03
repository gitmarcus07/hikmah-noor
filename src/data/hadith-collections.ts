/* Hikmah Noor — Hadith collection registry (Phase 8 canonical model).
 *
 * Hierarchy: Collection -> Book -> Chapter (only when the source provides
 * chapters) -> Hadith entry. Designed so future collections plug in as new
 * dataset files + one registry row, with zero redesign.
 *
 * RULES (religious-content safety):
 * - Texts come VERBATIM from src/data/hadith/*.json (pinned open corpus,
 *   provenance recorded in each file). Nothing is authored here.
 * - Only fields present in the dataset are exposed. No grades, narrators,
 *   chapters or translations are inferred when the source lacks them.
 * - Counts are DERIVED from the dataset, never hard-coded.
 * - Canonical dataset per collection lives in JSON; this module is the
 *   typed read API + Phase 6 entity registration.
 */

import { registerEntity } from './relationships';
import nawawiJson from './hadith/nawawi.json';

export interface HadithCollection {
  id: string;
  slug: string;
  name: string;
  /** Short display label for derived titles (e.g. "Nawawi" in "Nawawi Hadith 2"). */
  short: string;
  arabicName?: string;
  compiler?: string;
  description: string;
  /** Short provenance line shown on collection pages (factual, sourced). */
  provenanceLine: string;
}

export interface HadithBook {
  id: string;
  collectionId: string;
  num: number;
  slug: string;
  title: string;
  first: number;
  last: number;
}

export interface HadithEntry {
  id: string;
  collectionId: string;
  bookNum: number;
  /** Stable hadith number within the collection (1-based, from source). */
  num: number;
  arabic: string;
  english: string;
  reference: string;
}

interface CollectionDataset {
  provenance: { sourceRepo: string; sourceLicense: string; retrievedUtc: string };
  collection: { id: string; slug: string; name: string; arabicName?: string; compiler?: string; description: string };
  books: { id: string; num: number; slug: string; title: string; first: number; last: number }[];
  hadith: { id: string; num: number; book: number; arabic: string; english: string; reference: string }[];
}

const DATASETS: Record<string, CollectionDataset> = {
  nawawi: nawawiJson as unknown as CollectionDataset,
};

/** Short display labels per collection (Phase 8: one row). */
const COLLECTION_SHORT: Record<string, string> = {
  nawawi: 'Nawawi',
};

function provLine(id: string): string {
  const p = DATASETS[id].provenance;
  return `Arabic matn and English translation reproduced verbatim from the open hadith corpus (${p.sourceRepo}, ${p.sourceLicense}); retrieved ${p.retrievedUtc}.`;
}

export const HADITH_COLLECTIONS: HadithCollection[] = Object.values(DATASETS).map((d) => ({
  id: d.collection.id,
  slug: d.collection.slug,
  name: d.collection.name,
  short: COLLECTION_SHORT[d.collection.id] ?? d.collection.name,
  arabicName: d.collection.arabicName,
  compiler: d.collection.compiler,
  description: d.collection.description,
  provenanceLine: provLine(d.collection.id),
}));

export const HADITH_BOOKS: HadithBook[] = Object.values(DATASETS).flatMap((d) =>
  d.books.map((b) => ({ id: b.id, collectionId: d.collection.id, num: b.num, slug: b.slug, title: b.title, first: b.first, last: b.last })),
);

export const HADITH_ENTRIES: HadithEntry[] = Object.values(DATASETS).flatMap((d) =>
  d.hadith.map((h) => ({ id: h.id, collectionId: d.collection.id, bookNum: h.book, num: h.num, arabic: h.arabic, english: h.english, reference: h.reference })),
);

/* ------------------------------------------------------------------ */
/* Read API (all counts derived)                                       */
/* ------------------------------------------------------------------ */

export function hadithCollectionBySlug(slug: string): HadithCollection | undefined {
  return HADITH_COLLECTIONS.find((c) => c.slug === slug);
}

export function hadithBooksOf(collectionId: string): HadithBook[] {
  return HADITH_BOOKS.filter((b) => b.collectionId === collectionId).sort((a, b) => a.num - b.num);
}

export function hadithBookBySlug(collectionId: string, bookSlug: string): HadithBook | undefined {
  return hadithBooksOf(collectionId).find((b) => b.slug === bookSlug);
}

export function hadithEntriesOf(collectionId: string, bookNum?: number): HadithEntry[] {
  const list = HADITH_ENTRIES.filter((h) => h.collectionId === collectionId && (bookNum === undefined || h.bookNum === bookNum));
  return list.sort((a, b) => a.num - b.num);
}

export function hadithEntryByNum(collectionId: string, bookNum: number, num: number): HadithEntry | undefined {
  return HADITH_ENTRIES.find((h) => h.collectionId === collectionId && h.bookNum === bookNum && h.num === num);
}

export function hadithCountOf(collectionId: string): number {
  return HADITH_ENTRIES.filter((h) => h.collectionId === collectionId).length;
}

export function prevHadith(entry: HadithEntry): HadithEntry | null {
  const list = hadithEntriesOf(entry.collectionId, entry.bookNum);
  const i = list.findIndex((h) => h.num === entry.num);
  return i > 0 ? list[i - 1] : null;
}

export function nextHadith(entry: HadithEntry): HadithEntry | null {
  const list = hadithEntriesOf(entry.collectionId, entry.bookNum);
  const i = list.findIndex((h) => h.num === entry.num);
  return i >= 0 && i < list.length - 1 ? list[i + 1] : null;
}

/* ------------------------------------------------------------------ */
/* Canonical URL paths (locale prefix applied at render via localizedPath) */
/* ------------------------------------------------------------------ */

export const HADITH_BASE = '/hadees';

export function collectionPath(collectionSlug: string): string {
  return `${HADITH_BASE}/${collectionSlug}/`;
}

export function bookPath(collectionSlug: string, bookSlug: string): string {
  return `${HADITH_BASE}/${collectionSlug}/${bookSlug}/`;
}

export function entryPath(collectionSlug: string, bookSlug: string, num: number): string {
  return `${HADITH_BASE}/${collectionSlug}/${bookSlug}/${num}/`;
}

/* ------------------------------------------------------------------ */
/* Curated study-version mapping (verified 2026-10-03).
 * Canonical Nawawi numbers 1-40 each map to exactly one existing curated
 * study page (repo num field + title correspondence; 35 confirmed by
 * normalized Arabic-excerpt containment, remaining 5 manually reviewed as
 * the same hadith: mid-matn excerpts / orthographic variants).
 * Numbers 41-42 have no curated counterpart (repo set holds 1-40 only).
 * This table is the ONLY basis for migration cross-links and edges. */
/* ------------------------------------------------------------------ */

export const NAWAWI_STUDY: Record<number, string> = {
  1: 'nawawi-intentions',
  2: 'nawawi-jibril',
  3: 'nawawi-pillars',
  4: 'nawawi-creation-decree',
  5: 'nawawi-rejected-deeds',
  6: 'nawawi-halal-haram',
  7: 'nawawi-sincerity',
  8: 'nawawi-ordered-fight',
  9: 'nawawi-avoid-excess',
  10: 'nawawi-pure-sustenance',
  11: 'nawawi-leave-doubtful',
  12: 'nawawi-leave-unconcern',
  13: 'nawawi-love-brother',
  14: 'nawawi-sanctity-life',
  15: 'nawawi-speech-silence',
  16: 'nawawi-no-anger',
  17: 'nawawi-excellence',
  18: 'nawawi-taqwa-character',
  19: 'nawawi-mindful-allah',
  20: 'nawawi-shyness',
  21: 'nawawi-steadfast-belief',
  22: 'nawawi-essentials-paradise',
  23: 'nawawi-purity-faith',
  24: 'nawawi-no-oppression',
  25: 'nawawi-charity-joints',
  26: 'nawawi-justice-sulh',
  27: 'nawawi-righteousness-sin',
  28: 'nawawi-hold-sunnah',
  29: 'nawawi-gates-goodness',
  30: 'nawawi-limits-allah',
  31: 'nawawi-zuhd',
  32: 'nawawi-no-harm',
  33: 'nawawi-burden-proof',
  34: 'nawawi-change-evil',
  35: 'nawawi-brotherhood-rules',
  36: 'nawawi-relieve-believer',
  37: 'nawawi-deeds-multiplied',
  38: 'nawawi-wali-love',
  39: 'nawawi-lifted-excuses',
  40: 'nawawi-stranger-world',
};

export function studySlugFor(collectionId: string, num: number): string | null {
  if (collectionId === 'nawawi') return NAWAWI_STUDY[num] ?? null;
  return null;
}

/* ------------------------------------------------------------------ */
/* Phase 6 entity registration (single central place)                  */
/* ------------------------------------------------------------------ */

for (const c of HADITH_COLLECTIONS) registerEntity('hadith-collection', c.slug);
for (const b of HADITH_BOOKS) {
  const coll = HADITH_COLLECTIONS.find((c) => c.id === b.collectionId)!;
  registerEntity('hadith-book', b.slug, coll.slug);
}
for (const h of HADITH_ENTRIES) {
  const coll = HADITH_COLLECTIONS.find((c) => c.id === h.collectionId)!;
  const book = HADITH_BOOKS.find((b) => b.collectionId === h.collectionId && b.num === h.bookNum)!;
  registerEntity('hadith-entry', String(h.num), `${coll.slug}/${book.slug}`);
}
