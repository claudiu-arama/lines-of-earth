export const recursiveFetch = async(urlArray, query, index = 0, lastError = null, setCurrentMirrorIndex, signal, start, setFetchDuration) => {
    if (index >= urlArray.length) {
        throw lastError || new Error("All servers failed");
    }
    try {
        setCurrentMirrorIndex(index);
        const response = await fetch(urlArray[index], {
            method: "POST",
            body: "data=" + encodeURIComponent(query),
            headers: {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
            signal
        });
        if (!response.ok) {
            throw new Error(`Server ${index} returned ${response.status}`);
        }
        const end = (performance.now() - start).toFixed(2);
        setFetchDuration(end);
        return await response.json();
    } catch (error) {
        if (index + 1 < urlArray.length) {
            return recursiveFetch(urlArray, query, index + 1, error, setCurrentMirrorIndex, signal, start, setFetchDuration);
        }
    }
}
