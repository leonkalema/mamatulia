import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;
const CONTENT_TYPE_ID = "mamatuliaPartner";

const PARTNERS = [
  {
    name: "Mercy Health Foundation",
    slug: "mercy-health",
    logoAssetId: "wpMedia-2765",
    website: "",
    displayOrder: 1,
  },
  {
    name: "EFCNI Foundation",
    slug: "efcni-foundation",
    logoAssetId: "wpMedia-2792",
    website: "https://www.efcni.org",
    displayOrder: 2,
  },
  {
    name: "GLANCE",
    slug: "glance",
    logoAssetId: "wpMedia-2667",
    website: "",
    displayOrder: 3,
  },
  {
    name: "Compassion International",
    slug: "compassion-international",
    logoAssetId: "wpMedia-2730",
    website: "https://www.compassion.com",
    displayOrder: 4,
  },
  {
    name: "Robert Morris University",
    slug: "robert-morris-university",
    logoAssetId: "wpMedia-2648",
    website: "https://www.rmu.edu",
    displayOrder: 5,
  },
  {
    name: "KOMO Foundation",
    slug: "komo-foundation",
    logoAssetId: "wpMedia-2768",
    website: "",
    displayOrder: 6,
  },
];

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
      name: "Partner",
      displayField: "name",
      description: "A partner organization displayed on the homepage. Editors can add/remove partners and update logos.",
      fields: [
        {
          id: "name",
          name: "Partner Name",
          type: "Symbol",
          required: true,
          localized: false,
        },
        {
          id: "slug",
          name: "URL Slug",
          type: "Symbol",
          required: true,
          localized: false,
          validations: [{ unique: true }],
        },
        {
          id: "logo",
          name: "Logo",
          type: "Link",
          linkType: "Asset",
          required: true,
          localized: false,
          validations: [{ linkMimetypeGroup: ["image"] }],
        },
        {
          id: "website",
          name: "Website URL",
          type: "Symbol",
          required: false,
          localized: false,
        },
        {
          id: "displayOrder",
          name: "Display Order",
          type: "Integer",
          required: false,
          localized: false,
          validations: [{ range: { min: 1, max: 99 } }],
        },
        {
          id: "isActive",
          name: "Show on Website",
          type: "Boolean",
          required: false,
          localized: false,
        },
      ],
    });
    await ct.publish();
    console.log(`✅ Content type created and published.`);
  }

  // Step 2: Create partner entries
  console.log("\nCreating partner entries...\n");

  for (const partner of PARTNERS) {
    console.log(`📝 Creating: "${partner.name}"...`);

    const fields: Record<string, Record<string, unknown>> = {
      name: { "en-US": partner.name },
      slug: { "en-US": partner.slug },
      logo: {
        "en-US": {
          sys: { type: "Link", linkType: "Asset", id: partner.logoAssetId },
        },
      },
      displayOrder: { "en-US": partner.displayOrder },
      isActive: { "en-US": true },
    };

    if (partner.website) {
      fields.website = { "en-US": partner.website };
    }

    const entry = await environment.createEntry(CONTENT_TYPE_ID, { fields });
    await entry.publish();
    console.log(`   ✅ Created (ID: ${entry.sys.id})`);
  }

  console.log("\n🎉 All partners created!");
};

run().catch(console.error);
