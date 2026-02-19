import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;
const CONTENT_TYPE_ID = "mamatuliaProgram";

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  // Check if content type already exists
  try {
    const existing = await environment.getContentType(CONTENT_TYPE_ID);
    console.log(`Content type "${CONTENT_TYPE_ID}" already exists. Skipping creation.`);
    return;
  } catch {
    console.log(`Creating content type "${CONTENT_TYPE_ID}"...`);
  }

  const contentType = await environment.createContentTypeWithId(CONTENT_TYPE_ID, {
    name: "Program",
    displayField: "name",
    description: "A Mama Tulia program or initiative. Each entry represents one program shown on the Programs page.",
    fields: [
      {
        id: "name",
        name: "Program Name",
        type: "Symbol",
        required: true,
        localized: false,
        validations: [{ size: { max: 100 } }],
      },
      {
        id: "slug",
        name: "URL Slug",
        type: "Symbol",
        required: true,
        localized: false,
        validations: [{ unique: true }, { regexp: { pattern: "^[a-z0-9-]+$" } }],
      },
      {
        id: "summary",
        name: "Short Summary",
        type: "Text",
        required: true,
        localized: false,
        validations: [{ size: { max: 500 } }],
      },
      {
        id: "description",
        name: "Full Description",
        type: "Text",
        required: false,
        localized: false,
      },
      {
        id: "image",
        name: "Program Image",
        type: "Link",
        linkType: "Asset",
        required: false,
        localized: false,
        validations: [{ linkMimetypeGroup: ["image"] }],
      },
      {
        id: "category",
        name: "Category",
        type: "Symbol",
        required: true,
        localized: false,
        validations: [
          {
            in: ["Core Program", "Support Program", "Medical Initiative", "Stories"],
          },
        ],
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

  await contentType.publish();
  console.log(`✅ Content type "${CONTENT_TYPE_ID}" created and published.`);
};

run().catch(console.error);
