/* ============================================================================
   Hikmah Noor — global Quran audio player (continuous-stream edition)
   ----------------------------------------------------------------------------
   The problem this file solves: with one MP3 per verse, playing a Para required
   JavaScript to run at every verse boundary (onended → change src → play). On a
   locked Android phone that JavaScript is suspended, so playback stopped after a
   verse or two. Retries and watchdogs did not help because the gap was not an
   error — it was the architecture.

   The fix: the whole queue is assembled ONCE into a single continuous MPEG
   resource, then handed to one HTMLAudioElement. After that the browser's media
   pipeline plays the resource on its own; no JavaScript runs between verses.
   Lock the phone and it keeps playing.

   How it works:
     1. playQueue() downloads every verse in the queue (bounded concurrency),
        parses each file's real duration, concatenates the raw MPEG frames into
        one Blob and gives the element its object URL. Verse files are raw MPEG
        frames with no ID3 tags, so binary concatenation yields a valid stream.
     2. A start-offset timeline (verse → [start, duration)) is derived from those
        per-verse durations; currentTime is mapped back to the current verse on
        timeupdate. If JavaScript is throttled while locked, the audio keeps
        going and the UI simply catches up when it runs again.
     3. pause/resume keep the exact currentTime. next/prev seek to a verse's
        start offset inside the same resource — never a new src.
     4. The stream is cached in memory, so replaying/re-selecting is instant and
        a client-side navigation inside the Quran routes does not rebuild it.

   Translation audio is unchanged in behaviour: when a translation mode is on,
   the Arabic is briefly paused at each verse boundary so the translation can
   play, then resumed — exactly as before. That path still needs JavaScript, but
   the Arabic-only path (the background acceptance test) does not.

   The module is a plain singleton (no framework) imported once from BaseLayout.
   On the Quran routes Astro's ClientRouter keeps it (and the element in the
   transition:persist host) alive across navigation.
   ========================================================================== */

import { isQuranRoute } from '../lib/quran-routes';
import { mp3DurationSeconds } from '../lib/mp3-duration';

export type ReciterKey = 'alafasy' | 'basit' | 'husary' | 'muaiqly' | 'minshawi';
export type TrMode = 'off' | 'ur' | 'en' | 'hi';
export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended';
export type PlayerPhase = 'arabic' | 'translation';

export interface QueueItem {
  surah: number;
  verse: number;
}

export interface QueueMeta {
  type: 'para' | 'surah' | 'single';
  para?: number;
  surah?: number;
  label?: string;
  /** Reader page URL, used by the mini-player "Open" link. */
  href?: string;
  /** surah number → surah name, so lock-screen titles are readable. */
  surahNames?: Record<string, string>;
}

export interface PlayerState {
  status: PlayerStatus;
  phase: PlayerPhase;
  index: number;
  total: number;
  current: QueueItem | null;
  meta: QueueMeta | null;
  /** Position within the continuous stream, in seconds. */
  time: number;
  /** Duration of the continuous stream, in seconds. */
  duration: number;
  reciter: ReciterKey;
  trMode: TrMode;
  /** Download progress while status === 'loading' (0..1). */
  progress: number;
}

export interface QuranAudioApi {
  playQueue(items: QueueItem[], startIndex: number, meta: QueueMeta): void;
  /** Toggle the current queue if it matches, otherwise start from index 0. */
  toggleQueue(items: QueueItem[], meta: QueueMeta): void;
  toggle(): void;
  play(): void;
  pause(): void;
  next(): void;
  prev(): void;
  seek(time: number): void;
  stop(): void;
  clear(): void;
  getState(): PlayerState;
  subscribe(cb: (state: PlayerState) => void): () => void;
}

/* ------------------------------- config ---------------------------------- */

