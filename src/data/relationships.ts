/* Hikmah Noor — Relationship System (core).
 * Type-safe, language-independent knowledge-graph foundation.
 *
 * Design:
 * - Relationships connect entity IDs (type + slug), NEVER localized URLs.
 *   Localized URL resolution happens at render time via resolveRelationshipUrl.
 * - Same-type "more" navigation stays in page components; this system
 *   handles CROSS-TYPE relationships only.
 * - Relationship data lives in `relations.ts` (explicit + derived edges).
 *   Page components consume it via getRelatedEntities() and render with
 *   the RelatedContent component. No route-specific conditions in pages.
 */

export type ContentType =
  | 'dua'
  | 'waqiah'
  | 'prophet'
  | 'guide'
  | 'seerah'
  | 'sahaba'
  | 'hadees'
  | 'meaning'
  | 'history'
  | 'kalima'
  | 'surah'
  | 'tool'
  | 'quiz'
  | 'article'
  | 'women';

export type RelationshipKind =
  | 'related-duas'
  | 'related-quran'
  | 'related-hadith'
  | 'related-prophets'
  | 'related-waqiat'
  | 'related-seerah'
  | 'related-guides'
  | 'related-tools'
  | 'related-meanings'
  | 'related-history'
  | 'related-sahaba'
  | 'related-kalimas'
  | 'related-quizzes'
  | 'related-women'
  | 'related-articles';

/** A single directed edge: source entity -> target entity. */
export interface Relationship {
  /** Target content type */
  type: ContentType;
  /** Target entity slug (e.g. 'morning-remembrance', 'yusuf-well-to-throne') */
  slug: string;
  /** Grouping discriminator for display (derived from `type`; see kindForType) */
  kind: RelationshipKind;
  /** Target category for types that have categories (dua, guide, tool).
   *  Enriched from the source of truth at load time. */
  category?: string;
  /** Target display title (English base; localized at render time).
   *  Enriched from the source of truth at load time. */
  title?: string;
  /** Why this relationship exists (debugging/reporting; not rendered).
   *  Must cite existing repository metadata, never invented claims. */
  reason?: string;
}

/** Minimal declaration form used in relations.ts (kind/title enriched). */
export interface RelationshipDecl {
  type: ContentType;
  slug: string;
  reason?: string;
}

export interface EntityRelationships {
  /** Source entity slug */
  slug: string;
  /** Source content type */
  type: ContentType;
  /** Optional: category for types that have categories */
  category?: string;
  /** All outgoing relationships */
  relationships: Relationship[];
}

/** Registry of all entity relationships (populated by relations.ts). */
export const ENTITY_RELATIONSHIPS: EntityRelationships[] = [];

/** kindForType: every target type maps to exactly one display group. */
export function kindForType(type: ContentType): RelationshipKind {
  switch (type) {
    case 'dua': return 'related-duas';
    case 'surah': return 'related-quran';
    case 'hadees': return 'related-hadith';
    case 'prophet': return 'related-prophets';
    case 'waqiah': return 'related-waqiat';
    case 'seerah': return 'related-seerah';
    case 'guide': return 'related-guides';
    case 'tool': return 'related-tools';
    case 'meaning': return 'related-meanings';
    case 'history': return 'related-history';
    case 'sahaba': return 'related-sahaba';
    case 'kalima': return 'related-kalimas';
    case 'quiz': return 'related-quizzes';
    case 'women': return 'related-women';
    case 'article': return 'related-articles';
    default: return 'related-articles';
  }
}

/* ------------------------------------------------------------------ */
/* Entity registry (existence index for validation + safe resolution)  */
/* ------------------------------------------------------------------ */

export interface EntityRegistryEntry {
  type: ContentType;
  slug: string;
  category?: string;
}

const entityRegistry = new Map<string, EntityRegistryEntry>();

/** Build registry key. Exported for the validation script's parity checks. */
export function registryKey(type: ContentType, slug: string, category?: string): string {
  return `${type}:${category ? category + ':' : ''}${slug}`;
}

/** Register an entity for validation. Called centrally by relations.ts. */
export function registerEntity(type: ContentType, slug: string, category?: string): void {
  entityRegistry.set(registryKey(type, slug, category), { type, slug, category });
}

/** Check if a (type, slug) pair exists (category-agnostic for targets). */
export function entityExists(type: ContentType, slug: string): boolean {
  const prefix = `${type}:`;
  for (const key of entityRegistry.keys()) {
    if (key === `${type}:${slug}` || key.startsWith(`${prefix}`) && key.endsWith(`:${slug}`)) return true;
  }
  return entityRegistry.has(`${type}:${slug}`);
}

/** Count registered entities (for reports). */
export function registeredEntityCount(): number {
  return entityRegistry.size;
}

/* ------------------------------------------------------------------ */
/* Lookup + URL resolution                                            */
/* ------------------------------------------------------------------ */

