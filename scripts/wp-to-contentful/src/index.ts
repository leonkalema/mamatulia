import { getConfig } from "./config";
import { ContentfulManagementClient } from "./contentful/management-client";
import { ensureContentModel, importSnapshot } from "./importer";
import { writeRedirectsCsv } from "./redirects";
import { fetchAllWpContent } from "./wp/wp-client";
import { loadEnv } from "./env";

const run = async (): Promise<void> => {
  await loadEnv();
  const config = getConfig();
  const client = new ContentfulManagementClient({
    spaceId: config.contentfulSpaceId,
    environment: config.contentfulEnvironment,
    managementToken: config.contentfulManagementToken,
  });
  await ensureContentModel(client);
  const snapshot = await fetchAllWpContent({
    wordpressBaseUrl: config.wordpressBaseUrl,
    perPage: config.wordpressPerPage,
  });
  const result = await importSnapshot({ client, snapshot });
  await writeRedirectsCsv("./scripts/wp-to-contentful/redirects.csv", result.redirects);
  process.stdout.write(`Imported ${result.redirects.length} redirects\n`);
};

run().catch((error: unknown) => {
  const message: string = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
