/* ============================================================================
   Hikmah Noor — global Quran audio player
   ----------------------------------------------------------------------------
   One single-instance HTMLAudioElement for the whole document, shared by the
   Para reader, the Surah reader and the persistent mini-player. It owns:

     • play / pause / resume (never destroys the position)
     • previous / next and seek
     • an automatic queue (verse → next verse), optional translation chaining
     • Media Session metadata + lock-screen / notification / headset controls
     • localStorage persistence of queue, index, position and reciter

   It is intentionally a plain module (no framework) because the site is a
   statically generated MPA. It is imported once from BaseLayout so there is
   never a second competing <audio> element.

   On the Quran routes Astro's ClientRouter performs client-side navigation, so
   this module (and its <audio> elements, which live in a transition:persist
   host) survive Para/Surah navigation while audio keeps playing. On every other
   route navigation stays a normal full page load and the persisted state
   rehydrates the player in a paused "resume" state.
   ========================================================================== */

import { isQuranRoute } from '../lib/quran-routes';

export type ReciterKey = 'alafasy' | 'basit' | 'husary' | 'muaiqly' | 'minshawi';
export type TrMode = 'off' | 'ur' | 'en' | 'hi';
export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'ended';
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
  time: number;
  duration: number;
  reciter: ReciterKey;
  trMode: TrMode;
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

export const RECITER_LABELS: Record<ReciterKey, string> = Object.fromEntries(
  Object.entries(RECITERS).map(([k, v]) => [k, v.label]),
) as Record<ReciterKey, string>;

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
// 'auto' lets the browser keep more of the current verse buffered. This matters
// when Android throttles the network while the screen is locked.
AR.preload = 'auto';
AR.setAttribute('playsinline', '');
AR.setAttribute('aria-hidden', 'true');
AR.id = 'hn-quran-audio';

const TR = document.createElement('audio');
TR.preload = 'none';
TR.setAttribute('aria-hidden', 'true');
TR.id = 'hn-quran-tr-audio';

// Warms the HTTP cache for the NEXT Arabic verse so the verse boundary does not
// have to hit the network (Android can throttle it while the screen is locked).
// One extra element reused for every verse — never hundreds.
const PRE = document.createElement('audio');
PRE.preload = 'auto';
PRE.setAttribute('aria-hidden', 'true');
PRE.id = 'hn-quran-preload';

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
  if (PRE.parentNode !== host) host.appendChild(PRE);
}

if (typeof document !== 'undefined') {
  if (document.body) ensureMounted();
  else document.addEventListener('DOMContentLoaded', ensureMounted, { once: true });
}

/* -------------------------------- state ----------------------------------- */

let items: QueueItem[] = [];
let meta: QueueMeta | null = null;
let index = 0;
let status: PlayerStatus = 'idle';
let phase: PlayerPhase = 'arabic';
let pendingSeek: number | null = null;
let hasSaved = false;
/** True while we swap the audio source, so the transient pause event is ignored. */
let switching = false;
/** True only when the user explicitly paused — blocks auto-recovery from resuming. */
let userPaused = false;
/** Bounded retries for a transient (usually network) audio error on one verse. */
let errorRetries = 0;

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

  // Classify a stop: does the element still think it is playing? Is it paused,
  // ended, or errored? A frozen currentTime while not paused/hidden points at a
  // stall or suspended JS rather than a media-element pause.
  let lastTime = AR.currentTime;
  let lastChange = Date.now();
  window.setInterval(() => {
    if (AR.paused || AR.ended || AR.error) return;
    if (Math.abs(AR.currentTime - lastTime) > 0.01) {
      lastTime = AR.currentTime;
      lastChange = Date.now();
      return;
    }
    if (Date.now() - lastChange < 2500) return;
    debugLog('UNEXPECTED STOP — currentTime frozen while the element believes it is playing', {
      case: document.hidden ? 'B/E' : 'B',
      hint: 'B/E: media stall or suspended page JS. Compare networkState/readyState above.',
    });
  }, 1000);
}

