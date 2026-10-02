import { nonDefaultLocales } from '../../i18n/utils';
import { buildSearchIndex, toCorePayload } from '../../lib/search';

export async function getStaticPaths() {
  return nonDefaultLocales.map(locale => ({ params: { locale } }));
}

export async function GET({ params }: any) {
  const { locale } = params;
  const items = await buildSearchIndex(locale);
  return new Response(JSON.stringify(toCorePayload(items, locale)), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}
