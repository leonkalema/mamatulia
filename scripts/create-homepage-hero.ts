import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;
const CONTENT_TYPE_ID = "homepageHero";

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  // Step 1: Create content type
  let contentTypeExists = false;
  try {
    await environment.getContentType(CONTENT_TYPE_ID);
    contentTypeExists = true;
    console.log(`Content type "${CONTENT_TYPE_ID}" already exists.`);
  } catch {
    console.log(`Creating content type "${CONTENT_TYPE_ID}"...`);
  }

  if (!contentTypeExists) {
    const ct = await environment.createContentTypeWithId(CONTENT_TYPE_ID, {
      name: "Homepage Hero",
      displayField: "headline",
      description: "The hero section on the homepage. Only one entry should exist. Editors can update headline, text, buttons, and hero image.",
      fields: [
        {
          id: "tagline",
          name: "Tagline",
          type: "Symbol",
          required: false,
          localized: false,
        },
        {
          id: "headline",
          name: "Headline",
          type: "Symbol",
          required: true,
          localized: false,
          validations: [{ size: { max: 120 } }],
        },
        {
          id: "subtext",
          name: "Supporting Text",
          type: "Text",
          required: false,
          localized: false,
          validations: [{ size: { max: 500 } }],
        },
        {
          id: "heroImage",
          name: "Hero Image",
          type: "Link",
          linkType: "Asset",
          required: false,
          localized: false,
          validations: [{ linkMimetypeGroup: ["image"] }],
        },
        {
          id: "primaryButtonText",
          name: "Primary Button Text",
          type: "Symbol",
          required: false,
          localized: false,
        },
        {
          id: "primaryButtonUrl",
          name: "Primary Button URL",
          type: "Symbol",
          required: false,
          localized: false,
        },
        {
          id: "secondaryButtonText",
          name: "Secondary Button Text",
          type: "Symbol",
          required: false,
          localized: false,
        },
        {
          id: "secondaryButtonUrl",
          name: "Secondary Button URL",
          type: "Symbol",
          required: false,
          localized: false,
        },
      ],
    });
    await ct.publish();
    console.log("✅ Content type created and published.");
  }

  // Step 2: Create the hero entry with current content
  console.log("\nCreating hero entry...");

  const entry = await environment.createEntry(CONTENT_TYPE_ID, {
    fields: {
      tagline: { "en-US": "Mama Tulia Ministries · Uganda" },
      headline: { "en-US": "Every preemie deserves a fighting chance" },
      subtext: {
        "en-US":
          "We walk alongside mothers of premature babies, providing care, hope, and the resources they need to help their little ones thrive.",
      },
      primaryButtonText: { "en-US": "Give a Preemie Kit" },
      primaryButtonUrl: { "en-US": "https://mamatulia.kindful.com" },
      secondaryButtonText: { "en-US": "Read Their Stories" },
      secondaryButtonUrl: { "en-US": "/news" },
    },
  });
  await entry.publish();
  console.log(`✅ Hero entry created (ID: ${entry.sys.id})`);
};

run().catch(console.error);
