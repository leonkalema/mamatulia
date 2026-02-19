import { fetchEntry, fetchEntries } from "./base";
import type { Post, Category } from "@/types/contentful";
import type { ApiResponse, PaginatedResponse, QueryParams } from "@/types/api";
import { CONTENTFUL, CACHE } from "@/constants";

export async function getPost(
  slug: string,
  preview = false
): Promise<ApiResponse<Post>> {
  return fetchEntry<Post>(CONTENTFUL.CONTENT_TYPES.POST, slug, preview);
}

export async function getPosts(
  params: QueryParams = {},
  preview = false
): Promise<ApiResponse<PaginatedResponse<Post>>> {
  return fetchEntries<Post>(
    CONTENTFUL.CONTENT_TYPES.POST,
    { ...params, order: params.order || "-fields.publishedDate" },
    preview
  );
}

export async function getPostsByCategory(
  categorySlug: string,
  params: QueryParams = {},
  preview = false
): Promise<ApiResponse<PaginatedResponse<Post>>> {
  const categoryResponse = await fetchEntry<Category>(
    CONTENTFUL.CONTENT_TYPES.CATEGORY,
    categorySlug,
    preview
  );

  if (categoryResponse.error) {
    return { data: null, error: categoryResponse.error };
  }

  return fetchEntries<Post>(
    CONTENTFUL.CONTENT_TYPES.POST,
    { ...params, order: "-fields.publishedDate" },
    preview
  );
}

export async function getPostSlugs(): Promise<string[]> {
  const response = await getPosts({ limit: 100 });
  if (response.error) return [];
  return response.data.items.map((post) => post.slug);
}

export async function getCategories(
  preview = false
): Promise<ApiResponse<PaginatedResponse<Category>>> {
  return fetchEntries<Category>(CONTENTFUL.CONTENT_TYPES.CATEGORY, {}, preview);
}

export const postRevalidate = CACHE.REVALIDATE_SECONDS;
