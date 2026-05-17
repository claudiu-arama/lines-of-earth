import { useQuery } from "@tanstack/react-query";
import { getRoadsQuery} from "../../helpers/queryHelpers";
import { recursiveFetch } from "../../helpers/overpassService";
import { arrayofAPIs as api } from "../../constants/apis";

export const useRoadsData = (queryCity, options, setCurrentMirrorIndex, setFetchDuration, queryClient) => {
  return useQuery({
    queryKey: ["roads", queryCity?.areaId ?? null],
    queryFn: async ({ signal }) => {
      if (!queryCity) throw new Error("No city selected");
        return await recursiveFetch(
          api,
          getRoadsQuery(queryCity),
          0, null,
          setCurrentMirrorIndex,
          signal,
          performance.now(),
          setFetchDuration,
          queryClient,
          queryCity
        );
    },
      ...options,
    retry: false,
    throwOnError: false
  });
};