/* Hikmah Noor — localised SEO strings for surah / para / ayah pages.
 *
 * Surah, para and ayah pages were the one section whose titles, meta
 * descriptions and FAQs stayed English on the /ur/, /hi/ and /ar/ variants,
 * so the site could not match Urdu/Hindi/Arabic-script queries. Templates
 * here mirror the dua/kalima detailTitle conventions already shipped in
 * src/lib/dua-ui-i18n.ts and src/lib/site-ui-1.ts (same connector words).
 *
 * Arabic names come from the site's own verified data (surahs-meta.json /
 * paras-meta.json) with diacritics stripped for clean titles — no
 * hand-transliteration of the 114 names is invented anywhere.
 * Tafsir summaries stay English (the editorial source is English); only the
 * question around them is localised.
 *
 * The Cloudflare Pages dynamic ayah renderer (functions/_lib/ayah-page.js)
 * is plain JS and cannot import this file, so it carries a small duplicate
 * of the ayah title/description logic — this file is the source of truth;
 * keep the two in sync.
 */
export type UILocale = 'en' | 'hi' | 'ur' | 'ar';

export interface SurahLike {
  num: number;
  slug: string;
  name: string;
  englishName: string;
  arabicName: string;
  revelation: string;
  verseCount: number;
}

export interface ParaLike {
  num: number;
  slug: string;
  name: string;
  arabicName: string;
  range: string;
}

export interface TafsirLike {
  intro: string;
  themes: string[];
}

function pick<T>(locale: string, map: Record<UILocale, T>): T {
  return (map as any)[locale] ?? map.en;
}

/** Strip Arabic diacritics (harakat, shadda, superscript alef, tatweel,
 *  Quranic annotation marks) and normalise alef-wasla, for clean titles.
 *  e.g. "سُوْرَةُ يٰسٓ" -> "سورة يس", "سَيَقُولُ" -> "سيقول". */
export function stripArabicDiacritics(s: string): string {
  return s
    .replace(/[ً-ٰٟـۖ-ۭ]/g, '')
    .replace(/ٱ/g, 'ا');
}

const REV: Record<string, Record<UILocale, string>> = {
  makki: { en: 'Makki', ur: 'مکی', hi: 'मक्की', ar: 'مكية' },
  madani: { en: 'Madani', ur: 'مدنی', hi: 'मदनी', ar: 'مدنية' },
};

function revWord(revelation: string, locale: string): string {
  const makki = String(revelation).toLowerCase().startsWith('mecca');
  return pick(locale, (makki ? REV.makki : REV.madani) as Record<UILocale, string>);
}

/* ---------------- Surah pages ---------------- */

export function surahTitle(s: SurahLike, locale: string): string {
  const ar = stripArabicDiacritics(s.arabicName);
  return pick(locale, {
    en: `Surah ${s.name} (${s.englishName}) with Urdu, English & Hindi Translation`,
    ur: `${ar} (${s.name}) — اردو ترجمہ، تلاوت اور تفسیر`,
    hi: `${ar} (${s.name}) — हिंदी अनुवाद, तिलावत और तफ़सीर सहित`,
    ar: `${ar} (${s.name}) — الترجمة الأردية والإنجليزية والهندية والتلاوة`,
  });
}

export function surahDescription(s: SurahLike, locale: string, tafsir?: TafsirLike | null): string {
  const ar = stripArabicDiacritics(s.arabicName);
  const base = pick(locale, {
    en: tafsir
      ? `Read Surah ${s.name} (${s.englishName}) — ${s.verseCount} verses in Arabic with Urdu, English and Hindi meaning and audio. Themes: ${tafsir.themes.join(', ')}.`
      : `Read Surah ${s.name} (${s.englishName}) — ${s.verseCount} verses in Arabic (Uthmani) with Urdu, English and Hindi meaning, transliteration and audio recitation.`,
    ur: `${ar} (${s.name}) کی ${s.verseCount} آیات عربی متن کے ساتھ اردو، انگریزی اور ہندی ترجمہ، تلفظ اور آڈیو تلاوت کے ساتھ پڑھیں۔`,
    hi: `सूरह ${ar} (${s.name}) की ${s.verseCount} आयतें अरबी पाठ के साथ उर्दू, अंग्रेज़ी और हिंदी अर्थ, लिप्यंतरण और ऑडियो तिलावत सहित पढ़ें।`,
    ar: `اقرأ ${ar} (${s.name}) — ${s.verseCount} آيات بالنص العربي مع الترجمة الأردية والإنجليزية والهندية والنطق والتلاوة الصوتية.`,
  });
  return base;
}

