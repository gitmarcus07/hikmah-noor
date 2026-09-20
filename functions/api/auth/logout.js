// POST /api/auth/logout — delete session + clear cookie.
import { clearSessionCookie, getCookie, json, sha256Hex } from '../lib/auth.js';

export async function onRequest(context) {
  const { env, request } = context;
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = getCookie(request, 'hn_session');
  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
  }
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie(request) });
}
