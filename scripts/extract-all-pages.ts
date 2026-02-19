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

  // Check ALL content types for entries
  const contentTypes = await environment.getContentTypes();

  for (const ct of contentTypes.items) {
    const entries = await environment.getEntries({ content_type: ct.sys.id, limit: 50 });
    if (entries.total === 0) continue;

    console.log(`\n=== ${ct.name} (${ct.sys.id}) — ${entries.total} entries ===`);
    for (const entry of entries.items) {
      const title =
        entry.fields.title?.["en-US"] ||
        entry.fields.name?.["en-US"] ||
        "untitled";
      const slug = entry.fields.slug?.["en-US"] || "no-slug";
      console.log(`\n  ID: ${entry.sys.id} | slug: "${slug}" | title: "${title}"`);
      console.log(`  Fields: ${Object.keys(entry.fields).join(", ")}`);

      for (const [key, val] of Object.entries(entry.fields)) {
        const value = (val as Record<string, unknown>)["en-US"];
        if (typeof value === "string" && value.length > 0) {
          const clean = stripHtml(value);
          if (clean.length > 0) {
            console.log(`  ${key}: "${clean.slice(0, 150)}${clean.length > 150 ? "..." : ""}"`);
          }
        } else if (Array.isArray(value)) {
          console.log(`  ${key}: [array, ${value.length} items]`);
        } else if (value && typeof value === "object") {
          const sys = (value as Record<string, unknown>).sys as Record<string, unknown> | undefined;
          if (sys?.type === "Link") {
            console.log(`  ${key}: [Link -> ${sys.linkType}:${sys.id}]`);
          } else {
            console.log(`  ${key}: [object]`);
          }
        }
      }
    }
  }
};

run().catch(console.error);
