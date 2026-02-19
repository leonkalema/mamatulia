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

  // Find large, landscape images suitable for a hero
  const candidates: Array<{ id: string; title: string; w: number; h: number; url: string }> = [];
  let skip = 0;

  while (true) {
    const batch = await environment.getAssets({ limit: 100, skip });
    for (const asset of batch.items) {
      const file = asset.fields.file?.["en-US"] as Record<string, unknown> | undefined;
      if (!file) continue;
      const contentType = file.contentType as string || "";
      if (!contentType.startsWith("image/")) continue;
      const details = file.details as Record<string, unknown> | undefined;
      const imageDetails = details?.image as Record<string, unknown> | undefined;
      const w = (imageDetails?.width as number) || 0;
      const h = (imageDetails?.height as number) || 0;
      const url = (file.url as string) || "";
      const title = asset.fields.title?.["en-US"] || "";
      // Hero needs: wide (landscape), high-res
      if (w >= 800 && h >= 400 && w > h) {
        candidates.push({ id: asset.sys.id, title, w, h, url });
      }
    }
    if (skip + batch.items.length >= batch.total) break;
    skip += 100;
  }

  // Sort by resolution (largest first)
  candidates.sort((a, b) => (b.w * b.h) - (a.w * a.h));

  // Filter for Mama Tulia related images (not logos, not generic)
  const keywords = ["mama", "tulia", "mother", "baby", "preemie", "hospital", "visit", "outreach", "photo", "img"];
  const relevant = candidates.filter((c) => {
    const search = `${c.title} ${c.url}`.toLowerCase();
    return keywords.some((k) => search.includes(k));
  });

  console.log(`Found ${candidates.length} landscape images total, ${relevant.length} relevant.\n`);
  console.log("=== TOP 15 RELEVANT HERO CANDIDATES ===\n");
  for (const c of relevant.slice(0, 15)) {
    console.log(`${c.id} | ${c.w}x${c.h} | "${c.title}" | https:${c.url}`);
  }
};

run().catch(console.error);
