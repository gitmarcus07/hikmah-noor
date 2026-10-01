/* Hikmah Noor — content localization for kalimas/hadees/seerah/meanings/quizzes/history/names.
 * Per-locale overlays keyed by slug (names keyed by number). Missing keys fall back to English.
 */
import { KALIMAS_UR } from '../data/i18n/kalimas-ur';
import { KALIMAS_HI } from '../data/i18n/kalimas-hi';
import { KALIMAS_AR } from '../data/i18n/kalimas-ar';
import { HADEES_UR } from '../data/i18n/hadees-ur';
import { HADEES_HI } from '../data/i18n/hadees-hi';
import { HADEES_AR } from '../data/i18n/hadees-ar';
import { NAWAWI_UR } from '../data/i18n/nawawi-ur';
import { NAWAWI_HI } from '../data/i18n/nawawi-hi';
import { NAWAWI_AR } from '../data/i18n/nawawi-ar';
import { SAHIH_UR } from '../data/i18n/sahih-ur';
import { SAHIH_HI } from '../data/i18n/sahih-hi';
import { SAHIH_AR } from '../data/i18n/sahih-ar';
import { SEERAH_UR } from '../data/i18n/seerah-ur';
import { SEERAH_HI } from '../data/i18n/seerah-hi';
import { SEERAH_AR } from '../data/i18n/seerah-ar';
import { MEANINGS_UR } from '../data/i18n/meanings-ur';
import { MEANINGS_HI } from '../data/i18n/meanings-hi';
import { MEANINGS_AR } from '../data/i18n/meanings-ar';
import { QUIZZES_UR, QUIZ_CATS_UR } from '../data/i18n/quizzes-ur';
import { QUIZZES_HI, QUIZ_CATS_HI } from '../data/i18n/quizzes-hi';
import { QUIZZES_AR, QUIZ_CATS_AR } from '../data/i18n/quizzes-ar';
import { HISTORY_UR } from '../data/i18n/history-ur';
import { HISTORY_HI } from '../data/i18n/history-hi';
import { HISTORY_AR } from '../data/i18n/history-ar';
import { NAMES_ALLAH_UR, NAMES_PROPHET_UR } from '../data/i18n/names-ur';
import { NAMES_ALLAH_HI, NAMES_PROPHET_HI } from '../data/i18n/names-hi';
import { NAMES_ALLAH_AR, NAMES_PROPHET_AR } from '../data/i18n/names-ar';
import { GUIDE_CATS_HI, GUIDE_CATS_AR, HADEES_CATS_HI, HADEES_CATS_AR, SAHIH_CATS_HI, SAHIH_CATS_AR } from '../data/i18n/guide-cats-extra';

