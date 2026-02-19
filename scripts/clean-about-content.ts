import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;
const ABOUT_ENTRY_ID = "60LkQbqc7QMHRFkHyEiYBP";

const stripHtml = (html: string): string => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};

const extractParagraphs = (html: string): string[] => {
  const paragraphs: string[] = [];
  const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  
  for (const match of pMatches) {
    const text = stripHtml(match);
    if (text.length > 15 && !text.includes("Location:") && !text.includes("Email:") && !text.includes("Phone:")) {
      paragraphs.push(text);
    }
  }
  
  return paragraphs;
};

const cleanAboutContent = async () => {
  if (!SPACE_ID || !MANAGEMENT_TOKEN) {
    console.error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN");
    console.log("Please add CONTENTFUL_MANAGEMENT_TOKEN to your .env.local file");
    console.log("You can get it from: https://app.contentful.com/account/profile/cma_tokens");
    process.exit(1);
  }

  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  console.log("Fetching About page entry...");
  const entry = await environment.getEntry(ABOUT_ENTRY_ID);
  
  const currentBodyHtml = entry.fields.bodyHtml?.["en-US"] || "";
  console.log("\nCurrent bodyHtml length:", currentBodyHtml.length);
  
  const paragraphs = extractParagraphs(currentBodyHtml);
  console.log("\nExtracted paragraphs:");
  paragraphs.forEach((p, i) => console.log(`${i + 1}. ${p.slice(0, 100)}...`));

  const cleanContent = `<h2>About Mama Tulia</h2>

<p>Mama Tulia is a Non-profit Organization dedicated to working with vulnerable mothers of premature babies by transforming the lives of mothers and their families through education, outreach, and care.</p>

<h3>Our Mission</h3>

<p>We walk alongside mothers of premature babies, providing emotional support, practical resources, and spiritual encouragement during their most challenging days. Our team visits hospitals and homes, offering preemie kits, counseling, and guidance to help families thrive.</p>

<h3>What We Do</h3>

<p>Through our programs—Hospital Visits, Home Visits, Discipleship, Economic Development, and Community Outreaches—we reach hundreds of mothers each year across Uganda. We believe every mother deserves support, and every premature baby deserves a chance at life.</p>

<h3>Our Vision</h3>

<p>We envision a Uganda where no mother faces the journey of premature birth alone. Through faith, community, and compassionate care, we are building a network of support that transforms lives and saves babies.</p>

<h3>Our Values</h3>

<p>Compassion, Faith, Community, Excellence, and Hope guide everything we do. We are committed to serving with love and integrity, honoring God in our work, and empowering mothers to become advocates for their families.</p>`;

  console.log("\n\nNew clean content preview:");
  console.log(cleanContent.slice(0, 500) + "...");

  console.log("\n\nUpdating entry...");
  entry.fields.bodyHtml = { "en-US": cleanContent };
  
  const updatedEntry = await entry.update();
  console.log("Entry updated!");
  
  console.log("\nPublishing entry...");
  await updatedEntry.publish();
  console.log("Entry published!");
  
  console.log("\n✅ About page content cleaned successfully!");
};

cleanAboutContent().catch(console.error);
