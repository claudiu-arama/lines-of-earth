const USER_AGENT = "lines-of-earth/0.1 (contact@linesofearth.com)";

export const osmFetch = async (
  url: URL,
  init?: RequestInit
): Promise<Response> => {
  // Create a new Headers object from the provided init headers
  // or an empty object if none are provided
  const headers = new Headers(init?.headers);

  // Set the User-Agent header required for OSM API requests
  headers.set("User-Agent", USER_AGENT);

  const response = await fetch(url, {
    ...init,
    headers
  });

  return response;
};
