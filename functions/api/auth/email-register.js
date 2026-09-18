// POST /api/auth/email-register {name,email,password}
import {
  clientIp, createSession, hashPassword, json, newUserId, nowSec,
  rateLimit, readJson, sessionCookie, validEmail,
} from '../../_lib/auth.js';

export async function onRequest(context) {
  const { env, request } = context;
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!(await rateLimit(env, `reg:${clientIp(request)}`, 10, 3600))) {
    return json({ error: 'too_many_requests' }, 429);
  }
  const body = await readJson(request);
  const name = String(body?.name || '').trim().slice(0, 60) || 'Reader';
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  if (!validEmail(email)) return json({ error: 'invalid_email' }, 400);
  if (password.length < 8) return json({ error: 'weak_password', hint: 'Minimum 8 characters.' }, 400);

  const exists = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (exists) return json({ error: 'email_taken', hint: 'Try logging in instead.' }, 409);

  const now = nowSec();
  const id = newUserId();
  await env.DB.prepare(
    'INSERT INTO users (id, email, name, avatar_url, provider, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, email, name, '', 'email', await hashPassword(password), now).run();
  await env.DB.prepare('INSERT INTO prefs (user_id, updated_at) VALUES (?, ?)').bind(id, now).run();
  await env.DB.prepare('INSERT INTO streaks (user_id) VALUES (?)').bind(id).run();

  const token = await createSession(env, id);
  return json(
    { ok: true, isNew: true, user: { id, name, email, avatar: '', provider: 'email' } },
    200,
    { 'set-cookie': sessionCookie(token) }
  );
}
