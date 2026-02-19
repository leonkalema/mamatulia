import type { MetadataRoute } from "next";
import { getWpArticles, getMamatuliaPrograms } from "@/services/contentful";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mamatulia.org";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/programs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  ];

  let storyPages: MetadataRoute.Sitemap = [];
  let programPages: MetadataRoute.Sitemap = [];

  try {
    const storiesResponse = await getWpArticles({ limit: 100 });
    if (!storiesResponse.error) {
      storyPages = storiesResponse.data.items.map((article) => ({
        url: `${baseUrl}/news/${article.slug}`,
        lastModified: new Date(article.date || Date.now()),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
    }

    const programsResponse = await getMamatuliaPrograms();
    if (!programsResponse.error && programsResponse.data) {
      programPages = programsResponse.data.items.map((program) => ({
        url: `${baseUrl}/programs/${program.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Contentful not configured yet — return static pages only
  }

  return [...staticPages, ...storyPages, ...programPages];
}
