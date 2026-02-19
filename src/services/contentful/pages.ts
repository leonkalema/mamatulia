import { fetchEntry, fetchEntries } from "./base";
import type { Page } from "@/types/contentful";
import type { ApiResponse, PaginatedResponse, QueryParams } from "@/types/api";
import { CONTENTFUL, CACHE } from "@/constants";

export async function getPage(
  slug: string,
  preview = false
): Promise<ApiResponse<Page>> {
  return fetchEntry<Page>(CONTENTFUL.CONTENT_TYPES.PAGE, slug, preview);
}

export async function getPages(
  params: QueryParams = {},
  preview = false
): Promise<ApiResponse<PaginatedResponse<Page>>> {
  return fetchEntries<Page>(CONTENTFUL.CONTENT_TYPES.PAGE, params, preview);
}

export async function getPageSlugs(): Promise<string[]> {
  const response = await getPages({ limit: 100 });
  if (response.error) return [];
  return response.data.items.map((page) => page.slug);
}

export const pageRevalidate = CACHE.REVALIDATE_SECONDS;
