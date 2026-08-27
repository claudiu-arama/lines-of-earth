import type { QueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { arrayofAPIs as api } from "constants/apis";
import { recursiveFetch } from "helpers/overpassService";
import { getRoadsQuery } from "helpers/queryHelpers";

// TODO: replace `any` with proper types
export const useRoadsData = (
  queryCity: any,
  responseRoads: any,
  options: any,
  currentMirrorIndexRef: React.RefObject<number>,
  fetchDurationRef: any,
  queryClient: QueryClient
) => {
  return useQuery({
    queryKey: ["roads", queryCity?.areaId ?? null],
    queryFn: async ({ signal }) => {
      if (!queryCity) throw new Error("No city selected");
      const rawResonse = await recursiveFetch(
        api,
        getRoadsQuery(queryCity),
        0,
        null,
        currentMirrorIndexRef,
        signal,
        performance.now(),
        fetchDurationRef,
        queryClient,
        queryCity
      );
      return responseRoads(rawResonse);
    },
    ...options,
    retry: false,
    throwOnError: false,
    structuralSharing: false
  });
};
