interface NominatimResult {}

export async function fetchCitySuggestions(query: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");

  url.searchParams.set("q", query);
}
