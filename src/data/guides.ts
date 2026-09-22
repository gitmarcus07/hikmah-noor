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
  { slug: 'tahajjud-night-prayer', cat: 'salah', title: 'Tahajjud (Night Prayer) - Time, Rakahs and Method',
    intro: 'Tahajjud is the night prayer after sleeping - the best prayer after the obligatory ones, prayed in the last part of the night when Allah descends to the lowest heaven answering whoever calls.',
    sections: [
      { h: 'When and how many', ps: ['Sleep first, then rise in the last third of the night - divide the night between Maghrib and Fajr into thirds; the last third is the hour of answering. Pray two rakahs at a time (2+2), most commonly eight, then close with Witr - the Prophet, peace be upon him, generally prayed eleven in total including Witr.', 'Begin with two short rakahs, recite long and calmly, and end before Fajr begins - even two rakahs consistently outweigh long occasional nights.'] },
      { h: 'The method', ps: ['Use miswak, make wudu, and open with the night-prayer opening dua (Allahumma laka alhamdu anta qayyimus-samawat) - its Arabic is on our dua pages.', 'After every two rakahs rest briefly; finish with one or three Witr, then make personal dua - the last third is when dua is answered, so ask for everything.'] },
    ],
    steps: ['Sleep, then rise in the last third of the night and make wudu.', 'Pray two short opening rakahs, then two-by-two up to eight with calm recitation.', 'Recite the night-prayer opening dua and make long sujood with personal duas.', 'Close with Witr (one or three rakahs with qunut dua).', 'End with istighfar and dua before Fajr - the hour of answering.'],
    ref: 'Sahih al-Bukhari and Sahih Muslim (night prayer; Allah’s descent in the last third)',
    faq: [
      { q: 'Exactly when is the last third of the night?', a: 'From Maghrib to Fajr, divide into three equal parts - the final part (often 2-4am) is the last third. If unsure, the final 90 minutes before Fajr safely fall inside it.' },
      { q: 'How many rakahs is Tahajjud?', a: 'Two at a time with no fixed maximum; eight plus three Witr follows the Prophet’s common practice, while two rakahs consistently is the minimum beloved deed.' },
      { q: 'Can I pray Tahajjud without sleeping first?', a: 'Night prayer without sleep is Qiyam al-Layl and fully rewarded; Tahajjud specifically means rising after sleeping - scholars differ on the naming, not the reward.' },
    ],
    aliases: ['tahajjud ka tarika', 'tahajjud time', 'tahajjud rakats', 'tahajjud namaz method', 'qiyam ul layl'] },
  { slug: 'eid-prayer-method', cat: 'salah', title: 'Eid Prayer (Namaz-e-Eid) - Step by Step',
    intro: 'The Eid prayer - two rakahs in congregation with extra takbirs, followed by the khutbah - is wajib in the Hanafi school and a stressed communal sunnah in others, prayed on Eid al-Fitr and Eid al-Adha mornings.',
    sections: [
      { h: 'Before the prayer', ps: ['Take ghusl, wear your best clothes and apply perfume; on Eid al-Fitr eat an odd number of dates before leaving, on Eid al-Adha delay eating until after the sacrifice. Walk one route, return another, reciting the Eid takbirat aloud on the way.', 'The prayer is held in an open ground (Eidgah) or large mosque shortly after sunrise - arrive early, as there is no adhan or iqamah for Eid.'] },
      { h: 'The method and school differences', ps: ['Two rakahs: after the opening takbir recite Thana, then extra takbirs (seven in the first rakah and five in the second in Hanafi practice, before recitation; Shafi’i and Maliki count twelve total with different placement) - follow your school and imam.', 'Recite Al-Fatiha and a surah (Al-A’la then Al-Ghashiyah is sunnah), complete the rakahs, then sit through the khutbah - listening is part of the rite, unlike Jumuah where it precedes.'] },
    ],
    steps: ['Take ghusl, dress well, and eat dates (Fitr) before leaving for the Eidgah.', 'Make intention for Eid prayer and say the opening takbir with the imam.', 'Recite Thana, then say the extra takbirs raising hands each time.', 'Complete two rakahs with Fatiha and a surah in each.', 'Sit through the khutbah after salam, then embrace and congratulate fellow worshippers.'],
    ref: 'Sahih al-Bukhari and Sahih Muslim (Eid prayer, takbirat and khutbah)',
    faq: [
      { q: 'How many extra takbirs in Eid prayer?', a: 'Hanafi: three extra in each rakah (seven counting the opening, five in the second); Shafi’i/Maliki: twelve total with different placement. Pray behind your imam’s school.' },
      { q: 'Is the Eid khutbah obligatory to hear?', a: 'Staying for it is sunnah and strongly encouraged; leaving early does not invalidate the prayer.' },
      { q: 'Do women attend Eid prayer?', a: 'The Prophet commanded all women - including menstruating women (to witness goodness from aside) - to attend Eid; facilities and local scholarship decide arrangements.' },
    ],
    aliases: ['eid namaz ka tarika', 'eid ul fitr prayer method', 'namaz e eid', 'eid prayer rakats', 'eid ki namaz'] },
  { slug: 'taraweeh-night-prayer', cat: 'salah', title: 'Taraweeh - Method and the 8-or-20 Question',
    intro: 'Taraweeh is the Ramadan night prayer in congregation - prayed after Isha in sets with short rests (tarwihah), usually completing a Quran recitation across the month, closing with Witr.',
    sections: [
      { h: 'The method', ps: ['Pray two rakahs at a time with calm recitation, resting briefly every four - glorifying Allah in the pause (the Taraweeh dua on our dua pages). Most mosques complete twenty with Witr; pray what your mosque prays and stay till the imam finishes - you are recorded as praying the whole night.', 'Women and travelers may pray at home in the same 2-by-2 pattern; completing the Quran in Taraweeh is recommended, not required.'] },
      { h: 'Eight or twenty - the honest answer', ps: ['The Prophet prayed eleven at night including Witr (Bukhari/Muslim); Umar gathered the companions behind one imam for twenty plus Witr, and the companions agreed - which is why most mosques and all four schools’ majorities pray twenty.', 'Both numbers are established practice: eight follows the Prophet’s personal night count, twenty follows the companions’ consensus under Umar. Never quarrel over it - pray with your local mosque and follow qualified scholars.'] },
    ],
    steps: ['Pray Isha, then join Taraweeh intending Qiyam Ramadan.', 'Pray two rakahs at a time with measured recitation.', 'Rest every four rakahs with glorification and dua.', 'Stay until the imam finishes Witr - the full night is recorded for you.'],
    ref: 'Sahih al-Bukhari and Sahih Muslim (Qiyam Ramadan; Umar’s congregation in Muwatta Malik)',
    faq: [
      { q: 'Is Taraweeh 8 or 20 rakahs?', a: 'The Prophet’s night prayer was eleven including Witr; Umar’s congregation settled on twenty plus Witr with companions’ agreement. Majorities of all four schools pray twenty - follow your mosque without dispute.' },
      { q: 'Can women pray Taraweeh at home?', a: 'Yes - pray 2-by-2 at home with the same method; congregation is recommended where facilities allow.' },
      { q: 'What if I join late or miss some rakahs?', a: 'Join wherever the imam is and make up missed rakahs after - or complete Witr with the congregation and pray missed sets later.' },
    ],
    aliases: ['taraweeh ka tarika', 'taraweeh 8 or 20', 'tarawih rakats', 'taraweeh at home', 'qiyam ramadan'] },
  { slug: 'ihram-how-to', cat: 'duties', title: 'Ihram - How to Enter the Sacred State',
    intro: 'Ihram is the sacred state entered before Umrah or Hajj rites: intention, talbiyah, specific dress for men, and a set of prohibitions that last until release.',
    sections: [
      { h: 'Entering ihram', ps: ['Take ghusl, trim nails, apply perfume to the body (not the garments), and wear two unstitched cloths (men) or modest dress with face uncovered (women). Pray two rakahs, make intention for Umrah or Hajj, then recite the talbiyah aloud - you are now in ihram.', 'Enter at the miqat boundary for your route - Yalamlam, Qarn, Juhfah, Dhu al-Hulayfah or Dhat Irq - never pass it without ihram if intending rites.'] },
      { h: 'Prohibitions in ihram', ps: ['No stitched clothing, head covering (men) or face veil/gloves (women); no perfume, hair or nail cutting, no hunting, no marital relations, and no quarrelling - violations need fidyah (fasting, charity or sacrifice).', 'Keep reciting the talbiyah often until the rites begin; men raise the voice, women keep it low.'] },
    ],
    steps: ['Take ghusl and wear ihram garments at or before the miqat.', 'Pray two rakahs and make intention for Umrah or Hajj.', 'Recite the talbiyah aloud - ihram begins.', 'Observe all prohibitions until release from ihram.'],
    ref: 'Sahih al-Bukhari and Sahih Muslim (ihram, miqat, talbiyah, prohibitions)',
    faq: [
      { q: 'Where exactly is my miqat?', a: 'By your entry route: Madinah via Dhu al-Hulayfah, Yemen/India via Yalamlam, Najd via Qarn, Syria/Egypt via Juhfah, Iraq via Dhat Irq. Jeddah residents enter from home.' },
      { q: 'Can women cover their faces in ihram?', a: 'No face veil or gloves in ihram; they may lower a cloth over the face without touching it when non-mahram men pass, per established practice.' },
      { q: 'What releases me from ihram?', a: 'Completing Umrah (tawaf, sai, haircut) releases you; Hajj release comes after the stoning, sacrifice and tawaf of the Hajj day rites.' },
    ],
    aliases: ['ihram ka tarika', 'how to wear ihram', 'miqat rules', 'ihram prohibitions'] },
  { slug: 'tawaf-how-to', cat: 'duties', title: 'Tawaf - Seven Circuits Around the Kaaba',
    intro: 'Tawaf is seven counter-clockwise circuits around the Kaaba starting at the Black Stone - the heart of Umrah and Hajj, prayed through with dhikr and dua.',
    sections: [
      { h: 'The method', ps: ['Face the Black Stone, raise hands saying Allahu Akbar (or touch/kiss it if possible without harming others), then circle counter-clockwise seven times keeping the Kaaba on your left - walking briskly (raml) in the first three of arrival tawaf for men.', 'Between the Yemeni corner and the Black Stone recite Rabbana atina; elsewhere make any dhikr and personal dua - no fixed script is required.'] },
      { h: 'After tawaf', ps: ['Pray two rakahs behind Maqam Ibrahim (or anywhere in the mosque), drink Zamzam, then proceed to sai. Wudu is required for tawaf - renew it if broken mid-circuit and continue counting.'] },
    ],
    steps: ['Face the Black Stone with takbir to begin circuit one.', 'Circle counter-clockwise seven times with dhikr and dua.', 'Recite Rabbana atina between the Yemeni corner and the Stone.', 'Pray two rakahs, drink Zamzam, and head to Safa for sai.'],
    ref: 'Sahih al-Bukhari and Sahih Muslim (tawaf method, raml, Maqam Ibrahim prayer)',
    faq: [
      { q: 'Must I touch or kiss the Black Stone?', a: 'No - gesture from afar if crowded. Harming others to reach it is forbidden; the gesture carries the same opening.' },
      { q: 'Does tawaf need wudu?', a: 'Yes, wudu is required; renew it if broken and continue your count.' },
      { q: 'What if I lose count of circuits?', a: 'Build on the lower certain number (e.g. count 3 if unsure between 3 and 4) and complete seven.' },
    ],
    aliases: ['tawaf ka tarika', 'how to do tawaf', 'tawaf 7 circuits', 'umrah tawaf method'] },
  { slug: 'sai-how-to', cat: 'duties', title: 'Sai - Seven Walks Between Safa and Marwa',
    intro: 'Sai re-enacts Hajar’s search for water: seven passages between the hills of Safa and Marwa, brisk in the marked valley stretch for men.',
    sections: [
      { h: 'The method', ps: ['Climb Safa facing the Kaaba, praise Allah and make dua, then walk to Marwa - one passage; return makes two. Complete seven, ending at Marwa. Men jog lightly between the green-lit markers; women walk throughout.', 'Recite “Innas-safa wal-marwata min sha’airillah” at the start (2:158) and fill every passage with dhikr and personal dua - Hajar’s run is now your worship.'] },
      { h: 'After sai', ps: ['Men shave or trim the hair (shaving is more rewarded); women trim a fingertip-length. With that, Umrah is complete and ihram ends.'] },
    ],
    steps: ['Climb Safa, face the Kaaba, praise Allah and make dua.', 'Walk to Marwa (jog the green markers, men), return - count each passage.', 'Complete seven passages ending at Marwa.', 'Cut hair (shave preferred for men) - Umrah complete, ihram released.'],
    ref: 'Quran 2:158; Sahih al-Bukhari and Sahih Muslim (sai method)',
    faq: [
      { q: 'Do I need wudu for sai?', a: 'Sai is valid without wudu, unlike tawaf - though performing it pure is better.' },
      { q: 'Must women jog between the markers?', a: 'No - the brisk walk is for men only; women walk the whole route.' },
      { q: 'Where does Umrah end?', a: 'At Marwa after the haircut - ihram restrictions lift immediately.' },
    ],
    aliases: ['sai ka tarika', 'safa marwa method', 'umrah sai steps'] },
  { slug: 'mina-arafah-muzdalifah', cat: 'duties', title: 'Mina, Arafah & Muzdalifah - The Hajj Days',
    intro: 'The Hajj rites move through three stations: a day of preparation in Mina, the standing of Arafah (the Hajj itself), and the night of Muzdalifah gathering pebbles.',
    sections: [
      { h: '8th (Tarwiyah) to 9th (Arafah)', ps: ['On the 8th, enter Hajj ihram and spend the day and night in Mina praying each prayer on time (shortened, not combined). On the 9th, proceed to Arafah after sunrise and stand from noon to sunset in dua - “Hajj is Arafah.” Missing this standing invalidates the Hajj.', 'Arafah’s sermon and combined Zuhr-Asr precede hours of dua; the best dua is La ilaha illallah wahdahu la sharika lah - the Arafah supplication on our dua pages.'] },
      { h: 'Muzdalifah night', ps: ['After sunset leave calmly for Muzdalifah (no Maghrib on the way), pray Maghrib and Isha combined on arrival, rest under the sky, and gather pebbles for the stoning. Fajr is prayed early, followed by dua at Mash’ar al-Haram, then departure before sunrise.'] },
    ],
    steps: ['8th: enter Hajj ihram, spend the day and night in Mina.', '9th: stand at Arafah from noon to sunset in dua - the essence of Hajj.', 'After sunset go to Muzdalifah; combine Maghrib-Isha and rest.', 'Gather pebbles, pray Fajr early, make dua, leave before sunrise.'],
    ref: 'Sahih al-Bukhari and Sahih Muslim (Hajj of the Prophet ﷺ, Arafah standing, Muzdalifah)',
    faq: [
      { q: 'What if I miss the Arafah standing?', a: 'Missing Arafah from noon to Fajr invalidates that year’s Hajj - it must be repeated another year.' },
      { q: 'How many pebbles do I collect?', a: 'At least 49 (7 for the 10th + 21 each for the 11th and 12th), plus extras if staying the 13th - gather 70 to be safe.' },
      { q: 'Can the elderly skip Muzdalifah night?', a: 'The weak, elderly and their helpers may leave after midnight - an established concession.' },
    ],
    aliases: ['arafat ka din', 'wuquf e arafah', 'muzdalifah night', 'mina tent days', 'hajj days order'] },
  { slug: 'umrah-day-plan', cat: 'duties', title: 'Umrah in One Day - Complete Plan',
    intro: 'The full Umrah from miqat to haircut in order: ihram, tawaf, sai, release - typically completed in 2-4 hours, with timings that avoid the worst crowds.',
    sections: [
      { h: 'The order', ps: ['Enter ihram at the miqat with talbiyah, perform arrival tawaf (7 circuits), pray two rakahs, drink Zamzam, perform sai (7 passages Safa-Marwa), then cut hair - Umrah complete and ihram released.', 'Go between prayers (mid-morning or after Isha) for thinner crowds; keep wudu through tawaf and carry unscented essentials only.'] },
      { h: 'Common slips', ps: ['Passing the miqat without ihram, breaking wudu mid-tawaf unknowingly, miscounting circuits, and cutting hair before completing sai - each covered in our detailed tawaf, sai and ihram guides.'] },
    ],
    steps: ['Ihram at the miqat with talbiyah.', 'Tawaf: 7 circuits + 2 rakahs + Zamzam.', 'Sai: 7 passages Safa-Marwa.', 'Haircut - Umrah complete.'],
    ref: 'Sahih al-Bukhari and Sahih Muslim (Umrah method; see ihram, tawaf and sai guides)',
    faq: [
      { q: 'How long does Umrah take?', a: 'Usually 2-4 hours depending on crowds; night hours after Isha are calmest.' },
      { q: 'Can I do multiple Umrahs in one trip?', a: 'Yes - re-enter ihram from Tan’im (Masjid Aisha) for each additional Umrah.' },
      { q: 'What invalidates my Umrah?', a: 'Breaking ihram prohibitions deliberately (needs fidyah) or skipping a rite - tawaf, sai and haircut are all essential.' },
    ],
    aliases: ['umrah ka tarika', 'how to perform umrah', 'umrah step by step', 'umrah guide'] },
  { slug: 'hajj-day-by-day', cat: 'duties', title: 'Hajj Day by Day - 8th to 13th Timeline',
    intro: 'The complete Hajj timeline: Mina (8th), Arafah (9th), Muzdalifah night, stoning and sacrifice (10th), tashriq days (11th-13th) and farewell tawaf.',
    sections: [
      { h: '8th to 10th', ps: ['8th Tarwiyah: Hajj ihram, Mina day and night. 9th Arafah: standing noon to sunset, then Muzdalifah night with combined prayers and pebble gathering. 10th: stone the large pillar (7 pebbles), sacrifice, shave/cut (first release from ihram), then Tawaf al-Ifadah and sai of Hajj.', 'Order on the 10th is flexible - the Prophet ﷺ answered “do, no harm” to every order question that day.'] },
      { h: '11th to farewell', ps: ['11th-12th: stone all three pillars each afternoon (small, middle, large - 7 pebbles each, with dua after the first two). Leave Mina before sunset on the 12th if departing early, else stay the 13th and repeat. End with the farewell tawaf (Tawaf al-Wada) - obligatory for all but menstruating women.'] },
    ],
    steps: ['8th: Mina. 9th: Arafah standing, then Muzdalifah night.', '10th: stone the large pillar, sacrifice, haircut, Tawaf al-Ifadah.', '11th-12th: stone all three pillars each afternoon.', 'Farewell tawaf before leaving Makkah.'],
    ref: 'Sahih al-Bukhari and Sahih Muslim (Farewell Hajj sequence, stoning, farewell tawaf)',
    faq: [
      { q: 'Can I leave Mina on the 12th?', a: 'Yes - departing before sunset on the 12th is permitted; staying the 13th and stoning again is better.' },
      { q: 'What if I miss a stoning?', a: 'Make it up the same day or later in tashriq; deliberate omission without excuse needs fidyah - consult scholars.' },
      { q: 'Is farewell tawaf obligatory?', a: 'Yes for all pilgrims except menstruating women, who are excused.' },
    ],
    aliases: ['hajj ka tarika', 'hajj days 8 13', 'hajj step by step', 'stoning days'] },
  { slug: 'hajj-common-mistakes', cat: 'duties', title: 'Hajj & Umrah - 10 Common Mistakes',
    intro: 'The errors pilgrims repeat every year - pushing at the Black Stone, wudu lapses in tawaf, miscounted circuits, missed Arafah windows - and how to avoid each.',
    sections: [
      { h: 'Rites mistakes', ps: ['Harming others to kiss the Black Stone (gesture suffices), losing wudu mid-tawaf without renewing, miscounting circuits or sai passages (build on the lower certain number), and rushing Arafah (the standing window must be honoured - leaving before its end risks the Hajj itself).', 'Shaving before completing sai, skipping the farewell tawaf, and stoning carelessly instead of with calm takbir - all fixed by learning the method first.'] },
      { h: 'Conduct mistakes', ps: ['Quarrelling in crowds, wasting hours shopping over worship, neglecting the five prayers for voluntary rites, and photographing during worship - Hajj is patience training; every crowd is part of the exam.'] },
    ],
    steps: ['Learn tawaf, sai and stoning counts before traveling.', 'Never harm anyone for the Black Stone - gesture suffices.', 'Guard wudu through tawaf; build on lower counts when unsure.', 'Prioritise obligatory prayers over voluntary rites and photos.'],
    ref: 'Sahih al-Bukhari and Sahih Muslim (Hajj method; harming others forbidden in worship)',
    faq: [
      { q: 'I pushed someone at the Stone - is my tawaf valid?', a: 'The tawaf is valid, but harming Muslims is sinful - repent and gesture from afar next time.' },
      { q: 'I miscounted my tawaf - what now?', a: 'Complete to seven on the lower certain count; if long past, consult a scholar about makeup.' },
      { q: 'Are photos during Hajj allowed?', a: 'They distract from worship and violate others’ privacy - minimise them, especially in prayer and tawaf.' },
    ],
    aliases: ['hajj mistakes', 'umrah mistakes', 'common hajj errors', 'hajj me ghaltiyan'] },
  { slug: 'hajj-packing-checklist', cat: 'duties', title: 'Hajj & Umrah Packing Checklist',
    intro: 'Documents, ihram kit, medicines, money and worship essentials - the packing list that prevents the preventable problems of the journey.',
    sections: [
      { h: 'Documents and money', ps: ['Passport, visa, vaccination cards, hotel and transport vouchers (printed + phone copies), a money belt with riyals and a backup card, and emergency contacts written on paper - phones die, paper does not.', 'Keep medicines in original packaging with prescriptions; carry a basic first-aid kit, ORS sachets and pain relief - Mina’s clinics handle the rest.'] },
      { h: 'Worship kit', ps: ['Two ihram sets (men), unscented soap and toiletries, prayer mat, small Quran or dua book, tasbih counter, slippers that survive tawaf marble, and a drawstring bag for shoes at mosque doors.'] },
    ],
    steps: ['File documents: passport, visa, vaccines, vouchers, emergency contacts.', 'Pack ihram kit, unscented toiletries and tawaf-proof footwear.', 'Prepare medicines, ORS and first-aid with prescriptions.', 'Load worship kit: prayer mat, dua pages, tasbih, shoe bag.'],
    ref: 'Practical checklist compiled from Hajj ministry guidance and pilgrim experience; worship rulings per Sahih collections',
    faq: [
      { q: 'How many ihram sets do I need?', a: 'Two sets minimum - one to wear, one to wash and rotate.' },
      { q: 'Can I take regular medicines?', a: 'Yes, in original packaging with prescriptions; declare where required.' },
      { q: 'What should women pack additionally?', a: 'Modest loose abayas, headscarves that stay put in crowds, and safety pins - plus the same worship kit.' },
    ],
    aliases: ['hajj packing list', 'umrah packing checklist', 'hajj saman list', 'what to pack hajj'] },
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
