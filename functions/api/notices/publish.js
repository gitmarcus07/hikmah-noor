// POST /api/notices/publish — publish a notice (replaces any active one).
// Auth: Authorization: Bearer <ADMIN_SECRET>. Strictly rate-limited.
import { json, nowSec } from '../lib/http.js';
import { readJsonBody, requireAdmin, sameOrigin } from '../lib/auth.js';
import { validateNotice, shapeNotice } from '../lib/notices.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  const gate = await requireAdmin(env, request);
  if (!gate.ok) return gate.response;
  if (!sameOrigin(request)) {
    return json({ error: 'forbidden' }, 403, { 'cache-control': 'no-store' });
  }
  const body = await readJsonBody(request);
  if (!body.ok) {
    return json({ error: 'invalid_body' }, 400, { 'cache-control': 'no-store' });
  }
  const v = validateNotice(body.data);
  if (!v.ok) {
    return json({ error: v.error }, 400, { 'cache-control': 'no-store' });
  }
  try {
    const now = nowSec();
    await env.DB.batch([
      env.DB.prepare('UPDATE notices SET active = 0, updated_at = ? WHERE active = 1').bind(now),
      env.DB.prepare(
        'INSERT INTO notices (kind, title, message, cta_label, cta_url, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)'
      ).bind(v.notice.kind, v.notice.title, v.notice.message, v.notice.cta_label, v.notice.cta_url, now, now),
    ]);
    const row = await env.DB.prepare(
      'SELECT id, kind, title, message, cta_label, cta_url, updated_at FROM notices WHERE active = 1 ORDER BY id DESC LIMIT 1'
    ).first();
    return json({ ok: true, notice: shapeNotice(row) }, 200, { 'cache-control': 'no-store' });
  } catch {
    return json({ error: 'unavailable' }, 501, { 'cache-control': 'no-store' });
  }
}
