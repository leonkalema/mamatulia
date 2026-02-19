type ManagementClientOptions = {
  spaceId: string;
  environment: string;
  managementToken: string;
};

type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
};

type JsonResult<T> = {
  data: T;
  version: number | null;
};

type EntrySys = {
  id: string;
  version: number;
  updatedAt?: string;
  publishedVersion?: number;
};

type EntryItem = {
  sys: EntrySys;
  fields?: Record<string, unknown>;
};

type EntryCollection = {
  total: number;
  skip: number;
  limit: number;
  items: EntryItem[];
};

type AssetSys = {
  id: string;
  version: number;
};

type Asset = {
  sys: AssetSys;
};

type AssetFileDetails = {
  url?: string;
  fileName?: string;
  contentType?: string;
};

type AssetFields = {
  file?: {
    "en-US"?: AssetFileDetails;
  };
};

type AssetWithFields = {
  sys: AssetSys;
  fields?: AssetFields;
};

const CONTENTFUL_API_BASE_URL = "https://api.contentful.com";

export class ContentfulManagementClient {
  private readonly spaceId: string;
  private readonly environment: string;
  private readonly managementToken: string;

  public constructor(options: ManagementClientOptions) {
    this.spaceId = options.spaceId;
    this.environment = options.environment;
    this.managementToken = options.managementToken;
  }

  public async getAsset(assetId: string): Promise<{ id: string; version: number } | null> {
    try {
      const result: JsonResult<Asset> = await this.requestJson<Asset>({ method: "GET", path: `/assets/${assetId}` });
      return { id: result.data.sys.id, version: result.data.sys.version };
    } catch (error: unknown) {
      const message: string = error instanceof Error ? error.message : String(error);
      if (message.includes("(404)")) {
        return null;
      }
      throw error;
    }
  }

  private async getAssetWithFields(assetId: string): Promise<AssetWithFields> {
    const result: JsonResult<AssetWithFields> = await this.requestJson<AssetWithFields>({
      method: "GET",
      path: `/assets/${assetId}`,
    });
    return result.data;
  }

