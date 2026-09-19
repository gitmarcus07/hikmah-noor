// Shared helpers for Pages Functions under functions/api/.
// Runs on Cloudflare Workers runtime (WebCrypto, fetch, D1 via env.DB).

export function nowSec() {
  return Math.floor(Date.now() / 1000);
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

export function randHex(bytes = 32) {
  const b = new Uint8Array(bytes);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export async function sha256Hex(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function getCookie(request, name) {
  const h = request.headers.get('cookie') || '';
  for (const part of h.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

export function sessionCookie(token, maxAge = 2592000) {
  return `hn_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return `hn_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

// ---- passwords (PBKDF2-HMAC-SHA256, WebCrypto — no native deps) ----
const PBKDF2_ITERS = 100000;

export async function hashPassword(password) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERS, hash: 'SHA-256' },
    key,
    256
  );
  const hex = [...new Uint8Array(bits)].map((x) => x.toString(16).padStart(2, '0')).join('');
  const saltHex = [...salt].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `pbkdf2$${PBKDF2_ITERS}$${saltHex}$${hex}`;
}

export async function verifyPassword(password, stored) {
  try {
    const [, iters, saltHex] = String(stored).split('$');
    const salt = new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: Number(iters), hash: 'SHA-256' },
      key,
      256
    );
    const hex = [...new Uint8Array(bits)].map((x) => x.toString(16).padStart(2, '0')).join('');
    const want = String(stored).split('$')[3] || '';
    if (hex.length !== want.length) return false;
    let diff = 0;
    for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ want.charCodeAt(i);
    return diff === 0;
  } catch {
    return false;
  }
}

export function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

export function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    avatar: row.avatar_url || '',
    provider: row.provider || 'email',
    username: row.username || '',
    country: row.country || '',
    city: row.city || '',
    bio: row.bio || '',
    gender: row.gender || '',
    language: row.language || 'en',
    avatar_emoji: row.avatar_emoji || '',
    created_at: row.created_at || 0,
    updated_at: row.updated_at || 0,
  };
}

export async function createSession(env, userId, maxAge = 2592000) {
  const token = randHex(32);
  const tokenHash = await sha256Hex(token);
  const now = nowSec();
  await env.DB.prepare(
    'INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
  ).bind(tokenHash, userId, now + maxAge, now).run();
  return token;
}

export async function getSessionUser(env, request) {
  const token = getCookie(request, 'hn_session');
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  // Full profile select (post-0002 migration). Fall back to the
  // pre-migration column set so older dev DBs keep working.
  let row = null;
  try {
    row = await env.DB.prepare(
      `SELECT u.id, u.name, u.email, u.avatar_url, u.provider, u.username,
              u.country, u.city, u.bio, u.gender, u.language, u.avatar_emoji,
              u.created_at, u.updated_at, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`
    ).bind(tokenHash).first();
  } catch {
    row = await env.DB.prepare(
      `SELECT u.id, u.name, u.email, u.avatar_url, u.provider, u.created_at, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`
    ).bind(tokenHash).first();
  }
  if (!row) return null;
  if (row.expires_at < nowSec()) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
    return null;
  }
  return publicUser(row);
}

export async function requireUser(env, request) {
  const user = await getSessionUser(env, request);
  if (!user) return { error: json({ error: 'unauthorized' }, 401) };
  return { user };
}

// D1-backed fixed-window rate limit. Returns true when allowed.
export async function rateLimit(env, key, limit, windowSec) {
  const now = nowSec();
  try {
    const row = await env.DB.prepare('SELECT count, window_start FROM rate_limits WHERE key = ?').bind(key).first();
    if (!row || now - row.window_start >= windowSec) {
      await env.DB.prepare(
        'INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count=1, window_start=excluded.window_start'
      ).bind(key, now).run();
      return true;
    }
    if (row.count >= limit) return false;
    await env.DB.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').bind(key).run();
    return true;
  } catch {
    return true; // fail open if table missing (dev); auth still gated by credentials
  }
}

export async function readJson(request, maxBytes = 65536) {
  try {
    const text = await request.text();
    if (!text || text.length > maxBytes) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function clientIp(request) {
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

// ---- Google OAuth ----
export function googleAuthUrl(env, state) {
  const id = env.GOOGLE_CLIENT_ID || '';
  const appUrl = (env.APP_URL || 'https://hikmah-noor.pages.dev').replace(/\/$/, '');
  const params = new URLSearchParams({
    client_id: id,
    redirect_uri: `${appUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(env, code) {
  const appUrl = (env.APP_URL || 'https://hikmah-noor.pages.dev').replace(/\/$/, '');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID || '',
      client_secret: env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: `${appUrl}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchGoogleProfile(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const p = await res.json();
  if (!p.email || p.email_verified === false) return null;
  return { email: String(p.email).toLowerCase(), name: String(p.name || p.email.split('@')[0]), avatar: String(p.picture || '') };
}

export function newUserId() {
  return `u_${randHex(12)}`;
}