export const RECITERS: Record<ReciterKey, { label: string; base: string }> = {
  alafasy: { label: 'Mishary Alafasy', base: 'https://everyayah.com/data/Alafasy_128kbps/' },
  basit: { label: 'Abdul Basit (Mujawwad)', base: 'https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/' },
  husary: { label: 'Mahmoud Al-Husary', base: 'https://everyayah.com/data/Husary_128kbps/' },
  muaiqly: { label: 'Maher Al-Muaiqly', base: 'https://everyayah.com/data/Maher_AlMuaiqly_64kbps/' },
  minshawi: { label: 'Al-Minshawi (Murattal)', base: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/' },
};

export const TR_LABELS: Record<TrMode, string> = {
  off: 'No translation audio',
  ur: '+ اردو audio',
  en: '+ English audio',
  hi: '+ हिन्दी voice',
};

export const TR_BASE: Record<'ur' | 'en', string> = {
  ur: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/',
  en: 'https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps/',
};

const pad3 = (n: number): string => String(n).padStart(3, '0');
export const verseAudioUrl = (reciter: ReciterKey, surah: number, verse: number): string =>
  RECITERS[reciter].base + pad3(surah) + pad3(verse) + '.mp3';
export const trAudioUrl = (mode: 'ur' | 'en', surah: number, verse: number): string =>
  TR_BASE[mode] + pad3(surah) + pad3(verse) + '.mp3';

const REC_KEY = 'hn.reciter.v1';
const TR_KEY = 'hn.quranTrMode.v1';
const SAVE_KEY = 'hn.quranAudio.v1';
const SUBTITLE = 'Hikmah Noor — Quran';
/** How many verse files to download at once while assembling the stream. */
const FETCH_CONCURRENCY = 6;

export const RECITER_LABELS: Record<ReciterKey, string> = Object.fromEntries(
  Object.entries(RECITERS).map(([k, v]) => [k, v.label]),
) as Record<ReciterKey, string>;

const clamp = (n: number, lo: number, hi: number): number => Math.min(Math.max(n, lo), hi);
const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/* ------------------------------ persisted prefs --------------------------- */

let reciter: ReciterKey = (() => {
  try {
    const saved = localStorage.getItem(REC_KEY);
    if (saved && (RECITERS as Record<string, unknown>)[saved]) return saved as ReciterKey;
  } catch {
    /* ignore */
  }
  return 'alafasy';
})();

let trMode: TrMode = (() => {
  try {
    const saved = localStorage.getItem(TR_KEY);
    if (saved === 'off' || saved === 'ur' || saved === 'en' || saved === 'hi') return saved;
  } catch {
    /* ignore */
  }
  return 'off';
})();

export const getReciter = (): ReciterKey => reciter;
export const getTrMode = (): TrMode => trMode;

export const setReciter = (key: ReciterKey): void => {
  if (!(RECITERS as Record<string, unknown>)[key]) return;
  reciter = key;
  try {
    localStorage.setItem(REC_KEY, key);
  } catch {
    /* ignore */
  }
  emit();
  scheduleSave();
};

export const setTrMode = (mode: TrMode): void => {
  trMode = mode;
  try {
    localStorage.setItem(TR_KEY, mode);
  } catch {
    /* ignore */
  }
  // Turning translation off mid-flight must release the paused Arabic stream.
  if (mode === 'off' && phase === 'translation') {
    stopTranslation();
    phase = 'arabic';
    const seg = timeline[index];
    if (seg) {
      try {
        AR.currentTime = seg.start + 0.001;
      } catch {
        /* ignore */
      }
    }
    if (status === 'playing' || status === 'loading') AR.play().catch(() => {});
  }
  emit();
  scheduleSave();
};

/** Resolver so the player can read verse text (only needed for Hindi speech). */
type TextResolver = (surah: number, verse: number, lang: 'ur' | 'en' | 'hi') => string;
let textResolver: TextResolver | null = null;
export const setTextResolver = (fn: TextResolver | null): void => {
  textResolver = fn;
};

/* ------------------------------- elements --------------------------------- */

const AR = document.createElement('audio');
AR.preload = 'auto';
AR.setAttribute('playsinline', '');
AR.setAttribute('aria-hidden', 'true');
AR.id = 'hn-quran-audio';

const TR = document.createElement('audio');
TR.preload = 'none';
TR.setAttribute('aria-hidden', 'true');
TR.id = 'hn-quran-tr-audio';

/** The persistent host keeps the audio across client-side navigation. */
function audioHost(): HTMLElement {
  return document.getElementById('hn-audio-host') || document.body;
}

/** Re-attach the elements if the host was swapped or is missing. */
function ensureMounted(): void {
  if (typeof document === 'undefined') return;
  const host = audioHost();
  if (!host) return;
  if (AR.parentNode !== host) host.appendChild(AR);
  if (TR.parentNode !== host) host.appendChild(TR);
}

if (typeof document !== 'undefined') {
  if (document.body) ensureMounted();
  else document.addEventListener('DOMContentLoaded', ensureMounted, { once: true });
}

/* -------------------------------- state ----------------------------------- */

/** One verse's slice of the continuous stream. */
interface Segment {
  item: QueueItem;
  start: number;
  duration: number;
}

let items: QueueItem[] = [];
let meta: QueueMeta | null = null;
let index = 0;
let status: PlayerStatus = 'idle';
let phase: PlayerPhase = 'arabic';
let progress = 0;
let hasSaved = false;
/** True only when the user explicitly paused — blocks implicit auto-resume. */
let userPaused = false;
/** True while we swap the audio source, so the transient pause event is ignored. */
let switching = false;
/** Position to resume from once a freshly assembled stream is ready. */
let resumeTime = 0;
/** The verse to continue from after a translation finishes. */
let pendingResumeIndex = 0;

/* ---- continuous stream ---- */
let timeline: Segment[] = [];
let streamKey = '';
let streamReady = false;
let objectUrl: string | null = null;
/** Bumped on every new play/pause so a stale start sequence bails out. */
let opToken = 0;
/**
 * Bumped only when a genuinely new stream must supersede the one being built
 * (a different queue, or clear()). Kept separate from opToken so pausing and
 * resuming the same queue reuses the assembly instead of cancelling it.
 */
let buildId = 0;
let inflightKey = '';
let inflight: Promise<boolean> | null = null;

const subs = new Set<(state: PlayerState) => void>();
let saveTimer = 0;

/* ------------------------------- diagnostics ------------------------------ */
/* Opt-in only, so production stays quiet. Enable with ?hnaudio=1 on the URL, or
   localStorage.setItem('hn.audioDebug','1'). Logs go to the console and are
   also kept on window.__hnAudioDebug (last 250 entries) for remote debugging. */
const DEBUG_ENABLED = (() => {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(location.search);
    if (params.get('hnaudio') === '1') sessionStorage.setItem('hn.audioDebug', '1');
    if (params.get('hnaudio') === '0') sessionStorage.removeItem('hn.audioDebug');
    return sessionStorage.getItem('hn.audioDebug') === '1' || localStorage.getItem('hn.audioDebug') === '1';
  } catch {
    return false;
  }
})();

