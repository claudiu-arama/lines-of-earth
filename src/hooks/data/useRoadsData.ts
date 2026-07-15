import { useQuery } from "@tanstack/react-query";

import { arrayofAPIs as api } from "constants/apis";
import { recursiveFetch } from "helpers/overpassService";
import { getRoadsQuery } from "helpers/queryHelpers";

// TODO: replace `any` with proper types
export const useRoadsData = (
  queryCity: any,
  responseRoads: any,
  options: any,
  setCurrentMirrorIndex: any,
  setFetchDuration: any,
  queryClient: any
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
        setCurrentMirrorIndex,
        signal,
        performance.now(),
        setFetchDuration,
        queryClient,
        queryCity
      );
      console.log(responseRoads);
      return responseRoads(rawResonse);
    },
    ...options,
    retry: false,
    throwOnError: false,
    structuralSharing: false
  });
};
