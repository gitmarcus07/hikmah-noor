import { defineMiddleware } from 'astro:middleware';

// Manual i18n routing is used (see astro.config.mjs).
// English lives at `/`, hi/ur/ar live under `/[locale]/` via explicit
// `src/pages/` files. No Astro i18n middleware logic is needed —
// this stub exists because `i18n.routing: 'manual'` requires a middleware file.
export const onRequest = defineMiddleware(async (_context, next) => {
  return next();
});