/** Lookup OUTGOING relationships by entity slug and type. */
export function getRelationships(type: ContentType, slug: string, category?: string): Relationship[] {
  const entry = ENTITY_RELATIONSHIPS.find((e) => e.slug === slug && e.type === type && (e.category ?? undefined) === (category ?? undefined));
  return entry?.relationships ?? [];
}

/** Lookup INCOMING relationships (entities that link TO this entity). */
export function getIncomingRelationships(type: ContentType, slug: string): Array<Relationship & { from: { type: ContentType; slug: string; category?: string } }> {
  const out: Array<Relationship & { from: { type: ContentType; slug: string; category?: string } }> = [];
  for (const e of ENTITY_RELATIONSHIPS) {
    for (const rel of e.relationships) {
      if (rel.type === type && rel.slug === slug) {
        out.push({ ...rel, from: { type: e.type, slug: e.slug, category: e.category } });
      }
    }
  }
  return out;
}

/** Resolve a relationship to a localized URL using existing route helpers. */
export function resolveRelationshipUrl(locale: string, rel: Relationship): string {
  const base = locale === 'en' ? '' : `/${locale}`;

  switch (rel.type) {
    case 'dua':
      return `${base}/duas/${rel.category ?? 'morning-evening'}/${rel.slug}/`;
    case 'waqiah':
      return `${base}/waqiat/${rel.slug}/`;
    case 'prophet':
      return `${base}/prophets/${rel.slug}/`;
    case 'guide':
      return `${base}/learn/${rel.category ?? 'salah'}/${rel.slug}/`;
    case 'seerah':
      return `${base}/seerat/${rel.slug}/`;
    case 'sahaba':
      return `${base}/sahaba/${rel.slug}/`;
    case 'hadees':
      return `${base}/hadees/${rel.slug}/`;
    case 'meaning':
      return `${base}/meanings/${rel.slug}/`;
    case 'history':
      return `${base}/history/${rel.slug}/`;
    case 'kalima':
      return `${base}/kalimas/${rel.slug}/`;
    case 'surah':
      return `${base}/surahs/${rel.slug}/`;
    case 'tool':
      return `${base}/tools/${rel.category ?? 'zakat'}/${rel.slug}/`;
    case 'quiz':
      return `${base}/quiz/${rel.slug}/`;
    case 'article':
      return `${base}/articles/${rel.category ?? 'general'}/${rel.slug}/`;
    case 'women':
      return `${base}/women/${rel.slug}/`;
    default:
      return `${base}/`;
  }
}

/** Resolve multiple relationships to localized URLs. */
export function resolveRelationships(locale: string, rels: Relationship[]): Array<Relationship & { url: string }> {
  return rels.map((rel) => ({ ...rel, url: resolveRelationshipUrl(locale, rel) }));
}

/** Relationship kind to English display label (fallback; UI prefers i18n relGroups). */
export const RELATIONSHIP_KIND_LABELS: Record<RelationshipKind, string> = {
  'related-duas': 'Related Duas',
  'related-quran': 'Quran',
  'related-hadith': 'Related Hadith',
  'related-prophets': 'Related Prophets',
  'related-waqiat': 'Prophet Stories',
  'related-seerah': 'Seerah Chapters',
  'related-guides': 'Related Guides',
  'related-tools': 'Related Tools',
  'related-meanings': 'Related Concepts',
  'related-history': 'Historical Events',
  'related-sahaba': 'Companions',
  'related-kalimas': 'Kalimas',
  'related-quizzes': 'Quizzes',
  'related-women': 'Noble Women',
  'related-articles': 'Articles',
};

/** Hub URL per relationship kind (for "view all" links). */
export function hubUrlForKind(kind: RelationshipKind): string {
  switch (kind) {
    case 'related-duas': return '/duas/';
    case 'related-quran': return '/surahs/';
    case 'related-hadith': return '/hadees/';
    case 'related-prophets': return '/prophets/';
    case 'related-waqiat': return '/waqiat/';
    case 'related-seerah': return '/seerat/';
    case 'related-guides': return '/learn/';
    case 'related-tools': return '/tools/';
    case 'related-meanings': return '/meanings/';
    case 'related-history': return '/history/';
    case 'related-sahaba': return '/sahaba/';
    case 'related-kalimas': return '/kalimas/';
    case 'related-quizzes': return '/quiz/';
    case 'related-women': return '/women/';
    case 'related-articles': return '/articles/';
    default: return '/';
  }
}

/** Group relationships by kind for organized display. */
export function groupRelationshipsByKind(rels: Relationship[]): Map<RelationshipKind, Relationship[]> {
  const groups = new Map<RelationshipKind, Relationship[]>();
  for (const rel of rels) {
    const kind = rel.kind;
    if (!groups.has(kind)) groups.set(kind, []);
    groups.get(kind)!.push(rel);
  }
  return groups;
}

