import { useQuery } from "@tanstack/react-query";
import { getRoadsQuery} from "../../helpers/queryHelpers";
import { recursiveFetch } from "../../helpers/overpassService";
import { arrayofAPIs as api } from "../../constants/apis";
import { useQueryClient } from "@tanstack/react-query";

export const useRoadsData = (queryCity, options, setCurrentMirrorIndex, setFetchDuration) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["roads", queryCity?.osm_id ?? null],
    queryFn: async ({ signal }) => {
      if (!queryCity) throw new Error("No city selected");
        return await recursiveFetch(
          api,
          getRoadsQuery(queryCity),
          0, null,
          setCurrentMirrorIndex,
          signal,
          performance.now(),
          setFetchDuration
        );
    },
      ...options,
    retry: false,
    throwOnError: false
  });
};