"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentfulManagementClient = void 0;
const CONTENTFUL_API_BASE_URL = "https://api.contentful.com";
class ContentfulManagementClient {
    spaceId;
    environment;
    managementToken;
    constructor(options) {
        this.spaceId = options.spaceId;
        this.environment = options.environment;
        this.managementToken = options.managementToken;
    }
    async getAsset(assetId) {
        try {
            const result = await this.requestJson({ method: "GET", path: `/assets/${assetId}` });
            return { id: result.data.sys.id, version: result.data.sys.version };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes("(404)")) {
                return null;
            }
            throw error;
        }
    }
    async getAssetWithFields(assetId) {
        const result = await this.requestJson({
            method: "GET",
            path: `/assets/${assetId}`,
        });
        return result.data;
    }
    async sleepMs(durationMs) {
        await new Promise((resolve) => {
            setTimeout(() => resolve(), durationMs);
        });
    }
    async waitForAssetProcessed(assetId, maxAttempts = 20, waitMs = 1500) {
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            const asset = await this.getAssetWithFields(assetId);
            const url = asset.fields?.file?.["en-US"]?.url;
            if (url && url.length) {
                return asset.sys.version;
            }
            await this.sleepMs(waitMs);
        }
        const last = await this.getAssetWithFields(assetId);
        return last.sys.version;
    }
    async upsertAssetFromUrl(options) {
        const existing = await this.getAsset(options.assetId);
        const fields = {
            title: { "en-US": options.title },
            description: { "en-US": options.description ?? "" },
            file: {
                "en-US": {
                    contentType: options.contentType,
                    fileName: options.fileName,
                    upload: options.uploadUrl,
                },
            },
        };
        if (!existing) {
            const created = await this.requestJson({
                method: "PUT",
                path: `/assets/${options.assetId}`,
                body: { fields },
            });
            return { id: created.data.sys.id, version: created.data.sys.version };
        }
        const updated = await this.requestJson({
            method: "PUT",
            path: `/assets/${options.assetId}`,
            body: { fields },
            headers: {
                "X-Contentful-Version": String(existing.version),
            },
        });
        return { id: updated.data.sys.id, version: updated.data.sys.version };
    }
    async processAssetFile(assetId, version) {
        const result = await this.requestJson({
            method: "PUT",
            path: `/assets/${assetId}/files/en-US/process`,
            headers: {
                "X-Contentful-Version": String(version),
            },
        });
        return result.version ?? version + 1;
    }
    async publishAsset(assetId, version) {
        await this.requestJson({
            method: "PUT",
            path: `/assets/${assetId}/published`,
            headers: {
                "X-Contentful-Version": String(version),
            },
        });
    }
    async listEntriesByContentType(contentTypeId) {
        const items = [];
        let skip = 0;
        const limit = 1000;
        while (true) {
            const params = new URLSearchParams({
                content_type: contentTypeId,
                limit: String(limit),
                skip: String(skip),
            });
            const path = `/entries?${params.toString()}`;
            const result = await this.requestJson({ method: "GET", path });
            items.push(...result.data.items);
            const nextSkip = result.data.skip + result.data.limit;
            if (nextSkip >= result.data.total) {
                break;
            }
            skip = nextSkip;
        }
        return items;
    }
    async unpublishEntry(entryId, version) {
        const result = await this.requestJson({
            method: "PUT",
            path: `/entries/${entryId}/unpublished`,
            headers: {
                "X-Contentful-Version": String(version),
            },
        });
        return result.version ?? version + 1;
    }
    async deleteEntry(entryId, version) {
        await this.requestJson({
            method: "DELETE",
            path: `/entries/${entryId}`,
            headers: {
                "X-Contentful-Version": String(version),
            },
        });
    }
    getBaseUrl() {
        return `${CONTENTFUL_API_BASE_URL}/spaces/${this.spaceId}/environments/${this.environment}`;
    }
    async requestJson({ method, path, body, headers }) {
        const url = `${this.getBaseUrl()}${path}`;
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${this.managementToken}`,
                "Content-Type": "application/vnd.contentful.management.v1+json",
                ...(headers ?? {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        const text = await response.text();
        if (!response.ok) {
            throw new Error(`Contentful request failed (${response.status}) ${method} ${path}: ${text}`);
        }
        const parsed = text.length ? JSON.parse(text) : null;
        const versionHeader = response.headers.get("x-contentful-version");
        const version = versionHeader ? Number(versionHeader) : null;
        return { data: parsed, version };
    }
    async getContentType(id) {
        try {
            const result = await this.requestJson({ method: "GET", path: `/content_types/${id}` });
            return result.data;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes("(404)")) {
                return null;
            }
            throw error;
        }
    }
    async createOrUpdateContentType(id, payload) {
        const existing = await this.getContentType(id);
        if (!existing) {
            const result = await this.requestJson({
                method: "PUT",
                path: `/content_types/${id}`,
                body: payload,
            });
            return result.version ?? 1;
        }
        const sys = existing.sys;
        const currentVersion = sys?.version ?? 1;
        const result = await this.requestJson({
            method: "PUT",
            path: `/content_types/${id}`,
            body: payload,
            headers: {
                "X-Contentful-Version": String(currentVersion),
            },
        });
        return result.version ?? currentVersion + 1;
    }
    async publishContentType(id, version) {
        await this.requestJson({
            method: "PUT",
            path: `/content_types/${id}/published`,
            headers: {
                "X-Contentful-Version": String(version),
            },
        });
    }
    async createEntry(contentTypeId, fields) {
        const result = await this.requestJson({
            method: "POST",
            path: "/entries",
            body: { fields },
            headers: {
                "X-Contentful-Content-Type": contentTypeId,
            },
        });
        const version = result.version ?? 1;
        return { id: result.data.sys.id, version };
    }
    async updateEntry(entryId, version, fields) {
        const result = await this.requestJson({
            method: "PUT",
            path: `/entries/${entryId}`,
            body: { fields },
            headers: {
                "X-Contentful-Version": String(version),
            },
        });
        return { id: result.data.sys.id, version: result.version ?? version + 1 };
    }
    async findEntryByField(contentTypeId, fieldId, value) {
        const params = new URLSearchParams({
            content_type: contentTypeId,
            limit: "1",
        });
        params.set(`fields.${fieldId}`, value);
        const path = `/entries?${params.toString()}`;
        const result = await this.requestJson({ method: "GET", path });
        const item = result.data.items?.[0];
        const id = item?.sys?.id;
        if (!id) {
            return null;
        }
        const version = item?.sys?.version ?? 1;
        return { id, version };
    }
    async publishEntry(entryId, version) {
        await this.requestJson({
            method: "PUT",
            path: `/entries/${entryId}/published`,
            headers: {
                "X-Contentful-Version": String(version),
            },
        });
    }
}
exports.ContentfulManagementClient = ContentfulManagementClient;
