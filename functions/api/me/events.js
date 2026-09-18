// POST /api/me/events {surah,verse,verses,seconds,hasanat,pages}
// Logs one "I'm Done" reading event, upserts resume point,
// refreshes streak row, returns updated streak + today totals.
import { json, nowSec, readJson, requireUser } from '../../_lib/auth.js';

function dayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function computeStreakServer(activeDates, today) {
  const set = new Set(activeDates);
  const prev = (d) => {
    const x = new Date(d + 'T00:00:00Z');
    x.setUTCDate(x.getUTCDate() - 1);
    return x.toISOString().slice(0, 10);
  };
  const end = set.has(today) ? today : prev(today);
  if (!set.has(end)) return 0;
  let s = 0;
  let c = end;
  while (set.has(c)) {
    s += 1;
    c = prev(c);
  }
  return s;
}

async function refreshStreak(env, userId) {
  const rows = await env.DB.prepare(
    'SELECT DISTINCT date FROM reading_events WHERE user_id = ? ORDER BY date DESC LIMIT 400'
  ).bind(userId).all();
  const dates = (rows.results || []).map((r) => r.date);
  const today = dayUTC();
  const current = computeStreakServer(dates, today);
  const prev = await env.DB.prepare('SELECT longest FROM streaks WHERE user_id = ?').bind(userId).first();
  const longest = Math.max(prev?.longest || 0, current);
  const last = dates.includes(today) ? today : dates[0] || null;
  await env.DB.prepare(
    'INSERT INTO streaks (user_id, current, longest, last_active_date) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET current=excluded.current, longest=excluded.longest, last_active_date=excluded.last_active_date'
  ).bind(userId, current, longest, last).run();
  return { current, longest, last_active_date: last };
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(env, request);
  if (error) return error;
  const body = (await readJson(request)) || {};
  const surah = Math.min(114, Math.max(1, Number(body.surah) || 1));
  const verse = Math.max(1, Number(body.verse) || 1);
  const verses = Math.min(6236, Math.max(1, Number(body.verses) || 1));
  const seconds = Math.min(86400, Math.max(0, Number(body.seconds) || 0));
  const hasanat = Math.min(1e9, Math.max(0, Number(body.hasanat) || 0));
  const pages = Math.min(604, Math.max(0, Number(body.pages) || 0));
  const date = dayUTC();
  const now = nowSec();

  await env.DB.prepare(
    'INSERT INTO reading_events (user_id, date, surah, verse, verses, seconds, hasanat, pages_est, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(user.id, date, surah, verse, verses, seconds, hasanat, pages, now).run();

  // Resume from the verse after the last one read.
  await env.DB.prepare(
    'INSERT INTO resume_points (user_id, surah, verse, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET surah=excluded.surah, verse=excluded.verse, updated_at=excluded.updated_at'
  ).bind(user.id, surah, verse + 1, now).run();

  // Friday Kahf auto-progress: any Al-Kahf verses count.
  if (surah === 18) {
    const tot = await env.DB.prepare(
      "SELECT COALESCE(SUM(verses),0) AS v FROM reading_events WHERE user_id = ? AND surah = 18 AND date >= date('now','weekday 0','-7 days')"
    ).bind(user.id).first();
    const done = Math.min(110, tot?.v || 0);
    await env.DB.prepare(
      'INSERT INTO challenge_progress (user_id, slug, progress, target) VALUES (?, ?, ?, 110) ON CONFLICT(user_id, slug) DO UPDATE SET progress=excluded.progress, completed_at=CASE WHEN excluded.progress >= 110 THEN strftime(\'%s\',\'now\') ELSE completed_at END'
    ).bind(user.id, 'friday-kahf', done).run();
  }

  const streak = await refreshStreak(env, user.id);
  const today = await env.DB.prepare(
    'SELECT COALESCE(SUM(verses),0) AS verses, COALESCE(SUM(seconds),0) AS seconds, COALESCE(SUM(hasanat),0) AS hasanat, COALESCE(SUM(pages_est),0) AS pages FROM reading_events WHERE user_id = ? AND date = ?'
  ).bind(user.id, date).first();
  return json({ ok: true, streak, today });
}
