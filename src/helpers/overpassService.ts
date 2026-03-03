export const recursiveFetch = async(urlArray, query, index = 0, lastError = null) => {
    const start = performance.now();
    if (index >= urlArray.length) {
        throw lastError || new Error("All servers failed");
    }
    try {
        const response = await fetch(urlArray[index], {
            method: "POST",
            body: "data=" + encodeURIComponent(query),
            headers: {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"}
        });
        const end = (performance.now() - start).toFixed(2);
        if (!response.ok) {
            throw new Error(`Server ${index} returned ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        if (index + 1 < urlArray.length) {
            return recursiveFetch(urlArray, query, index + 1, error);
        }
    }
}
