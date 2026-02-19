import type { HomepageHero } from "@/types/contentful";
import type { ApiResponse } from "@/types/api";
import { CONTENTFUL, CACHE } from "@/constants";
import { getClient } from "@/lib/contentful/client";

export async function getHomepageHero(
  preview = false
): Promise<ApiResponse<HomepageHero>> {
  try {
    const client = getClient(preview);
    const response = await client.getEntries({
      content_type: CONTENTFUL.CONTENT_TYPES.HOMEPAGE_HERO,
      include: CONTENTFUL.INCLUDE_DEPTH,
      limit: 1,
    });
    if (response.items.length === 0) {
      return { data: null, error: { code: "NOT_FOUND", message: "Homepage hero not found" } };
    }
    return { data: response.items[0].fields as HomepageHero, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: { code: "FETCH_ERROR", message } };
  }
}

export const heroRevalidate = CACHE.REVALIDATE_SECONDS;
