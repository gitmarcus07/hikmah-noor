/* Hikmah Noor — Islamic finance tools registry.
 * One entry per tool page: SEO meta, obligation level, input schema
 * (single form OR multi-step wizard), FAQ and page-level notes.
 * Calculation itself lives in calc.js and is dispatched by name.
 */

export const METHODOLOGIES = [
  { v: 'general', t: 'General / commonly used' },
  { v: 'hanafi', t: 'Hanafi' },
  { v: 'maliki', t: 'Maliki' },
  { v: 'shafii', t: "Shafi'i" },
  { v: 'hanbali', t: 'Hanbali' },
  { v: 'custom', t: 'Other / custom' },
];

export const CATS = [
  { slug: 'start-here', title: 'Start Here', desc: 'Understand what you may owe before calculating anything.', icon: 'quran', grad: 'from-emerald-900 to-emerald-700', chip: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
  { slug: 'zakat', title: 'Zakat', desc: 'The obligatory alms — calculators for every asset type.', icon: 'surahs', grad: 'from-emerald-950 via-emerald-900 to-emerald-700', chip: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
  { slug: 'fidyah-kaffarah', title: 'Fidyah & Kaffarah', desc: 'Expiations and compensations for fasts, oaths and Hajj rites.', icon: 'duas', grad: 'from-amber-600 to-amber-500', chip: 'bg-amber-50 text-amber-800 border-amber-200' },
  { slug: 'family-finance', title: 'Family Finance', desc: 'Mahr and maintenance planning — rights, not taxes.', icon: 'kalimas', grad: 'from-sky-700 to-sky-500', chip: 'bg-sky-50 text-sky-800 border-sky-200' },
  { slug: 'classical-finance', title: 'Classical Finance', desc: 'Khums, Ushr, Jizya and Kharaj — school-specific and historical rulings explained.', icon: 'meanings', grad: 'from-violet-800 to-violet-600', chip: 'bg-violet-50 text-violet-800 border-violet-200' },
];

const CUR = { key: 'currency', label: 'Currency', type: 'currency', def: 'INR' };
const MADH = (hint) => ({ key: 'methodology', label: 'Calculation methodology', hint: hint || 'Choose the school or general method. Options appear only where they change the result.', type: 'select', options: METHODOLOGIES, def: 'general' });
const HAWL = { key: 'hawlMet', label: 'Has this wealth been held for one lunar year (hawl)?', type: 'radio', options: [{ v: 'yes', t: 'Yes' }, { v: 'no', t: 'No' }, { v: 'unsure', t: 'Not sure' }], def: 'yes' };
const priceNote = { key: '_priceNote', type: 'note', label: 'Live prices: enter today\u2019s market price below. We never hard-code gold/silver prices — for a future price API, these fields are the integration point.' };

export const TOOLS = [
  /* ---------- START ---------- */
  {
    slug: 'obligations-guide', cat: 'start-here', kind: 'info', calc: null, icon: 'quran',
    level: 'Educational guide',
    title: 'Islamic Financial Obligations — Complete Guide',
    desc: 'Zakat, Fidyah, Kaffarah, Mahr, Nafaqah, Khums explained: universal vs conditional vs historical dues.',
    keywords: 'islamic financial obligations, zakat fidyah kaffarah difference, khums ushr jizya kharaj explained, mahr nafaqah guide',
    intro: 'Not everything called an “Islamic due” works the same way. Zakat is a universal pillar; fidyah and kaffarah are conditional on specific events; mahr and nafaqah are family rights; jizya and kharaj were historical state levies. Pick the matching tool below — each page shows its evidence and school differences.',
    points: [
      'Zakat (2.5% on qualifying wealth), Ushr (5–10% on harvests) and Zakat al-Fitr (per person before Eid) are universally established annual obligations.',
      'Fidyah and Kaffarah are conditional: they apply only after a specific event (unmakeable fasts, broken oath, Hajj violation) — the tools triage your situation first.',
      'Mahr and Nafaqah are family financial rights with no fixed universal amount — the tools are planners, not tax calculators.',
      'Khums (20%) is school-specific: Qur\u2019an 8:41 addresses war gains; Ja\u2019fari law extends it to annual surplus, Sunni schools do not.',
      'Jizya and Kharaj were classical state levies, not personal worship dues — those pages are educational references.',
    ],
    faq: [
      { q: 'Is zakat the same as Islamic tax?', a: 'No. Zakat is an act of worship with fixed recipients (Qur\u2019an 9:60), due on qualifying wealth after nisab and hawl. Historical state taxes like kharaj are a different category.' },
      { q: 'I missed fasts — do I pay fidyah?', a: 'Not automatically. Temporary excuses require making up the fasts (qada); fidyah is for those who cannot fast at all. Use the Fidyah tool\u2019s triage first.' },
      { q: 'Do I owe khums on my salary?', a: 'That depends on your school: Ja\u2019fari jurisprudence applies 20% to annual surplus; Sunni schools do not treat ordinary income this way. See the Khums tool.' },
    ],
  },
  /* ---------- ZAKAT ---------- */
  {
    slug: 'zakat-calculator', cat: 'zakat', kind: 'steps', calc: 'calculateZakat', icon: 'surahs',
    level: 'Obligatory (pillar)',
    title: 'Zakat Calculator — Full Multi-Asset (Cash, Gold, Silver, Business)',
    desc: 'Step-by-step zakat calculator: cash, gold, silver, investments, business, nisab and hawl check with breakdown.',
    keywords: 'zakat calculator, zakat on cash gold silver, nisab calculator, hawl calculator, how to calculate zakat, zakat 2.5 percent',
    intro: 'Answer step by step. Eligibility (nisab + hawl) is checked before any 2.5% is applied, and every number is shown in the breakdown.',
    steps: [
      { title: 'Methodology & currency', fields: [MADH('Madhhab changes details (e.g. personal-use gold, nisab basis) — pick general if unsure.'), CUR] },
      { title: 'Cash & savings', fields: [{ key: 'cash', label: 'Total cash, bank balances & savings', type: 'number', def: 0, hint: 'Include cash in hand, all accounts and savings.' }] },
      { title: 'Gold & silver (value)', fields: [{ key: 'goldValue', label: 'Gold — total current value', type: 'number', def: 0, hint: 'Or use the Gold tool for weight-based calculation.' }, { key: 'silverValue', label: 'Silver — total current value', type: 'number', def: 0 }] },
      { title: 'Investments & business', fields: [{ key: 'investments', label: 'Investments — zakatable portion', type: 'number', def: 0, hint: 'Enter the zakatable value; treatment varies by asset — see the Investment tool.' }, { key: 'businessNet', label: 'Business — net zakatable assets', type: 'number', def: 0, hint: 'Net current assets minus liabilities; see the Business tool.' }, { key: 'deductions', label: 'Eligible deductions (debts, liabilities)', type: 'number', def: 0 }] },
      {
        title: 'Nisab & hawl', fields: [
          { key: 'nisabBasis', label: 'Nisab basis', type: 'radio', options: [{ v: 'silver', t: 'Silver nisab (612.36 g) — benefits the poor' }, { v: 'gold', t: 'Gold nisab (87.48 g)' }], def: 'silver' },
          priceNote,
          { key: 'silverPricePerGram', label: 'Silver price per gram (today)', type: 'number', def: 0, showIf: { k: 'nisabBasis', v: 'silver' } },
          { key: 'goldPricePerGram', label: 'Gold price per gram (today)', type: 'number', def: 0, showIf: { k: 'nisabBasis', v: 'gold' } },
          { key: 'nisabValue', label: 'Or enter nisab value directly (optional)', type: 'number', def: 0 },
          HAWL,
        ],
      },
    ],
    faq: [
      { q: 'How is zakat calculated?', a: 'Total zakatable assets minus eligible liabilities = net wealth. If it reaches nisab and a lunar year passes, 2.5% is due.' },
      { q: 'Gold or silver nisab?', a: 'Scholars differ for monetary wealth. Silver nisab is lower (more people qualify, better for recipients); some scholars prefer gold. This tool lets you choose.' },
      { q: 'Is this a fatwa?', a: 'No — an educational estimate. Complex cases (debts, mixed assets, business) deserve a qualified scholar.' },
    ],
  },
  {
    slug: 'gold-zakat', cat: 'zakat', kind: 'form', calc: 'calculateGoldZakat', icon: 'surahs',
    level: 'Obligatory (pillar)',
    title: 'Gold Zakat Calculator — Weight, Purity & Nisab (87.48 g)',
    desc: 'Calculate zakat on gold by weight and purity (24k/22k/21k/18k) or direct value. Nisab 87.48 g, 2.5% rate, personal-use ruling explained.',
    keywords: 'gold zakat calculator, zakat on gold jewellery, gold nisab 87.48, zakat on 22k gold',
    intro: 'Enter weight or value — never both needed. Today\u2019s price must be entered; nothing is hard-coded.',
    fields: [MADH(), CUR, { key: 'weightGram', label: 'Gold weight (grams)', type: 'number', def: 0 }, { key: 'purity', label: 'Purity', type: 'select', options: [{ v: '24k', t: '24k (pure)' }, { v: '22k', t: '22k' }, { v: '21k', t: '21k' }, { v: '18k', t: '18k' }], def: '24k' }, priceNote, { key: 'pricePerGram', label: 'Gold price per gram (today)', type: 'number', def: 0 }, { key: 'valueDirect', label: 'OR enter gold value directly', type: 'number', def: 0 }, { key: 'personalUse', label: 'Is this personal-use jewellery?', type: 'radio', options: [{ v: 'no', t: 'No / investment' }, { v: 'yes', t: 'Yes, I wear it' }], def: 'no' }, HAWL],
    faq: [
      { q: 'What is the nisab for gold?', a: '20 mithqal, about 87.48 grams of pure gold.' },
      { q: 'Is there zakat on jewellery I wear?', a: 'Hanafi scholars generally say yes; the majority exempts personal-use items. The tool flags this difference.' },
      { q: 'How do I handle 22k gold?', a: 'Convert to pure-gold equivalent (22k ≈ 91.7%) — the tool does this automatically.' },
    ],
  },
  {
    slug: 'silver-zakat', cat: 'zakat', kind: 'form', calc: 'calculateSilverZakat', icon: 'surahs',
    level: 'Obligatory (pillar)',
    title: 'Silver Zakat Calculator — Weight & Nisab (612.36 g)',
    desc: 'Calculate zakat on silver by weight or value. Nisab 612.36 g, 2.5% rate, with personal-use ruling explained.',
    keywords: 'silver zakat calculator, zakat on silver, silver nisab 612 grams',
    intro: 'Silver nisab is much lower than gold\u2019s, so even modest holdings can qualify.',
    fields: [MADH(), CUR, { key: 'weightGram', label: 'Silver weight (grams)', type: 'number', def: 0 }, priceNote, { key: 'pricePerGram', label: 'Silver price per gram (today)', type: 'number', def: 0 }, { key: 'valueDirect', label: 'OR enter silver value directly', type: 'number', def: 0 }, { key: 'personalUse', label: 'Personal-use items?', type: 'radio', options: [{ v: 'no', t: 'No / investment' }, { v: 'yes', t: 'Yes' }], def: 'no' }, HAWL],
    faq: [
      { q: 'What is the nisab for silver?', a: '200 dirhams, about 612.36 grams.' },
      { q: 'Why is silver nisab lower?', a: 'Silver\u2019s market value is lower than gold\u2019s, so the threshold in money terms is smaller — many scholars note this benefits recipients.' },
      { q: 'Cash + silver combined?', a: 'Gold, silver and cash are pooled for nisab in the standard method — use the main Zakat Calculator for mixed wealth.' },
    ],
  },
  {
    slug: 'cash-savings-zakat', cat: 'zakat', kind: 'form', calc: 'calculateCashZakat', icon: 'surahs',
    level: 'Obligatory (pillar)',
    title: 'Cash & Savings Zakat Calculator',
    desc: 'Zakat on cash in hand, bank accounts, savings and foreign currency. Nisab choice (gold/silver) and hawl check included.',
    keywords: 'zakat on cash, zakat on savings, zakat on bank balance, cash nisab calculator',
    intro: 'Add every cash-like holding. Foreign currency should be converted to your selected currency first.',
    fields: [MADH(), CUR, { key: 'cashInHand', label: 'Cash in hand', type: 'number', def: 0 }, { key: 'bankAccounts', label: 'Bank / current accounts', type: 'number', def: 0 }, { key: 'savings', label: 'Savings & deposits', type: 'number', def: 0 }, { key: 'forex', label: 'Foreign currency (converted value)', type: 'number', def: 0 }, { key: 'nisabBasis', label: 'Nisab basis', type: 'radio', options: [{ v: 'silver', t: 'Silver (612.36 g)' }, { v: 'gold', t: 'Gold (87.48 g)' }], def: 'silver' }, priceNote, { key: 'silverPricePerGram', label: 'Silver price per gram (today)', type: 'number', def: 0, showIf: { k: 'nisabBasis', v: 'silver' } }, { key: 'goldPricePerGram', label: 'Gold price per gram (today)', type: 'number', def: 0, showIf: { k: 'nisabBasis', v: 'gold' } }, { key: 'nisabValue', label: 'Or nisab value directly (optional)', type: 'number', def: 0 }, HAWL],
    faq: [
      { q: 'Is bank savings zakatable?', a: 'Yes — savings and account balances are zakatable wealth like cash in hand.' },
      { q: 'What about salary just received?', a: 'What you hold on your zakat anniversary counts; many people use one annual zakat date for simplicity.' },
      { q: 'Foreign currency?', a: 'Convert at the current rate and include it with cash.' },
    ],
  },
  {
    slug: 'business-zakat', cat: 'zakat', kind: 'form', calc: 'calculateBusinessZakat', icon: 'surahs',
    level: 'Obligatory (pillar)',
    title: 'Business Zakat Calculator — Inventory, Receivables & Liabilities',
    desc: 'Zakat on trade goods: cash, inventory at market value, recoverable receivables minus liabilities at 2.5%. Fixed assets excluded.',
    keywords: 'business zakat calculator, zakat on inventory, zakat on trade goods, company zakat calculation',
    intro: 'Only zakatable current assets count — stock at market value, plus cash and strong receivables, minus short-term liabilities.',
    fields: [MADH(), CUR, { key: 'cash', label: 'Business cash & bank', type: 'number', def: 0 }, { key: 'inventory', label: 'Inventory / stock (market value)', type: 'number', def: 0 }, { key: 'receivables', label: 'Receivables likely to be paid', type: 'number', def: 0, hint: 'Exclude doubtful debts.' }, { key: 'otherAssets', label: 'Other zakatable current assets', type: 'number', def: 0 }, { key: 'liabilities', label: 'Short-term liabilities', type: 'number', def: 0 }, { key: 'nisabValue', label: 'Nisab value (e.g. silver-nisab value)', type: 'number', def: 0 }, HAWL],
    faq: [
      { q: 'Are machines and shops zakatable?', a: 'No — fixed assets used in the business are exempt; only trade goods and liquid assets count.' },
      { q: 'Inventory at cost or market price?', a: 'At current market (selling) value on the zakat date.' },
      { q: 'Doubtful debts?', a: 'Generally excluded until received; scholars differ on details.' },
    ],
  },
  {
    slug: 'investment-zakat', cat: 'zakat', kind: 'form', calc: 'calculateInvestmentZakat', icon: 'surahs',
    level: 'Obligatory (pillar) — method varies',
    title: 'Investment Zakat Calculator — Stocks, Funds & Crypto',
    desc: 'Estimate zakat on shares, mutual funds and cryptocurrency. Explains why no single ruling fits every investment.',
    keywords: 'zakat on stocks, zakat on shares, zakat on mutual funds, zakat on crypto, investment zakat calculator',
    intro: 'Enter the zakatable value per asset class. Read the warnings — purpose and asset type change the ruling.',
    fields: [MADH('Especially relevant here: methodologies for shares and funds differ.'), CUR, { key: 'purpose', label: 'Investment purpose', type: 'radio', options: [{ v: 'mixed', t: 'Mixed / unsure' }, { v: 'trading', t: 'Active trading' }, { v: 'longterm', t: 'Long-term holding' }], def: 'mixed' }, { key: 'stocks', label: 'Stocks — zakatable value', type: 'number', def: 0, hint: 'Traders: full market value. Long-term: some methods exclude fixed company assets.' }, { key: 'funds', label: 'Funds — zakatable value', type: 'number', def: 0 }, { key: 'crypto', label: 'Cryptocurrency value', type: 'number', def: 0, hint: 'Treated as zakatable wealth by many contemporary scholars; permissibility itself is debated.' }, { key: 'other', label: 'Other investments', type: 'number', def: 0 }],
    faq: [
      { q: 'Is there one rule for all stocks?', a: 'No. Actively traded shares are typically zakated at market value; long-term holdings have several methodologies.' },
      { q: 'Is crypto zakatable?', a: 'Many contemporary scholars treat it as zakatable wealth at market value; others question its status. This tool computes, it does not certify permissibility.' },
      { q: 'What about retirement funds?', a: 'Accessible vested portions are commonly included; locked amounts differ — ask a scholar for your scheme.' },
    ],
  },
  {
    slug: 'agriculture-zakat', cat: 'zakat', kind: 'form', calc: 'calculateAgriculturalZakat', icon: 'surahs',
    level: 'Obligatory (pillar)',
    title: 'Agricultural Zakat (Ushr) Calculator — 10% / 5% by Irrigation',
    desc: 'Ushr calculator: 10% for rain-fed, 5% for irrigated, 7.5% mixed harvests. Threshold (~653 kg), crop differences and evidence explained.',
    keywords: 'ushr calculator, agriculture zakat, zakat on crops, ushr 10 percent 5 percent, nisab crops wasq',
    intro: 'Due at harvest — no hawl. Rate depends on irrigation, and scholars differ on crops and thresholds.',
    fields: [MADH('Crop scope and threshold details differ by school.'), CUR, { key: 'crop', label: 'Crop type', type: 'select', options: [{ v: 'grains', t: 'Grains / cereals' }, { v: 'dates', t: 'Dates' }, { v: 'fruits', t: 'Fruits / vegetables' }, { v: 'other', t: 'Other produce' }], def: 'grains' }, { key: 'harvestKg', label: 'Total harvest (kg)', type: 'number', def: 0 }, { key: 'irrigation', label: 'Irrigation method', type: 'radio', options: [{ v: 'natural', t: 'Natural (rain/river) — 10%' }, { v: 'artificial', t: 'Artificial (wells/pumps) — 5%' }, { v: 'mixed', t: 'Mixed — 7.5%' }], def: 'natural' }, { key: 'pricePerKg', label: 'Price per kg (optional, for value estimate)', type: 'number', def: 0 }],
    faq: [
      { q: 'What is ushr?', a: 'The harvest zakat: a tenth for naturally watered crops, half a tenth for artificially irrigated ones (hadith in Sahih al-Bukhari).' },
      { q: 'Is there a minimum harvest?', a: 'The commonly cited threshold is 5 wasq (≈653 kg); scholars differ on exact weight and application.' },
      { q: 'All crops or only staples?', a: 'Some schools limit it to staple storable crops; others include all produce — the tool notes this.' },
    ],
  },
  {
    slug: 'livestock-zakat', cat: 'zakat', kind: 'form', calc: 'calculateLivestockZakat', icon: 'surahs',
    level: 'Obligatory (pillar)',
    title: 'Livestock Zakat Calculator — Camels, Cattle, Sheep & Goats',
    desc: 'Classical livestock schedules: exact animals due for camels, cattle and sheep/goats by head count. Grazing-herd rules explained.',
    keywords: 'livestock zakat calculator, zakat on camels, zakat on cows, zakat on sheep goats, cattle nisab',
    intro: 'Livestock uses head-count schedules, not percentages. Counts assume grazing herds held a lunar year.',
    fields: [MADH(), { key: 'animal', label: 'Animal', type: 'radio', options: [{ v: 'sheep', t: 'Sheep / goats (min 40)' }, { v: 'cattle', t: 'Cattle incl. buffalo (min 30)' }, { v: 'camel', t: 'Camels (min 5)' }], def: 'sheep' }, { key: 'count', label: 'Number of animals', type: 'number', def: 0 }],
    faq: [
      { q: 'Why not a percentage?', a: 'The Sunnah fixes specific animals per head-count bands (e.g. 1 sheep for 40–120 sheep).' },
      { q: 'Does stall-fed cattle count?', a: 'Many scholars restrict these schedules to grazing (sa\u2019imah) herds; farmed animals are treated differently.' },
      { q: 'Mixed sheep and goats?', a: 'They are counted together as one class in the classical manuals.' },
    ],
  },
  {
    slug: 'zakat-al-fitr', cat: 'zakat', kind: 'form', calc: 'calculateZakatAlFitr', icon: 'surahs',
    level: 'Obligatory (per fasting person)',
    title: 'Zakat al-Fitr Calculator — Per-Person Sa\u2019 & Cash Rules',
    desc: 'Fitrana calculator: household size, staple food, sa\u2019 quantity and local price. Explains cash-vs-food school differences.',
    keywords: 'zakat al fitr calculator, fitrana calculator, fitra amount per person, sadaqat al fitr kg, fitrana cash allowed',
    intro: 'One sa\u2019 of staple food per person, due before Eid prayer. Cash rules differ — read the note.',
    fields: [MADH('Directly affects the cash question and sa\u2019 weight.'), CUR, { key: 'adults', label: 'Adults (including yourself)', type: 'number', def: 1 }, { key: 'children', label: 'Children / dependents', type: 'number', def: 0 }, { key: 'staple', label: 'Staple food', type: 'select', options: [{ v: 'wheat', t: 'Wheat' }, { v: 'rice', t: 'Rice' }, { v: 'dates', t: 'Dates' }, { v: 'barley', t: 'Barley' }, { v: 'other', t: 'Local staple' }], def: 'wheat' }, { key: 'kgPerPerson', label: 'Kg per person (sa\u2019 estimate)', type: 'number', def: 2.5, hint: 'Commonly ~2.5–3 kg; Hanafi wheat measures differ — adjust if your scholars specify.' }, { key: 'pricePerKg', label: 'Local price per kg', type: 'number', def: 0 }, { key: 'payCash', label: 'Paying in cash?', type: 'radio', options: [{ v: 'unsure', t: 'Undecided' }, { v: 'yes', t: 'Yes' }, { v: 'no', t: 'No, food' }], def: 'unsure' }],
    faq: [
      { q: 'How much is fitr per person?', a: 'One sa\u2019 of the local staple — commonly estimated around 2.5–3 kg.' },
      { q: 'Can I pay cash?', a: 'Hanafi scholars permit it; the majority prefer food itself. Food satisfies all schools.' },
      { q: 'When is it due?', a: 'Before the Eid prayer; it may be given a day or two earlier.' },
    ],
  },
  /* ---------- FIDYAH & KAFFARAH ---------- */
  {
    slug: 'fidyah', cat: 'fidyah-kaffarah', kind: 'form', calc: 'calculateFidyah', icon: 'duas',
    level: 'Conditional obligation',
    title: 'Fidyah Calculator — Missed Fasts (Eligibility First)',
    desc: 'Fidyah for missed Ramadan fasts: eligibility triage (chronic illness, old age vs qada), people to feed and total cost.',
    keywords: 'fidyah calculator, fidyah for missed fasts, fidyah amount per fast, kaffarah vs fidyah',
    intro: 'First the tool checks whether fidyah even applies to you — many cases require making up fasts instead.',
    fields: [MADH(), CUR, { key: 'missedFasts', label: 'Number of missed fasts', type: 'number', def: 0 }, { key: 'reason', label: 'Why were the fasts missed?', type: 'select', options: [{ v: 'chronic', t: 'Chronic illness — cannot fast' }, { v: 'elderly', t: 'Old age / infirmity' }, { v: 'travel', t: 'Travel' }, { v: 'temporary', t: 'Temporary illness' }, { v: 'pregnancy', t: 'Pregnancy / nursing (temporary)' }, { v: 'other', t: 'Deliberately / other reason' }], def: 'chronic' }, { key: 'dailyAmount', label: 'Daily feeding cost (one poor person)', type: 'number', def: 0, hint: 'About 1.5–2 kg staple food or one full meal — use local cost.' }],
    faq: [
      { q: 'Who pays fidyah?', a: 'Those permanently unable to fast (chronic illness, old age) — Qur\u2019an 2:184.' },
      { q: 'Travel or temporary illness?', a: 'Make up the fasts later (qada) — fidyah is not the ruling.' },
      { q: 'How much per day?', a: 'Feeding one needy person: roughly 1.5–2 kg of staple food or a full meal at local cost.' },
    ],
  },
  {
    slug: 'kaffarah-oath', cat: 'fidyah-kaffarah', kind: 'steps', calc: 'calculateKaffarahOath', icon: 'duas',
    level: 'Conditional obligation',
    title: 'Broken Oath Kaffarah Calculator — Qur\u2019an 5:89 Order',
    desc: 'Expiation for broken oaths: feed 10, clothe 10, or fast 3 days — in the Qur\u2019anic order. Cost estimator with madhhab notes.',
    keywords: 'kaffarah for broken oath, oath expiation calculator, feed 10 poor cost, qasam ka kaffarah',
    intro: 'The order is fixed: feed or clothe first; fasting only if unable. The tool enforces this sequence.',
    steps: [
      { title: 'Your situation', fields: [MADH('Cash substitution rules differ by school.'), CUR, { key: 'ability', label: 'Can you afford to feed or clothe 10 needy people?', type: 'radio', options: [{ v: 'feed', t: 'Yes — I can feed/clothe' }, { v: 'unable', t: 'No — I genuinely cannot' }], def: 'feed' }] },
      { title: 'Choose the expiation', showIf: { k: 'ability', v: 'feed' }, fields: [{ key: 'option', label: 'Which option?', type: 'radio', options: [{ v: 'feed', t: 'Feed 10 needy (one meal each)' }, { v: 'clothe', t: 'Clothe 10 needy' }], def: 'feed' }, { key: 'mealCost', label: 'Cost of one full meal', type: 'number', def: 0, showIf: { k: 'option', v: 'feed' } }, { key: 'clothingCost', label: 'Cost of clothing one person', type: 'number', def: 0, showIf: { k: 'option', v: 'clothe' } }, { key: '_oathNote', type: 'note', label: 'An oath counts if sworn by Allah about a future matter. Cash instead of food/clothing is accepted by some scholars and restricted by others.' }] },
    ],
    faq: [
      { q: 'What is the kaffarah for a broken oath?', a: 'Feed 10 needy, or clothe 10, or free a slave; if unable, fast 3 days (Qur\u2019an 5:89).' },
      { q: 'Can I just fast?', a: 'Only if genuinely unable to feed or clothe — the order is binding.' },
      { q: 'Can I pay cash?', a: 'Some scholars allow the cash equivalent; others require actual food/clothing. Food satisfies all.' },
    ],
  },
  {
    slug: 'kaffarah-fasting', cat: 'fidyah-kaffarah', kind: 'steps', calc: 'calculateKaffarahFasting', icon: 'duas',
    level: 'Conditional obligation',
    title: 'Fasting Violation Kaffarah — 60 Days or Feed 60',
    desc: 'Kaffarah for deliberate Ramadan violations and zihar: the 60-day fast vs feeding-60 sequence, with school differences explained.',
    keywords: 'kaffarah for breaking fast, roza torne ka kaffarah, feed 60 poor, zihar kaffarah',
    intro: 'Serious violations follow a fixed sequence. The tool also flags where schools disagree.',
    steps: [
      { title: 'What happened?', fields: [MADH(), CUR, { key: 'violation', label: 'Violation', type: 'select', options: [{ v: 'ramadan', t: 'Deliberate intercourse while fasting in Ramadan' }, { v: 'other', t: 'Deliberately ate/drank in Ramadan' }, { v: 'zihar', t: 'Zihar (likening wife to a mahram)' }], def: 'ramadan' }, { key: 'ability', label: 'Which step applies to you?', type: 'select', options: [{ v: 'overview', t: 'Show me the full sequence' }, { v: 'fast', t: 'I will fast 60 consecutive days' }, { v: 'unable', t: 'I cannot fast — show feeding 60' }], def: 'overview' }] },
      { title: 'Feeding cost', showIf: { k: 'ability', v: 'unable' }, fields: [{ key: 'mealCost', label: 'Cost of one meal', type: 'number', def: 0 }] },
    ],
    faq: [
      { q: 'What is the kaffarah for breaking a Ramadan fast deliberately?', a: 'Repentance, making up the day, plus the 60-step sequence (free → fast 60 consecutive days → feed 60) per the majority.' },
      { q: 'Eating deliberately — same ruling?', a: 'Hanafi and Maliki schools apply the full kaffarah; Shafi\u2019i and Hanbali generally require qada only. The tool shows this difference.' },
      { q: 'What is zihar?', a: 'Likening one\u2019s wife to a mahram relative; expiation follows the same sequence (Qur\u2019an 58:3–4).' },
    ],
  },
  {
    slug: 'hajj-fidyah', cat: 'fidyah-kaffarah', kind: 'steps', calc: 'calculateHajjFidyah', icon: 'duas',
    level: 'Conditional obligation',
    title: 'Hajj Fidyah & Hady Tool — Situation-Based Rulings',
    desc: 'Hajj penalties by situation: tamattu\u2019 hady, shaving/nails fidyah, hunting penalty, missed Hajj — with school notes, not one flat amount.',
    keywords: 'hajj fidyah, hady calculator, tamattu sacrifice cost, hajj penalty shaving head, damm hajj',
    intro: 'No single amount exists — select exactly what happened and your school.',
    steps: [
      { title: 'Your situation', fields: [MADH('Penalties differ between schools.'), CUR, { key: 'situation', label: 'What happened?', type: 'select', options: [{ v: 'tamattu', t: "Tamattu\u2019 / qiran Hajj (hady required)" }, { v: 'shaving', t: 'Shaved head / clipped nails (with excuse)' }, { v: 'hunting', t: 'Hunted game in ihram' }, { v: 'missed', t: 'Missed Hajj (missed Arafah)' }, { v: 'other', t: 'Other ihram violation' }], def: 'tamattu' }] },
      { title: 'Costs', fields: [{ key: 'hadyCost', label: 'Local sacrifice (sheep) cost', type: 'number', def: 0, hint: 'Needed for hady / damm estimates.' }, { key: 'mealCost', label: 'Cost of one meal (for feeding options)', type: 'number', def: 0 }, { key: 'unableHady', label: 'If hady is required: can you afford it?', type: 'radio', options: [{ v: 'no', t: 'Yes, I can' }, { v: 'yes', t: 'No — show the fasting substitute' }], def: 'no', showIf: { k: 'situation', v: 'tamattu' } }] },
    ],
    faq: [
      { q: 'What is hady?', a: 'The sacrifice required with tamattu\u2019/qiran Hajj: a sheep/goat or a 1/7 share of a cow/camel (Qur\u2019an 2:196).' },
      { q: 'Cannot afford hady?', a: 'Fast 3 days during Hajj and 7 after returning — 10 in total (Qur\u2019an 2:196).' },
      { q: 'Penalty for shaving in ihram?', a: 'With excuse: choose fasting 3 days, feeding 6 poor, or one sacrifice (Qur\u2019an 2:196).' },
    ],
  },
  /* ---------- FAMILY ---------- */
  {
    slug: 'mahr-planner', cat: 'family-finance', kind: 'form', calc: 'calculateMahr', icon: 'kalimas',
    level: 'Family right (no fixed amount)',
    title: 'Mahr Planner — Prompt, Deferred & Payment Schedule',
    desc: 'Plan mahr: total, prompt (muqaddam) and deferred (muakhkhar) portions with a payoff schedule. Islam fixes no universal amount.',
    keywords: 'mahr calculator, mehr planner, deferred mahr, mahr muqaddam muakhkhar',
    intro: 'Mahr is whatever the couple agrees — this tool splits and schedules it, and shows the deferred debt clearly.',
    fields: [CUR, { key: 'total', label: 'Total mahr agreed', type: 'number', def: 0 }, { key: 'prompt', label: 'Prompt portion (paid at marriage)', type: 'number', def: 0 }, { key: 'monthly', label: 'Monthly payment toward deferred (optional)', type: 'number', def: 0 }],
    faq: [
      { q: 'Is there a fixed mahr in Islam?', a: 'No — the Qur\u2019an (4:4) commands giving it graciously but fixes no amount; it is by mutual agreement.' },
      { q: 'What is deferred mahr?', a: 'The portion payable later — it is a debt owed to the wife, due on demand, divorce or death.' },
      { q: 'Should mahr be modest?', a: 'Moderation is the Prophetic guidance; burdens that block marriage are discouraged.' },
    ],
  },
  {
    slug: 'nafaqah-planner', cat: 'family-finance', kind: 'form', calc: 'calculateNafaqah', icon: 'kalimas',
    level: 'Planning tool (no fixed %)',
    title: 'Nafaqah Planner — Household Maintenance Budget',
    desc: 'Plan household maintenance: housing, food, clothing, education, healthcare vs income. Explains why nafaqah has no fixed percentage.',
    keywords: 'nafaqah calculator, islamic maintenance budget, nafaqa planner, household expenses islam',
    intro: 'A budgeting aid — legal maintenance rights depend on need, means and school rules, never a flat percentage.',
    fields: [CUR, { key: 'members', label: 'Household members', type: 'number', def: 1 }, { key: 'housing', label: 'Housing (monthly)', type: 'number', def: 0 }, { key: 'food', label: 'Food (monthly)', type: 'number', def: 0 }, { key: 'clothing', label: 'Clothing (monthly)', type: 'number', def: 0 }, { key: 'education', label: 'Education (monthly)', type: 'number', def: 0 }, { key: 'healthcare', label: 'Healthcare (monthly)', type: 'number', def: 0 }, { key: 'other', label: 'Other essentials (monthly)', type: 'number', def: 0 }, { key: 'income', label: 'Available monthly income', type: 'number', def: 0 }],
    faq: [
      { q: 'Is nafaqah a fixed percentage?', a: 'No. The Qur\u2019an (65:7) ties spending to means — it varies by need, custom and capacity.' },
      { q: 'What does nafaqah cover?', a: 'Food, shelter, clothing and other reasonable essentials for dependents.' },
      { q: 'Does this decide legal rights?', a: 'No — courts and scholars decide rights; this tool only budgets.' },
    ],
  },
  /* ---------- CLASSICAL ---------- */
  {
    slug: 'khums', cat: 'classical-finance', kind: 'form', calc: 'calculateKhums', icon: 'meanings',
    level: 'School-specific',
    title: 'Khums Calculator — Ja\u2019fari 20% vs Sunni Position',
    desc: 'Khums with framework first: Ja\u2019fari 20% on annual surplus (sehm-e-Imam/sadat split) vs the Sunni war-booty-only position. Evidence for both.',
    keywords: 'khums calculator, khums 20 percent, sehme imam, khums on income sunni shia',
    intro: 'Select your jurisprudential framework first — the answer changes completely.',
    fields: [{ key: 'methodology', label: 'Jurisprudential framework', type: 'radio', options: [{ v: 'jafari', t: "Ja\u2019fari — 20% on annual surplus" }, { v: 'sunni', t: 'Sunni — war booty only' }], def: 'jafari' }, CUR, { key: 'surplus', label: 'Annual surplus (income minus yearly expenses)', type: 'number', def: 0, showIf: { k: 'methodology', v: 'jafari' } }],
    faq: [
      { q: 'Must every Muslim pay 20% of income?', a: 'No. Qur\u2019an 8:41 addresses war gains; the annual-surplus extension is Ja\u2019fari law, not universal.' },
      { q: 'How is khums split?', a: 'In Ja\u2019fari law, half Sahm-e-Imam and half Sahm-e-Sadat — follow your marja\u2019 for distribution.' },
      { q: 'Sunni view?', a: 'No annual income khums; surplus wealth falls under zakat instead.' },
    ],
  },
  {
    slug: 'ushr-guide', cat: 'zakat', kind: 'info', calc: null, icon: 'meanings',
    level: 'Obligatory (pillar) — reference',
    title: 'Ushr Explained — The 10% Harvest Due (Reference)',
    desc: 'Ushr reference: 10% rain-fed, 5% irrigated harvest dues, threshold and school differences — with a link to the calculator.',
    keywords: 'ushr meaning, ushr vs zakat, ushr 10 percent agriculture islam',
    intro: 'Ushr (“a tenth”) is simply the agricultural zakat under another name. For numbers, use the calculator; this page is the ruling reference.',
    points: [
      'Rate: 10% for naturally watered produce, 5% for artificially irrigated, 7.5% for mixed (hadith in Sahih al-Bukhari).',
      'Due at harvest — no lunar-year waiting period (Qur\u2019an 6:141).',
      'Threshold: commonly 5 wasq (≈653 kg); exact weight and application differ.',
      'Crop scope: staple storable crops per some schools, all produce per others.',
      'Calculate it: open the Agriculture Zakat tool for the interactive version.',
    ],
    faq: [
      { q: 'Is ushr different from zakat?', a: 'No — it is the zakat on agricultural produce, with its own rates and harvest timing.' },
      { q: 'Who receives ushr?', a: 'The same eight categories as zakat (Qur\u2019an 9:60).' },
      { q: 'How do I compute it?', a: 'Use the Agriculture Zakat calculator with your harvest weight and irrigation method.' },
    ],
  },
  {
    slug: 'jizya-guide', cat: 'classical-finance', kind: 'info', calc: null, icon: 'meanings',
    level: 'Historical state levy',
    title: 'Jizya Explained — Historical Poll Tax (Educational Reference)',
    desc: 'What jizya was: the classical poll tax on able-bodied non-Muslim men under Muslim rule, exemptions, and why it does not apply to you today.',
    keywords: 'jizya meaning, jizya in islam explained, jizya vs zakat',
    intro: 'Jizya was a state levy of a historical polity — not a personal act of worship you owe. This page is educational only; there is no calculator because there is nothing for you to pay.',
    points: [
      'Basis: Qur\u2019an 9:29 mentions jizya in the context of the early Muslim state.',
      'Applied historically to able-bodied adult non-Muslim males; women, children, the elderly, monks and the poor were exempt.',
      'Payers were exempt from military service and zakat; the state owed them protection.',
      'Amounts varied by era and ruler — no single fixed figure exists in the sources.',
      'Modern nation-states do not levy jizya; beware of anyone demanding it from you.',
    ],
    faq: [
      { q: 'Do I have to pay jizya today?', a: 'No. It was a levy of a historical state system, not an individual worship obligation.' },
      { q: 'Was jizya a fixed amount?', a: 'No — historical amounts varied widely by time and place.' },
      { q: 'Jizya vs zakat?', a: 'Zakat is worship paid by Muslims with fixed recipients; jizya was a civic levy on non-Muslim subjects in lieu of military service.' },
    ],
  },
  {
    slug: 'kharaj-guide', cat: 'classical-finance', kind: 'info', calc: null, icon: 'meanings',
    level: 'Historical state levy',
    title: 'Kharaj Explained — Classical Land Tax (Educational Reference)',
    desc: 'What kharaj was: the classical land tax on state-administered lands (notably Sawad of Iraq under \u2018Umar), and why it is history, not a personal due.',
    keywords: 'kharaj meaning, kharaj in islam, kharaj vs ushr land tax',
    intro: 'Kharaj was state land revenue — not worship, not owed by you. Educational reference only.',
    points: [
      'Origin: associated with \u2018Umar ibn al-Khattab\u2019s administration of the Sawad (Iraq) lands.',
      'Levied on land productivity (often a share or fixed measure), distinct from ushr on the Muslim farmer\u2019s crop.',
      'Ushr vs kharaj: ushr is the farmer\u2019s worship-due; kharaj was the state\u2019s land revenue — classical manuals treat them separately.',
      'Rates and methods varied by land survey and era; no universal figure.',
      'No modern individual owes kharaj as Islamic worship.',
    ],
    faq: [
      { q: 'Do farmers owe kharaj today?', a: 'No. Muslim farmers owe ushr/zakat on produce; kharaj belonged to a historical fiscal system.' },
      { q: 'Kharaj vs ushr?', a: 'Ushr is worship on the harvest; kharaj was state land revenue. They could historically coincide on some lands — a classical debate, not a modern bill.' },
      { q: 'Why include it here?', a: 'So readers stop confusing historical taxes with personal obligations — accuracy matters.' },
    ],
  },
  /* ---------- MIRATH ---------- */
  {
    slug: 'mirath-calculator', cat: 'family-finance', kind: 'steps', calc: 'calculateMirath', icon: 'kalimas',
    level: 'Fixed shares (Sunni law)',
    title: 'Mirath Calculator — Islamic Inheritance Distribution (Sunni)',
    desc: 'Divide a net estate among spouse, parents, sons and daughters with Quranic shares, awl and radd handled automatically.',
    keywords: 'mirath calculator, warasat calculator, virasat hisab, islamic inheritance calculator, property distribution islam, tarka distribution, wirasat',
    intro: 'Enter the net estate (after funeral costs, debts and bequests) and the surviving closest heirs. Fixed Quranic shares apply first; sons take the residue 2:1 with daughters; awl and radd are handled automatically.',
    steps: [
      { title: 'Estate', fields: [CUR, { key: 'estateValue', label: 'Total estate value', type: 'number', def: 0, hint: 'All property, cash and assets at current value.' }, { key: 'deductions', label: 'Settle first: funeral, debts, bequests', type: 'number', def: 0, hint: 'Funeral costs, all debts, then bequests (max one-third) are paid before any division.' }] },
      { title: 'Spouse & parents', fields: [{ key: 'husband', label: 'Surviving husband?', type: 'radio', options: [{ v: '1', t: 'Yes' }, { v: '0', t: 'No' }], def: '0' }, { key: 'wives', label: 'Surviving wives (number)', type: 'select', options: [{ v: '0', t: 'None' }, { v: '1', t: '1 wife' }, { v: '2', t: '2 wives' }, { v: '3', t: '3 wives' }, { v: '4', t: '4 wives' }], def: '0' }, { key: 'father', label: 'Father alive?', type: 'radio', options: [{ v: '1', t: 'Yes' }, { v: '0', t: 'No' }], def: '0' }, { key: 'mother', label: 'Mother alive?', type: 'radio', options: [{ v: '1', t: 'Yes' }, { v: '0', t: 'No' }], def: '0' }, { key: 'siblings2plus', label: 'Two or more siblings of the deceased?', type: 'radio', options: [{ v: 'no', t: 'No / fewer' }, { v: 'yes', t: 'Yes, 2+' }], def: 'no', hint: 'Matters only for the mother’s share (one-third vs one-sixth).' }] },
      { title: 'Children', fields: [{ key: 'sons', label: 'Number of sons', type: 'number', def: 0 }, { key: 'daughters', label: 'Number of daughters', type: 'number', def: 0 }] },
    ],
    faq: [
      { q: 'Who gets paid before inheritance?', a: 'In order: funeral expenses, all debts, then bequests up to one-third of the estate. Only the net remainder is divided — enter that remainder above.' },
      { q: 'What is the wife’s share?', a: 'One-fourth if there are no children, one-eighth if there are children — shared equally among up to four wives.' },
      { q: 'What is the daughter’s share?', a: 'One daughter alone (no sons) takes one-half; two or more share two-thirds. With sons, daughters share the residue at half a son’s portion each.' },
      { q: 'Why Sunni only?', a: 'Ja’fari law differs significantly (e.g. no awl/radd in the Sunni sense, different residuary rules). This v1 covers the six closest heir types under Sunni rules; complex families need a scholar.' },
      { q: 'Is this a fatwa?', a: 'No — an educational estimate. Real cases involve debts, missing heirs, pregnancy, or distant relatives. Consult a qualified scholar before distributing.' },
    ],
  },
];

export function getTool(cat, slug) {
  return TOOLS.find((t) => t.cat === cat && t.slug === slug);
}
export function getToolBySlug(slug) {
  return TOOLS.find((t) => t.slug === slug);
}
export function toolsByCat(cat) {
  return TOOLS.filter((t) => t.cat === cat);
}
