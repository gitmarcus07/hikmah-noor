// POST /api/me/reset {confirm:true} — wipe reading stats, keep the account.
// Deletes reading_events, challenge_progress and resume_points, zeroes the
// streak row. Profile, prefs, bookmarks, notes, sessions stay untouched.
// Distinct from DELETE /api/me/profile (full account removal).
import { json, readJson, requireUser } from '../lib/auth.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const body = (await readJson(request).catch(() => null)) || {};
  if (body.confirm !== true) {
    return json({ error: 'confirm_required', hint: 'Pass {confirm:true} to reset stats.' }, 400);
  }
  const id = user.id;
  for (const t of ['reading_events', 'challenge_progress', 'resume_points']) {
    try {
      await env.DB.prepare(`DELETE FROM ${t} WHERE user_id = ?`).bind(id).run();
    } catch { /* table may not exist */ }
  }
  try {
    await env.DB.prepare(
      'INSERT INTO streaks (user_id, current, longest, last_active_date) VALUES (?, 0, 0, NULL) ON CONFLICT(user_id) DO UPDATE SET current=0, longest=0, last_active_date=NULL'
    ).bind(id).run();
  } catch { /* streaks table missing */ }
  return json({ ok: true });
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  return onRequestPost(context);
}
