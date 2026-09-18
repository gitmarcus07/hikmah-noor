/* Hikmah Noor — Islamic finance calculation library (pure functions, no DOM).
 * Single source of truth, served statically at /finance/calc.js and loaded
 * by tool pages via dynamic import(). Also importable in Node for tests.
 * Every function returns { amount, currency, unit, methodology, assumptions[],
 * breakdown[], warnings[], evidence[], eligible } and NEVER presents itself
 * as a fatwa — callers must render the disclaimer.
 */

export const CURRENCIES = {
  INR: { symbol: '₹', label: 'Indian Rupee (INR)' },
  USD: { symbol: '$', label: 'US Dollar (USD)' },
  GBP: { symbol: '£', label: 'British Pound (GBP)' },
  EUR: { symbol: '€', label: 'Euro (EUR)' },
  AED: { symbol: 'AED ', label: 'UAE Dirham (AED)' },
  SAR: { symbol: '﷼ ', label: 'Saudi Riyal (SAR)' },
  PKR: { symbol: '₨', label: 'Pakistani Rupee (PKR)' },
  BDT: { symbol: '৳', label: 'Bangladeshi Taka (BDT)' },
  CAD: { symbol: 'CA$', label: 'Canadian Dollar (CAD)' },
  AUD: { symbol: 'A$', label: 'Australian Dollar (AUD)' },
};

export const GOLD_NISAB_GRAMS = 87.48;
export const SILVER_NISAB_GRAMS = 612.36;
export const AGRI_NISAB_KG = 653; // ~5 wasq; scholars differ — surfaced as warning
export const ZAKAT_RATE = 0.025;

const PURITY = { '24k': 1, '22k': 0.917, '21k': 0.875, '18k': 0.75 };

