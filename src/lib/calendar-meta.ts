/* Islamic Calendar — shared SEO meta for EN + locale shells. */
export const CAL_META = {
  title: 'Islamic Calendar — Hijri Dates, Ramadan, Eid al-Fitr & Eid al-Adha Dates',
  description:
    'Islamic (Hijri) calendar with every sacred date — Ramadan, Laylatul Qadr, Eid al-Fitr, Hajj, Eid al-Adha, Ashura, Shab-e-Barat — Gregorian equivalents, month view and countdowns.',
  keywords:
    'islamic calendar, hijri calendar, islamic calendar 2026, hijri 1447, hijri 1448, ramadan date, eid al fitr date, eid al adha date, ashura date, shab e barat date, shab e miraj date, islamic date today, chand ki tareekh, hijri months, mawlid date',
  faq: [
    {
      q: 'Are these Islamic dates exact?',
      a: 'They are tabular (Umm al-Qura) estimates, usually within 1–2 days of the sighted date. Ramadan, Shawwal and Dhul-Hijjah always follow your country’s moon committee — see our moon-sighting guide.',
    },
    {
      q: 'Why do Islamic dates move every year?',
      a: 'The Hijri year is lunar (~354 days), so every sacred date arrives ~10–11 days earlier each Gregorian year, cycling through all seasons over ~33 years.',
    },
    {
      q: 'Which are the sacred months?',
      a: 'Muharram, Rajab, Dhul-Qadah and Dhul-Hijjah (Quran 9:36). Deeds weigh heavier in them; fighting was forbidden in them.',
    },
    {
      q: 'When is Eid al-Fitr / Eid al-Adha?',
      a: 'Eid al-Fitr is 1 Shawwal; Eid al-Adha is 10 Dhul-Hijjah. The upcoming-occurrences list above shows the estimated Gregorian dates with day-counts.',
    },
    {
      q: 'Do public holidays follow these dates?',
      a: 'Governments announce Islamic holidays on the Gregorian calendar by local moon sighting, so official days off can differ by country. Use the Gregorian equivalents here for planning and confirm locally.',
    },
  ],
};

export const CAL_META_BY_LOCALE: Record<string, { title: string; description: string; keywords: string }> = {
  hi: {
    title: 'इस्लामी कैलेंडर — हिजरी तिथियाँ, रमज़ान, ईद-उल-फ़ित्र व ईद-उल-अज़हा की तारीख़ें',
    description: 'इस्लामी (हिजरी) कैलेंडर: रमज़ान, लैलतुल क़द्र, ईद-उल-फ़ित्र, हज, ईद-उल-अज़हा, आशूरा, शब-ए-बरात सहित हर पवित्र तारीख़ — ग्रेगोरियन समकक्ष, माह दृश्य और उल्टी गिनती सहित।',
    keywords: 'islamic calendar hindi, hijri calendar, hijri 1447, hijri 1448, ramadan date, eid al fitr date, eid al adha date, ashura date, shab e barat date, islamic date today, chand ki tareekh, hijri months',
  },
  ur: {
    title: 'اسلامی کیلنڈر — ہجری تاریخیں، رمضان، عید الفطر و عید الاضحی کی تاریخیں',
    description: 'اسلامی (ہجری) کیلنڈر: رمضان، لیلۃ القدر، عید الفطر، حج، عید الاضحی، عاشورہ، شب برات سمیت ہر مقدس تاریخ — گریگورین مطابقت، مہینے کا منظر اور الٹی گنتی کے ساتھ۔',
    keywords: 'islamic calendar urdu, hijri calendar, hijri 1447, hijri 1448, ramadan date, eid al fitr date, eid al adha date, ashura date, shab e barat date, islamic date today, chand ki tareekh, hijri months',
  },
  ar: {
    title: 'التقويم الإسلامي — التواريخ الهجرية وشهر رمضان وعيد الفطر وعيد الأضحى',
    description: 'التقويم الإسلامي (الهجري) مع كل تاريخ مقدس — رمضان وليلة القدر وعيد الفطر والحج وعيد الأضحى وعاشوراء وليلة البراءة — بالمقابل الميلادي وعرض الشهور والعد التنازلي.',
    keywords: 'التقويم الإسلامي, التقويم الهجري, هجري 1447, هجري 1448, موعد رمضان, موعد عيد الفطر, موعد عيد الأضحى, يوم عاشوراء, ليلة البراءة, التاريخ الهجري اليوم, الأشهر الهجرية',
  },
};

export function calMetaFor(locale: string) {
  return CAL_META_BY_LOCALE[locale] ?? { title: CAL_META.title, description: CAL_META.description, keywords: CAL_META.keywords };
}
