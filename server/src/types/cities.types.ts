import type { OsmType } from "./osm.types.ts";

export interface CitySuggestion {
  place_id?: string;
  osm_id: number;
  osm_type: OsmType;
  city: string;
  country: string;
  geolocation: IGeolocation;
}

export interface IGeolocation {
  lat: number;
  lon: number;
}
