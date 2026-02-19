import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;
const ABOUT_ENTRY_ID = "60LkQbqc7QMHRFkHyEiYBP";

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

const extractImageUrls = (html: string): string[] => {
  const urls: string[] = [];
  const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
  for (const match of imgMatches) {
    const srcMatch = match.match(/src=["']([^"']+)["']/i);
    if (srcMatch?.[1]) {
      urls.push(srcMatch[1]);
    }
  }
  return urls;
};

const extractParagraphs = (html: string): string[] => {
  const paragraphs: string[] = [];
  const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  for (const match of pMatches) {
    const text = stripHtml(match);
    if (text.length > 15) {
      paragraphs.push(text);
    }
  }
  return paragraphs;
};

const extractHeadings = (html: string): { level: number; text: string }[] => {
  const headings: { level: number; text: string }[] = [];
  const hMatches = html.match(/<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/gi) || [];
  for (const match of hMatches) {
    const levelMatch = match.match(/<h([1-6])/i);
    const text = stripHtml(match);
    if (text.length > 2 && levelMatch) {
      headings.push({ level: parseInt(levelMatch[1]), text });
    }
  }
  return headings;
};

const run = async () => {
  if (!SPACE_ID || !MANAGEMENT_TOKEN) {
    console.error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN");
    process.exit(1);
  }

  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  console.log("=== EXTRACTING ABOUT PAGE CONTENT ===\n");

  // 1. Get the old wpArticle entry
  console.log("1. Fetching old wpArticle entry (ID: " + ABOUT_ENTRY_ID + ")...\n");
  const entry = await environment.getEntry(ABOUT_ENTRY_ID);

  console.log("Entry fields available:", Object.keys(entry.fields));
  console.log("");

  // 2. Extract all body HTML fields
  const bodyHtml = entry.fields.bodyHtml?.["en-US"] || "";
  const bodyHtml2 = entry.fields.bodyHtml2?.["en-US"] || "";
  const bodyHtml3 = entry.fields.bodyHtml3?.["en-US"] || "";
  const bodyHtml4 = entry.fields.bodyHtml4?.["en-US"] || "";
  const allHtml = [bodyHtml, bodyHtml2, bodyHtml3, bodyHtml4].filter(Boolean).join("\n");

  console.log("2. HTML field lengths:");
  console.log("   bodyHtml:", bodyHtml.length, "chars");
  console.log("   bodyHtml2:", bodyHtml2.length, "chars");
  console.log("   bodyHtml3:", bodyHtml3.length, "chars");
  console.log("   bodyHtml4:", bodyHtml4.length, "chars");
  console.log("");

  // 3. Extract headings
  const headings = extractHeadings(allHtml);
  console.log("3. HEADINGS found:");
  headings.forEach((h, i) => console.log(`   ${i + 1}. [H${h.level}] ${h.text}`));
  console.log("");

  // 4. Extract paragraphs
  const paragraphs = extractParagraphs(allHtml);
  console.log("4. PARAGRAPHS found (" + paragraphs.length + "):");
  paragraphs.forEach((p, i) => console.log(`   ${i + 1}. ${p.slice(0, 120)}${p.length > 120 ? "..." : ""}`));
  console.log("");

  // 5. Extract image URLs
  const imageUrls = extractImageUrls(allHtml);
  console.log("5. IMAGE URLs found (" + imageUrls.length + "):");
  imageUrls.forEach((url, i) => console.log(`   ${i + 1}. ${url}`));
  console.log("");

  // 6. Check for linked assets
  console.log("6. Checking for linked assets in entry...");
  const featuredImage = entry.fields.featuredImage?.["en-US"];
  if (featuredImage) {
    console.log("   Featured image link:", JSON.stringify(featuredImage));
  } else {
    console.log("   No featured image linked");
  }
  console.log("");

  // 7. List ALL assets in the space to find relevant ones
  console.log("7. Searching for relevant assets in Contentful space...");
  const assets = await environment.getAssets({ limit: 100 });
  console.log(`   Found ${assets.total} total assets:`);
  for (const asset of assets.items) {
    const title = asset.fields.title?.["en-US"] || "untitled";
    const file = asset.fields.file?.["en-US"];
    const url = file?.url || "no-url";
    const contentType = file?.contentType || "unknown";
    if (contentType.startsWith("image/")) {
      console.log(`   - ID: ${asset.sys.id} | Title: "${title}" | URL: ${url}`);
    }
  }
  console.log("");

  // 8. Full clean text extraction
  console.log("8. FULL CLEAN TEXT:");
  console.log("---");
  const fullText = stripHtml(allHtml);
  console.log(fullText);
  console.log("---");
};

run().catch(console.error);
