/* Ramadan 2027 pack — single source of truth for Phase 1 seasonal content.
 * Dates are ASTRONOMICAL EXPECTATIONS (Umm al-Qura / tabular), not moon-sighting
 * announcements: Ramadan moves ±1 day by locality. Every consumer must show the
 * disclaimer. Amounts are Oct-2026 market INDICATIONS — users enter today's
 * local price in the calculators; nothing here is a fatwa.
 *
 * Ramadan 2027: first fast ~Mon 8 Feb 2027, last fast ~Tue 9 Mar 2027 (30 days),
 * Eid al-Fitr ~Wed 10 Mar 2027. Odd nights below assume a Feb-8 start; if the
 * moon shifts start by a day, odd nights shift with it (component recomputes).
 */

export interface RamadanCity {
  label: string;
  country: string;
  lat: number;
  lng: number;
  tz: string;
  method: 'karachi' | 'mwl' | 'isna';
}

export const RAMADAN_2027 = {
  hijriYear: 1448,
  // Month boundaries (daytime dates of fasting). Evening taraweeh starts prior evening.
  firstFast: '2027-02-08',
  lastFast: '2027-03-09',
  eidAlFitr: '2027-03-10',
  // First taraweeh evening, last taraweeh evening.
  firstTaraweehEvening: '2027-02-07',
  lastTaraweehEvening: '2027-03-08',
  // Odd nights of the last 10 (21,23,25,27,29) for a Feb-8 start.
  oddNights: [
    { ramadanDay: 21, gregorian: '2027-02-28', label: '21st night (eve of 28 Feb)' },
    { ramadanDay: 23, gregorian: '2027-03-02', label: '23rd night (eve of 2 Mar)' },
    { ramadanDay: 25, gregorian: '2027-03-04', label: '25th night (eve of 4 Mar)' },
    { ramadanDay: 27, gregorian: '2027-03-06', label: '27th night (eve of 6 Mar)' },
    { ramadanDay: 29, gregorian: '2027-03-08', label: '29th night (eve of 8 Mar)' },
  ],
  disclaimer:
    'Astronomical expectation — Ramadan, Eid and odd nights follow the sighted moon and can shift ±1 day by city. Confirm with your local mosque.',
} as const;

/* Indicative staple prices per kg (Oct 2026 market survey, rounded).
 * Fitrana/person ≈ 2.5 kg wheat (Hanafi wheat ≈ half-sa/1.6–2 kg also shown in tool).
 * Fidyah/day ≈ 1.5 kg staple OR one full meal — tool takes the meal cost directly.
 * ALWAYS verify at your market; the calculators take live input. */
export interface StaplePrice {
  currency: string;
  wheatPerKg: number;
  ricePerKg: number;
  note: string;
}

export const STAPLE_2027: StaplePrice[] = [
  { currency: 'INR', wheatPerKg: 35, ricePerKg: 60, note: 'India average retail' },
  { currency: 'PKR', wheatPerKg: 140, ricePerKg: 320, note: 'Pakistan average retail' },
  { currency: 'BDT', wheatPerKg: 65, ricePerKg: 75, note: 'Bangladesh average retail' },
  { currency: 'USD', wheatPerKg: 0.9, ricePerKg: 1.8, note: 'US average' },
  { currency: 'AED', wheatPerKg: 4.5, ricePerKg: 8, note: 'UAE average' },
  { currency: 'SAR', wheatPerKg: 4.0, ricePerKg: 7.5, note: 'Saudi average' },
  { currency: 'GBP', wheatPerKg: 1.1, ricePerKg: 2.2, note: 'UK average' },
];

export function fitranaEstimate(currency: string, staple: 'wheat' | 'rice' = 'wheat'): number | null {
  const row = STAPLE_2027.find((s) => s.currency === currency);
  if (!row) return null;
  return Math.round((staple === 'rice' ? row.ricePerKg : row.wheatPerKg) * 2.5 * 100) / 100;
}

