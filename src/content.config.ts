import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    locale: z.enum(['en', 'hi', 'ur', 'ar']),
    category: z.enum(['surahs', 'duas', 'kalimas', 'meanings', 'waqiat', 'prophets', 'sahaba', 'women', 'quran']),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Hikmah Noor Editorial'),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    keywords: z.string().optional(),
    /* Canonical override (root-relative path, no locale prefix — the
     * layout adds the locale). Used when an article duplicates a
     * data-driven detail page (e.g. the 6 kalima articles, which
     * canonicalise to their KalimaDetail pages). */
    canonical: z.string().optional(),
    arabic: z.string().optional(),
    transliteration: z.string().optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});

export const collections = { articles };
