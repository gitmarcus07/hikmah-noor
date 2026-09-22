/* Hikmah Noor — guide localization overlays (Urdu first).
 * Covers all GUIDES + GUIDE_CATS. Sections/steps/faq/intro/title translated;
 * ref (sources) stays English/universal. Missing slugs fall back.
 */
import { GUIDES_UR_1 } from '../data/i18n/guides-ur-1';
import { GUIDES_UR_2 } from '../data/i18n/guides-ur-2';
import { GUIDES_UR_3, GUIDE_CATS_UR } from '../data/i18n/guides-ur-3';

export interface GuideOverlay {
  title?: string;
  intro?: string;
  sections?: { h: string; ps: string[] }[];
  steps?: string[];
  faq?: { q: string; a: string }[];
  aliasesUr?: string[];
}

const GUIDE_MAP: Record<string, GuideOverlay> = Object.assign({}, GUIDES_UR_1, GUIDES_UR_2, GUIDES_UR_3);

export function localizeGuide(item: any, locale: string): any {
  if (locale !== 'ur') return item;
  const ov = GUIDE_MAP?.[item?.slug];
  if (!ov) return item;
  const { aliasesUr, ...rest } = ov as GuideOverlay;
  const out: any = { ...item };
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v) && (v as any[]).length === 0) continue;
    (out as any)[k] = v;
  }
  out.aliases = [...((item as any).aliases || []), ...(aliasesUr || [])];
  return out;
}

export function localizeGuideList(list: any[], locale: string): any[] {
  if (locale !== 'ur') return list;
  return (list || []).map((x) => localizeGuide(x, locale));
}

export function localizeGuideCat(cat: any, locale: string): any {
  if (locale !== 'ur' || !cat) return cat;
  const ov = (GUIDE_CATS_UR as any)?.[cat.slug];
  if (!ov) return cat;
  return { ...cat, ...(ov.title ? { title: ov.title } : {}), ...(ov.desc ? { desc: ov.desc } : {}) };
}
