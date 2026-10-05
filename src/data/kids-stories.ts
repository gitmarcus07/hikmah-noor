/* Hikmah Noor — Kids bedtime stories (simplified, strictly sourced).
 * Each story retells a Quran/seerah account in simple language for ages 4-8:
 * short narrative, one moral, and its source. Rendered inline on the Kids hub
 * (no separate routes): EN text with locale fallback, like other hubs.
 */
export interface KidsStory {
  slug: string; title: string; age: string; minutes: number;
  story: [string, string]; moral: string; ref: string;
}

export const KIDS_STORIES: KidsStory[] = [
  { slug: 'adam-names', title: 'Adam Learns the Names', age: '4–8', minutes: 3,
    story: [
      'Allah made the first man, Adam, from clay — then taught him the names of everything: sky, birds, trees, and more. When the angels saw his knowledge, they bowed down as Allah commanded. Knowledge made Adam special.',
      'Only Iblees refused, too proud to bow. Allah sent him away. Adam and his wife lived happily in Jannah — learning, thankful, and close to Allah.',
    ],
    moral: 'Learning makes you special — knowledge is Allah\u2019s gift.',
    ref: 'Quran 2:31–34' },
  { slug: 'nuh-ark', title: 'Nuh and the Big Ark', age: '4–8', minutes: 3,
    story: [
      'Prophet Nuh called his people to Allah for 950 years — but most laughed. So Allah told him to build a huge ark, far from any sea. The people laughed louder — until dark clouds gathered.',
      'Nuh loaded pairs of animals and the believers aboard. Rain poured, floods rose, and the ark floated safely while the flood covered everything. Patience won after centuries of calling.',
    ],
    moral: 'Keep doing good even when people laugh — patience always wins.',
    ref: 'Quran 11:36–48; 29:14' },
  { slug: 'ibrahim-fire', title: 'Ibrahim and the Cool Fire', age: '4–8', minutes: 3,
    story: [
      'Little Ibrahim looked at stars, the moon and the sun — and knew none could be God. Only Allah, who made them all. He broke the idols of his people, and the angry king threw him into a giant fire.',
      'But Allah commanded: "O fire, be cool and safe for Ibrahim!" The fire obeyed — burning nothing but his ropes. Ibrahim walked out smiling. Later he built the Kaaba with his son Ismail.',
    ],
    moral: 'Allah protects those who stand for truth — even fire obeys Him.',
    ref: 'Quran 21:51–71' },
  { slug: 'yusuf-dream', title: 'Yusuf\u2019s Dream Comes True', age: '4–8', minutes: 4,
    story: [
      'Little Yusuf dreamed eleven stars, the sun and the moon bowing to him. His father Yaqub smiled: Allah would raise him high. But jealous brothers threw him into a dark well — a passing caravan pulled him out and sold him far away.',
      'Years passed: slavery, prison for a crime he never did — yet Yusuf stayed honest and kind. Finally the king freed him, his dream came true, and Yusuf forgave his brothers completely: no blame today.',
    ],
    moral: 'Forgive those who hurt you — forgiveness is strength.',
    ref: 'Quran 12 (Surah Yusuf)' },
  { slug: 'musa-sea', title: 'Musa and the Split Sea', age: '4–8', minutes: 3,
    story: [
      'Pharaoh was cruel, so Allah sent Musa with miracles — a staff that became a snake, a shining hand. Pharaoh refused and chased the believers with his whole army until they reached the sea. Trapped!',
      'Allah told Musa: strike the sea with your staff. The water split into walls with dry paths between! The believers crossed safely — then the sea closed over Pharaoh and his army. Trust opened the sea.',
    ],
    moral: 'When you trust Allah, He opens ways you cannot see.',
    ref: 'Quran 26:60–68' },
  { slug: 'yunus-fish', title: 'Yunus and the Big Fish', age: '4–8', minutes: 3,
    story: [
      'Prophet Yunus left his people too soon, before Allah told him to. On a ship in a storm, the sailors cast lots — and Yunus was thrown into the sea. A giant fish swallowed him whole into triple darkness: night, sea, and belly.',
      'In the dark he whispered: "None worthy but You — glory to You; I was wrong." Allah heard, forgave, and the fish spat him onto the shore. He returned, and his whole people believed.',
    ],
    moral: 'Say sorry when you do wrong — Allah always forgives the sorry heart.',
    ref: 'Quran 21:87–88; 37:139–148' },
  { slug: 'maryam-dates', title: 'Maryam and the Palm Tree', age: '4–8', minutes: 3,
    story: [
      'Maryam worshipped Allah alone in quiet devotion. One day an angel brought news: she would have a baby boy — though no man had touched her. "How?" she asked. "Allah says Be, and it is."',
      'Alone at a palm trunk, tired and afraid, she heard: shake the tree — fresh dates fell; a stream flowed. Then baby Isa spoke from the cradle, defending his mother. Allah cares for mothers.',
    ],
    moral: 'Allah takes care of mothers — kindness to mothers is worship.',
    ref: 'Quran 19:16–36' },
  { slug: 'amin-boy-makkah', title: 'The Honest Boy of Makkah', age: '4–8', minutes: 3,
    story: [
      'Muhammad ﷺ lost his father before birth and his mother as a little boy. His grandfather and then his uncle Abu Talib raised him. Everyone in Makkah called him Al-Amin — the Trustworthy — because he never lied, never cheated.',
      'At 25 he married Khadija, who admired his honesty. At 40, in Cave Hira, the angel Jibril hugged him and said: Read! The Quran began — and the honest boy became Allah\u2019s final Messenger.',
    ],
    moral: 'Always tell the truth — honesty made him Al-Amin before prophethood.',
    ref: 'Seerah: birth, childhood, first revelation' },
  { slug: 'hijrah-cave', title: 'The Cave of Thawr', age: '4–8', minutes: 3,
    story: [
      'When Makkah\u2019s chiefs plotted to kill him, the Prophet ﷺ left at night with Abu Bakr and hid in Cave Thawr. Searchers stood at its mouth — Abu Bakr whispered in fear. "Do not grieve," smiled the Prophet ﷺ, "Allah is with us."',
      'Allah sent calm, and the searchers left. The two friends travelled to Madinah, where children sang with joy, waving palm branches. A new home, a new family of believers.',
    ],
    moral: 'With Allah beside you, fear turns into calm.',
    ref: 'Quran 9:40; Seerah: Hijrah' },
  { slug: 'badr-dua', title: 'Badr — The Day of Help', age: '4–8', minutes: 3,
    story: [
      'Only 313 believers faced 1,000 enemies at Badr — hungry, few horses, little armour. All night the Prophet ﷺ raised his hands: "O Allah, if this small band perishes, none will worship You!" Then he smiled: help was coming.',
      'Angels descended in ranks, rain firmed the sand under believers\u2019 feet, and the small army won the great victory. Badr teaches: numbers do not decide — Allah does.',
    ],
    moral: 'Dua before effort: ask Allah first, then do your best.',
    ref: 'Quran 8:9–12; Seerah: Badr' },
];
