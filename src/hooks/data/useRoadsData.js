import { useQuery } from "@tanstack/react-query";

import { arrayofAPIs as api } from "constants/apis";
import { recursiveFetch } from "helpers/overpassService";
import { getRoadsQuery } from "helpers/queryHelpers";

export const useRoadsData = (
  queryCity,
  responseRoads,
  options,
  setCurrentMirrorIndex,
  setFetchDuration,
  queryClient
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
