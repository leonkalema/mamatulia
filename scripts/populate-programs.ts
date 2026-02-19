import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;
const CONTENT_TYPE_ID = "mamatuliaProgram";

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
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/\s+/g, " ")
    .trim();
};

// Map of wpPage slug -> image asset ID (picked from the 171 real Mama Tulia photos)
const IMAGE_MAP: Record<string, string> = {
  "hospital-visits": "wpMedia-17",   // IMG-20181020-WA0036 - hospital scene
  "home-visits": "wpMedia-21",       // IMG-20181020-WA0031 - home visit
  "discipleship-program": "wpMedia-122", // IMG-20181107-WA0028 - group gathering
  "economic-financial-development-skills": "wpMedia-130", // IMG-20181107-WA0038
  "outreaches": "wpMedia-391",       // september event photo
  "food-relief": "wpMedia-135",      // IMG-20181107-WA0045
  "purifier-project": "wpMedia-146", // IMG-20181107-WA0030
  "stories-of-preemie-moms": "wpMedia-2191", // IMG-20191117-WA0051
  "ropretinopathy-of-prematurity": "wpMedia-152", // IMG-20180921-WA0024
};

const CATEGORY_MAP: Record<string, string> = {
  "hospital-visits": "Core Program",
  "home-visits": "Core Program",
  "discipleship-program": "Core Program",
  "economic-financial-development-skills": "Core Program",
  "outreaches": "Core Program",
  "food-relief": "Support Program",
  "purifier-project": "Support Program",
  "stories-of-preemie-moms": "Stories",
  "ropretinopathy-of-prematurity": "Medical Initiative",
};

const ORDER_MAP: Record<string, number> = {
  "hospital-visits": 1,
  "home-visits": 2,
  "discipleship-program": 3,
  "economic-financial-development-skills": 4,
  "outreaches": 5,
  "food-relief": 6,
  "purifier-project": 7,
  "ropretinopathy-of-prematurity": 8,
  "stories-of-preemie-moms": 9,
};

const PROGRAM_SLUGS = [
  "hospital-visits",
  "home-visits",
  "discipleship-program",
  "economic-financial-development-skills",
  "outreaches",
  "food-relief",
  "purifier-project",
  "stories-of-preemie-moms",
  "ropretinopathy-of-prematurity",
];

const extractSummary = (fullText: string, title: string): string => {
  // Remove the title from the beginning if present
  let text = fullText;
  const upperTitle = title.toUpperCase();
  if (text.toUpperCase().startsWith(upperTitle)) {
    text = text.slice(upperTitle.length).trim();
  }
  // Also remove duplicate title patterns like "DISCIPLESHIP PROGRAM DISCIPLESHIP PROGRAM"
  const words = title.split(/\s+/);
  const titlePattern = words.join("\\s+");
  const regex = new RegExp(`^${titlePattern}\\s*`, "i");
  text = text.replace(regex, "").trim();

  // Take first 2 sentences as summary
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const summary = sentences.slice(0, 2).join("").trim();
  return summary.length > 450 ? summary.slice(0, 447) + "..." : summary;
};

const extractDescription = (fullText: string, title: string): string => {
  let text = fullText;
  const upperTitle = title.toUpperCase();
  if (text.toUpperCase().startsWith(upperTitle)) {
    text = text.slice(upperTitle.length).trim();
  }
  const words = title.split(/\s+/);
  const titlePattern = words.join("\\s+");
  const regex = new RegExp(`^${titlePattern}\\s*`, "i");
  text = text.replace(regex, "").trim();

  // Remove trailing "Read More" type text
  text = text.replace(/\s*Read More\s*$/i, "").trim();

  return text;
};

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  // Fetch all wpPage entries
  const allPages = [];
  let skip = 0;
  while (true) {
    const batch = await environment.getEntries({ content_type: "wpPage", limit: 50, skip });
    allPages.push(...batch.items);
    if (allPages.length >= batch.total) break;
    skip += 50;
  }

  // Also check wpArticle (some program content might be there)
  const articles = await environment.getEntries({ content_type: "wpArticle", limit: 100 });
  allPages.push(...articles.items);

  console.log(`Found ${allPages.length} total entries to search through.\n`);

  for (const slug of PROGRAM_SLUGS) {
    const entry = allPages.find((e) => e.fields.slug?.["en-US"] === slug);
    if (!entry) {
      console.log(`❌ SKIPPED: No entry found for slug "${slug}"`);
      continue;
    }

    const title = entry.fields.title?.["en-US"] || "";
    const bodyHtml = entry.fields.bodyHtml?.["en-US"] || "";
    const bodyHtml2 = entry.fields.bodyHtml2?.["en-US"] || "";
    const bodyHtml3 = entry.fields.bodyHtml3?.["en-US"] || "";
    const fullText = stripHtml([bodyHtml, bodyHtml2, bodyHtml3].filter(Boolean).join(" "));

    if (fullText.length === 0) {
      console.log(`❌ SKIPPED: Empty content for "${title}" (${slug})`);
      continue;
    }

    // Clean up the title to proper case
    const cleanName = title
      .split(/\s+/)
      .map((w: string) => {
        if (w === "&" || w === "&#038;") return "&";
        if (w.length <= 3 && w === w.toUpperCase()) return w;
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(" ")
      .replace(/&#038;/g, "&")
      .replace(/\(retinopathy/i, "(Retinopathy")
      .replace(/of prematurity\)/i, "of Prematurity)");

    const summary = extractSummary(fullText, title);
    const description = extractDescription(fullText, title);
    const imageAssetId = IMAGE_MAP[slug];
    const category = CATEGORY_MAP[slug] || "Core Program";
    const order = ORDER_MAP[slug] || 99;

    // Use a cleaner slug for the new entry
    const cleanSlug = slug === "economic-financial-development-skills"
      ? "economic-development"
      : slug;

    console.log(`\n📝 Creating: "${cleanName}" (${cleanSlug})`);
    console.log(`   Category: ${category} | Order: ${order}`);
    console.log(`   Summary: "${summary.slice(0, 80)}..."`);
    console.log(`   Description: ${description.length} chars`);
    console.log(`   Image: ${imageAssetId || "none"}`);

    const fields: Record<string, Record<string, unknown>> = {
      name: { "en-US": cleanName },
      slug: { "en-US": cleanSlug },
      summary: { "en-US": summary },
      description: { "en-US": description },
      category: { "en-US": category },
      displayOrder: { "en-US": order },
      isActive: { "en-US": true },
    };

    if (imageAssetId) {
      fields.image = {
        "en-US": {
          sys: { type: "Link", linkType: "Asset", id: imageAssetId },
        },
      };
    }

    const newEntry = await environment.createEntry(CONTENT_TYPE_ID, { fields });
    await newEntry.publish();
    console.log(`   ✅ Created and published (ID: ${newEntry.sys.id})`);
  }

  console.log("\n🎉 All programs created!");
};

run().catch(console.error);