export function surahKeywords(s: SurahLike, locale: string, tafsir?: TafsirLike | null): string {
  const ar = stripArabicDiacritics(s.arabicName);
  const base =
    `surah ${s.name.toLowerCase()}, surah ${s.num}, ${s.slug}, ` +
    `surah ${s.name.toLowerCase()} in urdu, surah ${s.name.toLowerCase()} english translation, ` +
    `surah ${s.name.toLowerCase()} hindi meaning, surah ${s.name.toLowerCase()} transliteration, ` +
    `surah ${s.name.toLowerCase()} with audio, surah ${s.name.toLowerCase()} recitation` +
    (tafsir ? `, surah ${s.name.toLowerCase()} tafsir, ${tafsir.themes.join(', ').toLowerCase()}` : '');
  const extra = pick(locale, {
    en: '',
    ur: `, ${ar} اردو ترجمہ, ${ar} تلاوت`,
    hi: `, ${ar} हिंदी अनुवाद, ${ar} तिलावत`,
    ar: `, ${ar} ترجمة, ${ar} تلاوة`,
  });
  return base + extra;
}

export function surahFaq(s: SurahLike, locale: string, tafsir?: TafsirLike | null): { q: string; a: string }[] {
  const ar = stripArabicDiacritics(s.arabicName);
  const rev = revWord(s.revelation, locale);
  const out: { q: string; a: string }[] = pick(locale, {
    en: [
      { q: `How many verses are in Surah ${s.name}?`, a: `Surah ${s.name} (${s.englishName}) has ${s.verseCount} verses and is ${rev} (revealed in ${String(s.revelation).toLowerCase() === 'mecca' ? 'Mecca' : 'Medina'}).` },
      { q: `Can I read Surah ${s.name} with translation?`, a: `Yes. This page shows every verse of Surah ${s.name} in Arabic with Urdu, English and Hindi meaning. Use the language buttons above the verses to switch translation.` },
      { q: `Is audio available for Surah ${s.name}?`, a: `Yes. Press play on any verse for Arabic recitation — choose from 5 reciters (Alafasy, Abdul Basit, Husary, Muaiqly, Minshawi) in the 🎙 menu — or use Play surah to listen continuously. Urdu and English translation audio is available from the dropdown.` },
    ],
    ur: [
      { q: `${ar} میں کتنی آیات ہیں؟`, a: `${ar} (${s.name}) میں ${s.verseCount} آیات ہیں اور یہ ${rev} سورت ہے۔` },
      { q: `کیا میں ${ar} ترجمے کے ساتھ پڑھ سکتا ہوں؟`, a: `جی ہاں۔ اس صفحے پر ${ar} کی ہر آیت عربی متن کے ساتھ اردو، انگریزی اور ہندی ترجمہ میں موجود ہے۔ ترجمہ بدلنے کے لیے آیات کے اوپر زبان کے بٹن استعمال کریں۔` },
      { q: `کیا ${ar} کی آڈیو تلاوت موجود ہے؟`, a: `جی ہاں۔ کسی بھی آیت پر پلے دبائیں — 🎙 مینیو سے 5 قاریوں (Alafasy, Abdul Basit, Husary, Muaiqly, Minshawi) میں سے انتخاب کریں — یا مسلسل سننے کے لیے Play surah استعمال کریں۔ اردو اور انگریزی ترجمے کی آڈیو بھی ڈراپ ڈاؤن سے دستیاب ہے۔` },
    ],
    hi: [
      { q: `सूरह ${s.name} में कितनी आयतें हैं?`, a: `${ar} (${s.name}) में ${s.verseCount} आयतें हैं और यह ${rev} सूरत है।` },
      { q: `क्या मैं सूरह ${s.name} अनुवाद के साथ पढ़ सकता हूँ?`, a: `हाँ। इस पृष्ठ पर सूरह ${s.name} की हर आयत अरबी के साथ उर्दू, अंग्रेज़ी और हिंदी अर्थ में है। अनुवाद बदलने के लिए आयतों के ऊपर भाषा के बटन उपयोग करें।` },
      { q: `क्या सूरह ${s.name} की ऑडियो तिलावत उपलब्ध है?`, a: `हाँ। किसी भी आयत पर प्ले दबाएं — 🎙 मेनू से 5 क़ारियों (Alafasy, Abdul Basit, Husary, Muaiqly, Minshawi) में से चुनें — या लगातार सुनने के लिए Play surah उपयोग करें। उर्दू और अंग्रेज़ी अनुवाद की ऑडियो भी ड्रॉपडाउन से उपलब्ध है।` },
    ],
    ar: [
      { q: `كم عدد آيات ${ar}؟`, a: `${ar} (${s.name}) فيها ${s.verseCount} آيات وهي سورة ${rev}.` },
      { q: `هل يمكنني قراءة ${ar} مع الترجمة؟`, a: `نعم. تعرض هذه الصفحة كل آية من ${ar} بالعربية مع المعنى بالأردية والإنجليزية والهندية. استخدم أزرار اللغة فوق الآيات لتبديل الترجمة.` },
      { q: `هل تتوفر تلاوة صوتية لـ${ar}؟`, a: `نعم. اضغط تشغيل على أي آية للتلاوة العربية — اختر من 5 قراء (Alafasy, Abdul Basit, Husary, Muaiqly, Minshawi) في قائمة 🎙 — أو استخدم "تشغيل السورة" للاستماع المتواصل. تتوفر تلاوة الترجمة الأردية والإنجليزية من القائمة المنسدلة.` },
    ],
  });
  // Tafsir question is localised; the answer stays the English editorial
  // summary (its source text is English) — labelled as a summary, not a
  // translation.
  if (tafsir) {
    const tq = pick(locale, {
      en: `What is Surah ${s.name} about?`,
      ur: `${ar} کس بارے میں ہے؟`,
      hi: `सूरह ${s.name} किस बारे में है?`,
      ar: `ما موضوع ${ar}؟`,
    });
    out.push({ q: tq, a: `${tafsir.intro} Key themes: ${tafsir.themes.join(', ')}.` });
  }
  return out;
}

