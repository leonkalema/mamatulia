export type ContentfulSys = {
  id: string;
  version?: number;
};

export type ContentfulResponse<TFields> = {
  sys: ContentfulSys;
  fields: TFields;
};

export type ContentfulLink = {
  sys: {
    type: "Link";
    linkType: "Entry";
    id: string;
  };
};

export type ContentfulAssetLink = {
  sys: {
    type: "Link";
    linkType: "Asset";
    id: string;
  };
};

export type LocalizedField<T> = {
  "en-US": T;
};
