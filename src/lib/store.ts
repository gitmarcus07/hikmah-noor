// Hikmah Noor client store — device-local persistence (no accounts).
// localStorage JSON wrapper, SSR-safe: only import/call from inline
// client <script> blocks or .astro frontmatter guarded by `typeof window`.
// Keys are versioned (`.v1`) so schemas can evolve without breaking users.

export function load<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save(key: string, val: unknown): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* storage full or blocked (private mode) — stay read-only */
  }
}

export function remove(key: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export interface Bookmark {
  kind: 'dua' | 'waqiah' | 'prophet' | 'verse' | 'hadees' | 'seerah' | 'kalima' | 'meaning';
  /** Canonical path, e.g. `/duas/salah-prayer/ayatul-kursi-salah/` or `/prophets/yusuf-dream-to-throne/`. */
  ref: string;
  title: string;
  addedAt: string; // ISO date
}

export interface Progress {
  activeDays: string[]; // YYYY-MM-DD (UTC), deduped
  versesTotal: number;
  hasanatTotal: number;
  lastSpot: { surah: number; verse: number } | null;
  perSurah: Record<string, number>; // surah num -> max verse reached
}

export const KEYS = {
  bookmarks: 'hn.bookmarks.v1',
  progress: 'hn.progress.v1',
  tasbih: 'hn.tasbih.v1',
  challenges: 'hn.challenges.v1',
} as const;

export function emptyProgress(): Progress {
  return { activeDays: [], versesTotal: 0, hasanatTotal: 0, lastSpot: null, perSurah: {} };
}
