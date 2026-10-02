/* Hikmah Noor — Names index (Asma-ul-Husna + Asma-un-Nabi detail pages).
 * Enriches names-allah.ts / names-prophet.ts with stable URL slugs,
 * lookups, prev/next and (for prophet names) source-kind buckets.
 *
 * Source-kind buckets for prophet names come ONLY from the repository's
 * own compilation notes (data file header + hub FAQ):
 * - 'quranic': titles the repo header explicitly names as Quranic
 * - 'hadith': epithets the repo header/FAQ explicitly name from hadith
 * - 'traditional': classical attribute lists (everything else)
 * No new religious classification is invented here.
 */
import { ALLAH_NAMES, type AllahName } from './names-allah';
import { PROPHET_NAMES, type ProphetName } from './names-prophet';

/** Slugify a transliteration: lowercase ASCII, apostrophes dropped. */
export function nameSlug(translit: string): string {
  return translit
    .toLowerCase()
    .replace(/[’‘'`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface AllahNameEntry extends AllahName {
  slug: string;
}

export type ProphetNameKind = 'quranic' | 'hadith' | 'traditional';

export interface ProphetNameEntry extends ProphetName {
  slug: string;
  kind: ProphetNameKind;
}

/* Transliterations the repo header explicitly names as Quranic titles. */
const QURANIC_TITLES = new Set(['muhammad', 'ahmad', 'muzammil', 'mudaththir', 'taha', 'yasin', 'abdullah']);
/* Epithets the repo header/FAQ explicitly name as coming from hadith. */
const HADITH_EPITHETS = new Set(['shahid', 'bashir', 'nadhir', 'siraj', 'munir', 'mahi', 'hashir', 'aqib']);

function prophetKind(translit: string): ProphetNameKind {
  const k = nameSlug(translit);
  if (QURANIC_TITLES.has(k)) return 'quranic';
  if (HADITH_EPITHETS.has(k)) return 'hadith';
  return 'traditional';
}

/* The Tirmidhi enumeration famously lists Al-Majid twice (n=49, n=66);
 * those two slugs carry their number to stay unique. */
const ALLAH_SLUG_OVERRIDES: Record<number, string> = { 49: '49-al-majid', 66: '66-al-majid' };

function buildAllah(): AllahNameEntry[] {
  const seen = new Set<string>();
  return ALLAH_NAMES.map((nm) => {
    let slug = ALLAH_SLUG_OVERRIDES[nm.n] ?? nameSlug(nm.translit);
    if (seen.has(slug)) slug = `${nm.n}-${slug}`;
    seen.add(slug);
    return { ...nm, slug };
  });
}

function buildProphet(): ProphetNameEntry[] {
  const seen = new Set<string>();
  return PROPHET_NAMES.map((nm) => {
    let slug = nameSlug(nm.translit);
    if (seen.has(slug)) slug = `${nm.n}-${slug}`;
    seen.add(slug);
    return { ...nm, slug, kind: prophetKind(nm.translit) };
  });
}

export const ALLAH: AllahNameEntry[] = buildAllah();
export const PROPHET: ProphetNameEntry[] = buildProphet();

const ALLAH_BY_SLUG = new Map(ALLAH.map((e) => [e.slug, e]));
const PROPHET_BY_SLUG = new Map(PROPHET.map((e) => [e.slug, e]));
const ALLAH_BY_N = new Map(ALLAH.map((e) => [e.n, e]));
const PROPHET_BY_N = new Map(PROPHET.map((e) => [e.n, e]));

export function allahBySlug(slug: string): AllahNameEntry | undefined {
  return ALLAH_BY_SLUG.get(slug);
}
export function prophetNameBySlug(slug: string): ProphetNameEntry | undefined {
  return PROPHET_BY_SLUG.get(slug);
}
export function prevAllah(n: number): AllahNameEntry | null {
  return ALLAH_BY_N.get(n - 1) ?? null;
}
export function nextAllah(n: number): AllahNameEntry | null {
  return ALLAH_BY_N.get(n + 1) ?? null;
}
export function prevProphetName(n: number): ProphetNameEntry | null {
  return PROPHET_BY_N.get(n - 1) ?? null;
}
export function nextProphetName(n: number): ProphetNameEntry | null {
  return PROPHET_BY_N.get(n + 1) ?? null;
}
