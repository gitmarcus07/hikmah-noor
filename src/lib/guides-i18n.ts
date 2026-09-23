/* Hikmah Noor — guide localization overlays (Urdu first).
 * Covers all GUIDES + GUIDE_CATS. Sections/steps/faq/intro/title translated;
 * ref (sources) stays English/universal. Missing slugs fall back.
 */
import { GUIDES_UR_1 } from '../data/i18n/guides-ur-1';
import { GUIDES_UR_2 } from '../data/i18n/guides-ur-2';
import { GUIDES_UR_3, GUIDE_CATS_UR } from '../data/i18n/guides-ur-3';
import { GUIDES_UR_4 } from '../data/i18n/guides-ur-4';
import { GUIDES_UR_5 } from '../data/i18n/guides-ur-5';
import { GUIDES_UR_6 } from '../data/i18n/guides-ur-6';
import { GUIDES_UR_7 } from '../data/i18n/guides-ur-7';
import { GUIDES_UR_8 } from '../data/i18n/guides-ur-8';
import { GUIDES_UR_9 } from '../data/i18n/guides-ur-9';
import { GUIDES_HI_1 } from '../data/i18n/guides-hi-1';
import { GUIDES_AR_1 } from '../data/i18n/guides-ar-1';

export interface GuideOverlay {
  title?: string;
  intro?: string;
  sections?: { h: string; ps: string[] }[];
  steps?: string[];
  faq?: { q: string; a: string }[];
  aliasesUr?: string[];
}

const GUIDE_MAP: Record<string, GuideOverlay> = Object.assign({}, GUIDES_UR_1, GUIDES_UR_2, GUIDES_UR_3, GUIDES_UR_4, GUIDES_UR_5, GUIDES_UR_6, GUIDES_UR_7, GUIDES_UR_8, GUIDES_UR_9);
const GUIDE_MAP_HI: Record<string, GuideOverlay> = Object.assign({}, GUIDES_HI_1);
const GUIDE_MAP_AR: Record<string, GuideOverlay> = Object.assign({}, GUIDES_AR_1);

function overlayMap(locale: string): Record<string, GuideOverlay> | null {
  if (locale === 'ur') return GUIDE_MAP;
  if (locale === 'hi') return GUIDE_MAP_HI;
  if (locale === 'ar') return GUIDE_MAP_AR;
  return null;
}

export function localizeGuide(item: any, locale: string): any {
  const map = overlayMap(locale);
  if (!map) return item;
  const ov = map?.[item?.slug];
  if (!ov) return item;
  const { aliasesUr, aliasesHi, aliasesAr, ...rest } = ov as any;
  const out: any = { ...item };
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v) && (v as any[]).length === 0) continue;
    (out as any)[k] = v;
  }
  out.aliases = [...((item as any).aliases || []), ...(aliasesUr || []), ...(aliasesHi || []), ...(aliasesAr || [])];
  return out;
}

export function localizeGuideList(list: any[], locale: string): any[] {
  if (!overlayMap(locale)) return list;
  return (list || []).map((x) => localizeGuide(x, locale));
}

export function localizeGuideCat(cat: any, locale: string): any {
  if (locale !== 'ur' || !cat) return cat;
  const ov = (GUIDE_CATS_UR as any)?.[cat.slug];
  if (!ov) return cat;
  return { ...cat, ...(ov.title ? { title: ov.title } : {}), ...(ov.desc ? { desc: ov.desc } : {}) };
}
