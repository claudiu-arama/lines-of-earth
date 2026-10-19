import { FETCH_TIMEOUT_MS } from "constants/staticConstants";

import type { CityData } from "../types/globals.types";
import type { QueryClient } from "@tanstack/react-query";

export const recursiveFetch = async (
  urlArray: string[],
  query: string,
  index = 0,
  lastError: Error | null,
  setMirrorIndex: React.Dispatch<React.SetStateAction<number | null>>,
  signal: AbortSignal,
  start: number,
  fetchDurationRef: React.RefObject<number | null>,
  queryClient: QueryClient,
  queryCity: CityData
): any => {
  if (index >= urlArray.length) {
    throw lastError || new Error("All servers failed");
  }
  const timeoutSignal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  const combinedSignal = AbortSignal.any([signal, timeoutSignal]);
  try {
    setMirrorIndex(index);
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
      console.warn(`Server ${index + 1} returned ${response.status}.`);
      throw new Error(`Server ${index + 1} returned ${response.status}`);
    }
    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      console.warn(`Mirror ${index + 1} returned empty data.`);
      throw new Error(`Mirror ${index + 1} returned empty data`);
    }
    const end = Math.round((performance.now() - start) * 100) / 100;
    fetchDurationRef.current = end;
    return data;
  } catch (error) {
    if ((error as Error | null)?.name === "AbortError" && signal.aborted)
      throw error;
    if (index + 1 >= urlArray.length) {
      // queryClient.removeQueries({ queryKey: ["roads", queryCity.areaId] });
      throw new Error("All servers failed");
    }
    return recursiveFetch(
      urlArray,
      query,
      index + 1,
      error as Error | null,
      setMirrorIndex as React.Dispatch<React.SetStateAction<number | null>>,
      signal,
      start,
      fetchDurationRef,
      queryClient,
      queryCity
    );
  }
};
