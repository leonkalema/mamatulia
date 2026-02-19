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

const extractImageIds = (html: string): string[] => {
  const ids: string[] = [];
  const matches = html.match(/wp-image-(\d+)/gi) || [];
  for (const m of matches) {
    const id = m.replace("wp-image-", "");
    ids.push(id);
  }
  return ids;
};

const PROGRAM_SLUGS = [
  "hospital-visits", "home-visits", "discipleship", "discipleship-program",
  "economic-financial-development", "outreaches", "community-outreaches",
  "food-relief", "purifier-project", "emergency-response",
  "stories-of-preemie-moms", "ropretinopathy-of-prematurity",
  "what-we-do", "programs", "get-involved",
];

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  console.log("=== ALL wpPage ENTRIES (full detail) ===\n");

  let skip = 0;
  const limit = 50;
  const allPages = [];

  while (true) {
    const batch = await environment.getEntries({ content_type: "wpPage", limit, skip });
    allPages.push(...batch.items);
    if (allPages.length >= batch.total) break;
    skip += limit;
  }

  console.log(`Total wpPage entries: ${allPages.length}\n`);

  // Show ALL pages with slug and title
  console.log("--- ALL PAGES ---");
  for (const entry of allPages) {
    const title = entry.fields.title?.["en-US"] || "untitled";
    const slug = entry.fields.slug?.["en-US"] || "no-slug";
    const body = entry.fields.bodyHtml?.["en-US"] || "";
    const cleanLen = stripHtml(body).length;
    console.log(`  ${entry.sys.id} | slug: "${slug}" | title: "${title}" | body: ${cleanLen} chars`);
  }

  // Now show full detail for program-related pages
  console.log("\n--- PROGRAM-RELATED PAGES (full content) ---");
  for (const entry of allPages) {
    const title = entry.fields.title?.["en-US"] || "untitled";
    const slug = entry.fields.slug?.["en-US"] || "no-slug";
    const isProgram = PROGRAM_SLUGS.some(
      (ps) => slug.includes(ps) || title.toLowerCase().includes(ps.replace("-", " "))
    );
    if (!isProgram) continue;

    console.log(`\n========================================`);
    console.log(`TITLE: "${title}"`);
    console.log(`SLUG: "${slug}"`);
    console.log(`ID: ${entry.sys.id}`);
    console.log(`FIELDS: ${Object.keys(entry.fields).join(", ")}`);

    const bodyHtml = entry.fields.bodyHtml?.["en-US"] || "";
    const bodyHtml2 = entry.fields.bodyHtml2?.["en-US"] || "";
    const bodyHtml3 = entry.fields.bodyHtml3?.["en-US"] || "";
    const excerpt = entry.fields.excerptHtml?.["en-US"] || "";

    const cleanBody = stripHtml([bodyHtml, bodyHtml2, bodyHtml3].filter(Boolean).join(" "));
    console.log(`\nCLEAN TEXT (${cleanBody.length} chars):`);
    console.log(cleanBody.slice(0, 800));
    if (cleanBody.length > 800) console.log(`... (${cleanBody.length - 800} more chars)`);

    const wpImageIds = extractImageIds([bodyHtml, bodyHtml2, bodyHtml3].join(" "));
    if (wpImageIds.length > 0) {
      console.log(`\nWP IMAGE IDs referenced: ${wpImageIds.join(", ")}`);
    }

    const featuredImage = entry.fields.featuredImage?.["en-US"];
    if (featuredImage) {
      const sys = featuredImage.sys;
      console.log(`FEATURED IMAGE: ${sys?.id || "unknown"}`);
    }
  }

  // Also check wpArticle for program-related content
  console.log("\n\n--- PROGRAM-RELATED wpArticle ENTRIES ---");
  const articles = await environment.getEntries({ content_type: "wpArticle", limit: 100 });
  for (const entry of articles.items) {
    const title = entry.fields.title?.["en-US"] || "untitled";
    const slug = entry.fields.slug?.["en-US"] || "no-slug";
    const isProgram = PROGRAM_SLUGS.some(
      (ps) => slug.includes(ps) || title.toLowerCase().includes(ps.replace("-", " "))
    );
    if (!isProgram) continue;

    console.log(`\n========================================`);
    console.log(`TITLE: "${title}"`);
    console.log(`SLUG: "${slug}"`);
    console.log(`ID: ${entry.sys.id}`);

    const bodyHtml = entry.fields.bodyHtml?.["en-US"] || "";
    const cleanBody = stripHtml(bodyHtml);
    console.log(`CLEAN TEXT (${cleanBody.length} chars):`);
    console.log(cleanBody.slice(0, 500));

    const featuredImage = entry.fields.featuredImage?.["en-US"];
    if (featuredImage) {
      console.log(`FEATURED IMAGE: ${featuredImage.sys?.id || "unknown"}`);
    }
  }
};

run().catch(console.error);