function currentItem(): QueueItem | null {
  return items[index] ?? null;
}

function state(): PlayerState {
  return {
    status,
    phase,
    index,
    total: items.length,
    current: currentItem(),
    meta,
    time: AR.currentTime || 0,
    duration: Number.isFinite(AR.duration) ? AR.duration : 0,
    reciter,
    trMode,
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
    time: AR.currentTime || 0,
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
    pendingSeek = typeof p.time === 'number' && p.time > 0.5 ? p.time : 0;
    const it = currentItem();
    if (it) {
      switching = true;
      AR.src = verseAudioUrl(reciter, it.surah, it.verse);
    }
    hasSaved = true;
    emit();
  } catch {
    /* corrupt state */
  }
}

/* ------------------------------- playback --------------------------------- */

/** Warm the cache for the next Arabic verse (one reused element). */
function prefetchNext(): void {
  if (phase !== 'arabic') return;
  const next = items[index + 1];
  if (!next) return;
  const url = verseAudioUrl(reciter, next.surah, next.verse);
  try {
    if (PRE.getAttribute('src') !== url) {
      PRE.setAttribute('src', url);
      PRE.load();
    }
  } catch {
    /* ignore */
  }
}

/**
 * If the page was suspended while audio was expected to keep playing, the file
 * may have ended (or been paused by the browser) without our JS running. When
 * the page is active again, continue from the right place instead of staying
 * stuck. Never resumes after a deliberate user pause.
 */
function recoverIfNeeded(why: string): void {
  if (!items.length || userPaused) return;
  if (status === 'idle' || status === 'ended') return;
  if (AR.ended) {
    debugLog('recover:advance', { why });
    advance(1);
    return;
  }
  if (AR.paused) {
    debugLog('recover:play', { why });
    AR.play().catch(() => {});
    return;
  }
  if (AR.readyState < 3 && document.visibilityState === 'visible') {
    AR.play().catch(() => {});
  }
}

function playIndex(i: number, autoplay: boolean): void {
  if (!items.length) {
    finish();
    return;
  }
  index = Math.min(Math.max(0, i), items.length - 1);
  phase = 'arabic';
  pendingSeek = 0;
  const it = items[index];
  switching = true;
  AR.src = verseAudioUrl(reciter, it.surah, it.verse);
  status = autoplay ? 'playing' : 'paused';
  if (autoplay) userPaused = false;
  errorRetries = 0;
  hasSaved = true;
  emit();
  prefetchNext();
  if (autoplay) {
    AR.play().then(
      () => {
        status = 'playing';
        emit();
      },
      (err: unknown) => {
        debugLog('play-rejected', {
          reason: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
        });
        status = 'paused';
        emit();
      },
    );
  }
  scheduleSave();
}

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

function playTranslation(): void {
  phase = 'translation';
  emit();
  const it = currentItem();
  if (!it) {
    advance(1);
    return;
  }
  if (trMode === 'hi') {
    const text = textResolver ? textResolver(it.surah, it.verse, 'hi') : '';
    if (!text) {
      advance(1);
      return;
    }
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'hi-IN';
      u.rate = 0.95;
      u.onend = () => {
        if (phase === 'translation') advance(1);
      };
      u.onerror = () => {
        if (phase === 'translation') advance(1);
      };
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch {
      advance(1);
    }
    return;
  }
  TR.src = trAudioUrl(trMode as 'ur' | 'en', it.surah, it.verse);
  TR.play().then(
    () => {
      status = 'playing';
      emit();
    },
    () => {
      if (phase === 'translation') advance(1);
    },
  );
}

function restartCurrent(): void {
  try {
    AR.currentTime = 0;
  } catch {
    pendingSeek = 0;
  }
  emit();
  scheduleSave();
}

function advance(dir: number, autoplay = true): void {
  stopTranslation();
  const nextIndex = index + dir;
  if (nextIndex < 0) {
    restartCurrent();
    return;
  }
  if (nextIndex >= items.length) {
    finish();
    return;
  }
  playIndex(nextIndex, autoplay);
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
  playIndex(startIndex, true);
}

