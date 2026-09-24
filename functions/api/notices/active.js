// GET /api/notices/active — public active site notice (single).
// Powers the global popup. Fail-closed: any DB error returns { notice: null }.
import { clientIp, json, rateLimit } from '../lib/http.js';
import { shapeNotice } from '../lib/notices.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!(await rateLimit(env, `na:${clientIp(request)}`, 120, 60))) {
    return json({ error: 'too_many_requests' }, 429);
  }
  try {
    const row = await env.DB.prepare(
      'SELECT id, kind, title, message, cta_label, cta_url, updated_at FROM notices WHERE active = 1 ORDER BY id DESC LIMIT 1'
    ).first();
    return json(
      { notice: shapeNotice(row) },
      200,
      { 'cache-control': 'public, max-age=30, s-maxage=60' }
    );
  } catch {
    return json({ notice: null });
  }
}
