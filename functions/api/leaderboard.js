// GET /api/leaderboard?by=hasanat|verses|streak&limit=20 — global top readers.
// Public endpoint. Only readers who set a @username appear (setting a
// username is the implicit opt-in). Never exposes email or real name.
import { clientIp, getSessionUser, json, rateLimit } from './lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!(await rateLimit(env, `lb:${clientIp(request)}`, 120, 60))) {
    return json({ error: 'too_many_requests' }, 429);
  }
  const url = new URL(request.url);
  const byParam = url.searchParams.get('by');
  const by = ['hasanat', 'verses', 'streak'].includes(byParam) ? byParam : 'hasanat';
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20));

  async function fetchRows(withVis) {
    // show_country is masked per the user's visibility toggle (migration 0004).
    const visCol = withVis ? ', COALESCE(u.show_country,1) AS show_country' : '';
    if (by === 'streak') {
      const r = await env.DB.prepare(
        `SELECT u.id, u.username, u.country, u.avatar_url, u.avatar_emoji${visCol}, COALESCE(s.current, 0) AS value
         FROM users u LEFT JOIN streaks s ON s.user_id = u.id
         WHERE u.username IS NOT NULL AND u.username != ''`
      ).all();
      return r.results || [];
    }
    const col = by === 'verses' ? 'verses' : 'hasanat';
    const r = await env.DB.prepare(
      `SELECT u.id, u.username, u.country, u.avatar_url, u.avatar_emoji${visCol}, COALESCE(SUM(e.${col}),0) AS value
       FROM users u LEFT JOIN reading_events e ON e.user_id = u.id
       WHERE u.username IS NOT NULL AND u.username != ''
       GROUP BY u.id`
    ).all();
    return r.results || [];
  }

  let rows = [];
  try {
    try {
      rows = await fetchRows(true);
    } catch {
      rows = await fetchRows(false); // pre-0004 DB: everything visible
    }
    rows = rows
      .map((x) => ({ ...x, value: Number(x.value) || 0, show_country: x.show_country === 0 ? 0 : 1 }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);
  } catch {
    return json({ by, leaders: [], me: null, total: 0 });
  }

  let me = null;
  try {
    const sessionUser = await getSessionUser(env, request);
    if (sessionUser) {
      const i = rows.findIndex((x) => x.id === sessionUser.id);
      if (i >= 0) me = { rank: i + 1, value: rows[i].value };
    }
  } catch { /* rank optional */ }

  const leaders = rows.slice(0, limit).map((x, i) => ({
    rank: i + 1,
    username: x.username,
    country: x.show_country ? (x.country || '') : '',
    avatar: x.avatar_url || '',
    avatar_emoji: x.avatar_emoji || '',
    value: x.value,
  }));
  return json({ by, leaders, me, total: rows.length });
}
