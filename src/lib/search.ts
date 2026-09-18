/* Shared search-index helpers (imported by EN + locale search-index endpoints).
 * Everything on the site should be findable: paras, surahs (with common
 * spelling variants), articles, ALL finance tools, tool categories,
 * the tools dashboard and standalone pages.
 */
import { TOOLS, CATS } from './finance/tools.js';
import { DUAS, DUA_CATS } from '../data/duas';
import { KALIMAS } from '../data/kalimas';
import { MEANINGS } from '../data/meanings';
import { WAQIAT } from '../data/waqiat';

/** Common alternate spellings / transliterations people actually type.
 * Keys are surah URL slugs WITHOUT the numeric prefix (e.g. `yaseen`). */
export const SURAH_ALIASES: Record<string, string[]> = {
  'al-faatiha': ['fatiha', 'fateha', 'surah fatiha'],
  'al-baqara': ['baqarah', 'bakra', 'surah baqarah'],
  'aal-i-imraan': ['imran', 'ale imran'],
  'an-nisaa': ['nisa', 'women'],
  'al-maaida': ['maidah', 'maida'],
  'al-anaam': ['anaam', 'cattle'],
  'al-araaf': ['araaf', 'heights'],
  'al-anfaal': ['anfaal', 'spoils'],
  'at-tawba': ['tawba', 'tauba', 'repentance'],
  'yunus': ['yunus', 'jonah'],
  'hud': ['hud'],
  'yusuf': ['yusuf', 'joseph'],
  'ar-rad': ['rad', 'thunder'],
  'ibrahim': ['ibrahim', 'abraham'],
  'al-hijr': ['hijr'],
  'an-nahl': ['nahl', 'bee'],
  'al-israa': ['isra', 'night journey'],
  'al-kahf': ['kahf', 'kahaf', 'cave'],
  'maryam': ['maryam', 'mary'],
  'taa-haa': ['taha'],
  'al-anbiyaa': ['prophets'],
  'al-hajj': ['hajj'],
  'al-muminoon': ['believers'],
  'an-noor': ['noor', 'nur', 'light'],
  'al-furqaan': ['furqan'],
  'ash-shuaraa': ['poets'],
  'an-naml': ['ants'],
  'al-qasas': ['stories'],
  'al-ankaboot': ['spider'],
  'ar-room': ['rome'],
  'luqman': ['luqman'],
  'as-sajda': ['sajda', 'prostration'],
  'al-ahzaab': ['clans'],
  'saba': ['sheba'],
  'faatir': ['fatir'],
  'yaseen': ['yasin', 'yaseen', 'surah yasin', 'surah yaseen'],
  'as-saaffaat': ['ranks'],
  'saad': ['saad'],
  'az-zumar': ['zumar', 'groups'],
  'ghafir': ['forgiver'],
  'fussilat': ['explained'],
  'ash-shura': ['consultation'],
  'az-zukhruf': ['ornaments'],
  'ad-dukhaan': ['smoke'],
  'al-jaathiya': ['crouching'],
  'al-ahqaf': ['dunes'],
  'muhammad': ['muhammad'],
  'al-fath': ['victory'],
  'al-hujuraat': ['rooms'],
  'qaaf': ['qaf'],
  'adh-dhaariyat': ['winds'],
  'at-tur': ['mount'],
  'an-najm': ['star'],
  'al-qamar': ['moon'],
  'ar-rahmaan': ['rahman', 'rehman', 'rahmaan', 'merciful'],
  'al-waaqia': ['waqia', 'waqiah', 'event'],
  'al-hadid': ['iron'],
  'al-mujaadila': ['pleading'],
  'al-hashr': ['gathering'],
  'al-mumtahana': ['examined'],
  'as-saff': ['ranks'],
  'al-jumua': ['jumua', 'friday'],
  'al-munaafiqoon': ['hypocrites'],
  'at-taghaabun': ['loss'],
  'at-talaaq': ['divorce'],
  'at-tahrim': ['prohibition'],
  'al-mulk': ['mulk', 'dominion'],
  'al-qalam': ['pen'],
  'al-haaqqa': ['reality'],
  'al-maaarij': ['ascension'],
  'nooh': ['noah'],
  'al-jinn': ['jinn'],
  'al-muzzammil': ['muzzammil'],
  'al-muddaththir': ['muddaththir'],
  'al-qiyaama': ['qiyama', 'resurrection'],
  'al-insaan': ['insan', 'man'],
  'al-mursalaat': ['emissaries'],
  'an-naba': ['tidings'],
  'an-naaziaat': ['souls'],
  'abasa': ['frowned'],
  'at-takwir': ['folding'],
  'al-infitaar': ['cleaving'],
  'al-mutaffifin': ['defrauders'],
  'al-inshiqaaq': ['splitting'],
  'al-burooj': ['constellations'],
  'at-taariq': ['night star'],
  'al-alaa': ['most high'],
  'al-ghaashiya': ['overwhelming'],
  'al-fajr': ['fajr', 'dawn'],
  'al-balad': ['city'],
  'ash-shams': ['sun'],
  'al-lail': ['night'],
  'ad-dhuhaa': ['duha', 'morning'],
  'ash-sharh': ['relief'],
  'at-tin': ['fig'],
  'al-alaq': ['clot'],
  'al-qadr': ['qadr', 'decree', 'lailatul qadr', 'shab e qadr'],
  'al-bayyina': ['proof'],
  'az-zalzala': ['earthquake'],
  'al-aadiyaat': ['chargers'],
  'al-qaaria': ['calamity'],
  'at-takaathur': ['rivalry'],
  'al-asr': ['time'],
  'al-humaza': ['slanderer'],
  'al-fil': ['elephant'],
  'quraish': ['quraish'],
  'al-maaun': ['assistance'],
  'al-kawthar': ['kawthar', 'abundance'],
  'al-kaafiroon': ['disbelievers'],
  'an-nasr': ['help'],
  'al-masad': ['masad'],
  'al-ikhlaas': ['ikhlas', 'sincerity', 'qul'],
  'al-falaq': ['falaq', 'daybreak'],
  'an-naas': ['nas', 'mankind'],
};

