// Reference
// https://photon.komoot.io/

import { createGeocodingProvider } from "./createGeocodingProvider.ts";

import type { CitySuggestion } from "../../services/cities.types.ts";

const PHOTON_SEARCH_DEFAULT_PARAMS = {
  limit: "5",
  lang: "en"
};

export interface IPhoneSearchResponse {
  type: "FeatureCollection";
  features: IPhotonSearchFeature[];
}

export interface IPhotonSearchFeature {
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

export const photonProvider = createGeocodingProvider<IPhoneSearchResponse>({
  name: "photon",
  baseUrl: "https://photon.komoot.io",
  searchPath: "/api",
  buildSearchParams: (query: string, limit?: number) => ({
    q: query,
    limit: limit?.toString() ?? PHOTON_SEARCH_DEFAULT_PARAMS.limit,
    lang: PHOTON_SEARCH_DEFAULT_PARAMS.lang
  }),
  parseData: (data: IPhoneSearchResponse) => {
    return parsePhotonSearchResults(data.features);
  }
});

function parsePhotonSearchResults(
  results: IPhotonSearchFeature[]
): CitySuggestion[] {
  return results.map((result) => ({
    id: result.properties.osm_id.toString(),
    name: result.properties.name,
    geolocation: {
      lat: result.geometry.coordinates[1],
      lon: result.geometry.coordinates[0]
    }
  }));
}