export function fmt(amount, currency) {
  const sym = (CURRENCIES[currency] || {}).symbol || (currency ? currency + ' ' : '');
  const n = Number(amount) || 0;
  return sym + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const num = (v) => (Number(v) >= 0 ? Number(v) : 0);
const row = (label, value) => ({ label, value });
const EDU_NOTE = 'This calculator provides an educational estimate based on the selected methodology and the information you entered. Islamic rulings can vary according to circumstances and school of jurisprudence. For complex cases, consult a qualified Islamic scholar.';

function base(methodology, assumptions) {
  return { methodology, assumptions, breakdown: [], warnings: [], evidence: [], eligible: false, amount: 0 };
}

/* ---------------- Zakat (general, multi-asset) ---------------- */
export function calculateZakat(input = {}) {
  const {
    methodology = 'general', currency = 'INR',
    cash = 0, goldValue = 0, silverValue = 0, investments = 0, businessNet = 0,
    deductions = 0, nisabBasis = 'silver', goldPricePerGram = 0, silverPricePerGram = 0,
    nisabValue = 0, hawlMet = 'yes',
  } = input;
  const r = base(methodology, [
    `Cash, gold, silver, investments and net business assets summed at face value.`,
    `Investments counted at the zakatable value you entered (treatment can vary by asset and methodology).`,
  ]);
  const gross = num(cash) + num(goldValue) + num(silverValue) + num(investments) + num(businessNet);
  const ded = num(deductions);
  const net = Math.max(0, gross - ded);
  let nisab = num(nisabValue);
  if (!nisab) {
    if (nisabBasis === 'gold' && num(goldPricePerGram) > 0) nisab = GOLD_NISAB_GRAMS * num(goldPricePerGram);
    if (nisabBasis === 'silver' && num(silverPricePerGram) > 0) nisab = SILVER_NISAB_GRAMS * num(silverPricePerGram);
  }
  r.breakdown = [
    row('Cash & savings', fmt(num(cash), currency)),
    row('Gold', fmt(num(goldValue), currency)),
    row('Silver', fmt(num(silverValue), currency)),
    row('Investments (zakatable portion)', fmt(num(investments), currency)),
    row('Business (net)', fmt(num(businessNet), currency)),
    row('Eligible deductions', '− ' + fmt(ded, currency)),
    row('Net zakatable wealth', fmt(net, currency)),
    row(`Nisab (${nisabBasis === 'gold' ? 'gold: 87.48g' : 'silver: 612.36g'})`, nisab > 0 ? fmt(nisab, currency) : 'not provided'),
    row('Hawl (one lunar year)', hawlMet === 'yes' ? 'Met' : hawlMet === 'no' ? 'Not met' : 'Unsure'),
    row('Applicable rate', '2.5%'),
  ];
  if (!nisab) r.warnings.push('No nisab value could be determined — enter a nisab value or a gold/silver price so eligibility can be checked.');
  if (hawlMet === 'no') r.warnings.push('Hawl (one lunar year of possession) is not met, so no zakat is due yet on this wealth.');
  if (hawlMet === 'unsure') r.warnings.push('If the wealth has not been held for one lunar year, zakat may not be due yet — consult a scholar.');
  if (nisabBasis === 'silver') r.warnings.push('Silver nisab is lower, so more people qualify. Some scholars use the gold nisab for monetary wealth — both views are presented in Evidence & Methodology.');
  if (num(investments) > 0) r.warnings.push('Investment zakat treatment varies (trading vs long-term holdings, funds, crypto). The figure uses the zakatable value you entered.');
  r.evidence = [
    "Qur'an 9:60 — the eight categories eligible to receive zakat.",
    "Qur'an 2:267 — give zakat from the good things earned.",
    'Zakat on monetary wealth at 2.5% after nisab and hawl is the position of the four Sunni schools (details differ).',
  ];
  r.eligible = hawlMet === 'yes' && nisab > 0 && net >= nisab;
  r.amount = r.eligible ? net * ZAKAT_RATE : 0;
  r.currency = currency;
  r.disclaimer = EDU_NOTE;
  if (!r.eligible && hawlMet === 'yes' && nisab > 0 && net < nisab) r.warnings.push('Net wealth is below nisab, so no zakat is due.');
  return r;
}

/* ---------------- Gold ---------------- */
export function calculateGoldZakat(input = {}) {
  const { methodology = 'general', currency = 'INR', weightGram = 0, purity = '24k', pricePerGram = 0, valueDirect = 0, personalUse = 'no', hawlMet = 'yes' } = input;
  const r = base(methodology, [`Purity factors: 24k=100%, 22k≈91.7%, 21k=87.5%, 18k=75%.`, `Nisab for gold is 87.48 grams of pure gold.`]);
  const pure = num(weightGram) * (PURITY[purity] ?? 1);
  const value = num(valueDirect) > 0 ? num(valueDirect) : pure * num(pricePerGram);
  r.breakdown = [
    row('Gold weight entered', `${num(weightGram)} g (${purity})`),
    row('Pure-gold equivalent', `${pure.toFixed(2)} g`),
    row('Gold value', fmt(value, currency)),
    row('Nisab (87.48 g pure)', num(pricePerGram) > 0 ? fmt(GOLD_NISAB_GRAMS * num(pricePerGram), currency) : '87.48 g (enter price for value)'),
    row('Hawl', hawlMet === 'yes' ? 'Met' : 'Not met / unsure'),
    row('Applicable rate', '2.5%'),
  ];
  if (personalUse === 'yes') r.warnings.push('Personal-use gold: the Hanafi school generally requires zakat on it; the majority exempts personal-use gold and silver. The estimate below assumes it is zakatable — see Evidence & Methodology.');
  if (num(valueDirect) > 0) r.warnings.push('You entered value directly, so purity/weight were used only for the nisab-weight check.');
  r.evidence = [
    'Gold nisab of 20 mithqal (≈87.48 g) is established in the hadith literature (reported in Abu Dawud and others).',
    'Personal-use gold is a known area of scholarly difference (Hanafi vs majority).',
  ];
  const eligibleByWeight = pure >= GOLD_NISAB_GRAMS;
  r.eligible = hawlMet === 'yes' && value > 0 && (num(valueDirect) > 0 ? true : eligibleByWeight);
  if (!eligibleByWeight && num(valueDirect) === 0) r.warnings.push('Weight is below the 87.48 g nisab, so no zakat is due on this gold.');
  r.amount = r.eligible ? value * ZAKAT_RATE : 0;
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Silver ---------------- */
export function calculateSilverZakat(input = {}) {
  const { methodology = 'general', currency = 'INR', weightGram = 0, pricePerGram = 0, valueDirect = 0, personalUse = 'no', hawlMet = 'yes' } = input;
  const r = base(methodology, ['Nisab for silver is 612.36 grams.']);
  const value = num(valueDirect) > 0 ? num(valueDirect) : num(weightGram) * num(pricePerGram);
  r.breakdown = [
    row('Silver weight entered', `${num(weightGram)} g`),
    row('Silver value', fmt(value, currency)),
    row('Nisab (612.36 g)', num(pricePerGram) > 0 ? fmt(SILVER_NISAB_GRAMS * num(pricePerGram), currency) : '612.36 g (enter price for value)'),
    row('Hawl', hawlMet === 'yes' ? 'Met' : 'Not met / unsure'),
    row('Applicable rate', '2.5%'),
  ];
  if (personalUse === 'yes') r.warnings.push('Personal-use silver: Hanafi scholars generally require zakat; the majority exempts personal-use items. The estimate assumes it is zakatable.');
  r.evidence = [
    'Silver nisab of 200 dirhams (≈612.36 g) is established in the hadith literature.',
    'Many scholars note the silver nisab benefits the poor because its value is lower than gold.',
  ];
  const eligibleByWeight = num(weightGram) >= SILVER_NISAB_GRAMS;
  r.eligible = hawlMet === 'yes' && value > 0 && (num(valueDirect) > 0 ? true : eligibleByWeight);
  if (!eligibleByWeight && num(valueDirect) === 0) r.warnings.push('Weight is below the 612.36 g nisab, so no zakat is due on this silver.');
  r.amount = r.eligible ? value * ZAKAT_RATE : 0;
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Cash & savings ---------------- */
export function calculateCashZakat(input = {}) {
  const { methodology = 'general', currency = 'INR', cashInHand = 0, bankAccounts = 0, savings = 0, forex = 0, nisabBasis = 'silver', goldPricePerGram = 0, silverPricePerGram = 0, nisabValue = 0, hawlMet = 'yes' } = input;
  const total = num(cashInHand) + num(bankAccounts) + num(savings) + num(forex);
  const r = base(methodology, ['All cash-like holdings summed at face value; foreign currency converted by you to the selected currency.']);
  let nisab = num(nisabValue);
  if (!nisab) {
    if (nisabBasis === 'gold' && num(goldPricePerGram) > 0) nisab = GOLD_NISAB_GRAMS * num(goldPricePerGram);
    if (nisabBasis === 'silver' && num(silverPricePerGram) > 0) nisab = SILVER_NISAB_GRAMS * num(silverPricePerGram);
  }
  r.breakdown = [
    row('Cash in hand', fmt(num(cashInHand), currency)),
    row('Bank accounts', fmt(num(bankAccounts), currency)),
    row('Savings', fmt(num(savings), currency)),
    row('Foreign currency (converted)', fmt(num(forex), currency)),
    row('Total cash wealth', fmt(total, currency)),
    row(`Nisab (${nisabBasis})`, nisab > 0 ? fmt(nisab, currency) : 'not provided'),
    row('Hawl', hawlMet === 'yes' ? 'Met' : 'Not met / unsure'),
    row('Applicable rate', '2.5%'),
  ];
  if (!nisab) r.warnings.push('Enter a nisab value or metal price so eligibility can be checked.');
  if (nisabBasis === 'silver') r.warnings.push('Scholars differ on whether monetary wealth follows the gold or silver nisab — see Evidence & Methodology.');
  if (hawlMet !== 'yes') r.warnings.push('Zakat on cash requires one lunar year of possession at/above nisab.');
  r.evidence = ["Qur'an 9:103 — take charity from their wealth to purify them.", 'Cash zakat by analogy to gold/silver at 2.5% is the standard contemporary ruling.'];
  r.eligible = hawlMet === 'yes' && nisab > 0 && total >= nisab;
  if (!r.eligible && hawlMet === 'yes' && nisab > 0) r.warnings.push('Total is below nisab, so no zakat is due.');
  r.amount = r.eligible ? total * ZAKAT_RATE : 0;
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Business ---------------- */
export function calculateBusinessZakat(input = {}) {
  const { methodology = 'general', currency = 'INR', cash = 0, inventory = 0, receivables = 0, otherAssets = 0, liabilities = 0, nisabValue = 0, hawlMet = 'yes' } = input;
  const r = base(methodology, ['Only zakatable current assets counted (cash, inventory at market value, strong receivables). Fixed assets, machinery and premises are excluded.', 'Deduct short-term business liabilities.']);
  const gross = num(cash) + num(inventory) + num(receivables) + num(otherAssets);
  const net = Math.max(0, gross - num(liabilities));
  const nisab = num(nisabValue);
  r.breakdown = [
    row('Business cash', fmt(num(cash), currency)),
    row('Inventory (market value)', fmt(num(inventory), currency)),
    row('Receivables (recoverable)', fmt(num(receivables), currency)),
    row('Other zakatable assets', fmt(num(otherAssets), currency)),
    row('Relevant liabilities', '− ' + fmt(num(liabilities), currency)),
    row('Net zakatable business wealth', fmt(net, currency)),
    row('Nisab', nisab > 0 ? fmt(nisab, currency) : 'not provided (use silver/gold nisab value)'),
    row('Applicable rate', '2.5%'),
  ];
  if (!nisab) r.warnings.push('Enter your local nisab value (e.g. silver-nisab value) to check eligibility.');
  if (hawlMet !== 'yes') r.warnings.push('Business zakat is assessed on the lunar-year date, not per transaction.');
  r.evidence = ["Qur'an 2:267 — spend from the good things earned (basis for trade-goods zakat).", 'Trade-goods zakat at 2.5% of net current assets is the position of the four schools.'];
  r.eligible = hawlMet === 'yes' && nisab > 0 && net >= nisab;
  if (!r.eligible && nisab > 0 && hawlMet === 'yes') r.warnings.push('Net business wealth is below nisab, so no zakat is due.');
  r.amount = r.eligible ? net * ZAKAT_RATE : 0;
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Investments ---------------- */
export function calculateInvestmentZakat(input = {}) {
  const { methodology = 'general', currency = 'INR', purpose = 'mixed', stocks = 0, funds = 0, crypto = 0, other = 0 } = input;
  const r = base(methodology, ['Uses the zakatable values you entered per asset class.', 'Purpose matters: actively traded holdings are typically zakated at market value; long-term holdings have several methodologies.']);
  const total = num(stocks) + num(funds) + num(crypto) + num(other);
  r.breakdown = [
    row('Stocks (zakatable value)', fmt(num(stocks), currency)),
    row('Funds (zakatable value)', fmt(num(funds), currency)),
    row('Cryptocurrency', fmt(num(crypto), currency)),
    row('Other investments', fmt(num(other), currency)),
    row('Total entered', fmt(total, currency)),
    row('Indicative rate', '2.5% (where applicable)'),
  ];
  r.warnings.push('No single ruling covers every investment. Scholars differ on stocks (exclude non-zakatable company assets?), funds, and crypto — this tool does not decide permissibility or method for you.');
  if (purpose === 'trading') r.warnings.push('Actively traded holdings: most methodologies zakat the full market value annually.');
  if (purpose === 'longterm') r.warnings.push('Long-term holdings: some methodologies exclude fixed/non-liquid company assets — a scholar or detailed statement review may be needed.');
  r.evidence = ['Investment zakat is derived by analogy (qiyas) to trade goods and cash; methods differ among contemporary scholars — no single Qur\'anic verse fixes stock zakat.'];
  r.eligible = total > 0;
  r.amount = total * ZAKAT_RATE;
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Agriculture ---------------- */
export function calculateAgriculturalZakat(input = {}) {
  const { methodology = 'general', crop = 'grains', harvestKg = 0, irrigation = 'natural', pricePerKg = 0, currency = 'INR' } = input;
  const r = base(methodology, [`Threshold reference: about 5 wasq (≈${AGRI_NISAB_KG} kg) — scholars differ on exact weight and on which crops are zakatable.`, 'No hawl: due at harvest.']);
  const rate = irrigation === 'natural' ? 0.10 : irrigation === 'artificial' ? 0.05 : 0.075;
  const h = num(harvestKg);
  const dueKg = h * rate;
  const value = dueKg * num(pricePerKg);
  r.breakdown = [
    row('Crop type', crop),
    row('Total harvest', `${h.toLocaleString('en-US')} kg`),
    row('Irrigation', irrigation === 'natural' ? 'Natural (rain/river) → 10%' : irrigation === 'artificial' ? 'Artificial (wells/pumps) → 5%' : 'Mixed → 7.5%'),
    row(`Threshold (≈${AGRI_NISAB_KG} kg)`, h >= AGRI_NISAB_KG ? 'Met' : 'Below — see warning'),
    row('Zakat due (produce)', `${dueKg.toFixed(2)} kg`),
  ];
  if (num(pricePerKg) > 0) r.breakdown.push(row('Estimated value', fmt(value, currency)));
  if (h < AGRI_NISAB_KG) r.warnings.push(`Harvest is below the commonly cited 5-wasq threshold (≈${AGRI_NISAB_KG} kg). Many scholars require no zakat below it; others differ — see Evidence & Methodology.`);
  r.warnings.push('Crop scope differs: some schools limit zakat to staple storable crops; others include all cultivated produce.');
  r.evidence = ["Qur'an 6:141 — give its due on harvest day.", "Hadith: 'On what is watered by rain, a tenth; on what is watered by wells, half a tenth' (reported in Sahih al-Bukhari).", 'The five-wasq threshold is reported in Sahih Muslim.'];
  r.eligible = h >= AGRI_NISAB_KG;
  r.amount = r.eligible ? dueKg : 0;
  r.unit = 'kg of produce';
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Livestock ---------------- */
const SHEEP_SCHEDULE = [[40, 120, '1 sheep'], [121, 200, '2 sheep'], [201, 399, '3 sheep']];
export function sheepDue(n) {
  if (n < 40) return null;
  for (const [a, b, t] of SHEEP_SCHEDULE) if (n >= a && n <= b) return t;
  const extra = Math.floor((n - 400) / 100);
  return `${3 + extra + 1} sheep (3 for the first 399, then 1 per 100)`;
}
export function cattleDue(n) {
  if (n < 30) return null;
  if (n <= 39) return "1 tabi' (one-year-old calf)";
  if (n <= 59) return '1 musinnah (two-year-old cow)';
  if (n <= 69) return "2 tabi'";
  if (n <= 79) return "1 tabi' + 1 musinnah";
  if (n <= 89) return '2 musinnah';
  if (n <= 99) return "3 tabi'";
  if (n <= 109) return "2 tabi' + 1 musinnah";
  if (n <= 119) return "2 musinnah + 1 tabi'";
  if (n <= 129) return "3 musinnah (or 4 tabi')";
  // 130+: every 30 -> tabi', every 40 -> musinnah (standard continuation)
  let best = null;
  for (let b = 0; b * 40 <= n; b++) {
    const rem = n - b * 40;
    if (rem % 30 === 0) best = { a: rem / 30, b };
  }
  if (best) {
    const parts = [];
    if (best.a) parts.push(`${best.a} tabi'`);
    if (best.b) parts.push(`${best.b} musinnah`);
    return parts.join(' + ');
  }
  return 'no exact classical combination — consult a scholar (remainder rules differ)';
}
export function camelDue(n) {
  if (n < 5) return null;
  if (n <= 9) return '1 sheep/goat';
  if (n <= 14) return '2 sheep/goats';
  if (n <= 19) return '3 sheep/goats';
  if (n <= 24) return '4 sheep/goats';
  if (n <= 35) return '1 bint makhad (one-year-old she-camel)';
  if (n <= 45) return '1 bint labun (two-year-old she-camel)';
  if (n <= 60) return '1 hiqqah (three-year-old she-camel)';
  if (n <= 75) return "1 jadha'ah (four-year-old she-camel)";
  if (n <= 90) return '2 bint labun';
  if (n <= 120) return '2 hiqqah';
  let best = null;
  for (let h = 0; h * 50 <= n; h++) {
    const rem = n - h * 50;
    if (rem % 40 === 0) best = { l: rem / 40, h };
  }
  if (best && (best.l || best.h)) {
    const parts = [];
    if (best.l) parts.push(`${best.l} bint labun (per 40)`);
    if (best.h) parts.push(`${best.h} hiqqah (per 50)`);
    return parts.join(' + ');
  }
  return 'no exact classical combination — consult a scholar';
}
export function calculateLivestockZakat(input = {}) {
  const { methodology = 'general', animal = 'sheep', count = 0 } = input;
  const r = base(methodology, ['Classical head-count schedules (not a flat percentage).', 'Assumes grazing (sa\'imah) livestock held a full lunar year — stall-fed/farmed animals are treated differently by many scholars.']);
  const n = Math.floor(num(count));
  const due = animal === 'sheep' ? sheepDue(n) : animal === 'cattle' ? cattleDue(n) : camelDue(n);
  const names = { sheep: 'Sheep / goats', cattle: 'Cattle (cows, buffalo)', camel: 'Camels' };
  r.breakdown = [row('Animal', names[animal] || animal), row('Head count', String(n)), row('Zakat due', due || 'None — below minimum threshold')];
  if (!due) r.warnings.push('Below the minimum head-count (sheep 40, cattle 30, camels 5), so no zakat is due.');
  if (n > 0 && !due) r.eligible = false; else r.eligible = !!due;
  r.warnings.push('Only grazing livestock kept for growth/milk/breeding fall under these schedules in the classical manuals; trade livestock is zakated as business goods.');
  r.evidence = ['Thresholds of five camels, thirty cattle and forty sheep are established in the hadith literature (the camel schedule of Abu Bakr, reported in Sahih al-Bukhari).', 'Above-120 camel/cattle divisions follow the classical per-40 / per-50 and per-30 / per-40 rules.'];
  r.amount = 0; r.unit = 'see schedule'; r.disclaimer = EDU_NOTE;
  r.dueText = due;
  return r;
}

/* ---------------- Zakat al-Fitr ---------------- */
export function calculateZakatAlFitr(input = {}) {
  const { methodology = 'general', currency = 'INR', adults = 0, children = 0, staple = 'wheat', kgPerPerson = 2.5, pricePerKg = 0, payCash = 'unsure' } = input;
  const r = base(methodology, ['One sa\' per person — commonly estimated around 2.5–3 kg; exact weight differs by school and staple (adjust the per-person figure).', 'Due before the Eid prayer; may be given a day or two earlier.']);
  const persons = Math.floor(num(adults)) + Math.floor(num(children));
  const totalKg = persons * num(kgPerPerson);
  const value = totalKg * num(pricePerKg);
  r.breakdown = [
    row('Adults', String(Math.floor(num(adults)))),
    row('Children / dependents', String(Math.floor(num(children)))),
    row('Total persons', String(persons)),
    row('Staple food', staple),
    row('Per person', `${num(kgPerPerson)} kg`),
    row('Total quantity', `${totalKg.toFixed(2)} kg`),
  ];
  if (num(pricePerKg) > 0) r.breakdown.push(row('Estimated monetary value', fmt(value, currency)));
  if (payCash === 'yes') r.warnings.push('Cash payment: permitted by Hanafi scholars, while the majority prefer giving food itself. If you pay cash, use the local staple-food value.');
  if (payCash === 'no') r.warnings.push('Giving food itself satisfies all schools — the safest option where food distribution is possible.');
  r.evidence = ["Hadith of Ibn 'Umar: one sa' of dates or barley per person, due before Eid prayer (reported in Sahih al-Bukhari and Sahih Muslim).", 'Cash-vs-food is a known Hanafi vs majority difference.'];
  r.eligible = persons > 0;
  r.amount = num(pricePerKg) > 0 ? value : totalKg;
  r.unit = num(pricePerKg) > 0 ? currency : 'kg';
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Fidyah ---------------- */
export function calculateFidyah(input = {}) {
  const { methodology = 'general', currency = 'INR', missedFasts = 0, reason = 'chronic', dailyAmount = 0 } = input;
  const r = base(methodology, ['Fidyah = feeding one needy person per missed fast (about 1.5–2 kg of staple food or one full meal — set the daily value to your local cost).']);
  const n = Math.floor(num(missedFasts));
  const fidyahReasons = ['chronic', 'elderly'];
  const qadaReasons = ['travel', 'temporary', 'pregnancy'];
  r.breakdown = [row('Missed fasts', String(n)), row('Circumstance', reason), row('Daily feeding value', fmt(num(dailyAmount), currency))];
  if (fidyahReasons.includes(reason)) {
    r.breakdown.push(row('Ruling path', 'Fidyah (no qada reasonably possible)'));
    r.breakdown.push(row('People to feed', String(n)));
    r.breakdown.push(row('Total estimated fidyah', fmt(n * num(dailyAmount), currency)));
    r.eligible = n > 0;
    r.amount = n * num(dailyAmount);
  } else if (qadaReasons.includes(reason)) {
    r.warnings.push('Your situation normally requires making up the fasts (qada), NOT fidyah. Fidyah applies to those who cannot fast at all (chronic illness, old age). Do not pay fidyah instead of qada without scholarly advice.');
    r.breakdown.push(row('Ruling path', 'Qada — make up the fasts'));
    r.breakdown.push(row('Fasts to make up', String(n)));
    r.eligible = false; r.amount = 0;
  } else {
    r.warnings.push('Deliberately missed fasts without excuse require repentance and qada; scholars differ on additional expiation. Consult a qualified scholar — this tool does not issue a ruling for your case.');
    r.eligible = false; r.amount = 0;
  }
  r.evidence = ["Qur'an 2:184 — fidyah (feeding a needy person) for those who can fast only with great hardship.", 'Classical jurisprudence distinguishes permanent inability (fidyah) from temporary excuses (qada).'];
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Kaffarah: broken oath (5:89) ---------------- */
export function calculateKaffarahOath(input = {}) {
  const { methodology = 'general', currency = 'INR', ability = 'feed', option = 'feed', mealCost = 0, clothingCost = 0 } = input;
  const r = base(methodology, ["Order matters: feed 10 needy → or clothe 10 → or free a slave; fasting 3 days only if unable (Qur'an 5:89).", 'An oath counts only if sworn by Allah (or His names/attributes) about a future matter — past/false claims differ.']);
  if (ability === 'unable') {
    r.breakdown = [row('Situation', 'Unable to feed or clothe'), row('Expiation', 'Fast 3 days (consecutively per some schools)'), row('Cash due', fmt(0, currency))];
    r.warnings.push('Fasting is only valid here if genuinely unable to feed/clothe — skipping to fasting while able is not permitted by the verse\'s order.');
    r.eligible = true; r.amount = 0;
  } else {
    const per = option === 'clothe' ? num(clothingCost) : num(mealCost);
    r.breakdown = [
      row('Expiation', option === 'clothe' ? 'Clothe 10 needy people' : 'Feed 10 needy people (one full meal each)'),
      row('Cost per person', fmt(per, currency)),
      row('Total estimated cost', fmt(per * 10, currency)),
    ];
    if (per <= 0) r.warnings.push('Enter your local cost so the estimate can be computed.');
    r.warnings.push('Cash substitution for feeding/clothing is accepted by some scholars (e.g. Hanafi) and restricted by others — giving actual food/clothing satisfies all.');
    r.eligible = per > 0; r.amount = per * 10;
  }
  r.evidence = ["Qur'an 5:89 — the oath-expiation verse (feed ten, clothe ten, or free a slave; if unable, fast three days)."];
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Kaffarah: fasting violations / zihar ---------------- */
export function calculateKaffarahFasting(input = {}) {
  const { methodology = 'general', currency = 'INR', violation = 'ramadan', ability = 'feed', mealCost = 0 } = input;
  const r = base(methodology, ['Sequence for deliberate Ramadan violation (intercourse while fasting): free a slave → fast 60 consecutive days → feed 60 poor (majority order).', 'Zihar follows the same 3-step sequence (Qur\'an 58:3–4).']);
  const feedCount = 60;
  if (ability === 'fast') {
    r.breakdown = [
      row('Violation', violation === 'zihar' ? 'Zihar' : 'Deliberate Ramadan fast violation'),
      row('Expiation', 'Fast 60 consecutive days (if a day is missed without excuse, restart per majority) + repentance + qada of the day'),
      row('Cash due', fmt(0, currency)),
    ];
    r.eligible = true; r.amount = 0;
  } else if (ability === 'unable') {
    r.warnings.push('If genuinely unable to fast 60 days, feeding 60 poor is the next step — inability must be real (illness, old age), not convenience.');
    const total = feedCount * num(mealCost);
    r.breakdown = [row('Expiation', 'Feed 60 needy people'), row('Cost per meal', fmt(num(mealCost), currency)), row('Total estimated cost', fmt(total, currency))];
    r.eligible = num(mealCost) > 0; r.amount = total;
  } else {
    const total = feedCount * num(mealCost);
    r.breakdown = [
      row('Violation', violation === 'zihar' ? 'Zihar' : violation === 'other' ? 'Other broken fast (see warning)' : 'Deliberate Ramadan fast violation'),
      row('Step 1', 'Freeing a slave (where applicable today — scholars direct to the next step)'),
      row('Step 2', 'Fast 60 consecutive days'),
      row('Step 3 (if unable to fast)', `Feed 60 poor ≈ ${fmt(total, currency)}`),
    ];
    if (violation === 'other') r.warnings.push('Eating/drinking deliberately in Ramadan requires repentance + qada; whether full 60-day kaffarah applies is itself a madhhab difference (Hanafi/Maliki yes; Shafi\'i/Hanbali generally qada only).');
    r.eligible = false; r.amount = 0;
  }
  r.evidence = ["Qur'an 58:3–4 — the zihar expiation sequence.", 'The 60-day sequence for Ramadan violation is established in the hadith literature (reported in Bukhari and Muslim).'];
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Hajj fidyah / hady ---------------- */
export function calculateHajjFidyah(input = {}) {
  const { methodology = 'general', currency = 'INR', situation = 'tamattu', hadyCost = 0, mealCost = 0, unableHady = 'no' } = input;
  const r = base(methodology, ['Rulings below follow Qur\'an 2:196 and classical manuals; select your school where outcomes differ.']);
  if (situation === 'tamattu') {
    if (unableHady === 'yes') {
      r.breakdown = [row('Situation', 'Tamattu\'/qiran without available hady'), row('Substitute', 'Fast 3 days during Hajj + 7 after returning = 10 days'), row('Cash due', fmt(0, currency))];
      r.amount = 0; r.eligible = true;
    } else {
      r.breakdown = [row('Situation', "Tamattu' / qiran Hajj"), row('Required', 'Hady: one sheep/goat, or 1/7 share of a cow/camel'), row('Estimated hady cost', fmt(num(hadyCost), currency))];
      if (!num(hadyCost)) r.warnings.push('Enter your local hady/sacrifice cost for the estimate.');
      r.amount = num(hadyCost); r.eligible = num(hadyCost) > 0;
    }
  } else if (situation === 'shaving') {
    r.breakdown = [row('Situation', 'Shaving/covering head or clipping nails with excuse (2:196)'), row('Options (choose one)', 'Fast 3 days • OR feed 6 poor • OR sacrifice one sheep')];
    r.breakdown.push(row('Feeding estimate (6 × meal)', fmt(6 * num(mealCost), currency)));
    r.breakdown.push(row('Sacrifice estimate', fmt(num(hadyCost), currency)));
    r.warnings.push('The three options are alternatives — you choose one. Amounts depend on local costs you enter.');
    r.amount = 0; r.eligible = false;
  } else if (situation === 'hunting') {
    r.breakdown = [row('Situation', 'Hunting game while in ihram'), row('Ruling', 'Equivalent domestic animal judged by two just persons (5:95), or its value in food for the poor, or equivalent fasts')];
    r.warnings.push('Requires case-by-case judgment — this tool cannot price it. Consult scholars.');
    r.amount = 0; r.eligible = false;
  } else if (situation === 'missed') {
    r.breakdown = [row('Situation', 'Missed Hajj (missed Arafah)'), row('Ruling (majority)', 'Perform Umrah to exit ihram, make up Hajj next year, plus hady (a sheep) per many scholars')];
    r.breakdown.push(row('Estimated hady cost', fmt(num(hadyCost), currency)));
    r.warnings.push('Details (make-up obligation, hady) differ between schools — confirm with a scholar.');
    r.amount = num(hadyCost); r.eligible = num(hadyCost) > 0;
  } else {
    r.breakdown = [row('Situation', 'Ihram violation (e.g. perfume, stitched clothing without excuse)')];
    r.breakdown.push(row('Common ruling', 'Fidyah: sacrifice a sheep, or feed 6 poor, or fast 3 days — differs by violation and school'));
    r.warnings.push('Select a specific situation and school; penalties are not one-size-fits-all.');
    r.amount = 0; r.eligible = false;
  }
  r.evidence = ["Qur'an 2:196 — hady for tamattu', and fasting/feeding/sacrifice alternatives.", "Qur'an 5:95 — penalty for hunting in ihram."];
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Mahr planner ---------------- */
export function calculateMahr(input = {}) {
  const { methodology = 'general', currency = 'INR', total = 0, prompt = 0, monthly = 0 } = input;
  const r = base(methodology, ['Islam fixes no amount for mahr — it is agreed between the parties (prompt and/or deferred).', 'Deferred mahr is a debt owed to the wife.']);
  const t = num(total), p = Math.min(num(prompt), t);
  const deferred = Math.max(0, t - p);
  const months = num(monthly) > 0 && deferred > 0 ? Math.ceil(deferred / num(monthly)) : 0;
  r.breakdown = [
    row('Total mahr agreed', fmt(t, currency)),
    row('Prompt (muqaddam)', fmt(p, currency)),
    row('Deferred (muakhkhar)', fmt(deferred, currency)),
  ];
  if (months) r.breakdown.push(row('Payoff at monthly installment', `${months} month(s) of ${fmt(num(monthly), currency)}`));
  r.warnings.push('Excessive demands that prevent marriage are discouraged in the hadith literature; moderation and mutual agreement are the Prophetic guidance.');
  r.evidence = ["Qur'an 4:4 — give women their dowries graciously.", "Qur'an 4:24 — mahr as an agreed obligation."];
  r.eligible = t > 0; r.amount = t;
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Nafaqah planner ---------------- */
export function calculateNafaqah(input = {}) {
  const { methodology = 'general', currency = 'INR', members = 0, housing = 0, food = 0, clothing = 0, education = 0, healthcare = 0, other = 0, income = 0 } = input;
  const r = base(methodology, ['Planning aid only — actual nafaqah obligations depend on need, custom, means, and school rules; no fixed percentage exists in Islam.']);
  const total = num(housing) + num(food) + num(clothing) + num(education) + num(healthcare) + num(other);
  const diff = num(income) - total;
  r.breakdown = [
    row('Household members', String(Math.floor(num(members)))),
    row('Housing', fmt(num(housing), currency)),
    row('Food', fmt(num(food), currency)),
    row('Clothing', fmt(num(clothing), currency)),
    row('Education', fmt(num(education), currency)),
    row('Healthcare', fmt(num(healthcare), currency)),
    row('Other essentials', fmt(num(other), currency)),
    row('Estimated monthly maintenance', fmt(total, currency)),
    row('Available income', fmt(num(income), currency)),
    row('Balance', (diff >= 0 ? '+' : '−') + ' ' + fmt(Math.abs(diff), currency).replace(/^[^\d]+/, (m) => m)),
  ];
  if (diff < 0) r.warnings.push('Expenses exceed income in this plan — prioritize essentials (food, shelter, clothing) first.');
  r.warnings.push('This plans a household budget; it does not decide anyone\'s legal maintenance rights — those depend on marriage, custody and means.');
  r.evidence = ["Qur'an 2:233 — maintenance and clothing of mothers (and by extension dependents) on a reasonable basis.", "Qur'an 65:7 — spend according to means."];
  r.eligible = total > 0; r.amount = total;
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

/* ---------------- Khums ---------------- */
export function calculateKhums(input = {}) {
  const { methodology = 'jafari', currency = 'INR', surplus = 0 } = input;
  const r = base(methodology, ['Framework must be selected first — rulings differ fundamentally between schools.']);
  if (methodology === 'sunni') {
    r.breakdown = [row('Framework', 'Sunni'), row('Annual income khums', fmt(0, currency))];
    r.warnings.push('Sunni schools do not levy 20% on ordinary annual income. Qur\'an 8:41 addresses war booty (ghanimah); surplus wealth is subject to zakat, not khums.');
    r.evidence = ["Qur'an 8:41 — one-fifth of war gains for Allah, the Messenger, kin, orphans, the needy and travelers."];
    r.eligible = false; r.amount = 0;
  } else {
    const s = num(surplus);
    r.breakdown = [
      row('Framework', "Ja'fari (annual surplus after yearly expenses)"),
      row('Annual surplus', fmt(s, currency)),
      row('Khums due (20%)', fmt(s * 0.2, currency)),
      row('— Sahm-e-Imam (half)', fmt(s * 0.1, currency)),
      row('— Sahm-e-Sadat (half)', fmt(s * 0.1, currency)),
    ];
    r.warnings.push("Distribution details (marja' guidance, sehm-e-Imam/sadat) follow Ja'fari jurisprudence — follow your marja'.");
    r.evidence = ["Qur'an 8:41 — the one-fifth verse.", "Ja'fari extension to annual surplus is a school-specific ruling, not universal."];
    r.eligible = s > 0; r.amount = s * 0.2;
  }
  r.currency = currency; r.disclaimer = EDU_NOTE;
  return r;
}

export const CALCS = {
  calculateZakat, calculateGoldZakat, calculateSilverZakat, calculateCashZakat,
  calculateBusinessZakat, calculateInvestmentZakat, calculateAgriculturalZakat,
  calculateLivestockZakat, calculateZakatAlFitr, calculateFidyah,
  calculateKaffarahOath, calculateKaffarahFasting, calculateHajjFidyah,
  calculateMahr, calculateNafaqah, calculateKhums,
};
