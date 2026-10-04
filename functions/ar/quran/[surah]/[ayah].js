// Dynamic AR ayah page: /ar/quran/:surah/:ayah/ served from D1.
import { renderAyahPage } from '../../../_lib/ayah-page.js';

export async function onRequestGet(context) {
  const { params, env } = context;
  const res = await renderAyahPage({
    locale: 'ar',
    surahParam: params.surah,
    ayahParam: params.ayah,
    env,
  });
  if (res) return res;
  return context.next();
}
