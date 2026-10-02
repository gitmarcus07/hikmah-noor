/* Hikmah Noor — deterministic client search engine (Phase 5).
 * Vanilla JS, zero dependencies: imported by search pages + SearchBox in the
 * browser (bundled by Astro/Vite) AND by Node test/validator scripts.
 * No network, no AI, no scores exposed — tiered deterministic ranking.
 *
 * Index payloads (built at build time, see search.ts):
 *   core: { cats, docs: [title, url, catIdx, desc, tags, flags, docLocale?],
 *           surahs: [num, slug, name, english, verseCount], aliases: {alias: "S:V"} }
 *   ayahs: { docs: [ref, surahNum, ayahNum, title, url] }
 */

/** Lowercase, trim, collapse spaces, drop [-_'’‘], strip tatweel + tashkeel.
 *  Display strings are never altered — this only builds match keys. */
export function normText(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/\u0640/g, '')
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/['’‘`\-_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split normalized text into tokens (latin + arabic + devanagari + digits). */
export function tokenize(s) {
  return normText(s).split(/[^a-z0-9\u0600-\u06ff\u0900-\u097f:]+/).filter((t) => t.length >= 2);
}

const ARTICLE_PREFIXES = ['al', 'ad', 'ar', 'as', 'ash', 'at', 'an', 'el'];
const STOPWORDS = new Set(['for', 'the', 'and', 'of', 'in', 'on', 'a', 'an', 'to', 'with', 'is', 'are', 'al']);

/**
 * Fold a token for transliteration-tolerant matching (applied to BOTH index
 * and query tokens, originals always kept):
 * - strip a leading Arabic article (`al-`, `ar-`, …) when the rest stays long
 * - strip one trailing `t`/`h` (ta-marbuta spellings: seerat/seerah,
 *   surat/surah, ayat/ayah) for tokens longer than 4 chars.
 * `allah` is immune. Display strings are never altered.
 */
export function foldToken(t) {
  if (t.length > 4 && t !== 'allah') {
    for (const p of ARTICLE_PREFIXES) {
      if (t.startsWith(p) && t.length - p.length >= 3) { t = t.slice(p.length); break; }
    }
    if (t.length > 4 && /[th]$/.test(t)) t = t.slice(0, -1);
  }
  return t;
}

/** Expand tokens with folded variants (deduped, order-stable). */
function expandTokens(toks) {
  const out = [];
  const seen = new Set();
  for (const t of toks) {
    for (const v of [t, foldToken(t)]) {
      if (v && !seen.has(v)) { seen.add(v); out.push(v); }
    }
  }
  return out;
}

function normToken(t) {
  return normText(t).replace(/:/g, '');
}

/** Edit distance with early exit (cap). */
export function editDistance(a, b, cap = 2) {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > cap) return cap + 1;
  let prev = new Array(lb + 1);
  for (let j = 0; j <= lb; j++) prev[j] = j;
  for (let i = 1; i <= la; i++) {
    let cur = [i];
    let rowMin = i;
    for (let j = 1; j <= lb; j++) {
      const c = prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      const v = Math.min(c, prev[j] + 1, cur[j - 1] + 1);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > cap) return cap + 1;
    prev = cur;
  }
  return prev[lb];
}

/**
 * Parse a Quran reference from a query.
 * Accepts `2:255`, `2 255`, `2-255`, `2/255`, `baqarah 255`, `quran 2:255`.
 * Returns { surah, ayah, norm } or null. Validates ranges (no false refs).
 */
export function parseRef(query, surahTable) {
  const q = normText(query).replace(/^quran\s+/, '');
  const byName = new Map();
  for (const s of surahTable) {
    const keys = [s.name, s.english, s.slug.replace(/^\d+-/, '').replace(/-/g, ' ')];
    if (s.aliases) for (const a of s.aliases) keys.push(a);
    for (const k of keys) {
      const nk = normText(k).replace(/\s+/g, ' ').trim();
      if (nk && !byName.has(nk)) byName.set(nk, s);
    }
  }
  let m = q.match(/^(\d+)\s*[:/\- ]\s*(\d+)$/);
  if (m) {
    const s = surahTable.find((x) => x.num === +m[1]);
    if (s && +m[2] >= 1 && +m[2] <= s.verseCount) return { surah: s.num, ayah: +m[2], norm: `${s.num}:${+m[2]}` };
    return null;
  }
  m = q.match(/^(.+?)\s+(\d+)$/);
  if (m) {
    const s = byName.get(normText(m[1]).replace(/\s+/g, ' ').trim());
    if (s && +m[2] >= 1 && +m[2] <= s.verseCount) return { surah: s.num, ayah: +m[2], norm: `${s.num}:${+m[2]}` };
  }
  return null;
}

