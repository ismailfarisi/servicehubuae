import type {
  CategorySuggestion,
  ServiceSuggestion,
  SuggestResult,
} from "./service-search.interface.ts";

export const SUGGEST_MAX_LIMIT = 10;
const CATEGORY_LIMIT = 5;

export interface SuggestDeps {
  suggestServices: (query: string, limit: number) => Promise<ServiceSuggestion[]>;
  findCategories: (query: string, limit: number) => Promise<CategorySuggestion[]>;
}

/** Escape LIKE wildcards so "50%" or "a_b" match literally. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Category names that start with the query, or contain a word starting with
 * it ("clean" -> "Home Cleaning"). Active, non-deleted categories only.
 */
export async function findCategoriesByName(
  query: string,
  limit: number,
): Promise<CategorySuggestion[]> {
  const { AppDataSource } = await import("@servicehubuae/database");
  const q = escapeLike(query.toLowerCase());
  return AppDataSource.query(
    `SELECT id, name, slug FROM categories
      WHERE deleted_at IS NULL AND is_active = true
        AND (lower(name) LIKE $1 OR lower(name) LIKE $2)
      ORDER BY (lower(name) LIKE $1) DESC, depth ASC, sort_order ASC, name ASC
      LIMIT $3`,
    [`${q}%`, `% ${q}%`, limit],
  );
}

/**
 * Header search box suggestions: matching services from the Typesense index
 * plus matching categories from Postgres. A Typesense outage degrades to
 * category-only suggestions instead of failing the request.
 */
export class ServiceSuggestService {
  constructor(private readonly deps: SuggestDeps) {}

  async suggest(rawQuery: string, rawLimit?: number): Promise<SuggestResult> {
    const query = rawQuery.trim();
    if (!query) return { services: [], categories: [] };
    const limit = Math.min(Math.max(rawLimit ?? 5, 1), SUGGEST_MAX_LIMIT);

    const [services, categories] = await Promise.all([
      this.deps.suggestServices(query, limit).catch((err: Error) => {
        console.error("[service-suggest] typesense suggest failed:", err.message);
        return [] as ServiceSuggestion[];
      }),
      this.deps.findCategories(query, Math.min(limit, CATEGORY_LIMIT)),
    ]);

    return { services, categories };
  }
}
