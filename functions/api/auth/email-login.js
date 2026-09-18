// POST /api/auth/email-login {email,password} — generic errors (no enumeration).
import {
  clientIp, createSession, json, rateLimit, readJson,
  sessionCookie, verifyPassword,
} from '../../lib/auth.js';

export async function onRequest(context) {
  const { env, request } = context;
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!(await rateLimit(env, `login:${clientIp(request)}`, 20, 3600))) {
    return json({ error: 'too_many_requests' }, 429);
  }
  const body = await readJson(request);
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  const row = await env.DB.prepare('SELECT id, name, email, avatar_url, provider, password_hash FROM users WHERE email = ?')
    .bind(email).first();
  const ok = row && row.password_hash && (await verifyPassword(password, row.password_hash));
  if (!ok) return json({ error: 'invalid_credentials' }, 401);

  const token = await createSession(env, row.id);
  return json(
    { ok: true, user: { id: row.id, name: row.name, email: row.email, avatar: row.avatar_url, provider: row.provider } },
    200,
    { 'set-cookie': sessionCookie(token) }
  );
}