/** Build in-memory structures from payloads. Ayahs payload optional (lazy). */
export function createIndex(core, ayahs) {
  const docs = [];
  const push = (d) => { d.i = docs.length; docs.push(d); return d.i; };
  const tok = new Map(); // token -> array of doc ids
  const addTok = (t, id) => {
    let a = tok.get(t);
    if (!a) { a = []; tok.set(t, a); }
    if (a[a.length - 1] !== id) a.push(id);
  };
  const indexDoc = (d) => {
    const id = push(d);
    d.tokens = new Set();
    d.tt = new Set();
    d.nt = normText(d.t);
    d.nd = normText(d.d || '');
    d.ng = (d.g || []).map(normText);
    d.nc = normText(d.c);
    const feed = (s, titleOnly) => {
      for (const t of tokenize(s)) {
        d.tokens.add(t);
        if (titleOnly) d.tt.add(t);
        addTok(t, id);
        const f = foldToken(t);
        if (f !== t) { d.tokens.add(f); if (titleOnly) d.tt.add(f); addTok(f, id); }
      }
    };
    feed(d.t, true);
    for (const g of d.g || []) feed(g, false);
    if (d.c === 'hadees') feed('hadith', false);
    if (d.ref) { addTok(d.ref, id); d.tokens.add(d.ref); }
  };
  for (const [t, u, c, desc, tags, flags, docLocale] of core.docs) {
    indexDoc({ t, u, c: core.cats[c] || '', d: desc || '', g: tags || [], hub: (flags & 1) === 1, docLocale: docLocale || core.locale });
  }
  const ayahByRef = new Map();
  if (ayahs && ayahs.docs) {
    for (const [ref, s, v, title, url] of ayahs.docs) {
      const id = push({ t: title, u: url, c: 'quran', d: '', g: [], hub: false, ref, docLocale: ayahs.locale, ayah: true });
      docs[id].tokens = new Set();
      docs[id].tt = new Set();
      docs[id].nt = normText(title);
      docs[id].nd = '';
      docs[id].ng = [];
      docs[id].nc = 'quran';
      ayahByRef.set(ref, id);
      addTok(ref, id);
      docs[id].tokens.add(ref);
      for (const t of tokenize(title)) {
        docs[id].tokens.add(t);
        docs[id].tt.add(t);
        addTok(t, id);
        const f = foldToken(t);
        if (f !== t) { docs[id].tokens.add(f); docs[id].tt.add(f); addTok(f, id); }
      }
    }
  }
  const tokensSorted = [...tok.keys()].sort();
  const byLen = new Map();
  for (const t of tokensSorted) {
    const l = t.length;
    if (!byLen.has(l)) byLen.set(l, []);
    byLen.get(l).push(t);
  }
  const surahTable = core.surahs.map((s) => ({ num: s[0], slug: s[1], name: s[2], english: s[3], verseCount: s[4], aliases: s[5] || [] }));
  return { docs, tok, tokensSorted, byLen, surahTable, aliases: core.aliases || {}, salias: core.salias || {}, ayahByRef, locale: core.locale };
}

/** Slug key from URL (`/ramadan/` → `ramadan`, `/x/ar-rahman/` → `ar rahman`). */
export function hubKeyOf(url) {
  const parts = String(url || '')
    .replace(/^\/(hi|ur|ar)(?=\/|$)/, '')
    .replace(/^\/|\/$/g, '')
    .split('/');
  return (parts.pop() || '').replace(/-/g, ' ');
}
function prefixTokens(idx, p, cap = 500) {
  const out = [];
  let lo = 0, hi = idx.tokensSorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (idx.tokensSorted[mid] < p) lo = mid + 1; else hi = mid;
  }
  for (let i = lo; i < idx.tokensSorted.length && out.length < cap; i++) {
    const t = idx.tokensSorted[i];
    if (!t.startsWith(p)) break;
    out.push(t);
  }
  return out;
}

/** Fuzzy token lookup: edit distance ≤1 (len≥4), ≤2 (len≥9). Capped. */
function fuzzyTokens(idx, q, cap = 60) {
  const out = [];
  const c1 = q.length >= 9 ? 2 : 1;
  for (let l = q.length - c1; l <= q.length + c1; l++) {
    const bucket = idx.byLen.get(l);
    if (!bucket) continue;
    for (const t of bucket) {
      if (Math.abs(t.length - q.length) > c1) continue;
      if (editDistance(q, t, c1) <= c1) { out.push(t); if (out.length >= cap) return out; }
    }
  }
  return out;
}

