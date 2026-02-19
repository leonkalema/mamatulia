"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const management_client_1 = require("./contentful/management-client");
const env_1 = require("./env");
const parseArgs = () => {
    const execute = process.argv.includes("--execute");
    return { execute };
};
const asNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.length) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
const getWpIdFromFields = (fields) => {
    if (!fields) {
        return null;
    }
    const localized = fields.wpId?.["en-US"];
    return asNumber(localized);
};
const normalizeEntry = (item) => {
    const wpId = getWpIdFromFields(item.fields);
    if (wpId === null) {
        return null;
    }
    const version = item.sys.version ?? 1;
    const updatedAt = item.sys.updatedAt ?? "";
    const publishedVersion = typeof item.sys.publishedVersion === "number" ? item.sys.publishedVersion : null;
    return { id: item.sys.id, version, updatedAt, publishedVersion, wpId };
};
const groupDuplicates = (entries) => {
    const byWpId = {};
    for (const entry of entries) {
        byWpId[entry.wpId] = [...(byWpId[entry.wpId] ?? []), entry];
    }
    const groups = [];
    for (const [wpIdRaw, list] of Object.entries(byWpId)) {
        if (list.length < 2) {
            continue;
        }
        const sorted = [...list].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
        const keep = sorted[0];
        const remove = sorted.slice(1);
        groups.push({ wpId: Number(wpIdRaw), keep, remove });
    }
    return groups;
};
const cleanupContentType = async (client, contentTypeId, options) => {
    const rawItems = await client.listEntriesByContentType(contentTypeId);
    const entries = rawItems.map((item) => normalizeEntry(item)).filter((x) => x !== null);
    const groups = groupDuplicates(entries);
    let removedCount = 0;
    for (const group of groups) {
        for (const dup of group.remove) {
            const action = options.execute ? "DELETE" : "DRY";
            process.stdout.write(`${action} ${contentTypeId} wpId=${group.wpId} remove=${dup.id} keep=${group.keep.id}\n`);
            if (!options.execute) {
                continue;
            }
            let version = dup.version;
            if (dup.publishedVersion !== null) {
                try {
                    version = await client.unpublishEntry(dup.id, version);
                }
                catch {
                    version = dup.version;
                }
            }
            await client.deleteEntry(dup.id, version);
            removedCount += 1;
        }
    }
    return removedCount;
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
    const contentTypes = ["wpArticle", "wpPage", "wpCategory", "wpTag", "wpAuthor"];
    let removed = 0;
    for (const contentTypeId of contentTypes) {
        removed += await cleanupContentType(client, contentTypeId, options);
    }
    process.stdout.write(`Duplicates removed: ${removed}\n`);
};
run().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
});
