// GET /api/username-check?u=xxx — is this username valid + available?
// Public, rate-limited. {available:true} or {available:false, reason}.
// reason: invalid | taken | reserved | mine (belongs to the requester).
// Rules mirror profile.js (kept in sync manually — same regex/blocklist).
import { clientIp, getSessionUser, json, rateLimit } from './lib/auth.js';

const USERNAME_RE = /^[a-z0-9][a-z0-9._]{1,28}[a-z0-9]$/;
const USERNAME_BLOCKED = new Set(['admin', 'administrator', 'support', 'official', 'hikmahnoor', 'hikmah_noor', 'root', 'system']);

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!(await rateLimit(env, `uc:${clientIp(request)}`, 60, 60))) {
    return json({ error: 'too_many_requests' }, 429);
  }
  const u = String(new URL(request.url).searchParams.get('u') || '').trim().toLowerCase();
  if (!u) return json({ available: false, reason: 'empty' });
  if (u.length < 3 || u.length > 30 || !USERNAME_RE.test(u) || u.includes('..')) {
    return json({ available: false, reason: 'invalid' });
  }
  if (USERNAME_BLOCKED.has(u)) return json({ available: false, reason: 'reserved' });
  let taken = null;
  try {
    taken = await env.DB.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?)').bind(u).first();
  } catch {
    return json({ available: false, reason: 'error' });
  }
  if (!taken) return json({ available: true });
  try {
    const me = await getSessionUser(env, request);
    if (me && taken.id === me.id) return json({ available: true, mine: true });
  } catch { /* treat as taken */ }
  return json({ available: false, reason: 'taken' });
}
