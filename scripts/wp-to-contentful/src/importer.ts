import { ContentfulManagementClient } from "./contentful/management-client";
import { contentTypeDefinitions, makeContentTypePayload } from "./contentful/content-type-definitions";
import { ContentfulAssetLink, ContentfulLink, LocalizedField } from "./contentful/management-types";
import { WpContentSnapshot } from "./wp/wp-client";
import { WpMedia, WpPage, WpPost, WpTerm } from "./wp/wp-types";

type RedirectRow = {
  oldUrl: string;
  newUrl: string;
};

export type ImportResult = {
  redirects: RedirectRow[];
};

type IdMap = Record<number, string>;

const MAX_TEXT_FIELD_CHARS: number = 49000;

type ImportOptions = {
  client: ContentfulManagementClient;
  snapshot: WpContentSnapshot;
};

const localeWrap = <T>(value: T): LocalizedField<T> => ({ "en-US": value });

const makeAssetLink = (assetId: string): ContentfulAssetLink => ({
  sys: {
    type: "Link",
    linkType: "Asset",
    id: assetId,
  },
});

const makeEntryLink = (entryId: string): ContentfulLink => ({
  sys: {
    type: "Link",
    linkType: "Entry",
    id: entryId,
  },
});

const splitIntoChunks = (value: string, maxChars: number): string[] => {
  const chunks: string[] = [];
  let index: number = 0;
  while (index < value.length) {
    chunks.push(value.slice(index, index + maxChars));
    index += maxChars;
  }
  return chunks;
};

const assignHtmlChunks = (fields: Record<string, unknown>, baseFieldId: string, html: string): void => {
  const normalized: string = html ?? "";
  const chunks: string[] = splitIntoChunks(normalized, MAX_TEXT_FIELD_CHARS).slice(0, 4);
  const ids: string[] = [baseFieldId, `${baseFieldId}2`, `${baseFieldId}3`, `${baseFieldId}4`];
  for (let i: number = 0; i < ids.length; i += 1) {
    const value: string | undefined = chunks[i];
    if (value && value.length) {
      fields[ids[i]] = localeWrap(value);
    }
  }
};

const upsertEntryByWpId = async (client: ContentfulManagementClient, contentTypeId: string, wpId: number, fields: Record<string, unknown>): Promise<string> => {
  const existing = await client.findEntryByField(contentTypeId, "wpId", String(wpId));
  if (!existing) {
    const created = await client.createEntry<Record<string, unknown>>(contentTypeId, fields);
    await client.publishEntry(created.id, created.version);
    return created.id;
  }
  const updated = await client.updateEntry<Record<string, unknown>>(existing.id, existing.version, fields);
  await client.publishEntry(updated.id, updated.version);
  return updated.id;
};

const wpIdToEntryIdMap = (): IdMap => ({});

const resolveFeaturedImageUrl = (post: WpPost): string | null => {
  const featured: string | undefined = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  return featured ?? null;
};

const getFileNameFromUrl = (url: string, fallback: string): string => {
  try {
    const parsed: URL = new URL(url);
    const last: string = parsed.pathname.split("/").filter(Boolean).slice(-1)[0] ?? "";
    return last.length ? last : fallback;
  } catch {
    return fallback;
  }
};

const buildMediaMap = (media: WpMedia[]): Record<number, WpMedia> => {
  const map: Record<number, WpMedia> = {};
  for (const item of media) {
    map[item.id] = item;
  }
  return map;
};

const upsertFeaturedAsset = async (client: ContentfulManagementClient, mediaItem: WpMedia): Promise<string> => {
  const assetId: string = `wpMedia-${mediaItem.id}`;
  const fileName: string = getFileNameFromUrl(mediaItem.source_url, `${mediaItem.slug}`);
  const createdOrUpdated = await client.upsertAssetFromUrl({
    assetId,
    title: mediaItem.title?.rendered || mediaItem.slug,
    description: mediaItem.alt_text,
    fileName,
    contentType: mediaItem.mime_type,
    uploadUrl: mediaItem.source_url,
  });
  const processedVersion: number = await client.processAssetFile(createdOrUpdated.id, createdOrUpdated.version);
  const readyVersion: number = await client.waitForAssetProcessed(createdOrUpdated.id);
  await client.publishAsset(createdOrUpdated.id, Math.max(processedVersion, readyVersion));
  return createdOrUpdated.id;
};

