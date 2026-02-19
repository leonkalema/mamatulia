"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importSnapshot = exports.ensureContentModel = void 0;
const content_type_definitions_1 = require("./contentful/content-type-definitions");
const MAX_TEXT_FIELD_CHARS = 49000;
const localeWrap = (value) => ({ "en-US": value });
const makeAssetLink = (assetId) => ({
    sys: {
        type: "Link",
        linkType: "Asset",
        id: assetId,
    },
});
const makeEntryLink = (entryId) => ({
    sys: {
        type: "Link",
        linkType: "Entry",
        id: entryId,
    },
});
const splitIntoChunks = (value, maxChars) => {
    const chunks = [];
    let index = 0;
    while (index < value.length) {
        chunks.push(value.slice(index, index + maxChars));
        index += maxChars;
    }
    return chunks;
};
const assignHtmlChunks = (fields, baseFieldId, html) => {
    const normalized = html ?? "";
    const chunks = splitIntoChunks(normalized, MAX_TEXT_FIELD_CHARS).slice(0, 4);
    const ids = [baseFieldId, `${baseFieldId}2`, `${baseFieldId}3`, `${baseFieldId}4`];
    for (let i = 0; i < ids.length; i += 1) {
        const value = chunks[i];
        if (value && value.length) {
            fields[ids[i]] = localeWrap(value);
        }
    }
};
const upsertEntryByWpId = async (client, contentTypeId, wpId, fields) => {
    const existing = await client.findEntryByField(contentTypeId, "wpId", String(wpId));
    if (!existing) {
        const created = await client.createEntry(contentTypeId, fields);
        await client.publishEntry(created.id, created.version);
        return created.id;
    }
    const updated = await client.updateEntry(existing.id, existing.version, fields);
    await client.publishEntry(updated.id, updated.version);
    return updated.id;
};
const wpIdToEntryIdMap = () => ({});
const resolveFeaturedImageUrl = (post) => {
    const featured = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    return featured ?? null;
};
const getFileNameFromUrl = (url, fallback) => {
    try {
        const parsed = new URL(url);
        const last = parsed.pathname.split("/").filter(Boolean).slice(-1)[0] ?? "";
        return last.length ? last : fallback;
    }
    catch {
        return fallback;
    }
};
const buildMediaMap = (media) => {
    const map = {};
    for (const item of media) {
        map[item.id] = item;
    }
    return map;
};
const upsertFeaturedAsset = async (client, mediaItem) => {
    const assetId = `wpMedia-${mediaItem.id}`;
    const fileName = getFileNameFromUrl(mediaItem.source_url, `${mediaItem.slug}`);
    const createdOrUpdated = await client.upsertAssetFromUrl({
        assetId,
        title: mediaItem.title?.rendered || mediaItem.slug,
        description: mediaItem.alt_text,
        fileName,
        contentType: mediaItem.mime_type,
        uploadUrl: mediaItem.source_url,
    });
    const processedVersion = await client.processAssetFile(createdOrUpdated.id, createdOrUpdated.version);
    const readyVersion = await client.waitForAssetProcessed(createdOrUpdated.id);
    await client.publishAsset(createdOrUpdated.id, Math.max(processedVersion, readyVersion));
    return createdOrUpdated.id;
};
const resolveAuthorName = (pageOrPost) => {
    const embeddedAuthor = pageOrPost._embedded?.author?.[0];
    if (embeddedAuthor) {
        return {
            id: embeddedAuthor.id,
            name: embeddedAuthor.name,
            slug: embeddedAuthor.slug,
            description: embeddedAuthor.description ?? "",
        };
    }
    return { id: pageOrPost.author, name: `Author ${pageOrPost.author}`, slug: `author-${pageOrPost.author}`, description: "" };
};
const uniqueAuthors = (snapshot) => {
    const byId = {};
    for (const page of snapshot.pages) {
        const author = resolveAuthorName(page);
        byId[author.id] = author;
    }
    for (const post of snapshot.posts) {
        const author = resolveAuthorName(post);
        byId[author.id] = author;
    }
    return Object.values(byId);
};
const toNewPageUrl = (slug) => `/${slug}`;
const toNewPostUrl = (slug) => `/posts/${slug}`;
const importTerms = async (client, contentTypeId, terms) => {
    const idMap = wpIdToEntryIdMap();
    for (const term of terms) {
        const fields = {
            wpId: localeWrap(term.id),
            name: localeWrap(term.name),
            slug: localeWrap(term.slug),
            description: localeWrap(term.description ?? ""),
        };
        const entryId = await upsertEntryByWpId(client, contentTypeId, term.id, fields);
        idMap[term.id] = entryId;
    }
    return idMap;
};
const importAuthors = async (client, snapshot) => {
    const idMap = wpIdToEntryIdMap();
    const authors = uniqueAuthors(snapshot);
    for (const author of authors) {
        const fields = {
            wpId: localeWrap(author.id),
            name: localeWrap(author.name),
            slug: localeWrap(author.slug),
            description: localeWrap(author.description),
        };
        const entryId = await upsertEntryByWpId(client, "wpAuthor", author.id, fields);
        idMap[author.id] = entryId;
    }
    return idMap;
};
const importPages = async (client, snapshot, authorIdMap, mediaMap) => {
    const redirects = [];
    for (const page of snapshot.pages) {
        const authorLinkId = authorIdMap[page.author];
        const featuredMedia = mediaMap[page.featured_media];
        const fields = {
            wpId: localeWrap(page.id),
            title: localeWrap(page.title.rendered),
            slug: localeWrap(page.slug),
            date: localeWrap(page.date),
            modified: localeWrap(page.modified),
            excerptHtml: localeWrap(page.excerpt.rendered ?? ""),
            oldUrl: localeWrap(page.link),
            sourceUrl: localeWrap(page.link),
        };
        assignHtmlChunks(fields, "bodyHtml", page.content.rendered ?? "");
        if (featuredMedia) {
            const assetId = await upsertFeaturedAsset(client, featuredMedia);
            fields.featuredImage = localeWrap(makeAssetLink(assetId));
        }
        if (authorLinkId) {
            fields.author = localeWrap(makeEntryLink(authorLinkId));
        }
        await upsertEntryByWpId(client, "wpPage", page.id, fields);
        redirects.push({ oldUrl: page.link, newUrl: toNewPageUrl(page.slug) });
    }
    return redirects;
};
const makeLinksArray = (ids, map) => {
    const links = [];
    for (const id of ids) {
        const entryId = map[id];
        if (entryId) {
            links.push(makeEntryLink(entryId));
        }
    }
    return links;
};
const importPosts = async (client, snapshot, maps, mediaMap) => {
    const redirects = [];
    for (const post of snapshot.posts) {
        const authorLinkId = maps.authorIdMap[post.author];
        const featuredImageUrl = resolveFeaturedImageUrl(post);
        const featuredMedia = mediaMap[post.featured_media];
        const fields = {
            wpId: localeWrap(post.id),
            title: localeWrap(post.title.rendered),
            slug: localeWrap(post.slug),
            date: localeWrap(post.date),
            modified: localeWrap(post.modified),
            excerptHtml: localeWrap(post.excerpt.rendered ?? ""),
            featuredImageUrl: localeWrap(featuredImageUrl ?? ""),
            oldUrl: localeWrap(post.link),
            sourceUrl: localeWrap(post.link),
            categories: localeWrap(makeLinksArray(post.categories, maps.categoryIdMap)),
            tags: localeWrap(makeLinksArray(post.tags, maps.tagIdMap)),
        };
        assignHtmlChunks(fields, "bodyHtml", post.content.rendered ?? "");
        if (featuredMedia) {
            const assetId = await upsertFeaturedAsset(client, featuredMedia);
            fields.featuredImage = localeWrap(makeAssetLink(assetId));
        }
        if (authorLinkId) {
            fields.author = localeWrap(makeEntryLink(authorLinkId));
        }
        await upsertEntryByWpId(client, "wpArticle", post.id, fields);
        redirects.push({ oldUrl: post.link, newUrl: toNewPostUrl(post.slug) });
    }
    return redirects;
};
const ensureContentModel = async (client) => {
    for (const [id, definition] of Object.entries(content_type_definitions_1.contentTypeDefinitions)) {
        const payload = (0, content_type_definitions_1.makeContentTypePayload)(definition);
        const version = await client.createOrUpdateContentType(id, payload);
        await client.publishContentType(id, version);
    }
};
exports.ensureContentModel = ensureContentModel;
const importSnapshot = async ({ client, snapshot }) => {
    const mediaMap = buildMediaMap(snapshot.media);
    const categoryIdMap = await importTerms(client, "wpCategory", snapshot.categories);
    const tagIdMap = await importTerms(client, "wpTag", snapshot.tags);
    const authorIdMap = await importAuthors(client, snapshot);
    const pageRedirects = await importPages(client, snapshot, authorIdMap, mediaMap);
    const postRedirects = await importPosts(client, snapshot, { authorIdMap, categoryIdMap, tagIdMap }, mediaMap);
    return { redirects: [...pageRedirects, ...postRedirects] };
};
exports.importSnapshot = importSnapshot;
