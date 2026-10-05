/* Shared search-index helpers (imported by EN + locale search-index endpoints).
 * Everything on the site should be findable: paras, surahs (with common
 * spelling variants), articles, ALL finance tools, tool categories,
 * the tools dashboard and standalone pages.
 */
import { TOOLS, CATS } from './finance/tools.js';
import { DUAS, DUA_CATS } from '../data/duas';
import { localizeDua } from './duas-i18n';
import { localizeStory } from './stories-i18n';
import { KALIMAS } from '../data/kalimas';
import { MEANINGS } from '../data/meanings';
import { WAQIAT } from '../data/waqiat';
import { PROPHETS } from '../data/prophets';
import { SAHABA } from '../data/sahaba';
import { WOMEN } from '../data/women';
import { QUIZZES, QUIZ_CATS } from '../data/quizzes';
import { HADEES } from '../data/hadees';
import { NAWAWI } from '../data/hadees-nawawi';
import { SAHIH } from '../data/hadees-sahih';
import { SEERAH } from '../data/seerah';

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
  'mirath-calculator': ['mirath', 'meeras', 'warasat', 'wirasat', 'virasat', 'tarka', 'tirkah', 'inheritance', 'property distribution', 'succession'],
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

/** Standalone worship/utility tools (not part of the finance registry).
 *  Every tool page must be reachable from global search. */
export function standaloneToolItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const defs: Array<[string, string, string, string[]]> = [
    ['/tools/mosque-finder/', 'Mosque Finder — Nearby Masjids with Distance & Directions', 'Find nearby mosques with distance and directions from your location.', ['mosque finder', 'masjid', 'masjid near me', 'mosque near me', 'mosque locator', 'prayer place']],
    ['/tools/ayah-card/', 'Ayah Card Maker — Verse Images to Share & Download', 'Create beautiful ayah images to share and download.', ['ayah card', 'verse image', 'share ayah', 'quran image', 'ayah wallpaper']],
    ['/tools/daily-reminder/', 'Daily Reminder — One Ayah Notification Every Day', 'Get one ayah notification every day on your device.', ['daily reminder', 'ayah reminder', 'daily ayah', 'notification', 'reminder']],
    ['/tools/eid-takbeer/', 'Eid Takbeer Studio — Wording, Audio & Tashriq Schedule', 'Eid takbeer wording with audio and the Tashriq schedule.', ['eid takbeer', 'takbeer', 'takbir', 'tashriq', 'eid audio']],
    ['/tools/qurbani-dua/', 'Qurbani Dua — What to Say at Slaughter, with Audio', 'What to say at the time of Qurbani slaughter, with Arabic audio.', ['qurbani dua', 'qurbani', 'slaughter dua', 'udhia dua', 'bakra eid dua']],
    ['/tools/shawwal-tracker/', 'Shawwal 6 Tracker — Check Off the 6 Fasts After Eid', 'Track the 6 fasts of Shawwal after Eid al-Fitr and check them off.', ['shawwal', 'shawwal fasts', '6 fasts', 'shawwal tracker', 'fast tracker']],
    ['/tools/qada-tracker/', 'Qada Tracker — Make Up Missed Ramadan Fasts', 'Log and complete missed (qada) Ramadan fasts.', ['qada', 'qaza', 'missed fasts', 'qada roza', 'make up fasts']],
    ['/tools/kids-roza-chart/', 'Kids Roza Chart — 30-Day Star Chart for Children', 'A 30-day star chart to encourage children to fast in Ramadan.', ['kids roza', 'roza chart', 'kids fasting chart', 'ramadan kids', 'star chart']],
    ['/tools/namaz-trainer/', 'Namaz Trainer — Learn Salah Step by Step', 'Learn salah step by step, from 2 to 4 rakahs, with guidance.', ['namaz trainer', 'learn namaz', 'salah trainer', 'how to pray', 'namaz ka tarika']],
    ['/tools/kids-hifz/', 'Kids Hifz — Memorize Short Surahs with Audio', 'Help children memorize short surahs with recitation audio.', ['kids hifz', 'hifz', 'memorize quran', 'kids memorization', 'short surahs audio']],
    ['/tools/gems/', 'Quranic Gems — Short Reflections from the Quran', 'Short Quranic gems and reflections with references.', ['gems', 'quranic gems', 'reflections', 'gems of quran']],
    ['/tools/my-progress/', 'My Progress — Streak, Hasanat and Challenges', 'Track your streak, hasanat points and learning challenges.', ['my progress', 'streak', 'hasanat', 'challenges', 'progress tracker']],
    ['/tools/search-quran/', 'Search Quran — Translation & Arabic Text Search', 'Search the Quran by translation words or Arabic text.', ['search quran', 'quran search', 'find verse', 'quran word search']],
    ['/tools/read/', 'Read Quran — All Surahs with Translation & Audio', 'Read all 114 surahs in Arabic with translation, transliteration and audio.', ['read quran', 'quran reader', 'read surah', 'quran with audio']],
  ];
  return defs.map(([path, title, description, tags]) => ({
    title, description, category: 'tools', url: `${prefix}${path}`, tags: [...tags, 'tools', 'tool'], locale,
  }));
}

