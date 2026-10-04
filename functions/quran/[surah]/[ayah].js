// Dynamic EN ayah page: /quran/:surah/:ayah/ served from D1.
// Same URL as static ayah pages; static curated pages remain as fallback via context.next().
import { renderAyahPage } from '../../_lib/ayah-page.js';

export async function onRequestGet(context) {
  const { params, env } = context;
  const res = await renderAyahPage({
    locale: 'en',
    surahParam: params.surah,
    ayahParam: params.ayah,
    env,
  });
  if (res) return res;
  return context.next();
}
