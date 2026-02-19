export type SiteConfig = {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly logo: string;
  readonly twitter: string;
};

export type NavItem = {
  readonly label: string;
  readonly href: string;
  readonly children?: readonly NavItem[];
};

export type SocialLink = {
  readonly platform: "facebook" | "instagram" | "twitter" | "youtube" | "linkedin";
  readonly url: string;
};

export type SEOProps = {
  readonly title?: string;
  readonly description?: string;
  readonly image?: string;
  readonly noIndex?: boolean;
  readonly canonical?: string;
};

export * from "./contentful";
export * from "./api";
