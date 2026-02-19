import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

const createAboutPageContentType = async () => {
  if (!SPACE_ID || !MANAGEMENT_TOKEN) {
    console.error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN");
    process.exit(1);
  }

  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  console.log("Creating 'aboutPage' content type...");

  try {
    const existingType = await environment.getContentType("aboutPage");
    console.log("Content type 'aboutPage' already exists. Updating...");
    
    existingType.name = "About Page";
    existingType.description = "Content for the About Us page - easy to edit!";
    existingType.displayField = "pageTitle";
    existingType.fields = getFields();
    
    const updated = await existingType.update();
    await updated.publish();
    console.log("✅ Content type updated and published!");
  } catch {
    const contentType = await environment.createContentTypeWithId("aboutPage", {
      name: "About Page",
      description: "Content for the About Us page - easy to edit!",
      displayField: "pageTitle",
      fields: getFields(),
    });

    await contentType.publish();
    console.log("✅ Content type created and published!");
  }

  console.log("\nNow creating the About page entry...");
  await createAboutEntry(environment);
};

const getFields = () => [
  {
    id: "pageTitle",
    name: "Page Title",
    type: "Symbol",
    required: true,
    localized: false,
    validations: [{ size: { max: 100 } }],
  },
  {
    id: "heroSubtitle",
    name: "Hero Subtitle",
    type: "Symbol",
    required: false,
    localized: false,
    validations: [{ size: { max: 200 } }],
  },
  {
    id: "heroImage",
    name: "Hero Image",
    type: "Link",
    linkType: "Asset",
    required: false,
    localized: false,
  },
  {
    id: "missionTitle",
    name: "Mission Section Title",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "missionText",
    name: "Mission Text",
    type: "Text",
    required: false,
    localized: false,
    validations: [{ size: { max: 2000 } }],
  },
  {
    id: "missionImage",
    name: "Mission Section Image",
    type: "Link",
    linkType: "Asset",
    required: false,
    localized: false,
  },
  {
    id: "visionTitle",
    name: "Vision Section Title",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "visionText",
    name: "Vision Text",
    type: "Text",
    required: false,
    localized: false,
    validations: [{ size: { max: 2000 } }],
  },
  {
    id: "valuesTitle",
    name: "Values Section Title",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "valuesText",
    name: "Values Text",
    type: "Text",
    required: false,
    localized: false,
    validations: [{ size: { max: 2000 } }],
  },
  {
    id: "stat1Value",
    name: "Stat 1 - Value (e.g. 500+)",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "stat1Label",
    name: "Stat 1 - Label (e.g. Mothers Supported)",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "stat2Value",
    name: "Stat 2 - Value",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "stat2Label",
    name: "Stat 2 - Label",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "stat3Value",
    name: "Stat 3 - Value",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "stat3Label",
    name: "Stat 3 - Label",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "stat4Value",
    name: "Stat 4 - Value",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "stat4Label",
    name: "Stat 4 - Label",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "ctaTitle",
    name: "Call to Action Title",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "ctaDescription",
    name: "Call to Action Description",
    type: "Symbol",
    required: false,
    localized: false,
  },
];

const createAboutEntry = async (environment: any) => {
  try {
    const entries = await environment.getEntries({ content_type: "aboutPage", limit: 1 });
    
    if (entries.items.length > 0) {
      console.log("About page entry already exists. Updating...");
      const entry = entries.items[0];
      
      entry.fields = getDefaultContent();
      const updated = await entry.update();
      await updated.publish();
      console.log("✅ Entry updated and published!");
      return;
    }
  } catch {
    // Entry doesn't exist, create it
  }

  const entry = await environment.createEntry("aboutPage", {
    fields: getDefaultContent(),
  });

  await entry.publish();
  console.log("✅ Entry created and published!");
};

const getDefaultContent = () => ({
  pageTitle: { "en-US": "About Mama Tulia" },
  heroSubtitle: { "en-US": "Walking alongside mothers of premature babies with hope, care, and community." },
  missionTitle: { "en-US": "Transforming Lives Through Love" },
  missionText: { "en-US": `Mama Tulia is a Non-profit Organization dedicated to working with vulnerable mothers of premature babies by transforming the lives of mothers and their families through education, outreach, and care.

We walk alongside mothers of premature babies, providing emotional support, practical resources, and spiritual encouragement during their most challenging days. Our team visits hospitals and homes, offering preemie kits, counseling, and guidance to help families thrive.` },
  visionTitle: { "en-US": "A Future of Hope" },
  visionText: { "en-US": `We envision a Uganda where no mother faces the journey of premature birth alone. Through faith, community, and compassionate care, we are building a network of support that transforms lives and saves babies.` },
  valuesTitle: { "en-US": "Our Values" },
  valuesText: { "en-US": `Compassion, Faith, Community, Excellence, and Hope guide everything we do. We are committed to serving with love and integrity, honoring God in our work, and empowering mothers to become advocates for their families.` },
  stat1Value: { "en-US": "500+" },
  stat1Label: { "en-US": "Mothers Supported" },
  stat2Value: { "en-US": "1000+" },
  stat2Label: { "en-US": "Hospital Visits" },
  stat3Value: { "en-US": "50+" },
  stat3Label: { "en-US": "Home Visits Monthly" },
  stat4Value: { "en-US": "8+" },
  stat4Label: { "en-US": "Years of Service" },
  ctaTitle: { "en-US": "Join Our Mission" },
  ctaDescription: { "en-US": "Partner with us to support more preemie mothers and save more lives." },
});

createAboutPageContentType().catch(console.error);