/** Static/info pages so everything on the site is navigable via search. */
export function staticPageItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const defs: Array<[string, string, string, string, string[]]> = [
    ['/explore/', 'learn', 'Explore the Library — Quran, Duas, Guides, Stories & Tools', 'Browse the full library: Quran, duas, guides, stories, tools and quizzes.', ['explore', 'library', 'browse', 'sitemap', 'all content']],
    ['/surah-virtues/', 'learn', 'Surah Virtues (Fazail) — Which Surah to Read & When', 'Ayatul Kursi after salah, Kahf on Friday, Mulk at night, Waqiah for rizq, 3 Quls morning and evening — every virtue with hadith and grading.', ['surah virtues', 'fazail', 'fazilat', 'which surah to read', 'surah benefits', 'occasion surah', 'kursi', 'kahf friday', 'mulk night', 'waqiah rizq', '3 qul', 'sajda tilawat']],
    ['/aqeedah/', 'learn', 'Aqeedah — Six Pillars, Tawhid, Qadr & Last Day', 'Islamic creed: the six pillars of iman, Tawhid, Qadr and the Last Day.', ['aqeedah', 'aqida', 'creed', 'iman', 'tawhid', 'pillars of faith']],
    ['/kids/', 'learn', 'Kids Zone — Short Hadees, Prayer Steps & Quiz', 'Islamic learning for children: short hadees, prayer steps and quizzes.', ['kids', 'children', 'bachon', 'kids zone', 'islam for kids']],
    ['/ask/', 'learn', 'Ask a Question — Sourcing, Rulings & Corrections', 'Ask about sourcing, rulings or corrections on any page.', ['ask', 'question', 'fatwa', 'sawal', 'contact scholar']],
    ['/about/', 'learn', 'About Hikmah Noor — Sources & Method', 'What Hikmah Noor is, its sources and editorial method.', ['about', 'about us', 'methodology', 'sources']],
    ['/methodology/', 'learn', 'Methodology — How Content Is Sourced', 'How every page is sourced, graded and reviewed.', ['methodology', 'method', 'sources', 'editorial']],
    ['/scholars/', 'learn', 'Scholars — Authorities We Quote', 'The scholars and sources quoted across the site.', ['scholars', 'ulama', 'sources', 'authorities']],
    ['/favourites/', 'tools', 'Favourites — Your Saved Duas, Stories & Verses', 'Your saved duas, stories and verses on this device.', ['favourites', 'favorites', 'saved', 'bookmarks']],
    ['/al-mushrif/', 'learn', 'Al-Mushrif — Editorial Oversight', 'Editorial oversight and review policy.', ['mushrif', 'editorial', 'review', 'oversight']],
    ['/donate/', 'learn', 'Donate — Support Hikmah Noor', 'Support free Islamic knowledge with a donation.', ['donate', 'donation', 'support', 'sadaqah']],
    ['/contact/', 'learn', 'Contact — Get in Touch', 'Contact the Hikmah Noor team.', ['contact', 'email', 'feedback']],
  ];
  return defs.map(([path, category, title, description, tags]) => {
    // al-mushrif has no /hi|ur|ar/ variant — point every locale at the EN page.
    const url = path === '/al-mushrif/' ? path : `${prefix}${path}`;
    return { title, description, category, url, tags, locale };
  });
}

