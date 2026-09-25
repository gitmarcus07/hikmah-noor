// Canonical-host redirect: www + legacy pages.dev → apex (hikmahnoor.in).
// Preview deployments (*.hikmah-noor.pages.dev hashes) pass through untouched.
const APEX = 'https://hikmahnoor.in';
const LEGACY_HOSTS = new Set(['www.hikmahnoor.in', 'hikmah-noor.pages.dev']);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (LEGACY_HOSTS.has(url.hostname)) {
    return Response.redirect(APEX + url.pathname + url.search, 301);
  }
  return context.next();
}
