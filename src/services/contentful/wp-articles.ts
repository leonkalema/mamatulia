import { fetchEntry, fetchEntries } from "./base";
import type { ApiResponse, PaginatedResponse, QueryParams } from "@/types/api";
import type { WpArticle } from "@/types/contentful";
import { CONTENTFUL, CACHE } from "@/constants";

export async function getWpArticle(
  slug: string,
  preview = false
): Promise<ApiResponse<WpArticle>> {
  return fetchEntry<WpArticle>(CONTENTFUL.CONTENT_TYPES.WP_ARTICLE, slug, preview);
}

export async function getWpArticles(
  params: QueryParams = {},
  preview = false
): Promise<ApiResponse<PaginatedResponse<WpArticle>>> {
  return fetchEntries<WpArticle>(
    CONTENTFUL.CONTENT_TYPES.WP_ARTICLE,
    { ...params, order: params.order || "-fields.date" },
    preview
  );
}

export const wpArticleRevalidate: number = CACHE.REVALIDATE_SECONDS;
