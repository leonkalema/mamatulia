import type { MamatuliaProgram, ProgramCategory } from "@/types/contentful";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import { CONTENTFUL, CACHE } from "@/constants";
import { getClient } from "@/lib/contentful/client";

export async function getMamatuliaPrograms(
  preview = false
): Promise<ApiResponse<PaginatedResponse<MamatuliaProgram>>> {
  try {
    const client = getClient(preview);
    const response = await client.getEntries({
      content_type: CONTENTFUL.CONTENT_TYPES.PROGRAM,
      include: CONTENTFUL.INCLUDE_DEPTH,
      order: ["fields.displayOrder"],
      limit: 50,
    });

    const items = response.items
      .map((item) => item.fields as MamatuliaProgram)
      .filter((p) => p.isActive !== false);

    return {
      data: {
        items,
        total: items.length,
        skip: 0,
        limit: 50,
        hasMore: false,
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: { code: "FETCH_ERROR", message } };
  }
}

export async function getMamtuliaProgramsByCategory(
  category: ProgramCategory,
  preview = false
): Promise<ApiResponse<readonly MamatuliaProgram[]>> {
  try {
    const client = getClient(preview);
    const response = await client.getEntries({
      content_type: CONTENTFUL.CONTENT_TYPES.PROGRAM,
      "fields.category": category,
      include: CONTENTFUL.INCLUDE_DEPTH,
      order: ["fields.displayOrder"],
      limit: 50,
    });

    const items = response.items
      .map((item) => item.fields as MamatuliaProgram)
      .filter((p) => p.isActive !== false);

    return { data: items, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: { code: "FETCH_ERROR", message } };
  }
}

export async function getMamatuliaProgram(
  slug: string,
  preview = false
): Promise<ApiResponse<MamatuliaProgram>> {
  try {
    const client = getClient(preview);
    const response = await client.getEntries({
      content_type: CONTENTFUL.CONTENT_TYPES.PROGRAM,
      "fields.slug": slug,
      include: CONTENTFUL.INCLUDE_DEPTH,
      limit: 1,
    });
    if (response.items.length === 0) {
      return { data: null, error: { code: "NOT_FOUND", message: `Program "${slug}" not found` } };
    }
    return { data: response.items[0].fields as MamatuliaProgram, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: { code: "FETCH_ERROR", message } };
  }
}

export async function getMamtuliaProgramSlugs(): Promise<string[]> {
  const response = await getMamatuliaPrograms();
  if (response.error || !response.data) return [];
  return response.data.items.map((p) => p.slug);
}

export const programRevalidate = CACHE.REVALIDATE_SECONDS;
