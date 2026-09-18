// Backfill common search phrases (roman Urdu/Hindi/English) onto high-traffic
// duas so the site matches what people actually type ("safar ki dua",
// "wuzu ki dua"...). Inserts `aliases: [...]` before each entry's closing.
// Re-runnable (skips entries that already have aliases).
// Run: npm run content:duas:aliases
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src', 'data', 'duas.ts');
let txt = await readFile(FILE, 'utf8');

const MAP = {
  'starting-journey': ['safar ki dua', 'safar dua', 'dua for travelling', 'dua for safar'],
  'sayyidul-istighfar': ['sayyidul istighfar', 'syed ul istighfar dua'],
  'ayatul-kursi-salah': ['ayatul kursi', 'ayat al kursi dua'],
  'before-sleeping': ['sone ki dua', 'dua before sleeping'],
  'waking-up': ['uthne ki dua', 'dua after waking up'],
  'before-eating': ['khana khane ki dua', 'dua before eating'],
  'after-eating': ['khana khane ke baad ki dua'],
  'breaking-fast': ['iftar ki dua', 'roza kholne ki dua'],
  'entering-toilet': ['toilet jane ki dua', 'bathroom dua'],
  'before-wudu': ['wuzu ki dua', 'wudu dua'],
  'after-wudu': ['wuzu ke baad ki dua'],
  'laylatul-qadr': ['shab e qadr ki dua', 'lailatul qadr dua'],
  'for-parents': ['walidain ke liye dua', 'dua for parents'],
  'seeking-knowledge': ['ilm ki dua', 'dua for knowledge'],
  'la-sahla-exams': ['exam ki dua', 'imtihan ki dua', 'dua for exams'],
  'entering-mosque': ['masjid jane ki dua'],
  'leaving-home': ['ghar se nikalne ki dua', 'dua for leaving home'],
  'entering-home': ['ghar me dakhil hone ki dua'],
  'talbiyah': ['labbaik allahumma labbaik', 'hajj talbiyah'],
  'arafah-dua': ['arafah day dua', 'dua for day of arafah'],
  'new-moon-sighting': ['chand dekhne ki dua', 'ramadan moon dua'],
  'ask-jannah-refuge-hell': ['jannat ki dua', 'dua for jannah'],
  'musa-clarity-speech': ['rabbishrah li sadri dua', 'dua for speech'],
  'hasbunallah': ['hasbunallah wa nimal wakeel'],
  'rabbana-la-tuzigh': ['rabbana la tuzigh dua'],
  'yunus-distress': ['dua e yunus', 'dua of yunus'],
  'adam-repentance': ['tauba ki dua', 'adam as dua'],
  'wedding-dua': ['shaadi ki dua', 'dua for newly married'],
  'before-intimacy': ['dua before intimacy'],
  'dua-qunoot': ['dua e qunoot', 'qunoot dua'],
  'witr-qunut-hasan': ['witr dua'],
  'istikhara': ['istikhara ki dua', 'dua for decision'],
  'after-salam': ['namaz ke baad ki dua', 'dua after prayer'],
  'tasbih-after-fard': ['namaz ke baad tasbih', '33 tasbih after namaz'],
  'daily-shield': ['bismillahillazi dua'],
  'ruqyah-children': ['bachon ki nazar ki dua', 'evil eye dua for kids'],
  'pain-relief': ['dard ki dua', 'dua for pain'],
  'for-sick': ['bimar ke liye dua', 'dua for sick person'],
  'anxiety-grief': ['pareshani ki dua', 'dua for anxiety'],
  'debt-freedom': ['qarz ki dua', 'dua for debt freedom'],
  'rizq-blessing': ['rizq ki dua', 'dua for wealth'],
  'when-raining': ['barish ki dua', 'dua for rain'],
  'after-rain-mutirna': ['barish ke baad ki dua'],
  'controlling-anger': ['gussa ki dua', 'dua for anger'],
  'after-sneezing': ['chheenk ki dua', 'dua after sneezing'],
  'visiting-graves': ['qabristan ki dua'],
  'for-the-deceased': ['mayyat ki dua', 'dua for deceased'],
  'condolence': ['taziyat ki dua'],
  'eid-takbir': ['eid takbeer', 'eid takbir'],
  'righteous-children-salihin': ['aulad ke liye dua', 'dua for children'],
  'baqarah-last-verses-dua': ['amanar rasul dua', 'last 2 verses baqarah'],
  'istighfar-azim': ['astaghfirullah al azeem'],
  'astaghfirullah-100x': ['astaghfirullah 100 times'],
  'refuge-four-after-tashahhud': ['dua after tashahhud'],
  'after-adhan-wasilah': ['azan ke baad ki dua', 'dua after azan'],
  'safa-marwa-dhikr': ['safa marwa dua'],
  'tawaf-corner': ['tawaf dua', 'rabbana atina fid dunya'],
  'hasbiya-allah-7x': ['hasbiyallahu dua'],
  'subhanallah-adada-khalqihi': ['subhanallah adada khalqihi'],
  'asbahna-mulku-lillah': ['subah ki dua', 'morning dua'],
  'amsayna-mulku-lillah': ['sham ki dua', 'evening dua'],
  'raditu-billah': ['raditu billahi dua'],
  'jibril-ruqyah': ['ruqyah dua', 'nazar ki dua'],
  'masha-allah-evil-eye': ['masha allah dua'],
  'distress-karb': ['dua in distress'],
  'musa-in-need': ['rabbi inni lima anzalta dua'],
  'sulayman-gratitude': ['shukr ki dua'],
  'ibrahim-wisdom-righteous': ['dua for wisdom'],
  'new-bride-dua': ['dua for new wife'],
  'dua-for-milk': ['doodh peene ki dua'],
  'when-wind-blows': ['hawa ki dua', 'aandhi ki dua'],
  'entering-market': ['bazaar ki dua'],
  'at-calamity-ajurni': ['musibat ki dua', 'inna lillahi dua'],
  'husn-al-khatima': ['husn e khatima dua'],
  'ajirni-minan-nar-7x': ['dua for protection from hell'],
  'thunder-tasbih': ['thunder dua'],
  'seeing-mirror': ['sheesha dekhne ki dua'],
  'new-clothes': ['naye kapde ki dua'],
  'refuge-hidden-shirk': ['dua against shirk'],
  'sujood-ighfir-kullah': ['dua in sujood for forgiveness'],
  'la-mania-after-salah': ['dua after fard prayer'],
  'istighfar-all-believers': ['dua for all muslims'],
  'uphill-takbir': ['safar takbir dua'],
  'mudkhal-sidq': ['dua for new beginning'],
  'zawwadakallah-traveler': ['musafir ko rukhsat ki dua'],
  'ihram-niyyah': ['ahram ki niyyat', 'hajj niyyat dua'],
  'fiqh-for-children': ['bachon ke ilm ki dua'],
  'good-and-bad-news': ['khushi aur gham ki dua'],
};

let done = 0;
for (const [slug, aliases] of Object.entries(MAP)) {
  if (!aliases.length) continue;
  const start = txt.indexOf(`{ slug: '${slug}',`);
  if (start < 0) { console.error('❌ entry not found: ' + slug); process.exitCode = 1; continue; }
  const end = txt.indexOf(' },', start);
  if (end < 0) { console.error('❌ entry end not found: ' + slug); process.exitCode = 1; continue; }
  const body = txt.slice(start, end);
  if (body.includes('aliases:')) { console.log('↷ already has aliases: ' + slug); continue; }
  const list = aliases.map((a) => `'${a}'`).join(', ');
  txt = txt.slice(0, end) + `, aliases: [${list}]` + txt.slice(end);
  done++;
}

await writeFile(FILE, txt);
console.log(`\n✅ aliases added to ${done} entries.`);