/** Dashboard + category + tool + standalone entries for a locale. */
export function toolIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'Islamic Finance Tools — all calculators',
      description: `All ${(TOOLS as any[]).length} free tools: zakat, gold, silver, fitr, fidyah, kaffarah, mahr, nafaqah, khums, qurbani calculators with evidence.`,
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
    {
      title: 'Tasbih Counter Online — Dhikr with Daily Totals',
      description: 'Free online tasbih counter: SubhanAllah, Alhamdulillah, Allahu Akbar with 33/100/1000 goals and daily totals saved on your device.',
      category: 'tools',
      url: `${prefix}/tools/tasbih/`,
      tags: ['tasbih', 'tasbeeh', 'tasbih counter', 'tasbeeh counter', 'dhikr counter', 'zikr counter', 'digital tasbih', 'counter', 'subhanallah counter', 'dhikr', 'zikr', 'allah hu akbar counter'],
      locale,
    },
    {
      title: 'Prayer Times Today — Namaz Timings, Qibla & Hijri Date',
      description: 'Today’s prayer times for your city: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha with next-prayer countdown, Qibla compass and Hijri date. Karachi, MWL, ISNA methods.',
      category: 'tools',
      url: `${prefix}/tools/prayer-times/`,
      tags: ['prayer times', 'namaz timings', 'salah times', 'fajr', 'dhuhr', 'zuhr', 'asr', 'maghrib', 'isha', 'qibla', 'qibla finder', 'qibla direction', 'hijri date', 'islamic date today', 'sehri time', 'iftar time', 'azan time', 'athan'],
      locale,
    },
    {
      title: 'Qibla Finder — Accurate Qibla Direction & Compass',
      description: 'Exact Qibla direction from GPS or city with great-circle bearing to the Kaaba and live compass needle.',
      category: 'tools',
      url: `${prefix}/tools/qibla/`,
      tags: ['qibla', 'qibla finder', 'qibla direction', 'qibla compass', 'qibla locator', 'kaaba direction', 'qibla online', 'qibla for namaz', 'which direction to pray'],
      locale,
    },
    {
      title: 'Prayer Tracker — Daily Salah Log & Streaks',
      description: 'Log Fajr, Dhuhr, Asr, Maghrib and Isha daily, build your streak and review the last 7 days. Saved on your device.',
      category: 'tools',
      url: `${prefix}/tools/prayer-tracker/`,
      tags: ['prayer tracker', 'salah tracker', 'namaz tracker', 'prayer streak', 'fard log', 'daily prayer log', 'prayer checklist'],
      locale,
    },
    {
      title: 'Quran Khatm Planner — Daily Pages & Juz Schedule',
      description: 'Enter start and target dates to get daily pages, juz portions and per-prayer splits for completing the Quran.',
      category: 'tools',
      url: `${prefix}/tools/khatm-planner/`,
      tags: ['khatm planner', 'quran completion plan', 'daily juz', 'khatm schedule', '30 day quran plan', 'how to finish quran in ramadan', 'quran pages per day'],
      locale,
    },
    {
      title: 'Hijri Date Converter — Gregorian to Islamic Date',
      description: 'Convert any Gregorian date to the Hijri date with Umm al-Qura and civil calendars, plus today’s Hijri date.',
      category: 'tools',
      url: `${prefix}/tools/hijri-converter/`,
      tags: ['hijri date', 'islamic date today', 'hijri converter', 'gregorian to hijri', 'islamic calendar', 'chand ki tareekh', 'aaj hijri tareekh'],
      locale,
    },
    {
      title: 'Islamic Calendar — Hijri Dates, Ramadan, Eid & Sacred Days',
      description: 'Live Islamic (Hijri) calendar: month view, Ramadan, Laylatul Qadr, Eid al-Fitr, Hajj, Eid al-Adha, Ashura and Shab-e-Barat with Gregorian equivalents and countdowns.',
      category: 'tools',
      url: `${prefix}/calendar/`,
      tags: ['islamic calendar', 'hijri calendar', 'hijri months', 'ramadan date', 'eid date', 'eid al fitr date', 'eid al adha date', 'ashura date', 'shab e barat', 'shab e miraj', 'mawlid date', 'arafah date', 'islamic date today', 'muslim calendar', 'chand ki tareekh'],
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
  for (const d0 of DUAS) {
    const d: any = ['ur', 'hi', 'ar'].includes(locale) ? localizeDua(d0, locale) : d0;
    const cat = DUA_CATS.find((c) => c.slug === d.cat);
    const origin = (d as any).origin ?? (String(d.source).startsWith('Quran') ? 'quran' : 'hadith');
    items.push({
      title: d.title,
      description: `${d.use}. Arabic with transliteration, meaning, virtue${(d as any).grade ? `, ${(d as any).grade} grade` : ''}. Source: ${d.source}.`,
      category: 'duas',
      url: `${prefix}/duas/${d.cat}/${d.slug}/`,
      tags: [...new Set(['dua', 'duas', ...((d as any).hisnNo ? ['hisn al muslim', 'hisn', `hisn ${(d as any).hisnNo}`] : []), d.title.toLowerCase(), d.use.toLowerCase(), (cat?.title || '').toLowerCase(), d.cat.replace(/-/g, ' '), d.source.toLowerCase(), origin, ((d as any).grade || '').toLowerCase(), ((d as any).narrator || '').toLowerCase(), ...(((d as any).aliases || []) as string[]), ...d.title.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3)])].filter(Boolean),
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
  for (const w0 of WAQIAT) {
    const w: any = locale === 'ur' ? localizeStory(w0, 'waqiat', locale) : w0;
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
/** Prophets hub + individual prophet entries for a locale. */
export function prophetIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'The 25 Prophets in Islam — Stories in Order with Lessons',
      description: 'All 25 prophets in order: Adam, Nuh, Ibrahim, Musa, Dawud, Sulayman, Yunus, Isa and Muhammad ﷺ — events, lessons and Quran references.',
      category: 'prophets',
      url: `${prefix}/prophets/`,
      tags: ['prophets', 'anbiya', 'ambiya', '25 prophets', 'prophet stories in order', 'qisse ambiya', 'stories of prophets'],
      locale,
    },
  ];
  for (const p0 of PROPHETS) {
    const p: any = locale === 'ur' ? localizeStory(p0, 'prophets', locale) : p0;
    items.push({
      title: `${p.title} — Story & Lessons`,
      description: `${p.summary} References: ${p.quranRef}.`,
      category: 'prophets',
      url: `${prefix}/prophets/${p.slug}/`,
      tags: [...new Set(['prophet', 'prophets', 'nabi', 'qissa', 'story', `prophet ${p.order}`, p.title.toLowerCase(), p.name.toLowerCase(), p.era.toLowerCase(), ...(p.aliases || [])])].filter(Boolean),
      locale,
    });
  }
  return items;
}
/** Women hub + individual figure entries for a locale. */
export function womenIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'Women in Islam — Lives of 24 Noble Figures',
      description: 'Stories of Khadija, Aisha, Fatima, Maryam, Asiya and more — faith, courage and scholarship. Each figure has its own page.',
      category: 'women',
      url: `${prefix}/women/`,
      tags: ['women', 'women in islam', 'khadija', 'aisha', 'fatima', 'maryam', 'sahabiyat', 'muslim women'],
      locale,
    },
  ];
  for (const w0 of WOMEN) {
    const w: any = locale === 'ur' ? localizeStory(w0, 'women', locale) : w0;
    items.push({
      title: `${w.title} — Story & Lessons`,
      description: `${w.summary} References: ${w.references}.`,
      category: 'women',
      url: `${prefix}/women/${w.slug}/`,
      tags: [...new Set(['woman', 'women in islam', 'sahabiyat', `figure ${w.order}`, w.title.toLowerCase(), w.name.toLowerCase(), w.era.toLowerCase(), ...(w.aliases || [])])].filter(Boolean),
      locale,
    });
  }
  return items;
}
/** Quiz hub + individual quiz entries for a locale. */
export function quizIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'Islamic Quizzes — Test Your Knowledge',
      description: 'Free Islamic quizzes with instant answers: prophets in order, Seerah of Muhammad ﷺ, and Quran surahs & facts. Score 8+ to pass.',
      category: 'quiz',
      url: `${prefix}/quiz/`,
      tags: ['quiz', 'quizzes', 'islamic quiz', 'test', 'sawal jawab', 'mcq'],
      locale,
    },
  ];
  for (const q of QUIZZES) {
    const cat = QUIZ_CATS.find((c) => c.slug === q.cat);
    items.push({
      title: `${q.title} — Test Yourself`,
      description: `${q.desc} 10 questions with instant answers and sources.`,
      category: 'quiz',
      url: `${prefix}/quiz/${q.slug}/`,
      tags: [...new Set(['quiz', 'test', q.title.toLowerCase(), (cat?.title || '').toLowerCase(), ...q.keywords.split(',').map((s) => s.trim().toLowerCase()), ...(q.aliases || [])])].filter(Boolean),
      locale,
    });
  }
  return items;
}
/** Sahaba hub + individual companion entries for a locale. */
export function sahabaIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'Sahaba Stories — Lives of the Prophet’s ﷺ Companions',
      description: 'All 24 companion stories: Abu Bakr, Umar, Uthman, Ali, Hamza, Bilal, Khalid and more — events, lessons and references.',
      category: 'sahaba',
      url: `${prefix}/sahaba/`,
      tags: ['sahaba', 'sahabi', 'companions', 'ashra mubashara', 'khulafa rashidun', 'companions of prophet'],
      locale,
    },
  ];
  for (const s0 of SAHABA) {
    const s: any = locale === 'ur' ? localizeStory(s0, 'sahaba', locale) : s0;
    items.push({
      title: `${s.title} — Story & Lessons`,
      description: `${s.summary} References: ${s.references}.`,
      category: 'sahaba',
      url: `${prefix}/sahaba/${s.slug}/`,
      tags: [...new Set(['sahabi', 'sahaba', 'companion', `companion ${s.order}`, s.title.toLowerCase(), s.name.toLowerCase(), s.era.toLowerCase(), ...(s.aliases || [])])].filter(Boolean),
      locale,
    });
  }
  return items;
}
/** Hadees hub + individual hadees entries for a locale (kids 40 + Nawawi 40 + Sahih 40). */
export function hadeesIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'Hadees Library — 40 for Children + 40 of Imam Nawawi + 40 Sahih Selections',
      description: 'All 120 hadees: 40 short hadees for kids, the 40 Hadith of Imam Nawawi, plus 40 Sahih selections — Arabic, Urdu, English, lesson and source. Each hadees has its own page.',
      category: 'hadees',
      url: `${prefix}/hadees/`,
      tags: ['hadees', 'hadith', 'hadees in urdu', '40 hadees', 'nawawi', '40 hadith nawawi', 'sahih bukhari', 'sahih muslim', 'choti hadees', 'bachon ki hadees', 'short hadith'],
      locale,
    },
  ];
  for (const h of [...HADEES, ...NAWAWI, ...SAHIH]) {
    items.push({
      title: `${h.title}`,
      description: `${h.urdu} ${h.translation} Lesson: ${h.lesson} Source: ${h.source}.`,
      category: 'hadees',
      url: `${prefix}/hadees/${h.slug}/`,
      tags: [...new Set(['hadees', 'hadith', 'hadees in urdu', `hadees ${h.num}`, h.title.toLowerCase(), h.urdu, h.translation.toLowerCase(), h.source.toLowerCase(), (h.narrator || '').toLowerCase(), h.grade.toLowerCase(), ...(h.aliases || []), ...h.keywords.split(',').map((s) => s.trim().toLowerCase())])].filter(Boolean),
      locale,
    });
  }
  return items;
}
/** Seerat hub + individual chapter entries for a locale (one SEO page per chapter). */
export function seerahIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items: IndexItem[] = [
    {
      title: 'Seerat un Nabi ﷺ — Complete Biography in 16 Chapters',
      description: 'Full seerah of Prophet Muhammad ﷺ: birth, Hira, Makkah dawah, Hijrah, Badr, Uhud, conquest of Makkah, farewell Hajj. Each chapter has its own page.',
      category: 'seerat',
      url: `${prefix}/seerat/`,
      tags: ['seerat', 'seerah', 'serat', 'seerat un nabi', 'prophet biography', 'hazoor ki seerat', 'complete seerah'],
      locale,
    },
  ];
  for (const s of SEERAH) {
    items.push({
      title: `${s.title} — Seerat Ch. ${s.num}`,
      description: `${s.summary} References: ${s.references}.`,
      category: 'seerat',
      url: `${prefix}/seerat/${s.slug}/`,
      tags: [...new Set(['seerat', 'seerah', 'serat', `chapter ${s.num}`, `seerat chapter ${s.num}`, s.era.toLowerCase(), s.title.toLowerCase(), s.summary.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 4).slice(0, 8).join(' '), ...(s.aliases || []), ...s.keywords.split(',').map((x) => x.trim().toLowerCase())])].filter(Boolean),
      locale,
    });
  }
  return items;
}
import { GUIDES, GUIDE_CATS } from '../data/guides';
import { localizeGuide, localizeGuideCat } from './guides-i18n';
import { HISTORY } from '../data/history';
import {
  HADITH_COLLECTIONS, HADITH_BOOKS, hadithBooksOf, hadithEntriesOf, hadithCountOf,
  collectionPath, bookPath, entryPath,
} from '../data/hadith-collections';import { ALLAH, PROPHET } from '../data/names';
import { localizeAllahName, localizeProphetName } from './content-i18n';
import { MONTHS } from '../data/months';
import { monthDesc } from './site-ui-4';
import { secUI } from './site-ui-1';
import { RAMADAN_UI, EID_UI, HAJJ_UI, UMRAH_UI } from './site-ui-4';
import surahsMeta from '../data/surahs-meta.json';

