// GET /api/verse?surah=&verse=&lang=en — single verse text (Arabic + translation).
// Public endpoint over verses_fts (migration 0005). Powers saved-verse lists.
import { clientIp, json, rateLimit } from './lib/auth.js';

const LANGS = new Set(['en', 'ur', 'hi', 'ar']);

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!(await rateLimit(env, `vs:${clientIp(request)}`, 200, 60))) {
    return json({ error: 'too_many_requests' }, 429);
  }
  const url = new URL(request.url);
  const surah = Math.min(114, Math.max(1, Number(url.searchParams.get('surah')) || 0));
  const verse = Math.max(1, Number(url.searchParams.get('verse')) || 0);
  const langParam = String(url.searchParams.get('lang') || 'en').toLowerCase();
  const lang = LANGS.has(langParam) ? langParam : 'en';
  if (!surah || !verse) return json({ error: 'invalid_ref' }, 400);
  try {
    const r = await env.DB.prepare(
      'SELECT surah, verse, sname, ar, ur, en, hi FROM verses_fts WHERE surah = ? AND verse = ?'
    ).bind(surah, verse).first();
    if (!r) return json({ error: 'not_found' }, 404);
    return json({
      surah: r.surah,
      verse: r.verse,
      sname: r.sname || '',
      ar: r.ar || '',
      text: r[lang] || r.en || '',
    });
  } catch {
    return json({ error: 'unavailable' }, 503);
  }
}
