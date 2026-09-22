/* Hikmah Noor — Quizzes (viral engagement + SEO).
 * Data-driven like all hubs: categories -> quizzes -> questions.
 * Every question is answerable from existing site content; `why`
 * explains with a page reference. Client play is in QuizPlayer.astro.
 */
export interface QuizCat { slug: string; title: string; desc: string; icon: string; }
export interface QuizQ {
  q: string; options: [string, string, string, string]; answer: number; why: string;
}
export interface Quiz {
  slug: string; cat: string; title: string; desc: string; icon: string;
  questions: QuizQ[]; keywords: string; aliases: string[];
}

export const QUIZ_CATS: QuizCat[] = [
  { slug: 'prophets', title: 'Prophets Quiz', desc: 'How well do you know the 25 prophets in order?', icon: 'star' },
  { slug: 'seerah', title: 'Seerah Quiz', desc: 'The life of Prophet Muhammad ﷺ in questions.', icon: 'book' },
  { slug: 'quran', title: 'Quran Quiz', desc: 'Surahs, verses and facts about the Holy Quran.', icon: 'quran' },
];

export const QUIZZES: Quiz[] = [
  { slug: 'prophets-in-order', cat: 'prophets', title: 'Prophets Quiz — 10 Questions on the 25 Prophets',
    desc: 'From Adam to Muhammad ﷺ — dreams, floods, fire and seas. Score 8+ to pass.', icon: 'star',
    questions: [
      { q: 'Who was the first prophet and first man, created from clay?',
        options: ['Nuh (Noah)', 'Adam', 'Ibrahim (Abraham)', 'Idris'], answer: 1,
        why: 'Adam was created from clay, taught all the names, and honoured by the angels — see his story page.' },
      { q: 'How many years did Nuh preach to his people?',
        options: ['40 years', '100 years', '950 years', '70 years'], answer: 2,
        why: 'The Quran says he stayed among them a thousand years less fifty (29:14) — see the Nuh story.' },
      { q: 'What did Allah command the fire to be for Ibrahim?',
        options: ['Hotter than ever', 'Cool and safe', 'Turned to water', 'Turned to garden'], answer: 1,
        why: '“O fire, be cool and safe for Ibrahim” (21:69) — see the Ibrahim story.' },
      { q: 'What did Musa say when trapped between Pharaoh’s army and the sea?',
        options: ['We are finished', 'My Lord is with me, He will guide me', 'Let us surrender', 'Build boats quickly'], answer: 1,
        why: '“Kalla! Inna ma’iya Rabbi sayahdin” (26:62) — then the sea split. See the Musa story.' },
      { q: 'What did Yusuf dream about as a boy?',
        options: ['A flood covering the earth', 'Eleven stars, the sun and the moon prostrating', 'A fire turning cool', 'A camel from a rock'], answer: 1,
        why: 'Eleven stars, sun and moon prostrating to him (12:4) — fulfilled when his family bowed in Egypt. See the Yusuf story.' },
      { q: 'Where did Yunus call out his famous dua?',
        options: ['In a cave', 'In the belly of the fish', 'On a mountain', 'In the desert'], answer: 1,
        why: '“La ilaha illa Anta, subhanak, inni kuntu minaz-zalimin” (21:87) — called in triple darkness. See the Yunus story.' },
      { q: 'What made Sulayman smile in the valley?',
        options: ['A talking bird', 'An ant warning her colony', 'A strong wind', 'A palace of glass'], answer: 1,
        why: 'Hearing the ant warn her people, he smiled and prayed the gratitude dua (27:19). See the Sulayman story.' },
      { q: 'What miracle did Isa speak of as an infant?',
        options: ['He healed the blind', 'He defended Maryam from the cradle', 'He raised the dead', 'He made birds from clay'], answer: 1,
        why: '“Inni abdullah” — I am Allah’s servant (19:30). He spoke from the cradle defending his mother. See the Isa story.' },
      { q: 'Which prophet is called Khalilullah (Friend of Allah)?',
        options: ['Musa', 'Isa', 'Ibrahim', 'Ismail'], answer: 2,
        why: 'Allah took Ibrahim as an intimate friend (4:125) — see the Ibrahim story.' },
      { q: 'Who is the final messenger with no prophet after him?',
        options: ['Isa', 'Muhammad ﷺ', 'Musa', 'Yahya'], answer: 1,
        why: 'Muhammad ﷺ is the seal of the prophets (33:40) — see his overview and the 16-chapter Seerat.' },
    ],
    keywords: 'prophets quiz, islamic quiz, ambiya quiz, prophets questions answers, anbiya quiz',
    aliases: ['ambiya quiz', 'prophets test', 'anbiya sawal jawab', '25 prophets quiz'] },
  { slug: 'seerah-quiz', cat: 'seerah', title: 'Seerat Quiz — 10 Questions on the Prophet’s ﷺ Life',
    desc: 'Makkah to Madinah — revelation, Hijrah, battles and farewell. Score 8+ to pass.', icon: 'book',
    questions: [
      { q: 'In which year-event was the Prophet ﷺ born in Makkah?',
        options: ['Year of the Drought', 'Year of the Elephant', 'Year of Sorrow', 'Year of Delegations'], answer: 1,
        why: 'Born around 570 CE in Aam al-Fil, when Abraha’s army was destroyed (Quran 105) — Seerat Ch. 1.' },
      { q: 'What was the first revealed word in Cave Hira?',
        options: ['Pray', 'Read (Iqra)', 'Fast', 'Give'], answer: 1,
        why: '“Read in the name of your Lord” (96:1) — the first revelation. See Seerat Ch. 4.' },
      { q: 'Who slept in the Prophet’s ﷺ bed on the Hijrah night?',
        options: ['Abu Bakr', 'Umar', 'Ali', 'Hamza'], answer: 2,
        why: 'Ali risked his life in the bed while the Prophet slipped out — see the Hijrah story.' },
      { q: 'In which cave did the Prophet ﷺ and Abu Bakr hide?',
        options: ['Cave Hira', 'Cave Thawr', 'Cave Kahf', 'Cave Uhud'], answer: 1,
        why: 'Three nights in Thawr: “grieve not, Allah is with us” (9:40) — see the Hijrah story.' },
      { q: 'Which was the first major battle, fought in 2 AH?',
        options: ['Uhud', 'Badr', 'Khandaq', 'Khaybar'], answer: 1,
        why: 'Badr — the first decisive victory. See Seerat Ch. 10.' },
      { q: 'At Uhud, what order did some archers disobey?',
        options: ['To charge early', 'To hold the hill post', 'To retreat', 'To guard the camp'], answer: 1,
        why: 'Leaving the archers’ post turned victory into trial — Seerat Ch. 11.' },
      { q: 'Which city was peacefully conquered in 8 AH?',
        options: ['Taif', 'Makkah', 'Khaybar', 'Tabuk'], answer: 1,
        why: 'The Conquest of Makkah — general amnesty declared. See Seerat Ch. 14.' },
      { q: 'Where was the Farewell Sermon delivered?',
        options: ['Mina', 'Arafah', 'Muzdalifah', 'Uhud'], answer: 1,
        why: 'At Arafah during the Farewell Hajj — see Seerat Ch. 15.' },
      { q: 'Who was the Prophet’s ﷺ first wife and first believer?',
        options: ['Aisha', 'Hafsa', 'Khadijah', 'Sawdah'], answer: 2,
        why: 'Khadijah believed first and supported him through the early years — Seerat Ch. 3–6.' },
      { q: 'What placed the Night Journey (Isra) and Ascension (Miraj) in order?',
        options: ['Before the Hijrah, after Taif', 'After Badr', 'After Uhud', 'In Madinah year 5'], answer: 0,
        why: 'Isra and Miraj came in the late Makkan period, comforting him after Taif — Seerat Ch. 8.' },
    ],
    keywords: 'seerat quiz, seerah quiz, prophet muhammad quiz, seerat un nabi sawal jawab',
    aliases: ['seerat quiz urdu', 'seerah test', 'hazoor life quiz', 'seerat un nabi quiz'] },
  { slug: 'quran-quiz', cat: 'quran', title: 'Quran Quiz — 10 Questions on Surahs & Facts',
    desc: '114 surahs, 30 paras, first and last revelations. Score 8+ to pass.', icon: 'quran',
    questions: [
      { q: 'How many surahs are in the Holy Quran?',
        options: ['110', '114', '116', '120'], answer: 1,
        why: '114 surahs — browse them all in the Quran index.' },
      { q: 'How many paras (Juz) is the Quran divided into?',
        options: ['25', '30', '33', '40'], answer: 1,
        why: '30 paras — one a day completes a monthly khatm. See the Quran section.' },
      { q: 'Which is the first surah of the Quran?',
        options: ['Al-Baqarah', 'Al-Fatiha', 'Al-Ikhlas', 'An-Nas'], answer: 1,
        why: 'Surah Al-Fatiha (The Opening) — read it with translation.' },
      { q: 'Which is the longest surah?',
        options: ['Aal-i-Imran', 'An-Nisa', 'Al-Baqarah', 'Al-Maidah'], answer: 2,
        why: 'Al-Baqarah with 286 verses — read it in the surah index.' },
      { q: 'Which is the shortest surah with 3 verses?',
        options: ['Al-Ikhlas', 'Al-Asr', 'Al-Kawthar', 'An-Nasr'], answer: 2,
        why: 'Al-Kawthar — three verses of abundance. Read it with translation.' },
      { q: 'Over roughly how many years was the Quran revealed?',
        options: ['10 years', '40 years', '23 years', '13 years'], answer: 2,
        why: 'About 23 years of gradual revelation in Makkah and Madinah.' },
      { q: 'In which surah is Ayatul Kursi (2:255)?',
        options: ['Aal-i-Imran', 'Al-Baqarah', 'An-Nisa', 'Al-Maidah'], answer: 1,
        why: 'Al-Baqarah 2:255 — recited after every salah for protection.' },
      { q: 'Which surah is called the heart of the Quran?',
        options: ['Ar-Rahman', 'Al-Kahf', 'Yaseen', 'Al-Mulk'], answer: 2,
        why: 'Surah Yaseen — read it with Urdu, English and Hindi meaning.' },
      { q: 'Which surah should be recited on Fridays?',
        options: ['Al-Kahf', 'Al-Waqiah', 'Ad-Dukhan', 'As-Sajdah'], answer: 0,
        why: 'Surah Al-Kahf (110 verses) — the Friday recitation. Join the Friday Challenge.' },
      { q: 'Which is the last surah of the Quran?',
        options: ['Al-Falaq', 'Al-Ikhlas', 'An-Nas', 'Al-Masad'], answer: 2,
        why: 'Surah An-Nas (Mankind), 114th and final — read it with translation.' },
    ],
    keywords: 'quran quiz, islamic quiz quran, surah quiz, quran general knowledge',
    aliases: ['quran quiz urdu', 'surah test', 'quran maloomat quiz', '114 surah quiz'] },
];

export function quizCat(slug: string) {
  return QUIZ_CATS.find((c) => c.slug === slug);
}
export function quizzesByCat(cat: string) {
  return QUIZZES.filter((q) => q.cat === cat);
}
export function quizBySlug(slug: string) {
  return QUIZZES.find((q) => q.slug === slug);
}
