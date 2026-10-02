import { buildSearchIndex, toAyahPayload } from '../lib/search';

export async function GET() {
  const items = await buildSearchIndex('en');
  return new Response(JSON.stringify(toAyahPayload(items, 'en')), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}
