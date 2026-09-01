import type { QueryClient } from "@tanstack/react-query";

import { FETCH_TIMEOUT_MS } from "constants/staticConstants";

import type { CityDataInterface } from "./globals";

export const recursiveFetch = async (
  urlArray: string[],
  query: string,
  index = 0,
  lastError: Error | null = null,
  currentMirrorIndexRef: React.RefObject<number>,
  signal: AbortSignal,
  start: number,
  fetchDurationRef: React.RefObject<number | null>,
  queryClient: QueryClient,
  queryCity: CityDataInterface
): Promise<unknown> => {
  if (index >= urlArray.length) {
    throw lastError || new Error("All servers failed");
  }
  const timeoutSignal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  const combinedSignal = AbortSignal.any([signal, timeoutSignal]);
  try {
    currentMirrorIndexRef.current = index;
    const response = await fetch(urlArray[index], {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      },
      signal: combinedSignal
    });
    if (!response.ok) {
      throw new Error(`Server ${index + 1} returned ${response.status}`);
    }
    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      throw new Error(`Mirror ${index + 1} returned empty data`);
    }
    const end = Math.round((performance.now() - start) * 100) / 100;
    fetchDurationRef.current = end;
    return data;
  } catch (error) {
    if ((error as Error | null)?.name === "AbortError" && signal.aborted)
      throw error;
    if (index + 1 >= urlArray.length) {
      queryClient.removeQueries({ queryKey: ["roads", queryCity.areaId] });
      throw new Error("All servers failed");
    }
    return recursiveFetch(
      urlArray,
      query,
      index + 1,
      error as Error | null,
      currentMirrorIndexRef,
      signal,
      start,
      fetchDurationRef,
      queryClient,
      queryCity
    );
  }
};
