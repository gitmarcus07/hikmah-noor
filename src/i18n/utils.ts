export const locales = ['en', 'hi', 'ur', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
// English lives at `/` (no prefix). Only these locales use a URL prefix.
export const nonDefaultLocales = ['hi', 'ur', 'ar'] as const;
export const rtlLocales: Locale[] = ['ur', 'ar'];
export const isRTL = (l: string) => rtlLocales.includes(l as Locale);

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ur: 'اردو',
  ar: 'العربية',
};

export const localeFlags: Record<Locale, string> = {
  en: '🌐',
  hi: '📖',
  ur: '☪️',
  ar: '📿',
};

export const categories = ['surahs', 'duas', 'kalimas', 'meanings', 'waqiat', 'quran', 'hadees', 'seerat'] as const;
export type Category = (typeof categories)[number];

import en from './en.json';
import hi from './hi.json';
import ur from './ur.json';
import ar from './ar.json';
import appEn from './app-en.json';
import appHi from './app-hi.json';
import appUr from './app-ur.json';
import appAr from './app-ar.json';

const dicts = { en, hi, ur, ar } as const;
const appDicts = { en: appEn, hi: appHi, ur: appUr, ar: appAr } as const;

export function getDict(locale: string) {
  const base = (dicts as any)[locale] ?? en;
  return { ...base, app: (appDicts as any)[locale] ?? appEn };
}

export function localizedPath(locale: string, path = '/') {
  const p = path.startsWith('/') ? path : `/${path}`;
  // Default locale (English) has no prefix: `/about/` not `/en/about/`
  if (locale === 'en' || locale === defaultLocale) return p === '/' ? '/' : p;
  return `/${locale}${p === '/' ? '/' : p}`;
}

export function homePath(locale: string) {
  return localizedPath(locale, '/');
}

export function categoryPath(locale: string, category: string) {
  return localizedPath(locale, `/${category}/`);
}

export function articlePath(locale: string, category: string, slug: string) {
  return localizedPath(locale, `/${category}/${slug}/`);
}