  private async sleepMs(durationMs: number): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), durationMs);
    });
  }

  public async waitForAssetProcessed(assetId: string, maxAttempts: number = 20, waitMs: number = 1500): Promise<number> {
    for (let attempt: number = 0; attempt < maxAttempts; attempt += 1) {
      const asset: AssetWithFields = await this.getAssetWithFields(assetId);
      const url: string | undefined = asset.fields?.file?.["en-US"]?.url;
      if (url && url.length) {
        return asset.sys.version;
      }
      await this.sleepMs(waitMs);
    }
    const last: AssetWithFields = await this.getAssetWithFields(assetId);
    return last.sys.version;
  }

  public async upsertAssetFromUrl(options: {
    assetId: string;
    title: string;
    description?: string;
    fileName: string;
    contentType: string;
    uploadUrl: string;
  }): Promise<{ id: string; version: number }> {
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
      const created: JsonResult<Asset> = await this.requestJson<Asset>({
        method: "PUT",
        path: `/assets/${options.assetId}`,
        body: { fields },
      });
      return { id: created.data.sys.id, version: created.data.sys.version };
    }
    const updated: JsonResult<Asset> = await this.requestJson<Asset>({
      method: "PUT",
      path: `/assets/${options.assetId}`,
      body: { fields },
      headers: {
        "X-Contentful-Version": String(existing.version),
      },
    });
    return { id: updated.data.sys.id, version: updated.data.sys.version };
  }

  public async processAssetFile(assetId: string, version: number): Promise<number> {
    const result: JsonResult<unknown> = await this.requestJson<unknown>({
      method: "PUT",
      path: `/assets/${assetId}/files/en-US/process`,
      headers: {
        "X-Contentful-Version": String(version),
      },
    });
    return result.version ?? version + 1;
  }

  public async publishAsset(assetId: string, version: number): Promise<void> {
    await this.requestJson<unknown>({
      method: "PUT",
      path: `/assets/${assetId}/published`,
      headers: {
        "X-Contentful-Version": String(version),
      },
    });
  }

  public async listEntriesByContentType(contentTypeId: string): Promise<EntryItem[]> {
    const items: EntryItem[] = [];
    let skip: number = 0;
    const limit: number = 1000;
    while (true) {
      const params: URLSearchParams = new URLSearchParams({
        content_type: contentTypeId,
        limit: String(limit),
        skip: String(skip),
      });
      const path: string = `/entries?${params.toString()}`;
      const result: JsonResult<EntryCollection> = await this.requestJson<EntryCollection>({ method: "GET", path });
      items.push(...result.data.items);
      const nextSkip: number = result.data.skip + result.data.limit;
      if (nextSkip >= result.data.total) {
        break;
      }
      skip = nextSkip;
    }
    return items;
  }

  public async unpublishEntry(entryId: string, version: number): Promise<number> {
    const result: JsonResult<unknown> = await this.requestJson<unknown>({
      method: "PUT",
      path: `/entries/${entryId}/unpublished`,
      headers: {
        "X-Contentful-Version": String(version),
      },
    });
    return result.version ?? version + 1;
  }

  public async deleteEntry(entryId: string, version: number): Promise<void> {
    await this.requestJson<unknown>({
      method: "DELETE",
      path: `/entries/${entryId}`,
      headers: {
        "X-Contentful-Version": String(version),
      },
    });
  }

  private getBaseUrl(): string {
    return `${CONTENTFUL_API_BASE_URL}/spaces/${this.spaceId}/environments/${this.environment}`;
  }

  private async requestJson<T>({ method, path, body, headers }: RequestOptions): Promise<JsonResult<T>> {
    const url: string = `${this.getBaseUrl()}${path}`;
    const response: Response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.managementToken}`,
        "Content-Type": "application/vnd.contentful.management.v1+json",
        ...(headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text: string = await response.text();
    if (!response.ok) {
      throw new Error(`Contentful request failed (${response.status}) ${method} ${path}: ${text}`);
    }
    const parsed: unknown = text.length ? JSON.parse(text) : null;
    const versionHeader: string | null = response.headers.get("x-contentful-version");
    const version: number | null = versionHeader ? Number(versionHeader) : null;
    return { data: parsed as T, version };
  }

  public async getContentType(id: string): Promise<unknown | null> {
    try {
      const result: JsonResult<unknown> = await this.requestJson<unknown>({ method: "GET", path: `/content_types/${id}` });
      return result.data;
    } catch (error: unknown) {
      const message: string = error instanceof Error ? error.message : String(error);
      if (message.includes("(404)")) {
        return null;
      }
      throw error;
    }
  }

  public async createOrUpdateContentType(id: string, payload: unknown): Promise<number> {
    const existing: unknown | null = await this.getContentType(id);
    if (!existing) {
      const result: JsonResult<unknown> = await this.requestJson<unknown>({
        method: "PUT",
        path: `/content_types/${id}`,
        body: payload,
      });
      return result.version ?? 1;
    }
    const sys: { version?: number } | undefined = (existing as { sys?: { version?: number } }).sys;
    const currentVersion: number = sys?.version ?? 1;
    const result: JsonResult<unknown> = await this.requestJson<unknown>({
      method: "PUT",
      path: `/content_types/${id}`,
      body: payload,
      headers: {
        "X-Contentful-Version": String(currentVersion),
      },
    });
    return result.version ?? currentVersion + 1;
  }

  public async publishContentType(id: string, version: number): Promise<void> {
    await this.requestJson<unknown>({
      method: "PUT",
      path: `/content_types/${id}/published`,
      headers: {
        "X-Contentful-Version": String(version),
      },
    });
  }

  public async createEntry<T>(contentTypeId: string, fields: T): Promise<{ id: string; version: number }>{
    const result: JsonResult<{ sys: { id: string } }> = await this.requestJson<{ sys: { id: string } }>({
      method: "POST",
      path: "/entries",
      body: { fields },
      headers: {
        "X-Contentful-Content-Type": contentTypeId,
      },
    });
    const version: number = result.version ?? 1;
    return { id: result.data.sys.id, version };
  }

  public async updateEntry<T>(entryId: string, version: number, fields: T): Promise<{ id: string; version: number }> {
    const result: JsonResult<{ sys: { id: string } }> = await this.requestJson<{ sys: { id: string } }>({
      method: "PUT",
      path: `/entries/${entryId}`,
      body: { fields },
      headers: {
        "X-Contentful-Version": String(version),
      },
    });
    return { id: result.data.sys.id, version: result.version ?? version + 1 };
  }

  public async findEntryByField(contentTypeId: string, fieldId: string, value: string): Promise<{ id: string; version: number } | null> {
    const params: URLSearchParams = new URLSearchParams({
      content_type: contentTypeId,
      limit: "1",
    });
    params.set(`fields.${fieldId}`, value);
    const path: string = `/entries?${params.toString()}`;
    const result: JsonResult<{ items?: Array<{ sys?: { id?: string; version?: number } }> }> =
      await this.requestJson<{ items?: Array<{ sys?: { id?: string; version?: number } }> }>({ method: "GET", path });
    const item = result.data.items?.[0];
    const id: string | undefined = item?.sys?.id;
    if (!id) {
      return null;
    }
    const version: number = item?.sys?.version ?? 1;
    return { id, version };
  }

  public async publishEntry(entryId: string, version: number): Promise<void> {
    await this.requestJson<unknown>({
      method: "PUT",
      path: `/entries/${entryId}/published`,
      headers: {
        "X-Contentful-Version": String(version),
      },
    });
  }
}