/** Localised "About" heading + intro paragraph under the reader. */
export function surahAbout(s: SurahLike, locale: string): { h2: string; body: string } {
  const ar = stripArabicDiacritics(s.arabicName);
  const rev = revWord(s.revelation, locale);
  return pick(locale, {
    en: {
      h2: `About Surah ${s.name} (${s.englishName})`,
      body: `Surah ${s.name} is surah ${s.num} of 114 — ${s.verseCount} verses, ${rev}. Read it above in Arabic with Urdu, English and Hindi translation, transliteration and audio.`,
    },
    ur: {
      h2: `${ar} کے بارے میں`,
      body: `${ar} قرآن کی سورت نمبر ${s.num} ہے — ${s.verseCount} آیات، ${rev} سورت۔ اسے اوپر عربی متن کے ساتھ اردو، انگریزی اور ہندی ترجمہ، تلفظ اور آڈیو تلاوت کے ساتھ پڑھیں۔`,
    },
    hi: {
      h2: `${ar} के बारे में`,
      body: `${ar} क़ुरान की सूरत संख्या ${s.num} है — ${s.verseCount} आयतें, ${rev} सूरत। इसे ऊपर अरबी पाठ के साथ उर्दू, अंग्रेज़ी और हिंदी अर्थ, लिप्यंतरण और ऑडियो तिलावत सहित पढ़ें।`,
    },
    ar: {
      h2: `عن ${ar}`,
      body: `${ar} هي السورة رقم ${s.num} من القرآن — ${s.verseCount} آيات، سورة ${rev}. اقرأها أعلاه بالنص العربي مع الترجمة الأردية والإنجليزية والهندية والنطق والتلاوة الصوتية.`,
    },
  });
}

