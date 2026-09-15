import type { OsmType } from "./osm.types.ts";

export interface RoadsQueryTarget {
  osm_id: number;
  osm_type: OsmType;
  boundingbox?: [string, string, string, string];
}

export interface OverpassResponse {
  elements: unknown[];
}