/** Compact per-ayah entries (reference-focused; no verse text duplication).
 *  Keeps the client-side index small while making every ayah discoverable
 *  by reference (`2:255`), surah name or ayah number. */
export function ayahIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : '/' + locale;
  const items: IndexItem[] = [];
  for (const s of surahsMeta as any[]) {
    for (let v = 1; v <= s.verseCount; v++) {
      items.push({
        title: `${s.name} ${s.num}:${v}`,
        description: `Quran ${s.num}:${v} · Surah ${s.name} (${s.englishName}), ayah ${v} of ${s.verseCount}.`,
        category: 'quran',
        url: `${prefix}/quran/${s.slug}/${v}/`,
        tags: [`${s.num}:${v}`, `quran ${s.num}:${v}`, s.name.toLowerCase(), s.englishName.toLowerCase(), `surah ${s.num}`, `ayah ${v}`, 'ayah', 'verse'],
        locale,
      });
    }
  }
  return items;
}

/** Islamic months + Umrah hub entries for a locale. */
export function topicsIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : '/' + locale;
  const items: IndexItem[] = [
    {
      title: (secUI(locale, RAMADAN_UI) as any).hubH1,
      description: 'Everything for Ramadan: moon sighting, fasting rules, itikaf, Laylatul Qadr, Taraweeh, fitrana, countdown and prayer times.',
      category: 'ramadan',
      url: prefix + '/ramadan/',
      tags: ['ramadan', 'ramzan', 'roza', 'رمضان', 'रमज़ान', 'fasting', 'sehri', 'iftar', 'taraweeh', 'laylatul qadr', 'shab e qadr', 'fitrana', 'itikaf'],
      locale,
    },
    {
      title: (secUI(locale, EID_UI) as any).hubH1,
      description: 'Both Eids in one place: Eid prayer method, day sunnahs, takbeer wording, khutbah rulings, Zakat al-Fitr, Qurbani rules and Eid duas.',
      category: 'eid',
      url: prefix + '/eid/',
      tags: ['eid', 'عید', 'ईद', 'eid ul fitr', 'eid ul adha', 'eid namaz', 'takbeer', 'qurbani', 'bakra eid', 'eid mubarak', 'fitrana'],
      locale,
    },
    {
      title: (secUI(locale, HAJJ_UI) as any).hubH1,
      description: 'Complete Hajj & Umrah guide: ihram, tawaf, sai, Mina, Arafah, Muzdalifah, stoning, sacrifice, day-by-day timeline and essential duas.',
      category: 'hajj',
      url: prefix + '/hajj/',
      tags: ['hajj', 'حج', 'हज', 'haj', 'umrah', 'عمرہ', 'ihram', 'tawaf', 'arafah', 'arafat', 'mina', 'muzdalifah', 'rami', 'stoning', 'talbiyah'],
      locale,
    },
    {
      title: (secUI(locale, UMRAH_UI) as any).hubH1,
      description: 'How to perform Umrah in order: ihram, tawaf, sai and haircut — with timings, crowd tips, kids and elderly guidance, and essential duas.',
      category: 'hajj',
      url: prefix + '/umrah/',
      tags: ['umrah', 'عمرہ', 'उमरा', 'umrah guide', 'umrah ka tarika', 'how to do umrah', 'ihram', 'tawaf', 'talbiyah'],
      locale,
    },
  ];
  for (const m of MONTHS) {
    const desc = monthDesc(m.slug, locale);
    items.push({
      title: `${m.name} — Hijri Month ${m.num}`,
      description: `${desc} Arabic: ${m.arabic}.`,
      category: 'calendar',
      url: `${prefix}/calendar/${m.slug}/`,
      tags: [...new Set(['calendar', 'hijri', 'month', `month ${m.num}`, m.arabic, m.name.toLowerCase(), ...m.name.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2)])].filter(Boolean),
      locale,
    });
  }
  return items;
}

