"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllWpContent = exports.fetchPaged = void 0;
const fetchJson = async ({ url }) => {
    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
        },
    });
    if (!response.ok) {
        const text = await response.text();
        const parsed = text.length ? JSON.parse(text) : null;
        const code = parsed?.code ?? "";
        throw new Error(`WP request failed (${response.status}) ${code} ${url}: ${text}`);
    }
    return (await response.json());
};
const fetchPaged = async ({ baseUrl, path, perPage, embed }) => {
    const items = [];
    let page = 1;
    while (true) {
        const url = new URL(path, baseUrl).toString();
        const fullUrl = `${url}?per_page=${perPage}&page=${page}${embed ? "&_embed=1" : ""}`;
        let batch = [];
        try {
            batch = await fetchJson({ url: fullUrl });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const isEndOfPages = message.includes("(400)") && message.includes("rest_post_invalid_page_number");
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
exports.fetchPaged = fetchPaged;
const fetchAllWpContent = async ({ wordpressBaseUrl, perPage }) => {
    const categories = await (0, exports.fetchPaged)({
        baseUrl: wordpressBaseUrl,
        path: "/wp-json/wp/v2/categories",
        perPage,
    });
    const tags = await (0, exports.fetchPaged)({
        baseUrl: wordpressBaseUrl,
        path: "/wp-json/wp/v2/tags",
        perPage,
    });
    const media = await (0, exports.fetchPaged)({
        baseUrl: wordpressBaseUrl,
        path: "/wp-json/wp/v2/media",
        perPage,
    });
    const pages = await (0, exports.fetchPaged)({
        baseUrl: wordpressBaseUrl,
        path: "/wp-json/wp/v2/pages",
        perPage,
        embed: true,
    });
    const posts = await (0, exports.fetchPaged)({
        baseUrl: wordpressBaseUrl,
        path: "/wp-json/wp/v2/posts",
        perPage,
        embed: true,
    });
    return { categories, tags, media, pages, posts };
};
exports.fetchAllWpContent = fetchAllWpContent;
