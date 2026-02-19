type ParsedContent = {
  readonly title: string;
  readonly sections: readonly ContentSection[];
};

type ContentSection = {
  readonly heading?: string;
  readonly paragraphs: readonly string[];
  readonly listItems?: readonly string[];
};

const stripTags = (html: string): string => {
  return html
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

const extractTextContent = (html: string): string[] => {
  const paragraphs: string[] = [];
  const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  
  for (const match of pMatches) {
    const text = stripTags(match);
    if (text.length > 10) {
      paragraphs.push(text);
    }
  }
  
  return paragraphs;
};

const extractHeadings = (html: string): string[] => {
  const headings: string[] = [];
  const hMatches = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi) || [];
  
  for (const match of hMatches) {
    const text = stripTags(match);
    if (text.length > 2) {
      headings.push(text);
    }
  }
  
  return headings;
};

export const parseWpHtml = (html: string): ParsedContent => {
  const headings = extractHeadings(html);
  const paragraphs = extractTextContent(html);
  
  const title = headings[0] || "About Us";
  
  const sections: ContentSection[] = [];
  let currentSection: ContentSection = { paragraphs: [] };
  
  for (const para of paragraphs) {
    if (para.length > 20) {
      currentSection = {
        ...currentSection,
        paragraphs: [...currentSection.paragraphs, para],
      };
    }
  }
  
  if (currentSection.paragraphs.length > 0) {
    sections.push(currentSection);
  }
  
  return { title, sections };
};

export const extractCleanText = (html: string): string => {
  const paragraphs = extractTextContent(html);
  return paragraphs.join("\n\n");
};
