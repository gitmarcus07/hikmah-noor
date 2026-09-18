-- Hikmah Noor habit-tracker schema (Cloudflare D1 / SQLite).
-- Apply: wrangler d1 execute hikmah-noor-habit --file=./migrations/0001_habit.sql
-- All timestamps are Unix seconds (UTC). Dates are YYYY-MM-DD (UTC).

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT 'email',
  password_hash TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS prefs (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  daily_goal INTEGER NOT NULL DEFAULT 1,
  streak_goal INTEGER NOT NULL DEFAULT 7,
  font_size_script REAL NOT NULL DEFAULT 2.0,
  font_size_translation REAL NOT NULL DEFAULT 1.0,
  font_size_translit REAL NOT NULL DEFAULT 1.0,
  reciter TEXT NOT NULL DEFAULT 'Alafasy_128kbps',
  reciter_speed REAL NOT NULL DEFAULT 1.0,
  translation TEXT NOT NULL DEFAULT 'ur',
  reminder_time TEXT,
  second_reminder INTEGER NOT NULL DEFAULT 0,
  alerts_on INTEGER NOT NULL DEFAULT 0,
  onboarded INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reading_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  surah INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  verses INTEGER NOT NULL DEFAULT 1,
  seconds INTEGER NOT NULL DEFAULT 0,
  hasanat INTEGER NOT NULL DEFAULT 0,
  pages_est REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_user_date ON reading_events(user_id, date);

CREATE TABLE IF NOT EXISTS streaks (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current INTEGER NOT NULL DEFAULT 0,
  longest INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT
);

CREATE TABLE IF NOT EXISTS challenge_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL,
  completed_at INTEGER,
  PRIMARY KEY (user_id, slug)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  ref TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, kind, ref)
);

CREATE TABLE IF NOT EXISTS resume_points (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  surah INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  juz INTEGER,
  updated_at INTEGER NOT NULL
);

-- Simple D1-backed rate limiting for auth endpoints.
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);
