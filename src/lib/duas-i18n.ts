/* Hikmah Noor — dua localization overlays (Urdu first).
 * Per-locale modules map dua slug -> translated content fields.
 * Arabic, transliteration, source, grade and repeat stay English (universal);
 * title/use/translation/virtue/when are translated. Missing slugs fall back
 * to English automatically. Urdu-script aliases ride along into search tags.
 */
import { DUAS_UR_1 } from '../data/i18n/duas-ur-1';
import { DUAS_UR_2 } from '../data/i18n/duas-ur-2';
import { DUAS_UR_3 } from '../data/i18n/duas-ur-3';
import { DUAS_UR_4 } from '../data/i18n/duas-ur-4';
import { DUAS_UR_5 } from '../data/i18n/duas-ur-5';
import { DUAS_UR_6 } from '../data/i18n/duas-ur-6';
import { DUAS_HI_1 } from '../data/i18n/duas-hi-1';
import { DUAS_HI_2 } from '../data/i18n/duas-hi-2';
import { DUAS_HI_3 } from '../data/i18n/duas-hi-3';
import { DUAS_HI_4 } from '../data/i18n/duas-hi-4';
import { DUAS_HI_5 } from '../data/i18n/duas-hi-5';
import { DUAS_HI_6 } from '../data/i18n/duas-hi-6';
import { DUAS_HI_7 } from '../data/i18n/duas-hi-7';
import { DUAS_AR_1 } from '../data/i18n/duas-ar-1';
import { DUAS_AR_2 } from '../data/i18n/duas-ar-2';
import { DUAS_AR_3 } from '../data/i18n/duas-ar-3';
import { DUAS_AR_4 } from '../data/i18n/duas-ar-4';
import { DUAS_AR_5 } from '../data/i18n/duas-ar-5';
import { DUAS_AR_6 } from '../data/i18n/duas-ar-6';
import { DUAS_AR_7 } from '../data/i18n/duas-ar-7';

export interface DuaOverlay {
  title?: string;
  use?: string;
  translation?: string;
  virtue?: string;
  when?: string;
  aliasesUr?: string[];
  aliasesHi?: string[];
  aliasesAr?: string[];
}

const OVERLAYS: Record<string, Record<string, DuaOverlay>> = { ur: {}, hi: {}, ar: {} };
for (const part of [DUAS_UR_1, DUAS_UR_2, DUAS_UR_3, DUAS_UR_4, DUAS_UR_5, DUAS_UR_6]) Object.assign(OVERLAYS.ur, part);
Object.assign(OVERLAYS.hi, DUAS_HI_1, DUAS_HI_2, DUAS_HI_3, DUAS_HI_4, DUAS_HI_5, DUAS_HI_6, DUAS_HI_7);
Object.assign(OVERLAYS.ar, DUAS_AR_1, DUAS_AR_2, DUAS_AR_3, DUAS_AR_4, DUAS_AR_5, DUAS_AR_6, DUAS_AR_7);

/** Overlay locales currently shipped. */
export function duaLocales(): string[] {
  return Object.keys(OVERLAYS);
}

function defined<T extends object>(o: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== null && v !== '') (out as any)[k] = v;
  return out;
}

/** Single dua with locale overlay applied (keys/slugs/routes unchanged). */
export function localizeDua(dua: any, locale: string): any {
  const ov = (OVERLAYS as any)[locale]?.[dua?.slug];
  if (!ov) return dua;
  const { aliasesUr, aliasesHi, aliasesAr, ...rest } = ov as DuaOverlay;
  const out = { ...dua, ...defined(rest), aliases: [...((dua as any).aliases || []), ...(aliasesUr || []), ...(aliasesHi || []), ...(aliasesAr || [])] };
  // The English titles of rabbana-duas entries carry a "— Rabbana Dua" suffix
  // that sets them apart from the same verse in topical categories. Overlays
  // drop it, recreating duplicate titles — restore a per-locale marker.
  if (dua?.cat === 'rabbana-duas' && typeof out.title === 'string') {
    if (locale === 'ar' && !out.title.includes('ربنا')) out.title += ' — دعاء ربنا';
    if (locale === 'ur' && !out.title.includes('ربنا')) out.title += ' — ربنا دعا';
    if (locale === 'hi' && !out.title.includes('रब्बना')) out.title += ' — रब्बना दुआ';
  }
  return out;
}

/** Localize a list (hub grids, related, siblings). EN returns as-is. */
export function localizeList(list: any[], locale: string): any[] {
  if (!(OVERLAYS as any)[locale]) return list;
  return (list || []).map((d) => localizeDua(d, locale));
}

/** Translated-slug coverage, e.g. { ur: 258 }. */
export function overlayCoverage(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [loc, map] of Object.entries(OVERLAYS)) out[loc] = Object.keys(map).length;
  return out;
}
