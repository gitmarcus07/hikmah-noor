// GET /api/me/stats?range=today|week|all — aggregates + week daily rows.
import { json, requireUser } from '../lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const { searchParams } = new URL(request.url);
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const range = searchParams.get('range') || 'today';
  let where = '';
  if (range === 'today') where = `AND date = date('now')`;
  else if (range === 'week') where = `AND date >= date('now','weekday 0','-7 days')`;
  const agg = await env.DB.prepare(
    `SELECT COALESCE(SUM(verses),0) AS verses, COALESCE(SUM(seconds),0) AS seconds, COALESCE(SUM(hasanat),0) AS hasanat, COALESCE(SUM(pages_est),0) AS pages, COUNT(*) AS sessions FROM reading_events WHERE user_id = ? ${where}`
  ).bind(user.id).first();
  let days = null;
  if (range === 'week') {
    const d = await env.DB.prepare(
      `SELECT date, COALESCE(SUM(verses),0) AS verses FROM reading_events WHERE user_id = ? AND date >= date('now','weekday 0','-7 days') GROUP BY date ORDER BY date`
    ).bind(user.id).all();
    days = d.results || [];
  }
  return json({ stats: { ...agg, pages: Math.round((agg.pages || 0) * 10) / 10 }, days });
}
