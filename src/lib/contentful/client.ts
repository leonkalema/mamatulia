import { createClient } from "contentful";

const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const previewToken = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;

if (!space || !accessToken) {
  throw new Error("Contentful space ID and access token are required");
}

export const contentfulClient = createClient({
  space,
  accessToken,
  environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
});

export const contentfulPreviewClient = createClient({
  space,
  accessToken: previewToken || accessToken,
  environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
  host: "preview.contentful.com",
});

export function getClient(preview = false) {
  return preview ? contentfulPreviewClient : contentfulClient;
}
