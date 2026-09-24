// GET /api/notices/status — verify admin password + read active notice.
// Auth: Authorization: Bearer <ADMIN_SECRET>. Strictly rate-limited.
import { json } from '../lib/http.js';
import { requireAdmin } from '../lib/auth.js';
import { shapeNotice } from '../lib/notices.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const gate = await requireAdmin(env, request);
  if (!gate.ok) return gate.response;
  try {
    const row = await env.DB.prepare(
      'SELECT id, kind, title, message, cta_label, cta_url, updated_at FROM notices WHERE active = 1 ORDER BY id DESC LIMIT 1'
    ).first();
    return json({ ok: true, notice: shapeNotice(row) }, 200, { 'cache-control': 'no-store' });
  } catch {
    return json({ error: 'unavailable' }, 501, { 'cache-control': 'no-store' });
  }
}
