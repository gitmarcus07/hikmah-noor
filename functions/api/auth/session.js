// GET /api/auth/session — who am I? {user|null}
import { getSessionUser, json } from '../../_lib/auth.js';

export async function onRequest(context) {
  const user = await getSessionUser(context.env, context.request);
  return json({ user });
}
