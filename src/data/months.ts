/* Hikmah Noor — Islamic (Hijri) months dataset.
 * Canonical 12-month data driving month pages, prev/next navigation,
 * relationships, search indexing and metadata.
 *
 * Accuracy rules:
 * - Names/spellings match the repo's own calendar (IslamicCalendar MONTHS).
 * - Sacred months per Quran 9:36 (already cited in calendar-meta).
 * - Events mirror the repo's own calendar event table (IslamicCalendar EV)
 *   and link to existing targets only. Day numbers are Hijri month-days
 *   (lunar; Gregorian equivalents vary — never hard-coded here).
 */
export interface MonthEvent {
  /** Hijri day of month (null when spanning/unspecified). */
  d: number | null;
  /** Event key into MONTH_UI events (localized name/note live there). */
  key: string;
  /** Existing relationship target. */
  target: { type: 'guide' | 'seerah' | 'history'; slug: string };
}

export interface HijriMonth {
  slug: string;
  num: number;
  /** Repo-canonical transliteration. */
  name: string;
  arabic: string;
  /** One of the four sacred months (Quran 9:36). */
  sacred: boolean;
  events: MonthEvent[];
  /** Curated hub guides (must exist in guides.ts). Rendered only on hub months. */
  hub?: string[];
}

export const MONTHS: HijriMonth[] = [
  { slug: 'muharram', num: 1, name: 'Muharram', arabic: 'محرم', sacred: true,
    events: [
      { d: 1, key: 'new-year', target: { type: 'guide', slug: 'moon-sighting-hilal' } },
      { d: 9, key: 'tasua', target: { type: 'guide', slug: 'ashura-muharram-fasting' } },
      { d: 10, key: 'ashura', target: { type: 'guide', slug: 'ashura-muharram-fasting' } },
      { d: 10, key: 'karbala', target: { type: 'history', slug: 'karbala-61' } },
    ] },
  { slug: 'safar', num: 2, name: 'Safar', arabic: 'صفر', sacred: false, events: [] },
  { slug: 'rabi-al-awwal', num: 3, name: 'Rabi al-Awwal', arabic: 'ربيع الأول', sacred: false,
    events: [
      { d: 12, key: 'mawlid', target: { type: 'seerah', slug: 'birth-noble-lineage-year-of-elephant' } },
    ] },
  { slug: 'rabi-al-thani', num: 4, name: 'Rabi al-Thani', arabic: 'ربيع الثاني', sacred: false, events: [] },
  { slug: 'jumada-al-ula', num: 5, name: 'Jumada al-Ula', arabic: 'جمادى الأولى', sacred: false, events: [] },
  { slug: 'jumada-al-akhirah', num: 6, name: 'Jumada al-Akhirah', arabic: 'جمادى الآخرة', sacred: false, events: [] },
  { slug: 'rajab', num: 7, name: 'Rajab', arabic: 'رجب', sacred: true,
    events: [
      { d: 27, key: 'miraj', target: { type: 'guide', slug: 'rajab-virtues' } },
      { d: 27, key: 'miraj-story', target: { type: 'seerah', slug: 'isra-miraj-aqabah-pledges' } },
    ] },
  { slug: 'shaban', num: 8, name: 'Shaban', arabic: 'شعبان', sacred: false,
    events: [
      { d: 15, key: 'barat', target: { type: 'guide', slug: 'shaban-shab-e-barat' } },
    ] },
  { slug: 'ramadan', num: 9, name: 'Ramadan', arabic: 'رمضان', sacred: false,
    hub: ['roza-fasting', 'laylatul-qadr', 'taraweeh-night-prayer'],
    events: [
      { d: 1, key: 'ramadan-begins', target: { type: 'guide', slug: 'roza-fasting' } },
      { d: null, key: 'qadr-nights', target: { type: 'guide', slug: 'laylatul-qadr' } },
    ] },
  { slug: 'shawwal', num: 10, name: 'Shawwal', arabic: 'شوال', sacred: false,
    hub: ['shawwal-six-fasts', 'eid-day-sunnahs', 'eid-prayer-method'],
    events: [
      { d: 1, key: 'eid-fitr', target: { type: 'guide', slug: 'eid-prayer-method' } },
      { d: null, key: 'six-fasts', target: { type: 'guide', slug: 'shawwal-six-fasts' } },
    ] },
  { slug: 'dhul-qadah', num: 11, name: 'Dhul-Qadah', arabic: 'ذو القعدة', sacred: true, events: [] },
  { slug: 'dhul-hijjah', num: 12, name: 'Dhul-Hijjah', arabic: 'ذو الحجة', sacred: true,
    hub: ['hajj-day-by-day', 'mina-arafah-muzdalifah', 'qurbani-rules'],
    events: [
      { d: 8, key: 'tarwiyah', target: { type: 'guide', slug: 'hajj-day-by-day' } },
      { d: 9, key: 'arafah', target: { type: 'guide', slug: 'mina-arafah-muzdalifah' } },
      { d: 10, key: 'eid-adha', target: { type: 'guide', slug: 'qurbani-rules' } },
      { d: null, key: 'tashriq', target: { type: 'guide', slug: 'tashriq-days-takbeer' } },
    ] },
];

const MONTH_BY_SLUG = new Map(MONTHS.map((m) => [m.slug, m]));
const MONTH_BY_NUM = new Map(MONTHS.map((m) => [m.num, m]));

export function monthBySlug(slug: string): HijriMonth | undefined {
  return MONTH_BY_SLUG.get(slug);
}
export function prevMonth(num: number): HijriMonth {
  return MONTH_BY_NUM.get(num === 1 ? 12 : num - 1)!;
}
export function nextMonth(num: number): HijriMonth {
  return MONTH_BY_NUM.get(num === 12 ? 1 : num + 1)!;
}
