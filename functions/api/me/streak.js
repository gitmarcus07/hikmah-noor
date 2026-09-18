// GET /api/me/streak — {current,longest,last_active_date}
import { json, requireUser } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const s = await env.DB.prepare('SELECT current, longest, last_active_date FROM streaks WHERE user_id = ?')
    .bind(user.id).first();
  return json({ streak: s || { current: 0, longest: 0, last_active_date: null } });
}