/** Extra synonyms per tool so intent queries match ("fitrana", "mehr"...). */
const TOOL_SYNONYMS: Record<string, string[]> = {
  'zakat-calculator': ['zakat', 'zakah', 'zakaat', 'how much zakat'],
  'gold-zakat': ['gold', 'sona', 'jewellery', 'jewelry'],
  'silver-zakat': ['silver', 'chandi'],
  'cash-savings-zakat': ['cash', 'savings', 'bank', 'money'],
  'business-zakat': ['business', 'shop', 'inventory', 'trade', 'dukaan'],
  'investment-zakat': ['stocks', 'shares', 'mutual fund', 'crypto', 'investment'],
  'agriculture-zakat': ['crops', 'harvest', 'farm', 'khet'],
  'livestock-zakat': ['cow', 'goat', 'sheep', 'camel', 'cattle', 'bakra', 'janwar'],
  'zakat-al-fitr': ['fitr', 'fitra', 'fitrana', 'fitrah', 'eid'],
  'fidyah': ['fidyah', 'fidya', 'missed fast', 'roza'],
  'kaffarah-oath': ['oath', 'qasam', 'kasam', 'vow'],
  'kaffarah-fasting': ['kaffarah', 'kaffara', 'broke fast', 'roza tor'],
  'hajj-fidyah': ['hajj', 'haj', 'umrah', 'hady', 'damm', 'ihram'],
  'mahr-planner': ['mahr', 'mehr', 'dowry', 'haq mehr'],
  'nafaqah-planner': ['nafaqah', 'nafaqa', 'maintenance', 'kharcha', 'household'],
  'khums': ['khums', 'khumus', 'one fifth'],
  'ushr-guide': ['ushr', 'ushar', 'tithe', 'harvest'],
  'jizya-guide': ['jizya', 'jizyah'],
  'kharaj-guide': ['kharaj', 'land tax'],
  'obligations-guide': ['obligations', 'guide', 'what do i owe', 'start'],
};