function audioSnapshot(extra?: Record<string, unknown>): Record<string, unknown> {
  const ms = mediaSession();
  return {
    at: new Date().toISOString(),
    visibility: document.visibilityState,
    hidden: document.hidden,
    paused: AR.paused,
    ended: AR.ended,
    readyState: AR.readyState,
    networkState: AR.networkState,
    currentTime: Math.round(AR.currentTime * 1000) / 1000,
    duration: Number.isFinite(AR.duration) ? Math.round(AR.duration * 1000) / 1000 : null,
    src: AR.currentSrc || AR.src || null,
    error: AR.error ? { code: AR.error.code, message: AR.error.message } : null,
    appStatus: status,
    phase,
    index,
    total: items.length,
    reciter,
    userPaused,
    streamReady,
    mediaSession: ms ? ms.playbackState : 'unsupported',
    ...extra,
  };
}

function debugLog(event: string, extra?: Record<string, unknown>): void {
  if (!DEBUG_ENABLED) return;
  const entry = { event, ...audioSnapshot(extra) };
  try {
    const w = window as unknown as { __hnAudioDebug?: Record<string, unknown>[] };
    if (!w.__hnAudioDebug) w.__hnAudioDebug = [];
    w.__hnAudioDebug.push(entry);
    if (w.__hnAudioDebug.length > 250) w.__hnAudioDebug.splice(0, w.__hnAudioDebug.length - 250);
  } catch {
    /* ignore */
  }
  console.info('[QURAN AUDIO DEBUG]', event, entry);
}

function startDiagnostics(): void {
  if (!DEBUG_ENABLED) return;
  // Read the captured log with window.__hnAudioDump() over chrome://inspect.
  (window as unknown as { __hnAudioDump?: () => string }).__hnAudioDump = () =>
    JSON.stringify((window as unknown as { __hnAudioDebug?: unknown[] }).__hnAudioDebug || [], null, 2);
  const arEvents = [
    'loadstart', 'durationchange', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
    'play', 'playing', 'pause', 'ended', 'error', 'stalled', 'waiting', 'suspend', 'abort',
    'emptied', 'seeking', 'seeked', 'ratechange', 'volumechange',
  ];
  for (const ev of arEvents) AR.addEventListener(ev, () => debugLog(`ar:${ev}`));
  let lastProgressLog = 0;
  AR.addEventListener('timeupdate', () => {
    const now = Date.now();
    if (now - lastProgressLog > 5000) {
      lastProgressLog = now;
      debugLog('ar:timeupdate');
    }
  });
  TR.addEventListener('ended', () => debugLog('tr:ended'));
  TR.addEventListener('error', () => debugLog('tr:error'));
  document.addEventListener('visibilitychange', () => debugLog('document:visibilitychange'));
  document.addEventListener('freeze', () => debugLog('document:freeze'));
  document.addEventListener('resume', () => debugLog('document:resume'));
  window.addEventListener('pagehide', () => debugLog('window:pagehide'));
  window.addEventListener('pageshow', () => debugLog('window:pageshow'));
  window.addEventListener('blur', () => debugLog('window:blur'));
  window.addEventListener('focus', () => debugLog('window:focus'));
  window.addEventListener('online', () => debugLog('window:online'));
  window.addEventListener('offline', () => debugLog('window:offline'));
}

function currentItem(): QueueItem | null {
  return items[index] ?? null;
}

function streamDuration(): number {
  if (streamReady && Number.isFinite(AR.duration) && AR.duration > 0) return AR.duration;
  const last = timeline[timeline.length - 1];
  return last ? last.start + last.duration : 0;
}

function state(): PlayerState {
  return {
    status,
    phase,
    index,
    total: items.length,
    current: currentItem(),
    meta,
    time: streamReady ? AR.currentTime || 0 : resumeTime,
    duration: streamDuration(),
    reciter,
    trMode,
    progress,
  };
}

function emit(): void {
  const s = state();
  subs.forEach((cb) => {
    try {
      cb(s);
    } catch {
      /* subscriber errors must not break playback */
    }
  });
  try {
    window.dispatchEvent(new CustomEvent<PlayerState>('hn:quranaudio', { detail: s }));
  } catch {
    /* ignore */
  }
  paintMedia(s);
  paintMini(s);
}

