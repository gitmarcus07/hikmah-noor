// Shared dynamic ayah renderer for Pages Functions.
// Same URLs as static ayah pages, but served on-demand from D1 (verses_fts).
// Keeps all content with ~0 static files instead of 24,944 prerendered pages.
import { SURAHS, surahBySlugOrNum, prevAyah, nextAyah } from './surahs.js';

const BY_NUM = new Map(SURAHS.map((s) => [s.num, s]));
const VALID_LOCALES = new Set(['en', 'hi', 'ur', 'ar']);

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function localizedPath(locale, p) {
  const path = p.startsWith('/') ? p : '/' + p;
  if (locale === 'en') return path === '/' ? '/' : path;
  return '/' + locale + (path === '/' ? '/' : path);
}

// --- Localised ayah SEO (plain-JS mirror of src/lib/surah-seo.ts, which
// the Pages Functions runtime cannot import). Keep the two in sync. ---
function stripAr(s) {
  return String(s ?? '').replace(/[ً-ٰٟـۖ-ۭ]/g, '').replace(/ٱ/g, 'ا');
}
const FAMOUS = {
  '2:255': { en: 'Ayatul Kursi', ur: 'آیت الکرسی', hi: 'आयतुल कुर्सी', ar: 'آية الكرسي' },
  '112:1': { en: 'Surah Al-Ikhlas', ur: 'سورۃ الاخلاص', hi: 'सूरह अल-इख़लास', ar: 'سورة الإخلاص' },
  '113:1': { en: 'Surah Al-Falaq', ur: 'سورۃ الفلق', hi: 'सूरह अल-फ़लक़', ar: 'سورة الفلق' },
  '114:1': { en: 'Surah An-Nas', ur: 'سورۃ الناس', hi: 'सूरह अन-नास', ar: 'سورة الناس' },
};
const REV = {
  makki: { en: 'Makki', ur: 'مکی', hi: 'मक्की', ar: 'مكية' },
  madani: { en: 'Madani', ur: 'مدنی', hi: 'मदनी', ar: 'مدنية' },
};
function ayahTitle(ref, surah, locale) {
  const f = FAMOUS[ref];
  if (f) {
    const name = f[locale] ?? f.en;
    return { en: name + ' — Quran ' + ref + ' with Translation & Audio', ur: name + ' — قرآن ' + ref + ' ترجمہ و آڈیو کے ساتھ', hi: name + ' — क़ुरान ' + ref + ' अनुवाद व ऑडियो सहित', ar: name + ' — القرآن ' + ref + ' مع الترجمة والتلاوة' }[locale] ?? (name + ' — Quran ' + ref + ' with Translation & Audio');
  }
  const ar = stripAr(surah.arabicName);
  return { en: 'Quran ' + ref + ' — Surah ' + surah.name + ' with Translation & Audio', ur: 'قرآن ' + ref + ' — ' + ar + ' ترجمہ و آڈیو کے ساتھ', hi: 'क़ुरान ' + ref + ' — ' + ar + ' अनुवाद व ऑडियो सहित', ar: 'القرآن ' + ref + ' — ' + ar + ' مع الترجمة والتلاوة' }[locale] ?? ('Quran ' + ref + ' — Surah ' + surah.name + ' with Translation & Audio');
}
function ayahHeading(ref, surah, locale) {
  const f = FAMOUS[ref];
  if (f) return f[locale] ?? f.en;
  const ar = stripAr(surah.arabicName);
  return { en: 'Quran ' + ref + ' — Surah ' + surah.name + ' (' + surah.englishName + ')', ur: 'قرآن ' + ref + ' — ' + ar + ' (' + surah.name + ')', hi: 'क़ुरान ' + ref + ' — ' + ar + ' (' + surah.name + ')', ar: 'القرآن ' + ref + ' — ' + ar + ' (' + surah.name + ')' }[locale] ?? ('Quran ' + ref + ' — Surah ' + surah.name + ' (' + surah.englishName + ')');
}
function ayahDescription(ref, surah, v, locale) {
  const ar = stripAr(surah.arabicName);
  const makki = String(surah.revelation).toLowerCase().startsWith('mecca');
  const rev = (makki ? REV.makki : REV.madani)[locale] ?? (makki ? 'Makki' : 'Madani');
  const d = { en: 'Read Quran ' + ref + ' — Surah ' + surah.name + ' (' + surah.englishName + '), ayah ' + v + ' of ' + surah.verseCount + ' (' + rev + ') — in Arabic with Urdu, English and Hindi translation, transliteration and audio recitation.', ur: 'قرآن ' + ref + ' — ' + ar + ' (' + surah.name + ')، آیت ' + v + ' از ' + surah.verseCount + ' (' + rev + ') — عربی متن کے ساتھ اردو، انگریزی اور ہندی ترجمہ، تلفظ اور آڈیو تلاوت۔', hi: 'क़ुरान ' + ref + ' — ' + ar + ' (' + surah.name + '), आयत ' + v + ' / ' + surah.verseCount + ' (' + rev + ') — अरबी के साथ उर्दू, अंग्रेज़ी और हिंदी अनुवाद, लिप्यंतरण और ऑडियो तिलावत।', ar: 'اقرأ القرآن ' + ref + ' — ' + ar + ' (' + surah.name + ')، الآية ' + v + ' من ' + surah.verseCount + ' (' + rev + ') — بالنص العربي مع الترجمة الأردية والإنجليزية والهندية والنطق والتلاوة الصوتية.' }[locale] ?? ('Read Quran ' + ref + ' — Surah ' + surah.name + ' (' + surah.englishName + '), ayah ' + v + ' of ' + surah.verseCount + ' (' + rev + ') — in Arabic with Urdu, English and Hindi translation, transliteration and audio recitation.');
  return d.length > 160 ? d.slice(0, 157) + '…' : d;
}