export function fidyahDayEstimate(currency: string, staple: 'wheat' | 'rice' = 'wheat'): number | null {
  const row = STAPLE_2027.find((s) => s.currency === currency);
  if (!row) return null;
  return Math.round((staple === 'rice' ? row.ricePerKg : row.wheatPerKg) * 1.5 * 100) / 100;
}

/* Curated timetable cities — same coordinates as the prayer-times tool
 * (src/pages/tools/prayer-times.astro CITIES). Top 24 for the three audiences:
 * India Hindi/Urdu, PK/BD/Gulf, Global English. Client computes Sehri (Fajr)
 * and Iftar (Maghrib) per Ramadan date on-device — zero static-file explosion. */
export const RAMADAN_CITIES: RamadanCity[] = [
  { label: 'Delhi, IN', country: 'India', lat: 28.61, lng: 77.21, tz: 'Asia/Kolkata', method: 'karachi' },
  { label: 'Mumbai, IN', country: 'India', lat: 19.08, lng: 72.88, tz: 'Asia/Kolkata', method: 'karachi' },
  { label: 'Hyderabad (IN)', country: 'India', lat: 17.39, lng: 78.49, tz: 'Asia/Kolkata', method: 'karachi' },
  { label: 'Lucknow, IN', country: 'India', lat: 26.85, lng: 80.95, tz: 'Asia/Kolkata', method: 'karachi' },
  { label: 'Kolkata, IN', country: 'India', lat: 22.57, lng: 88.36, tz: 'Asia/Kolkata', method: 'karachi' },
  { label: 'Srinagar, IN', country: 'India', lat: 34.08, lng: 74.81, tz: 'Asia/Kolkata', method: 'karachi' },
  { label: 'Karachi, PK', country: 'Pakistan', lat: 24.86, lng: 67.01, tz: 'Asia/Karachi', method: 'karachi' },
  { label: 'Lahore, PK', country: 'Pakistan', lat: 31.55, lng: 74.35, tz: 'Asia/Karachi', method: 'karachi' },
  { label: 'Islamabad, PK', country: 'Pakistan', lat: 33.68, lng: 73.05, tz: 'Asia/Karachi', method: 'karachi' },
  { label: 'Dhaka, BD', country: 'Bangladesh', lat: 23.81, lng: 90.41, tz: 'Asia/Dhaka', method: 'karachi' },
  { label: 'Chittagong, BD', country: 'Bangladesh', lat: 22.36, lng: 91.78, tz: 'Asia/Dhaka', method: 'karachi' },
  { label: 'Dubai, AE', country: 'UAE', lat: 25.2, lng: 55.27, tz: 'Asia/Dubai', method: 'mwl' },
  { label: 'Riyadh, SA', country: 'Saudi Arabia', lat: 24.71, lng: 46.68, tz: 'Asia/Riyadh', method: 'mwl' },
  { label: 'Jeddah, SA', country: 'Saudi Arabia', lat: 21.49, lng: 39.19, tz: 'Asia/Riyadh', method: 'mwl' },
  { label: 'Doha, QA', country: 'Qatar', lat: 25.28, lng: 51.52, tz: 'Asia/Qatar', method: 'mwl' },
  { label: 'London, UK', country: 'UK', lat: 51.5, lng: -0.13, tz: 'Europe/London', method: 'mwl' },
  { label: 'Birmingham, UK', country: 'UK', lat: 52.48, lng: -1.89, tz: 'Europe/London', method: 'mwl' },
  { label: 'New York, US', country: 'USA', lat: 40.71, lng: -74.0, tz: 'America/New_York', method: 'isna' },
  { label: 'Chicago, US', country: 'USA', lat: 41.88, lng: -87.63, tz: 'America/Chicago', method: 'isna' },
  { label: 'Houston, US', country: 'USA', lat: 29.76, lng: -95.37, tz: 'America/Chicago', method: 'isna' },
  { label: 'Toronto, CA', country: 'Canada', lat: 43.65, lng: -79.38, tz: 'America/Toronto', method: 'isna' },
];
