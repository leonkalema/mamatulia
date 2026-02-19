"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const parseNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const getConfig = () => {
    const wordpressBaseUrl = process.env.WORDPRESS_BASE_URL ?? "https://www.mamatulia.org";
    const wordpressPerPage = parseNumber(process.env.WORDPRESS_PER_PAGE ?? "100", 100);
    const contentfulSpaceId = process.env.CONTENTFUL_SPACE_ID;
    const contentfulEnvironment = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
    const contentfulManagementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
    if (!contentfulSpaceId) {
        throw new Error("Missing CONTENTFUL_SPACE_ID");
    }
    if (!contentfulManagementToken) {
        throw new Error("Missing CONTENTFUL_MANAGEMENT_TOKEN");
    }
    return {
        wordpressBaseUrl,
        wordpressPerPage,
        contentfulSpaceId,
        contentfulEnvironment,
        contentfulManagementToken,
    };
};
exports.getConfig = getConfig;
