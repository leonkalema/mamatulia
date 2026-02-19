import { getClient } from "@/lib/contentful/client";
import type { AboutPage } from "@/types/contentful";
import type { ApiResponse } from "@/types/api";
import { CONTENTFUL, CACHE } from "@/constants";

export async function getAboutPage(
  preview = false
): Promise<ApiResponse<AboutPage>> {
  try {
    const client = getClient(preview);
    const entries = await client.getEntries({
      content_type: "aboutPage",
      limit: 1,
      include: CONTENTFUL.INCLUDE_DEPTH,
    });

    if (entries.items.length === 0) {
      return { data: null, error: { code: "NOT_FOUND", message: "About page not found" } };
    }

    return { data: entries.items[0].fields as AboutPage, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: { code: "FETCH_ERROR", message } };
  }
}

export const aboutPageRevalidate = CACHE.REVALIDATE_SECONDS;