/** Names hubs + individual name entries for a locale. */
export function namesIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : '/' + locale;
  const items: IndexItem[] = [
    {
      title: '99 Names of Allah (Asma-ul-Husna) with Meaning',
      description: 'All 99 names of Allah in Arabic with transliteration and meaning — from Ar-Rahman to As-Sabur. Each name has its own page.',
      category: 'names',
      url: prefix + '/names-of-allah/',
      tags: ['names', 'allah', 'asma ul husna', '99 names', 'ar rahman', 'asmaul husna'],
      locale,
    },
    {
      title: '99 Names of Prophet Muhammad ﷺ with Meaning',
      description: 'All 99 names and titles of Prophet Muhammad ﷺ in Arabic with transliteration and meaning — Muhammad, Ahmad, Mustafa and more.',
      category: 'names',
      url: prefix + '/names-muhammad/',
      tags: ['names', 'prophet', 'muhammad', 'asma un nabi', '99 names', 'ahmad', 'mustafa'],
      locale,
    },
  ];
  for (const e of ALLAH) {
    const m: string = locale === 'en' ? e.meaning : (localizeAllahName(e, locale).meaning ?? e.meaning);
    items.push({
      title: `${e.translit} — Name ${e.n} of Allah`,
      description: `${m} Arabic: ${e.arabic}. One of the 99 names of Allah (Asma-ul-Husna).`,
      category: 'names',
      url: `${prefix}/names-of-allah/${e.slug}/`,
      tags: [...new Set(['names', 'allah', 'asma ul husna', `name ${e.n}`, e.arabic, e.translit.toLowerCase(), m.toLowerCase(), ...e.translit.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2)])].filter(Boolean),
      locale,
    });
  }
  for (const e of PROPHET) {
    const m: string = locale === 'en' ? e.meaning : (localizeProphetName(e, locale).meaning ?? e.meaning);
    items.push({
      title: `${e.translit} — Name of Prophet Muhammad ﷺ`,
      description: `${m} Arabic: ${e.arabic}. One of the 99 names and titles of Prophet Muhammad ﷺ.`,
      category: 'names',
      url: `${prefix}/names-muhammad/${e.slug}/`,
      tags: [...new Set(['names', 'prophet', 'muhammad', 'asma un nabi', `name ${e.n}`, e.arabic, e.translit.toLowerCase(), m.toLowerCase(), ...e.translit.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2)])].filter(Boolean),
      locale,
    });
  }
  return items;
}

