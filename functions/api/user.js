// GET /api/user?u=username — public profile card for leaderboard links.
// Only readers with a @username appear. Display name, username and photo
// are always public; country/city/bio/gender/stats follow the user's
// visibility toggles (migration 0004). Never exposes email.
import { clientIp, json, rateLimit } from './lib/auth.js';

const VIS_DEFAULT = { show_country: 1, show_city: 1, show_bio: 1, show_gender: 1, show_stats: 1 };

async function visibilityOf(env, userId) {
  try {
    const r = await env.DB.prepare(
      'SELECT show_country, show_city, show_bio, show_gender, show_stats FROM users WHERE id = ?'
    ).bind(userId).first();
    if (!r) return { ...VIS_DEFAULT };
    const v = (x) => (x === 0 ? 0 : 1);
    return {
      show_country: v(r.show_country), show_city: v(r.show_city), show_bio: v(r.show_bio),
      show_gender: v(r.show_gender), show_stats: v(r.show_stats),
    };
  } catch { return { ...VIS_DEFAULT }; }
}

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!(await rateLimit(env, `up:${clientIp(request)}`, 120, 60))) {
    return json({ error: 'too_many_requests' }, 429);
  }
  const u = String(new URL(request.url).searchParams.get('u') || '').trim().toLowerCase();
  if (!u) return json({ error: 'missing_username' }, 400);

  let row = null;
  try {
    row = await env.DB.prepare(
      `SELECT id, name, username, avatar_url, avatar_emoji, country, city, bio, gender, created_at
       FROM users WHERE LOWER(username) = LOWER(?) AND username IS NOT NULL AND username != ''`
    ).bind(u).first();
  } catch {
    return json({ error: 'not_found' }, 404);
  }
  if (!row) return json({ error: 'not_found' }, 404);

  const vis = await visibilityOf(env, row.id);
  const user = {
    name: row.name || '',
    username: row.username || '',
    avatar: row.avatar_url || '',
    avatar_emoji: row.avatar_emoji || '',
    country: vis.show_country ? row.country || '' : '',
    city: vis.show_city ? row.city || '' : '',
    bio: vis.show_bio ? row.bio || '' : '',
    gender: vis.show_gender ? row.gender || '' : '',
    member_since: row.created_at || 0,
  };

  // Public reading stats + hasanat rank (only when stats are visible).
  let stats = null;
  let rank = null;
  if (vis.show_stats) {
    try {
      const agg = await env.DB.prepare(
        `SELECT COALESCE(SUM(verses),0) AS verses, COALESCE(SUM(hasanat),0) AS hasanat
         FROM reading_events WHERE user_id = ?`
      ).bind(row.id).first();
      const st = await env.DB.prepare('SELECT COALESCE(current,0) AS current FROM streaks WHERE user_id = ?')
        .bind(row.id).first().catch(() => null);
      const myHasanat = Number(agg?.hasanat) || 0;
      stats = { verses: Number(agg?.verses) || 0, hasanat: myHasanat, streak: Number(st?.current) || 0 };
      try {
        const all = await env.DB.prepare(
          `SELECT u.id, COALESCE(SUM(e.hasanat),0) AS h
           FROM users u LEFT JOIN reading_events e ON e.user_id = u.id
           WHERE u.username IS NOT NULL AND u.username != ''
           GROUP BY u.id`
        ).all();
        const above = (all.results || []).filter((x) => (Number(x.h) || 0) > myHasanat).length;
        rank = myHasanat > 0 ? above + 1 : null;
      } catch { rank = null; }
    } catch { stats = null; }
  }
  return json({ user, stats, rank });
}