function surahSlug(num) {
  return BY_NUM.get(num)?.slug ?? String(num);
}
function surahName(num) {
  return BY_NUM.get(num)?.name ?? String(num);
}

export async function renderAyahPage({ locale, surahParam, ayahParam, env }) {
  if (!VALID_LOCALES.has(locale)) return null;
  const surah = surahBySlugOrNum(surahParam);
  if (!surah) return null;
  // Tolerate `S:V` refs in the ayah slot (e.g. /59-al-hashr/59:10/ from
  // external links): take the verse part, then range-check as usual.
  const v = parseInt(String(ayahParam).split(':').pop(), 10);
  if (!Number.isInteger(v) || v < 1 || v > surah.verseCount) return null;

  // Verse text lives in D1 (migration 0005). No 6.9MB JSON bundled in Worker.
  if (!env?.DB) return null;
  let row = null;
  try {
    row = await env.DB.prepare(
      'SELECT surah, verse, sname, ar, ur, en, hi FROM verses WHERE surah = ? AND verse = ?'
    ).bind(surah.num, v).first();
  } catch {
    return null;
  }
  if (!row) return null;

  const ref = surah.num + ':' + v;
  const makki = String(surah.revelation).toLowerCase().startsWith('mecca');
  const ar = row.ar || '';
  // Same selection as AyahDetail.astro: hi->hi, ur/ar->ur, else en.
  const trans = locale === 'hi' ? row.hi || row.en || '' : locale === 'ur' || locale === 'ar' ? row.ur || row.en || '' : row.en || '';
  const dir = locale === 'ur' || locale === 'ar' ? 'rtl' : 'ltr';
  const L = (p) => localizedPath(locale, p);
  const ayahPath = '/quran/' + surah.slug + '/' + v + '/';
  const canonical = 'https://hikmahnoor.in' + L(ayahPath);
  // Match BaseLayout hreflang (en/hi/ur/ar + x-default) so Google doesn't
  // flag dynamic ayahs as "Duplicate, different canonical than user".
  const hreflangs = ['en', 'hi', 'ur', 'ar']
    .map((l) => '<link rel="alternate" hreflang="' + l + '" href="' + esc('https://hikmahnoor.in' + localizedPath(l, ayahPath)) + '">')
    .join('')
    + '<link rel="alternate" hreflang="x-default" href="' + esc('https://hikmahnoor.in' + localizedPath('en', ayahPath)) + '">';

  const description = ayahDescription(ref, surah, v, locale);
  const title = ayahTitle(ref, surah, locale);

  const prev = prevAyah(surah.num, v);
  const next = nextAyah(surah.num, v);
  const prevSlug = prev ? surahSlug(prev.surahNum) : null;
  const nextSlug = next ? surahSlug(next.surahNum) : null;
  const prevLabel = prev ? surahName(prev.surahNum) + ' ' + prev.surahNum + ':' + prev.ayahNum : '';
  const nextLabel = next ? surahName(next.surahNum) + ' ' + next.surahNum + ':' + next.ayahNum : '';

  const surahUrl = L('/surahs/' + surah.slug + '/');
  const surahAnchorUrl = surahUrl + '#v' + v;

  const html = '<!doctype html><html lang="' + locale + '" dir="' + dir + '"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>' + esc(title) + '</title>'
    + '<meta name="description" content="' + esc(description) + '">'
    + '<link rel="canonical" href="' + esc(canonical) + '">'
    + hreflangs
    + '<meta property="og:title" content="' + esc(title) + '">'
    + '<meta property="og:description" content="' + esc(description) + '">'
    + '<meta property="og:type" content="article">'
    + '<meta property="og:url" content="' + esc(canonical) + '">'
    + '<link rel="icon" href="/favicon.svg">'
    + '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;background:#FAF8F2;color:#1a2b26;margin:0;line-height:1.7}header{background:#07352A;color:#fff;padding:14px 18px}header a{color:#F7E08B;text-decoration:none;font-weight:800}main{max-width:760px;margin:0 auto;padding:20px 16px 48px}.card{background:#fff;border:1px solid #e7e0cf;border-radius:16px;padding:20px;margin:14px 0}.ar{font-size:24px;line-height:2.1;text-align:right}.badge{display:inline-block;background:#07352A;color:#fff;border-radius:999px;padding:3px 12px;font-size:12px;font-weight:800;margin:2px 4px 2px 0}.badge.gold{background:#D4AF37;color:#07352A}.btn{display:inline-block;background:#07352A;color:#fff;border-radius:12px;padding:12px 18px;min-height:44px;text-decoration:none;font-weight:800}.muted{color:#5c6f6a;font-size:13px}.nav{display:grid;gap:12px;margin-top:16px}@media(min-width:640px){.nav{grid-template-columns:1fr 1fr}}.nav a{background:#fff;border:1px solid #e7e0cf;border-radius:14px;padding:14px;text-decoration:none;color:#1a2b26;font-weight:700}footer{border-top:1px solid #e7e0cf;padding:18px;text-align:center;color:#5c6f6a;font-size:13px}</style>'
    + '<script type="application/ld+json">' + JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      inLanguage: locale,
      author: { '@type': 'Organization', name: 'Hikmah Noor' },
      publisher: { '@type': 'Organization', name: 'Hikmah Noor' },
    }) + '</script></head><body>'
    + '<header><a href="' + esc(L('/')) + '">Hikmah Noor</a> <span style="opacity:.6">›</span> <a href="' + esc(L('/quran/')) + '">Quran</a> <span style="opacity:.6">›</span> <a href="' + esc(surahUrl) + '">Surah ' + esc(surah.name) + '</a></header>'
    + '<main><div><span class="badge">' + esc(ref) + '</span><span class="badge">' + (makki ? 'Makki' : 'Madani') + '</span>'
    + '<span class="badge gold">Ayah ' + v + ' of ' + surah.verseCount + '</span></div>'
    + '<h1 style="font-size:22px;line-height:1.35">' + esc(ayahHeading(ref, surah, locale)) + '</h1>'
    + '<p class="muted">Surah ' + esc(surah.name) + ' (' + esc(surah.englishName) + '), ' + esc(ref) + ' — ayah ' + v + ' of ' + surah.verseCount + '</p>'
    + '<div class="card"><p class="ar" lang="ar" dir="rtl">' + esc(ar) + ' <span style="color:#D4AF37">﴿' + v + '﴾</span></p>'
    + '<hr style="border:none;border-top:1px solid #eee;margin:16px 0">'
    + '<p style="font-size:16px">' + esc(trans) + '</p></div>'
    + '<div class="card"><a class="btn" href="' + esc(surahAnchorUrl) + '">▶ Listen & read in Surah ' + esc(surah.name) + '</a>'
    + '<p class="muted" style="margin-top:10px">Audio, transliteration, tafsir summary and full-surah reading with Urdu / English / Hindi switch are on the surah page.</p></div>'
    + '<div class="nav">'
    + (prev ? '<a href="' + esc(L('/quran/' + prevSlug + '/' + prev.ayahNum + '/')) + '">← Previous<br>' + esc(prevLabel) + '</a>' : '<span></span>')
    + (next ? '<a style="text-align:right" href="' + esc(L('/quran/' + nextSlug + '/' + next.ayahNum + '/')) + '">Next →<br>' + esc(nextLabel) + '</a>' : '')
    + '</div>'
    + '<div class="card"><a class="btn" style="background:#fff;color:#07352A;border:1px solid #07352A" href="' + esc(surahUrl) + '">Back to Surah ' + esc(surah.name) + ' — all ' + surah.verseCount + ' verses</a></div>'
    + '</main><footer>Educational content — not a fatwa. See <a href="' + esc(L('/methodology/')) + '">methodology</a>.</footer></body></html>';

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
