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
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/\s+/g, " ")
    .trim();
};

const extractImageRefs = (html: string): string[] => {
  const refs: string[] = [];
  const srcMatches = html.match(/src="[^"]*"/gi) || [];
  for (const m of srcMatches) {
    refs.push(m.replace(/src="/i, "").replace(/"$/, ""));
  }
  return refs;
};

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  // 1. Get the home page entry
  console.log("=== HOME PAGE ENTRY 1Ank4dgVuID1yj1InR513E ===\n");
  const entry = await environment.getEntry("1Ank4dgVuID1yj1InR513E");
  console.log("Content type:", entry.sys.contentType?.sys?.id);
  console.log("Fields:", Object.keys(entry.fields).join(", "));

  for (const [key, value] of Object.entries(entry.fields)) {
    const val = (value as Record<string, unknown>)["en-US"];
    if (typeof val === "string" && val.length > 0) {
      const clean = stripHtml(val);
      const images = extractImageRefs(val);
      console.log(`\n--- ${key} ---`);
      if (clean.length > 0) {
        console.log(`Text (${clean.length} chars): ${clean.slice(0, 500)}`);
      }
      if (images.length > 0) {
        console.log(`Images: ${images.join("\n  ")}`);
      }
      // Look for partner-related keywords
      if (
        clean.toLowerCase().includes("partner") ||
        clean.toLowerCase().includes("unicef") ||
        clean.toLowerCase().includes("cure") ||
        clean.toLowerCase().includes("compassion") ||
        clean.toLowerCase().includes("komo")
      ) {
        console.log("*** PARTNER CONTENT FOUND ***");
        console.log("Full text:", clean);
      }
    } else if (val && typeof val === "object") {
      console.log(`\n--- ${key} (linked) ---`);
      console.log(JSON.stringify(val, null, 2).slice(0, 300));
    }
  }

  // 2. Search for partner logos in assets
  console.log("\n\n=== SEARCHING ASSETS FOR PARTNER LOGOS ===\n");
  const partnerKeywords = ["partner", "unicef", "cure", "egpaf", "compassion", "komo", "logo", "sponsor"];
  let skip = 0;
  const allAssets: Array<{ id: string; title: string; url: string }> = [];

  while (true) {
    const batch = await environment.getAssets({ limit: 100, skip });
    for (const asset of batch.items) {
      const title = asset.fields.title?.["en-US"] || "";
      const file = asset.fields.file?.["en-US"] as Record<string, unknown> | undefined;
      const url = (file?.url as string) || "";
      const fileName = (file?.fileName as string) || "";
      const searchText = `${title} ${fileName} ${url}`.toLowerCase();
      const isMatch = partnerKeywords.some((kw) => searchText.includes(kw));
      if (isMatch) {
        allAssets.push({ id: asset.sys.id, title, url });
      }
    }
    if (skip + batch.items.length >= batch.total) break;
    skip += 100;
  }

  console.log(`Found ${allAssets.length} potential partner/logo assets:`);
  for (const a of allAssets) {
    console.log(`  ${a.id} | "${a.title}" | ${a.url}`);
  }
};

run().catch(console.error);
