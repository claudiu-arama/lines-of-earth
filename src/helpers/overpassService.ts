import { FETCH_TIMEOUT_MS} from "../constants/staticConstants";
export const recursiveFetch = async(urlArray, query, index = 0, lastError = null, setCurrentMirrorIndex, signal, start, setFetchDuration) => {
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
            headers: {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
            signal: combinedSignal
        });
        if (!response.ok) {
            throw new Error(`Server ${index} returned ${response.status}`);
        }
        const data = await response.json();
        if (!data.elements || data.elements.length === 0) {
            throw new Error(`Mirror ${index + 1} returned empty data`);
        }
        const end = (performance.now() - start).toFixed(2);
        setFetchDuration(end);
        return data;
    } catch (error) {
        if (error.name === "AbortError" && signal.aborted) throw error;
        if (index + 1 >= urlArray.length) {
             throw error;
        }
        return recursiveFetch(urlArray, query, index + 1, error, setCurrentMirrorIndex, signal, start, setFetchDuration);
    }
}
