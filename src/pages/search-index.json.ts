import { buildSearchIndex, toCorePayload } from '../lib/search';

export async function GET() {
  const items = await buildSearchIndex('en');
  return new Response(JSON.stringify(toCorePayload(items, 'en')), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}