/* ---------------- Para (Juz) pages ---------------- */

export function paraTitle(p: ParaLike, locale: string): string {
  const ar = stripArabicDiacritics(p.arabicName);
  return pick(locale, {
    en: `Quran Para ${p.num} (${p.name}) with Urdu, English & Hindi Translation`,
    ur: `قرآن پارہ ${p.num} (${ar}) — اردو ترجمہ، تلاوت اور تفسیر`,
    hi: `क़ुरान पारा ${p.num} (${ar}) — हिंदी अनुवाद, तिलावत और तफ़सीर सहित`,
    ar: `الجزء ${p.num} من القرآن (${ar}) — مع الترجمة والتلاوة`,
  });
}

export function paraDescription(p: ParaLike, locale: string): string {
  const ar = stripArabicDiacritics(p.arabicName);
  return pick(locale, {
    en: `Read Quran Para ${p.num} (${p.name}, ${p.range}) in Arabic (Uthmani) with Urdu, English and Hindi meaning, transliteration and audio recitation. Full Juz ${p.num} of 30.`,
    ur: `قرآن پارہ ${p.num} (${ar}، ${p.range}) عربی متن کے ساتھ اردو، انگریزی اور ہندی ترجمہ، تلفظ اور آڈیو تلاوت کے ساتھ پڑھیں۔ 30 پاروں میں سے پارہ ${p.num}۔`,
    hi: `क़ुरान पारा ${p.num} (${ar}, ${p.range}) अरबी पाठ के साथ उर्दू, अंग्रेज़ी और हिंदी अर्थ, लिप्यंतरण और ऑडियो तिलावत सहित पढ़ें। 30 पारों में से पारा ${p.num}।`,
    ar: `اقرأ الجزء ${p.num} من القرآن (${ar}، ${p.range}) بالنص العربي مع الترجمة الأردية والإنجليزية والهندية والنطق والتلاوة الصوتية. الجزء ${p.num} من 30.`,
  });
}

export function paraKeywords(p: ParaLike, locale: string): string {
  const ar = stripArabicDiacritics(p.arabicName);
  const base = [
    `quran para ${p.num}`,
    `quran juz ${p.num}`,
    `para ${p.num} ${p.name.toLowerCase()}`,
    `juz ${p.num} ${p.name.toLowerCase()}`,
    `quran para ${p.num} with urdu translation`,
    `quran para ${p.num} english translation`,
    `quran para ${p.num} hindi meaning`,
    `quran para ${p.num} audio`,
    `quran para ${p.num} transliteration`,
    p.range.toLowerCase(),
  ].join(', ');
  const extra = pick(locale, {
    en: '',
    ur: `, پارہ ${p.num} اردو ترجمہ, ${ar} اردو ترجمہ`,
    hi: `, पारा ${p.num} हिंदी अनुवाद, ${ar} हिंदी अनुवाद`,
    ar: `, الجزء ${p.num} ترجمة, ${ar} ترجمة`,
  });
  return base + extra;
}