export const GROUP_ORDER = [
  'quran', 'surahs', 'duas', 'hadees', 'learn', 'names', 'prophets',
  'seerat', 'waqiat', 'sahaba', 'women', 'history', 'meanings',
  'kalimas', 'calendar', 'hajj', 'ramadan', 'eid', 'quiz', 'tools',
];

/**
 * Tiered deterministic search. Returns [{ d, tier }] ordered by tier,
 * hub-demotion, then stable doc order. No scores exposed.
 */
export function search(idx, rawQuery, opts = {}) {
  const limit = opts.limit ?? 60;
  const types = opts.types || null;
  const q = normText(rawQuery);
  if (!q) return [];
  const seen = new Set();
  const out = [];
  const accept = (id, tier) => {
    if (seen.has(id)) return;
    const d = idx.docs[id];
    if (types && !types.has(d.c)) return;
    seen.add(id);
    out.push({ d, tier });
  };
  // Hubs lead broad prefix matches; hubs trail specific-match tiers.
  const orderTier = (ids, mode) => {
    if (!mode) return ids;
    const hub = [], main = [];
    for (const id of ids) (idx.docs[id].hub ? hub : main).push(id);
    return mode === 'first' ? [...hub, ...main] : [...main, ...hub];
  };
  const rawToks = tokenize(q).map(normToken).filter(Boolean);
  const effToks = expandTokens(rawToks.filter((t) => !STOPWORDS.has(t)));
  // OR-groups per content token: a doc matches a group via the token
  // itself or its folded variant (`seerah` ≡ `seerat`).
  const contentGroups = rawToks
    .filter((t) => !STOPWORDS.has(t))
    .map((t) => [...new Set([t, foldToken(t)])]);

  // Tier 0: exact Quran ref (parsed) + verified alias exact match.
  const ref = parseRef(q, idx.surahTable);
  if (ref && idx.ayahByRef?.has(ref.norm)) { accept(idx.ayahByRef.get(ref.norm), 0); }
  if (!ref && idx.aliases[q]) {
    const id = idx.ayahByRef?.get(idx.aliases[q]);
    if (id !== undefined) accept(id, 0);
  }
  // Tier 1: exact title + exact URL slug (`ramadan`, `names of allah`, …).
  for (let i = 0; i < idx.docs.length && out.length < limit; i++) {
    if (idx.docs[i].nt === q) accept(i, 1);
  }
  for (let i = 0; i < idx.docs.length && out.length < limit; i++) {
    if (hubKeyOf(idx.docs[i].u) === q) accept(i, 1);
  }
  // Tier 2: title prefix (hubs first) + surah-name affinity.
  if (q.length >= 2) {
    const ids = [];
    for (let i = 0; i < idx.docs.length; i++) {
      if (idx.docs[i].nt.startsWith(q)) ids.push(i);
    }
    for (const id of orderTier(ids, 'first')) { accept(id, 2); if (out.length >= limit) break; }
    if (effToks.length) {
      const hit = new Set();
      for (const t of effToks) {
        if (t.length < 3) continue;
        for (const s of idx.surahTable) {
          const names = [s.name, s.english, ...(s.aliases || [])].map((x) => normText(x));
          if (!names.includes(t)) continue;
          for (let i = 0; i < idx.docs.length; i++) {
            const d = idx.docs[i];
            if (!d.ayah && d.c === 'surahs' && d.u.includes(`/${s.num}-`)) hit.add(i);
          }
        }
      }
      for (const id of orderTier([...hit].sort((a, b) => a - b), 'first')) { accept(id, 2); if (out.length >= limit) break; }
    }
  }
  // Tier 3: all query tokens in title (via posting intersection).
  // Ordered by exact-token hits, then doc order.
  if (contentGroups.length) {
    let ids = null;
    for (const g of contentGroups) {
      const exact = new Set();
      for (const v of g) {
        for (const id of idx.tok.get(v) || []) exact.add(id);
        for (const pt of prefixTokens(idx, v, 400)) {
          for (const id of idx.tok.get(pt) || []) exact.add(id);
        }
      }
      const titleIds = new Set([...exact].filter((id) => {
        const dt = idx.docs[id].tt;
        return g.some((v) => dt.has(v) || [...dt].some((x) => x.startsWith(v)));
      }));
      ids = ids === null ? titleIds : new Set([...ids].filter((x) => titleIds.has(x)));
      if (!ids.size) break;
    }
    const ordered = [...(ids || [])]
      .map((id) => [id, contentGroups.filter((g) => g.some((v) => idx.docs[id].tt.has(v))).length])
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
      .map((e) => e[0]);
    for (const id of orderTier(ordered, null)) { accept(id, 3); if (out.length >= limit) break; }
  }
  // Tier 3b: all content tokens anywhere (title ∪ tags ∪ category).
  if (contentGroups.length) {
    let ids = null;
    for (const g of contentGroups) {
      const any = new Set();
      for (const v of g) {
        for (const id of idx.tok.get(v) || []) any.add(id);
        for (const pt of prefixTokens(idx, v, 400)) {
          for (const id of idx.tok.get(pt) || []) any.add(id);
        }
      }
      ids = ids === null ? any : new Set([...ids].filter((x) => any.has(x)));
      if (!ids.size) break;
    }
    const ordered = [...(ids || [])]
      .map((id) => [id, contentGroups.filter((g) => g.some((v) => idx.docs[id].tokens.has(v))).length])
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
      .map((e) => e[0]);
    for (const id of orderTier(ordered, null)) { accept(id, 3); if (out.length >= limit) break; }
  }
  // Tier 4: ref-text (surah name + number already handled by tokens; surah doc).
  if (ref) {
    for (let i = 0; i < idx.docs.length; i++) {
      const d = idx.docs[i];
      if (!d.ayah && d.c === 'surahs' && d.u.includes(`/${ref.surah}-`)) accept(i, 4);
    }
  } else if (/^\d+$/.test(q)) {
    const s = idx.surahTable.find((x) => x.num === +q);
    if (s) {
      for (let i = 0; i < idx.docs.length; i++) {
        const d = idx.docs[i];
        if (!d.ayah && d.c === 'surahs' && d.u.includes(`/${s.num}-`)) { accept(i, 4); break; }
      }
    }
  }
  // Tier 5: category match — full query exact/prefix, then per-token
  // exact/prefix hits (hadees also matches `hadith`).
  {
    const scored = new Map();
    const catVars = (c) => (c === 'hadees' ? ['hadees', 'hadith'] : [c]);
    for (let i = 0; i < idx.docs.length; i++) {
      const vars = catVars(idx.docs[i].nc);
      let s = -1;
      if (vars.includes(q)) s = 100;
      else if (q.length >= 3 && vars.some((c) => c.startsWith(q))) s = 50;
      else if (effToks.length) {
        let n = 0, p = 0;
        for (const t of effToks) {
          if (vars.includes(t)) n++;
          else if (t.length >= 3 && vars.some((c) => c.startsWith(t))) p++;
        }
        if (n + p > 0) s = n * 10 + p;
      }
      if (s >= 0) scored.set(i, s);
    }
    const ranked = [...scored.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map((e) => e[0]);
    for (const id of orderTier(ranked, 'last')) { accept(id, 5); if (out.length >= limit) break; }
  }
  // Tier 6: exact tag, then tag prefix.
  {
    const ids = [];
    for (let i = 0; i < idx.docs.length; i++) {
      const tags = idx.docs[i].ng;
      if (tags.includes(q)) ids.push(i);
    }
    if (q.length >= 3) {
      for (let i = 0; i < idx.docs.length; i++) {
        const tags = idx.docs[i].ng;
        if (tags.some((t) => t.startsWith(q))) ids.push(i);
      }
    }
    for (const id of orderTier(ids, 'last')) { accept(id, 6); if (out.length >= limit) break; }
  }
  // Tier 6b: per-token exact tag matches, most matches first.
  if (effToks.length > 1) {
    const counts = new Map();
    for (let i = 0; i < idx.docs.length; i++) {
      const tags = new Set(idx.docs[i].ng);
      let n = 0;
      for (const t of effToks) if (tags.has(t)) n++;
      if (n > 0) counts.set(i, n);
    }
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map((e) => e[0]);
    for (const id of orderTier(ranked, 'last')) { accept(id, 6); if (out.length >= limit) break; }
  }
  // Tier 7: description substring (min length guard).
  if (q.length >= 3) {
    const ids = [];
    for (let i = 0; i < idx.docs.length; i++) {
      if (idx.docs[i].nd.includes(q)) ids.push(i);
    }
    for (const id of orderTier(ids, 'last')) { accept(id, 7); if (out.length >= limit) break; }
  }
  // Tier 8: fuzzy token match (indexed, capped).
  if (effToks.length) {
    const cand = new Map();
    for (const t of effToks) {
      if (t.length < 4) continue;
      for (const ft of fuzzyTokens(idx, t)) {
        for (const id of idx.tok.get(ft) || []) cand.set(id, (cand.get(id) || 0) + 1);
      }
    }
    const ranked = [...cand.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map((e) => e[0]);
    for (const id of orderTier(ranked, 'last')) { accept(id, 8); if (out.length >= limit) break; }
  }
  return out.slice(0, limit);
}

/** Top-N suggestions for autocomplete. */
export function suggest(idx, rawQuery, limit = 8) {
  return search(idx, rawQuery, { limit }).map((r) => r.d);
}

/**
 * Whether a query plausibly wants ayah documents (lazy-chunk trigger).
 * True for parsed refs, verified aliases, surah-token + number,
 * or explicit ayah/verse words. Deterministic.
 */
export function ayahNeeded(idx, rawQuery) {
  const q = normText(rawQuery);
  if (!q) return false;
  if (parseRef(q, idx.surahTable)) return true;
  if (idx.aliases[q]) return true;
  const toks = new Set(tokenize(q));
  if (toks.has('ayah') || toks.has('ayat') || toks.has('verse')) return true;
  if (![...toks].some((t) => /^\d+$/.test(t))) return false;
  if (!idx.surahToks) {
    const set = new Set();
    for (const s of idx.surahTable) {
      for (const t of tokenize(`${s.name} ${s.english} ${s.slug}`)) set.add(t);
      for (const a of s.aliases || []) for (const t of tokenize(a)) set.add(t);
    }
    idx.surahToks = set;
  }
  return [...toks].some((t) => idx.surahToks.has(t));
}

/** Escape HTML (titles/descriptions are ours, queries are user input). */
export function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Highlight first case-insensitive match of q (index-safe on raw text). */
export function highlight(text, q) {
  const src = String(text ?? '');
  const nq = String(q ?? '').toLowerCase().trim();
  if (!nq) return escHtml(src.length > 140 ? src.slice(0, 140) + '…' : src);
  const i = src.toLowerCase().indexOf(nq);
  if (i < 0) return escHtml(src.length > 140 ? src.slice(0, 140) + '…' : src);
  return escHtml(src.slice(0, i)) + '<mark>' + escHtml(src.slice(i, i + nq.length)) + '</mark>' + escHtml(src.slice(i + nq.length));
}

/** Group engine results by category following GROUP_ORDER. */
export function groupByCategory(results) {
  const groups = new Map();
  for (const r of results) {
    const c = r.d.c || 'other';
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c).push(r.d);
  }
  const ordered = [];
  for (const c of GROUP_ORDER) {
    if (groups.has(c)) { ordered.push([c, groups.get(c)]); groups.delete(c); }
  }
  for (const [c, docs] of groups) ordered.push([c, docs]);
  return ordered;
}

/**
 * High-confidence correction. Fires when there are no results, or when the
 * best result is fuzzy-only (tier 8): exactly one best single-token fix
 * (edit distance 1, token len ≥ 5). Else null.
 */
export function didYouMean(idx, rawQuery, topTier) {
  const q = normText(rawQuery);
  const toks = tokenize(q);
  if (!toks.length) return null;
  if (search(idx, rawQuery, { limit: 1 }).length && topTier !== 8) return null;
  let best = null;
  for (const t of toks) {
    if (t.length < 5) continue;
    const cands = [];
    const bucket = idx.byLen.get(t.length - 1) || [];
    const same = idx.byLen.get(t.length) || [];
    const plus = idx.byLen.get(t.length + 1) || [];
    for (const c of [...bucket, ...same, ...plus]) {
      if (editDistance(t, c, 1) === 1) cands.push(c);
    }
    cands.sort((a, b) => {
      const da = (idx.tok.get(a) || []).length, db = (idx.tok.get(b) || []).length;
      return db - da || (a < b ? -1 : 1);
    });
    if (cands.length === 1) {
      if (!best) best = { from: t, to: cands[0] };
      else return null;
    } else if (cands.length > 1) {
      const top = (idx.tok.get(cands[0]) || []).length;
      const second = (idx.tok.get(cands[1]) || []).length;
      if (top <= second) return null;
      if (!best) best = { from: t, to: cands[0] };
      else return null;
    }
  }
  if (!best) return null;
  return q.split(/\s+/).map((t) => (t === best.from ? best.to : t)).join(' ');
}
