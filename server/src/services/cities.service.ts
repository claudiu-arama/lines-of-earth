import { AppError } from "../common/errors/AppError.ts";
import { isNonEmptyArray } from "../helpers/arrayHelpers.ts";
import { nominatimProvider } from "../providers/geocoding/nominatim.provider.ts";

export async function fetchCitySuggestions(query: string) {
  const results = await nominatimProvider.search(query, 10);

  // Empty results
  if (!isNonEmptyArray(results)) {
    throw new AppError({
      statusCode: 404,
      errorCode: "CITIES_NOT_FOUND",
      message: "No city suggestions found for the provided query."
    });
  }

  return results;
}
