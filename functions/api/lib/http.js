// Shared helpers for public Pages Functions (no accounts — the site is a
// free content library). Runs on Cloudflare Workers runtime (D1 via env.DB).

export function nowSec() {
  return Math.floor(Date.now() / 1000);
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders },
  });
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
    return true; // fail open if table missing (dev)
  }
}

export function clientIp(request) {
  return request.headers.get('cf-connecting-ip') || 'unknown';
}
