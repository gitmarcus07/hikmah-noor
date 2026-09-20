// GET /api/auth/google/callback — Google redirects here with ?code=&state=.
import {
  clearOauthStateCookie, createSession, exchangeGoogleCode, fetchGoogleProfile, getCookie,
  json, newUserId, nowSec, sessionCookie,
} from '../../lib/auth.js';

export async function onRequest(context) {
  const { env, request } = context;
  // Redirect same-origin (relative URL) so the session cookie set on this
  // host is never lost. The old code redirected to an absolute APP_URL,
  // which dropped the cookie whenever the user logged in from localhost,
  // a preview deploy or a custom domain — the app then kept showing Login.
  const fail = (to) => Response.redirect(new URL(to, request.url).toString(), 302);
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const want = getCookie(request, 'hn_oauth_state');
    if (!code || !state || !want || state !== want) return fail('/tools/habit-start/?auth=error');
    const tok = await exchangeGoogleCode(env, code);
    if (!tok || !tok.access_token) return fail('/tools/habit-start/?auth=error');
    const profile = await fetchGoogleProfile(tok.access_token);
    if (!profile) return fail('/tools/habit-start/?auth=error');

    const now = nowSec();
    let user = await env.DB.prepare('SELECT id, name, email, avatar_url, avatar_emoji, provider FROM users WHERE email = ?')
      .bind(profile.email).first();
    let isNew = false;
    if (!user) {
      const id = newUserId();
      await env.DB.prepare(
        'INSERT INTO users (id, email, name, avatar_url, provider, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(id, profile.email, profile.name, profile.avatar, 'google', now).run();
      await env.DB.prepare('INSERT INTO prefs (user_id, updated_at) VALUES (?, ?)').bind(id, now).run();
      await env.DB.prepare('INSERT INTO streaks (user_id) VALUES (?)').bind(id).run();
      user = { id, name: profile.name, email: profile.email, avatar_url: profile.avatar, provider: 'google' };
      isNew = true;
    } else {
      // Same address previously used with email+password (or a deleted
      // account re-created): link it — keep the row so either method logs
      // into the same account. Backfill the Google photo ONLY when the user
      // has no avatar at all: gallery picks store avatar_url='' + an
      // avatar_emoji id, and refilling the photo here would silently wipe
      // the gallery choice on every Google re-login.
      if (!user.avatar_url && !user.avatar_emoji && profile.avatar) {
        await env.DB.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').bind(profile.avatar, user.id).run();
      }
    }
    const token = await createSession(env, user.id);
    // New users set up their plan; returning users land on their Home dashboard.
    const headers = new Headers();
    headers.set('location', isNew ? '/tools/habit-start/' : '/tools/my-progress/');
    headers.append('set-cookie', sessionCookie(token, 2592000, request));
    headers.append('set-cookie', clearOauthStateCookie(request));
    return new Response(null, { status: 302, headers });
  } catch (e) {
    return json({ error: 'oauth_failed' }, 500);
  }
}
