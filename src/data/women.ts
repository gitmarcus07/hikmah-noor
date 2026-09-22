/* Hikmah Noor — Women in Islam library (12 noble figures).
 * Narrated from the Quran (Maryam, Asiya) and the received seerah/hadith
 * tradition — collections named qualitatively, no fabricated numbers.
 * Scope rule: virtues and events only; no polemical detail; Karbala out
 * of scope (Fatima covered through her life with the Prophet ﷺ).
 */
export type WomenEra = 'Before Islam' | 'Makkah' | 'Madinah';
export interface WomanFigure {
  slug: string; order: number; name: string; era: WomenEra;
  title: string; arabic: string; translit: string; summary: string;
  narrative: [string, string, string, string];
  events: [string, string, string, string, string];
  lessons: [string, string, string];
  references: string; aliases: string[]; motif: string; accent: string;
}

export const WOMEN: WomanFigure[] = [
  { slug: 'maryam-mother-of-isa', order: 1, name: 'Maryam', era: 'Before Islam',
    title: 'Maryam — Chosen Above All Women',
    arabic: 'وَاصْطَفَاكِ عَلَى نِسَاءِ الْعَالَمِينَ', translit: 'Wastafaki ala nisa’il-alamin.',
    summary: 'Guarded her chastity, withdrew in devotion, endured labour alone — then vindicated by her infant’s speech. The only woman named in the Quran, with a surah bearing her name.',
    narrative: [
      'Maryam, daughter of Imran, was dedicated before birth and raised in Zakariya’s care, finding out-of-season provision in her chamber (3:37). When the spirit appeared as a man, she sought refuge — then received glad tidings of a pure boy despite never being touched (19:18–21).',
      'Labour drove her to a palm trunk in a distant place, wishing death before the ordeal (19:22–23). A voice comforted her: shake the trunk for dates, drink from the stream, be comforted — and vow silence (19:24–26).',
      'Carrying the infant to her people, she faced accusation — and pointed to the cradle. Isa spoke: servant of Allah, prophet, blessed, dutiful to his mother (19:27–33). Vindication came from the child she bore.',
      'Allah chose her above all women of the worlds (3:42) — the Quran’s exemplar of faith for all believers, male and female (66:11–12). A whole surah carries her name.',
    ],
    events: [
      'The dedication: vowed before birth, raised in devotion.',
      'The tidings: a pure boy announced to the untouched.',
      'The palm: labour alone — dates, stream, and comfort.',
      'The cradle: accusation answered by an infant’s speech.',
      'The choosing: above all women of the worlds (3:42).',
    ],
    lessons: [
      'Devotion in private prepares vindication in public.',
      'Provision finds the devoted: dates and streams in ordeals.',
      'Chastity guarded becomes honour proclaimed — by heaven itself.',
    ],
    references: 'Quran 3:35–47 and 19:16–36; Quran 66:11–12 (exemplar of faith)',
    aliases: ['maryam as story', 'hazrat maryam waqia', 'virgin mary islam', 'surah maryam story'],
    motif: 'stream', accent: '#4A7C8C' },
  { slug: 'asiya-queen-of-faith', order: 2, name: 'Asiya', era: 'Before Islam',
    title: 'Asiya — Faith in Pharaoh’s Palace',
    arabic: 'رَبِّ ابْنِ لِي عِنْدَكَ بَيْتًا فِي الْجَنَّةِ', translit: 'Rabbi ibn li indaka baytan fil-jannah.',
    summary: 'Pharaoh’s wife who rescued Musa, believed against an empire of one, and asked Allah for a house beside Him — set as an exemplar for all believers.',
    narrative: [
      'Asiya, wife of Pharaoh, found the basketed infant and pleaded: do not kill him — perhaps he will benefit us (28:9). Her mercy preserved the very prophet sent against her husband’s tyranny.',
      'When Musa’s signs confronted Pharaoh’s court, Asiya believed — the queen of the palace joining the enslaved in faith. Pharaoh tortured her for it; tradition holds she was pinned under the sun, unbroken.',
      'Her recorded plea stands in the Quran: my Lord, build for me a house with You in Paradise, save me from Pharaoh and his deeds, and from the wrongdoing people (66:11). Palace traded for proximity.',
      'Allah set her — with Maryam — as an example for all who believe (66:11–12): faith needs no permission from thrones, husbands, or empires.',
    ],
    events: [
      'The basket: mercy that preserves a prophet (28:9).',
      'The belief: a queen joins the enslaved in faith.',
      'The torture: pinned under the sun, unbroken.',
      'The plea: a house beside Allah (66:11).',
      'The exemplar: set for all believers with Maryam.',
    ],
    lessons: [
      'Thrones never license disbelief — nor block faith.',
      'Mercy to a basket can outweigh a palace’s power.',
      'Ask neighbourhood with Allah, not palaces from tyrants.',
    ],
    references: 'Quran 28:9 and 66:11–12; Sahih al-Bukhari (best women: Maryam, Asiya, Khadija, Fatima)',
    aliases: ['asiya pharaoh wife story', 'hazrat asiya iman', 'asiya house paradise dua'],
    motif: 'crown', accent: '#B98A2F' },
  { slug: 'khadija-mother-of-believers', order: 3, name: 'Khadija', era: 'Makkah',
    title: 'Khadija — Mother of the Believers',
    arabic: 'خَيْرُ نِسَائِهَا', translit: 'Khayru nisa’iha.',
    summary: 'First believer, employer turned wife, financier of early Islam — who wrapped the trembling Prophet ﷺ after Hira and was greeted by Allah with a house of pearls.',
    narrative: [
      'Khadija — Makkah’s noble merchant widow — hired Muhammad ﷺ for her Syrian trade on his reputation for truth, then proposed through intermediaries, marrying him at twenty-five to her forty. Every child except Ibrahim came from her.',
      'When he returned from Hira trembling “cover me,” she wrapped him, listened, and believed instantly — the first believer. She took him to Waraqah, who confirmed the Namus of Moses. Her faith steadied revelation’s first hours.',
      'Through boycott, hunger and grief she spent her fortune until nothing remained, dying in the Year of Sorrow — the Prophet named the year for her and Abu Talib, and never ceased remembering her: she believed when people disbelieved, affirmed when they denied, spent when they withheld.',
      'Allah greeted her through Jibril with glad tidings of a palace of pearls, no noise nor fatigue within (Bukhari/Muslim) — and she is counted among the four best women of Paradise.',
    ],
    events: [
      'The proposal: reputation hired, character married.',
      'The wrapping: first believer steadies revelation’s dawn.',
      'The spending: fortune emptied through boycott years.',
      'The greeting: a pearl palace from Allah via Jibril.',
      'The Sorrow: the year named for her loss.',
    ],
    lessons: [
      'Believe first, spend wholly: Khadija’s two verbs.',
      'Wrap the trembling: steadiness is a form of revelation-service.',
      'Remember the dead devotedly: he never stopped mentioning her.',
    ],
    references: 'Sahih al-Bukhari and Sahih Muslim (Khadija’s virtues, the pearl palace); Ibn Hisham’s Seerah',
    aliases: ['khadija story', 'hazrat khadija first muslim', 'ummul momineen khadija', 'year of sorrow'],
    motif: 'dawn', accent: '#C9A227' },
  { slug: 'sumayyah-first-martyr', order: 4, name: 'Sumayyah', era: 'Makkah',
    title: 'Sumayyah — The First Martyr',
    arabic: 'صَبْرًا آلَ يَاسِرٍ', translit: 'Sabran Ala Yasir.',
    summary: 'An elderly Abyssinian woman, among the first seven Muslims — tortured to death for refusing to recant, the first martyr of Islam, promised Paradise mid-torture.',
    narrative: [
      'Sumayyah — wife of Yasir, mother of Ammar — believed among the very first, when Islam was seven souls in Makkah. The Makhzum clan, owning no tribal protection over them, chose the family for exemplary torture.',
      'Dragged to the desert noon, speared and mocked, the family refused every offer. The Prophet ﷺ passed them with the promise that defines them: patience, family of Yasir — your appointment is Paradise.',
      'Abu Jahl himself speared her — the first blood of Islam spilled from an elderly woman who would not unsay tawhid. Her husband Yasir died under torture likewise; Ammar survived, broken and forgiven, his coerced words excused by revelation (16:106).',
      'No wealth, no tribe, no sword — only refusal. The ummah’s martyrology opens not with a warrior but with a mother.',
    ],
    events: [
      'The belief: among the first seven Muslims.',
      'The sands: the Yasir family chosen for exemplary torture.',
      'The promise: “patience — your appointment is Paradise.”',
      'The spear: first martyr of Islam, refusing to recant.',
      'The son: Ammar’s coerced words excused (16:106).',
    ],
    lessons: [
      'Refusal is worship: one word withheld can be Paradise.',
      'Martyrology opens with a mother, not a warrior.',
      'Promises outlast torturers: Abu Jahl is dust; Paradise stands.',
    ],
    references: 'Ibn Hisham’s Seerah (persecution of the Yasir family); Quran 16:106 (coercion excuse)',
    aliases: ['sumayyah first martyr story', 'hazrat sumaiya shahadat', 'yasir family torture'],
    motif: 'stake', accent: '#8A6D3B' },
  { slug: 'fatima-bint-khattab', order: 5, name: 'Fatima K', era: 'Makkah',
    title: 'Fatima bint al-Khattab — The Reciter Who Converted Umar',
    arabic: 'طه', translit: 'Ta-Ha.',
    summary: 'Umar’s sister, early believer with husband Sa’id — whose recitation of Ta-Ha, heard through a door, broke the fiercest opponent into Islam’s strength.',
    narrative: [
      'Fatima bint al-Khattab believed early with her husband Sa’id ibn Zayd, hiding their Islam from her brother Umar — Makkah’s fiercest foe. Their house hosted Khabbab’s secret Quran lessons.',
      'Umar, sword-bound to kill the Prophet ﷺ, detoured on hearing his own house hummed with recitation. He struck Sa’id, bloodied Fatima’s face — then, shamed by her defiance (“do what you will, we will not leave Islam”), asked to see the sheet.',
      'Purified, he read Ta-Ha’s opening — “We did not send down the Quran to distress you” (20:1–2) — and the Faruq was born in his sister’s living room. Her blood bought Umar’s tears; her recitation bought the ummah its strength.',
      'She lived on quietly thereafter — history’s hinge hidden in a housewife: the reciter behind the second caliph.',
    ],
    events: [
      'The secret: early belief hidden from brother Umar.',
      'The blood: struck, defiant — “we will not leave Islam.”',
      'The sheet: Ta-Ha read purified — Umar breaks.',
      'The hinge: the Faruq born in her living room.',
      'The quiet: history’s hinge, housewife thereafter.',
    ],
    lessons: [
      'Recite where swords can hear: sheets convert killers.',
      'Defiance with dignity: bloodied, unbowed, effective.',
      'Hidden hinges swing the heaviest doors.',
    ],
    references: 'Ibn Hisham’s Seerah (Umar’s conversion in Sa’id’s house)',
    aliases: ['fatima bint khattab story', 'umar sister ta-ha', 'umar conversion house'],
    motif: 'manuscript', accent: '#6B8E9E' },
  { slug: 'umm-ayman-barakah', order: 6, name: 'Umm Ayman', era: 'Makkah',
    title: 'Umm Ayman — The Second Mother',
    arabic: 'أُمِّي بَعْدَ أُمِّي', translit: 'Ummi ba’da ummi.',
    summary: 'Abyssinian nurse of the Prophet ﷺ from his birth — who led him home orphaned, migrated twice, watered warriors at Uhud, and was called “my mother after my mother.”',
    narrative: [
      'Barakah — Umm Ayman — nursed the infant Muhammad ﷺ, travelled with Amina to Yathrib, and when Amina died at Abwa, the Abyssinian slave-girl led the six-year-old orphan home. The Prophet never forgot the hand that guided him through his first grief.',
      'Freed, married, mother of Ayman (martyred at Hunayn) then of Usama ibn Zayd — she migrated to Madinah on foot through desert heat, sustained, she said, by a heavenly drink. At Uhud she watered fighters and tended wounds.',
      'Abu Bakr and Umar visited her after the Prophet’s passing as he used to — finding her weeping not for him, she said, but because revelation had ceased from heaven. The caliphs wept with her.',
      '“My mother after my mother” — his words — frames her rank: paradise-adjacent service, recognised by revelation’s receiver himself.',
    ],
    events: [
      'Abwa: the orphan led home by a slave-girl’s hand.',
      'The foot-march: Madinah reached through desert heat.',
      'Uhud: water and bandages in the battle’s dust.',
      'The visits: caliphs continuing his custom after him.',
      '“My mother after my mother” — rank spoken by him.',
    ],
    lessons: [
      'Guide orphans home: Abwa’s walk echoes forever.',
      'Weep for revelation’s pause, not for persons — heavenly grief.',
      'Nurses outrank nobles when heaven keeps the register.',
    ],
    references: 'Sahih Muslim (Umm Ayman’s virtues); Ibn Hisham’s Seerah (Abwa, Uhud)',
    aliases: ['umm ayman story', 'barakah second mother', 'hazrat umme aiman'],
    motif: 'vessel', accent: '#5F7A6B' },
  { slug: 'aisha-scholar', order: 7, name: 'Aisha', era: 'Madinah',
    title: 'Aisha — The Scholar of the Household',
    arabic: 'خُذُوا نِصْفَ دِينِكُمْ', translit: 'Khudhu nisf dinikum.',
    summary: 'Wife of the Prophet ﷺ in his final years, transmitter of over two thousand hadith — the scholar companions consulted, whose memory preserved domestic Islam.',
    narrative: [
      'Aisha — Abu Bakr’s daughter — married the Prophet ﷺ in Madinah, spending his final nine years at his side, her room adjoining the mosque. Revelation descended in her presence; he passed with his head on her chest, buried where she lived.',
      'Slandered in the Ifk incident, she was vindicated by revelation itself (24:11–20) — innocence declared from heaven, recited forever. Trial became testimony.',
      'After his passing she taught for nearly fifty years: companions and successors crowded her door for hadith, law and medicine — over two thousand narrations, the ummah’s domestic code. “Take half your religion from her,” runs the famous (variously graded) praise.',
      'This page holds to agreed virtues — scholarship, worship, generosity — leaving polemics aside: the household’s lamp, lit longest.',
    ],
    events: [
      'The room: nine years beside revelation, adjoining the mosque.',
      'The Ifk: slander answered by heaven itself (24:11–20).',
      'The chest: his final rest where she lived.',
      'The door: fifty years of teaching companions and successors.',
      'The corpus: 2000+ narrations — domestic Islam preserved.',
    ],
    lessons: [
      'Vindication descends: heaven answers slander with verses.',
      'Teach fifty years: longevity multiplies one household.',
      'Scope discipline honours subjects: virtues, not polemics.',
    ],
    references: 'Quran 24:11–20 (Ifk vindication); Sahih al-Bukhari and Sahih Muslim (virtues of Aisha)',
    aliases: ['aisha story', 'hazrat ayesha ilm', 'ummul momineen ayesha', 'ifk incident'],
    motif: 'lamp', accent: '#E3B94E' },
  { slug: 'fatima-zahra', order: 8, name: 'Fatima', era: 'Madinah',
    title: 'Fatima al-Zahra — The Radiant',
    arabic: 'سَيِّدَةُ نِسَاءِ الْجَنَّةِ', translit: 'Sayyidatu nisa’il-jannah.',
    summary: 'Beloved youngest daughter — who shielded her father from filth, married Ali in heaven-joined union, and was promised leadership of Paradise’s women. (Karbala out of scope.)',
    narrative: [
      'Fatima — Khadija’s youngest — grew in boycott hunger, once scraping filth from her prostrating father’s back while Quraysh laughed; he comforted her: grieve not, Allah protects your father. Daughter as shield.',
      'Married to Ali with the simplest dowry, she ground grain till her hands blistered — asking for a servant, receiving instead the tasbih of Fatima (33-33-34), better than servants. Poverty radiant with worship.',
      'The Prophet rose for her, seated her beside himself, and named her leader of Paradise’s women. In his final illness he whispered her near end first, then Paradise’s tidings — she wept, then laughed.',
      'She passed months after him (11 AH) — her life with him complete, her rank sealed. This page closes here by scope: Karbala belongs to later history, not her biography.',
    ],
    events: [
      'The shield: filth scraped from a prostrating father.',
      'The mill: blistered hands answered with tasbih, not servants.',
      'The rising: he stood for her — leader of Paradise’s women.',
      'The whisper: near end, then glad tidings — tears, then laughter.',
      '11 AH: months after him — rank sealed, scope closed.',
    ],
    lessons: [
      'Shield fathers: daughters’ courage counts in history.',
      'Tasbih over servants: worship compounds, help expires.',
      'Scope is mercy: biographies need not carry later wars.',
    ],
    references: 'Sahih al-Bukhari and Sahih Muslim (virtues of Fatima, tasbih hadith)',
    aliases: ['fatima zahra story', 'hazrat fatima daughter prophet', 'khatoon e jannat'],
    motif: 'cloak', accent: '#B79CED' },
  { slug: 'hafsa-guardian', order: 9, name: 'Hafsa', era: 'Madinah',
    title: 'Hafsa — Guardian of the Sheets',
    arabic: 'حَارِسَةُ الْمُصْحَفِ', translit: 'Harisatul-mushaf.',
    summary: 'Umar’s widowed daughter married to the Prophet ﷺ — fasting, praying keeper of the first Quran sheets, whose copy anchored Uthman’s codex.',
    narrative: [
      'Hafsa — widowed young at Badr — married the Prophet ﷺ through her father Umar’s grief and Uthman’s demurral; revelation itself approved the union. Fasting, praying, devoted: “she is your wife in Paradise,” Jibril told him of her rank.',
      'Abu Bakr entrusted the first gathered sheets (suhuf) of the Quran to her keeping after the Yamama collection — the ummah’s master copy sleeping in a widow’s chest. When Uthman standardised the codex, her sheets were the benchmark borrowed, copied, and returned.',
      'Her copy’s authority settled disputes of arrangement and wording — one woman’s custody securing the Book for fourteen centuries. Guardianship as worship.',
      'Dying in Madinah (45 AH), buried in Baqi — the keeper whose keeping outlived empires.',
    ],
    events: [
      'The marriage: revelation approves Umar’s grieving offer.',
      'The rank: “your wife in Paradise” — fasting, praying.',
      'The chest: Yamama’s sheets entrusted to her keeping.',
      'The benchmark: Uthman’s codex copied from her copy.',
      'Baqi (45 AH): the keeper rests; the kept remains.',
    ],
    lessons: [
      'Custody is worship: one chest can anchor a Book.',
      'Fasting widows outrank idle queens — devotion first.',
      'Lend master copies: benchmarks only work when shared.',
    ],
    references: 'Sahih al-Bukhari (Quran collection; Hafsa’s sheets; Uthmanic codex)',
    aliases: ['hafsa story', 'hazrat hafsa mushaf', 'guardian of quran sheets'],
    motif: 'tablet', accent: '#4E7FA6' },
  { slug: 'zaynab-jahsh', order: 10, name: 'Zaynab', era: 'Madinah',
    title: 'Zaynab bint Jahsh — Married by Revelation',
    arabic: 'زَوَّجْنَاكَهَا', translit: 'Zawwajnakaha.',
    summary: 'Cousin of the Prophet ﷺ, married by Quranic verse itself — most generous giver among the wives, whose charity outlived her into every Ramadan.',
    narrative: [
      'Zaynab bint Jahsh — the Prophet’s cousin, first married to Zayd — was wed to the Prophet by revelation itself: “We married her to you” (33:37), ending adoption-as-lineage and honouring her above arrangement. Heaven officiated.',
      'Proud of it gently: “Your families married you; Allah married me from above seven heavens.” Pride in divine arrangement, never in blood.',
      'Her hands never stopped: tanning hides, stitching leather, feeding the poor from her craft — the Prophet foretold the longest-handed (most generous) would join him first. She died first among the wives after him (20 AH) — prophecy and purse aligned.',
      'Umar’s-era stipends she split among the needy before sunset; Aisha wept at her bier: the praiseworthy, fasting, praying shelter of orphans gone.',
    ],
    events: [
      'The verse: married by revelation (33:37) — heaven officiates.',
      'The pride: “Allah married me from above seven heavens.”',
      'The craft: leather-work funding endless charity.',
      'The prophecy: longest-handed joins him first — fulfilled (20 AH).',
      'The bier: Aisha’s tears for the orphans’ shelter.',
    ],
    lessons: [
      'Divine arrangement outranks family arrangement — trust the verse.',
      'Craft funds charity: leather stitches fed Madinah.',
      'Generosity is measurable: longest-handed, first to follow.',
    ],
    references: 'Quran 33:37; Sahih al-Bukhari and Sahih Muslim (virtues of Zaynab, longest-handed hadith)',
    aliases: ['zaynab bint jahsh story', 'hazrat zainab prophet wife', 'longest handed charity'],
    motif: 'veil', accent: '#7A6F9B' },
  { slug: 'umm-salamah-counsel', order: 11, name: 'Umm Salamah', era: 'Madinah',
    title: 'Umm Salamah — Counsel That Saved a Day',
    arabic: 'الْحِكْمَةُ', translit: 'Al-hikmah.',
    summary: 'Widow of Uhud’s martyr, wife of the Prophet ﷺ — whose single counsel at Hudaybiyyah unblocked the companions, and whose memory preserved a library of hadith.',
    narrative: [
      'Hind — Umm Salamah — migrated twice with husband Abu Salamah, enduring separation crueller than Uhud: a year apart, child seized, caravan split — until Madinah reunited them. Widowed at Uhud, she prayed the taught dua for better replacement — and received the Prophet himself.',
      'At Hudaybiyyah, when the treaty’s terms stunned the companions into disobedience — none rising to slaughter and shave — the Prophet withdrew troubled. Umm Salamah counselled: go out, say nothing, sacrifice and shave yourself. He did; all followed. One woman’s counsel saved the day revelation later named victory.',
      'Scholar thereafter: nearly four hundred hadith, consulted by companions on law and interpretation — the jurist of the household. Her narrations anchor purification, fasting and family law.',
      'Last of the Mothers to die (62 AH) — counsel, scholarship, and longevity: the ummah’s grandmother.',
    ],
    events: [
      'The separation: a year split — caravan, child, husband apart.',
      'The replacement: taught dua answered with the Prophet himself.',
      'The counsel: “go out, sacrifice, shave” — Hudaybiyyah unblocked.',
      'The school: ~400 hadith on law and family.',
      '62 AH: last of the Mothers — grandmother of the ummah.',
    ],
    lessons: [
      'Counsel kings in crises: one sentence can move armies.',
      'Act, don’t argue: sacrifice first, followers second.',
      'Widowhood can be promotion: replacement beyond imagination.',
    ],
    references: 'Sahih al-Bukhari and Sahih Muslim (Umm Salamah narrations; Hudaybiyyah counsel in Seerah)',
    aliases: ['umm salamah story', 'hazrat umme salma', 'hudaybiyyah counsel wife'],
    motif: 'hands', accent: '#8C9B6E' },
  { slug: 'safiyyah-dignity', order: 12, name: 'Safiyyah', era: 'Madinah',
    title: 'Safiyyah — Dignity After Khaybar',
    arabic: 'إِنَّكِ لَابْنَةُ نَبِيٍّ', translit: 'Innaki labnatu nabiyy.',
    summary: 'Niece of Musa’s line through Harun, freed and married after Khaybar — who answered mockery of her Jewish past with lineage no one could match.',
    narrative: [
      'Safiyyah — daughter of Huyayy, descendant of Harun — was taken at Khaybar, freed by the Prophet ﷺ, and married with freedom as dowry. A dream she once told — the moon falling into her lap — was interpreted as this marriage; her husband’s slap for it became testimony.',
      'Mocked once as “Jewess” by a co-wife’s jealousy, she wept — and the Prophet taught her answer: my father is Harun, my uncle Musa, my husband Muhammad. Lineage beyond mockery, spoken gently.',
      'Generous and God-conscious: manumitting, feeding, fasting — her Jewish kinship acknowledged without apology, her Islam complete without rupture. Identity held whole.',
      'Dying in Madinah (50 AH), buried in Baqi — dignity’s proof that pasts are curricula, not chains.',
    ],
    events: [
      'The dream: moon in the lap — marriage foretold, slap endured.',
      'The freedom: manumitted, married — dowry of liberty.',
      'The answer: “my father is Harun” — mockery outranked.',
      'The generosity: manumitting, feeding, fasting on.',
      'Baqi (50 AH): past as curriculum, never chain.',
    ],
    lessons: [
      'Answer mockery with lineage of deeds, gently.',
      'Freedom as dowry: liberty is wealth enough.',
      'Pasts are curricula: convert history into honour.',
    ],
    references: 'Sunan al-Tirmidhi (virtues of Safiyyah); Ibn Hisham’s Seerah (Khaybar)',
    aliases: ['safiyyah story', 'hazrat safia prophet wife', 'khaybar safiyyah'],
    motif: 'tent', accent: '#A08BC0' },
];

export function womanBySlug(slug: string) {
  return WOMEN.find((w) => w.slug === slug);
}
export function womenByEra(era: WomenEra) {
  return WOMEN.filter((w) => w.era === era);
}
export function prevWoman(order: number) {
  return WOMEN.find((w) => w.order === order - 1) ?? null;
}
export function nextWoman(order: number) {
  return WOMEN.find((w) => w.order === order + 1) ?? null;
}
