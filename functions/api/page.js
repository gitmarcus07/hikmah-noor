// GET /api/page?n= — all Arabic verses of a Madani mushaf page (1..604).
// Public endpoint. Page ranges come from mushaf_pages (migration 0005);
// verse text from verses_fts. Powers the Mushaf reader (offline-friendly,
// one small request per page turn).
import { clientIp, json, rateLimit } from './lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!(await rateLimit(env, `pg:${clientIp(request)}`, 200, 60))) {
    return json({ error: 'too_many_requests' }, 429);
  }
  const n = Math.min(604, Math.max(1, Number(new URL(request.url).searchParams.get('n')) || 0));
  if (!n) return json({ error: 'invalid_page' }, 400);
  try {
    const pg = await env.DB.prepare('SELECT ss, sv, es, ev FROM mushaf_pages WHERE page = ?').bind(n).first().catch(() => null);
    if (!pg) return json({ error: 'no_pages' }, 404);
    const r = await env.DB.prepare(
      'SELECT surah, verse, ar FROM verses_fts WHERE surah BETWEEN ? AND ? ORDER BY surah, verse'
    ).bind(pg.ss, pg.es).all();
    const lo = pg.ss * 10000 + pg.sv;
    const hi = pg.es * 10000 + pg.ev;
    const verses = (r.results || []).filter((v) => {
      const k = v.surah * 10000 + v.verse;
      return k >= lo && k <= hi;
    });
    return json({ page: n, verses });
  } catch {
    return json({ error: 'unavailable' }, 503);
  }
}
