import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

const RELEVANT_KEYWORDS = [
  "mama", "tulia", "hospital", "baby", "mother", "preemie",
  "visit", "home", "kangaroo", "neonatal", "care", "outreach",
  "gallery", "september", "IMG-2018", "IMG-2019",
];

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  console.log("=== FINDING RELEVANT MAMA TULIA IMAGES ===\n");

  const allAssets = [];
  let skip = 0;
  const limit = 100;

  while (true) {
    const batch = await environment.getAssets({ limit, skip });
    allAssets.push(...batch.items);
    if (allAssets.length >= batch.total) break;
    skip += limit;
  }

  console.log(`Total assets: ${allAssets.length}\n`);

  const relevant = allAssets.filter((asset) => {
    const title = (asset.fields.title?.["en-US"] || "").toLowerCase();
    const file = asset.fields.file?.["en-US"];
    const contentType = file?.contentType || "";
    if (!contentType.startsWith("image/")) return false;
    const fileName = (file?.fileName || "").toLowerCase();
    return RELEVANT_KEYWORDS.some(
      (kw) => title.includes(kw.toLowerCase()) || fileName.includes(kw.toLowerCase())
    );
  });

  console.log(`Relevant images: ${relevant.length}\n`);
  console.log("--- MAMA TULIA SPECIFIC PHOTOS ---");

  const mamaPhotos = relevant.filter((a) => {
    const title = (a.fields.title?.["en-US"] || "").toLowerCase();
    const fileName = (a.fields.file?.["en-US"]?.fileName || "").toLowerCase();
    return (
      title.includes("img-") ||
      title.includes("mama") ||
      title.includes("gallery") ||
      title.includes("september") ||
      fileName.includes("img-")
    );
  });

  mamaPhotos.forEach((asset) => {
    const title = asset.fields.title?.["en-US"] || "untitled";
    const file = asset.fields.file?.["en-US"];
    const url = file?.url || "";
    const details = file?.details as Record<string, unknown> | undefined;
    const imageDetails = details?.image as Record<string, unknown> | undefined;
    const width = imageDetails?.width || "?";
    const height = imageDetails?.height || "?";
    console.log(`  ID: ${asset.sys.id} | ${width}x${height} | "${title}" | https:${url}`);
  });

  console.log(`\nTotal Mama Tulia photos: ${mamaPhotos.length}`);

  console.log("\n--- LOGO ASSETS ---");
  const logos = relevant.filter((a) => {
    const title = (a.fields.title?.["en-US"] || "").toLowerCase();
    return title.includes("logo") || title.includes("mama tulia");
  });
  logos.forEach((asset) => {
    const title = asset.fields.title?.["en-US"] || "untitled";
    const url = asset.fields.file?.["en-US"]?.url || "";
    console.log(`  ID: ${asset.sys.id} | "${title}" | https:${url}`);
  });
};

run().catch(console.error);
