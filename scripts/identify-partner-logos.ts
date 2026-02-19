import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

const LOGO_ASSET_IDS = [
  "wpMedia-658", "wpMedia-659", "wpMedia-660", "wpMedia-661", "wpMedia-662",
  "wpMedia-2510", "wpMedia-2512", "wpMedia-2514", "wpMedia-2516", "wpMedia-2518",
  "wpMedia-2648", "wpMedia-2667", "wpMedia-2727", "wpMedia-2728", "wpMedia-2777",
];

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  console.log("=== PARTNER LOGO ASSETS ===\n");

  for (const id of LOGO_ASSET_IDS) {
    try {
      const asset = await environment.getAsset(id);
      const title = asset.fields.title?.["en-US"] || "untitled";
      const desc = asset.fields.description?.["en-US"] || "";
      const file = asset.fields.file?.["en-US"] as Record<string, unknown> | undefined;
      const url = (file?.url as string) || "";
      const fileName = (file?.fileName as string) || "";
      const details = file?.details as Record<string, unknown> | undefined;
      const imageDetails = details?.image as Record<string, unknown> | undefined;
      const width = imageDetails?.width || "?";
      const height = imageDetails?.height || "?";
      const size = details?.size || "?";

      console.log(`${id}`);
      console.log(`  Title: "${title}"`);
      console.log(`  File: ${fileName}`);
      console.log(`  Size: ${width}x${height} (${size} bytes)`);
      console.log(`  URL: https:${url}`);
      if (desc) console.log(`  Desc: ${desc}`);
      console.log();
    } catch {
      console.log(`${id}: NOT FOUND\n`);
    }
  }

  // Also check the homepage HTML for partner references
  console.log("\n=== HOMEPAGE HTML PARTNER SECTION ===\n");
  const entry = await environment.getEntry("1Ank4dgVuID1yj1InR513E");
  const bodyHtml = entry.fields.bodyHtml?.["en-US"] || "";
  const bodyHtml2 = entry.fields.bodyHtml2?.["en-US"] || "";
  const bodyHtml3 = entry.fields.bodyHtml3?.["en-US"] || "";
  const allHtml = [bodyHtml, bodyHtml2, bodyHtml3].join(" ");

  // Find the partner section
  const partnerIdx = allHtml.toLowerCase().indexOf("partner");
  if (partnerIdx > -1) {
    const partnerSection = allHtml.slice(Math.max(0, partnerIdx - 200), partnerIdx + 2000);
    // Extract image URLs near "partner"
    const imgMatches = partnerSection.match(/src="[^"]+"/gi) || [];
    console.log("Images near 'partner' text:");
    for (const m of imgMatches) {
      console.log(`  ${m}`);
    }
    // Extract alt texts
    const altMatches = partnerSection.match(/alt="[^"]*"/gi) || [];
    console.log("\nAlt texts near 'partner':");
    for (const m of altMatches) {
      console.log(`  ${m}`);
    }
  }
};

run().catch(console.error);
