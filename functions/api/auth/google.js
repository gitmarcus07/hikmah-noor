// GET /api/auth/google — start Google OAuth. Redirects to Google.
import { googleAuthUrl, json, oauthStateCookie, randHex } from '../lib/auth.js';

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.GOOGLE_CLIENT_ID) {
    return json({ error: 'oauth_not_configured', hint: 'Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in Cloudflare Pages env vars.' }, 503);
  }
  const state = randHex(16);
  const headers = {
    location: googleAuthUrl(env, state),
    'set-cookie': oauthStateCookie(state, request),
  };
  return new Response(null, { status: 302, headers });
}