export function paraFaq(p: ParaLike, locale: string): { q: string; a: string }[] {
  const ar = stripArabicDiacritics(p.arabicName);
  return pick(locale, {
    en: [
      { q: `Which surahs are in Quran Para ${p.num}?`, a: `Para ${p.num} (${p.name}) covers ${p.range}.` },
      { q: `How can I read Quran Para ${p.num} with translation?`, a: `This page shows every verse of Para ${p.num} in Arabic with Urdu, English and Hindi meaning, transliteration and audio. Use the language buttons above the verses to switch translation.` },
      { q: `Can I listen to Quran Para ${p.num} audio?`, a: `Yes. Press play on any verse for Arabic recitation — choose from 5 reciters (Alafasy, Abdul Basit, Husary, Muaiqly, Minshawi) in the 🎙 menu — or use Play para to listen continuously. Urdu and English translation audio is available from the dropdown.` },
    ],
    ur: [
      { q: `قرآن پارہ ${p.num} میں کون سی سورتیں ہیں؟`, a: `پارہ ${p.num} (${ar}) میں ${p.range} شامل ہے۔` },
      { q: `قرآن پارہ ${p.num} ترجمے کے ساتھ کیسے پڑھیں؟`, a: `اس صفحے پر پارہ ${p.num} کی ہر آیت عربی متن کے ساتھ اردو، انگریزی اور ہندی ترجمہ، تلفظ اور آڈیو تلاوت کے ساتھ موجود ہے۔ ترجمہ بدلنے کے لیے آیات کے اوپر زبان کے بٹن استعمال کریں۔` },
      { q: `کیا قرآن پارہ ${p.num} کی آڈیو سن سکتا ہوں؟`, a: `جی ہاں۔ کسی بھی آیت پر پلے دبائیں — 🎙 مینیو سے 5 قاریوں (Alafasy, Abdul Basit, Husary, Muaiqly, Minshawi) میں سے انتخاب کریں — یا مسلسل سننے کے لیے Play para استعمال کریں۔ اردو اور انگریزی ترجمے کی آڈیو بھی ڈراپ ڈاؤن سے دستیاب ہے۔` },
    ],
    hi: [
      { q: `क़ुरान पारा ${p.num} में कौन सी सूरतें हैं?`, a: `पारा ${p.num} (${ar}) में ${p.range} शामिल है।` },
      { q: `क़ुरान पारा ${p.num} अनुवाद के साथ कैसे पढ़ें?`, a: `इस पृष्ठ पर पारा ${p.num} की हर आयत अरबी के साथ उर्दू, अंग्रेज़ी और हिंदी अर्थ, लिप्यंतरण और ऑडियो तिलावत सहित है। अनुवाद बदलने के लिए आयतों के ऊपर भाषा के बटन उपयोग करें।` },
      { q: `क्या क़ुरान पारा ${p.num} की ऑडियो सुन सकता हूँ?`, a: `हाँ। किसी भी आयत पर प्ले दबाएं — 🎙 मेनू से 5 क़ारियों (Alafasy, Abdul Basit, Husary, Muaiqly, Minshawi) में से चुनें — या लगातार सुनने के लिए Play para उपयोग करें। उर्दू और अंग्रेज़ी अनुवाद की ऑडियो भी ड्रॉपडाउन से उपलब्ध है।` },
    ],
    ar: [
      { q: `ما السور في الجزء ${p.num} من القرآن؟`, a: `الجزء ${p.num} (${ar}) يغطي ${p.range}.` },
      { q: `كيف أقرأ الجزء ${p.num} مع الترجمة؟`, a: `تعرض هذه الصفحة كل آية من الجزء ${p.num} بالعربية مع المعنى بالأردية والإنجليزية والهندية والنطق والتلاوة الصوتية. استخدم أزرار اللغة فوق الآيات لتبديل الترجمة.` },
      { q: `هل يمكنني الاستماع إلى تلاوة الجزء ${p.num}؟`, a: `نعم. اضغط تشغيل على أي آية للتلاوة العربية — اختر من 5 قراء (Alafasy, Abdul Basit, Husary, Muaiqly, Minshawi) في قائمة 🎙 — أو استخدم "تشغيل الجزء" للاستماع المتواصل. تتوفر تلاوة الترجمة الأردية والإنجليزية من القائمة المنسدلة.` },
    ],
  });
}

/* ---------------- Ayah pages ---------------- */

/** Universally-known names for the most-searched verses. Only these four:
 *  inventing a "famous name" for any other verse would be misleading. */
export const FAMOUS_AYAHS: Record<string, Record<UILocale, string>> = {
  '2:255': { en: 'Ayatul Kursi', ur: 'آیت الکرسی', hi: 'आयतुल कुर्सी', ar: 'آية الكرسي' },
  '112:1': { en: 'Surah Al-Ikhlas', ur: 'سورۃ الاخلاص', hi: 'सूरह अल-इख़लास', ar: 'سورة الإخلاص' },
  '113:1': { en: 'Surah Al-Falaq', ur: 'سورۃ الفلق', hi: 'सूरह अल-फ़लक़', ar: 'سورة الفلق' },
  '114:1': { en: 'Surah An-Nas', ur: 'سورۃ الناس', hi: 'सूरह अन-नास', ar: 'سورة الناس' },
};

