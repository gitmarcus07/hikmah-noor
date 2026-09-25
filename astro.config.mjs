// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Hikmah Noor - Islamic knowledge site (en, hi, ur, ar)
// Manual i18n routing: English at `/` (root pages), hi/ur/ar under `/[locale]/`.
// Astro's automatic i18n is disabled to avoid double-prefixing (/hi/hi/...) and
// route collisions between root English files and [locale] files.
export default defineConfig({
  site: 'https://hikmahnoor.in',
  output: 'static',
  i18n: {
    locales: ['en', 'hi', 'ur', 'ar'],
    defaultLocale: 'en',
    routing: 'manual',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx(),
    sitemap({
      // Keep noindex redirect stubs, login-gated habit pages,
      // account/app-shell pages, and site-search pages out.
      // (gems IS indexed, so it stays in.)
      filter: (page) =>
        !/\/tools\/(zakat-calculator|classical-finance\/ushr-guide)\/$/.test(page) &&
        !/\/tools\/read\/\d/.test(page) &&
        !/\/tools\/my-progress\//.test(page) &&
        !/\/al-mushrif\//.test(page) &&
        !/\/search\//.test(page) &&
        !/\/(profile|leaderboard|user|favourites|bookmarks|search-quran|challenges)\//.test(page),
    }),
  ],
});
