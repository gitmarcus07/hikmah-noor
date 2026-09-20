// GET /api/me/calendar?month=YYYY-MM — active reading days for a month.
// Powers the "My Quran Journey" calendar: per-day verses + hasanat, month
// totals, and the streak row (for the 7-day unlock rule). Month defaults to
// the current UTC month; future months return empty days.
import { json, requireUser } from '../lib/auth.js';

function validMonth(m) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(m || ''));
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const url = new URL(request.url);
  let month = url.searchParams.get('month') || '';
  if (!validMonth(month)) month = new Date().toISOString().slice(0, 7);
  const start = `${month}-01`;
  const [y, m] = month.split('-').map(Number);
  const end = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1)).toISOString().slice(0, 10);

  const d = await env.DB.prepare(
    `SELECT date, COALESCE(SUM(verses),0) AS verses, COALESCE(SUM(hasanat),0) AS hasanat
     FROM reading_events WHERE user_id = ? AND date >= ? AND date < ?
     GROUP BY date ORDER BY date`
  ).bind(user.id, start, end).all().catch(() => ({ results: [] }));
  const days = {};
  let monthVerses = 0, monthHasanat = 0;
  for (const r of d.results || []) {
    const v = Number(r.verses) || 0, h = Number(r.hasanat) || 0;
    days[r.date] = { verses: v, hasanat: h };
    monthVerses += v;
    monthHasanat += h;
  }
  const s = await env.DB.prepare('SELECT current, longest, last_active_date FROM streaks WHERE user_id = ?')
    .bind(user.id).first().catch(() => null);
  return json({
    month,
    days,
    totals: { verses: monthVerses, hasanat: monthHasanat },
    streak: s || { current: 0, longest: 0, last_active_date: null },
  });
}
