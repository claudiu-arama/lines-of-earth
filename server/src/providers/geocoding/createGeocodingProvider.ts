import { AppError } from "../../common/errors/AppError.ts";
import { osmFetch } from "../../common/http/osmFetch.ts";

import type { GeocodingResponse, GeocodingResult } from "./geocoding.types.ts";

// Types

export interface GeocodingProvider {
  search: (query: string, limit?: number) => Promise<GeocodingResult[]>;
}

export interface GeocodingProviderConfig<TData> {
  name: string;
  baseUrl: string;
  searchPath: string;
  buildSearchParams: (query: string, limit?: number) => Record<string, string>;
  parseData?: (
    data: TData,
    query?: string,
    limit?: number
  ) => GeocodingResult[];
}

// Default parseData function
function defaultParseData(
  data: GeocodingResponse,
  query?: string,
  limit?: number
): GeocodingResult[] {
  if (!Array.isArray(data?.features)) {
    throw new Error(
      "Expected a GeoJSON FeatureCollection with a 'features' array."
    );
  }
  return data.features.map((feature) => ({
    osm_id: feature.properties.osm_id,
    city: feature.properties.city ?? feature.properties.name,
    country: feature.properties.country,
    name: feature.properties.name,
    geolocation: {
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0]
    }
  }));
}

/**
 * Creates a geocoding provider with the specified configuration.
 * @param config IGeocodingProviderConfig<TData> - The configuration for the geocoding provider.
 * @returns GeocodingProvider - The created geocoding provider.
 */
export function createGeocodingProvider<TData = GeocodingResponse>(
  config: GeocodingProviderConfig<TData>
): GeocodingProvider {
  const parseData = (config.parseData ?? defaultParseData) as (
    data: TData,
    query?: string,
    limit?: number
  ) => GeocodingResult[];

  return {
    async search(query, limit) {
      const url = new URL(config.searchPath, config.baseUrl);
      const params = config.buildSearchParams(query, limit);

      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }

      const response = await osmFetch(url);

      if (!response.ok) {
        throw new AppError({
          statusCode: 502,
          errorCode: "GEOCODING_PROVIDER_UNAVAILABLE",
          message: `Unable to reach ${config.name} API. Please try again later.`,
          details: { provider: config.name },
          expose: false
        });
      }

      const data = (await response.json()) as TData;

      try {
        return parseData(data, query, limit);
      } catch (error) {
        if (error instanceof AppError) throw error;

        throw new AppError({
          statusCode: 502,
          errorCode: "GEOCODING_PARSE_FAILED",
          message: `Failed to parse ${config.name} API response.`,
          details: {
            provider: config.name,
            cause: error instanceof Error ? error.message : error
          },
          expose: false
        });
      }
    }
  };
}
