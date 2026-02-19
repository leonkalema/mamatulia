export const SITE = {
  NAME: "Mama Tulia Ministries",
  DESCRIPTION: "Supporting preemie mothers and families through education, outreach, and care.",
  URL: process.env.NEXT_PUBLIC_SITE_URL || "https://mamatulia.org",
  TWITTER: "@mamatulia",
} as const;

export const CONTENTFUL = {
  CONTENT_TYPES: {
    PAGE: "page",
    POST: "post",
    CATEGORY: "category",
    PROGRAM: "mamatuliaProgram",
    STORY: "story",
    WP_ARTICLE: "wpArticle",
    GALLERY_ALBUM: "galleryAlbum",
    GALLERY_ITEM: "galleryItem",
    TEAM_MEMBER: "teamMember",
    PARTNER: "mamatuliaPartner",
    HOMEPAGE_HERO: "homepageHero",
    SITE_SETTINGS: "siteSettings",
    SECTION: "section",
    CTA: "cta",
  },
  DEFAULT_LOCALE: "en-US",
  INCLUDE_DEPTH: 3,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const CACHE = {
  REVALIDATE_SECONDS: 60,
  STATIC_PATHS_LIMIT: 50,
} as const;

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  WHAT_WE_DO: "/what-we-do",
  GET_INVOLVED: "/get-involved",
  NEWS: "/news",
  GALLERY: "/gallery",
  TEAM: "/team",
  CONTACT: "/contact",
  DONATE: "/get-involved/donate",
} as const;
