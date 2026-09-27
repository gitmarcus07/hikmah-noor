/* Topic-matched artwork for content-collection articles.
 * Each article gets the WaqiahArt story-card treatment (motif icon +
 * emblem Arabic + name label) so the card reflects what it is about,
 * instead of a generic per-category illustration.
 */
export interface ArticleTopic {
  motif: string;
  arabic: string;
  name: string;
  accent: string;
  caption: string;
}

const TOPICS: Record<string, ArticleTopic> = {
  'noahs-ark-turkey-durupinar-fact-check': {
    motif: 'ship', arabic: 'وَاصْنَعِ الْفُلْكَ بِأَعْيُنِنَا', name: 'NUH', accent: '#5EC8B4', caption: 'WAQIA • ARK',
  },
  'noahs-ark-build-material-unknown': {
    motif: 'ship', arabic: 'ذَاتِ أَلْوَاحٍ وَدُسُرٍ', name: 'NUH', accent: '#5EC8B4', caption: 'WAQIA • ARK',
  },
  'moon-cycle-quran-phases-mansions': {
    motif: 'moon', arabic: 'وَالْقَمَرَ قَدَّرْنَاهُ مَنَازِلَ', name: 'QAMAR', accent: '#7FB8E8', caption: 'QURAN • MOON',
  },
  'what-is-quran': {
    motif: 'book', arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ', name: 'QURAN', accent: '#B8944A', caption: 'QURAN • WAHY',
  },
  'who-wrote-quran': {
    motif: 'book', arabic: 'تَنزِيلٌ مِّن رَّبِّ الْعَالَمِينَ', name: 'QURAN', accent: '#B8944A', caption: 'QURAN • WAHY',
  },
  'first-kalima-tayyab': {
    motif: 'dome', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ', name: 'KALIMA 1', accent: '#B8944A', caption: 'KALIMA • TAYYAB',
  },
  'pehla-kalima': {
    motif: 'dome', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ', name: 'KALIMA 1', accent: '#B8944A', caption: 'KALIMA • TAYYAB',
  },
  'second-kalima-shahadat': {
    motif: 'dome', arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ', name: 'KALIMA 2', accent: '#B8944A', caption: 'KALIMA • SHAHADAT',
  },
  'third-kalima-tamjeed': {
    motif: 'dome', arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ', name: 'KALIMA 3', accent: '#B8944A', caption: 'KALIMA • TAMJEED',
  },
  'fourth-kalima-tawheed': {
    motif: 'dome', arabic: 'لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ', name: 'KALIMA 4', accent: '#B8944A', caption: 'KALIMA • TAWHEED',
  },
  'fifth-kalima-astaghfar': {
    motif: 'dome', arabic: 'أَسْتَغْفِرُ اللَّهَ رَبِّي', name: 'KALIMA 5', accent: '#B8944A', caption: 'KALIMA • ASTAGHFAR',
  },
  'sixth-kalima-radd-e-kufr': {
    motif: 'dome', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ', name: 'KALIMA 6', accent: '#B8944A', caption: 'KALIMA • KUFR SE BARAAT',
  },
  'surah-al-fatiha': {
    motif: 'book', arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', name: 'FATIHA', accent: '#B8944A', caption: 'SURAH • 1',
  },
  'ayatul-kursi': {
    motif: 'crown', arabic: 'وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ', name: 'KURSI', accent: '#7FB8E8', caption: 'AYAH • KURSI',
  },
  'dua-for-travel': {
    motif: 'compass', arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا', name: 'SAFAR', accent: '#5EC8B4', caption: 'DUA • TRAVEL',
  },
  'safar-ki-dua': {
    motif: 'compass', arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا', name: 'SAFAR', accent: '#5EC8B4', caption: 'DUA • TRAVEL',
  },
  'how-to-perform-wudu': {
    motif: 'drop', arabic: 'فَاغْسِلُوا وُجُوهَكُمْ', name: 'WUDU', accent: '#7FB8E8', caption: 'GUIDE • WUDU',
  },
  'what-is-halal-food': {
    motif: 'bowl', arabic: 'كُلُوا مِمَّا رَزَقَكُمُ اللَّهُ حَلَالًا طَيِّبًا', name: 'HALAL', accent: '#5EC8B4', caption: 'GUIDE • HALAL',
  },
  'tawakkul-meaning': {
    motif: 'heart', arabic: 'وَعَلَى اللَّهِ فَتَوَكَّلُوا', name: 'TAWAKKUL', accent: '#E3B94E', caption: 'MEANING • TRUST',
  },
  'story-of-prophet-yusuf': {
    motif: 'well', arabic: 'إِنِّي رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا', name: 'YUSUF', accent: '#E3B94E', caption: 'WAQIA • YUSUF',
  },
};

export function articleTopic(slug: string): ArticleTopic | null {
  const key = slug.split('/').pop()!.replace(/\.mdx?$/, '');
  return TOPICS[key] ?? null;
}
