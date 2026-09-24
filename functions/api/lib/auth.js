// Shared admin-gate helpers for /al-mushrif/ notice APIs.
// Runs on Cloudflare Workers runtime. Bearer token compared in constant
// time against env.ADMIN_SECRET; strict per-IP rate limiting included.

import { clientIp, json, rateLimit } from './http.js';

const enc = new TextEncoder();

function bytes(s) {
  return enc.encode(String(s || ''));
}

/** Constant-time string compare (length-checked, no early exit). */
export function safeEqual(a, b) {
  const ab = bytes(a);
  const bb = bytes(b);
  const len = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    diff |= (ab[i % ab.length] ?? 0) ^ (bb[i % bb.length] ?? 0);
  }
  return diff === 0 && ab.length > 0 && ab.length === bb.length;
}

export function getBearer(request) {
  const h = request.headers.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  const token = (m ? m[1] : '').trim();
  if (!token || token.length > 512) return '';
  return token;
}

/**
 * Verify admin access. Returns { ok:true } or { ok:false, response }.
 * - strict rate limit: 10 attempts / 5 min per IP (all authed notice APIs)
 * - generic failures (no user enumeration), no-store responses
 */
export async function requireAdmin(env, request) {
  const noStore = { 'cache-control': 'no-store' };
  if (!(await rateLimit(env, `adm:${clientIp(request)}`, 10, 300))) {
    return { ok: false, response: json({ error: 'too_many_requests' }, 429, noStore) };
  }
  const secret = env.ADMIN_SECRET || '';
  if (!secret) {
    return { ok: false, response: json({ error: 'unavailable' }, 501, noStore) };
  }
  const token = getBearer(request);
  if (!token || !safeEqual(token, secret)) {
    // Same generic response for missing vs wrong token.
    return { ok: false, response: json({ error: 'unauthorized' }, 401, noStore) };
  }
  return { ok: true };
}

/**
 * Basic same-origin check for cookie-less Bearer POSTs (defense in depth —
 * Authorization headers are not sent cross-origin by browsers anyway).
 * Allows requests with no Origin (curl, same-origin navigations).
 */
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

/** Read JSON body with an 8KB cap. Returns { ok, data } or { ok:false }. */
export async function readJsonBody(request, maxBytes = 8192) {
  try {
    const text = await request.text();
    if (!text || enc.encode(text).length > maxBytes) return { ok: false };
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}
