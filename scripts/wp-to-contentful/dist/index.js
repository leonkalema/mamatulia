"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const management_client_1 = require("./contentful/management-client");
const importer_1 = require("./importer");
const redirects_1 = require("./redirects");
const wp_client_1 = require("./wp/wp-client");
const env_1 = require("./env");
const run = async () => {
    await (0, env_1.loadEnv)();
    const config = (0, config_1.getConfig)();
    const client = new management_client_1.ContentfulManagementClient({
        spaceId: config.contentfulSpaceId,
        environment: config.contentfulEnvironment,
        managementToken: config.contentfulManagementToken,
    });
    await (0, importer_1.ensureContentModel)(client);
    const snapshot = await (0, wp_client_1.fetchAllWpContent)({
        wordpressBaseUrl: config.wordpressBaseUrl,
        perPage: config.wordpressPerPage,
    });
    const result = await (0, importer_1.importSnapshot)({ client, snapshot });
    await (0, redirects_1.writeRedirectsCsv)("./scripts/wp-to-contentful/redirects.csv", result.redirects);
    process.stdout.write(`Imported ${result.redirects.length} redirects\n`);
};
run().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
});
