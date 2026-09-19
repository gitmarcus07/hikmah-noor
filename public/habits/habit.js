// Hikmah Noor habit client — DOM-free API + math helpers.
// Loaded as static module: await import('/habits/habit.js?v=2')
// IMPORTANT: when this file changes, bump the ?v= number in every
// dynamic import (grep for "habits/habit.js") so browsers/CDN fetch
// the new copy instead of serving a stale cached one.
// (same pattern as /finance/calc.js). Auth uses httpOnly cookie
// sessions, so no token handling here — just same-origin fetch.

async function req(path, opts = {}) {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    ...opts,
  });
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok) {
    const err = new Error(data?.error || `request_failed_${res.status}`);
    err.code = data?.error;
    err.hint = data?.hint;
    err.status = res.status;
    throw err;
  }
  return data || {};
}

export const Auth = {
  session: () => req('/api/auth/session'),
  register: (name, email, password) =>
    req('/api/auth/email-register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email, password) =>
    req('/api/auth/email-login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => req('/api/auth/logout', { method: 'POST' }),
  google: () => { window.location.href = '/api/auth/google'; },
};

export const Me = {
  prefs: () => req('/api/me/prefs'),
  savePrefs: (prefs) => req('/api/me/prefs', { method: 'PUT', body: JSON.stringify(prefs) }),
  profile: () => req('/api/me/profile'),
  saveProfile: (profile) => req('/api/me/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  deleteAccount: () => req('/api/me/profile', { method: 'DELETE', body: JSON.stringify({ confirm: true }) }),
  logEvent: (ev) => req('/api/me/events', { method: 'POST', body: JSON.stringify(ev) }),
  streak: () => req('/api/me/streak'),
  resume: () => req('/api/me/resume'),
  saveResume: (r) => req('/api/me/resume', { method: 'PUT', body: JSON.stringify(r) }),
  bookmarks: () => req('/api/me/bookmarks'),
  addBookmark: (kind, ref) => req('/api/me/bookmarks', { method: 'POST', body: JSON.stringify({ kind, ref }) }),
  removeBookmark: (kind, ref) =>
    req(`/api/me/bookmarks?kind=${encodeURIComponent(kind)}&ref=${encodeURIComponent(ref)}`, { method: 'DELETE' }),
  challenges: () => req('/api/me/challenges'),
  saveChallenge: (slug, progress, target) =>
    req('/api/me/challenges', { method: 'PUT', body: JSON.stringify({ slug, progress, target }) }),
  stats: (range = 'today') => req(`/api/me/stats?range=${range}`),
};

// ---- local math (mirrors src/lib/habit/streak.js, no import needed) ----
export function countArabicLetters(text) {
  if (!text) return 0;
  let n = 0;
  for (const ch of String(text)) {
    const c = ch.codePointAt(0);
    if (c >= 0x0621 && c <= 0x064a && ch !== 'ـ') n += 1;
  }
  return n;
}
export const estimateHasanat = (arabicText) => countArabicLetters(arabicText) * 10;
export const estimatePages = (verses) => Math.round(((verses || 0) / (6236 / 604)) * 10) / 10;

export function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

// Deterministic Ayah-of-the-Day ordinal (0..totalVerses-1).
export function ayahOfDayIndex(dateStr = todayUTC(), totalVerses = 6236) {
  const dayNum = Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / 864e5);
  return ((dayNum % totalVerses) + totalVerses) % totalVerses;
}

export function fmtTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function fmtCompact(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}
