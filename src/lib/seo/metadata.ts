import type { Metadata } from "next";

type MetadataProps = {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  canonical?: string;
};

 const DEFAULT_OG_IMAGE_URL: string =
   "https://images.ctfassets.net/ld5lxu1wipv6/wpMedia-2416/1f24559e31ebb0432e129a604a01046a/IMG_4143-scaled.jpg";

const siteConfig = {
  name: "Mama Tulia Ministries",
  description:
    "Supporting preemie mothers and families through education, outreach, and care.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://mamatulia.org",
  logo: "/images/Logo-Mamatulia-final.png",
  twitter: "@mamatulia",
} as const;

export function generateMetadata({
  title,
  description,
  image,
  noIndex = false,
  canonical,
}: MetadataProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const fullDescription = description || siteConfig.description;
  const ogImage = image || DEFAULT_OG_IMAGE_URL;

  return {
    title: fullTitle,
    description: fullDescription,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: fullTitle,
      description: fullDescription,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitter,
      title: fullTitle,
      description: fullDescription,
      images: [ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
    icons: {
      icon: "/favicon.ico",
      apple: siteConfig.logo,
    },
  };
}

export { siteConfig };