function pause(): void {
  if (status !== 'playing') return;
  userPaused = true;
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
  if (status === 'ended') {
    playIndex(0, true);
    return;
  }
  if (status === 'playing') return;
  if (phase === 'translation') {
    if (trMode === 'hi') {
      try {
        if (typeof speechSynthesis !== 'undefined') speechSynthesis.resume();
      } catch {
        /* ignore */
      }
    } else {
      TR.play().then(
        () => {
          status = 'playing';
          emit();
        },
        () => {
          advance(1);
        },
      );
    }
    status = 'playing';
    emit();
    return;
  }
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
  const clamped = Math.max(0, t);
  if (phase === 'translation' && trMode !== 'hi') {
    try {
      TR.currentTime = clamped;
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    AR.currentTime = clamped;
  } catch {
    pendingSeek = clamped;
  }
  emit();
  scheduleSave();
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
    if (status === 'playing') api.pause();
    else api.play();
  },
  play,
  pause,
  next: () => {
    if (!items.length) return;
    advance(1, status === 'playing');
  },
  prev: () => {
    if (!items.length) return;
    // Standard player behaviour: restart the current item once it is underway.
    if (phase === 'arabic' && AR.currentTime > 3) {
      restartCurrent();
      return;
    }
    if (index > 0) {
      advance(-1, status === 'playing');
      return;
    }
    restartCurrent();
  },
  seek,
  stop: () => {
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
    try {
      AR.pause();
    } catch {
      /* ignore */
    }
    stopTranslation();
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
  if (pendingSeek != null) {
    try {
      AR.currentTime = pendingSeek;
    } catch {
      /* ignore */
    }
    pendingSeek = null;
  }
  emit();
});

AR.addEventListener('ended', () => {
  if (trMode !== 'off' && currentItem()) playTranslation();
  else advance(1);
});

AR.addEventListener('error', () => {
  if (!items.length) return;
  debugLog('ar:error-handler', { code: AR.error ? AR.error.code : null, retries: errorRetries });
  // A transient network failure must NOT consume the whole queue and end
  // playback. Retry the SAME verse a few times before moving on.
  const it = currentItem();
  if (!it) return;
  if (errorRetries < 3 && navigator.onLine !== false) {
    errorRetries += 1;
    window.setTimeout(() => {
      switching = true;
      AR.src = verseAudioUrl(reciter, it.surah, it.verse);
      AR.play().catch(() => {});
    }, 800 * errorRetries);
    return;
  }
  errorRetries = 0;
  if (status === 'paused') return;
  // Give up on this file and move on — a single broken file must not kill the queue.
  advance(1);
});

AR.addEventListener('play', () => {
  errorRetries = 0;
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
  emit();
  scheduleSave();
});

TR.addEventListener('ended', () => {
  if (phase === 'translation') advance(1);
});

TR.addEventListener('error', () => {
  if (phase === 'translation') advance(1);
});

/* Do NOT pause on visibilitychange / blur — the audio element must be free to
   keep playing when the tab is hidden, Chrome is minimised or the phone locks.
   We only persist the position when the page goes away. */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    saveNow();
    return;
  }
  // Back in the foreground: self-heal if the lock/interruption stopped us.
  recoverIfNeeded('visible');
});
window.addEventListener('pagehide', saveNow);
window.addEventListener('pageshow', () => recoverIfNeeded('pageshow'));
document.addEventListener('resume', () => recoverIfNeeded('resume'));
window.addEventListener('online', () => recoverIfNeeded('online'));

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
    s.status === 'playing' ? (s.phase === 'translation' ? 'Translation' : 'Playing') : s.status === 'paused' ? 'Paused' : s.status === 'ended' ? 'Playback complete' : 'Ready';
  if (subEl) subEl.textContent = `${RECITERS[s.reciter].label} · ${statusText}`;
  if (toggle) {
    toggle.textContent = s.status === 'playing' ? '⏸' : '▶';
    toggle.setAttribute('aria-label', s.status === 'playing' ? 'Pause' : 'Play');
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