/* ------------------------------ media session ----------------------------- */

let lastMetaKey = '';

function mediaSession(): MediaSession | null {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator ? navigator.mediaSession : null;
}

function surahName(surah: number): string {
  const name = meta?.surahNames?.[String(surah)];
  return name ? `Surah ${name}` : `Surah ${surah}`;
}

function titleFor(item: QueueItem): string {
  const prefix = meta?.type === 'para' && meta.label ? `${meta.label} — ` : '';
  return `${prefix}${surahName(item.surah)} — Verse ${item.verse}`;
}

function paintMedia(s: PlayerState): void {
  const ms = mediaSession();
  if (!ms) return;
  const item = s.current;
  if (item) {
    const key = `${item.surah}:${item.verse}:${s.reciter}:${meta?.label ?? ''}`;
    if (key !== lastMetaKey && 'MediaMetadata' in window) {
      lastMetaKey = key;
      try {
        ms.metadata = new MediaMetadata({
          title: titleFor(item),
          artist: RECITERS[s.reciter].label,
          album: SUBTITLE,
        });
      } catch {
        /* older browsers */
      }
    }
  }
  try {
    ms.playbackState = s.status === 'playing' ? 'playing' : s.status === 'paused' ? 'paused' : 'none';
  } catch {
    /* ignore */
  }
  if (s.duration > 0 && Number.isFinite(AR.currentTime)) {
    try {
      ms.setPositionState({
        duration: s.duration,
        playbackRate: AR.playbackRate || 1,
        position: Math.min(Math.max(AR.currentTime, 0), s.duration),
      });
    } catch {
      /* unsupported */
    }
  }
}

function registerMediaHandlers(): void {
  const ms = mediaSession();
  if (!ms) return;
  const bind = (action: MediaSessionAction, handler: MediaSessionActionHandler): void => {
    try {
      ms.setActionHandler(action, handler);
    } catch {
      /* action unsupported in this browser */
    }
  };
  bind('play', () => api.play());
  bind('pause', () => api.pause());
  bind('stop', () => api.stop());
  bind('previoustrack', () => api.prev());
  bind('nexttrack', () => api.next());
  bind('seekbackward', (d) => api.seek(AR.currentTime - (d.seekOffset || 10)));
  bind('seekforward', (d) => api.seek(AR.currentTime + (d.seekOffset || 10)));
  bind('seekto', (d) => {
    if (typeof d.seekTime === 'number') api.seek(d.seekTime);
  });
}

/* ------------------------------ persistence ------------------------------- */

function savedPayload() {
  return {
    v: 1,
    meta,
    items: items.map((it) => [it.surah, it.verse]),
    index,
    time: streamReady ? AR.currentTime || 0 : resumeTime,
    reciter,
    trMode,
    updated: Date.now(),
  };
}

function saveNow(): void {
  if (!items.length) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(savedPayload()));
  } catch {
    /* storage full / disabled */
  }
}

function scheduleSave(): void {
  if (saveTimer) return;
  saveTimer = window.setTimeout(() => {
    saveTimer = 0;
    saveNow();
  }, 3000);
}

function restore(): void {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const p = JSON.parse(raw) as {
      meta?: QueueMeta;
      items?: [number, number][];
      index?: number;
      time?: number;
      reciter?: ReciterKey;
      trMode?: TrMode;
    };
    if (!p || !Array.isArray(p.items) || !p.items.length) return;
    items = p.items.map(([s, v]) => ({ surah: s, verse: v }));
    meta = p.meta ?? null;
    index = Math.min(Math.max(0, Number(p.index) || 0), items.length - 1);
    if (p.reciter && (RECITERS as Record<string, unknown>)[p.reciter]) reciter = p.reciter;
    if (p.trMode === 'off' || p.trMode === 'ur' || p.trMode === 'en' || p.trMode === 'hi') trMode = p.trMode;
    status = 'paused';
    phase = 'arabic';
    resumeTime = typeof p.time === 'number' && p.time > 0.5 ? p.time : 0;
    hasSaved = true;
    // The continuous stream is NOT built here: that would download a whole Para
    // on every page load. It is assembled lazily the first time play() runs.
    emit();
  } catch {
    /* corrupt state */
  }
}

/* --------------------------- continuous assembly -------------------------- */

/** Identity of a queue's audio: reciter + exact verse range. */
function streamKeyFor(list: QueueItem[], rec: ReciterKey): string {
  if (!list.length) return '';
  const a = list[0];
  const b = list[list.length - 1];
  return `${rec}|${list.length}|${a.surah}.${a.verse}-${b.surah}.${b.verse}`;
}

