export type LabelSettings = {
  showCountryName: {
    enabled: boolean;
  };
  tagline: {
    enabled: boolean;
    text: string;
  };
  footnote: {
    enabled: boolean;
    text: string;
  };
};

export type LayerList = {
  [key: string]: boolean;
};
