// Reference
// https://photon.komoot.io/

import { createGeocodingProvider } from "./createGeocodingProvider.ts";

import type { GeocodingResult } from "./geocoding.types.ts";

// Constants

const PHOTON_SEARCH_DEFAULT_PARAMS = {
  limit: "5",
  lang: "en"
};

// Types

export interface PhoneSearchResponse {
  type: "FeatureCollection";
  features: PhotonSearchFeature[];
}

export interface PhotonSearchFeature {
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

// Provider
export const photonProvider = createGeocodingProvider<PhoneSearchResponse>({
  name: "photon",
  baseUrl: "https://photon.komoot.io",
  searchPath: "/api",
  buildSearchParams: (query: string, limit?: number) => ({
    q: query,
    limit: limit?.toString() ?? PHOTON_SEARCH_DEFAULT_PARAMS.limit,
    lang: PHOTON_SEARCH_DEFAULT_PARAMS.lang
  }),
  parseData: (data: PhoneSearchResponse) => {
    return parsePhotonSearchResults(data.features);
  }
});

// Helper function to parse Photon search results
// into GeocodingResult format
function parsePhotonSearchResults(
  results: PhotonSearchFeature[]
): GeocodingResult[] {
  return results.map((result) => ({
    osm_id: result.properties.osm_id,
    osm_type: result.properties.osm_type,
    city: result.properties.city ?? result.properties.name,
    country: result.properties.country,
    name: result.properties.name,
    geolocation: {
      lat: result.geometry.coordinates[1],
      lon: result.geometry.coordinates[0]
    }
  }));
}
