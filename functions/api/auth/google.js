// GET /api/auth/google — start Google OAuth. Redirects to Google.
import { googleAuthUrl, json, randHex } from '../lib/auth.js';

export async function onRequest(context) {
  const { env } = context;
  if (!env.GOOGLE_CLIENT_ID) {
    return json({ error: 'oauth_not_configured', hint: 'Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in Cloudflare Pages env vars.' }, 503);
  }
  const state = randHex(16);
  const headers = {
    location: googleAuthUrl(env, state),
    'set-cookie': `hn_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
  };
  return new Response(null, { status: 302, headers });
}
