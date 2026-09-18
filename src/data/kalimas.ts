/* Hikmah Noor — The Six Kalimas library.
 * The six kalimas as taught in the traditional madrasa curriculum.
 * Sourcing honesty: kalimas 1–2 match hadith wordings directly; kalimas 3–6
 * are traditional compilation wordings whose component phrases come from the
 * Quran and hadith (noted per entry). No invented references.
 */
export type KalimaOrigin = 'quran' | 'hadith' | 'sahaba' | 'scholarly';
export type KalimaGrade = 'Quranic' | 'Sahih' | 'Hasan' | 'Daif' | 'Scholarly compilation';
export const KALIMA_ORIGIN_LABEL: Record<KalimaOrigin, string> = {
  quran: 'Quranic wording',
  hadith: 'Prophetic wording',
  sahaba: 'Companion wording',
  scholarly: 'Traditional compilation',
};
export interface Kalima {
  slug: string; num: number; title: string; short: string; use: string;
  arabic: string; translit: string; translation: string;
  virtue: string; source: string; when: string; repeat: string;
  origin: KalimaOrigin; narrator?: string; grade: KalimaGrade;
  aliases: string[];
}

export const KALIMAS: Kalima[] = [
  { slug: 'first-kalimah-tayyibah', num: 1, title: 'First Kalima Tayyibah (Purity)',
    short: 'Tayyibah',
    use: 'The declaration of faith — entry into Islam',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ',
    translit: 'La ilaha illallah, Muhammadur Rasulullah.',
    translation: 'None is worthy of worship but Allah; Muhammad is the Messenger of Allah.',
    virtue: 'Whoever’s last words are La ilaha illallah enters Paradise (Sunan Abu Dawud). Negation of all false gods, affirmation of Allah alone, and testimony to Muhammad’s messengership.',
    source: 'Sahih al-Bukhari and Sahih Muslim (core phrase)', when: 'Daily, teaching children, last words', repeat: 'Often',
    origin: 'hadith', grade: 'Sahih',
    aliases: ['pehla kalma', 'pehla kalima', 'first kalma', '1st kalima', 'kalma tayyab', 'la ilaha illallah'] },
  { slug: 'second-kalimah-shahadah', num: 2, title: 'Second Kalima Shahadah (Testimony)',
    short: 'Shahadah',
    use: 'The testimony recited in every tashahhud of salah',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    translit: 'Ashhadu an la ilaha illallah, wahdahu la sharika lah, wa ashhadu anna Muhammadan abduhu wa rasuluh.',
    translation: 'I bear witness that none is worthy of worship but Allah alone without partner, and I bear witness that Muhammad is His servant and Messenger.',
    virtue: 'The tashahhud wording taught by the Prophet himself — recited in every prayer, and its completion opens the eight gates of Paradise (Sahih Muslim, after wudu).',
    source: 'Sahih al-Bukhari and Sahih Muslim (tashahhud)', when: 'Every salah, after wudu, embracing Islam', repeat: 'Often',
    origin: 'hadith', narrator: 'Ibn Masud', grade: 'Sahih',
    aliases: ['dusra kalma', 'doosra kalma', 'second kalma', '2nd kalima', 'kalma shahadat', 'ashhadu alla ilaha'] },
  { slug: 'third-kalimah-tamjeed', num: 3, title: 'Third Kalima Tamjeed (Glorification)',
    short: 'Tamjeed',
    use: 'Glorification combining tasbih, tahmid, tahlil and hawqala',
    arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    translit: 'SubhanAllahi wal-hamdu lillahi, wa la ilaha illallah, wallahu Akbar. Wa la hawla wa la quwwata illa billahil-Aliyyil-Azim.',
    translation: 'Glory be to Allah, praise is for Allah, none is worthy of worship but Allah, and Allah is Greatest. There is no power nor strength except with Allah, the Most High, the Greatest.',
    virtue: 'Its phrases are among the most beloved words to Allah (Sahih Muslim) — the third kalima gathers them into one comprehensive glorification.',
    source: 'Traditional kalima curriculum; phrases from Sahih Muslim and Sahih al-Bukhari', when: 'Daily dhikr, after prayers', repeat: 'Often',
    origin: 'scholarly', grade: 'Scholarly compilation',
    aliases: ['tisra kalma', 'teesra kalma', 'third kalma', '3rd kalima', 'kalma tamjeed', 'subhanallah walhamdulillah'] },
  { slug: 'fourth-kalimah-tawheed', num: 4, title: 'Fourth Kalima Tawheed (Oneness)',
    short: 'Tawheed',
    use: 'The extended declaration of Allah’s absolute Oneness',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ أَبَدًا أَبَدًا ذُو الْجَلَالِ وَالْإِكْرَامِ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translit: 'La ilaha illallah, wahdahu la sharika lah, lahul-mulku wa lahul-hamd, yuhyi wa yumit, wa Huwa Hayyun la yamutu abadan abada, Dhul-jalali wal-ikram, bi yadihil-khair, wa Huwa ala kulli shay’in qadir.',
    translation: 'None is worthy of worship but Allah alone without partner. His is the dominion and His the praise; He gives life and death, and He is the Living who never dies, ever and ever — Lord of Majesty and Honour. In His hand is all good, and He is over all things Powerful.',
    virtue: 'Its core phrases carry immense reward in hadith (Sunan al-Tirmidhi) — the fourth kalima expands them into a full portrait of tawheed.',
    source: 'Traditional kalima curriculum; core phrases from Sunan al-Tirmidhi and Sahih collections', when: 'Daily dhikr', repeat: 'Often',
    origin: 'scholarly', grade: 'Scholarly compilation',
    aliases: ['chautha kalma', 'chotha kalma', 'fourth kalma', '4th kalima', 'kalma tauheed'] },
  { slug: 'fifth-kalimah-astaghfar', num: 5, title: 'Fifth Kalima Astaghfar (Seeking Forgiveness)',
    short: 'Astaghfar',
    use: 'Comprehensive repentance for known and unknown sins',
    arabic: 'أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ أَذْنَبْتُهُ عَمَدًا أَوْ خَطَأً سِرًّا أَوْ عَلَانِيَةً وَأَتُوبُ إِلَيْهِ مِنَ الذَّنْبِ الَّذِي أَعْلَمُ وَمِنَ الذَّنْبِ الَّذِي لَا أَعْلَمُ إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ وَسَتَّارُ الْعُيُوبِ وَغَفَّارُ الذُّنُوبِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    translit: 'Astaghfirullaha Rabbi min kulli dhanbin adhnabtuhu amadan aw khata’an, sirran aw alaniyah, wa atubu ilayhi minadh-dhanbilladhi a’lam, wa minadh-dhanbilladhi la a’lam. Innaka Anta Allamul-ghuyub, wa Sattarul-uyub, wa Ghaffarudh-dhunub. Wa la hawla wa la quwwata illa billahil-Aliyyil-Azim.',
    translation: 'I seek my Lord Allah’s forgiveness for every sin I committed — deliberately or mistakenly, secretly or openly — and I turn to Him from the sins I know and those I do not know. Indeed You are the Knower of the unseen, Concealer of faults, Forgiver of sins. There is no power nor strength except with Allah, the Most High, the Greatest.',
    virtue: 'Covers deliberate and accidental, secret and open, known and unknown sins — the most thorough istighfar wording taught to beginners.',
    source: 'Traditional kalima curriculum; istighfar phrases from Quran and hadith', when: 'Daily repentance', repeat: 'Often',
    origin: 'scholarly', grade: 'Scholarly compilation',
    aliases: ['panchwa kalma', 'paanchwan kalma', 'fifth kalma', '5th kalima', 'kalma astaghfar'] },
  { slug: 'sixth-kalimah-radd-e-kufr', num: 6, title: 'Sixth Kalima Radd-e-Kufr (Rejecting Disbelief)',
    short: 'Radd-e-Kufr',
    use: 'Renouncing disbelief, shirk and all sins, renewing Islam',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ بِهِ وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ بِهِ تُبْتُ عَنْهُ وَتَبَرَّأْتُ مِنَ الْكُفْرِ وَالشِّرْكِ وَالْكِذْبِ وَالْغِيبَةِ وَالْبِدْعَةِ وَالنَّمِيمَةِ وَالْفَوَاحِشِ وَالْبُهْتَانِ وَالْمَعَاصِي كُلِّهَا وَأَسْلَمْتُ وَأَقُولُ لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ',
    translit: 'Allahumma inni a’udhu bika min an ushrika bika shay’an wa ana a’lamu bih, wa astaghfiruka lima la a’lamu bih. Tubtu anhu wa tabarra’tu minal-kufri wash-shirki wal-kidhbi wal-ghibati wal-bid’ati wan-namimati wal-fawahishi wal-buhtani wal-ma’asi kulliha. Wa aslamtu wa aqulu: La ilaha illallah, Muhammadur Rasulullah.',
    translation: 'O Allah, I seek refuge in You from knowingly associating anything with You, and I seek Your forgiveness for what I do unknowingly. I repent from it and disown disbelief, shirk, lying, backbiting, innovation, tale-carrying, indecencies, slander and all sins. I submit, and I declare: none is worthy of worship but Allah, Muhammad is Allah’s Messenger.',
    virtue: 'Its opening refuge matches a hadith wording (Musnad Ahmad) — the sixth kalima extends it into a full renewal of Islam, disowning every category of sin.',
    source: 'Traditional kalima curriculum; opening phrase reported in Musnad Ahmad', when: 'Renewing faith, after sins', repeat: 'Often',
    origin: 'scholarly', grade: 'Scholarly compilation',
    aliases: ['chhata kalma', 'chata kalma', 'sixth kalma', '6th kalima', 'kalma radd e kufr', 'kufr se tauba'] },
];

export function kalimaBySlug(slug: string) {
  return KALIMAS.find((k) => k.slug === slug);
}
