// GET /api/me/challenges — progress rows. PUT {slug,progress,target}
import { json, nowSec, readJson, requireUser } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const rows = await env.DB.prepare('SELECT slug, progress, target, completed_at FROM challenge_progress WHERE user_id = ?')
    .bind(user.id).all();
  return json({ challenges: rows.results || [] });
}

export async function onRequestPut(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const body = (await readJson(request)) || {};
  const slug = String(body.slug || '').slice(0, 40);
  const progress = Math.max(0, Number(body.progress) || 0);
  const target = Math.max(1, Number(body.target) || 1);
  if (!/^[a-z0-9-]+$/.test(slug)) return json({ error: 'invalid_slug' }, 400);
  const done = progress >= target ? nowSec() : null;
  await env.DB.prepare(
    'INSERT INTO challenge_progress (user_id, slug, progress, target, completed_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, slug) DO UPDATE SET progress=excluded.progress, target=excluded.target, completed_at=COALESCE(completed_at, excluded.completed_at)'
  ).bind(user.id, slug, Math.min(progress, target), target, done).run();
  return json({ ok: true });
}