/** Hadith collections hub + book + individual entry docs for a locale.
 *  Compact core docs only (title/url/excerpt/tags) — full Arabic/English
 *  matn stays on the entry pages, never in the index payload. */
export function hadithCollectionIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : '/' + locale;
  const items: IndexItem[] = [];
  for (const c of HADITH_COLLECTIONS) {
    const total = hadithCountOf(c.id);
    items.push({
      title: `${c.name} — Full Collection in Arabic & English`,
      description: `${c.description} Browse by book; ${total} hadith in order.`,
      category: 'hadees',
      url: `${prefix}${collectionPath(c.slug)}`,
      tags: ['hadith', 'hadees', 'hadith collection', 'hadees collection', c.name.toLowerCase(), c.slug, c.short.toLowerCase(), 'forty hadith', 'arbaeen', `arbaeen ${c.slug}`],
      locale,
    });
    for (const b of hadithBooksOf(c.id)) {
      items.push({
        title: `${b.title} — Read in Order`,
        description: `${total} hadith with full Arabic matn and English translation. Open any hadith for its own page.`,
        category: 'hadees',
        url: `${prefix}${bookPath(c.slug, b.slug)}`,
        tags: ['hadith', 'hadees', 'hadith book', b.title.toLowerCase(), b.slug.replace(/-/g, ' '), c.short.toLowerCase()],
        locale,
      });
    }
    for (const h of hadithEntriesOf(c.id)) {
      const excerpt = h.english.length > 150 ? h.english.slice(0, 147) + '…' : h.english;
      items.push({
        title: `${c.short} Hadith ${h.num}`,
        description: `${c.short} Hadith ${h.num} of ${total}: ${excerpt}`,
        category: 'hadees',
        url: `${prefix}${entryPath(c.slug, hadithBooksOf(c.id).find((b) => b.num === h.bookNum)!.slug, h.num)}`,
        tags: [...new Set(['hadith', 'hadees', `hadith ${h.num}`, `${c.slug} ${h.num}`, `${c.short.toLowerCase()} ${h.num}`, c.name.toLowerCase(), c.short.toLowerCase(), 'forty hadith', 'arbaeen'])].filter(Boolean),
        locale,
      });
    }
  }
  return items;
}

/** History hub + individual event entries for a locale. */
export function historyIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : '/' + locale;
  const items: IndexItem[] = [
    {
      title: 'Islamic History — 20 Landmark Events in Order',
      description: 'Hijrah, Badr, Hudaybiyyah, Yarmuk, Cordoba, Baghdad, Hattin, Constantinople and more — timelines, lessons and references.',
      category: 'history',
      url: prefix + '/history/',
      tags: ['history', 'tarikh', 'islamic history', 'muslim history', 'timeline', 'seerah history'],
      locale,
    },
  ];
  for (const h of HISTORY) {
    items.push({
      title: `${h.title} — Timeline & Lessons`,
      description: `${h.summary} Date: ${h.year}.`,
      category: 'history',
      url: `${prefix}/history/${h.slug}/`,
      tags: [...new Set(['history', 'tarikh', 'event', `event ${h.order}`, h.title.toLowerCase(), h.name.toLowerCase(), h.era.toLowerCase(), h.year.toLowerCase(), ...(h.aliases || [])])].filter(Boolean),
      locale,
    });
  }
  return items;
}

export function guideIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : '/' + locale;
  const items: IndexItem[] = [
    {
      title: 'Islamic Guides - How to Pray, Wudu, Fasting, Zakat, Hajj and More',
      description: 'Step-by-step Islamic guides: how to pray namaz, wudu, ghusl, fasting, zakat, Hajj, nikah and janaza - with steps, evidence and FAQs.',
      category: 'learn',
      url: prefix + '/learn/',
      tags: ['learn', 'guides', 'how to', 'namaz', 'wudu', 'islamic guides'],
      locale,
    },
  ];
  for (const c0 of GUIDE_CATS) {
    const c: any = localizeGuideCat(c0, locale);
    items.push({
      title: c.title + ' Guides',
      description: c.desc,
      category: 'learn',
      url: prefix + '/learn/' + c.slug + '/',
      tags: ['learn', 'guides', c.title.toLowerCase(), c.slug.replace(/-/g, ' ')],
      locale,
    });
  }
  for (const g0 of GUIDES) {
    const g: any = ['ur', 'hi', 'ar'].includes(locale) ? localizeGuide(g0, locale) : g0;
    items.push({
      title: g.title,
      description: g.intro,
      category: 'learn',
      url: prefix + '/learn/' + g.cat + '/' + g.slug + '/',
      tags: ['learn', 'guide', 'how to', g.title.toLowerCase(), ...(g.aliases || [])],
      locale,
    });
  }
  return items;
}

