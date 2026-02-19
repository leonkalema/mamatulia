import { getClient } from "@/lib/contentful/client";
import type { ApiResponse, PaginatedResponse, QueryParams } from "@/types/api";
import { CONTENTFUL, PAGINATION } from "@/constants";

export async function fetchEntry<T>(
  contentType: string,
  slug: string,
  preview = false
): Promise<ApiResponse<T>> {
  try {
    const client = getClient(preview);
    const response = await client.getEntries({
      content_type: contentType,
      "fields.slug": slug,
      include: CONTENTFUL.INCLUDE_DEPTH,
      limit: 1,
    });

    if (response.items.length === 0) {
      return {
        data: null,
        error: { code: "NOT_FOUND", message: `${contentType} not found: ${slug}` },
      };
    }

    return { data: response.items[0].fields as T, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: { code: "FETCH_ERROR", message } };
  }
}

export async function fetchEntries<T>(
  contentType: string,
  params: QueryParams = {},
  preview = false
): Promise<ApiResponse<PaginatedResponse<T>>> {
  try {
    const client = getClient(preview);
    const limit = Math.min(params.limit || PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE);
    const skip = params.skip || 0;

    const response = await client.getEntries({
      content_type: contentType,
      include: (params.include ?? CONTENTFUL.INCLUDE_DEPTH) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
      order: params.order ? [params.order as "sys.createdAt" | "-sys.createdAt"] : undefined,
      limit,
      skip,
    });

    const items = response.items.map((item) => item.fields as T);

    return {
      data: {
        items,
        total: response.total,
        skip,
        limit,
        hasMore: skip + items.length < response.total,
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: { code: "FETCH_ERROR", message } };
  }
}

export async function fetchEntryById<T>(
  contentType: string,
  id: string,
  preview = false
): Promise<ApiResponse<T>> {
  try {
    const client = getClient(preview);
    const entry = await client.getEntry(id, {
      include: CONTENTFUL.INCLUDE_DEPTH,
    });

    return { data: entry.fields as T, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: { code: "FETCH_ERROR", message } };
  }
}
