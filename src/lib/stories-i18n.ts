/* Hikmah Noor — story localization overlays (ur/hi/ar).
 * Covers prophets (25, ur), sahaba (24, ur), women (12, ur),
 * waqiat (44 × ur/hi/ar). Narrative/events/lessons/summary/title
 * translated; arabic, refs, motifs and order stay universal.
 * Missing slugs fall back to English automatically.
 */
import { PROPHETS_UR } from '../data/i18n/prophets-ur';
import { PROPHETS_HI } from '../data/i18n/prophets-hi';
import { PROPHETS_AR } from '../data/i18n/prophets-ar';
import { SAHABA_UR } from '../data/i18n/sahaba-ur';
import { SAHABA_UR_2 } from '../data/i18n/sahaba-ur-2';
import { SAHABA_HI } from '../data/i18n/sahaba-hi';
import { SAHABA_AR } from '../data/i18n/sahaba-ar';
import { WOMEN_UR } from '../data/i18n/women-ur';
import { WOMEN_HI } from '../data/i18n/women-hi';
import { WOMEN_AR } from '../data/i18n/women-ar';
import { WAQIAT_UR } from '../data/i18n/waqiat-ur';
import { WAQIAT_UR_2 } from '../data/i18n/waqiat-ur-2';
import { WAQIAT_HI_1 } from '../data/i18n/waqiat-hi-1';
import { WAQIAT_HI_2 } from '../data/i18n/waqiat-hi-2';
import { WAQIAT_AR_1 } from '../data/i18n/waqiat-ar-1';
import { WAQIAT_AR_2 } from '../data/i18n/waqiat-ar-2';

export interface StoryOverlay {
  title?: string;
  summary?: string;
  narrative?: string[];
  events?: string[];
  lessons?: string[];
  aliasesUr?: string[];
  aliasesHi?: string[];
  aliasesAr?: string[];
}

const MAPS: Record<string, Record<string, Record<string, StoryOverlay>>> = {
  ur: {
    prophets: PROPHETS_UR,
    sahaba: Object.assign({}, SAHABA_UR, SAHABA_UR_2),
    women: WOMEN_UR,
    waqiat: Object.assign({}, WAQIAT_UR, WAQIAT_UR_2),
  },
  hi: {
    prophets: PROPHETS_HI,
    sahaba: SAHABA_HI,
    women: WOMEN_HI,
    waqiat: Object.assign({}, WAQIAT_HI_1, WAQIAT_HI_2),
  },
  ar: {
    prophets: PROPHETS_AR,
    sahaba: SAHABA_AR,
    women: WOMEN_AR,
    waqiat: Object.assign({}, WAQIAT_AR_1, WAQIAT_AR_2),
  },
};

export function localizeStory(item: any, kind: string, locale: string): any {
  if (locale === 'en') return item;
  const ov = (MAPS as any)[locale]?.[kind]?.[item?.slug];
  if (!ov) return item;
  const { aliasesUr, aliasesHi, aliasesAr, ...rest } = ov as StoryOverlay;
  const out: any = { ...item };
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v) && (v as any[]).length === 0) continue;
    (out as any)[k] = v;
  }
  out.aliases = [...((item as any).aliases || []), ...(aliasesUr || []), ...(aliasesHi || []), ...(aliasesAr || [])];
  return out;
}

export function localizeStoryList(list: any[], kind: string, locale: string): any[] {
  if (locale === 'en' || !(MAPS as any)[locale]) return list;
  return (list || []).map((x) => localizeStory(x, kind, locale));
}
