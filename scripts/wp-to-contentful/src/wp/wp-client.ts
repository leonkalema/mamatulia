import { WpMedia, WpPage, WpPost, WpTerm } from "./wp-types";

type FetchJsonOptions = {
  url: string;
};

type WpErrorPayload = {
  code?: string;
  message?: string;
};

const fetchJson = async <T>({ url }: FetchJsonOptions): Promise<T> => {
  const response: Response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    const text: string = await response.text();
    const parsed: WpErrorPayload | null = text.length ? (JSON.parse(text) as WpErrorPayload) : null;
    const code: string = parsed?.code ?? "";
    throw new Error(`WP request failed (${response.status}) ${code} ${url}: ${text}`);
  }
  return (await response.json()) as T;
};

type FetchPagedOptions = {
  baseUrl: string;
  path: string;
  perPage: number;
  embed?: boolean;
};

export const fetchPaged = async <T>({ baseUrl, path, perPage, embed }: FetchPagedOptions): Promise<T[]> => {
  const items: T[] = [];
  let page: number = 1;
  while (true) {
    const url: string = new URL(path, baseUrl).toString();
    const fullUrl: string = `${url}?per_page=${perPage}&page=${page}${embed ? "&_embed=1" : ""}`;
    let batch: T[] = [];
    try {
      batch = await fetchJson<T[]>({ url: fullUrl });
    } catch (error: unknown) {
      const message: string = error instanceof Error ? error.message : String(error);
      const isEndOfPages: boolean = message.includes("(400)") && message.includes("rest_post_invalid_page_number");
      if (isEndOfPages) {
        break;
      }
      throw error;
    }
    if (batch.length === 0) {
      break;
    }
    items.push(...batch);
    page += 1;
  }
  return items;
};

export type FetchAllWpContentOptions = {
  wordpressBaseUrl: string;
  perPage: number;
};

export type WpContentSnapshot = {
  categories: WpTerm[];
  tags: WpTerm[];
  media: WpMedia[];
  pages: WpPage[];
  posts: WpPost[];
};

export const fetchAllWpContent = async ({ wordpressBaseUrl, perPage }: FetchAllWpContentOptions): Promise<WpContentSnapshot> => {
  const categories: WpTerm[] = await fetchPaged<WpTerm>({
    baseUrl: wordpressBaseUrl,
    path: "/wp-json/wp/v2/categories",
    perPage,
  });
  const tags: WpTerm[] = await fetchPaged<WpTerm>({
    baseUrl: wordpressBaseUrl,
    path: "/wp-json/wp/v2/tags",
    perPage,
  });
  const media: WpMedia[] = await fetchPaged<WpMedia>({
    baseUrl: wordpressBaseUrl,
    path: "/wp-json/wp/v2/media",
    perPage,
  });
  const pages: WpPage[] = await fetchPaged<WpPage>({
    baseUrl: wordpressBaseUrl,
    path: "/wp-json/wp/v2/pages",
    perPage,
    embed: true,
  });
  const posts: WpPost[] = await fetchPaged<WpPost>({
    baseUrl: wordpressBaseUrl,
    path: "/wp-json/wp/v2/posts",
    perPage,
    embed: true,
  });
  return { categories, tags, media, pages, posts };
};
