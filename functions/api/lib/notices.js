// Shared validation + row shaping for site notices (Al-Mushrif panel).
// Single active notice at a time; one message for all locales.

export const KINDS = new Set(['share', 'donate', 'info']);

export const LIMITS = {
  title: 80,
  message: 600,
  ctaLabel: 40,
  ctaUrl: 500,
};

function clean(s, max) {
  return String(s ?? '').trim().slice(0, max);
}

/** Validate + sanitize publish body. Returns { ok, notice } or { ok:false, error }. */
export function validateNotice(body) {
  const kind = clean(body?.kind, 16).toLowerCase();
  const title = clean(body?.title, LIMITS.title + 20);
  const message = clean(body?.message, LIMITS.message + 100);
  const cta_label = clean(body?.cta_label ?? body?.ctaLabel, LIMITS.ctaLabel + 10);
  const cta_url = clean(body?.cta_url ?? body?.ctaUrl, LIMITS.ctaUrl + 50);

  if (!KINDS.has(kind)) return { ok: false, error: 'invalid_kind' };
  if (title.length < 3 || title.length > LIMITS.title) return { ok: false, error: 'invalid_title' };
  if (message.length < 10 || message.length > LIMITS.message) return { ok: false, error: 'invalid_message' };
  if (cta_label.length > LIMITS.ctaLabel) return { ok: false, error: 'invalid_cta_label' };
  if (cta_url.length > LIMITS.ctaUrl) return { ok: false, error: 'invalid_cta_url' };
  if (cta_label && !cta_url) return { ok: false, error: 'cta_url_required' };
  if (cta_url && !/^((https?:\/\/|upi:\/\/)|\/[^\/\s])/i.test(cta_url)) return { ok: false, error: 'invalid_cta_url' };
  if (/^(javascript|data|vbscript|file):/i.test(cta_url)) return { ok: false, error: 'invalid_cta_url' };

  return { ok: true, notice: { kind, title, message, cta_label, cta_url } };
}

export function shapeNotice(row) {
  if (!row) return null;
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    message: row.message,
    cta_label: row.cta_label || '',
    cta_url: row.cta_url || '',
    updated_at: row.updated_at || 0,
  };
}
