export type WpRendered = {
  rendered: string;
  protected: boolean;
};

export type WpTerm = {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent?: number;
};

export type WpMedia = {
  id: number;
  date: string;
  slug: string;
  source_url: string;
  alt_text: string;
  title: WpRendered;
  media_type: string;
  mime_type: string;
};

export type WpUser = {
  id: number;
  name: string;
  slug: string;
  url?: string;
  description?: string;
};

export type WpEmbedded = {
  author?: WpUser[];
  "wp:featuredmedia"?: WpMedia[];
  "wp:term"?: Array<WpTerm[]>;
};

export type WpPost = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: "post";
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: WpEmbedded;
};

export type WpPage = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: "page";
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  author: number;
  featured_media: number;
  parent: number;
  _embedded?: WpEmbedded;
};
