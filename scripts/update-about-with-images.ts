import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

// Good landscape photos from the migrated assets
// wpMedia-390: gallery photo (1024x683)
// wpMedia-391: september photo (1024x576)  
// wpMedia-1660: slider photo (1080x607) - looks like a group/event photo
// wpMedia-1454: WA photo (1080x607)
// wpMedia-17: WA photo from 2018

const MISSION_IMAGE_ID = "wpMedia-391";
const HERO_IMAGE_ID = "wpMedia-1660";

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  console.log("Fetching aboutPage entry...");
  const entries = await environment.getEntries({ content_type: "aboutPage", limit: 1 });

  if (entries.items.length === 0) {
    console.error("No aboutPage entry found!");
    process.exit(1);
  }

  const entry = entries.items[0];
  console.log("Found entry:", entry.sys.id);

  // Verify the assets exist
  console.log("\nVerifying assets...");
  const missionAsset = await environment.getAsset(MISSION_IMAGE_ID);
  console.log(`Mission image: "${missionAsset.fields.title?.["en-US"]}" (${MISSION_IMAGE_ID})`);

  const heroAsset = await environment.getAsset(HERO_IMAGE_ID);
  console.log(`Hero image: "${heroAsset.fields.title?.["en-US"]}" (${HERO_IMAGE_ID})`);

  // Link images to the entry
  entry.fields.missionImage = {
    "en-US": {
      sys: { type: "Link", linkType: "Asset", id: MISSION_IMAGE_ID },
    },
  };

  entry.fields.heroImage = {
    "en-US": {
      sys: { type: "Link", linkType: "Asset", id: HERO_IMAGE_ID },
    },
  };

  console.log("\nUpdating entry with image links...");
  const updated = await entry.update();

  console.log("Publishing...");
  await updated.publish();

  console.log("\n✅ About page entry updated with real Mama Tulia images!");
  console.log(`   Hero image: ${HERO_IMAGE_ID}`);
  console.log(`   Mission image: ${MISSION_IMAGE_ID}`);
};

run().catch(console.error);
