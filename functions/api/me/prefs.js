// GET /api/me/prefs — full prefs row (with defaults).
// PUT /api/me/prefs — upsert whitelisted fields.
import { json, nowSec, readJson, requireUser } from '../../lib/auth.js';

const DEFAULTS = {
  daily_goal: 1, streak_goal: 7, font_size_script: 2.0, font_size_translation: 1.0,
  font_size_translit: 1.0, reciter: 'Alafasy_128kbps', reciter_speed: 1.0,
  translation: 'ur', reminder_time: null, second_reminder: 0, alerts_on: 0, onboarded: 0,
};

const ALLOWED = new Set(Object.keys(DEFAULTS));

function row(res, userId) {
  return res.DB.prepare('SELECT * FROM prefs WHERE user_id = ?').bind(userId).first();
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const prefs = (await row(env, user.id)) || {};
  return json({ prefs: { ...DEFAULTS, ...prefs } });
}

export async function onRequestPut(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const body = (await readJson(request)) || {};
  const sets = [];
  const vals = [];
  for (const k of Object.keys(body)) {
    if (!ALLOWED.has(k)) continue;
    let v = body[k];
    if (['second_reminder', 'alerts_on', 'onboarded'].includes(k)) v = v ? 1 : 0;
    if (['daily_goal', 'streak_goal'].includes(k)) v = Number(v);
    if (k === 'daily_goal') v = Math.min(110, Math.max(1, Number(v) || 1));
    if (k === 'streak_goal') v = [3, 7, 14, 30].includes(Number(v)) ? Number(v) : 7;
    if (k === 'translation' && !['ur', 'en', 'hi'].includes(v)) continue;
    if (typeof v === 'number' && !Number.isFinite(v)) continue;
    sets.push(`${k} = ?`);
    vals.push(v);
  }
  if (!sets.length) return json({ error: 'nothing_to_update' }, 400);
  sets.push('updated_at = ?');
  vals.push(nowSec(), user.id);
  await env.DB.prepare(`UPDATE prefs SET ${sets.join(', ')} WHERE user_id = ?`).bind(...vals).run();
  const prefs = (await row(env, user.id)) || {};
  return json({ ok: true, prefs: { ...DEFAULTS, ...prefs } });
}