function mergeAlias(out: any, item: any, ov: any) {
  out.aliases = [...(item.aliases || []), ...(ov.aliasesUr || []), ...(ov.aliasesHi || []), ...(ov.aliasesAr || [])];
}
function applyFields(out: any, ov: any, skip: string[] = []) {
  for (const [k, v] of Object.entries(ov)) {
    if (skip.includes(k)) continue;
    if (k.startsWith('aliases')) continue;
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
}
function localizeWith(maps: Record<string, any>, item: any, locale: string, key?: string): any {
  if (!item || locale === 'en') return item;
  const map = maps[locale];
  if (!map) return item;
  const ov = map[key ?? item.slug];
  if (!ov) return item;
  const out = { ...item };
  applyFields(out, ov);
  mergeAlias(out, item, ov);
  return out;
}
function localizeListWith(maps: Record<string, any>, list: any[], locale: string): any[] {
  if (locale === 'en' || !maps[locale]) return list;
  return list.map((x) => localizeWith(maps, x, locale));
}

const KALIMA_MAPS = { ur: KALIMAS_UR, hi: KALIMAS_HI, ar: KALIMAS_AR };
export const localizeKalima = (k: any, locale: string) => localizeWith(KALIMA_MAPS, k, locale);
export const localizeKalimaList = (l: any[], locale: string) => localizeListWith(KALIMA_MAPS, l, locale);

const HADEES_MAPS = { ur: HADEES_UR, hi: HADEES_HI, ar: HADEES_AR };
const NAWAWI_MAPS = { ur: NAWAWI_UR, hi: NAWAWI_HI, ar: NAWAWI_AR };
const SAHIH_MAPS = { ur: SAHIH_UR, hi: SAHIH_HI, ar: SAHIH_AR };
export function localizeHadees(h: any, locale: string, coll: string): any {
  const maps = coll === 'nawawi' ? NAWAWI_MAPS : coll === 'sahih' ? SAHIH_MAPS : HADEES_MAPS;
  return localizeWith(maps, h, locale);
}

const SEERAH_MAPS = { ur: SEERAH_UR, hi: SEERAH_HI, ar: SEERAH_AR };
export const localizeSeerah = (s: any, locale: string) => localizeWith(SEERAH_MAPS, s, locale);
export const localizeSeerahList = (l: any[], locale: string) => localizeListWith(SEERAH_MAPS, l, locale);

const MEANING_MAPS = { ur: MEANINGS_UR, hi: MEANINGS_HI, ar: MEANINGS_AR };
export const localizeMeaning = (m: any, locale: string) => localizeWith(MEANING_MAPS, m, locale);
export const localizeMeaningList = (l: any[], locale: string) => localizeListWith(MEANING_MAPS, l, locale);

const QUIZ_MAPS = { ur: QUIZZES_UR, hi: QUIZZES_HI, ar: QUIZZES_AR };
const QUIZ_CAT_MAPS = { ur: QUIZ_CATS_UR, hi: QUIZ_CATS_HI, ar: QUIZ_CATS_AR };
export function localizeQuiz(q: any, locale: string): any {
  if (!q || locale === 'en') return q;
  const ov = (QUIZ_MAPS as any)[locale]?.[q.slug];
  if (!ov) return q;
  const out = { ...q };
  if (ov.title) out.title = ov.title;
  if (ov.desc) out.desc = ov.desc;
  if (Array.isArray(ov.questions) && ov.questions.length === q.questions.length) {
    out.questions = q.questions.map((qq: any, i: number) => ({ ...qq, ...(ov.questions[i] || {}) }));
  }
  mergeAlias(out, q, ov);
  return out;
}
export const localizeQuizList = (l: any[], locale: string) => {
  if (locale === 'en') return l;
  return l.map((x) => localizeQuiz(x, locale));
};
export const localizeQuizCat = (c: any, locale: string) => {
  if (!c || locale === 'en') return c;
  const ov = (QUIZ_CAT_MAPS as any)[locale]?.[c.slug];
  if (!ov) return c;
  return { ...c, ...(ov.title ? { title: ov.title } : {}), ...(ov.desc ? { desc: ov.desc } : {}) };
};

const HISTORY_MAPS = { ur: HISTORY_UR, hi: HISTORY_HI, ar: HISTORY_AR };
export const localizeHistory = (h: any, locale: string) => localizeWith(HISTORY_MAPS, h, locale);
export const localizeHistoryList = (l: any[], locale: string) => localizeListWith(HISTORY_MAPS, l, locale);

const NAMES_A_MAPS = { ur: NAMES_ALLAH_UR, hi: NAMES_ALLAH_HI, ar: NAMES_ALLAH_AR };
const NAMES_P_MAPS = { ur: NAMES_PROPHET_UR, hi: NAMES_PROPHET_HI, ar: NAMES_PROPHET_AR };
export function localizeAllahName(n: any, locale: string): any {
  if (locale === 'en') return n;
  const m = (NAMES_A_MAPS as any)[locale]?.[String(n.n)];
  if (!m) return n;
  return { ...n, meaning: m };
}
export function localizeProphetName(n: any, locale: string): any {
  if (locale === 'en') return n;
  const m = (NAMES_P_MAPS as any)[locale]?.[String(n.n)];
  if (!m) return n;
  return { ...n, meaning: m };
}

const GUIDE_CAT_MAPS = { hi: GUIDE_CATS_HI, ar: GUIDE_CATS_AR };
export const localizeGuideCatX = (c: any, locale: string) => {
  if (locale === 'en' || locale === 'ur' || !c) return c;
  const ov = (GUIDE_CAT_MAPS as any)[locale]?.[c.slug];
  if (!ov) return c;
  return { ...c, ...(ov.title ? { title: ov.title } : {}), ...(ov.desc ? { desc: ov.desc } : {}) };
};
const HADEES_CAT_MAPS = { hi: HADEES_CATS_HI, ar: HADEES_CATS_AR };
const SAHIH_CAT_MAPS = { hi: SAHIH_CATS_HI, ar: SAHIH_CATS_AR };
export const localizeHadeesCat = (c: any, locale: string) => {
  if (locale === 'en' || locale === 'ur' || !c) return c;
  const ov = (HADEES_CAT_MAPS as any)[locale]?.[c.slug];
  if (!ov) return c;
  return { ...c, ...(ov.title ? { title: ov.title } : {}), ...(ov.desc ? { desc: ov.desc } : {}) };
};
export const localizeSahihCat = (c: any, locale: string) => {
  if (locale === 'en' || locale === 'ur' || !c) return c;
  const ov = (SAHIH_CAT_MAPS as any)[locale]?.[c.slug];
  if (!ov) return c;
  return { ...c, ...(ov.title ? { title: ov.title } : {}), ...(ov.desc ? { desc: ov.desc } : {}) };
};
