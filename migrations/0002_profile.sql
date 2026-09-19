-- Hikmah Noor profile fields (Cloudflare D1 / SQLite).
-- Apply: wrangler d1 execute hikmah-noor-habit --file=./migrations/0002_profile.sql
-- Adds editable profile details on top of users table from 0001_habit.sql.

ALTER TABLE users ADD COLUMN username TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN country TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN city TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN bio TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN gender TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN language TEXT NOT NULL DEFAULT 'en';
ALTER TABLE users ADD COLUMN avatar_emoji TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN updated_at INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username != '';
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