/* Phase 9 aggregator hubs (one compact doc each per locale; cards resolve
 * localized titles at render — the index carries hub chrome only). */
import { HALAL_UI, ADAB_UI, NEWMUSLIM_UI, ZAKAT_UI } from './site-ui-4';

export function phase9HubIndexItems(locale: string): IndexItem[] {
  const prefix = locale === 'en' ? '' : '/' + locale;
  const hubs = [
    { path: '/halal-haram/', ui: secUI(locale, HALAL_UI), tags: ['halal', 'haram', 'is it halal', 'halal haram', 'halal guide', 'halal food', 'riba', 'crypto halal', 'music halal'] },
    { path: '/adab/', ui: secUI(locale, ADAB_UI), tags: ['adab', 'akhlaq', 'manners', 'islamic manners', 'character', 'muslim manners', 'family duas'] },
    { path: '/new-muslim/', ui: secUI(locale, NEWMUSLIM_UI), tags: ['new muslim', 'revert', 'shahada', 'convert to islam', 'new muslim guide', 'how to pray beginner', 'wudu beginner'] },
    { path: '/zakat/', ui: secUI(locale, ZAKAT_UI), tags: ['zakat', 'zakah', 'zakat guide', 'zakat calculator', 'sadaqah', 'fitrana', 'fidyah'] },
  ];
  return hubs.map(({ path, ui, tags }) => ({
    title: ui.hubTitle,
    description: ui.hubDesc,
    category: 'learn',
    url: `${prefix}${path}`,
    tags,
    locale,
  }));
}

/* ------------------------------------------------------------------ */
/* Phase 5: consolidated builder + compact static payloads             */
/*                                                                     */
/* One builder (`buildSearchIndex`) feeds every search payload so the   */
/* EN + locale endpoints cannot drift. Payloads are compact arrays      */
/* (documented below) to keep the initial download small; the browser  */
/* builds token/posting structures in memory (see search-engine.js).    */
/* ------------------------------------------------------------------ */
import { getCollection } from 'astro:content';
import surahsMetaJson from '../data/surahs-meta.json';
import parasMetaJson from '../data/paras-meta.json';
import { TAFSIR } from '../data/tafsir';

export interface SearchDoc {
  /** Stable id (canonical URL). */
  id: string;
  type: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  tags?: string[];
  aliases?: string[];
  /** Canonical Quran ref for ayah docs (`S:V`). */
  reference?: string;
  /** Hub/landing pages (demoted within equal ranking tiers). */
  hub?: boolean;
  /** Item locale for mixed-locale indexes (EN fill-in badge). */
  docLocale?: string;
}

/** Verified famous-epithet aliases → ayah ref, with repo evidence.
 *  Only unambiguous single-verse mappings backed by an existing dua whose
 *  title/alias contains the epithet and whose source cites the verse. */
export const AYAH_ALIASES: Record<string, { ref: string; evidence: string }> = {
  'ayatul kursi': { ref: '2:255', evidence: 'dua:ayatul-kursi-salah' },
  'ayat al kursi': { ref: '2:255', evidence: 'dua:ayatul-kursi-salah' },
  'ayat ul kursi': { ref: '2:255', evidence: 'dua:ayatul-kursi-salah' },
};

/** Hub URLs (locale-agnostic path) demoted within equal ranking tiers. */
/** Hub URLs (locale-agnostic path) demoted within equal ranking tiers.
 *  Hadith collection/book hubs derive from the registry so future
 *  collections inherit the behavior with zero search changes. */
const HUB_URLS = new Set([
  '/tools/', '/duas/', '/kalimas/', '/meanings/', '/waqiat/', '/prophets/',
  '/quran/', '/hadees/', '/seerat/', '/learn/', '/history/', '/quiz/',
  '/surahs/', '/ramadan/', '/eid/', '/hajj/', '/umrah/', '/calendar/',
  '/names-of-allah/', '/names-muhammad/', '/sahaba/', '/women/',
  ...HADITH_COLLECTIONS.map((c) => collectionPath(c.slug)),
  ...HADITH_BOOKS.map((b) => {
    const coll = HADITH_COLLECTIONS.find((c) => c.id === b.collectionId)!;
    return bookPath(coll.slug, b.slug);
  }),
]);

const slugOfId = (id: string) => id.split('/').pop()!.replace(/\.mdx?$/, '');
const stripLocale = (url: string) => url.replace(/^\/(hi|ur|ar)(?=\/|$)/, '') || '/';

