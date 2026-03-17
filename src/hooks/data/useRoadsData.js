import { useQuery } from "@tanstack/react-query";
import {getRoadsQuery} from "../../helpers/queryHelpers";
import { recursiveFetch } from "../../helpers/overpassService";
import { arrayofAPIs as api } from "../../constants/apis";
export function useRoadsData(city, options, setCurrentMirrorIndex, setFetchDuration) {
    const query = getRoadsQuery(city);
    
    return useQuery({
        queryKey: ["roads", city],
        queryFn: ({signal}) => {
            const start = performance.now();
            return recursiveFetch(api, query, 0, null, setCurrentMirrorIndex, signal, start, setFetchDuration)},
        retry: false,
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 10,
        ...options
    })
}