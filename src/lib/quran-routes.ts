import { nonDefaultLocales } from '../i18n/utils';

/**
 * Quran-route detection, shared by BaseLayout (server-side) and the client
 * audio module so client-side navigation is enabled for exactly the same
 * routes on both sides.
 *
 * Only the Quran reading experience (/quran and /surahs, in every language)
 * opts into Astro's ClientRouter. Every other route keeps full page loads, so
 * no other page's scripts or behaviour are affected.
 */
const localePrefix = new RegExp(`^/(${nonDefaultLocales.join('|')})(?=/|$)`);

export function pathnameWithoutLocale(pathname: string): string {
  const stripped = pathname.replace(localePrefix, '') || '/';
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

export function isQuranRoute(pathname: string): boolean {
  const path = pathnameWithoutLocale(pathname).replace(/\/+$/, '') || '/';
  return path === '/quran' || path.startsWith('/quran/') || path === '/surahs' || path.startsWith('/surahs/');
}