export interface IndexItem {
  title: string;
  description: string;
  category: string;
  url: string;
  tags: string[];
  locale: string;
}

/** Dashboard + category + tool + standalone entries for a locale. */
export function toolIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'Islamic Finance Tools — all calculators',
      description: 'All 20 free tools: zakat, gold, silver, fitr, fidyah, kaffarah, mahr, nafaqah, khums calculators with evidence.',
      category: 'tools',
      url: `${prefix}/tools/`,
      tags: ['tools', 'calculators', 'finance', 'zakat calculator', 'all tools'],
      locale,
    },
    {
      title: 'Ramadan Countdown with Hijri date',
      description: 'Countdown to Ramadan with Hijri date.',
      category: 'tools',
      url: `${prefix}/tools/ramadan-countdown/`,
      tags: ['ramadan', 'countdown', 'ramzan', 'hijri', 'sehri', 'iftari'],
      locale,
    },
  ];
  for (const c of CATS as any[]) {
    items.push({
      title: `${c.title} Tools`,
      description: c.desc,
      category: 'tools',
      url: `${prefix}/tools/${c.slug}/`,
      tags: ['tools', c.title.toLowerCase(), c.slug.replace(/-/g, ' ')],
      locale,
    });
  }
  for (const t of TOOLS as any[]) {
    const words = t.slug.split('-');
    items.push({
      title: t.title.split('—')[0].trim(),
      description: t.desc,
      category: 'tools',
      url: `${prefix}/tools/${t.cat}/${t.slug}/`,
      tags: [...new Set([...words, 'tool', 'calculator', 'calculate', t.level.toLowerCase(), ...(TOOL_SYNONYMS[t.slug] || [])])],
      locale,
    });
  }
  return items;
}

/** Attach spelling-variant tags to surah items (matched by slug sans number). */
export function tagSurah<T extends { url: string; tags: string[] }>(item: T): T {
  const raw = item.url.split('/').filter(Boolean).pop() || '';
  const slug = raw.replace(/^\d+-/, '');
  const aliases = SURAH_ALIASES[slug];
  if (aliases) item.tags = [...new Set([...item.tags, ...aliases])];
  return item;
}

/** Dua hub + category + individual dua entries for a locale. */
export function duaIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'All Duas — every dua with Arabic, transliteration & meaning',
      description: 'Browse all authentic duas by category: morning, salah, travel, food, sleep, protection, forgiveness and more.',
      category: 'duas',
      url: `${prefix}/duas/`,
      tags: ['duas', 'dua', 'all duas', 'masnoon duas'],
      locale,
    },
  ];
  for (const c of DUA_CATS) {
    const n = DUAS.filter((d) => d.cat === c.slug).length;
    items.push({
      title: `${c.title} Duas (${n})`,
      description: c.desc,
      category: 'duas',
      url: `${prefix}/duas/${c.slug}/`,
      tags: ['duas', 'dua', c.title.toLowerCase(), c.slug.replace(/-/g, ' ')],
      locale,
    });
  }
  for (const d of DUAS) {
    const cat = DUA_CATS.find((c) => c.slug === d.cat);
    const origin = (d as any).origin ?? (String(d.source).startsWith('Quran') ? 'quran' : 'hadith');
    items.push({
      title: d.title,
      description: `${d.use}. Arabic with transliteration, meaning, virtue${(d as any).grade ? `, ${(d as any).grade} grade` : ''}. Source: ${d.source}.`,
      category: 'duas',
      url: `${prefix}/duas/${d.cat}/${d.slug}/`,
      tags: [...new Set(['dua', 'duas', d.title.toLowerCase(), d.use.toLowerCase(), (cat?.title || '').toLowerCase(), d.cat.replace(/-/g, ' '), d.source.toLowerCase(), origin, ((d as any).grade || '').toLowerCase(), ((d as any).narrator || '').toLowerCase(), ...(((d as any).aliases || []) as string[]), ...d.title.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3)])].filter(Boolean),
      locale,
    });
  }
  return items;
}

