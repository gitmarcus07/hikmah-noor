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

  let rows = [];
  try {
    if (by === 'streak') {
      const r = await env.DB.prepare(
        `SELECT u.id, u.username, u.country, u.avatar_url, u.avatar_emoji, COALESCE(s.current, 0) AS value
         FROM users u LEFT JOIN streaks s ON s.user_id = u.id
         WHERE u.username IS NOT NULL AND u.username != ''`
      ).all();
      rows = (r.results || [])
        .map((x) => ({ ...x, value: Number(x.value) || 0 }))
        .filter((x) => x.value > 0)
        .sort((a, b) => b.value - a.value);
    } else {
      const col = by === 'verses' ? 'verses' : 'hasanat';
      const r = await env.DB.prepare(
        `SELECT u.id, u.username, u.country, u.avatar_url, u.avatar_emoji, COALESCE(SUM(e.${col}), 0) AS value
         FROM users u LEFT JOIN reading_events e ON e.user_id = u.id
         WHERE u.username IS NOT NULL AND u.username != ''
         GROUP BY u.id`
      ).all();
      rows = (r.results || [])
        .map((x) => ({ ...x, value: Number(x.value) || 0 }))
        .filter((x) => x.value > 0)
        .sort((a, b) => b.value - a.value);
    }
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
    country: x.country || '',
    avatar: x.avatar_url || '',
    avatar_emoji: x.avatar_emoji || '',
    value: x.value,
  }));
  return json({ by, leaders, me, total: rows.length });
}
