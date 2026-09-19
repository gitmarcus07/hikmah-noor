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
  site: 'https://hikmah-noor.pages.dev',
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
      // and account pages (profile, leaderboard, user shells) out.
      filter: (page) =>
        !/\/tools\/(zakat-calculator|classical-finance\/ushr-guide)\/$/.test(page) &&
        !/\/tools\/(read|my-progress)\//.test(page) &&
        !/\/(profile|leaderboard|user)\//.test(page),
    }),
  ],
});
