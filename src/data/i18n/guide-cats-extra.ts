/* Hikmah Noor — extra category overlays: guide cats (hi/ar) + hadees/sahih cats (hi/ar).
 * Urdu sabaq titles are already Urdu; hi/ar get full translations here. */
export const GUIDE_CATS_HI: Record<string, { title?: string; desc?: string }> = {
  salah: { title: 'नमाज़', desc: 'वुज़ू, ग़ुस्ल, अज़ान और नमाज़ की विधि — चरणबद्ध।' },
  duties: { title: 'अरकान पर अमल', desc: 'रोज़ा, ज़कात, Hajj और जनाज़ा नमाज़ सरल भाषा में।' },
  family: { title: 'परिवार और नया जीवन', desc: 'विवाह, नवजात और अंतिम संस्कार।' },
  aqeedah: { title: 'अक़ीदा (आस्थाएं)', desc: 'ईमान के छह स्तंभ, तौहीद, शिर्क और अंतिम दिवस — सरल भाषा में।' },
};
export const GUIDE_CATS_AR: Record<string, { title?: string; desc?: string }> = {
  salah: { title: 'الصلاة', desc: 'الوضوء والغسل والأذان وكيفية الصلاة — خطوة بخطوة.' },
  duties: { title: 'الأركان عملا', desc: 'الصيام والزكاة والحج وصلاة الجنازة بلغة سهلة.' },
  family: { title: 'الأسرة والحياة الجديدة', desc: 'الزواج والمولود ومراسم نهاية الحياة.' },
  aqeedah: { title: 'العقيدة', desc: 'أركان الإيمان الستة والتوحيد والشرك واليوم الآخر — بلغة سهلة.' },
};
export const HADEES_CATS_HI: Record<string, { title?: string; desc?: string }> = {
  'sabaq-1-niyyat-aur-neki': { title: 'सबक़ 1 — नीयत और नेकी', desc: 'नीयतें, दान, सरलता और सहरी — नींव।' },
  'sabaq-2-akhlaq': { title: 'सबक़ 2 — अख़लाक़', desc: 'Allah का भय, अच्छी वाणी, ईर्ष्या-द्वेष नहीं।' },
  'sabaq-3-muashrat': { title: 'सबक़ 3 — समाज', desc: 'रिश्ते, जनाज़ा, जासूसी, Allah का नाम और सरलता।' },
  'sabaq-4-rozmarrah-sunnatein': { title: 'सबक़ 4 — रोज़मर्रा सुन्नतें', desc: 'नरक, क़ुरान, खाने के शिष्टाचार और दाढ़ी।' },
  'sabaq-5-sach-aur-namaz': { title: 'सबक़ 5 — सत्य और नमाज़', desc: 'मूंछ, सत्य, नमाज़ पंक्तियां, रोज़ा और युद्ध।' },
  'sabaq-6-zimmadari': { title: 'सबक़ 6 — ज़िम्मेदारी', desc: 'उत्तरदायित्व, संदेह, बुरी नज़र, पंक्तियां और भूख।' },
  'sabaq-7-khidmat': { title: 'सबक़ 7 — सेवा', desc: 'रोगी से मिलना, बंदी छुड़ाना, क्रोध, क़ुरान और चोरी।' },
  'sabaq-8-anjam-aur-naseehat': { title: 'सबक़ 8 — अंजाम और नसीहत', desc: 'अच्छे अंत, कंजूसी, अत्याचार, शीघ्रता और नसीहत।' },
};
export const HADEES_CATS_AR: Record<string, { title?: string; desc?: string }> = {
  'sabaq-1-niyyat-aur-neki': { title: 'الدرس 1 — النية والخير', desc: 'النيات والصدقة والتيسير والسحور — الأساس.' },
  'sabaq-2-akhlaq': { title: 'الدرس 2 — الأخلاق', desc: 'تقوى الله وحسن الكلام ولا حسد ولا بغض.' },
  'sabaq-3-muashrat': { title: 'الدرس 3 — المجتمع', desc: 'الصلات والجنازة والتجسس واسم الله والتيسير.' },
  'sabaq-4-rozmarrah-sunnatein': { title: 'الدرس 4 — سنن يومية', desc: 'النار والقرآن وآداب الأكل واللحية.' },
  'sabaq-5-sach-aur-namaz': { title: 'الدرس 5 — الصدق والصلاة', desc: 'الشارب والصدق وصفوف الصلاة والصوم والحرب.' },
  'sabaq-6-zimmadari': { title: 'الدرس 6 — المسؤولية', desc: 'المسؤولية والظن والعين والصفوف والجوع.' },
  'sabaq-7-khidmat': { title: 'الدرس 7 — الخدمة', desc: 'عيادة المريض وفك الأسير والغضب والقرآن والسرقة.' },
  'sabaq-8-anjam-aur-naseehat': { title: 'الدرس 8 — العاقبة والنصيحة', desc: 'حسن الخاتمة والبخل والظلم والمبادرة والنصيحة.' },
};
export const SAHIH_CATS_HI: Record<string, { title?: string; desc?: string }> = {
  'sahih-ibadat': { title: 'सहीह चयन 1 — उपासना व नमाज़', desc: 'अज़ान, मस्जिद, Fajr, वुजू, रमज़ान, अरफ़ा और क़ुर्बानी।' },
  'sahih-quran': { title: 'सहीह चयन 2 — क़ुरान, ज़िक्र व दुआ', desc: 'सीखना, पहुंचाना, फ़ातिहा, बक़रा, कुर्सी, इख़लास और दुआ।' },
  'sahih-muashrat': { title: 'सहीह चयन 3 — चरित्र व समाज', desc: 'मेहमान, सलाम, आस्था, धैर्य, माता-पिता, अनाथ और आशा।' },
};
export const SAHIH_CATS_AR: Record<string, { title?: string; desc?: string }> = {
  'sahih-ibadat': { title: 'مختارات صحيحة 1 — العبادة والصلاة', desc: 'الأذان والمسجد والفجر والوضوء ورمضان وعرفة والأضحية.' },
  'sahih-quran': { title: 'مختارات صحيحة 2 — القرآن والذكر والدعاء', desc: 'التعلم والتبليغ والفاتحة والبقرة والكرسي والإخلاص والدعاء.' },
  'sahih-muashrat': { title: 'مختارات صحيحة 3 — الأخلاق والمجتمع', desc: 'الضيوف والسلام والإيمان والصبر والوالدان والأيتام والرجاء.' },
};
