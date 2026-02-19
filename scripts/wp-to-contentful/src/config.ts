export type AppConfig = {
  wordpressBaseUrl: string;
  wordpressPerPage: number;
  contentfulSpaceId: string;
  contentfulEnvironment: string;
  contentfulManagementToken: string;
};

const parseNumber = (value: string, fallback: number): number => {
  const parsed: number = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getConfig = (): AppConfig => {
  const wordpressBaseUrl: string = process.env.WORDPRESS_BASE_URL ?? "https://www.mamatulia.org";
  const wordpressPerPage: number = parseNumber(process.env.WORDPRESS_PER_PAGE ?? "100", 100);
  const contentfulSpaceId: string | undefined = process.env.CONTENTFUL_SPACE_ID;
  const contentfulEnvironment: string = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
  const contentfulManagementToken: string | undefined = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!contentfulSpaceId) {
    throw new Error("Missing CONTENTFUL_SPACE_ID");
  }
  if (!contentfulManagementToken) {
    throw new Error("Missing CONTENTFUL_MANAGEMENT_TOKEN");
  }
  return {
    wordpressBaseUrl,
    wordpressPerPage,
    contentfulSpaceId,
    contentfulEnvironment,
    contentfulManagementToken,
  };
};