async function fetchOne(url: string): Promise<ArrayBuffer> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 4) throw new Error('empty response');
      return buf;
    } catch (err) {
      lastErr = err;
      await delay(400 * (attempt + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('fetch failed');
}

/** Download the whole queue with bounded concurrency, in queue order. */
async function fetchBuffers(urls: string[], id: number): Promise<ArrayBuffer[]> {
  const out: ArrayBuffer[] = new ArrayBuffer[urls.length];
  let cursor = 0;
  let done = 0;
  const worker = async (): Promise<void> => {
    for (;;) {
      const i = cursor++;
      if (i >= urls.length) return;
      if (id !== buildId) throw new Error('superseded');
      out[i] = await fetchOne(urls[i]);
      done++;
      progress = done / urls.length;
      if (id === buildId) emit();
    }
  };
  await Promise.all(Array.from({ length: Math.min(FETCH_CONCURRENCY, urls.length) }, worker));
  return out;
}

function makeTimeline(list: QueueItem[], durations: number[]): Segment[] {
  const segs: Segment[] = [];
  let t = 0;
  for (let i = 0; i < list.length; i++) {
    const d = durations[i] > 0.05 ? durations[i] : 1;
    segs.push({ item: list[i], start: t, duration: d });
    t += d;
  }
  return segs;
}

/**
 * Correct the per-verse durations against the element's real total duration, so
 * the timeline can never drift away from the media. Only applied when the
 * discrepancy is meaningful.
 */
function scaleTimeline(total: number): void {
  if (!timeline.length || !Number.isFinite(total) || total <= 0) return;
  const last = timeline[timeline.length - 1];
  const sum = last.start + last.duration;
  if (!sum) return;
  const ratio = total / sum;
  if (ratio > 0.99 && ratio < 1.01) return;
  let t = 0;
  for (const seg of timeline) {
    seg.duration *= ratio;
    seg.start = t;
    t += seg.duration;
  }
}

async function buildStream(list: QueueItem[], rec: ReciterKey): Promise<boolean> {
  const id = ++buildId;
  status = 'loading';
  progress = 0;
  try {
    AR.pause();
  } catch {
    /* ignore */
  }
  emit();

  const urls = list.map((it) => verseAudioUrl(rec, it.surah, it.verse));
  let buffers: ArrayBuffer[];
  try {
    buffers = await fetchBuffers(urls, id);
  } catch (err) {
    if (id === buildId) {
      debugLog('stream-build-failed', {
        reason: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      });
      status = 'paused';
      emit();
    }
    return false;
  }
  if (id !== buildId) return false;

  const durations = buffers.map(mp3DurationSeconds);
  const blob = new Blob(buffers, { type: 'audio/mpeg' });
  if (objectUrl) {
    try {
      URL.revokeObjectURL(objectUrl);
    } catch {
      /* ignore */
    }
  }
  objectUrl = URL.createObjectURL(blob);
  timeline = makeTimeline(list, durations);
  streamKey = streamKeyFor(list, rec);
  streamReady = true;

  switching = true;
  try {
    AR.src = objectUrl;
    AR.load();
  } catch {
    /* ignore */
  }
  debugLog('stream-built', { verses: list.length, bytes: blob.size, seconds: streamDuration() });
  return true;
}

/** Build the stream for the queue if it is not already the active one. */
async function ensureStream(list: QueueItem[], rec: ReciterKey): Promise<boolean> {
  const key = streamKeyFor(list, rec);
  if (key === streamKey && streamReady) return true;
  if (key === inflightKey && inflight) return inflight;
  const promise = buildStream(list, rec);
  inflightKey = key;
  inflight = promise;
  try {
    return await promise;
  } finally {
    if (inflight === promise) {
      inflight = null;
      inflightKey = '';
    }
  }
}

/** Resolve once the freshly attached stream reports its duration. */
function waitMetadata(timeout = 8000): Promise<void> {
  return new Promise((resolve) => {
    if (AR.readyState >= 1 && Number.isFinite(AR.duration) && AR.duration > 0) {
      resolve();
      return;
    }
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      AR.removeEventListener('loadedmetadata', finish);
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, timeout);
    AR.addEventListener('loadedmetadata', finish);
  });
}

function indexFromTime(t: number): number {
  if (!timeline.length) return 0;
  let lo = 0;
  let hi = timeline.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (timeline[mid].start <= t) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

/**
 * Assemble (if needed) and start the continuous stream, seeking to the target
 * verse or absolute position. All asynchronous work is fenced by a token so a
 * newer action always wins.
 */
async function startAt(opts: { index?: number; time?: number; autoplay: boolean }): Promise<void> {
  if (!items.length) {
    finish();
    return;
  }
  const my = ++opToken;
  index = clamp(Math.round(opts.index ?? index), 0, items.length - 1);

  const ok = await ensureStream(items, reciter);
  if (!ok || my !== opToken) return;

  await waitMetadata();
  if (my !== opToken || !streamReady) return;
  scaleTimeline(AR.duration);

  const total = streamDuration();
  const target =
    opts.time != null && opts.time > 0
      ? clamp(opts.time, 0, total)
      : (timeline[index]?.start ?? 0);
  try {
    AR.currentTime = target;
  } catch {
    /* ignore */
  }
  index = indexFromTime(AR.currentTime);
  resumeTime = AR.currentTime;
  switching = false;

  if (opts.autoplay) {
    userPaused = false;
    status = 'playing';
    emit();
    try {
      await AR.play();
    } catch {
      if (my === opToken) status = 'paused';
    }
  } else {
    status = 'paused';
  }
  emit();
  scheduleSave();
}

/* ------------------------------- playback --------------------------------- */

function stopTranslation(): void {
  try {
    TR.pause();
  } catch {
    /* ignore */
  }
  try {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

/** Pause the Arabic at a verse boundary, play that verse's translation. */
function playTranslation(atIndex: number, resumeIdx: number): void {
  phase = 'translation';
  index = atIndex;
  pendingResumeIndex = resumeIdx;
  emit();
  const it = items[atIndex];
  if (!it) {
    resumeArabicFrom(resumeIdx);
    return;
  }
  if (trMode === 'hi') {
    const text = textResolver ? textResolver(it.surah, it.verse, 'hi') : '';
    if (!text) {
      resumeArabicFrom(resumeIdx);
      return;
    }
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'hi-IN';
      u.rate = 0.95;
      u.onend = () => resumeArabicFrom(pendingResumeIndex);
      u.onerror = () => resumeArabicFrom(pendingResumeIndex);
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch {
      resumeArabicFrom(resumeIdx);
    }
    return;
  }
  TR.src = trAudioUrl(trMode as 'ur' | 'en', it.surah, it.verse);
  TR.play().then(
    () => {
      status = 'playing';
      emit();
    },
    () => resumeArabicFrom(pendingResumeIndex),
  );
}

/** Resume the continuous Arabic stream from a verse's offset after translation. */
function resumeArabicFrom(i: number): void {
  if (phase !== 'translation') return;
  stopTranslation();
  phase = 'arabic';
  if (i >= items.length) {
    finish();
    return;
  }
  const seg = timeline[i];
  if (seg) {
    try {
      AR.currentTime = seg.start + 0.001;
    } catch {
      /* ignore */
    }
  }
  index = clamp(i, 0, items.length - 1);
  status = 'playing';
  emit();
  AR.play().catch(() => {
    status = 'paused';
    emit();
  });
}

function seekToIndex(i: number, keepPlaying: boolean): void {
  if (!timeline.length) return;
  const seg = timeline[clamp(i, 0, timeline.length - 1)];
  if (!seg) return;
  stopTranslation();
  phase = 'arabic';
  try {
    AR.currentTime = seg.start + 0.001;
  } catch {
    /* ignore */
  }
  index = indexFromTime(AR.currentTime);
  if (keepPlaying) {
    status = 'playing';
    emit();
    AR.play().catch(() => {});
  } else {
    status = 'paused';
    emit();
  }
  scheduleSave();
}

function finish(): void {
  status = 'ended';
  phase = 'arabic';
  try {
    AR.pause();
  } catch {
    /* ignore */
  }
  stopTranslation();
  emit();
  saveNow();
}

function startQueue(newItems: QueueItem[], startIndex: number, newMeta: QueueMeta): void {
  if (!newItems.length) return;
  items = newItems.slice();
  meta = newMeta;
  index = clamp(startIndex, 0, items.length - 1);
  resumeTime = 0;
  userPaused = false;
  hasSaved = true;
  void startAt({ index, autoplay: true });
}

function pause(): void {
  if (status !== 'playing' && status !== 'loading') return;
  userPaused = true;
  opToken++; // cancel any in-flight assembly/start
  try {
    if (phase === 'translation') {
      if (trMode === 'hi') {
        if (typeof speechSynthesis !== 'undefined') speechSynthesis.pause();
      } else {
        TR.pause();
      }
    } else {
      AR.pause();
    }
  } catch {
    /* ignore */
  }
  status = 'paused';
  emit();
  saveNow();
}

function play(): void {
  if (!items.length) return;
  userPaused = false;
  if (!streamReady) {
    void startAt({ index, time: resumeTime > 0 ? resumeTime : undefined, autoplay: true });
    return;
  }
  if (status === 'ended') {
    void startAt({ index: 0, time: 0, autoplay: true });
    return;
  }
  if (status === 'loading') return;
  phase = 'arabic';
  status = 'playing';
  emit();
  AR.play().then(
    () => {
      status = 'playing';
      emit();
    },
    () => {
      status = 'paused';
      emit();
    },
  );
}

function seek(t: number): void {
  if (!items.length) return;
  const target = Math.max(0, t);
  if (!streamReady) {
    resumeTime = target;
    emit();
    return;
  }
  if (phase === 'translation' && trMode !== 'hi') {
    try {
      TR.currentTime = target;
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    AR.currentTime = clamp(target, 0, streamDuration());
  } catch {
    /* ignore */
  }
  index = indexFromTime(AR.currentTime);
  emit();
  scheduleSave();
}

/** Called on timeupdate: keep `index` (and the UI) in sync with currentTime. */
function syncIndex(): void {
  if (!streamReady || !timeline.length || phase !== 'arabic') return;
  const i = indexFromTime(AR.currentTime);
  if (i !== index) index = i;
}

/**
 * Translation-only: when the Arabic reaches the next verse's start, pause and
 * hand over to the translation. With translation off this is never called, so
 * the Arabic-only path has zero JavaScript at verse boundaries.
 */
function onArabicBoundary(): void {
  if (trMode === 'off' || phase !== 'arabic' || AR.paused || AR.ended) return;
  const nextIdx = index + 1;
  if (nextIdx >= timeline.length) return;
  if (AR.currentTime >= timeline[nextIdx].start - 0.04) {
    try {
      AR.pause();
      AR.currentTime = timeline[nextIdx].start;
    } catch {
      /* ignore */
    }
    playTranslation(index, nextIdx);
  }
}

const api: QuranAudioApi = {
  playQueue: (newItems, startIndex, newMeta) => startQueue(newItems, startIndex, newMeta),
  toggleQueue: (newItems, newMeta) => {
    const same =
      meta &&
      newMeta.type === meta.type &&
      newMeta.para === meta.para &&
      newMeta.surah === meta.surah &&
      items.length > 0;
    if (same) api.toggle();
    else startQueue(newItems, 0, newMeta);
  },
  toggle: () => {
    if (status === 'playing' || status === 'loading') api.pause();
    else api.play();
  },
  play,
  pause,
  next: () => {
    if (!items.length) return;
    if (!streamReady) {
      play();
      return;
    }
    if (index >= items.length - 1) {
      finish();
      return;
    }
    seekToIndex(index + 1, status === 'playing');
  },
  prev: () => {
    if (!items.length) return;
    if (!streamReady) {
      play();
      return;
    }
    // Standard player behaviour: restart the current verse once it is underway.
    const seg = timeline[index];
    if (seg && AR.currentTime - seg.start > 3) {
      seekToIndex(index, status === 'playing');
      return;
    }
    seekToIndex(Math.max(0, index - 1), status === 'playing');
  },
  seek,
  stop: () => {
    userPaused = true;
    try {
      AR.pause();
    } catch {
      /* ignore */
    }
    stopTranslation();
    status = items.length ? 'paused' : 'idle';
    emit();
    saveNow();
  },
  clear: () => {
    opToken++;
    buildId++;
    try {
      AR.pause();
    } catch {
      /* ignore */
    }
    stopTranslation();
    streamReady = false;
    streamKey = '';
    timeline = [];
    inflight = null;
    inflightKey = '';
    if (objectUrl) {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        /* ignore */
      }
      objectUrl = null;
    }
    try {
      AR.removeAttribute('src');
      AR.load();
    } catch {
      /* ignore */
    }
    items = [];
    meta = null;
    index = 0;
    status = 'idle';
    phase = 'arabic';
    resumeTime = 0;
    progress = 0;
    hasSaved = false;
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
    emit();
  },
  getState: state,
  subscribe: (cb) => {
    subs.add(cb);
    cb(state());
    return () => subs.delete(cb);
  },
};

export const getQuranAudio = (): QuranAudioApi => api;

/* ---------------------------- audio element events ------------------------ */

AR.addEventListener('loadedmetadata', () => {
  switching = false;
  emit();
});

AR.addEventListener('ended', () => {
  if (!items.length) {
    finish();
    return;
  }
  index = items.length - 1;
  // Translation mode still finishes the last verse's translation first.
  if (trMode !== 'off' && phase === 'arabic') {
    playTranslation(index, items.length);
    return;
  }
  finish();
});

AR.addEventListener('error', () => {
  // There is no per-verse source left to retry: a decode error here would mean
  // the assembled stream is unusable. Log it and stop cleanly instead of
  // pretending to keep the queue alive.
  debugLog('ar:error-handler', { code: AR.error ? AR.error.code : null });
  if (status === 'playing' || status === 'loading') {
    status = 'paused';
    emit();
  }
});

AR.addEventListener('play', () => {
  userPaused = false;
  status = 'playing';
  emit();
});

AR.addEventListener('pause', () => {
  if (switching) return;
  if (status === 'playing' && phase === 'arabic' && !AR.ended) {
    status = 'paused';
    emit();
  }
});

AR.addEventListener('timeupdate', () => {
  if (status === 'playing' && phase === 'arabic') {
    if (trMode !== 'off') onArabicBoundary();
    if (phase === 'arabic') syncIndex();
  }
  emit();
  scheduleSave();
});

TR.addEventListener('ended', () => {
  if (phase === 'translation') resumeArabicFrom(pendingResumeIndex);
});

TR.addEventListener('error', () => {
  if (phase === 'translation') resumeArabicFrom(pendingResumeIndex);
});

/* Do NOT pause on visibilitychange / blur — the element must be free to keep
   playing when the tab is hidden, Chrome is minimised or the phone locks. We
   only persist the exact position when the page goes away. */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) saveNow();
});
window.addEventListener('pagehide', saveNow);

/* ------------------------------ mini-player ------------------------------- */

function paintMini(s: PlayerState): void {
  const el = document.getElementById('hnPlayer');
  if (!el) return;
  const active = hasSaved || items.length > 0;
  if (!active) {
    el.classList.add('hidden');
    return;
  }
  el.classList.remove('hidden');
  const titleEl = el.querySelector<HTMLElement>('[data-hp-title]');
  const subEl = el.querySelector<HTMLElement>('[data-hp-sub]');
  const toggle = el.querySelector<HTMLElement>('[data-hp-toggle]');
  const open = el.querySelector<HTMLAnchorElement>('[data-hp-open]');
  const item = s.current;
  const label = meta?.label || 'Quran';
  if (titleEl) titleEl.textContent = item ? `${label} · ${item.surah}:${item.verse}` : label;
  const statusText =
    s.status === 'loading'
      ? `Preparing… ${Math.round(s.progress * 100)}%`
      : s.status === 'playing'
        ? s.phase === 'translation'
          ? 'Translation'
          : 'Playing'
        : s.status === 'paused'
          ? 'Paused'
          : s.status === 'ended'
            ? 'Playback complete'
            : 'Ready';
  if (subEl) subEl.textContent = `${RECITERS[s.reciter].label} · ${statusText}`;
  if (toggle) {
    toggle.textContent = s.status === 'playing' || s.status === 'loading' ? '⏸' : '▶';
    toggle.setAttribute('aria-label', s.status === 'playing' || s.status === 'loading' ? 'Pause' : 'Play');
  }
  if (open) {
    const href = meta?.href;
    if (href) {
      open.href = href;
      open.classList.remove('hidden');
    } else {
      open.classList.add('hidden');
    }
  }
}

function wireMini(): void {
  const el = document.getElementById('hnPlayer');
  if (!el || el.dataset.wired) return;
  el.dataset.wired = '1';
  el.querySelector<HTMLElement>('[data-hp-toggle]')?.addEventListener('click', () => api.toggle());
  el.querySelector<HTMLElement>('[data-hp-prev]')?.addEventListener('click', () => api.prev());
  el.querySelector<HTMLElement>('[data-hp-next]')?.addEventListener('click', () => api.next());
  el.querySelector<HTMLElement>('[data-hp-close]')?.addEventListener('click', () => api.clear());
  paintMini(state());
}

/* ------------------------ client-side navigation -------------------------- */

/**
 * ClientRouter only runs on Quran routes; anything else must keep a normal
 * full-page load so other pages' scripts and behaviour are never affected.
 * This capture-phase listener marks non-Quran links before Astro's own
 * (bubble-phase) click handler reads them. On pages without ClientRouter the
 * attribute is inert.
 */
function forceReloadOutsideQuran(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const link = target?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!link || link.hasAttribute('data-astro-reload')) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.hasAttribute('download')) return;
    if (link.target && link.target !== '_self') return;
    let url: URL;
    try {
      url = new URL(link.href, location.href);
    } catch {
      return;
    }
    if (url.origin !== location.origin) return;
    if (isQuranRoute(url.pathname)) return;
    link.setAttribute('data-astro-reload', '');
  }, true);

  // Same rule for forms (e.g. the search form on Quran article pages).
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement | null;
    if (!form || form.hasAttribute('data-astro-reload')) return;
    const action = form.getAttribute('action') || location.pathname;
    let url: URL;
    try {
      url = new URL(action, location.href);
    } catch {
      return;
    }
    if (url.origin !== location.origin) return;
    if (isQuranRoute(url.pathname)) return;
    form.setAttribute('data-astro-reload', '');
  }, true);

  // Back/forward (popstate) can't be marked with data-astro-reload. Astro's
  // before-preparation is cancelable and, when cancelled, Astro itself falls
  // back to a full page load — so the session never stays in client-routing
  // mode on a non-Quran page.
  document.addEventListener('astro:before-preparation', (event) => {
    const detail = event as Event & { to?: URL };
    const to = detail.to instanceof URL ? detail.to : null;
    if (!to || to.origin !== location.origin) return;
    if (isQuranRoute(to.pathname)) return;
    event.preventDefault();
  });
}

/** Runs after every swap/page-load to re-attach the player and mini-player. */
function onPageLifecycle(): void {
  ensureMounted();
  wireMini();
  const s = state();
  paintMedia(s);
  paintMini(s);
}

// All subscribers belong to the outgoing page's DOM — drop them before the
// body is swapped so no stale reader callbacks survive navigation.
document.addEventListener('astro:before-swap', () => {
  subs.clear();
});
document.addEventListener('astro:after-swap', onPageLifecycle);
document.addEventListener('astro:page-load', onPageLifecycle);

/* --------------------------------- init ----------------------------------- */

registerMediaHandlers();
startDiagnostics();
forceReloadOutsideQuran();
restore();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onPageLifecycle, { once: true });
} else {
  onPageLifecycle();
}
