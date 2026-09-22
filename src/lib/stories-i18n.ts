/* Hikmah Noor — story localization overlays (Urdu first).
 * Covers prophets (25), sahaba (24), women (12), waqiat (10).
 * Narrative/events/lessons/summary/title translated; arabic, refs,
 * motifs and order stay English/universal. Missing slugs fall back.
 */
import { PROPHETS_UR } from '../data/i18n/prophets-ur';
import { SAHABA_UR } from '../data/i18n/sahaba-ur';
import { SAHABA_UR_2 } from '../data/i18n/sahaba-ur-2';
import { WOMEN_UR } from '../data/i18n/women-ur';
import { WAQIAT_UR } from '../data/i18n/waqiat-ur';

export interface StoryOverlay {
  title?: string;
  summary?: string;
  narrative?: string[];
  events?: string[];
  lessons?: string[];
  aliasesUr?: string[];
}

const MAPS: Record<string, Record<string, StoryOverlay>> = {
  prophets: PROPHETS_UR,
  sahaba: Object.assign({}, SAHABA_UR, SAHABA_UR_2),
  women: WOMEN_UR,
  waqiat: WAQIAT_UR,
};

export function localizeStory(item: any, kind: string, locale: string): any {
  if (locale !== 'ur') return item;
  const ov = (MAPS as any)[kind]?.[item?.slug];
  if (!ov) return item;
  const { aliasesUr, ...rest } = ov as StoryOverlay;
  const out: any = { ...item };
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v) && (v as any[]).length === 0) continue;
    (out as any)[k] = v;
  }
  out.aliases = [...((item as any).aliases || []), ...(aliasesUr || [])];
  return out;
}

export function localizeStoryList(list: any[], kind: string, locale: string): any[] {
  if (locale !== 'ur') return list;
  return (list || []).map((x) => localizeStory(x, kind, locale));
}
