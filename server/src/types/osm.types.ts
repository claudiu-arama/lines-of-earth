export const OSM_TYPES = ["node", "way", "relation"] as const;

export type OsmType = (typeof OSM_TYPES)[number];
