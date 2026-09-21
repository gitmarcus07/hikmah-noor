/* Islamic Guides (Learn) - step-by-step topics in the Six Kalimas booklet tradition: prayer, purification, fasting, zakat, Hajj, family rites. Hub -> category -> one SEO page per topic. */
export interface GuideSection { h: string; ps: string[]; }
export interface GuideFaq { q: string; a: string; }
export interface GuideCat { slug: string; title: string; desc: string; icon: string; }
export interface Guide {
  slug: string; cat: string; title: string; intro: string;
  sections: GuideSection[]; steps?: string[];
  ref: string; faq: GuideFaq[]; aliases?: string[];
}
export const GUIDE_CATS: GuideCat[] = [
  { slug: 'salah', title: 'Prayer (Salah)', desc: 'Wudu, ghusl, adhan and how to pray - step by step.', icon: 'quran' },
  { slug: 'duties', title: 'Pillars in Practice', desc: 'Fasting, zakat, Hajj and funeral prayer, simply explained.', icon: 'star' },
  { slug: 'family', title: 'Family and New Life', desc: 'Marriage, newborn and end-of-life rites.', icon: 'heart' },
];
export const GUIDES: Guide[] = [
  { slug: 'how-to-pray-namaz', cat: 'salah', title: 'How to Pray Namaz - Step by Step',
    intro: 'Namaz (salah) is the five-times-daily prayer - the second pillar of Islam and the first deed judged on the Last Day. This guide walks through a complete two-rakah prayer exactly as taught by the Prophet, peace be upon him.',
    sections: [
      { h: 'Before you begin', ps: ['You need wudu (ablution), clean clothes and body, a clean place, and to face the qibla. Know which prayer and how many rakahs you are praying - Fajr 2, Zuhr 4, Asr 4, Maghrib 3, Isha 4.', 'Make the intention (niyyah) in your heart for the specific prayer. Women pray the same steps with modest posture differences taught in their tradition.'] },
      { h: 'What invalidates the prayer', ps: ['Speaking deliberately, laughing, eating or drinking, turning the chest away from the qibla, and losing wudu all break the prayer - repeat wudu and pray again.', 'Small doubts about rakah count are fixed by sujood as-sahw (prostration of forgetfulness) at the end; learn its exact method from a teacher.'] },
    ],
    steps: ['Raise both hands to the ears saying Allahu Akbar (takbir) and fold them below the navel.', 'Recite Sana, then Surah Al-Fatiha, then any short surah - standing (qiyam).', 'Bow (ruku) saying Subhana Rabbiyal-Azim three times, back level.', 'Stand straight (qawmah), then prostrate (sajdah) saying Subhana Rabbiyal-Ala three times - forehead, nose, palms, knees and toes on the ground.', 'Sit briefly (jalsa), prostrate a second time, then stand for the second rakah.', 'After two rakahs sit and recite Tashahhud, Durood-e-Ibrahim and a dua, then turn the face right and left saying As-salamu alaykum wa rahmatullah.'],
    ref: 'Quran 2:43; prayer described in Sahih al-Bukhari and Sahih Muslim',
    faq: [
      { q: 'How many rakahs are in each prayer?', a: 'Fajr 2, Zuhr 4, Asr 4, Maghrib 3, Isha 4 obligatory rakahs - plus established sunnah rakahs before and after.' },
      { q: 'What should I recite in prayer?', a: 'Surah Al-Fatiha in every rakah followed by another passage, plus Sana, Tashahhud, Durood and duas - exact wordings are on our dua pages.' },
      { q: 'Do men and women pray identically?', a: 'The structure is the same; posture details for women (hands, prostration, sitting) are taught traditionally - learn them from a qualified teacher.' },
    ],
    aliases: ['namaz ka tarika', 'how to pray salah', 'namaz padhne ka tarika', 'namaz steps', 'salah steps'] },
  { slug: 'wudu-ablution', cat: 'salah', title: 'Wudu (Ablution) - Step by Step',
    intro: 'Wudu is the ritual washing required before prayer. The Quran names its four essentials; the sunnah adds the order, repetition and supplications that complete it.',
    sections: [
      { h: 'The four essentials', ps: ['Washing the face, washing both arms to the elbows, wiping a quarter of the head, and washing both feet to the ankles - these four are obligatory by the verse of wudu.', 'Intention in the heart and saying Bismillah at the start, washing each part three times, rinsing the mouth and nose, and rubbing between fingers and toes complete the sunnah method.'] },
      { h: 'What breaks wudu', ps: ['Natural discharges, deep sleep while reclining, loss of consciousness, and loud laughter in prayer break wudu and require repeating it.', 'Doubt alone does not break wudu - certainty is not lifted by doubt.'] },
    ],
    steps: ['Make intention and say Bismillah, then wash both hands to the wrists three times.', 'Rinse the mouth three times and clean the nose with water three times.', 'Wash the whole face three times, hairline to chin and ear to ear.', 'Wash the right arm then the left arm to above the elbows, three times each.', 'Wipe a quarter of the head once, then wipe the ears.', 'Wash the right foot then the left foot to above the ankles, three times each, rubbing between the toes.'],
    ref: 'Quran 5:6; method detailed in Sahih al-Bukhari and Sahih Muslim',
    faq: [
      { q: 'What is the dua before and after wudu?', a: 'Begin with Bismillah. After finishing, the testimony dua opens the eight gates of Paradise - both duas are on our site with Arabic and meaning.' },
      { q: 'Can I wipe over socks?', a: 'Wiping over leather socks (khuffain) for a day and night as a resident is established, with conditions - learn them from a scholar.' },
      { q: 'Does touching the phone break wudu?', a: 'No. Only the recognised breakers - discharges, deep sleep, unconsciousness - break wudu.' },
    ],
    aliases: ['wuzu ka tarika', 'how to do wudu', 'wudu steps', 'wuzu ke faraiz'] },
  { slug: 'ghusl-bath', cat: 'salah', title: 'Ghusl (Ritual Bath) - When and How',
    intro: 'Ghusl is the full ritual bath that lifts major impurity. It becomes obligatory after marital relations, wet dreams, menstruation and postpartum bleeding - and is sunnah for Friday and Eid.',
    sections: [
      { h: 'When ghusl is required', ps: ['Major impurity blocks prayer, Quran recitation and fasting-related worship until ghusl is done - so learn its signs and do it promptly.', 'Friday ghusl, Eid ghusl and ghusl before ihram are recommended, not obligatory.'] },
      { h: 'The sunnah method', ps: ['Intention, Bismillah, washing the hands and private parts, then a complete wudu, then pouring water over the whole body three times - starting with the head - so no spot stays dry.', 'Women need not undo braided hair if water reaches the roots; rings and earrings should be moved so water passes beneath.'] },
    ],
    steps: ['Make intention and say Bismillah, wash both hands and the private parts.', 'Perform a complete wudu as for prayer.', 'Pour water over the head three times, rubbing so it reaches the roots.', 'Pour water over the right shoulder then the left, washing the entire body three times with no dry spot left.'],
    ref: 'Method in Sahih al-Bukhari and Sahih Muslim (ghusl of the Prophet, peace be upon him)',
    faq: [
      { q: 'Is ghusl required after every wet dream?', a: 'Yes, if fluid is discharged. A dream without discharge needs nothing.' },
      { q: 'Can I delay ghusl?', a: 'Delay is disliked without excuse - pray on time. Junub persons avoid prayer, fasting-touch and mosque stay until ghusl.' },
      { q: 'Does ghusl replace wudu?', a: 'A sunnah ghusl done with wudu covers prayer. Scholars differ if ghusl alone suffices - doing wudu inside ghusl removes all doubt.' },
    ],
    aliases: ['ghusl ka tarika', 'how to do ghusl', 'fard ghusl', 'ghusl ke faraiz'] },
  { slug: 'tayammum-dry-ablution', cat: 'salah', title: 'Tayammum (Dry Ablution) - When and How',
    intro: 'When water is missing or its use would cause harm - travel, illness, extreme cold - Allah permitted tayammum: purification with clean earth instead of water.',
    sections: [
      { h: 'When tayammum is allowed', ps: ['No water within reach, water needed for drinking, illness or wounds that water would harm, or cold that would cause sickness - then tayammum stands in for wudu or ghusl.', 'As soon as water becomes available or the excuse ends, the concession ends - pray with water from then on.'] },
      { h: 'The method', ps: ['Intend purification, say Bismillah, strike both palms once on clean dust, stone or earth, blow off excess, wipe the whole face, then wipe both hands to the wrists.', 'One tayammum covers one prayer time in the Hanafi school; other schools allow more - follow your school and teachers.'] },
    ],
    steps: ['Make intention for purification and say Bismillah.', 'Strike both palms once on clean earth, dust or stone.', 'Wipe the entire face once with both palms.', 'Wipe the right hand with the left up to the wrist, then the left with the right.'],
    ref: 'Quran 4:43 and 5:6; Sahih al-Bukhari and Sahih Muslim',
    faq: [
      { q: 'Can I do tayammum on a wall or dust on luggage?', a: 'Yes - anything of the earth\u2019s kind carrying dust, including stone, unbaked clay and dusty surfaces.' },
      { q: 'Does tayammum break like wudu?', a: 'Yes - the same breakers apply, plus finding water or the excuse ending.' },
      { q: 'Tayammum or makeup prayers later?', a: 'Pray on time with tayammum when it is valid - that prayer is complete and is not repeated in the Hanafi school.' },
    ],
    aliases: ['tayammum ka tarika', 'how to do tayammum', 'matti se wuzu'] },
  { slug: 'adhan-iqamah', cat: 'salah', title: 'Adhan and Iqamah - Words and Etiquette',
    intro: 'The adhan announces each prayer and the iqamah announces its start. Repeating their words, sending blessings on the Prophet, and asking his intercession carry immense reward.',
    sections: [
      { h: 'The words', ps: ['Allahu Akbar four times, the two testimonies twice each, Hayya alas-salah and Hayya alal-falah twice each, then Allahu Akbar twice and La ilaha illallah once - in Fajr, As-salatu khayrum-minan-nawm is added twice.', 'The iqamah repeats the same phrases mostly once, adding Qad qamatis-salah twice before the final takbirs.'] },
      { h: 'Answering the call', ps: ['Repeat the muazzin\u2019s words silently, except at the two Hayya phrases where you say La hawla wa la quwwata illa billah.', 'After the adhan, send durood on the Prophet and recite the wasilah dua - his intercession becomes due for you.'] },
    ],
    steps: ['Stop talking and worldly activity when the adhan begins.', 'Repeat each phrase after the muazzin; say La hawla at the Hayya phrases.', 'Send blessings (durood) on the Prophet, peace be upon him.', 'Recite the wasilah dua after adhan and make personal dua before iqamah.'],
    ref: 'Sahih al-Bukhari and Sahih Muslim (adhan, its reply and the wasilah dua)',
    faq: [
      { q: 'What is the dua after adhan?', a: 'Allahumma Rabba hadhihid-da\u2019watit-tammah - asking the praiseworthy station (wasilah) for the Prophet. Its Arabic and meaning are on our dua pages.' },
      { q: 'Should women give adhan?', a: 'Adhan and iqamah are a communal duty of men; women pray with iqamah said quietly according to many scholars.' },
      { q: 'Can I talk during adhan?', a: 'Listening and replying is sunnah; idle talk during it is disliked - pause and answer the call.' },
    ],
    aliases: ['azan ke alfaaz', 'adhan words', 'dua after azan', 'iqamat ke alfaaz'] },
  { slug: 'janaza-prayer', cat: 'salah', title: 'Janaza (Funeral Prayer) - Step by Step',
    intro: 'The funeral prayer is a communal obligation (fard kifayah): four takbirs with no bowing or prostration, prayed for every deceased Muslim - seeking their forgiveness.',
    sections: [
      { h: 'The four takbirs', ps: ['After the first takbir recite Thana; after the second send Durood-e-Ibrahim; after the third make heartfelt dua for the deceased; after the fourth say salam to both sides.', 'The body lies in front of the imam - in front of the row if one body, with the imam level with the head for a man and the middle for a woman.'] },
      { h: 'Burial and after', ps: ['Lower the body saying Bismillah wa ala millati rasulillah, fill the grave, and make dua for steadfastness - the deceased benefits from the dua of the living.', 'Condole the family with words like Inna lillahi wa inna ilayhi raji\u2019un, visit the grave, and keep praying for the departed.'] },
    ],
    steps: ['Make intention for the funeral prayer and say the first takbir, folding hands.', 'Recite Thana (Subhanakallahumma) silently.', 'Say the second takbir and recite Durood-e-Ibrahim.', 'Say the third takbir and make dua for the deceased and all Muslims.', 'Say the fourth takbir, pause briefly, then salam to the right and left.'],
    ref: 'Sahih al-Bukhari and Sahih Muslim (funeral prayer and burial)',
    faq: [
      { q: 'What dua is read in janaza?', a: 'Any sincere dua works; the famous Allahummaghfir li-hayyina wa mayyitina and the long Allahumma-ghfir lahu supplication are established - both on our dua pages.' },
      { q: 'Can women attend janaza prayer?', a: 'Women may pray janaza where facilities allow; scholars differ on following the funeral procession - follow local scholarship.' },
      { q: 'What should I say to the grieving family?', a: 'Console them, remind them of reward with patience, and avoid wailing - quiet tears are permitted.' },
    ],
    aliases: ['janaza namaz ka tarika', 'funeral prayer islam', 'namaz e janaza', 'mayyat ki namaz'] },
  { slug: 'roza-fasting', cat: 'duties', title: 'Roza (Fasting) - Rules Made Simple',
    intro: 'Fasting Ramadan - abstaining from food, drink and marital relations from true dawn to sunset with intention - is the fourth pillar of Islam, prescribed for taqwa.',
    sections: [
      { h: 'The fast itself', ps: ['Make intention at night (or before midday for voluntary fasts), take sehri before dawn, and open at sunset - hastening iftar and delaying sehri are both sunnah.', 'Eating, drinking, marital relations and deliberate vomiting break the fast and need makeup (qada); deliberate intercourse additionally needs expiation (kaffarah). Forgetful eating does not break it.'] },
      { h: 'Who is excused', ps: ['The sick, travelers, pregnant and nursing women fearing harm, the elderly unable to fast, and menstruating women skip fasting - most make it up later, while the chronically unable feed a poor person per day (fidyah).', 'Laylatul Qadr in the last ten nights outweighs a thousand months - seek it in worship, especially the odd nights.'] },
    ],
    steps: ['Make the intention of fasting at night.', 'Eat sehri and stop at true dawn (Fajr adhan).', 'Guard the tongue, eyes and limbs all day - fasting is worship of the whole body.', 'Open the fast at sunset with dates and water, saying the iftar dua.'],
    ref: 'Quran 2:183-185; Sahih al-Bukhari and Sahih Muslim',
    faq: [
      { q: 'Does an injection or eye drops break the fast?', a: 'Most contemporary scholars say non-nutritional injections and drops do not break it; nutritional IVs do - consult scholars for medical cases.' },
      { q: 'What is fidyah and kaffarah?', a: 'Fidyah feeds one poor person per missed fast for the chronically unable; kaffarah for deliberate intercourse is freeing a slave, else fasting 60 consecutive days, else feeding 60 poor.' },
      { q: 'When is Laylatul Qadr?', a: 'In the last ten nights of Ramadan, most hoped on the odd nights - worship, dua and the Allahumma innaka afuwwun supplication.' },
    ],
    aliases: ['roza ke masail', 'fasting rules islam', 'what breaks fast', 'roza kin cheezon se tootata hai'] },
  { slug: 'zakat-essentials', cat: 'duties', title: 'Zakat Essentials - Who Pays, How Much, To Whom',
    intro: 'Zakat - 2.5% of qualifying wealth held for a lunar year above the nisab - purifies wealth and funds the eight eligible categories named in the Quran.',
    sections: [
      { h: 'The calculation', ps: ['Nisab is the minimum threshold (value of 87.48g gold or 612.36g silver); wealth above it held for one hijri year pays 2.5% on cash, gold, silver, trade goods and investments - each asset class has details.', 'Debts due, immediate expenses and personal-use items are excluded; harvest has ushr (5-10%) and livestock its own schedule.'] },
      { h: 'The eight recipients', ps: ['The poor, the needy, zakat workers, those whose hearts are to be reconciled, freeing captives, debtors, in the path of Allah, and stranded travelers - Quran 9:60.', 'Parents, children and spouses cannot receive your zakat; give it to the eligible around you first, then further.'] },
    ],
    steps: ['List all zakatable assets on your zakat date (one lunar year after you first owned nisab).', 'Subtract immediate debts and dues.', 'Check the total against nisab; if above, pay 2.5% to eligible recipients.', 'Use our calculators for gold, silver, cash, business, harvest and livestock.'],
    ref: 'Quran 9:60; Sahih al-Bukhari and Sahih Muslim (zakat rulings)',
    faq: [
      { q: 'Is zakat due on my house and car?', a: 'No - personal-use assets are exempt; only growing or held wealth (cash, gold, trade goods, investments) counts.' },
      { q: 'Gold or silver nisab - which one?', a: 'Scholars differ; the silver nisab includes more people and benefits the poor - our calculator shows both.' },
      { q: 'Can I pay zakat to my brother or masjid?', a: 'Needy siblings may receive it; masjids only if the funds reach the eligible poor, not for construction.' },
    ],
    aliases: ['zakat ka nisab', 'zakat rules', 'zakat calculator', 'zakat kin ko dein'] },
  { slug: 'hajj-umrah-basics', cat: 'duties', title: 'Hajj and Umrah Basics - Steps in Order',
    intro: 'Hajj is obligatory once for the able; Umrah can be done anytime. Both revolve around ihram, tawaf of the Kaaba, sa\u2019i between Safa and Marwah, and shaving or trimming.',
    sections: [
      { h: 'Umrah in four acts', ps: ['Enter ihram from the miqat with intention and talbiyah; perform tawaf (seven circuits) starting at the Black Stone; pray two rakahs, drink Zamzam; do sa\u2019i (seven rounds); then shave or trim - Umrah is complete.', 'Avoid the ihram prohibitions: stitched clothing for men, perfume, hunting, marital relations and quarreling.'] },
      { h: 'Hajj in brief', ps: ['8th Dhul-Hijjah (Tarwiyah): ihram and Mina. 9th (Arafah): the standing at Arafat - the heart of Hajj - until sunset, then Muzdalifah. 10th: stoning Jamarat al-Aqabah, sacrifice, shave, tawaf al-ifadah. 11th-13th: stoning all three jamarat and farewell tawaf.', 'Hajj needs physical and financial ability and a mahram arrangement for women per school rulings - plan through licensed groups.'] },
    ],
    steps: ['Enter ihram at the miqat with intention and talbiyah.', 'Perform tawaf: seven circuits around the Kaaba.', 'Pray two rakahs, drink Zamzam, then do sa\u2019i between Safa and Marwah.', 'Shave (halq) or trim (taqsir) to exit ihram.'],
    ref: 'Quran 3:97; Hajj described in Sahih al-Bukhari and Sahih Muslim',
    faq: [
      { q: 'What is the best dua of Arafah?', a: 'La ilaha illallah wahdahu la sharika lah - the Prophet called it the best supplication of the day of Arafah.' },
      { q: 'Can children perform Umrah?', a: 'Yes - guardians enter ihram for them and perform the rites on their behalf.' },
      { q: 'What breaks Umrah?', a: 'Violating ihram restrictions needs expiation (dam) per the violation - the talbiyah, tawaf and sa\u2019i duas are on our dua pages.' },
    ],
    aliases: ['hajj ka tarika', 'umrah ka tarika', 'how to do umrah', 'hajj steps'] },
  { slug: 'nikah-marriage', cat: 'family', title: 'Nikah (Islamic Marriage) - Pillars and Mahr',
    intro: 'Nikah joins spouses in a solemn covenant (mithaqan ghaliza). Its pillars - proposal and acceptance, mahr, witnesses and guardianship - protect the rights of both families.',
    sections: [
      { h: 'The contract', ps: ['Offer (ijab) and acceptance (qubul) in one sitting, a mahr gift from groom to bride, two male witnesses (or one male and two female), and the bride\u2019s guardian (wali) - required by most schools, recommended by all.', 'Announce the marriage publicly; secret marriages without witnesses are invalid in mainstream scholarship. Register it legally in your country too.'] },
      { h: 'Mahr and living', ps: ['Mahr is the bride\u2019s exclusive right - prompt or deferred, modest is blessed; the best marriages are the easiest in burden.', 'Spouses owe love, mercy, maintenance and good company; disputes go first to family arbitration, then qualified scholars or courts.'] },
    ],
    steps: ['Agree the mahr and terms openly with both families.', 'Conclude ijab and qubul before witnesses with the wali present.', 'Announce it (walima feast is sunnah) and document it legally.', 'Begin married life with the newlywed dua and gratitude to Allah.'],
    ref: 'Quran 4:4 (mahr); Sahih al-Bukhari and Sahih Muslim (marriage rulings)',
    faq: [
      { q: 'Is wali required for nikah?', a: 'Most schools require the bride\u2019s guardian; the Hanafi school validates an adult woman\u2019s self-marriage but strongly recommends the wali - consult scholars for your case.' },
      { q: 'What is a reasonable mahr?', a: 'Whatever both agree - modest mahr carries more blessing; it belongs solely to the bride.' },
      { q: 'Is court marriage enough?', a: 'Civil registration protects rights but the shariah pillars - ijab, qubul, mahr, witnesses - must all be fulfilled.' },
    ],
    aliases: ['nikah ka tarika', 'islamic marriage rules', 'mahr kitna ho', 'shaadi islam'] },
  { slug: 'aqeeqah-newborn', cat: 'family', title: 'Aqeeqah and Newborn Sunnahs - The First 7 Days',
    intro: 'Welcoming a child follows beloved sunnahs: the adhan in the ear, tahnik, a good name, shaving the head and aqeeqah - each sealing the newborn\u2019s first days with worship.',
    sections: [
      { h: 'The first hours', ps: ['Say the adhan in the right ear and iqamah in the left, do tahnik (softened date on the palate), and make dua for the child - protection from Satan and righteousness.', 'Choose a good meaningful name - Abdullah, Abdur-Rahman and names of prophets and the righteous are most beloved.'] },
      { h: 'The seventh day', ps: ['Sacrifice two sheep for a boy and one for a girl, shave the baby\u2019s head and give silver equal to the hair\u2019s weight in charity, and announce the name.', 'If the seventh day is missed, the aqeeqah can be done later - scholars allow the 14th, 21st or whenever able.'] },
    ],
    steps: ['Say adhan/iqamah in the ears and do tahnik after birth.', 'Choose a good name with beautiful meaning.', 'On the seventh day: shave the head, give its weight in silver as charity.', 'Sacrifice the aqeeqah (two sheep for a boy, one for a girl) and share the meat.'],
    ref: 'Sunan Abu Dawud and Sunan al-Tirmidhi (aqeeqah rulings)',
    faq: [
      { q: 'Is aqeeqah obligatory?', a: 'It is strongly recommended (sunnah muakkadah) in mainstream scholarship, not obligatory - do it when able.' },
      { q: 'Can aqeeqah be delayed?', a: 'Yes - the 7th is best, then the 14th, then the 21st; delay beyond that is still rewarded.' },
      { q: 'Boy and girl - any difference?', a: 'Two sheep for a boy and one for a girl is the established sunnah; the rest of the rites are identical.' },
    ],
    aliases: ['aqeeqah ka tarika', 'newborn sunnahs', 'bache ki aqeeqah', 'naam rakhna'] },
];
export function guideCat(slug: string) {
  return GUIDE_CATS.find((c) => c.slug === slug);
}
export function guidesByCat(cat: string) {
  return GUIDES.filter((g) => g.cat === cat);
}
export function getGuide(cat: string, slug: string) {
  return GUIDES.find((g) => g.cat === cat && g.slug === slug);
}
