import type { ContentfulAsset, TeamMember } from "./contentful";

export type AboutPageValue = {
  readonly title: string;
  readonly description: string;
};

export type AboutPageStat = {
  readonly value: string;
  readonly label: string;
  readonly icon?: string;
};

export type AboutPage = {
  readonly title: string;
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly heroImage?: ContentfulAsset;
  readonly missionTitle: string;
  readonly missionBody: string;
  readonly missionImage?: ContentfulAsset;
  readonly vision: string;
  readonly values?: readonly AboutPageValue[];
  readonly stats?: readonly AboutPageStat[];
  readonly teamMembers?: readonly TeamMember[];
  readonly seoTitle?: string;
  readonly seoDescription?: string;
};
