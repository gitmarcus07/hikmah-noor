// /api/me/bookmarks — GET list; POST {kind,ref}; DELETE ?kind=&ref=
import { json, nowSec, readJson, requireUser } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const rows = await env.DB.prepare(
    'SELECT kind, ref, created_at FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC LIMIT 200'
  ).bind(user.id).all();
  return json({ bookmarks: rows.results || [] });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const body = (await readJson(request)) || {};
  const kind = String(body.kind || '').slice(0, 20);
  const ref = String(body.ref || '').slice(0, 80);
  if (!['verse', 'surah', 'dua', 'kalima'].includes(kind) || !ref) return json({ error: 'invalid_bookmark' }, 400);
  await env.DB.prepare('INSERT OR IGNORE INTO bookmarks (user_id, kind, ref, created_at) VALUES (?, ?, ?, ?)')
    .bind(user.id, kind, ref, nowSec()).run();
  return json({ ok: true });
}

export async function onRequestDelete(context) {
  const { env, request } = context;
  const { searchParams } = new URL(request.url);
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  await env.DB.prepare('DELETE FROM bookmarks WHERE user_id = ? AND kind = ? AND ref = ?')
    .bind(user.id, searchParams.get('kind') || '', searchParams.get('ref') || '').run();
  return json({ ok: true });
}
