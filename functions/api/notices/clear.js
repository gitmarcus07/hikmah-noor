// POST /api/notices/clear — hide the active notice everywhere.
// Auth: Authorization: Bearer <ADMIN_SECRET>. Strictly rate-limited.
import { json, nowSec } from '../lib/http.js';
import { readJsonBody, requireAdmin, sameOrigin } from '../lib/auth.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  const gate = await requireAdmin(env, request);
  if (!gate.ok) return gate.response;
  if (!sameOrigin(request)) {
    return json({ error: 'forbidden' }, 403, { 'cache-control': 'no-store' });
  }
  // Consume (and ignore) any body so the endpoint has a fixed shape.
  await readJsonBody(request);
  try {
    await env.DB.prepare('UPDATE notices SET active = 0, updated_at = ? WHERE active = 1')
      .bind(nowSec())
      .run();
    return json({ ok: true, notice: null }, 200, { 'cache-control': 'no-store' });
  } catch {
    return json({ error: 'unavailable' }, 501, { 'cache-control': 'no-store' });
  }
}
