// /api/me/notes — private personal notes.
// GET → {notes:[{id,text,ref,updated_at}]} (latest 100).
// POST {text, ref?} → create. PUT {id, text, ref?} → update own.
// DELETE ?id= → delete own. All require login.
import { json, nowSec, readJson, requireUser } from '../lib/auth.js';

const MAX_TEXT = 2000;
const MAX_REF = 40;

function cleanText(v) {
  return String(v ?? '').trim().slice(0, MAX_TEXT);
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  try {
    const r = await env.DB.prepare(
      'SELECT id, text, ref, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100'
    ).bind(user.id).all();
    return json({ notes: r.results || [] });
  } catch {
    return json({ error: 'notes_unavailable', hint: 'Personal Notes needs a database update — try again later.' }, 501);
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const body = (await readJson(request)) || {};
  const text = cleanText(body.text);
  if (!text) return json({ error: 'empty_note', hint: 'Write something first.' }, 400);
  const ref = String(body.ref || '').trim().slice(0, MAX_REF);
  const now = nowSec();
  try {
    const r = await env.DB.prepare(
      'INSERT INTO notes (user_id, text, ref, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(user.id, text, ref, now, now).run();
    return json({ ok: true, note: { id: Number(r.meta?.last_row_id) || 0, text, ref, updated_at: now } });
  } catch {
    return json({ error: 'notes_unavailable', hint: 'Personal Notes needs a database update — try again later.' }, 501);
  }
}

export async function onRequestPut(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const body = (await readJson(request)) || {};
  const id = Number(body.id) || 0;
  const text = cleanText(body.text);
  if (!id || !text) return json({ error: 'invalid_note' }, 400);
  const ref = String(body.ref || '').trim().slice(0, MAX_REF);
  try {
    const r = await env.DB.prepare(
      'UPDATE notes SET text = ?, ref = ?, updated_at = ? WHERE id = ? AND user_id = ?'
    ).bind(text, ref, nowSec(), id, user.id).run();
    if (!r.meta?.changes) return json({ error: 'not_found' }, 404);
    return json({ ok: true });
  } catch {
    return json({ error: 'notes_unavailable' }, 501);
  }
}

export async function onRequestDelete(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const id = Number(new URL(request.url).searchParams.get('id')) || 0;
  if (!id) return json({ error: 'invalid_note' }, 400);
  try {
    await env.DB.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').bind(id, user.id).run();
    return json({ ok: true });
  } catch {
    return json({ error: 'notes_unavailable' }, 501);
  }
}
