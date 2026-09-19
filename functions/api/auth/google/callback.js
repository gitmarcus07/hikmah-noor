// GET /api/auth/google/callback — Google redirects here with ?code=&state=.
import {
  createSession, exchangeGoogleCode, fetchGoogleProfile, getCookie,
  json, newUserId, nowSec, sessionCookie,
} from '../../lib/auth.js';

export async function onRequest(context) {
  const { env, request } = context;
  const appUrl = (env.APP_URL || 'https://hikmah-noor.pages.dev').replace(/\/$/, '');
  const fail = (to) => Response.redirect(`${appUrl}${to}`, 302);
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
    let user = await env.DB.prepare('SELECT id, name, email, avatar_url, provider FROM users WHERE email = ?')
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
    } else if (!user.avatar_url && profile.avatar) {
      await env.DB.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').bind(profile.avatar, user.id).run();
    }
    const token = await createSession(env, user.id);
    // New users set up their plan; returning users land on their Home dashboard.
    const headers = {
      location: `${appUrl}${isNew ? '/tools/habit-start/' : '/tools/my-progress/'}`,
      'set-cookie': `${sessionCookie(token)}; hn_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
    };
    return new Response(null, { status: 302, headers });
  } catch (e) {
    return json({ error: 'oauth_failed' }, 500);
  }
}
