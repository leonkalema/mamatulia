import { createClient } from "contentful-management";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

const FIXES: Record<string, { summary: string; name?: string; description?: string }> = {
  "hospital-visits": {
    summary:
      "We visit hospitals across central and western Uganda to meet mothers and their premature babies in Neonatal Intensive Care Units. We provide preemie kits with essential supplies, compassionate support, and spiritual encouragement.",
  },
  "home-visits": {
    summary:
      "Our work doesn't stop at the hospital. We do follow-up visits at mothers' homes, helping them safely transition from hospital to home. We teach them how to care for their babies without nurses and incubators.",
  },
  "discipleship-program": {
    summary:
      "We care for every aspect of a mother's life — physical, financial, spiritual, and emotional. Through discipleship classes, mothers learn about the Bible, Godly principles, and are counseled and prayed with.",
  },
  "economic-development": {
    name: "Economic & Financial Development",
    summary:
      "Caring for a premature baby is costly — medical bills, medication, transport, and formula. Many mothers are young, abandoned, or in tough financial situations. We help through skills training and our Manna Program.",
  },
  "outreaches": {
    summary:
      "We reach out to communities across the country, focusing on pregnant women to raise awareness on prematurity and preterm birth prevention. We also provide Mama Kits to ensure safe and clean deliveries.",
  },
  "food-relief": {
    summary:
      "Through our Manna Program, Mama Tulia provides monthly food packages to mothers with premature babies. Nutrient-rich food helps mothers with breast milk production, which is essential for their preemie's growth.",
  },
  "purifier-project": {
    name: "Purifier Project — Gift of Safe Water",
    summary:
      "Access to safe water is a major challenge for people living in slums. Our mothers can't afford clean water, so they drink unpurified water that makes them and their babies sick. We provide water purifiers.",
  },
  "stories-of-preemie-moms": {
    summary:
      "Real stories from mothers who have walked the journey of premature birth. These testimonies share the challenges, hope, and transformation that come through Mama Tulia's support.",
  },
  "ropretinopathy-of-prematurity": {
    name: "ROP Screening — Retinopathy of Prematurity",
    summary:
      "Retinopathy of Prematurity (ROP) is an eye disorder in premature infants. Mama Tulia partners with Dr. Iddi Ndyabawe to provide free ROP screening at Kawempe National Referral Hospital.",
  },
};

const run = async () => {
  const client = createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  const entries = await environment.getEntries({
    content_type: "mamatuliaProgram",
    limit: 20,
  });

  console.log(`Found ${entries.total} program entries.\n`);

  for (const entry of entries.items) {
    const slug = entry.fields.slug?.["en-US"];
    const fix = FIXES[slug];
    if (!fix) {
      console.log(`⏭️  No fix needed for "${slug}"`);
      continue;
    }

    console.log(`📝 Fixing "${slug}"...`);

    if (fix.name) {
      entry.fields.name["en-US"] = fix.name;
    }
    entry.fields.summary["en-US"] = fix.summary;
    if (fix.description) {
      entry.fields.description["en-US"] = fix.description;
    }

    const updated = await entry.update();
    await updated.publish();
    console.log(`   ✅ Updated and published`);
  }

  console.log("\n🎉 All summaries fixed!");
};

run().catch(console.error);
