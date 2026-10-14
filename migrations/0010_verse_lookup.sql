-- Point-lookup table for single verses. verses_fts keeps UNINDEXED surah/verse
-- aux columns, so `WHERE surah = ? AND verse = ?` scans all ~6.2K rows per
-- call and burns the D1 daily read quota (Googlebot crawling ayah pages
-- finished it). This ordinary table + PK serves the same rows for ~1 read
-- per call. Backfilled once from the FTS table below.
CREATE TABLE IF NOT EXISTS verses (
  surah INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  sname TEXT,
  ar TEXT,
  ur TEXT,
  en TEXT,
  hi TEXT,
  PRIMARY KEY (surah, verse)
);
INSERT OR IGNORE INTO verses (surah, verse, sname, ar, ur, en, hi)
  SELECT surah, verse, sname, ar, ur, en, hi FROM verses_fts;
