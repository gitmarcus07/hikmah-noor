// Pure habit math — no DOM, no Node APIs. Safe to import in
// Pages Functions, Astro components, and plain `node` tests.
// Dates are YYYY-MM-DD strings in UTC.

export function todayUTC(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function addDaysUTC(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Quranly rule: +1 per consecutive active day, one-day grace
// (a single missed day keeps the streak), two consecutive
// misses reset to 0. `active` is an iterable of YYYY-MM-DD.
export function computeStreak(active, today = todayUTC()) {
  const set = new Set(active);
  // Grace: if today is inactive, the run may still end yesterday.
  const end = set.has(today) ? today : addDaysUTC(today, -1);
  if (!set.has(end)) return 0;
  let streak = 0;
  let cursor = end;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDaysUTC(cursor, -1);
  }
  return streak;
}

// Estimate Arabic letters for hasanat: strip everything outside
// the Arabic blocks plus kashida/diacritics handling — count
// base letters only (U+0621–U+064A, excluding harakat U+064B–U+0652
// and tatweel U+0640 which carry no extra reward weight here).
// Reward basis: ~10 hasanat per letter (hadith: a good deed ×10).
export function countArabicLetters(text) {
  if (!text) return 0;
  let n = 0;
  for (const ch of String(text)) {
    const c = ch.codePointAt(0);
    if (c >= 0x0621 && c <= 0x064a && ch !== 'ـ') n += 1;
  }
  return n;
}

export function estimateHasanat(arabicText) {
  return countArabicLetters(arabicText) * 10;
}

// Madani mushaf: 6236 verses / 604 pages ≈ 10.3 verses per page.
export const VERSES_PER_PAGE = 6236 / 604;
export function estimatePages(verses) {
  return Math.round(((verses || 0) / VERSES_PER_PAGE) * 10) / 10;
}

// Deterministic Ayah-of-the-Day: day index → global verse ordinal.
// Needs totalVerses (6236) and a resolver ordinal→{surah,verse}.
export function ayahOfDayIndex(dateStr = todayUTC(), totalVerses = 6236) {
  const dayNum = Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / 864e5);
  return dayNum % totalVerses;
}

export const CHALLENGES = [
  { slug: 'friday-kahf', title: 'Friday Challenge', subtitle: 'Recite Surah Al-Kahf (110 verses)', target: 110, surah: 18 },
  { slug: 'meaning-30day', title: 'The Meaning Challenge', subtitle: 'Finish the Quran in a language you understand in 30 days', target: 6236 },
  { slug: 'nightly', title: 'Nightly Recitation', subtitle: 'Read every night before sleep', target: 110 },
  { slug: 'ramadan-khatm', title: 'Ramadan Challenge', subtitle: 'Complete a full khatm (30 Juz)', target: 30 },
];
