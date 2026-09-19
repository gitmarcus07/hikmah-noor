-- Hikmah Noor challenge start tracking (Cloudflare D1 / SQLite).
-- Apply: wrangler d1 execute hikmah-noor-habit --file=./migrations/0003_challenge_start.sql
-- Powers honest "X days left" countdowns on time-boxed challenges.

ALTER TABLE challenge_progress ADD COLUMN started_at INTEGER;
