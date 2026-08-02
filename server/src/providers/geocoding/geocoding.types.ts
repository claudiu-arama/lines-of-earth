export interface GeocodingFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name: string;
    country: string;
    city?: string;
    state?: string;
    osm_id: number;
    osm_type: "node" | "way" | "relation";
  };
}

export interface GeocodingResponse {
  type: "FeatureCollection";
  features: GeocodingFeature[];
}

export interface GeocodingResult {
  place_id?: string;
  osm_id: number;
  city: string;
  country: string;
  geolocation: Geolocation;
}

export interface Geolocation {
  lat: number;
  lon: number;
}
