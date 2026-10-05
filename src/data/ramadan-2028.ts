/* Ramadan 2028 pack — single source of truth for seasonal content.
 * Dates are ASTRONOMICAL EXPECTATIONS (Umm al-Qura / tabular), not moon-sighting
 * announcements: Ramadan moves ±1 day by locality. Every consumer must show the
 * disclaimer. Amounts: reuse Oct-2026 indicative staples via ramadan-2027 module
 * (calculators take live input; nothing here is a fatwa).
 *
 * Ramadan 2028: first fast ~Fri 28 Jan 2028, last fast ~Fri 25 Feb 2028 (29 days),
 * Eid al-Fitr ~Sat 26 Feb 2028. Odd nights below assume a Jan-28 start; if the
 * moon shifts start by a day, odd nights shift with it (component recomputes).
 */

export const RAMADAN_2028 = {
  hijriYear: 1449,
  // Month boundaries (daytime dates of fasting). Evening taraweeh starts prior evening.
  firstFast: '2028-01-28',
  lastFast: '2028-02-25',
  fasts: 29,
  eidAlFitr: '2028-02-26',
  // First taraweeh evening, last taraweeh evening.
  firstTaraweehEvening: '2028-01-27',
  lastTaraweehEvening: '2028-02-24',
  // Odd nights of the last 10 (21,23,25,27,29) for a Jan-28 start.
  oddNights: [
    { ramadanDay: 21, gregorian: '2028-02-17', label: '21st night (eve of 17 Feb)' },
    { ramadanDay: 23, gregorian: '2028-02-19', label: '23rd night (eve of 19 Feb)' },
    { ramadanDay: 25, gregorian: '2028-02-21', label: '25th night (eve of 21 Feb)' },
    { ramadanDay: 27, gregorian: '2028-02-23', label: '27th night (eve of 23 Feb)' },
    { ramadanDay: 29, gregorian: '2028-02-25', label: '29th night (eve of 25 Feb)' },
  ],
  disclaimer:
    'Astronomical expectation — Ramadan, Eid and odd nights follow the sighted moon and can shift ±1 day by city. Confirm with your local mosque.',
} as const;
