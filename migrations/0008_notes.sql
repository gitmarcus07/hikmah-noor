-- Hikmah Noor personal notes (Cloudflare D1 / SQLite).
-- Apply: wrangler d1 execute hikmah-noor-habit --file=./migrations/0008_notes.sql
-- Private per-user notes (Settings → Personal Notes). Included in the
-- account-delete cascade. Frontend degrades to an error message if the
-- table is missing (API returns 501).

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  ref TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
