import type { CitySuggestion } from "./cities.types.ts";

const NOMINATIM_SEARCH_DEFAULT_PARAMS = {
  format: "json",
  limit: "5",
  addressdetails: "1",
  "accept-language": "en"
};

export interface NominatimSearchResult {
  place_id: number;
  licence: string;
  osm_type: "node" | "way" | "relation";
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: {
    city?: string;
    "ISO3166-2-lvl4"?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: [string, string, string, string];
}

/**
 * Builds a Nominatim search URL with the provided query and optional limit.
 * @param query - The search query (city name).
 * @param limit - Optional limit for the number of results (default is 5).
 * @returns The constructed Nominatim URL.
 */
export function buildNominatimSearchUrl(query: string, limit?: number): URL {
  // Base URL for Nominatim search
  const url = new URL("https://nominatim.openstreetmap.org/search");

  // Merge default parameters with the provided query and limit
  const params = {
    ...NOMINATIM_SEARCH_DEFAULT_PARAMS,
    city: query,
    limit: limit?.toString() ?? NOMINATIM_SEARCH_DEFAULT_PARAMS.limit
  };

  // Set the query parameters in the URL
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  // Return the constructed URL
  return url;
}

/**
 * Parses the Nominatim search results into a list of city suggestions.
 * @param results - The Nominatim search results.
 * @returns An array of city suggestions.
 */
export function parseNominatimSearchResults(
  results: NominatimSearchResult[]
): CitySuggestion[] {
  return results.map((result) => ({
    place_id: result.place_id.toString()
  }));
}