/** Consolidated document builder for every locale (articles + data). */
export async function buildSearchIndex(locale: string): Promise<SearchDoc[]> {
  const docs: SearchDoc[] = [];
  const push = (d: SearchDoc) => {
    if (!d.title || !d.url || !d.type) return;
    d.hub = HUB_URLS.has(stripLocale(d.url));
    docs.push(d);
  };
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const item = (it: IndexItem): SearchDoc => ({
    id: it.url, type: it.category, title: it.title, url: it.url,
    description: it.description, category: it.category, tags: it.tags,
  });
  for (const fn of [toolIndexItems, standaloneToolItems, staticPageItems, duaIndexItems, kalimaIndexItems, meaningIndexItems,
    waqiahIndexItems, prophetIndexItems, sahabaIndexItems, womenIndexItems, quizIndexItems,
    hadeesIndexItems, seerahIndexItems, guideIndexItems, historyIndexItems,
    namesIndexItems, topicsIndexItems, hadithCollectionIndexItems, phase9HubIndexItems]) {
    for (const it of fn(locale)) push(item(it));
  }
  for (const a of ayahIndexItems(locale)) {
    const m = /^(\d+):(\d+)$/.exec(a.tags.find((t) => /^\d+:\d+$/.test(t)) ?? '');
    push({ id: a.url, type: 'quran-ayah', title: a.title, url: a.url, description: a.description, category: a.category, tags: a.tags, reference: m ? `${m[1]}:${m[2]}` : undefined });
  }
  // Surah + para docs (moved here from the endpoints so all locales share logic).
  for (const s of surahsMetaJson as any[]) {
    push(tagSurah({
      id: `${prefix}/surahs/${s.slug}/`, type: 'surahs',
      title: `Surah ${s.name} (${s.englishName})`,
      description: `Surah ${s.num} — ${s.verseCount} verses, ${s.revelation === 'Mecca' ? 'Makki' : 'Madani'}. Read in Arabic with Urdu, English & Hindi meaning, transliteration and audio.${(TAFSIR as any)[s.num] ? ` ${(TAFSIR as any)[s.num].intro}` : ''}`,
      category: 'surahs',
      url: `${prefix}/surahs/${s.slug}/`,
      tags: ['quran', 'surah', 'juz', 'para', 'tafsir', s.name.toLowerCase(), s.englishName.toLowerCase(), s.arabicName, String(s.num), ...(((TAFSIR as any)[s.num]?.themes || []) as string[]).map((t: string) => t.toLowerCase())],
      locale,
    } as any) as SearchDoc);
  }
  for (const p of parasMetaJson as any[]) {
    push({
      id: `${prefix}/quran/${p.slug}/`, type: 'quran', title: `Quran Para ${p.num} (${p.name})`,
      description: `Para ${p.num} (${p.name}) — ${p.range}. Read in Arabic with Urdu, English & Hindi meaning, transliteration and audio.`,
      category: 'quran', url: `${prefix}/quran/${p.slug}/`,
      tags: ['quran', 'para', 'parah', 'juz', `para ${p.num}`, `juz ${p.num}`, p.name.toLowerCase(), String(p.num)],
    });
  }
  // Articles: native locale first, then EN fill-ins (same policy as before).
  const all = await getCollection('articles', ({ data }) => !data.draft && (locale === 'en' ? data.locale === 'en' : true));
  const withLocale = locale === 'en'
    ? all.filter((e) => e.data.locale === 'en')
    : (() => {
      const native = all.filter((e) => e.data.locale === locale);
      const seen = new Set(native.map((e) => slugOfId(e.id)));
      return [...native, ...all.filter((e) => e.data.locale === 'en' && !seen.has(slugOfId(e.id)))];
    })();
  for (const e of withLocale) {
    const slug = slugOfId(e.id);
    push({
      id: `/${e.data.category}/${slug}/`, type: e.data.category,
      title: e.data.title, url: e.data.locale === 'en' && locale !== 'en' ? `/${e.data.category}/${slug}/` : `${prefix}/${e.data.category}/${slug}/`,
      description: e.data.description, category: e.data.category, tags: e.data.tags, docLocale: e.data.locale,
    });
  }
  return docs;
}

/** Compact core payload: [title, url, catIdx, desc, tags, flags, docLocale].
 *  flags bit0 = hub. Ayah docs excluded (separate lazy chunk). */
export interface SearchCorePayload {
  v: 1;
  locale: string;
  cats: string[];
  docs: Array<[string, string, number, string, string[], number, string?]>;
  surahs: Array<[number, string, string, string, number, string[]]>;
  aliases: Record<string, string>;
}

/** Compact ayah payload: [ref, surahNum, ayahNum, title, url]. */
export interface SearchAyahPayload {
  v: 1;
  locale: string;
  docs: Array<[string, number, number, string, string]>;
}

export function toCorePayload(docs: SearchDoc[], locale: string): SearchCorePayload {
  const cats: string[] = [];
  const catIdx = (c: string) => {
    let i = cats.indexOf(c);
    if (i < 0) { cats.push(c); i = cats.length - 1; }
    return i;
  };
  const out: SearchCorePayload['docs'] = [];
  for (const d of docs) {
    if (d.type === 'quran-ayah') continue;
    out.push([d.title, d.url, catIdx(d.category || d.type), d.description || '', d.tags || [], d.hub ? 1 : 0, d.docLocale]);
  }
  return {
    v: 1, locale, cats, docs: out,
    surahs: (surahsMetaJson as any[]).map((s) => [s.num, s.slug, s.name, s.englishName, s.verseCount, SURAH_ALIASES[s.slug.replace(/^\d+-/, '')] || []]),
    aliases: Object.fromEntries(Object.entries(AYAH_ALIASES).map(([k, v]) => [k, v.ref])),
  };
}

export function toAyahPayload(docs: SearchDoc[], locale: string): SearchAyahPayload {
  const out: SearchAyahPayload['docs'] = [];
  for (const d of docs) {
    if (d.type !== 'quran-ayah' || !d.reference) continue;
    const [s, v] = d.reference.split(':').map(Number);
    out.push([d.reference, s, v, d.title, d.url]);
  }
  return { v: 1, locale, docs: out };
}
