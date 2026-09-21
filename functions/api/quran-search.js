// GET /api/quran-search?q=&lang=en|ur|hi|ar&limit=12 — full-text verse search.
// Public endpoint over the verses_fts table (migration 0005). Searches all
// text columns at once (FTS5, ranked); LIKE fallback if FTS is unavailable.
import { clientIp, json, rateLimit } from './lib/http.js';

const LANGS = new Set(['en', 'ur', 'hi', 'ar']);

function ftsQuery(q) {
  const terms = String(q || '')
    .replace(/["*:()^~+=[\]{}|<>!@#$%&\\/_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  if (!terms.length) return null;
  return terms.map((t) => `"${t}"`).join(' ');
}

const likeEsc = (s) => String(s).replace(/[%_\\]/g, (c) => `\\${c}`);

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!(await rateLimit(env, `qs:${clientIp(request)}`, 120, 60))) {
    return json({ error: 'too_many_requests' }, 429);
  }
  const url = new URL(request.url);
  const langParam = String(url.searchParams.get('lang') || 'en').toLowerCase();
  const lang = LANGS.has(langParam) ? langParam : 'en';
  const limit = Math.min(20, Math.max(1, Number(url.searchParams.get('limit')) || 12));
  const q = String(url.searchParams.get('q') || '').trim().slice(0, 100);
  if (q.length < 2) return json({ results: [] });

  const pick = (r) => ({
    surah: r.surah,
    verse: r.verse,
    sname: r.sname || '',
    ar: r.ar || '',
    text: r[lang] || r.en || '',
  });

  // 1) FTS5 ranked search.
  try {
    const mq = ftsQuery(q);
    if (!mq) return json({ results: [] });
    const r = await env.DB.prepare(
      'SELECT surah, verse, sname, ar, ur, en, hi FROM verses_fts WHERE verses_fts MATCH ? ORDER BY rank LIMIT ?'
    ).bind(mq, limit).all();
    return json({ results: (r.results || []).map(pick) });
  } catch {
    // 2) LIKE fallback (no FTS table / FTS unavailable).
    try {
      const like = `%${likeEsc(q)}%`;
      const r = await env.DB.prepare(
        `SELECT surah, verse, sname, ar, ur, en, hi FROM verses_fts
         WHERE ar LIKE ? ESCAPE '\\' OR ur LIKE ? ESCAPE '\\' OR en LIKE ? ESCAPE '\\' OR hi LIKE ? ESCAPE '\\'
         LIMIT ?`
      ).bind(like, like, like, like, limit).all();
      return json({ results: (r.results || []).map(pick) });
    } catch {
      return json({ results: [] });
    }
  }
}