const resolveAuthorName = (pageOrPost: WpPage | WpPost): { id: number; name: string; slug: string; description: string } => {
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

const uniqueAuthors = (snapshot: WpContentSnapshot): Array<{ id: number; name: string; slug: string; description: string }> => {
  const byId: Record<number, { id: number; name: string; slug: string; description: string }> = {};
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

const toNewPageUrl = (slug: string): string => `/${slug}`;

const toNewPostUrl = (slug: string): string => `/posts/${slug}`;

const importTerms = async (client: ContentfulManagementClient, contentTypeId: "wpCategory" | "wpTag", terms: WpTerm[]): Promise<IdMap> => {
  const idMap: IdMap = wpIdToEntryIdMap();
  for (const term of terms) {
    const fields: Record<string, unknown> = {
      wpId: localeWrap(term.id),
      name: localeWrap(term.name),
      slug: localeWrap(term.slug),
      description: localeWrap(term.description ?? ""),
    };
    const entryId: string = await upsertEntryByWpId(client, contentTypeId, term.id, fields);
    idMap[term.id] = entryId;
  }
  return idMap;
};

const importAuthors = async (client: ContentfulManagementClient, snapshot: WpContentSnapshot): Promise<IdMap> => {
  const idMap: IdMap = wpIdToEntryIdMap();
  const authors = uniqueAuthors(snapshot);
  for (const author of authors) {
    const fields: Record<string, unknown> = {
      wpId: localeWrap(author.id),
      name: localeWrap(author.name),
      slug: localeWrap(author.slug),
      description: localeWrap(author.description),
    };
    const entryId: string = await upsertEntryByWpId(client, "wpAuthor", author.id, fields);
    idMap[author.id] = entryId;
  }
  return idMap;
};

const importPages = async (client: ContentfulManagementClient, snapshot: WpContentSnapshot, authorIdMap: IdMap, mediaMap: Record<number, WpMedia>): Promise<RedirectRow[]> => {
  const redirects: RedirectRow[] = [];
  for (const page of snapshot.pages) {
    const authorLinkId: string | undefined = authorIdMap[page.author];
    const featuredMedia: WpMedia | undefined = mediaMap[page.featured_media];
    const fields: Record<string, unknown> = {
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
      const assetId: string = await upsertFeaturedAsset(client, featuredMedia);
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

const makeLinksArray = (ids: number[], map: IdMap): ContentfulLink[] => {
  const links: ContentfulLink[] = [];
  for (const id of ids) {
    const entryId: string | undefined = map[id];
    if (entryId) {
      links.push(makeEntryLink(entryId));
    }
  }
  return links;
};

const importPosts = async (
  client: ContentfulManagementClient,
  snapshot: WpContentSnapshot,
  maps: { authorIdMap: IdMap; categoryIdMap: IdMap; tagIdMap: IdMap },
  mediaMap: Record<number, WpMedia>
): Promise<RedirectRow[]> => {
  const redirects: RedirectRow[] = [];
  for (const post of snapshot.posts) {
    const authorLinkId: string | undefined = maps.authorIdMap[post.author];
    const featuredImageUrl: string | null = resolveFeaturedImageUrl(post);
    const featuredMedia: WpMedia | undefined = mediaMap[post.featured_media];
    const fields: Record<string, unknown> = {
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
      const assetId: string = await upsertFeaturedAsset(client, featuredMedia);
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

export const ensureContentModel = async (client: ContentfulManagementClient): Promise<void> => {
  for (const [id, definition] of Object.entries(contentTypeDefinitions)) {
    const payload: unknown = makeContentTypePayload(definition);
    const version: number = await client.createOrUpdateContentType(id, payload);
    await client.publishContentType(id, version);
  }
};

export const importSnapshot = async ({ client, snapshot }: ImportOptions): Promise<ImportResult> => {
  const mediaMap: Record<number, WpMedia> = buildMediaMap(snapshot.media);
  const categoryIdMap: IdMap = await importTerms(client, "wpCategory", snapshot.categories);
  const tagIdMap: IdMap = await importTerms(client, "wpTag", snapshot.tags);
  const authorIdMap: IdMap = await importAuthors(client, snapshot);
  const pageRedirects: RedirectRow[] = await importPages(client, snapshot, authorIdMap, mediaMap);
  const postRedirects: RedirectRow[] = await importPosts(client, snapshot, { authorIdMap, categoryIdMap, tagIdMap }, mediaMap);
  return { redirects: [...pageRedirects, ...postRedirects] };
};
