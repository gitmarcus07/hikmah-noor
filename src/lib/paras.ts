import parasMeta from '../data/paras-meta.json';
import surahsMeta from '../data/surahs-meta.json';
import {
  paraTitle as seoParaTitle,
  paraDescription as seoParaDescription,
  paraKeywords as seoParaKeywords,
  paraFaq as seoParaFaq,
} from './surah-seo';

/** Localised para SEO strings live in ./surah-seo (single source of truth).
 *  These wrappers keep the old call shape working; pass the page locale. */
export function paraTitle(para: ParaMeta, locale = 'en') {
  return seoParaTitle(para, locale);
}

export function paraDescription(para: ParaMeta, locale = 'en') {
  return seoParaDescription(para, locale);
}

export function paraKeywords(para: ParaMeta, locale = 'en') {
  return seoParaKeywords(para, locale);
}

export function paraFaq(para: ParaMeta, locale = 'en') {
  return seoParaFaq(para, locale);
}

export interface ParaMeta {
  num: number;
  slug: string;
  name: string;
  arabicName: string;
  transliteration: string;
  start: { surah: number; verse: number };
  end: { surah: number; verse: number };
  range: string;
}

export const paras = parasMeta as ParaMeta[];

export function getPara(num: number) {
  return paras.find((p) => p.num === num);
}

export function getParaBySlug(slug: string) {
  return paras.find((p) => p.slug === slug);
}

export function prevPara(num: number) {
  return num > 1 ? getPara(num - 1) : null;
}

export function nextPara(num: number) {
  return num < 30 ? getPara(num + 1) : null;
}

export function surahMetaByNum(num: number) {
  return (surahsMeta as any[]).find((s) => s.num === num);
}

/** Surahs touched by a para (inclusive). */
export function paraSurahs(para: ParaMeta) {
  const out: any[] = [];
  for (let n = para.start.surah; n <= para.end.surah; n++) {
    const m = surahMetaByNum(n);
    if (m) out.push(m);
  }
  return out;
}
