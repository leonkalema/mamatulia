import { getConfig } from "./config";
import { ContentfulManagementClient } from "./contentful/management-client";
import { loadEnv } from "./env";

type CleanupOptions = {
  execute: boolean;
};

type WpEntry = {
  id: string;
  version: number;
  updatedAt: string;
  publishedVersion: number | null;
  wpId: number;
};

type DuplicatesGroup = {
  wpId: number;
  keep: WpEntry;
  remove: WpEntry[];
};

const parseArgs = (): CleanupOptions => {
  const execute: boolean = process.argv.includes("--execute");
  return { execute };
};

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.length) {
    const parsed: number = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const getWpIdFromFields = (fields: Record<string, unknown> | undefined): number | null => {
  if (!fields) {
    return null;
  }
  const localized: unknown = (fields.wpId as { "en-US"?: unknown } | undefined)?.["en-US"];
  return asNumber(localized);
};

const normalizeEntry = (item: { sys: { id: string; version?: number; updatedAt?: string; publishedVersion?: number }; fields?: Record<string, unknown> }): WpEntry | null => {
  const wpId: number | null = getWpIdFromFields(item.fields);
  if (wpId === null) {
    return null;
  }
  const version: number = item.sys.version ?? 1;
  const updatedAt: string = item.sys.updatedAt ?? "";
  const publishedVersion: number | null = typeof item.sys.publishedVersion === "number" ? item.sys.publishedVersion : null;
  return { id: item.sys.id, version, updatedAt, publishedVersion, wpId };
};

const groupDuplicates = (entries: WpEntry[]): DuplicatesGroup[] => {
  const byWpId: Record<number, WpEntry[]> = {};
  for (const entry of entries) {
    byWpId[entry.wpId] = [...(byWpId[entry.wpId] ?? []), entry];
  }
  const groups: DuplicatesGroup[] = [];
  for (const [wpIdRaw, list] of Object.entries(byWpId)) {
    if (list.length < 2) {
      continue;
    }
    const sorted: WpEntry[] = [...list].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    const keep: WpEntry = sorted[0];
    const remove: WpEntry[] = sorted.slice(1);
    groups.push({ wpId: Number(wpIdRaw), keep, remove });
  }
  return groups;
};

const cleanupContentType = async (client: ContentfulManagementClient, contentTypeId: string, options: CleanupOptions): Promise<number> => {
  const rawItems = await client.listEntriesByContentType(contentTypeId);
  const entries: WpEntry[] = rawItems.map((item) => normalizeEntry(item as unknown as { sys: { id: string; version?: number; updatedAt?: string; publishedVersion?: number }; fields?: Record<string, unknown> })).filter((x): x is WpEntry => x !== null);
  const groups: DuplicatesGroup[] = groupDuplicates(entries);
  let removedCount: number = 0;
  for (const group of groups) {
    for (const dup of group.remove) {
      const action: string = options.execute ? "DELETE" : "DRY";
      process.stdout.write(`${action} ${contentTypeId} wpId=${group.wpId} remove=${dup.id} keep=${group.keep.id}\n`);
      if (!options.execute) {
        continue;
      }
      let version: number = dup.version;
      if (dup.publishedVersion !== null) {
        try {
          version = await client.unpublishEntry(dup.id, version);
        } catch {
          version = dup.version;
        }
      }
      await client.deleteEntry(dup.id, version);
      removedCount += 1;
    }
  }
  return removedCount;
};

const run = async (): Promise<void> => {
  const options: CleanupOptions = parseArgs();
  await loadEnv();
  const config = getConfig();
  const client = new ContentfulManagementClient({
    spaceId: config.contentfulSpaceId,
    environment: config.contentfulEnvironment,
    managementToken: config.contentfulManagementToken,
  });
  const contentTypes: string[] = ["wpArticle", "wpPage", "wpCategory", "wpTag", "wpAuthor"];
  let removed: number = 0;
  for (const contentTypeId of contentTypes) {
    removed += await cleanupContentType(client, contentTypeId, options);
  }
  process.stdout.write(`Duplicates removed: ${removed}\n`);
};

run().catch((error: unknown) => {
  const message: string = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
