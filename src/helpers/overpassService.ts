import { FETCH_TIMEOUT_MS } from "constants/staticConstants";

// TODO: replace `any` with proper types
export const recursiveFetch = async (
  urlArray: any,
  query: any,
  index = 0,
  lastError: any = null,
  setCurrentMirrorIndex: any,
  signal: any,
  start: any,
  setFetchDuration: any,
  queryClient: any,
  queryCity: any
): Promise<any> => {
  if (index >= urlArray.length) {
    throw lastError || new Error("All servers failed");
  }
  const timeoutSignal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  const combinedSignal = AbortSignal.any([signal, timeoutSignal]);
  try {
    setCurrentMirrorIndex(index);
    const response = await fetch(urlArray[index], {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
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
    const end = (performance.now() - start).toFixed(2);
    setFetchDuration(end);
    return data;
  } catch (error) {
    // TODO: replace `any` with proper types
    if ((error as any).name === "AbortError" && signal.aborted) throw error;
    if (index + 1 >= urlArray.length) {
      queryClient.removeQueries({ queryKey: ["roads", queryCity.areaId] });
      throw new Error("All servers failed");
    }
    return recursiveFetch(
      urlArray,
      query,
      index + 1,
      error,
      setCurrentMirrorIndex,
      signal,
      start,
      setFetchDuration,
      queryClient,
      queryCity
    );
  }
};
