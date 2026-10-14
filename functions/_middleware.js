// Canonical-host redirect: www + legacy pages.dev → apex (hikmahnoor.in).
// Preview deployments (*.hikmah-noor.pages.dev hashes) pass through untouched.
//
// NOTE: `_redirects` rules do NOT run for requests served by Pages Functions
// (see Cloudflare docs), and this middleware wraps every request — so the
// `/en` → `/` locale-prefix strip lives here, not only in `public/_redirects`.
// English has no URL prefix (see src/i18n/utils.ts); old indexed `/en/...`
// URLs 301 to the canonical path. No content or structure change.
const APEX = 'https://hikmahnoor.in';
const LEGACY_HOSTS = new Set(['www.hikmahnoor.in', 'hikmah-noor.pages.dev']);

// Dead slugs (indexed 404s in Search Console) -> live pages, all locales.
const MOVED = new Map([
  ['/kalimas/pehla-kalima/', '/kalimas/first-kalimah-tayyibah/'],
  ['/waqiat/noahs-ark-build-material-unknown/', '/waqiat/nuh-ark-flood/'],
  ['/duas/how-to-perform-wudu/', '/learn/salah/wudu-ablution/'],
]);
for (const l of ['hi', 'ur', 'ar']) for (const [f, t] of [...MOVED]) MOVED.set('/' + l + f, '/' + l + t);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (LEGACY_HOSTS.has(url.hostname)) {
    return Response.redirect(APEX + url.pathname + url.search, 301);
  }
  if (url.pathname === '/en' || url.pathname === '/en/') {
    return Response.redirect(APEX + '/' + url.search, 301);
  }
  const moved = MOVED.get(url.pathname);
  if (moved) {
    return Response.redirect(APEX + moved + url.search, 301);
  }
  if (url.pathname.startsWith('/en/')) {
    return Response.redirect(APEX + url.pathname.slice(3) + url.search, 301);
  }
  return context.next();
}
