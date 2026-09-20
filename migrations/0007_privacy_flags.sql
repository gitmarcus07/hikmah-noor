-- Hikmah Noor leaderboard-privacy + display flags (Cloudflare D1 / SQLite).
-- Apply: wrangler d1 execute hikmah-noor-habit --file=./migrations/0007_privacy_flags.sql
-- show_name / show_avatar power the leaderboard privacy modal (Quranly-style
-- "Show Name / Show Picture" toggles). hide_hasanat powers Settings →
-- "Hide Hasanat". All default to visible (1) so existing users see no change.
-- Frontend + API degrade gracefully when this migration is not yet applied.

ALTER TABLE users ADD COLUMN show_name INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN show_avatar INTEGER NOT NULL DEFAULT 1;

ALTER TABLE prefs ADD COLUMN hide_hasanat INTEGER NOT NULL DEFAULT 0;
