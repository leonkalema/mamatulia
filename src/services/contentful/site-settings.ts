import { getClient } from "@/lib/contentful/client";
import type { ApiResponse } from "@/types/api";
import type { SiteSettings } from "@/types/contentful";
import { CONTENTFUL, CACHE } from "@/constants";

export async function getSiteSettings(
  preview = false
): Promise<ApiResponse<SiteSettings>> {
  try {
    const client = getClient(preview);
    const response = await client.getEntries({
      content_type: CONTENTFUL.CONTENT_TYPES.SITE_SETTINGS,
      include: CONTENTFUL.INCLUDE_DEPTH,
      limit: 1,
    });

    if (response.items.length === 0) {
      return {
        data: null,
        error: { code: "NOT_FOUND", message: "Site settings not found" },
      };
    }

    return { data: response.items[0].fields as SiteSettings, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: { code: "FETCH_ERROR", message } };
  }
}

export const siteSettingsRevalidate: number = CACHE.REVALIDATE_SECONDS;
