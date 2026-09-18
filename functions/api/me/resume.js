// GET /api/me/resume — {surah,verse,juz} | PUT /api/me/resume {surah,verse,juz?}
import { json, nowSec, readJson, requireUser } from '../lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const r = await env.DB.prepare('SELECT surah, verse, juz FROM resume_points WHERE user_id = ?')
    .bind(user.id).first();
  return json({ resume: r || null });
}

export async function onRequestPut(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const body = (await readJson(request)) || {};
  const surah = Math.min(114, Math.max(1, Number(body.surah) || 1));
  const verse = Math.max(1, Number(body.verse) || 1);
  const juz = body.juz ? Math.min(30, Math.max(1, Number(body.juz))) : null;
  await env.DB.prepare(
    'INSERT INTO resume_points (user_id, surah, verse, juz, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET surah=excluded.surah, verse=excluded.verse, juz=excluded.juz, updated_at=excluded.updated_at'
  ).bind(user.id, surah, verse, juz, nowSec()).run();
  return json({ ok: true, resume: { surah, verse, juz } });
}
