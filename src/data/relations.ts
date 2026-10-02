/* Hikmah Noor — Relationship data layer.
 * Explicit + derived cross-content edges for the knowledge graph.
 *
 * RULES (religious-content safety):
 * - Every edge must be grounded in EXISTING repository metadata:
 *   explicit repo-authored maps, Quran citations in source/reference
 *   fields, prophet names in dedicated fields, or quiz `why` texts that
 *   name the target page. Nothing is invented from thin air.
 * - Quran citations resolve to existing SURAH pages only (no Ayah pages).
 * - Same-type navigation stays in page components; this file declares
 *   CROSS-TYPE edges only.
 * - Language-independent: edges use entity IDs; URLs localize at render.
 */

import {
  ENTITY_RELATIONSHIPS,
  kindForType,
  printValidationReport,
  registerEntity,
  validateRelationships,
  type ContentType,
  type EntityRelationships,
  type Relationship,
  type RelationshipDecl,
  type ValidationIssue,
} from './relationships';
import { DUAS, DUA_CATS } from './duas';
import { GUIDES, GUIDE_CATS } from './guides';
import { WAQIAT } from './waqiat';
import { PROPHETS } from './prophets';
import { SEERAH } from './seerah';
import { SAHABA } from './sahaba';
import { HADEES } from './hadees';
import { NAWAWI } from './hadees-nawawi';
import { SAHIH } from './hadees-sahih';
import { MEANINGS } from './meanings';
import { HISTORY } from './history';
import { KALIMAS } from './kalimas';
import { WOMEN } from './women';
import { QUIZZES, QUIZ_CATS } from './quizzes';
import { TOOLS, CATS as TOOL_CATS } from '../lib/finance/tools.js';
import surahsMeta from './surahs-meta.json';
import { ALLAH, PROPHET } from './names';
import { MONTHS } from './months';

/* ------------------------------------------------------------------ */
/* 1. Entity registration (single central place; no per-module edits)  */
/* ------------------------------------------------------------------ */

for (const d of DUAS) registerEntity('dua', d.slug, d.cat);
for (const c of DUA_CATS) registerEntity('dua', c.slug);
for (const g of GUIDES) registerEntity('guide', g.slug, g.cat);
for (const c of GUIDE_CATS) registerEntity('guide', c.slug);
for (const w of WAQIAT) registerEntity('waqiah', w.slug);
for (const p of PROPHETS) registerEntity('prophet', p.slug);
for (const s of SEERAH) registerEntity('seerah', s.slug);
for (const s of SAHABA) registerEntity('sahaba', s.slug);
for (const h of HADEES) registerEntity('hadees', h.slug);
for (const h of NAWAWI) registerEntity('hadees', h.slug);
for (const h of SAHIH) registerEntity('hadees', h.slug);
for (const m of MEANINGS) registerEntity('meaning', m.slug);
for (const h of HISTORY) registerEntity('history', h.slug);
for (const k of KALIMAS) registerEntity('kalima', k.slug);
for (const w of WOMEN) registerEntity('women', w.slug);
for (const q of QUIZZES) registerEntity('quiz', q.slug);
for (const c of QUIZ_CATS) registerEntity('quiz', c.slug);
for (const t of TOOLS as any[]) registerEntity('tool', t.slug, t.cat);
for (const c of TOOL_CATS as any[]) registerEntity('tool', c.slug);
for (const s of surahsMeta as any[]) registerEntity('surah', s.slug);
for (const e of ALLAH) registerEntity('allah-name', e.slug);
for (const e of PROPHET) registerEntity('prophet-name', e.slug);
for (const m of MONTHS) registerEntity('month', m.slug);
/* Ayah entities: synthesized from canonical verse counts (no verse-file IO). */
for (const s of surahsMeta as any[]) {
  for (let v = 1; v <= s.verseCount; v++) registerEntity('ayah', `${s.num}:${v}`);
}

/* ------------------------------------------------------------------ */
/* 2. Target lookup (enrichment from source of truth)                  */
/* ------------------------------------------------------------------ */

export interface TargetInfo { category?: string; title: string }

const DUA_BY_SLUG = new Map(DUAS.map((d) => [d.slug, d]));
const GUIDE_BY_SLUG = new Map(GUIDES.map((g) => [g.slug, g]));
const WAQIAH_BY_SLUG = new Map(WAQIAT.map((w) => [w.slug, w]));
const PROPHET_BY_SLUG = new Map(PROPHETS.map((p) => [p.slug, p]));
const SEERAH_BY_SLUG = new Map(SEERAH.map((s) => [s.slug, s]));
const SAHABA_BY_SLUG = new Map(SAHABA.map((s) => [s.slug, s]));
const HADEES_BY_SLUG = new Map<string, any>();
for (const h of HADEES) HADEES_BY_SLUG.set(h.slug, { ...h, coll: 'kids' });
for (const h of NAWAWI) HADEES_BY_SLUG.set(h.slug, { ...h, coll: 'nawawi' });
for (const h of SAHIH) HADEES_BY_SLUG.set(h.slug, { ...h, coll: 'sahih' });
const MEANING_BY_SLUG = new Map(MEANINGS.map((m) => [m.slug, m]));
const HISTORY_BY_SLUG = new Map(HISTORY.map((h) => [h.slug, h]));
const KALIMA_BY_SLUG = new Map(KALIMAS.map((k) => [k.slug, k]));
const WOMAN_BY_SLUG = new Map(WOMEN.map((w) => [w.slug, w]));
const QUIZ_BY_SLUG = new Map(QUIZZES.map((q) => [q.slug, q]));
const TOOL_BY_SLUG = new Map((TOOLS as any[]).map((t) => [t.slug, t]));
const ALLAH_BY_SLUG = new Map(ALLAH.map((e) => [e.slug, e]));
const PROPHET_NAME_BY_SLUG = new Map(PROPHET.map((e) => [e.slug, e]));
const MONTH_BY_SLUG = new Map(MONTHS.map((m) => [m.slug, m]));
const SURAH_BY_SLUG = new Map((surahsMeta as any[]).map((s) => [s.slug, s]));
const SURAH_BY_NUM = new Map((surahsMeta as any[]).map((s) => [s.num, s]));