/** Kalima hub + individual kalima entries for a locale. */
export function kalimaIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'All 6 Kalimas — Arabic, transliteration & meaning',
      description: 'All 6 kalimas (Tayyibah, Shahadah, Tamjeed, Tawheed, Astaghfar, Radd-e-Kufr) with Arabic, transliteration, meaning and source basis.',
      category: 'kalimas',
      url: `${prefix}/kalimas/`,
      tags: ['kalimas', 'kalma', 'kalmay', '6 kalimas', '6 kalmay', 'all kalimas'],
      locale,
    },
  ];
  for (const k of KALIMAS) {
    items.push({
      title: k.title,
      description: `${k.use}. Arabic with transliteration, meaning and virtue. Basis: ${k.source}.`,
      category: 'kalimas',
      url: `${prefix}/kalimas/${k.slug}/`,
      tags: [...new Set(['kalima', 'kalimas', 'kalma', 'kalmay', k.title.toLowerCase(), k.short.toLowerCase(), k.use.toLowerCase(), `kalima ${k.num}`, `${k.num} kalima`, k.source.toLowerCase(), k.grade.toLowerCase(), ...(k.aliases || [])])].filter(Boolean),
      locale,
    });
  }
  return items;
}

/** Meanings hub + individual term entries for a locale. */
export function meaningIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'Islamic Terms & Meanings — Tawakkul, Sabr, Taqwa and More',
      description: 'Core Islamic terms explained: tawakkul, sabr, shukr, taqwa, iman, ihsan and more — Arabic, proof, misconceptions and practice.',
      category: 'meanings',
      url: `${prefix}/meanings/`,
      tags: ['meanings', 'meaning', 'islamic terms', 'islamic words', 'tawakkul', 'sabr', 'taqwa'],
      locale,
    },
  ];
  for (const m of MEANINGS) {
    items.push({
      title: `${m.term} Meaning in Islam`,
      description: `${m.definition} Proof: ${m.proofRef}.`,
      category: 'meanings',
      url: `${prefix}/meanings/${m.slug}/`,
      tags: [...new Set(['meaning', 'meanings', 'islamic term', m.term.toLowerCase(), m.translit.toLowerCase(), ...(m.aliases || [])])].filter(Boolean),
      locale,
    });
  }
  return items;
}

/** Waqiat hub + individual story entries for a locale. */
export function waqiahIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'Stories of the Prophets in Islam — Qisse with Lessons',
      description: 'Prophet stories: Yusuf, Ibrahim, Musa, Nuh, Yunus, Ayyub, Sulayman, Dawud, Isa and the Hijrah — events, lessons and Quran references.',
      category: 'waqiat',
      url: `${prefix}/waqiat/`,
      tags: ['waqiat', 'qisse', 'prophet stories', 'qasas', 'stories of prophets', 'seerah'],
      locale,
    },
  ];
  for (const w of WAQIAT) {
    items.push({
      title: `${w.title} — Story & Lessons`,
      description: `${w.summary} References: ${w.quranRef}.`,
      category: 'waqiat',
      url: `${prefix}/waqiat/${w.slug}/`,
      tags: [...new Set(['waqiah', 'waqiat', 'qissa', 'story', w.title.toLowerCase(), w.prophet.toLowerCase(), ...(w.aliases || [])])].filter(Boolean),
      locale,
    });
  }
  return items;
}
