import type { MamatuliaPartner } from "@/types/contentful";
import type { ApiResponse } from "@/types/api";
import { CONTENTFUL, CACHE } from "@/constants";
import { getClient } from "@/lib/contentful/client";

export async function getMamatuliaPartners(
  preview = false
): Promise<ApiResponse<readonly MamatuliaPartner[]>> {
  try {
    const client = getClient(preview);
    const response = await client.getEntries({
      content_type: CONTENTFUL.CONTENT_TYPES.PARTNER,
      include: CONTENTFUL.INCLUDE_DEPTH,
      order: ["fields.displayOrder"],
      limit: 50,
    });
    const items = response.items
      .map((item) => item.fields as MamatuliaPartner)
      .filter((p) => p.isActive !== false);
    return { data: items, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: { code: "FETCH_ERROR", message } };
  }
}

export const partnerRevalidate = CACHE.REVALIDATE_SECONDS;