/** Resolve (type, slug) -> { category, title } or null when unknown. */
export function lookupTarget(type: ContentType, slug: string): TargetInfo | null {
  switch (type) {
    case 'dua': {
      const d = DUA_BY_SLUG.get(slug);
      return d ? { category: d.cat, title: d.title } : null;
    }
    case 'guide': {
      const g = GUIDE_BY_SLUG.get(slug);
      return g ? { category: g.cat, title: g.title } : null;
    }
    case 'waqiah': {
      const w = WAQIAH_BY_SLUG.get(slug);
      return w ? { title: w.title } : null;
    }
    case 'prophet': {
      const p = PROPHET_BY_SLUG.get(slug);
      return p ? { title: p.title } : null;
    }
    case 'seerah': {
      const s = SEERAH_BY_SLUG.get(slug);
      return s ? { title: s.title } : null;
    }
    case 'sahaba': {
      const s = SAHABA_BY_SLUG.get(slug);
      return s ? { title: s.title } : null;
    }
    case 'hadees': {
      const h = HADEES_BY_SLUG.get(slug);
      return h ? { title: h.title } : null;
    }
    case 'meaning': {
      const m = MEANING_BY_SLUG.get(slug);
      return m ? { title: `${m.term} — Meaning` } : null;
    }
    case 'history': {
      const h = HISTORY_BY_SLUG.get(slug);
      return h ? { title: h.title } : null;
    }
    case 'kalima': {
      const k = KALIMA_BY_SLUG.get(slug);
      return k ? { title: k.title } : null;
    }
    case 'surah': {
      const s = SURAH_BY_SLUG.get(slug);
      return s ? { title: `Surah ${s.name}` } : null;
    }
    case 'tool': {
      const t = TOOL_BY_SLUG.get(slug);
      return t ? { category: t.cat, title: String(t.title).split('—')[0].trim() } : null;
    }
    case 'quiz': {
      const q = QUIZ_BY_SLUG.get(slug);
      return q ? { title: q.title } : null;
    }
    case 'women': {
      const w = WOMAN_BY_SLUG.get(slug);
      return w ? { title: w.title } : null;
    }
    case 'allah-name': {
      const e = ALLAH_BY_SLUG.get(slug);
      return e ? { title: e.translit } : null;
    }
    case 'prophet-name': {
      const e = PROPHET_NAME_BY_SLUG.get(slug);
      return e ? { title: e.translit } : null;
    }
    case 'month': {
      const m = MONTH_BY_SLUG.get(slug);
      return m ? { title: m.name } : null;
    }
    case 'ayah': {
      const m = /^(\d+):(\d+)$/.exec(slug);
      if (!m) return null;
      const s = SURAH_BY_NUM.get(parseInt(m[1], 10));
      const v = parseInt(m[2], 10);
      if (!s || v < 1 || v > s.verseCount) return null;
      return { category: s.slug, title: `${s.name} ${s.num}:${v}` };
    }
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* 3. Derived edges — Quran citations -> existing Surah pages          */
/*                                                                     */
/* Only numeric citations of the form `Quran N...` (plus explicit     */
/* `(Surah Name)` markers) are parsed, all from existing verified     */
/* source/reference fields. Max 3 surahs per entity, citation order.   */
/* ------------------------------------------------------------------ */

const SURAH_NAME_TO_NUM = new Map<string, number>();
for (const s of surahsMeta as any[]) {
  const add = (k: string) => { if (!SURAH_NAME_TO_NUM.has(k)) SURAH_NAME_TO_NUM.set(k, s.num); };
  add(String(s.name).toLowerCase());
  add(String(s.englishName).toLowerCase());
  add(String(s.name).toLowerCase().replace(/^(al|an|ar|as|ash|at|ad|az|adh)-/, ''));
}

/** Parse `Quran 12`, `Quran 2:30-39, 7:11-25`, `Quran 20, 26 and 28`, `(Surah Yusuf)`. */
export function surahNumsFromText(text: string): number[] {
  const nums: number[] = [];
  const push = (n: number) => { if (n >= 1 && n <= 114 && !nums.includes(n)) nums.push(n); };
  const firstRe = /Qur['’]?an\s+(\d+)/gi;
  let m: RegExpExecArray | null;
  while ((m = firstRe.exec(text))) push(parseInt(m[1], 10));
  const extraRe = /(?:[,;]\s*|\band\s+)(\d+)\s*:/gi;
  if (/Qur['’]?an/i.test(text)) {
    while ((m = extraRe.exec(text))) push(parseInt(m[1], 10));
    // Continuation lists without verse refs: `Quran 20, 26 and 28`
    const listRe = /Qur['’]?an\s+(\d+(?:\s*(?:,|and|&)\s*\d+)+)/gi;
    while ((m = listRe.exec(text))) {
      for (const part of m[1].split(/\s*(?:,|and|&)\s*/)) push(parseInt(part, 10));
    }
  }
  const nameRe = /\(\s*[Ss]urah\s+([^)]+)\)/g;
  while ((m = nameRe.exec(text))) {
    const n = SURAH_NAME_TO_NUM.get(m[1].trim().toLowerCase());
    if (n) push(n);
  }
  return nums.slice(0, 3);
}

function surahDeclsFromTexts(...texts: string[]): RelationshipDecl[] {
  const seen = new Set<number>();
  const out: RelationshipDecl[] = [];
  for (const t of texts) {
    if (!t) continue;
    for (const n of surahNumsFromText(t)) {
      if (seen.has(n)) continue;
      seen.add(n);
      const meta = SURAH_BY_NUM.get(n);
      if (!meta) continue;
      out.push({ type: 'surah', slug: meta.slug, reason: `Cited: Quran ${n}` });
    }
  }
  return out;
}

/** Extract SINGLE-verse citations (`N:M` not followed by a range dash).
 *  Ranges (e.g. `7:11–25`) stay surah-level; only exact ayahs become edges. */
export function ayahRefsFromText(text: string): string[] {
  const out: string[] = [];
  const re = /(\d+)\s*:\s*(\d+)(?!\d)(?!\s*[–—-])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const id = `${parseInt(m[1], 10)}:${parseInt(m[2], 10)}`;
    if (!out.includes(id)) out.push(id);
    if (out.length >= 4) break;
  }
  return out;
}

function ayahDeclsFromTexts(...texts: string[]): RelationshipDecl[] {
  const seen = new Set<string>();
  const out: RelationshipDecl[] = [];
  for (const t of texts) {
    if (!t) continue;
    for (const id of ayahRefsFromText(t)) {
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ type: 'ayah', slug: id, reason: `Cited: ${id}` });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 4. Derived edges — prophet names -> prophet + waqiah pages          */
/* ------------------------------------------------------------------ */

const normName = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const PROPHET_INDEX = new Map<string, string>();
for (const p of PROPHETS) PROPHET_INDEX.set(normName(p.name), p.slug);

/** Map a waqiah `prophet` field to a prophet slug (null when not an exact prophet). */
export function prophetSlugForField(field: string): string | null {
  const stripped = field.replace(/\(.*?\)/g, '').trim();
  return PROPHET_INDEX.get(normName(stripped)) ?? null;
}

/* ------------------------------------------------------------------ */
/* 5. Explicit edges                                                   */
/* ------------------------------------------------------------------ */

/** 5a. Guide -> dua map (migrated from GuideDetail's verified RELATED_DUAS). */
const GUIDE_DUAS: Record<string, string[]> = {
  'how-to-pray-namaz': ['sana-opening', 'dua-qunoot', 'after-salam'],
  'wudu-ablution': ['before-wudu', 'after-wudu'],
  'ghusl-bath': ['before-wudu', 'after-wudu'],
  'tayammum-dry-ablution': ['before-wudu'],
  'adhan-iqamah': ['after-salam'],
  'janaza-prayer': ['for-the-deceased', 'burial-bismillah-millah'],
  'roza-fasting': ['breaking-fast', 'laylatul-qadr', 'sehri-intention'],
  'moon-sighting-hilal': ['new-moon-sighting'],
  'itikaf-rules': ['afiyah-pardon-wellbeing', 'mercy-comprehensive-dua'],
  'laylatul-qadr': ['laylatul-qadr', 'afiyah-pardon-wellbeing', 'third-ashra-dua'],
  'last-ten-nights-plan': ['afiyah-pardon-wellbeing', 'third-ashra-dua', 'laylatul-qadr'],
  'what-breaks-fast': ['while-fasting-insulted', 'breaking-fast'],
  'fidyah-kaffarah-fasts': ['ibrahim-taqabbal-minna'],
  'quran-khatm-ramadan': ['khatm-quran-dua', 'taraweeh-ki-dua'],
  'zakat-al-fitr': ['ibrahim-taqabbal-minna'],
  'eid-day-sunnahs': ['new-clothes', 'eid-greeting-taqabbal', 'eid-takbir'],
  'eid-takbeer-wording': ['eid-takbir', 'eid-greeting-taqabbal'],
  'eid-khutbah-rulings': ['eid-greeting-taqabbal', 'gathering-expiation-dua'],
  'shawwal-six-fasts': ['shawwal-intention', 'ibrahim-taqabbal-minna'],
  'qurbani-rules': ['qurbani-slaughter-dua', 'qurbani-intention', 'eid-takbir'],
  'qurbani-shares-who': ['qurbani-intention', 'qurbani-slaughter-dua'],
  'qurbani-meat-distribution': ['eat-feed-qurbani-verse', 'qurbani-slaughter-dua'],
  'tashriq-days-takbeer': ['eid-takbir', 'rami-takbir'],
  'qurbani-mistakes': ['qurbani-intention', 'eat-feed-qurbani-verse'],
  'istikhara-method': ['istikhara'],
  'witr-method': ['witr-qunut-hasan', 'dua-qunoot'],
  'jumuah-complete': ['sayyidul-istighfar', 'morning-remembrance'],
  'dua-acceptance-guide': ['sayyidul-istighfar', 'laylatul-qadr', 'gathering-expiation-dua'],
  'surah-yaseen-spotlight': ['istighfar-azim', 'baqarah-last-verses-dua'],
  'surah-kahf-spotlight': ['evening-protection', 'afwa-afiyah'],
  'surah-mulk-spotlight': ['ajirni-minan-nar-7x'],
  'surah-waqiah-spotlight': ['ask-jannah-refuge-hell'],
  'dhuha-chasht-prayer': ['dhuha-glorification'],
  'salat-al-hajah': ['hajah-need-dua', 'mercy-comprehensive-dua'],
  'salat-al-tawbah': ['istighfar-azim', 'sayyidul-istighfar'],
  'ashura-muharram-fasting': ['hijri-new-year-dua'],
  'shaban-shab-e-barat': ['shaban-blessing-dua'],
  'rajab-virtues': ['shaban-blessing-dua', 'hijri-new-year-dua'],
  'zakat-essentials': [],
  'hajj-umrah-basics': ['talbiyah', 'arafah-dua', 'tawaf-corner'],
  'nikah-marriage': ['wedding-dua', 'righteous-family'],
  'aqeeqah-newborn': ['ruqyah-children', 'righteous-children-salihin'],
  'self-ruqyah-manzil-method': ['jibril-ruqyah', 'muawwidhat-thrice', 'baqarah-last-verses-dua'],
  'evil-eye-nazar-treatment': ['masha-allah-evil-eye', 'ruqyah-children', 'jibril-ruqyah'],
  'sihr-black-magic-jinn-response': ['jibril-ruqyah', 'muawwidhat-thrice', 'baqarah-last-two-sleep'],
  'fake-raqi-amulet-red-flags': ['amantu-billah-doubts', 'hasbunallah', 'jibril-ruqyah'],
  'qada-missed-prayers-how-to': ['after-salam', 'tasbih-after-fard', 'sayyidul-istighfar'],
  'haiz-nifas-purity-guide': ['before-wudu', 'after-wudu', 'laylatul-qadr'],
  'talaq-khula-iddah-rules': ['righteous-family', 'wedding-dua', 'at-calamity-ajurni'],
  'new-muslim-starter-guide': ['after-wudu', 'morning-remembrance', 'seeking-knowledge'],
  'muslim-death-checklist-wasiyyah': ['for-the-deceased', 'burial-bismillah-millah', 'condolence'],
  'riba-interest-modern-money': ['debt-freedom', 'rizq-blessing', 'urgent-help'],
  'after-salah-adhkar-routine': ['after-salam', 'tasbih-after-fard', 'la-mania-after-salah'],
  'dreams-in-islam-guide': ['bad-dream-protection', 'before-sleeping', 'waking-up'],
  'halal-food-guide': ['before-eating', 'after-eating', 'guest-for-host'],
  'sujood-as-sahw-guide': ['after-salam', 'tasbih-after-fard', 'refuge-four-after-tashahhud'],
  'prayer-mistakes-common': ['after-salam', 'before-wudu', 'khinzab-waswasah'],
  'waswasa-doubts-worship': ['khinzab-waswasah', 'amantu-billah-doubts', 'morning-remembrance'],
  'qasr-jama-travel-sick-prayer': ['starting-journey', 'returning-from-travel', 'for-sick'],
  'daily-sunnah-rawatib': ['after-salam', 'tasbih-after-fard', 'morning-remembrance'],
  'six-pillars-iman-explained': ['amantu-billah-doubts', 'steadfast-heart', 'sayyidul-istighfar'],
  'shirk-types-explained': ['refuge-hidden-shirk', 'amantu-billah-doubts', 'sayyidul-istighfar'],
  'signs-day-of-judgment': ['kahf-mercy-guidance', 'ajirni-minan-nar-7x', 'ask-jannah-refuge-hell'],
  'grave-barzakh-after-death': ['visiting-graves', 'for-the-deceased', 'husn-al-khatima'],
  'music-singing-ruling': ['gathering-expiation-dua', 'seeking-knowledge', 'morning-remembrance'],
  'gaming-movies-entertainment': ['controlling-anger', 'gathering-expiation-dua', 'seeking-knowledge'],
  'crypto-forex-trading-halal': ['rizq-blessing', 'debt-freedom', 'musa-in-need'],
  'dogs-pets-in-islam': ['morning-remembrance', 'evening-protection', 'seeking-knowledge'],
  'tattoos-piercing-ruling': ['adam-repentance', 'sayyidul-istighfar', 'after-wudu'],
  'hijab-ruling-evidence': ['new-clothes', 'seeing-mirror', 'morning-remembrance'],
  'marital-rights-conflict': ['wedding-dua', 'righteous-family', 'allif-hearts'],
  'parenting-tarbiyah-guide': ['righteous-children-salihin', 'prayerful-offspring', 'zakariya-righteous-offspring'],
  'pregnancy-nursing-fasting': ['righteous-children-salihin', 'breaking-fast', 'sehri-intention'],
  'how-to-understand-quran-tafsir': ['khatm-quran-dua', 'seeking-knowledge', 'steadfast-heart'],
  'how-to-memorize-quran-plan': ['khatm-quran-dua', 'seeking-knowledge', 'rabbi-yassir'],
  'how-to-study-hadith-guide': ['seeking-knowledge', 'infani-knowledge', 'steadfast-heart'],
  'esal-e-sawab-proofs': ['for-the-deceased', 'visiting-graves', 'khatm-quran-dua'],
  'chaliswan-teeja-barsi-ruling': ['condolence', 'for-the-deceased', 'at-calamity-ajurni'],
  'hajj-umrah-badal-deceased': ['talbiyah', 'arafah-dua', 'for-the-deceased'],
  'organ-blood-donation-islam': ['for-sick', 'asalullahal-azim-7x', 'pain-relief'],
  'ivf-contraception-abortion-islam': ['righteous-children-salihin', 'zakariya-righteous-offspring', 'righteous-family'],
  'alcohol-medicine-perfume-ruling': ['for-sick', 'before-eating', 'new-clothes'],
  'insurance-takaful-ruling': ['debt-freedom', 'rizq-blessing', 'musa-in-need'],
  'halal-investing-pension-guide': ['rizq-blessing', 'debt-freedom', 'urgent-help'],
  'gelatin-enzymes-additives-guide': ['before-eating', 'after-eating', 'guest-for-host'],
  'madhab-differences-explained': ['seeking-knowledge', 'steadfast-heart', 'infani-knowledge'],
  'baby-names-rules-list': ['righteous-children-salihin', 'ruqyah-children', 'wedding-dua'],
  'dawah-answering-atheism': ['seeking-knowledge', 'musa-clarity-speech', 'steadfast-heart'],
  'umrah-kids-elderly-nusuk': ['talbiyah', 'tawaf-corner', 'starting-journey'],
  'what-is-aqeedah-basics': ['amantu-billah-doubts', 'steadfast-heart', 'sayyidul-istighfar'],
  'tawhid-three-categories': ['refuge-hidden-shirk', 'sayyidul-istighfar', 'steadfast-heart'],
  'belief-angels-books': ['seeking-knowledge', 'steadfast-heart', 'morning-remembrance'],
  'belief-in-messengers': ['durood-ibraheemi', 'seeking-knowledge', 'steadfast-heart'],
  'belief-in-qadr-decree': ['hasbunallah', 'amantu-billah-doubts', 'afiyah-pardon-wellbeing'],
  'bidah-vs-sunnah': ['seeking-knowledge', 'steadfast-heart', 'morning-remembrance'],
  'tawakkul-trust-balance': ['hasbunallah', 'musa-in-need', 'rizq-blessing'],
  'names-attributes-course': ['seeking-knowledge', 'steadfast-heart', 'sayyidul-istighfar'],
};

/** 5b. Dua -> prophet/waqiah/women (verified by each dua's own title + Quran source). */
interface DuaLinks { prophets?: string[]; waqiat?: string[]; women?: string[] }
const DUA_LINKS: Record<string, DuaLinks> = {
  'yunus-distress': { prophets: ['yunus-people-of-nineveh'], waqiat: ['yunus-whale-darkness'] },
  'adam-repentance': { prophets: ['adam-first-man-clay'], waqiat: ['adam-khalifa-earth'] },
  'adam-repentance-rabbana': { prophets: ['adam-first-man-clay'], waqiat: ['adam-khalifa-earth'] },
  'musa-in-need': { prophets: ['musa-pharaoh-and-sea'], waqiat: ['musa-sea-parted'] },
  'musa-zalamtu-nafsi': { prophets: ['musa-pharaoh-and-sea'], waqiat: ['musa-sea-parted'] },
  'musa-najjini': { prophets: ['musa-pharaoh-and-sea'], waqiat: ['musa-sea-parted'] },
  'najjini-protection': { prophets: ['musa-pharaoh-and-sea'] },
  'rabbi-ghfir-li-waliakhi-rabbana': { prophets: ['musa-pharaoh-and-sea'] },
  'ibrahim-wisdom-righteous': { prophets: ['ibrahim-friend-of-allah'], waqiat: ['ibrahim-fire-cool'] },
  'ibrahim-taqabbal-minna': { prophets: ['ibrahim-friend-of-allah'], waqiat: ['ibrahim-fire-cool'] },
  'ibrahim-taqabbal-minna-rabbana': { prophets: ['ibrahim-friend-of-allah'], waqiat: ['ibrahim-fire-cool'] },
  'ibrahim-mumtahanah': { prophets: ['ibrahim-friend-of-allah'], waqiat: ['ibrahim-fire-cool'] },
  'ibrahim-safe-city': { prophets: ['ibrahim-friend-of-allah'] },
  'ibrahim-no-disgrace': { prophets: ['ibrahim-friend-of-allah'] },
  'ibrahim-for-parents-rabbana': { prophets: ['ibrahim-friend-of-allah'] },
  'ibrahim-hukman': { prophets: ['ibrahim-friend-of-allah'], waqiat: ['ibrahim-fire-cool'] },
  'muslimayni-laka': { prophets: ['ibrahim-friend-of-allah'] },
  'muslimayni-laka-rabbana': { prophets: ['ibrahim-friend-of-allah'] },
  'prayerful-offspring': { prophets: ['ibrahim-friend-of-allah'] },
  'yusuf-beautiful-ending': { prophets: ['yusuf-dream-to-throne'], waqiat: ['yusuf-well-to-throne'] },
  'shuayb-iftah': { prophets: ['shuayb-measure-justly'] },
  'shuayb-iftah-rabbana': { prophets: ['shuayb-measure-justly'] },
  'lut-save-family': { prophets: ['lut-overturned-city'], waqiat: ['lut-rain-stones'] },
  'nuh-refuge-ignorant-ask': { prophets: ['nuh-nine-centuries-ark'], waqiat: ['nuh-ark-flood'] },
  'nuh-landing': { prophets: ['nuh-nine-centuries-ark'], waqiat: ['nuh-ark-flood'] },
  'sulayman-gratitude': { prophets: ['sulayman-wind-and-wisdom'], waqiat: ['sulayman-kingdom-gratitude'] },
  'isa-maidah': { prophets: ['isa-messiah-and-miracles'], waqiat: ['isa-miracles-table'] },
  'isa-maidah-rabbana': { prophets: ['isa-messiah-and-miracles'], waqiat: ['isa-miracles-table'] },
  'rabbi-la-tadharni-rabbana': { prophets: ['zakariya-son-in-old-age'], waqiat: ['zakariya-yahya-prayer'] },
  'asiyah-house-jannah': { women: ['asiya-queen-of-faith'] },
};

/** 5c. Seerah -> companions / history / waqiat (verified by chapter narratives). */
const SEERAH_LINKS: Record<string, RelationshipDecl[]> = {
  'secret-open-dawah-safa-early-muslims': [
    { type: 'sahaba', slug: 'abu-bakr-siddiq', reason: 'Early believer through Abu Bakr' },
    { type: 'sahaba', slug: 'bilal-muezzin', reason: 'Tortured for belief in this period' },
    { type: 'women', slug: 'sumayyah-first-martyr', reason: 'First martyr of this period' },
  ],
  'persecution-abyssinia-boycott-year-of-sorrow': [
    { type: 'sahaba', slug: 'hamza-lion', reason: 'Conversion broke the fear' },
    { type: 'sahaba', slug: 'umar-faruq', reason: 'Conversion in this period' },
    { type: 'women', slug: 'khadija-mother-of-believers', reason: 'Year of Sorrow' },
    { type: 'women', slug: 'fatima-bint-khattab', reason: 'Recitation converted Umar' },
  ],
  'first-revelation-cave-hira-iqra': [
    { type: 'women', slug: 'khadija-mother-of-believers', reason: 'First believer at revelation' },
  ],
  'youth-al-amin-khadijah-black-stone': [
    { type: 'women', slug: 'khadija-mother-of-believers', reason: 'Marriage in this period' },
  ],
  'hijrah-madinah-founding-state': [
    { type: 'sahaba', slug: 'abu-bakr-siddiq', reason: 'Companion in the cave' },
    { type: 'sahaba', slug: 'ali-murtaza', reason: 'Slept in the bed that night' },
    { type: 'history', slug: 'hijrah-madinah-charter', reason: 'Same event: the Hijrah' },
    { type: 'waqiah', slug: 'hijrah-cave-thawr', reason: 'Same event: the cave' },
  ],
  'badr-first-decisive-victory': [
    { type: 'history', slug: 'badr-first-victory', reason: 'Same event: Badr' },
    { type: 'waqiah', slug: 'badr-first-victory', reason: 'Same event: Badr' },
    { type: 'sahaba', slug: 'hamza-lion', reason: 'Fought at Badr' },
  ],
  'uhud-trial-archers-lessons': [
    { type: 'history', slug: 'uhud-khandaq-trials', reason: 'Same event: Uhud' },
    { type: 'waqiah', slug: 'uhud-wound-steadfast', reason: 'Same event: Uhud' },
    { type: 'sahaba', slug: 'hamza-lion', reason: 'Martyred at Uhud' },
    { type: 'sahaba', slug: 'talha-shield', reason: 'Shielded the Prophet at Uhud' },
  ],
  'trench-hudaybiyyah-letters-kings': [
    { type: 'history', slug: 'uhud-khandaq-trials', reason: 'The Trench siege' },
    { type: 'history', slug: 'hudaybiyyah-conquest-makkah', reason: 'Hudaybiyyah treaty' },
    { type: 'waqiah', slug: 'khandaq-trench-wind', reason: 'Same event: the Trench' },
    { type: 'waqiah', slug: 'hudaybiyyah-ridwan-pledge', reason: 'Same event: Hudaybiyyah' },
    { type: 'sahaba', slug: 'salman-farsi', reason: 'Suggested the trench' },
  ],
  'khaybar-umrat-qada-mutah': [
    { type: 'waqiah', slug: 'khaybar-fort-victory', reason: 'Same event: Khaybar' },
    { type: 'sahaba', slug: 'ali-murtaza', reason: 'Carried the banner at Khaybar' },
    { type: 'sahaba', slug: 'khalid-sword', reason: 'Commanded at Mu\u2019tah' },
  ],
  'conquest-makkah-hunayn-tabuk': [
    { type: 'history', slug: 'hudaybiyyah-conquest-makkah', reason: 'The Conquest of Makkah' },
    { type: 'waqiah', slug: 'hunayn-humility-regroup', reason: 'Same event: Hunayn' },
    { type: 'waqiah', slug: 'tabuk-hour-hardship', reason: 'Same event: Tabuk' },
  ],
  'farewell-hajj-last-sermon-completion': [
    { type: 'history', slug: 'farewell-hajj-passing', reason: 'Same event: Farewell Hajj' },
    { type: 'waqiah', slug: 'farewell-sermon-completion', reason: 'Same event: Farewell sermon' },
  ],
  'passing-final-illness-legacy': [
    { type: 'history', slug: 'farewell-hajj-passing', reason: 'The passing' },
    { type: 'sahaba', slug: 'abu-bakr-siddiq', reason: 'Steadied the ummah (3:144)' },
  ],
  'isra-miraj-aqabah-pledges': [
    { type: 'waqiah', slug: 'isra-miraj-night', reason: 'Same event: Isra and Miraj' },
  ],
  'birth-noble-lineage-year-of-elephant': [
    { type: 'waqiah', slug: 'abraha-elephant-ababil', reason: 'Same event: Year of the Elephant' },
  ],
};

/** 5d. History -> seerah / companions / women (verified by event narratives). */
const HISTORY_LINKS: Record<string, RelationshipDecl[]> = {
  'hijrah-madinah-charter': [
    { type: 'seerah', slug: 'hijrah-madinah-founding-state', reason: 'Same event: the Hijrah' },
  ],
  'badr-first-victory': [
    { type: 'seerah', slug: 'badr-first-decisive-victory', reason: 'Same event: Badr' },
  ],
  'uhud-khandaq-trials': [
    { type: 'seerah', slug: 'uhud-trial-archers-lessons', reason: 'Uhud' },
    { type: 'seerah', slug: 'trench-hudaybiyyah-letters-kings', reason: 'The Trench' },
  ],
  'hudaybiyyah-conquest-makkah': [
    { type: 'seerah', slug: 'trench-hudaybiyyah-letters-kings', reason: 'Hudaybiyyah' },
    { type: 'seerah', slug: 'conquest-makkah-hunayn-tabuk', reason: 'The Conquest' },
  ],
  'farewell-hajj-passing': [
    { type: 'seerah', slug: 'farewell-hajj-last-sermon-completion', reason: 'Farewell Hajj' },
    { type: 'seerah', slug: 'passing-final-illness-legacy', reason: 'The passing' },
  ],
  'ridda-yamama': [
    { type: 'sahaba', slug: 'abu-bakr-siddiq', reason: 'Led the Ridda response' },
    { type: 'sahaba', slug: 'khalid-sword', reason: 'Commanded at Yamama' },
  ],
  'quran-compilation': [
    { type: 'sahaba', slug: 'uthman-ghani', reason: 'Standardised the codex' },
    { type: 'sahaba', slug: 'zayd-thabit-scribe', reason: 'Headed the committee' },
    { type: 'women', slug: 'hafsa-guardian', reason: 'Kept the master sheets' },
  ],
  'qadisiyyah-yarmuk': [
    { type: 'sahaba', slug: 'sad-abi-waqqas', reason: 'Commanded at Qadisiyyah' },
    { type: 'sahaba', slug: 'abu-ubaydah-amin', reason: 'Commanded in Syria' },
    { type: 'sahaba', slug: 'khalid-sword', reason: 'Fought at Yarmuk' },
  ],
  'uthman-first-fitna': [
    { type: 'sahaba', slug: 'uthman-ghani', reason: 'Martyred caliph' },
    { type: 'sahaba', slug: 'ali-murtaza', reason: 'Caliph during the fitna' },
    { type: 'sahaba', slug: 'talha-shield', reason: 'Present at Jamal' },
    { type: 'sahaba', slug: 'zubayr-hawari', reason: 'Present at Jamal' },
  ],
};

/** 5e. Sahaba / women -> seerah / history (verified by their narratives). */
const SAHABA_LINKS: Record<string, RelationshipDecl[]> = {
  'abu-bakr-siddiq': [
    { type: 'seerah', slug: 'secret-open-dawah-safa-early-muslims', reason: 'First free man to believe' },
    { type: 'history', slug: 'ridda-yamama', reason: 'Led as caliph' },
    { type: 'history', slug: 'quran-compilation', reason: 'Ordered the first collection' },
  ],
  'umar-faruq': [
    { type: 'seerah', slug: 'persecution-abyssinia-boycott-year-of-sorrow', reason: 'Conversion broke the boycott of fear' },
  ],
  'uthman-ghani': [
    { type: 'history', slug: 'quran-compilation', reason: 'The Uthmanic codex' },
  ],
  'ali-murtaza': [
    { type: 'seerah', slug: 'hijrah-madinah-founding-state', reason: 'Slept in the bed on Hijrah night' },
    { type: 'seerah', slug: 'khaybar-umrat-qada-mutah', reason: 'Tore off Khaybar\u2019s gate' },
  ],
  'hamza-lion': [
    { type: 'seerah', slug: 'persecution-abyssinia-boycott-year-of-sorrow', reason: 'Conversion shielded Islam' },
    { type: 'seerah', slug: 'uhud-trial-archers-lessons', reason: 'Martyred at Uhud' },
  ],
  'bilal-muezzin': [
    { type: 'seerah', slug: 'secret-open-dawah-safa-early-muslims', reason: 'Tortured for early belief' },
  ],
  'talha-shield': [
    { type: 'seerah', slug: 'uhud-trial-archers-lessons', reason: 'Shield of Uhud' },
  ],
  'khalid-sword': [
    { type: 'history', slug: 'qadisiyyah-yarmuk', reason: 'Shaped Yarmuk' },
  ],
  'salman-farsi': [
    { type: 'seerah', slug: 'trench-hudaybiyyah-letters-kings', reason: 'Suggested the trench' },
  ],
  'zayd-thabit-scribe': [
    { type: 'history', slug: 'quran-compilation', reason: 'Scribe of the collection' },
  ],
};

const WOMEN_LINKS: Record<string, RelationshipDecl[]> = {
  'khadija-mother-of-believers': [
    { type: 'seerah', slug: 'youth-al-amin-khadijah-black-stone', reason: 'Marriage' },
    { type: 'seerah', slug: 'first-revelation-cave-hira-iqra', reason: 'First believer' },
    { type: 'seerah', slug: 'persecution-abyssinia-boycott-year-of-sorrow', reason: 'Year of Sorrow' },
  ],
  'sumayyah-first-martyr': [
    { type: 'seerah', slug: 'secret-open-dawah-safa-early-muslims', reason: 'First martyr of the persecution' },
  ],
  'fatima-bint-khattab': [
    { type: 'seerah', slug: 'persecution-abyssinia-boycott-year-of-sorrow', reason: 'Her recitation converted Umar' },
  ],
  'hafsa-guardian': [
    { type: 'history', slug: 'quran-compilation', reason: 'Guardian of the sheets' },
  ],
};

/** 5f. Tools <-> guides (topical; guides cite calculators and vice versa). */
const TOOL_GUIDES: Record<string, string[]> = {
  'zakat-calculator': ['zakat-essentials'],
  'gold-zakat': ['zakat-essentials'],
  'silver-zakat': ['zakat-essentials'],
  'cash-savings-zakat': ['zakat-essentials'],
  'business-zakat': ['zakat-essentials'],
  'investment-zakat': ['zakat-essentials'],
  'agriculture-zakat': ['zakat-essentials'],
  'livestock-zakat': ['zakat-essentials'],
  'zakat-al-fitr': ['zakat-al-fitr'],
  'fidyah': ['fidyah-kaffarah-fasts', 'roza-fasting'],
  'kaffarah-oath': ['fidyah-kaffarah-fasts'],
  'kaffarah-fasting': ['fidyah-kaffarah-fasts'],
  'hajj-fidyah': ['hajj-umrah-basics'],
  'mahr-planner': ['nikah-marriage'],
  'nafaqah-planner': ['nikah-marriage'],
  'qurbani-splitter': ['qurbani-rules', 'qurbani-shares-who'],
  'eid-day-checklist': ['eid-day-sunnahs'],
  'obligations-guide': ['zakat-essentials', 'roza-fasting'],
};
const GUIDE_TOOLS: Record<string, string[]> = {
  'zakat-essentials': ['zakat-calculator'],
  'roza-fasting': ['fidyah'],
  'fidyah-kaffarah-fasts': ['fidyah', 'kaffarah-fasting'],
  'zakat-al-fitr': ['zakat-al-fitr'],
  'hajj-umrah-basics': ['hajj-fidyah'],
  'nikah-marriage': ['mahr-planner'],
  'qurbani-rules': ['qurbani-splitter'],
};

/** 5g. Quiz -> study material (verified by each question's `why` reference). */
const QUIZ_LINKS: Record<string, RelationshipDecl[]> = {
  'prophets-in-order': [
    { type: 'prophet', slug: 'adam-first-man-clay', reason: 'Q1: the first prophet' },
    { type: 'prophet', slug: 'nuh-nine-centuries-ark', reason: 'Q2: 950 years' },
    { type: 'prophet', slug: 'ibrahim-friend-of-allah', reason: 'Q3/Q9: fire; Khalilullah' },
    { type: 'prophet', slug: 'musa-pharaoh-and-sea', reason: 'Q4: the sea split' },
    { type: 'prophet', slug: 'yusuf-dream-to-throne', reason: 'Q5: the dream' },
    { type: 'prophet', slug: 'yunus-people-of-nineveh', reason: 'Q6: the fish' },
    { type: 'dua', slug: 'yunus-distress', reason: 'Q6: the dua (21:87)' },
    { type: 'prophet', slug: 'sulayman-wind-and-wisdom', reason: 'Q7: the ant' },
    { type: 'prophet', slug: 'isa-messiah-and-miracles', reason: 'Q8: the cradle speech' },
    { type: 'prophet', slug: 'muhammad-final-messenger', reason: 'Q10: the final messenger' },
  ],
  'seerah-quiz': [
    { type: 'seerah', slug: 'birth-noble-lineage-year-of-elephant', reason: 'Q1: Year of the Elephant' },
    { type: 'seerah', slug: 'first-revelation-cave-hira-iqra', reason: 'Q2: first word Iqra' },
    { type: 'sahaba', slug: 'ali-murtaza', reason: 'Q3: slept in the bed' },
    { type: 'waqiah', slug: 'hijrah-cave-thawr', reason: 'Q3/Q4: Hijrah; Cave Thawr' },
    { type: 'seerah', slug: 'badr-first-decisive-victory', reason: 'Q5: first battle' },
    { type: 'seerah', slug: 'uhud-trial-archers-lessons', reason: 'Q6: the archers\u2019 post' },
    { type: 'seerah', slug: 'conquest-makkah-hunayn-tabuk', reason: 'Q7: conquest of Makkah' },
    { type: 'seerah', slug: 'farewell-hajj-last-sermon-completion', reason: 'Q8: Farewell Sermon' },
    { type: 'women', slug: 'khadija-mother-of-believers', reason: 'Q9: first wife, first believer' },
    { type: 'seerah', slug: 'isra-miraj-aqabah-pledges', reason: 'Q10: Isra and Miraj' },
  ],
  'quran-quiz': [
    { type: 'surah', slug: '1-al-faatiha', reason: 'Q3: first surah' },
    { type: 'surah', slug: '2-al-baqara', reason: 'Q4/Q7: longest; Ayatul Kursi' },
    { type: 'dua', slug: 'ayatul-kursi-salah', reason: 'Q7: recited after salah' },
    { type: 'surah', slug: '108-al-kawthar', reason: 'Q5: shortest' },
    { type: 'surah', slug: '36-yaseen', reason: 'Q8: heart of the Quran' },
    { type: 'surah', slug: '18-al-kahf', reason: 'Q9: Friday recitation' },
    { type: 'surah', slug: '114-an-naas', reason: 'Q10: last surah' },
  ],
  'kids-quiz': [
    { type: 'kalima', slug: 'first-kalimah-tayyibah', reason: 'Q1: the Kalimas' },
    { type: 'kalima', slug: 'second-kalimah-shahadah', reason: 'Q1: the Kalimas' },
    { type: 'guide', slug: 'how-to-pray-namaz', reason: 'Q2: five daily prayers' },
    { type: 'guide', slug: 'wudu-ablution', reason: 'Q3: starting wudu' },
    { type: 'guide', slug: 'roza-fasting', reason: 'Q4: month of fasting' },
    { type: 'seerah', slug: 'first-revelation-cave-hira-iqra', reason: 'Q5: first word in Hira' },
    { type: 'guide', slug: 'hajj-umrah-basics', reason: 'Q6: the Kaaba' },
    { type: 'prophet', slug: 'adam-first-man-clay', reason: 'Q7: first prophet' },
    { type: 'guide', slug: 'eid-day-sunnahs', reason: 'Q8: the two Eids' },
    { type: 'guide', slug: 'belief-angels-books', reason: 'Q10: angels from light' },
  ],
  'ramadan-quiz': [
    { type: 'guide', slug: 'roza-fasting', reason: 'Q1/Q6/Q9: sehri; fasting rules' },
    { type: 'guide', slug: 'what-breaks-fast', reason: 'Q2: what breaks the fast' },
    { type: 'guide', slug: 'laylatul-qadr', reason: 'Q3/Q8/Q10: the odd nights; the dua' },
    { type: 'dua', slug: 'laylatul-qadr', reason: 'Q10: the Qadr dua' },
    { type: 'guide', slug: 'taraweeh-night-prayer', reason: 'Q4: Taraweeh' },
    { type: 'guide', slug: 'zakat-al-fitr', reason: 'Q5: fitrana amount' },
    { type: 'tool', slug: 'fidyah', reason: 'Q7: fidyah calculator' },
    { type: 'guide', slug: 'last-ten-nights-plan', reason: 'Q8: the nightly plan' },
  ],
  'hajj-quiz': [
    { type: 'guide', slug: 'ihram-how-to', reason: 'Q1: ihram at the miqat' },
    { type: 'guide', slug: 'tawaf-how-to', reason: 'Q2: seven circuits' },
    { type: 'guide', slug: 'sai-how-to', reason: 'Q3: Safa and Marwa' },
    { type: 'guide', slug: 'mina-arafah-muzdalifah', reason: 'Q4/Q5: Arafah; Muzdalifah' },
    { type: 'guide', slug: 'hajj-day-by-day', reason: 'Q6: stoning timeline' },
    { type: 'guide', slug: 'qurbani-rules', reason: 'Q7: Qurbani timing' },
    { type: 'guide', slug: 'umrah-day-plan', reason: 'Q8: Umrah in order' },
    { type: 'dua', slug: 'talbiyah', reason: 'Q9: the talbiyah' },
    { type: 'guide', slug: 'hajj-umrah-basics', reason: 'Q10: farewell tawaf' },
  ],
};

/** 5h. Hadith -> meaning (shared source: Hadith Jibril defines Iman/Ihsan). */
const HADEES_LINKS: Record<string, RelationshipDecl[]> = {
  'nawawi-jibril': [
    { type: 'meaning', slug: 'iman', reason: 'Defines Iman (Hadith Jibril)' },
    { type: 'meaning', slug: 'ihsan', reason: 'Defines Ihsan (Hadith Jibril)' },
  ],
};

/** 5i. Allah-name -> meaning (same divine attribute; verified by shared root concept). */
const ALLAH_MEANINGS: Record<string, string[]> = {
  'ar-rahman': ['rahmah'],
  'ar-rahim': ['rahmah'],
  'al-mumin': ['iman'],
  'al-ghaffar': ['tawbah'],
  'al-ghafur': ['tawbah'],
  'at-tawwab': ['tawbah'],
  'al-afuww': ['tawbah'],
  'ar-razzaq': ['rizq'],
  'al-hakam': ['adl'],
  'al-adl': ['adl'],
  'al-muqsit': ['adl'],
  'ash-shakur': ['shukr'],
  'as-sabur': ['sabr'],
};

/** 5j. Prophet-name (Quranic address) -> surah named by / containing the address. */
const PROPHET_NAME_SURAHS: Record<string, string[]> = {
  'taha': ['20-taa-haa'],
  'yasin': ['36-yaseen'],
  'muhammad': ['47-muhammad'],
  'ahmad': ['61-as-saff'],
  'muzammil': ['73-al-muzzammil'],
  'mudaththir': ['74-al-muddaththir'],
};

/* ------------------------------------------------------------------ */
/* 6. Assembly                                                         */
/* ------------------------------------------------------------------ */

function enrich(decl: RelationshipDecl): Relationship {
  const info = lookupTarget(decl.type, decl.slug);
  return {
    type: decl.type,
    slug: decl.slug,
    kind: kindForType(decl.type),
    category: info?.category,
    title: info?.title,
    reason: decl.reason,
  };
}

function addEntry(type: ContentType, slug: string, decls: RelationshipDecl[], category?: string): void {
  const seen = new Set<string>();
  const relationships: Relationship[] = [];
  for (const d of decls) {
    const key = `${d.type}:${d.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    relationships.push(enrich(d));
  }
  const existing = ENTITY_RELATIONSHIPS.find((e) => e.slug === slug && e.type === type && (e.category ?? undefined) === (category ?? undefined));
  if (existing) {
    for (const r of relationships) {
      if (!existing.relationships.some((x) => x.type === r.type && x.slug === r.slug)) existing.relationships.push(r);
    }
  } else {
    ENTITY_RELATIONSHIPS.push({ type, slug, category, relationships });
  }
}

/* 6a. Derived: Quran citations -> surahs + exact ayahs */
for (const d of DUAS) {
  const decls = [...surahDeclsFromTexts(d.source), ...ayahDeclsFromTexts(d.source)];
  if (decls.length) addEntry('dua', d.slug, decls, d.cat);
}
for (const w of WAQIAT) {
  const decls = [...surahDeclsFromTexts(w.quranRef), ...ayahDeclsFromTexts(w.quranRef)];
  const ps = prophetSlugForField(w.prophet);
  if (ps) decls.push({ type: 'prophet', slug: ps, reason: `About Prophet ${w.prophet.replace(/\(.*?\)/g, '').trim()}` });
  if (decls.length) addEntry('waqiah', w.slug, decls);
}
for (const p of PROPHETS) {
  const decls = [...surahDeclsFromTexts(p.quranRef), ...ayahDeclsFromTexts(p.quranRef)];
  const mine = WAQIAT.filter((w) => prophetSlugForField(w.prophet) === p.slug);
  for (const w of mine) decls.push({ type: 'waqiah', slug: w.slug, reason: 'Story of this prophet' });
  if (decls.length) addEntry('prophet', p.slug, decls);
}
for (const s of SEERAH) {
  const decls = [...surahDeclsFromTexts(s.references), ...ayahDeclsFromTexts(s.references)];
  if (decls.length) addEntry('seerah', s.slug, decls);
}
for (const s of SAHABA) {
  const decls = [...surahDeclsFromTexts(s.references), ...ayahDeclsFromTexts(s.references)];
  if (decls.length) addEntry('sahaba', s.slug, decls);
}
for (const h of HISTORY) {
  const decls = [...surahDeclsFromTexts(h.references), ...ayahDeclsFromTexts(h.references)];
  if (decls.length) addEntry('history', h.slug, decls);
}
for (const m of MEANINGS) {
  const decls = [...surahDeclsFromTexts(m.proofRef), ...ayahDeclsFromTexts(m.proofRef)];
  if (decls.length) addEntry('meaning', m.slug, decls);
}

/* 6b. Explicit */
for (const [gSlug, duaSlugs] of Object.entries(GUIDE_DUAS)) {
  const g = GUIDE_BY_SLUG.get(gSlug);
  if (!g) continue;
  addEntry('guide', gSlug, duaSlugs.map((s) => ({ type: 'dua' as ContentType, slug: s, reason: 'Dua for this topic' })), g.cat);
}
for (const [dSlug, links] of Object.entries(DUA_LINKS)) {
  const d = DUA_BY_SLUG.get(dSlug);
  if (!d) continue;
  const decls: RelationshipDecl[] = [
    ...(links.prophets ?? []).map((s) => ({ type: 'prophet' as ContentType, slug: s, reason: 'Dua of this prophet' })),
    ...(links.waqiat ?? []).map((s) => ({ type: 'waqiah' as ContentType, slug: s, reason: 'Story behind this dua' })),
    ...(links.women ?? []).map((s) => ({ type: 'women' as ContentType, slug: s, reason: 'Dua of this believer' })),
  ];
  addEntry('dua', dSlug, decls, d.cat);
}
for (const [slug, decls] of Object.entries(SEERAH_LINKS)) addEntry('seerah', slug, decls);
for (const [slug, decls] of Object.entries(HISTORY_LINKS)) addEntry('history', slug, decls);
for (const [slug, decls] of Object.entries(SAHABA_LINKS)) addEntry('sahaba', slug, decls);
for (const [slug, decls] of Object.entries(WOMEN_LINKS)) addEntry('women', slug, decls);
for (const [slug, decls] of Object.entries(HADEES_LINKS)) addEntry('hadees', slug, decls);
for (const [slug, meanings] of Object.entries(ALLAH_MEANINGS)) {
  addEntry('allah-name', slug, meanings.map((s) => ({ type: 'meaning' as ContentType, slug: s, reason: 'Shares this divine attribute' })));
}
for (const [slug, surahs] of Object.entries(PROPHET_NAME_SURAHS)) {
  addEntry('prophet-name', slug, surahs.map((s) => ({ type: 'surah' as ContentType, slug: s, reason: 'Quranic address in this surah' })));
}
const MONTH_LINKS: Record<string, RelationshipDecl[]> = {
  'muharram': [
    { type: 'guide', slug: 'moon-sighting-hilal', reason: 'New year begins by sighting' },
    { type: 'guide', slug: 'ashura-muharram-fasting', reason: 'Tasua and Ashura fasts' },
    { type: 'history', slug: 'karbala-61', reason: 'Karbala (61 AH)' },
  ],
  'rabi-al-awwal': [
    { type: 'seerah', slug: 'birth-noble-lineage-year-of-elephant', reason: 'Birth in Rabi al-Awwal' },
    { type: 'prophet', slug: 'muhammad-final-messenger', reason: 'Birth month of the Prophet ﷺ' },
  ],
  'rajab': [
    { type: 'guide', slug: 'rajab-virtues', reason: 'Sacred month guide' },
    { type: 'seerah', slug: 'isra-miraj-aqabah-pledges', reason: 'The Night Journey' },
    { type: 'waqiah', slug: 'isra-miraj-night', reason: 'The Night Journey' },
  ],
  'shaban': [
    { type: 'guide', slug: 'shaban-shab-e-barat', reason: '15th night guide' },
  ],
  'ramadan': [
    { type: 'guide', slug: 'roza-fasting', reason: 'Fasting rules' },
    { type: 'guide', slug: 'laylatul-qadr', reason: 'The odd nights' },
    { type: 'guide', slug: 'taraweeh-night-prayer', reason: 'Night prayer' },
    { type: 'dua', slug: 'laylatul-qadr', reason: 'Dua of the odd nights' },
    { type: 'tool', slug: 'fidyah', reason: 'Missed fasts calculator' },
    { type: 'quiz', slug: 'ramadan-quiz', reason: 'Test your Ramadan knowledge' },
  ],
  'shawwal': [
    { type: 'guide', slug: 'shawwal-six-fasts', reason: 'Six fasts of Shawwal' },
    { type: 'guide', slug: 'eid-day-sunnahs', reason: 'Eid al-Fitr sunnahs' },
    { type: 'guide', slug: 'eid-prayer-method', reason: 'Eid prayer' },
  ],
  'dhul-hijjah': [
    { type: 'guide', slug: 'hajj-day-by-day', reason: 'Hajj timeline' },
    { type: 'guide', slug: 'mina-arafah-muzdalifah', reason: 'Arafah and the stations' },
    { type: 'guide', slug: 'qurbani-rules', reason: 'Qurbani rules' },
    { type: 'guide', slug: 'tashriq-days-takbeer', reason: 'Tashriq days' },
    { type: 'tool', slug: 'qurbani-splitter', reason: 'Qurbani share splitter' },
    { type: 'quiz', slug: 'hajj-quiz', reason: 'Test your Hajj knowledge' },
    { type: 'dua', slug: 'arafah-dua', reason: 'Dua of Arafah day' },
  ],
};

/** 5l. Guide -> month (reverse of the strongest month associations). */
const GUIDE_MONTHS: Record<string, string[]> = {
  'ashura-muharram-fasting': ['muharram'],
  'rajab-virtues': ['rajab'],
  'shaban-shab-e-barat': ['shaban'],
  'laylatul-qadr': ['ramadan'],
  'roza-fasting': ['ramadan'],
  'shawwal-six-fasts': ['shawwal'],
  'hajj-day-by-day': ['dhul-hijjah'],
  'qurbani-rules': ['dhul-hijjah'],
};
for (const [slug, decls] of Object.entries(MONTH_LINKS)) addEntry('month', slug, decls);
for (const [gSlug, mSlugs] of Object.entries(GUIDE_MONTHS)) {
  const g = GUIDE_BY_SLUG.get(gSlug);
  if (!g) continue;
  addEntry('guide', gSlug, mSlugs.map((s) => ({ type: 'month' as ContentType, slug: s, reason: 'Month of this topic' })), g.cat);
}
for (const [slug, decls] of Object.entries(QUIZ_LINKS)) addEntry('quiz', slug, decls);
for (const [tSlug, gSlugs] of Object.entries(TOOL_GUIDES)) {
  const t = TOOL_BY_SLUG.get(tSlug);
  if (!t) continue;
  addEntry('tool', tSlug, gSlugs.map((s) => ({ type: 'guide' as ContentType, slug: s, reason: 'Guide for this tool' })), t.cat);
}
for (const [gSlug, tSlugs] of Object.entries(GUIDE_TOOLS)) {
  const g = GUIDE_BY_SLUG.get(gSlug);
  if (!g) continue;
  addEntry('guide', gSlug, tSlugs.map((s) => ({ type: 'tool' as ContentType, slug: s, reason: 'Calculator for this topic' })), g.cat);
}

/* ------------------------------------------------------------------ */
/* 7. Public read API (valid edges only: enriched + registered)        */
/* ------------------------------------------------------------------ */

function isUsable(r: Relationship): boolean {
  return !!r.title;
}

export interface EnrichedRelationship extends Relationship {
  /** Source entity (present for incoming edges). */
  from?: { type: ContentType; slug: string; category?: string };
}

/** Outgoing + incoming edges, deduped (outgoing wins), valid only. */
export function getRelatedEntities(type: ContentType, slug: string, category?: string): EnrichedRelationship[] {
  const out: EnrichedRelationship[] = [];
  const seen = new Set<string>();
  const entry = ENTITY_RELATIONSHIPS.find((e) => e.slug === slug && e.type === type && (e.category ?? undefined) === (category ?? undefined));
  for (const r of entry?.relationships ?? []) {
    const key = `${r.type}:${r.slug}`;
    if (seen.has(key) || !isUsable(r)) continue;
    seen.add(key);
    out.push(r);
  }
  for (const e of ENTITY_RELATIONSHIPS) {
    if (e.slug === slug && e.type === type) continue;
    for (const r of e.relationships) {
      if (r.type !== type || r.slug !== slug) continue;
      const back = lookupTarget(e.type, e.slug);
      if (!back) continue;
      const key = `${e.type}:${e.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        type: e.type,
        slug: e.slug,
        kind: kindForType(e.type),
        category: back.category,
        title: back.title,
        from: { type: e.type, slug: e.slug, category: e.category },
      });
    }
  }
  return out;
}

/** Incoming edges only (entities linking TO this one), valid only. */
export function getIncomingEntities(type: ContentType, slug: string): EnrichedRelationship[] {
  return getRelatedEntities(type, slug).filter((r) => r.from !== undefined);
}

/* ------------------------------------------------------------------ */
/* 8. Stats + build-time report (runs once per process)                */
/* ------------------------------------------------------------------ */

export function relationshipStats(): { entities: number; edges: number; usable: number; byKind: Record<string, number> } {
  let edges = 0;
  let usable = 0;
  const byKind: Record<string, number> = {};
  for (const e of ENTITY_RELATIONSHIPS) {
    for (const r of e.relationships) {
      edges++;
      if (isUsable(r)) {
        usable++;
        byKind[r.kind] = (byKind[r.kind] ?? 0) + 1;
      }
    }
  }
  return { entities: ENTITY_RELATIONSHIPS.length, edges, usable, byKind };
}

/** Validate and print a one-line summary + issues (warns, never throws). */
export function validateAll(): ValidationIssue[] {
  return validateRelationships();
}

const g = globalThis as any;
if (!g.__hn_relations_reported) {
  g.__hn_relations_reported = true;
  const issues = validateRelationships();
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const stats = relationshipStats();
  console.log(`[relationships] ${stats.entities} entities, ${stats.usable}/${stats.edges} usable edges, ${errors.length} error(s), ${warnings.length} warning(s)`);
  printValidationReport();
}
