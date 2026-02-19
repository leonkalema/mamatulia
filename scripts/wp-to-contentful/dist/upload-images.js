"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const management_client_1 = require("./contentful/management-client");
const env_1 = require("./env");
const wp_client_1 = require("./wp/wp-client");
const parseArgs = () => {
    const limitFlagIndex = process.argv.findIndex((arg) => arg === "--limit");
    if (limitFlagIndex === -1) {
        return {};
    }
    const value = process.argv[limitFlagIndex + 1];
    if (!value) {
        return {};
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return {};
    }
    return { limit: parsed };
};
const isImageMedia = (media) => media.mime_type.startsWith("image/");
const normalizeUploadUrl = (url) => {
    const httpsUrl = url.replace(/^http:\/\//i, "https://");
    try {
        return new URL(httpsUrl).toString();
    }
    catch {
        return null;
    }
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
const uploadImageAsset = async (client, media) => {
    const assetId = `wpMedia-${media.id}`;
    const uploadUrl = normalizeUploadUrl(media.source_url);
    if (!uploadUrl) {
        process.stdout.write(`SKIP ${assetId} invalid source_url=${media.source_url}\n`);
        return;
    }
    const fileName = getFileNameFromUrl(uploadUrl, media.slug);
    const title = media.title?.rendered || media.slug;
    const description = media.alt_text || "";
    const upserted = await client.upsertAssetFromUrl({
        assetId,
        title,
        description,
        fileName,
        contentType: media.mime_type,
        uploadUrl,
    });
    const processedVersion = await client.processAssetFile(upserted.id, upserted.version);
    const readyVersion = await client.waitForAssetProcessed(upserted.id);
    await client.publishAsset(upserted.id, Math.max(processedVersion, readyVersion));
};
const run = async () => {
    const options = parseArgs();
    await (0, env_1.loadEnv)();
    const config = (0, config_1.getConfig)();
    const client = new management_client_1.ContentfulManagementClient({
        spaceId: config.contentfulSpaceId,
        environment: config.contentfulEnvironment,
        managementToken: config.contentfulManagementToken,
    });
    const media = await (0, wp_client_1.fetchPaged)({
        baseUrl: config.wordpressBaseUrl,
        path: "/wp-json/wp/v2/media",
        perPage: config.wordpressPerPage,
    });
    const images = media.filter(isImageMedia);
    const limited = typeof options.limit === "number" ? images.slice(0, options.limit) : images;
    process.stdout.write(`Found ${images.length} images (uploading ${limited.length})\n`);
    let uploaded = 0;
    let failed = 0;
    for (const item of limited) {
        try {
            await uploadImageAsset(client, item);
            uploaded += 1;
        }
        catch (error) {
            failed += 1;
            const message = error instanceof Error ? error.message : String(error);
            process.stdout.write(`FAIL wpMedia-${item.id} ${message}\n`);
        }
        if (uploaded % 25 === 0) {
            process.stdout.write(`Uploaded ${uploaded}/${limited.length}\n`);
        }
    }
    process.stdout.write(`Done. Uploaded ${uploaded} images, failed ${failed}\n`);
};
run().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
});
