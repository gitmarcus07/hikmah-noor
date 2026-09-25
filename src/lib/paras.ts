import parasMeta from '../data/paras-meta.json';
import surahsMeta from '../data/surahs-meta.json';

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

export function paraTitle(para: ParaMeta) {
  return `Quran Para ${para.num} (${para.name}) with Urdu, English & Hindi Translation`;
}

export function paraDescription(para: ParaMeta) {
  return `Read Quran Para ${para.num} (${para.name}, ${para.range}) in Arabic (Uthmani) with Urdu, English and Hindi meaning, transliteration and audio recitation. Full Juz ${para.num} of 30.`;
}

export function paraKeywords(para: ParaMeta) {
  return [
    `quran para ${para.num}`,
    `quran juz ${para.num}`,
    `para ${para.num} ${para.name.toLowerCase()}`,
    `juz ${para.num} ${para.name.toLowerCase()}`,
    `quran para ${para.num} with urdu translation`,
    `quran para ${para.num} english translation`,
    `quran para ${para.num} hindi meaning`,
    `quran para ${para.num} audio`,
    `quran para ${para.num} transliteration`,
    para.range.toLowerCase(),
  ].join(', ');
}

export function paraFaq(para: ParaMeta) {
  return [
    {
      q: `Which surahs are in Quran Para ${para.num}?`,
      a: `Para ${para.num} (${para.name}) covers ${para.range}.`,
    },
    {
      q: `How can I read Quran Para ${para.num} with translation?`,
      a: `This page shows every verse of Para ${para.num} in Arabic with Urdu, English and Hindi meaning, transliteration and audio. Use the language buttons above the verses to switch translation.`,
    },
    {
      q: `Can I listen to Quran Para ${para.num} audio?`,
      a: `Yes. Press play on any verse for Arabic recitation — choose from 5 reciters (Alafasy, Abdul Basit, Husary, Muaiqly, Minshawi) in the 🎙 menu — or use Play para to listen continuously. Urdu and English translation audio is available from the dropdown.`,
    },
  ];
}
