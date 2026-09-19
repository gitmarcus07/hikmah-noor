// /api/me/profile — GET full profile; PUT update profile; DELETE remove account.
// Editable: name, username, country, city, bio, gender, language,
// avatar_emoji, avatar_url + optional email-user password change.
import {
  hashPassword, json, nowSec, readJson, requireUser, verifyPassword,
} from '../lib/auth.js';

const GENDERS = new Set(['', 'male', 'female', 'other', 'prefer-not-to-say']);
const LANGS = new Set(['en', 'hi', 'ur', 'ar']);
// Premium SVG avatar ids (must mirror AVATAR_IDS in public/habits/habit.js).
const KNOWN_AVATARS = new Set(['hilal', 'kaaba', 'dome', 'star8', 'fanoos', 'tasbih', 'mushaf', 'mihrab', 'badr', 'lulu', 'nakhil', 'zamzam']);
const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;

async function tableCols(db) {
  try {
    const r = await db.prepare('PRAGMA table_info(users)').all();
    return new Set((r.results || []).map((c) => c.name));
  } catch {
    return new Set(['id', 'email', 'name', 'avatar_url', 'provider', 'password_hash', 'created_at']);
  }
}

async function fullProfile(env, userId) {
  const cols = await tableCols(env);
  const want = ['id', 'email', 'name', 'avatar_url', 'provider', 'username', 'country',
    'city', 'bio', 'gender', 'language', 'avatar_emoji', 'created_at', 'updated_at'];
  const sel = want.filter((c) => cols.has(c));
  const row = await env.DB.prepare(`SELECT ${sel.join(', ')} FROM users WHERE id = ?`).bind(userId).first();
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

export async function onRequestGet(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const profile = await fullProfile(env, user.id);
  if (!profile) return json({ error: 'not_found' }, 404);
  return json({ user: profile });
}

export async function onRequestPut(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const body = (await readJson(request)) || {};
  const cols = await tableCols(env);
  const hasProfileCols = cols.has('country');

  const sets = [];
  const vals = [];
  const fail = (msg, code = 'invalid_profile', status = 400) => json({ error: code, hint: msg }, status);

  // --- name (always available) ---
  if (body.name !== undefined) {
    const name = String(body.name || '').trim().slice(0, 60);
    if (name.length < 2) return fail('Please enter your name (min 2 characters).');
    sets.push('name = ?');
    vals.push(name);
  }

  if (hasProfileCols) {
    // --- username (unique, optional) ---
    if (body.username !== undefined) {
      const username = String(body.username || '').trim().slice(0, 30);
      if (username && !USERNAME_RE.test(username)) {
        return fail('Username: 3–30 characters, letters, numbers, _ and . only.');
      }
      if (username) {
        const taken = await env.DB.prepare(
          'SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?'
        ).bind(username, user.id).first();
        if (taken) return fail('That username is taken — try another.', 'username_taken', 409);
      }
      sets.push('username = ?');
      vals.push(username);
    }
    // --- country / city ---
    if (body.country !== undefined) {
      const country = String(body.country || '').trim().slice(0, 60);
      sets.push('country = ?');
      vals.push(country);
    }
    if (body.city !== undefined) {
      const city = String(body.city || '').trim().slice(0, 60);
      sets.push('city = ?');
      vals.push(city);
    }
    // --- bio ---
    if (body.bio !== undefined) {
      const bio = String(body.bio || '').trim().slice(0, 280);
      sets.push('bio = ?');
      vals.push(bio);
    }
    // --- gender ---
    if (body.gender !== undefined) {
      const gender = String(body.gender || '').trim().slice(0, 24);
      if (!GENDERS.has(gender)) return fail('Please pick a valid option for gender.');
      sets.push('gender = ?');
      vals.push(gender);
    }
    // --- language ---
    if (body.language !== undefined) {
      const language = String(body.language || '').trim().slice(0, 8);
      if (!LANGS.has(language)) return fail('Please pick a valid language.');
      sets.push('language = ?');
      vals.push(language);
    }
    // --- avatar choice: premium SVG id (hilal, kaaba, …) or classic emoji ---
    if (body.avatar_emoji !== undefined) {
      const raw = String(body.avatar_emoji || '').trim();
      const avatar_emoji = KNOWN_AVATARS.has(raw) ? raw : raw.slice(0, 8);
      sets.push('avatar_emoji = ?');
      vals.push(avatar_emoji);
    }
    // --- custom photo: https link or small uploaded data:image ---
    if (body.avatar_url !== undefined) {
      const avatar_url = String(body.avatar_url || '').trim();
      if (avatar_url) {
        const isHttps = /^https:\/\//.test(avatar_url) && avatar_url.length <= 500;
        const isUpload = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar_url) && avatar_url.length <= 25000;
        if (!isHttps && !isUpload) {
          return fail('Photo must be an https:// link or an uploaded image.');
        }
      }
      sets.push('avatar_url = ?');
      vals.push(avatar_url.slice(0, 25000));
    }
    if (cols.has('updated_at')) {
      sets.push('updated_at = ?');
      vals.push(nowSec());
    }
  }

  // --- optional password change (email accounts) ---
  let pwChanged = false;
  const wantPw = body.new_password !== undefined && String(body.new_password || '').length > 0;
  if (wantPw) {
    const me = await env.DB.prepare('SELECT provider, password_hash FROM users WHERE id = ?').bind(user.id).first();
    if (!me || me.provider !== 'email') {
      return fail('Google accounts manage their password via Google.', 'oauth_no_password', 400);
    }
    const current = String(body.current_password || '');
    const next = String(body.new_password || '');
    if (next.length < 8) return fail('New password needs at least 8 characters.', 'weak_password');
    if (!(me.password_hash && (await verifyPassword(current, me.password_hash)))) {
      return fail('Current password is wrong.', 'invalid_credentials', 401);
    }
    sets.push('password_hash = ?');
    vals.push(await hashPassword(next));
    pwChanged = true;
  }

  if (!sets.length) return json({ error: 'nothing_to_update' }, 400);
  vals.push(user.id);
  await env.DB.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  const profile = await fullProfile(env, user.id);
  return json({ ok: true, user: profile, passwordChanged: pwChanged });
}

export async function onRequestDelete(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const body = (await readJson(request).catch(() => null)) || {};
  const confirm = body.confirm === true || new URL(request.url).searchParams.get('confirm') === 'yes';
  if (!confirm) return json({ error: 'confirm_required', hint: 'Pass {confirm:true} to delete.' }, 400);
  const id = user.id;
  // Manual cascade (D1 FK enforcement varies) — child tables first.
  for (const t of ['sessions', 'prefs', 'reading_events', 'streaks', 'challenge_progress', 'bookmarks', 'resume_points', 'rate_limits']) {
    try {
      const col = t === 'rate_limits' ? null : t === 'sessions' ? 'user_id' : 'user_id';
      if (!col) continue;
      await env.DB.prepare(`DELETE FROM ${t} WHERE ${col} = ?`).bind(id).run();
    } catch { /* table may not exist */ }
  }
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  return json(
    { ok: true },
    200,
    { 'set-cookie': 'hn_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0' },
  );
}
