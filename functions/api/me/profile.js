// /api/me/profile — GET full profile; PUT update profile; DELETE remove account.
// Editable: name, username, country, city, bio, gender, language,
// avatar_emoji, avatar_url + optional email-user password change.
import {
  hashPassword, json, nowSec, readJson, requireUser, verifyPassword,
} from '../lib/auth.js';

const GENDERS = new Set(['', 'male', 'female', 'other', 'prefer-not-to-say']);
const LANGS = new Set(['en', 'hi', 'ur', 'ar']);
// Instagram-like username rules: 3–30 chars, a–z 0–9 . _, must start
// and end with a letter/number, no consecutive dots. Stored lowercase.
const USERNAME_RE = /^[a-z0-9][a-z0-9._]{1,28}[a-z0-9]$/;
const USERNAME_BLOCKED = new Set(['admin', 'administrator', 'support', 'official', 'hikmahnoor', 'hikmah_noor', 'root', 'system']);
function usernameRuleError(u) {
  if (u.length < 3) return 'Username needs at least 3 characters.';
  if (u.length > 30) return 'Username can be at most 30 characters.';
  if (!USERNAME_RE.test(u)) return 'Usernames use letters, numbers, dots and _ — and must start and end with a letter or number.';
  if (u.includes('..')) return 'Username cannot contain consecutive dots.';
  if (USERNAME_BLOCKED.has(u)) return 'That username is reserved — pick another.';
  return null;
}
// Premium SVG avatar ids (must mirror AVATAR_IDS in public/habits/habit.js).
const KNOWN_AVATARS = new Set(['hilal', 'kaaba', 'dome', 'star8', 'fanoos', 'tasbih', 'mushaf', 'mihrab', 'badr', 'lulu', 'nakhil', 'zamzam']);

// NOTE: never probe the schema with PRAGMA here — D1's Workers runtime
// does not support PRAGMA, so a probe would always "fail" and silently
// disable every profile field. Assume the 0002 migration is applied;
// fall back to base columns only if a query errors with no such column.
const BASE_COLS = ['id', 'email', 'name', 'avatar_url', 'provider', 'created_at'];
const FULL_COLS = [...BASE_COLS, 'username', 'country', 'city', 'bio', 'gender', 'language', 'avatar_emoji', 'updated_at'];

function toPublicProfile(row) {
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

const VIS_DEFAULT = { show_country: 1, show_city: 1, show_bio: 1, show_gender: 1, show_stats: 1 };

// Visibility lives in its own query so a missing 0004 migration degrades
// to "everything visible" instead of breaking the whole profile read.
async function visibilityOf(env, userId) {
  try {
    const r = await env.DB.prepare(
      'SELECT show_country, show_city, show_bio, show_gender, show_stats FROM users WHERE id = ?'
    ).bind(userId).first();
    if (!r) return { ...VIS_DEFAULT };
    const v = (x) => (x === 0 ? 0 : 1);
    return {
      show_country: v(r.show_country), show_city: v(r.show_city), show_bio: v(r.show_bio),
      show_gender: v(r.show_gender), show_stats: v(r.show_stats),
    };
  } catch { return { ...VIS_DEFAULT }; }
}

async function fullProfile(env, userId) {
  const vis = await visibilityOf(env, userId);
  try {
    const row = await env.DB.prepare(`SELECT ${FULL_COLS.join(', ')} FROM users WHERE id = ?`).bind(userId).first();
    if (!row) return null;
    return { ...toPublicProfile(row), ...vis };
  } catch {
    // Pre-migration DB: base columns only.
    const row = await env.DB.prepare(`SELECT ${BASE_COLS.join(', ')} FROM users WHERE id = ?`).bind(userId).first();
    if (!row) return null;
    return { ...toPublicProfile(row), ...vis };
  }
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
  const sets = [];
  const vals = [];
  // Base-column sets, used as a fallback if the DB predates migration 0002.
  const baseSets = [];
  const baseVals = [];
  const fail = (msg, code = 'invalid_profile', status = 400) => json({ error: code, hint: msg }, status);

  // --- one-time fields: username, country, gender (set once, then immutable) ---
  let stored = null;
  if (body.username !== undefined || body.country !== undefined || body.gender !== undefined) {
    stored = await env.DB.prepare('SELECT username, country, gender FROM users WHERE id = ?').bind(user.id).first().catch(() => null);
  }
  const isLockedChange = (field, next) => {
    const prev = (stored && stored[field]) || '';
    return !!prev && next !== prev;
  };
  const lockedFail = (field) => fail(`Your ${field} is already set and cannot be changed.`, 'field_locked', 403);

  // --- name (always available) ---
  if (body.name !== undefined) {
    const name = String(body.name || '').trim().slice(0, 60);
    if (name.length < 2) return fail('Please enter your name (min 2 characters).');
    sets.push('name = ?');
    vals.push(name);
    baseSets.push('name = ?');
    baseVals.push(name);
  }

  // --- username (unique, optional, Instagram-like rules, stored lowercase) ---
  if (body.username !== undefined) {
    const username = String(body.username || '').trim().toLowerCase().slice(0, 30);
    if (username) {
      if (isLockedChange('username', username)) return lockedFail('username');
      const ruleErr = usernameRuleError(username);
      if (ruleErr) return fail(ruleErr);
      const taken = await env.DB.prepare(
        'SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?'
      ).bind(username, user.id).first();
      if (taken) return fail('That username is taken — try another.', 'username_taken', 409);
    }
    sets.push('username = ?');
    vals.push(username);
  }
  // --- country / city (country is compulsory — drives challenge timezones) ---
  if (body.country !== undefined) {
    const country = String(body.country || '').trim().slice(0, 60);
    if (!country) return fail('Please select your country — challenges unlock on your country time.', 'country_required');
    if (isLockedChange('country', country)) return lockedFail('country');
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
    if (isLockedChange('gender', gender)) return lockedFail('gender');
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
  // --- visibility toggles (name, username, photo are always public) ---
  for (const k of ['show_country', 'show_city', 'show_bio', 'show_gender', 'show_stats']) {
    if (body[k] !== undefined) {
      sets.push(`${k} = ?`);
      vals.push(body[k] ? 1 : 0);
    }
  }
  sets.push('updated_at = ?');
  vals.push(nowSec());

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
  // Compulsory country: any profile-details save requires a country on file
  // (already sent, or previously saved) — challenge windows follow it.
  const profileTouched = ['name', 'username', 'country', 'city', 'bio', 'gender', 'language', 'avatar_emoji', 'avatar_url']
    .some((k) => body[k] !== undefined);
  if (profileTouched) {
    let eff = body.country !== undefined ? String(body.country || '').trim() : null;
    if (eff === null) {
      const cur = await env.DB.prepare('SELECT country FROM users WHERE id = ?').bind(user.id).first().catch(() => null);
      eff = (cur && cur.country) || '';
    }
    if (!eff) return fail('Please select your country — challenges unlock on your country time.', 'country_required', 400);
  }
  vals.push(user.id);
  baseVals.push(user.id);
  try {
    await env.DB.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  } catch (e) {
    // Pre-migration DB (missing columns): persist base fields only.
    if (!/no such column/i.test(String((e && e.message) || ''))) throw e;
    if (baseSets.length) {
      await env.DB.prepare(`UPDATE users SET ${baseSets.join(', ')} WHERE id = ?`).bind(...baseVals).run();
    }
  }
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
