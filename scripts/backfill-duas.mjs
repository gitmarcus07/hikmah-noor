// One-time backfill: adds origin / narrator / grade to the 55 legacy dua
// entries that predate the sourcing schema. New entries already carry these
// fields. Narrators are included ONLY where confidently known; entries with
// any doubt keep source+grade only. Re-runnable (skips entries that already
// have an origin field).
// Run: npm run content:duas:backfill
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src', 'data', 'duas.ts');
let txt = await readFile(FILE, 'utf8');

// slug -> [origin, narrator|null, grade]
const MAP = {
  'morning-remembrance': ['hadith', 'Abu Hurairah', 'Hasan'],
  'evening-remembrance': ['hadith', 'Abu Hurairah', 'Hasan'],
  'sayyidul-istighfar': ['hadith', 'Shaddad ibn Aws', 'Sahih'],
  'morning-knowledge-rizq': ['hadith', 'Umm Salamah', 'Hasan'],
  'evening-protection': ['hadith', 'Abu Hurairah', 'Sahih'],
  'hundred-tasbih': ['hadith', 'Abu Hurairah', 'Sahih'],
  'sana-opening': ['hadith', null, 'Hasan'],
  'between-sajdah': ['hadith', 'Ibn Abbas', 'Hasan'],
  'dua-qunoot': ['sahaba', 'Umar ibn al-Khattab', 'Hasan'],
  'after-salam': ['hadith', 'Thawban', 'Sahih'],
  'worship-help': ['hadith', 'Muadh ibn Jabal', 'Sahih'],
  'ayatul-kursi-salah': ['quran', null, 'Quranic'],
  'starting-journey': ['quran', null, 'Quranic'],
  'farewell-traveler': ['hadith', null, 'Hasan'],
  'before-eating': ['hadith', null, 'Hasan'],
  'after-eating': ['hadith', null, 'Hasan'],
  'breaking-fast': ['hadith', 'Ibn Umar', 'Hasan'],
  'guest-for-host': ['hadith', null, 'Sahih'],
  'leaving-home': ['hadith', 'Anas ibn Malik', 'Hasan'],
  'entering-home': ['hadith', null, 'Hasan'],
  'entering-mosque': ['hadith', null, 'Hasan'],
  'leaving-mosque': ['hadith', null, 'Sahih'],
  'for-parents': ['quran', null, 'Quranic'],
  'righteous-family': ['quran', null, 'Quranic'],
  'wedding-dua': ['hadith', 'Abu Hurairah', 'Hasan'],
  'before-sleeping': ['hadith', 'Hudhayfah ibn al-Yaman', 'Sahih'],
  'waking-up': ['hadith', 'Hudhayfah ibn al-Yaman', 'Sahih'],
  'bad-dream-protection': ['hadith', null, 'Hasan'],
  'for-sick': ['hadith', 'Aishah', 'Sahih'],
  'daily-shield': ['hadith', 'Uthman ibn Affan', 'Hasan'],
  'ruqyah-children': ['hadith', 'Ibn Abbas', 'Sahih'],
  'pain-relief': ['hadith', 'Uthman ibn Abi al-As', 'Sahih'],
  'seeking-forgiveness': ['hadith', 'Ibn Umar', 'Hasan'],
  'yunus-distress': ['quran', null, 'Quranic'],
  'adam-repentance': ['quran', null, 'Quranic'],
  'anxiety-grief': ['hadith', 'Anas ibn Malik', 'Sahih'],
  'debt-freedom': ['hadith', 'Ali ibn Abi Talib', 'Hasan'],
  'urgent-help': ['hadith', 'Anas ibn Malik', 'Hasan'],
  'rizq-blessing': ['hadith', 'Anas ibn Malik', 'Sahih'],
  'before-wudu': ['hadith', null, 'Hasan'],
  'after-wudu': ['hadith', 'Umar ibn al-Khattab', 'Sahih'],
  'entering-toilet': ['hadith', 'Anas ibn Malik', 'Sahih'],
  'leaving-toilet': ['hadith', 'Aishah', 'Hasan'],
  'new-clothes': ['hadith', null, 'Hasan'],
  // 'seeing-mirror' deliberately left ungraded (narration strength disputed)
  'seeking-knowledge': ['quran', null, 'Quranic'],
  'laylatul-qadr': ['hadith', 'Aishah', 'Sahih'],
  'istikhara': ['hadith', 'Jabir ibn Abdullah', 'Sahih'],
  'steadfast-heart': ['hadith', null, 'Hasan'],
  'talbiyah': ['hadith', 'Ibn Umar', 'Sahih'],
  'arafah-dua': ['hadith', 'Abdullah ibn Amr', 'Hasan'],
  'tawaf-corner': ['quran', null, 'Quranic'],
  'when-raining': ['hadith', 'Aishah', 'Sahih'],
  'after-sneezing': ['hadith', 'Abu Hurairah', 'Sahih'],
  'controlling-anger': ['hadith', null, 'Sahih'],
};

let done = 0;
for (const [slug, [o, n, g]] of Object.entries(MAP)) {
  const start = txt.indexOf(`{ slug: '${slug}',`);
  if (start < 0) { console.error('❌ entry not found: ' + slug); process.exitCode = 1; continue; }
  const head = txt.slice(start, start + 4000);
  if (/origin:/.test(head.split('},')[0])) { console.log('↷ already sourced: ' + slug); continue; }
  const m = head.match(/repeat: '((?:[^'\\]|\\.)*)'/);
  if (!m) { console.error('❌ repeat not found: ' + slug); process.exitCode = 1; continue; }
  const insertAt = start + m.index + m[0].length;
  const extra = `, origin: '${o}'` + (n ? `, narrator: '${n}'` : '') + `, grade: '${g}'`;
  txt = txt.slice(0, insertAt) + extra + txt.slice(insertAt);
  done++;
}

await writeFile(FILE, txt);
console.log(`\n✅ backfilled ${done} entries (seeing-mirror intentionally left ungraded).`);