export function ayahTitle(ref: string, s: SurahLike, verseNum: number, locale: string): string {
  const famous = FAMOUS_AYAHS[ref];
  if (famous) {
    const name = pick(locale, famous);
    return pick(locale, {
      en: `${name} — Quran ${ref} with Translation & Audio`,
      ur: `${name} — قرآن ${ref} ترجمہ و آڈیو کے ساتھ`,
      hi: `${name} — क़ुरान ${ref} अनुवाद व ऑडियो सहित`,
      ar: `${name} — القرآن ${ref} مع الترجمة والتلاوة`,
    });
  }
  const ar = stripArabicDiacritics(s.arabicName);
  return pick(locale, {
    en: `Quran ${ref} — Surah ${s.name} with Translation & Audio`,
    ur: `قرآن ${ref} — ${ar} ترجمہ و آڈیو کے ساتھ`,
    hi: `क़ुरान ${ref} — ${ar} अनुवाद व ऑडियो सहित`,
    ar: `القرآن ${ref} — ${ar} مع الترجمة والتلاوة`,
  });
}

/** Short H1 form (no "with Translation & Audio" tail). */
export function ayahHeading(ref: string, s: SurahLike, locale: string): string {
  const famous = FAMOUS_AYAHS[ref];
  if (famous) return pick(locale, famous);
  const ar = stripArabicDiacritics(s.arabicName);
  return pick(locale, {
    en: `Quran ${ref} — Surah ${s.name} (${s.englishName})`,
    ur: `قرآن ${ref} — ${ar} (${s.name})`,
    hi: `क़ुरान ${ref} — ${ar} (${s.name})`,
    ar: `القرآن ${ref} — ${ar} (${s.name})`,
  });
}

export function ayahDescription(ref: string, s: SurahLike, verseNum: number, locale: string): string {
  const ar = stripArabicDiacritics(s.arabicName);
  const rev = revWord(s.revelation, locale);
  const desc = pick(locale, {
    en: `Read Quran ${ref} — Surah ${s.name} (${s.englishName}), ayah ${verseNum} of ${s.verseCount} (${rev}) — in Arabic with Urdu, English and Hindi translation, transliteration and audio recitation.`,
    ur: `قرآن ${ref} — ${ar} (${s.name})، آیت ${verseNum} از ${s.verseCount} (${rev}) — عربی متن کے ساتھ اردو، انگریزی اور ہندی ترجمہ، تلفظ اور آڈیو تلاوت۔`,
    hi: `क़ुरान ${ref} — ${ar} (${s.name}), आयत ${verseNum} / ${s.verseCount} (${rev}) — अरबी के साथ उर्दू, अंग्रेज़ी और हिंदी अनुवाद, लिप्यंतरण और ऑडियो तिलावत।`,
    ar: `اقرأ القرآن ${ref} — ${ar} (${s.name})، الآية ${verseNum} من ${s.verseCount} (${rev}) — بالنص العربي مع الترجمة الأردية والإنجليزية والهندية والنطق والتلاوة الصوتية.`,
  });
  return desc.length > 160 ? desc.slice(0, 157) + '…' : desc;
}

export function ayahKeywords(ref: string, s: SurahLike, verseNum: number, locale: string): string {
  const famous = FAMOUS_AYAHS[ref];
  const base =
    `quran ${ref}, ${ref}, surah ${s.name.toLowerCase()} ayah ${verseNum}, ` +
    `${s.name.toLowerCase()} ${verseNum}, quran verse ${s.num} ${verseNum}, ayah ${verseNum}`;
  const famousKw = famous ? `, ${famous.en.toLowerCase()}${locale !== 'en' ? `, ${pick(locale, famous)}` : ''}` : '';
  const scriptKw = pick(locale, {
    en: '',
    ur: `, قرآن ${ref}`,
    hi: `, क़ुरान ${ref}`,
    ar: `, القرآن ${ref}`,
  });
  return base + famousKw + scriptKw;
}
