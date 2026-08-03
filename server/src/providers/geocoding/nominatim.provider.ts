// Reference
// https://nominatim.org/release-docs/develop/api/Overview/
// https://nominatim.org/release-docs/develop/api/Output/#geocodejson

import { AppError } from "../../common/errors/AppError.ts";

import { createGeocodingProvider } from "./createGeocodingProvider.ts";

// Types

export interface NominatimGeocodingProperties {
  place_id: number;
  osm_type: "node" | "way" | "relation";
  osm_id: number;
  osm_key: string;
  osm_value: string;
  type: string;
  label: string;
  name: string;
  country?: string;
  country_code?: string;
}

export interface NominatimFeature {
  type: "Feature";
  properties: {
    geocoding: NominatimGeocodingProperties;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface NominatimSearchResponse {
  type: "FeatureCollection";
  features: NominatimFeature[];
}

// Defaults
export const NOMINATIM_SEARCH_DEFAULT_PARAMS = {
  format: "geocodejson",
  featureType: "city",
  limit: "5",
  addressdetails: "1",
  "accept-language": "en"
};

// Provider
export const nominatimProvider =
  createGeocodingProvider<NominatimSearchResponse>({
    name: "nominatim",
    baseUrl: "https://nominatim.openstreetmap.org",
    searchPath: "/search",
    buildSearchParams: (query: string, limit?: number) => ({
      q: query,
      format: NOMINATIM_SEARCH_DEFAULT_PARAMS.format,
      featureType: NOMINATIM_SEARCH_DEFAULT_PARAMS.featureType,
      limit: limit?.toString() ?? NOMINATIM_SEARCH_DEFAULT_PARAMS.limit,
      addressdetails: NOMINATIM_SEARCH_DEFAULT_PARAMS.addressdetails,
      "accept-language": NOMINATIM_SEARCH_DEFAULT_PARAMS["accept-language"]
    }),
    parseData: (data, query, limit) => {
      console.log(
        "Nominatim parseData called with data:",
        query,
        limit,
        JSON.stringify(data, null, 2)
      );

      if (!Array.isArray(data?.features)) {
        throw new AppError({
          statusCode: 502,
          errorCode: "GEOCODING_PARSE_FAILED",
          message: "Expected a Nominatim geocodejson FeatureCollection.",
          details: { provider: "nominatim" },
          expose: false
        });
      }

      // featureType=city narrows Nominatim to the address layer, but still
      // includes sibling types like "district" -- filter to exact city matches.
      return data.features
        .filter((feature) => feature.properties.geocoding.type === "city")
        .map((feature) => ({
          place_id: feature.properties.geocoding.place_id.toString(),
          city: feature.properties.geocoding.name,
          country: feature.properties.geocoding.country ?? "",
          osm_id: feature.properties.geocoding.osm_id,
          geolocation: {
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0]
          }
        }));
    }
  });
