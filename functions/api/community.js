// GET /api/community — public counters: total readers + reading today.
// Powers the "Reading Live" line on the home dashboard. No PII.
import { clientIp, json, rateLimit } from './lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!(await rateLimit(env, `cm:${clientIp(request)}`, 120, 60))) {
    return json({ error: 'too_many_requests' }, 429);
  }
  try {
    const [a, b] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) AS n FROM users').first(),
      env.DB.prepare("SELECT COUNT(DISTINCT user_id) AS n FROM reading_events WHERE date = date('now')").first(),
    ]);
    return json({ readers: a?.n || 0, readingToday: b?.n || 0 });
  } catch {
    return json({ readers: 0, readingToday: 0 });
  }
}
