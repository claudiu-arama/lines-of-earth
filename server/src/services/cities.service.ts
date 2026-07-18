import { AppError } from "../common/errors/AppError.ts";
import { osmFetch } from "../common/http/osmFetch.ts";
import { isNonEmptyArray } from "../helpers/arrayHelpers.ts";

import {
  buildNominatimSearchUrl,
  parseNominatimSearchResults
} from "./nominatim.provider.ts";

import type { NominatimSearchResult } from "./nominatim.provider.ts";

export async function fetchCitySuggestions(query: string) {
  const url = buildNominatimSearchUrl(query);

  const response = await osmFetch(url);

  // Provider unavailable
  if (!response.ok) {
    throw new AppError({
      statusCode: 502,
      errorCode: "CITIES_SERVICE_UNAVAILABLE",
      message: "Unable to reach Nominatim API. Please try again later.",
      details: { provider: "nominatim" },
      expose: false
    });
  }

  const data = (await response.json()) as NominatimSearchResult[];

  // Empty results
  if (!isNonEmptyArray(data)) {
    throw new AppError({
      statusCode: 404,
      errorCode: "CITIES_NOT_FOUND",
      message: "No city suggestions found for the provided query."
    });
  }

  return parseNominatimSearchResults(data);
}