/** Get relationships grouped by kind with resolved URLs for a locale. */
export function getRelatedContent(locale: string, type: ContentType, slug: string, category?: string): Map<RelationshipKind, Array<Relationship & { url: string }>> {
  const rels = getRelationships(type, slug, category);
  const resolved = resolveRelationships(locale, rels);
  const groups = new Map<RelationshipKind, Array<Relationship & { url: string }>>();
  for (const rel of resolved) {
    if (!groups.has(rel.kind)) groups.set(rel.kind, []);
    groups.get(rel.kind)!.push(rel);
  }
  return groups;
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

/** Validation result for a single relationship. */
export interface ValidationIssue {
  severity: 'error' | 'warning';
  source: { type: ContentType; slug: string; category?: string };
  target: { type: ContentType; slug: string; category?: string };
  code: string;
  message: string;
}

/** Validate all registered relationships (existence, self-refs, dupes, types). */
export function validateRelationships(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const validTypes: ContentType[] = [
    'dua', 'waqiah', 'prophet', 'guide', 'seerah', 'sahaba', 'hadees',
    'meaning', 'history', 'kalima', 'surah', 'tool', 'quiz', 'article', 'women',
  ];
  const requiresCategory: ContentType[] = ['dua', 'guide', 'tool', 'article'];

  for (const entity of ENTITY_RELATIONSHIPS) {
    const sourceKey = registryKey(entity.type, entity.slug, entity.category);

    if (!entityRegistry.has(sourceKey)) {
      issues.push({
        severity: 'error',
        source: { type: entity.type, slug: entity.slug, category: entity.category },
        target: { type: entity.type, slug: entity.slug, category: entity.category },
        code: 'SOURCE_NOT_FOUND',
        message: `Source entity not registered: ${entity.type}:${entity.category ? entity.category + ':' : ''}${entity.slug}`,
      });
    }

    const seenTargets = new Set<string>();

    for (const rel of entity.relationships) {
      const targetKey = `${rel.type}:${rel.slug}`;
      const src = { type: entity.type, slug: entity.slug, category: entity.category };
      const tgt = { type: rel.type, slug: rel.slug, category: rel.category };

      if (entity.type === rel.type && entity.slug === rel.slug) {
        issues.push({
          severity: 'error', source: src, target: tgt, code: 'SELF_REFERENCE',
          message: `Self-referencing relationship: ${entity.type}:${entity.slug} -> ${rel.type}:${rel.slug}`,
        });
      }

      if (seenTargets.has(targetKey)) {
        issues.push({
          severity: 'warning', source: src, target: tgt, code: 'DUPLICATE_RELATIONSHIP',
          message: `Duplicate relationship: ${entity.type}:${entity.slug} -> ${rel.type}:${rel.slug}`,
        });
      }
      seenTargets.add(targetKey);

      if (!entityExists(rel.type, rel.slug)) {
        issues.push({
          severity: 'error', source: src, target: tgt, code: 'TARGET_NOT_FOUND',
          message: `Target entity not found: ${rel.type}:${rel.slug} (referenced from ${entity.type}:${entity.slug})`,
        });
      }

      if (!validTypes.includes(rel.type)) {
        issues.push({
          severity: 'error', source: src, target: tgt, code: 'INVALID_TYPE',
          message: `Invalid relationship type: ${rel.type} (from ${entity.type}:${entity.slug})`,
        });
      }

      if (requiresCategory.includes(rel.type) && !rel.category) {
        issues.push({
          severity: 'warning', source: src, target: tgt, code: 'MISSING_CATEGORY',
          message: `Relationship to ${rel.type} missing category (from ${entity.type}:${entity.slug} to ${rel.slug})`,
        });
      }

      if (!rel.title) {
        issues.push({
          severity: 'warning', source: src, target: tgt, code: 'MISSING_TITLE',
          message: `Relationship missing enriched title (from ${entity.type}:${entity.slug} to ${rel.type}:${rel.slug})`,
        });
      }
    }
  }

  return issues;
}

/** Print validation report to console (used during build; warns only). */
export function printValidationReport(): void {
  const issues = validateRelationships();
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  if (issues.length === 0) {
    console.log('[relationships] OK: all edges resolve to registered entities');
    return;
  }

  console.log(`[relationships] ${errors.length} error(s), ${warnings.length} warning(s)`);
  for (const issue of errors) console.error(`  [ERROR] ${issue.code}: ${issue.message}`);
  for (const issue of warnings) console.warn(`  [WARN] ${issue.code}: ${issue.message}`);
}

/** Helper to create a relationship entry. */
export function createRelationshipEntry(
  type: ContentType,
  slug: string,
  relationships: Relationship[],
  category?: string,
): EntityRelationships {
  return { type, slug, category, relationships };
}
