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

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  console.log("=== EXTRACTING PROGRAMS CONTENT ===\n");

  // 1. Check existing content types
  console.log("1. Listing all content types...");
  const contentTypes = await environment.getContentTypes();
  for (const ct of contentTypes.items) {
    console.log(`   - ${ct.sys.id}: "${ct.name}" (${ct.fields.length} fields)`);
  }

  // 2. Check if there's a "program" content type with entries
  console.log("\n2. Checking for 'program' content type entries...");
  try {
    const programEntries = await environment.getEntries({ content_type: "program", limit: 20 });
    console.log(`   Found ${programEntries.total} program entries:`);
    for (const entry of programEntries.items) {
      const name = entry.fields.name?.["en-US"] || entry.fields.title?.["en-US"] || "untitled";
      const slug = entry.fields.slug?.["en-US"] || "no-slug";
      console.log(`   - ID: ${entry.sys.id} | slug: "${slug}" | name: "${name}"`);
      console.log(`     Fields: ${Object.keys(entry.fields).join(", ")}`);
      // Show field values
      for (const [key, val] of Object.entries(entry.fields)) {
        const value = (val as Record<string, unknown>)["en-US"];
        if (typeof value === "string") {
          const clean = stripHtml(value);
          console.log(`     ${key}: "${clean.slice(0, 100)}${clean.length > 100 ? "..." : ""}"`);
        } else if (value && typeof value === "object") {
          console.log(`     ${key}: [object/link]`);
        }
      }
    }
  } catch {
    console.log("   No 'program' content type found");
  }

  // 3. Check wpArticle entries for program-related content
  console.log("\n3. Checking wpArticle entries for program-related content...");
  const wpEntries = await environment.getEntries({ content_type: "wpArticle", limit: 100 });
  console.log(`   Total wpArticle entries: ${wpEntries.total}`);
  const programKeywords = ["hospital", "home visit", "discipleship", "economic", "outreach", "program"];
  for (const entry of wpEntries.items) {
    const title = entry.fields.title?.["en-US"] || "";
    const slug = entry.fields.slug?.["en-US"] || "";
    const body = entry.fields.bodyHtml?.["en-US"] || "";
    const cleanBody = stripHtml(body);
    const isProgram = programKeywords.some(
      (kw) => title.toLowerCase().includes(kw) || slug.toLowerCase().includes(kw) || cleanBody.toLowerCase().includes(kw)
    );
    if (isProgram) {
      console.log(`\n   MATCH: "${title}" (slug: ${slug}, ID: ${entry.sys.id})`);
      console.log(`   Body preview: "${cleanBody.slice(0, 200)}..."`);
      console.log(`   Fields: ${Object.keys(entry.fields).join(", ")}`);
      // Check for featured image
      const featuredImage = entry.fields.featuredImage?.["en-US"];
      if (featuredImage) {
        console.log(`   Featured image: ${JSON.stringify(featuredImage)}`);
      }
    }
  }

  // 4. Check all page entries
  console.log("\n4. Checking 'page' content type entries...");
  try {
    const pageEntries = await environment.getEntries({ content_type: "page", limit: 20 });
    console.log(`   Found ${pageEntries.total} page entries:`);
    for (const entry of pageEntries.items) {
      const title = entry.fields.title?.["en-US"] || "untitled";
      const slug = entry.fields.slug?.["en-US"] || "no-slug";
      console.log(`   - ID: ${entry.sys.id} | slug: "${slug}" | title: "${title}"`);
    }
  } catch {
    console.log("   No 'page' content type found");
  }
};

run().catch(console.error);
