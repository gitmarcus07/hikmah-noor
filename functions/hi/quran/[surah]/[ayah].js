// Dynamic HI ayah page: /hi/quran/:surah/:ayah/ served from D1.
import { renderAyahPage } from '../../../_lib/ayah-page.js';

export async function onRequestGet(context) {
  const { params, env } = context;
  const res = await renderAyahPage({
    locale: 'hi',
    surahParam: params.surah,
    ayahParam: params.ayah,
    env,
  });
  if (res) return res;
  return context.next();
}
