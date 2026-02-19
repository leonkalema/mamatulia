import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

const stripHtml = (html: string): string => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};

const CORE_PROGRAM_SLUGS = [
  "hospital-visits",
  "home-visits",
  "discipleship-program",
  "economic-financial-development",
  "outreaches",
  "food-relief",
  "purifier-project",
  "stories-of-preemie-moms",
  "ropretinopathy-of-prematurity",
];

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  const allPages = [];
  let skip = 0;
  while (true) {
    const batch = await environment.getEntries({ content_type: "wpPage", limit: 50, skip });
    allPages.push(...batch.items);
    if (allPages.length >= batch.total) break;
    skip += 50;
  }

  // Also get wpArticle entries
  const articles = await environment.getEntries({ content_type: "wpArticle", limit: 100 });
  allPages.push(...articles.items);

  for (const slug of CORE_PROGRAM_SLUGS) {
    const entry = allPages.find((e) => e.fields.slug?.["en-US"] === slug);
    if (!entry) {
      console.log(`\n❌ NOT FOUND: ${slug}`);
      continue;
    }

    const title = entry.fields.title?.["en-US"] || "";
    const bodyHtml = entry.fields.bodyHtml?.["en-US"] || "";
    const bodyHtml2 = entry.fields.bodyHtml2?.["en-US"] || "";
    const bodyHtml3 = entry.fields.bodyHtml3?.["en-US"] || "";
    const allHtml = [bodyHtml, bodyHtml2, bodyHtml3].filter(Boolean).join(" ");
    const cleanText = stripHtml(allHtml);

    // Extract featured image
    const featuredImage = entry.fields.featuredImage?.["en-US"];
    const featuredImageId = featuredImage?.sys?.id || null;

    // Try to find image references in HTML
    const wpImageMatches = allHtml.match(/wp-content\/uploads\/[^"'\s)]+/gi) || [];

    console.log(`\n========================================`);
    console.log(`SLUG: ${slug}`);
    console.log(`TITLE: ${title}`);
    console.log(`ENTRY ID: ${entry.sys.id}`);
    console.log(`CONTENT TYPE: ${entry.sys.contentType?.sys?.id || "unknown"}`);
    console.log(`FEATURED IMAGE ASSET: ${featuredImageId || "none"}`);
    console.log(`WP IMAGE REFS: ${wpImageMatches.length > 0 ? wpImageMatches.slice(0, 3).join(", ") : "none"}`);
    console.log(`\nFULL CLEAN TEXT:`);
    console.log(cleanText);
    console.log(`\n(${cleanText.length} chars)`);
  }
};

run().catch(console.error);
