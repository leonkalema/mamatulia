/**
 * Contentful Migration Script: Create About Page Content Type
 * 
 * This script creates the `aboutPage` content type in Contentful.
 * 
 * Run with: npx ts-node scripts/contentful-migrations/create-about-page-type.ts
 * 
 * Required env vars:
 * - CONTENTFUL_SPACE_ID
 * - CONTENTFUL_MANAGEMENT_TOKEN (not the delivery token!)
 * - CONTENTFUL_ENVIRONMENT (optional, defaults to 'master')
 */

import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || "master";

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN");
  process.exit(1);
}

async function createAboutPageContentType() {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment(ENVIRONMENT);

  console.log("Creating aboutPage content type...");

  try {
    // Check if content type already exists
    try {
      const existing = await environment.getContentType("aboutPage");
      console.log("Content type 'aboutPage' already exists. Updating...");
      
      existing.name = "About Page";
      existing.description = "Content for the About Us page";
      existing.displayField = "title";
      existing.fields = getFields();
      
      const updated = await existing.update();
      await updated.publish();
      console.log("Content type updated and published!");
      return;
    } catch {
      // Content type doesn't exist, create it
    }

    const contentType = await environment.createContentTypeWithId("aboutPage", {
      name: "About Page",
      description: "Content for the About Us page",
      displayField: "title",
      fields: getFields(),
    });

    await contentType.publish();
    console.log("Content type 'aboutPage' created and published!");

  } catch (error) {
    console.error("Error creating content type:", error);
    process.exit(1);
  }
}

function getFields() {
  return [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
    },
    {
      id: "heroTitle",
      name: "Hero Title",
      type: "Symbol",
      required: true,
    },
    {
      id: "heroSubtitle",
      name: "Hero Subtitle",
      type: "Text",
      required: true,
    },
    {
      id: "heroImage",
      name: "Hero Image",
      type: "Link",
      linkType: "Asset",
      required: false,
    },
    {
      id: "missionTitle",
      name: "Mission Section Title",
      type: "Symbol",
      required: true,
    },
    {
      id: "missionBody",
      name: "Mission Body",
      type: "Text",
      required: true,
    },
    {
      id: "missionImage",
      name: "Mission Image",
      type: "Link",
      linkType: "Asset",
      required: false,
    },
    {
      id: "vision",
      name: "Vision Statement",
      type: "Text",
      required: true,
    },
    {
      id: "values",
      name: "Values",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["value"] }],
      },
      required: false,
    },
    {
      id: "stats",
      name: "Stats",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["stat"] }],
      },
      required: false,
    },
    {
      id: "teamMembers",
      name: "Team Members",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["teamMember"] }],
      },
      required: false,
    },
    {
      id: "seoTitle",
      name: "SEO Title",
      type: "Symbol",
      required: false,
    },
    {
      id: "seoDescription",
      name: "SEO Description",
      type: "Text",
      required: false,
    },
  ];
}

createAboutPageContentType();
