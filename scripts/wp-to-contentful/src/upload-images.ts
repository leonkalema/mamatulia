import { getConfig } from "./config";
import { ContentfulManagementClient } from "./contentful/management-client";
import { loadEnv } from "./env";
import { fetchPaged } from "./wp/wp-client";
import { WpMedia } from "./wp/wp-types";

type RunOptions = {
  limit?: number;
};

const parseArgs = (): RunOptions => {
  const limitFlagIndex: number = process.argv.findIndex((arg) => arg === "--limit");
  if (limitFlagIndex === -1) {
    return {};
  }
  const value: string | undefined = process.argv[limitFlagIndex + 1];
  if (!value) {
    return {};
  }
  const parsed: number = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return {};
  }
  return { limit: parsed };
};

const isImageMedia = (media: WpMedia): boolean => media.mime_type.startsWith("image/");

const normalizeUploadUrl = (url: string): string | null => {
  const httpsUrl: string = url.replace(/^http:\/\//i, "https://");
  try {
    return new URL(httpsUrl).toString();
  } catch {
    return null;
  }
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

const uploadImageAsset = async (client: ContentfulManagementClient, media: WpMedia): Promise<void> => {
  const assetId: string = `wpMedia-${media.id}`;
  const uploadUrl: string | null = normalizeUploadUrl(media.source_url);
  if (!uploadUrl) {
    process.stdout.write(`SKIP ${assetId} invalid source_url=${media.source_url}\n`);
    return;
  }
  const fileName: string = getFileNameFromUrl(uploadUrl, media.slug);
  const title: string = media.title?.rendered || media.slug;
  const description: string = media.alt_text || "";
  const upserted = await client.upsertAssetFromUrl({
    assetId,
    title,
    description,
    fileName,
    contentType: media.mime_type,
    uploadUrl,
  });
  const processedVersion: number = await client.processAssetFile(upserted.id, upserted.version);
  const readyVersion: number = await client.waitForAssetProcessed(upserted.id);
  await client.publishAsset(upserted.id, Math.max(processedVersion, readyVersion));
};

const run = async (): Promise<void> => {
  const options: RunOptions = parseArgs();
  await loadEnv();
  const config = getConfig();
  const client = new ContentfulManagementClient({
    spaceId: config.contentfulSpaceId,
    environment: config.contentfulEnvironment,
    managementToken: config.contentfulManagementToken,
  });
  const media: WpMedia[] = await fetchPaged<WpMedia>({
    baseUrl: config.wordpressBaseUrl,
    path: "/wp-json/wp/v2/media",
    perPage: config.wordpressPerPage,
  });
  const images: WpMedia[] = media.filter(isImageMedia);
  const limited: WpMedia[] = typeof options.limit === "number" ? images.slice(0, options.limit) : images;
  process.stdout.write(`Found ${images.length} images (uploading ${limited.length})\n`);
  let uploaded: number = 0;
  let failed: number = 0;
  for (const item of limited) {
    try {
      await uploadImageAsset(client, item);
      uploaded += 1;
    } catch (error: unknown) {
      failed += 1;
      const message: string = error instanceof Error ? error.message : String(error);
      process.stdout.write(`FAIL wpMedia-${item.id} ${message}\n`);
    }
    if (uploaded % 25 === 0) {
      process.stdout.write(`Uploaded ${uploaded}/${limited.length}\n`);
    }
  }
  process.stdout.write(`Done. Uploaded ${uploaded} images, failed ${failed}\n`);
};

run().catch((error: unknown) => {
  const message: string = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
