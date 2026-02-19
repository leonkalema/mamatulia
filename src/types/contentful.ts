import type { Entry, EntrySkeletonType } from "contentful";

export type ContentfulAsset = {
  readonly url: string;
  readonly title: string;
  readonly description?: string;
  readonly width?: number;
  readonly height?: number;
};

export type SiteSettings = {
  readonly siteName: string;
  readonly logo: ContentfulAsset;
  readonly footerText: string;
  readonly address: string;
  readonly phone: string;
  readonly email: string;
  readonly socialLinks: readonly SocialLink[];
  readonly donationLink: string;
};

export type SocialLink = {
  readonly platform: "facebook" | "instagram" | "twitter" | "youtube" | "linkedin";
  readonly url: string;
};

export type Page = {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly ogImage?: ContentfulAsset;
  readonly heroTitle?: string;
  readonly heroSubtitle?: string;
  readonly heroImage?: ContentfulAsset;
  readonly sections: readonly Section[];
  readonly publishedDate?: string;
};

export type SectionType =
  | "richText"
  | "imageGallery"
  | "stats"
  | "cta"
  | "embedVideo"
  | "partnersStrip"
  | "teamGrid"
  | "testimonials";

export type Section = {
  readonly id: string;
  readonly type: SectionType;
  readonly heading?: string;
  readonly body?: string;
  readonly media?: readonly ContentfulAsset[];
  readonly ctaLabel?: string;
  readonly ctaLink?: string;
  readonly stats?: readonly Stat[];
};

export type Stat = {
  readonly label: string;
  readonly value: string;
  readonly icon?: string;
};

export type Post = {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly body: string;
  readonly coverImage?: ContentfulAsset;
  readonly authorName: string;
  readonly categories: readonly Category[];
  readonly publishedDate: string;
  readonly updatedAt: string;
};

export type Category = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
};

export type ProgramType = "whatWeDo" | "getInvolved" | "emergencyResponse";

export type Program = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly summary: string;
  readonly description: string;
  readonly programType: ProgramType;
  readonly featuredImage?: ContentfulAsset;
  readonly gallery?: GalleryAlbum;
  readonly relatedPosts?: readonly Post[];
  readonly donationCta?: CTA;
};

export type Story = {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly motherName?: string;
  readonly story: string;
  readonly location?: string;
  readonly images?: readonly ContentfulAsset[];
  readonly relatedProgram?: Program;
};

export type AlbumType = "photos" | "videos";

export type GalleryAlbum = {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly albumType: AlbumType;
  readonly items: readonly GalleryItem[];
};

export type GalleryItemType = "image" | "video";

export type GalleryItem = {
  readonly id: string;
  readonly title: string;
  readonly type: GalleryItemType;
  readonly image?: ContentfulAsset;
  readonly videoUrl?: string;
  readonly embedCode?: string;
  readonly caption?: string;
  readonly date?: string;
};

export type TeamMember = {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly bio?: string;
  readonly photo?: ContentfulAsset;
  readonly socialLinks?: readonly SocialLink[];
};

export type Partner = {
  readonly id: string;
  readonly name: string;
  readonly logo: ContentfulAsset;
  readonly website?: string;
  readonly sortOrder: number;
};

export type CTAStyle = "primary" | "secondary" | "outline" | "ghost";

export type CTA = {
  readonly id: string;
  readonly label: string;
  readonly url: string;
  readonly style: CTAStyle;
  readonly trackingId?: string;
};

export type WpAuthor = {
  readonly wpId: number;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
};

export type WpCategory = {
  readonly wpId: number;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
};

export type WpTag = {
  readonly wpId: number;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
};

export type WpArticle = {
  readonly wpId: number;
  readonly title: string;
  readonly slug: string;
  readonly date: string;
  readonly modified?: string;
  readonly excerptHtml?: string;
  readonly bodyHtml?: string;
  readonly bodyHtml2?: string;
  readonly bodyHtml3?: string;
  readonly bodyHtml4?: string;
  readonly featuredImage?: ContentfulAsset;
  readonly oldUrl?: string;
  readonly sourceUrl?: string;
  readonly author?: WpAuthor;
  readonly categories?: readonly WpCategory[];
  readonly tags?: readonly WpTag[];
};

export type ContentfulEntry<T> = Entry<EntrySkeletonType & { fields: T }>;

export type ProgramCategory = "Core Program" | "Support Program" | "Medical Initiative" | "Stories";

export type MamatuliaProgram = {
  readonly name: string;
  readonly slug: string;
  readonly summary: string;
  readonly description?: string;
  readonly image?: unknown;
  readonly category: ProgramCategory;
  readonly displayOrder?: number;
  readonly isActive?: boolean;
};

export type HomepageHero = {
  readonly tagline?: string;
  readonly headline: string;
  readonly subtext?: string;
  readonly heroImage?: unknown;
  readonly primaryButtonText?: string;
  readonly primaryButtonUrl?: string;
  readonly secondaryButtonText?: string;
  readonly secondaryButtonUrl?: string;
};

export type MamatuliaPartner = {
  readonly name: string;
  readonly slug: string;
  readonly logo?: unknown;
  readonly website?: string;
  readonly displayOrder?: number;
  readonly isActive?: boolean;
};

export type AboutPage = {
  readonly pageTitle: string;
  readonly heroSubtitle?: string;
  readonly heroImage?: ContentfulAsset;
  readonly missionTitle?: string;
  readonly missionText?: string;
  readonly missionImage?: ContentfulAsset;
  readonly visionTitle?: string;
  readonly visionText?: string;
  readonly valuesTitle?: string;
  readonly valuesText?: string;
  readonly stat1Value?: string;
  readonly stat1Label?: string;
  readonly stat2Value?: string;
  readonly stat2Label?: string;
  readonly stat3Value?: string;
  readonly stat3Label?: string;
  readonly stat4Value?: string;
  readonly stat4Label?: string;
  readonly ctaTitle?: string;
  readonly ctaDescription?: string;
};
