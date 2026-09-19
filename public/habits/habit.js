// Hikmah Noor habit client — DOM-free API + math helpers.
// Loaded as static module: await import('/habits/habit.js?v=3')
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
  leaderboard: (by = 'hasanat', limit = 20) =>
    req(`/api/leaderboard?by=${encodeURIComponent(by)}&limit=${encodeURIComponent(limit)}`),
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

// ---- premium SVG avatars (single source of truth) ----
// Gallery ids stored in users.avatar_emoji. Rendered at any size —
// svg roots use width/height 100%, so put them in a square container.
export const AVATAR_IDS = ['hilal', 'kaaba', 'dome', 'star8', 'fanoos', 'tasbih', 'mushaf', 'mihrab', 'badr', 'lulu', 'nakhil', 'zamzam'];

export const AVATAR_NAMES = {
  hilal: 'Hilal', kaaba: 'Kaaba', dome: 'Dome', star8: 'Star', fanoos: 'Lantern',
  tasbih: 'Tasbih', mushaf: 'Mushaf', mihrab: 'Mihrab', badr: 'Full moon',
  lulu: 'Pearl', nakhil: 'Palm', zamzam: 'Zamzam',
};

export const AVATAR_SVGS = {
  hilal: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Hilal avatar"><defs><linearGradient id="avHilalBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b1a5e"/><stop offset="1" stop-color="#0b0724"/></linearGradient><linearGradient id="avHilalG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffedb0"/><stop offset="1" stop-color="#d4af37"/></linearGradient><mask id="avHilalM"><rect width="64" height="64" fill="#fff"/><circle cx="39" cy="24" r="12" fill="#000"/></mask></defs><rect width="64" height="64" fill="url(#avHilalBg)"/><circle cx="32" cy="32" r="14" fill="url(#avHilalG)" mask="url(#avHilalM)"/><path d="M45.5 17.5l1.6 4.2 4.2 1.6-4.2 1.6-1.6 4.2-1.6-4.2-4.2-1.6 4.2-1.6z" fill="url(#avHilalG)"/><circle cx="13" cy="13" r="1.5" fill="#fff" opacity=".85"/><circle cx="53" cy="45" r="1.5" fill="#fff" opacity=".6"/><circle cx="16" cy="49" r="1" fill="#fff" opacity=".5"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
  kaaba: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Kaaba avatar"><defs><linearGradient id="avKaabaBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#032b23"/><stop offset="1" stop-color="#0b4f42"/></linearGradient><linearGradient id="avKaabaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffedb0"/><stop offset="1" stop-color="#d4af37"/></linearGradient></defs><rect width="64" height="64" fill="url(#avKaabaBg)"/><ellipse cx="32" cy="52" rx="16" ry="3" fill="#000" opacity=".35"/><polygon points="22,24 32,18 46,24 36,30" fill="#3a3a3a"/><polygon points="22,24 36,30 36,50 22,44" fill="#141414"/><polygon points="36,30 46,24 46,44 36,50" fill="#232323"/><polygon points="22,31 36,37 36,40.5 22,34.5" fill="url(#avKaabaG)"/><polygon points="36,37 46,31 46,34.5 36,40.5" fill="url(#avKaabaG)"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
  dome: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Dome avatar"><defs><linearGradient id="avDomeBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a123c"/><stop offset="1" stop-color="#26348d"/></linearGradient><linearGradient id="avDomeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffedb0"/><stop offset="1" stop-color="#d4af37"/></linearGradient></defs><rect width="64" height="64" fill="url(#avDomeBg)"/><circle cx="50" cy="12" r="1.5" fill="#fff" opacity=".8"/><circle cx="12" cy="18" r="1.2" fill="#fff" opacity=".6"/><rect x="12" y="46" width="40" height="4" rx="2" fill="url(#avDomeG)"/><rect x="15" y="30" width="3.4" height="16" fill="url(#avDomeG)"/><rect x="45.6" y="30" width="3.4" height="16" fill="url(#avDomeG)"/><rect x="13.8" y="35" width="5.8" height="2" fill="url(#avDomeG)"/><rect x="44.4" y="35" width="5.8" height="2" fill="url(#avDomeG)"/><path d="M15 30c0-3.4 1.5-5.2 3.4-5.8C20.3 24.8 22 26.6 22 30z" fill="url(#avDomeG)"/><path d="M45.6 30c0-3.4 1.5-5.2 3.4-5.8 1.9.6 3.6 2.4 3.6 5.8z" fill="url(#avDomeG)"/><path d="M22 46c0-9 4-14 10-16 6 2 10 7 10 16z" fill="url(#avDomeG)"/><rect x="31.3" y="21" width="1.4" height="7" fill="url(#avDomeG)"/><circle cx="32" cy="19" r="2" fill="url(#avDomeG)"/><path d="M28 46v-4a4 4 0 0 1 8 0v4z" fill="#0a123c" opacity=".85"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
  star8: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Star avatar"><defs><linearGradient id="avStarBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c0f3f"/><stop offset="1" stop-color="#4c1d95"/></linearGradient><linearGradient id="avStarG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffedb0"/><stop offset="1" stop-color="#d4af37"/></linearGradient></defs><rect width="64" height="64" fill="url(#avStarBg)"/><rect x="20" y="20" width="24" height="24" fill="none" stroke="url(#avStarG)" stroke-width="2.5"/><g transform="rotate(45 32 32)"><rect x="20" y="20" width="24" height="24" fill="none" stroke="url(#avStarG)" stroke-width="2.5"/></g><circle cx="32" cy="32" r="9" fill="none" stroke="url(#avStarG)" stroke-width="1.5" opacity=".7"/><circle cx="32" cy="32" r="4.5" fill="url(#avStarG)"/><circle cx="32" cy="12" r="1.5" fill="#fff" opacity=".8"/><circle cx="52" cy="32" r="1.5" fill="#fff" opacity=".6"/><circle cx="32" cy="52" r="1.5" fill="#fff" opacity=".6"/><circle cx="12" cy="32" r="1.5" fill="#fff" opacity=".8"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
  fanoos: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Lantern avatar"><defs><linearGradient id="avFanBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e0b2c"/><stop offset="1" stop-color="#93360f"/></linearGradient><linearGradient id="avFanG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffedb0"/><stop offset="1" stop-color="#d4af37"/></linearGradient></defs><rect width="64" height="64" fill="url(#avFanBg)"/><circle cx="32" cy="8" r="3" fill="none" stroke="url(#avFanG)" stroke-width="2"/><polygon points="24,14 40,14 36,20 28,20" fill="url(#avFanG)"/><ellipse cx="32" cy="31" rx="12" ry="14" fill="#fbbf24" opacity=".25"/><rect x="24" y="20" width="16" height="22" rx="6" fill="#ffdf9e" opacity=".92"/><line x1="29" y1="21" x2="29" y2="41" stroke="#b45309" stroke-width="1.4"/><line x1="35" y1="21" x2="35" y2="41" stroke="#b45309" stroke-width="1.4"/><polygon points="28,42 36,42 32,48" fill="url(#avFanG)"/><circle cx="32" cy="50" r="1.6" fill="url(#avFanG)"/><line x1="32" y1="51.6" x2="32" y2="55" stroke="url(#avFanG)" stroke-width="1.6"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
  tasbih: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Tasbih avatar"><defs><linearGradient id="avTasBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#032725"/><stop offset="1" stop-color="#115e59"/></linearGradient><linearGradient id="avTasG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffedb0"/><stop offset="1" stop-color="#d4af37"/></linearGradient></defs><rect width="64" height="64" fill="url(#avTasBg)"/><circle cx="32" cy="28" r="14.5" fill="none" stroke="url(#avTasG)" stroke-width="5" stroke-dasharray="0.1 5.35" stroke-linecap="round"/><line x1="32" y1="42.5" x2="32" y2="47" stroke="url(#avTasG)" stroke-width="2"/><polygon points="32,47 36,51 32,55 28,51" fill="url(#avTasG)"/><line x1="32" y1="55" x2="32" y2="59" stroke="url(#avTasG)" stroke-width="1.6"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
  mushaf: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Mushaf avatar"><defs><linearGradient id="avMusBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#141145"/><stop offset="1" stop-color="#3730a3"/></linearGradient></defs><rect width="64" height="64" fill="url(#avMusBg)"/><path d="M12 22 Q22 17 32 22 L32 46 Q22 41 12 46 Z" fill="#f7f0dc"/><path d="M52 22 Q42 17 32 22 L32 46 Q42 41 52 46 Z" fill="#efe4c8"/><line x1="32" y1="22" x2="32" y2="46" stroke="#b89b3e" stroke-width="1.6"/><line x1="16" y1="28" x2="28" y2="25" stroke="#c9b98f" stroke-width="1.4"/><line x1="16" y1="33" x2="28" y2="30" stroke="#c9b98f" stroke-width="1.4"/><line x1="36" y1="25" x2="48" y2="28" stroke="#c9b98f" stroke-width="1.4"/><line x1="36" y1="30" x2="48" y2="33" stroke="#c9b98f" stroke-width="1.4"/><polygon points="29,22 35,22 35,34 32,31 29,34" fill="#991b1b"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
  mihrab: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Mihrab avatar"><defs><linearGradient id="avMihBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d091b"/><stop offset="1" stop-color="#881337"/></linearGradient><linearGradient id="avMihG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffedb0"/><stop offset="1" stop-color="#d4af37"/></linearGradient></defs><rect width="64" height="64" fill="url(#avMihBg)"/><path d="M18 54 V32 C18 20 24 14 32 12 C40 14 46 20 46 32 V54" fill="#2a0a14" stroke="url(#avMihG)" stroke-width="3"/><line x1="32" y1="14" x2="32" y2="22" stroke="url(#avMihG)" stroke-width="1.6"/><ellipse cx="32" cy="30" rx="7" ry="9" fill="#fbbf24" opacity=".22"/><polygon points="32,24 35.5,29 32,34 28.5,29" fill="url(#avMihG)"/><rect x="22" y="50" width="20" height="3" rx="1.5" fill="url(#avMihG)" opacity=".8"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
  badr: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Full moon avatar"><defs><linearGradient id="avBadBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050a28"/><stop offset="1" stop-color="#2547a8"/></linearGradient><radialGradient id="avBadM" cx=".38" cy=".35" r=".9"><stop offset="0" stop-color="#fef3c7"/><stop offset="1" stop-color="#f59e0b"/></radialGradient></defs><rect width="64" height="64" fill="url(#avBadBg)"/><circle cx="12" cy="14" r="1.4" fill="#fff" opacity=".9"/><circle cx="50" cy="12" r="1.2" fill="#fff" opacity=".7"/><circle cx="54" cy="50" r="1.4" fill="#fff" opacity=".8"/><circle cx="10" cy="46" r="1.1" fill="#fff" opacity=".6"/><circle cx="44" cy="20" r="1" fill="#fff" opacity=".7"/><circle cx="32" cy="32" r="13" fill="url(#avBadM)"/><circle cx="28" cy="28" r="2.2" fill="#b45309" opacity=".35"/><circle cx="36" cy="34" r="1.6" fill="#b45309" opacity=".35"/><circle cx="31" cy="38" r="1.2" fill="#b45309" opacity=".35"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
  lulu: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Pearl avatar"><defs><linearGradient id="avLulBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#012331"/><stop offset="1" stop-color="#0e7490"/></linearGradient><radialGradient id="avLulP" cx=".35" cy=".3" r="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#94a3b8"/></radialGradient></defs><rect width="64" height="64" fill="url(#avLulBg)"/><path d="M12 42 Q32 52 52 42 L46 28 Q32 34 18 28 Z" fill="#d9b98a"/><path d="M12 42 Q32 52 52 42" fill="none" stroke="#8a6d3b" stroke-width="2"/><line x1="24" y1="32" x2="21" y2="44" stroke="#8a6d3b" stroke-width="1.4"/><line x1="32" y1="31" x2="32" y2="45" stroke="#8a6d3b" stroke-width="1.4"/><line x1="40" y1="32" x2="43" y2="44" stroke="#8a6d3b" stroke-width="1.4"/><circle cx="32" cy="30" r="7.5" fill="url(#avLulP)"/><circle cx="29.5" cy="27.5" r="2" fill="#fff" opacity=".9"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
  nakhil: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Palm avatar"><defs><linearGradient id="avNakBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1055"/><stop offset=".55" stop-color="#9a3412"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><rect width="64" height="64" fill="url(#avNakBg)"/><circle cx="32" cy="40" r="8" fill="#fde68a" opacity=".9"/><ellipse cx="32" cy="54" rx="20" ry="3.5" fill="#2d1203"/><polygon points="30,54 34,54 33,32 31,32" fill="#3f1d05"/><path d="M32 32 Q24 26 15 28" fill="none" stroke="#2d1203" stroke-width="2.5" stroke-linecap="round"/><path d="M32 32 Q26 22 18 20" fill="none" stroke="#2d1203" stroke-width="2.5" stroke-linecap="round"/><path d="M32 32 Q32 24 33 17" fill="none" stroke="#2d1203" stroke-width="2.5" stroke-linecap="round"/><path d="M32 32 Q40 26 49 28" fill="none" stroke="#2d1203" stroke-width="2.5" stroke-linecap="round"/><path d="M32 32 Q38 22 46 20" fill="none" stroke="#2d1203" stroke-width="2.5" stroke-linecap="round"/><circle cx="30" cy="33" r="1.6" fill="#451a03"/><circle cx="34" cy="33" r="1.6" fill="#451a03"/><path d="M16 13 q2-2 4 0 q2-2 4 0" fill="none" stroke="#2d1203" stroke-width="1.6" stroke-linecap="round"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
  zamzam: `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block" role="img" aria-label="Zamzam avatar"><defs><linearGradient id="avZamBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#062743"/><stop offset="1" stop-color="#0369a1"/></linearGradient><linearGradient id="avZamW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0f2fe"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs><rect width="64" height="64" fill="url(#avZamBg)"/><path d="M32 8 C32 8 17 30 17 40 a15 15 0 0 0 30 0 C47 30 32 8 32 8 Z" fill="url(#avZamW)"/><path d="M35.5 38.5A6.5 6.5 0 1 1 28.6 30 5.2 5.2 0 1 0 35.5 38.5Z" fill="#fff" opacity=".85"/><ellipse cx="25" cy="33" rx="2" ry="4" fill="#fff" opacity=".7" transform="rotate(-18 25 33)"/><circle cx="32" cy="32" r="30" fill="none" stroke="#f5c94c" stroke-opacity=".5" stroke-width="2"/></svg>`,
};

function escFace(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Resolve the visible face for a user: custom photo → SVG avatar →
// classic emoji (legacy) → name initial. Returns an HTML string when it
// is an image/svg, otherwise a plain character for textContent use.
export function faceFor(u) {
  const photo = String(u?.avatar || '').replace(/"/g, '').trim();
  if (photo) return `<img src="${escFace(photo)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block" />`;
  const pick = String(u?.avatar_emoji || '').trim();
  if (pick && AVATAR_SVGS[pick]) return AVATAR_SVGS[pick];
  const ch = pick || String(u?.name || u?.username || 'R').trim().charAt(0).toUpperCase() || 'R';
  return escFace(ch);
}
