import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  // Get the homepage entry and extract the full partner section HTML
  const entry = await environment.getEntry("1Ank4dgVuID1yj1InR513E");
  const bodyHtml = entry.fields.bodyHtml?.["en-US"] || "";
  const bodyHtml2 = entry.fields.bodyHtml2?.["en-US"] || "";
  const bodyHtml3 = entry.fields.bodyHtml3?.["en-US"] || "";
  const allHtml = [bodyHtml, bodyHtml2, bodyHtml3].join(" ");

  // Find "Our Partners" section and extract all image+alt combos
  const partnerIdx = allHtml.toLowerCase().indexOf("our partners");
  if (partnerIdx === -1) {
    console.log("No 'Our Partners' section found. Searching for 'partner'...");
    const idx2 = allHtml.toLowerCase().lastIndexOf("partner");
    if (idx2 > -1) {
      const section = allHtml.slice(Math.max(0, idx2 - 500), idx2 + 3000);
      console.log("\nHTML around 'partner':");
      console.log(section);
    }
    return;
  }

  const section = allHtml.slice(partnerIdx, partnerIdx + 5000);
  console.log("=== OUR PARTNERS SECTION HTML ===\n");
  console.log(section.slice(0, 3000));

  // Extract all img tags with src and alt
  const imgRegex = /<img[^>]*>/gi;
  const imgs = section.match(imgRegex) || [];
  console.log(`\n\n=== PARTNER IMAGES (${imgs.length}) ===\n`);
  for (const img of imgs) {
    const srcMatch = img.match(/src="([^"]+)"/i);
    const altMatch = img.match(/alt="([^"]*)"/i);
    const titleMatch = img.match(/title="([^"]*)"/i);
    console.log(`  src: ${srcMatch?.[1] || "none"}`);
    console.log(`  alt: ${altMatch?.[1] || "none"}`);
    if (titleMatch) console.log(`  title: ${titleMatch[1]}`);
    console.log();
  }

  // Also search for any "get-involved" or donate page that might list partners
  console.log("\n=== CHECKING GET-INVOLVED PAGE ===\n");
  const pages = await environment.getEntries({
    content_type: "wpPage",
    "fields.slug": "get-involved",
    limit: 1,
  });
  if (pages.items.length > 0) {
    const page = pages.items[0];
    const html = page.fields.bodyHtml?.["en-US"] || "";
    const partnerSection = html.toLowerCase().indexOf("partner");
    if (partnerSection > -1) {
      const pImgs = html.slice(partnerSection - 200, partnerSection + 2000).match(/<img[^>]*>/gi) || [];
      console.log(`Found ${pImgs.length} images near 'partner' in get-involved page`);
      for (const img of pImgs) {
        const srcMatch = img.match(/src="([^"]+)"/i);
        const altMatch = img.match(/alt="([^"]*)"/i);
        console.log(`  ${altMatch?.[1] || "no-alt"}: ${srcMatch?.[1] || "no-src"}`);
      }
    }
  }
};

run().catch(console.error);
