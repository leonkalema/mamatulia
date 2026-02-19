type ContentTypeField = {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  localized?: boolean;
  validations?: unknown[];
  items?: unknown;
  linkType?: string;
};

type ContentTypeDefinition = {
  name: string;
  displayField: string;
  fields: ContentTypeField[];
};

const makeWpIdField = (): ContentTypeField => ({
  id: "wpId",
  name: "wpId",
  type: "Integer",
  required: true,
});

export const contentTypeDefinitions: Record<string, ContentTypeDefinition> = {
  wpAuthor: {
    name: "Author",
    displayField: "name",
    fields: [
      makeWpIdField(),
      { id: "name", name: "name", type: "Symbol", required: true },
      { id: "slug", name: "slug", type: "Symbol", required: true },
      { id: "description", name: "description", type: "Text" },
    ],
  },
  wpCategory: {
    name: "Category",
    displayField: "name",
    fields: [
      makeWpIdField(),
      { id: "name", name: "name", type: "Symbol", required: true },
      { id: "slug", name: "slug", type: "Symbol", required: true },
      { id: "description", name: "description", type: "Text" },
    ],
  },
  wpTag: {
    name: "Tag",
    displayField: "name",
    fields: [
      makeWpIdField(),
      { id: "name", name: "name", type: "Symbol", required: true },
      { id: "slug", name: "slug", type: "Symbol", required: true },
      { id: "description", name: "description", type: "Text" },
    ],
  },
  wpPage: {
    name: "Page",
    displayField: "title",
    fields: [
      makeWpIdField(),
      { id: "title", name: "title", type: "Symbol", required: true },
      { id: "slug", name: "slug", type: "Symbol", required: true },
      { id: "date", name: "date", type: "Date", required: true },
      { id: "modified", name: "modified", type: "Date" },
      { id: "bodyHtml", name: "bodyHtml", type: "Text" },
      { id: "bodyHtml2", name: "bodyHtml2", type: "Text" },
      { id: "bodyHtml3", name: "bodyHtml3", type: "Text" },
      { id: "bodyHtml4", name: "bodyHtml4", type: "Text" },
      { id: "excerptHtml", name: "excerptHtml", type: "Text" },
      { id: "featuredImage", name: "featuredImage", type: "Link", linkType: "Asset" },
      { id: "oldUrl", name: "oldUrl", type: "Symbol" },
      { id: "sourceUrl", name: "sourceUrl", type: "Symbol" },
      { id: "author", name: "author", type: "Link", linkType: "Entry" },
    ],
  },
  wpArticle: {
    name: "Article",
    displayField: "title",
    fields: [
      makeWpIdField(),
      { id: "title", name: "title", type: "Symbol", required: true },
      { id: "slug", name: "slug", type: "Symbol", required: true },
      { id: "date", name: "date", type: "Date", required: true },
      { id: "modified", name: "modified", type: "Date" },
      { id: "bodyHtml", name: "bodyHtml", type: "Text" },
      { id: "bodyHtml2", name: "bodyHtml2", type: "Text" },
      { id: "bodyHtml3", name: "bodyHtml3", type: "Text" },
      { id: "bodyHtml4", name: "bodyHtml4", type: "Text" },
      { id: "excerptHtml", name: "excerptHtml", type: "Text" },
      { id: "featuredImageUrl", name: "featuredImageUrl", type: "Symbol" },
      { id: "featuredImage", name: "featuredImage", type: "Link", linkType: "Asset" },
      { id: "oldUrl", name: "oldUrl", type: "Symbol" },
      { id: "sourceUrl", name: "sourceUrl", type: "Symbol" },
      { id: "author", name: "author", type: "Link", linkType: "Entry" },
      {
        id: "categories",
        name: "categories",
        type: "Array",
        items: { type: "Link", linkType: "Entry" },
      },
      {
        id: "tags",
        name: "tags",
        type: "Array",
        items: { type: "Link", linkType: "Entry" },
      },
    ],
  },
};

export const makeContentTypePayload = (definition: ContentTypeDefinition): unknown => ({
  name: definition.name,
  displayField: definition.displayField,
  fields: definition.fields,
});
