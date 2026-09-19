-- Hikmah Noor public-profile visibility toggles (Cloudflare D1 / SQLite).
-- Apply: wrangler d1 execute hikmah-noor-habit --file=./migrations/0004_visibility.sql
-- 1 = show on the public profile & leaderboard, 0 = hide.
-- Display name, username and photo stay public always (no toggle).

ALTER TABLE users ADD COLUMN show_country INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN show_city INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN show_bio INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN show_gender INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN show_stats INTEGER NOT NULL DEFAULT 1;
