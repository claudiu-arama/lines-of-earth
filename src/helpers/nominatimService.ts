export const fetchCitySuggestions = async (inputQuery:string) => {
        if (!inputQuery) return;

        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputQuery)}&format=json&limit=5&addressdetails=1&accept-language=en`);
        if (!response.ok) throw new Error("Cannot establish secure connection to server");
        const data = await response.json();
        if (data.length === 0) throw new Error("No cities found.");
        return data.map(item => ({
            display_name: item.display_name,
            areaId: item.osm_type === "relation" ? parseInt(item.osm_id) + 3600000000 : parseInt(item.osm_id) + 2400000000,
            lat: item.lat,
            lon: item.lon,
            type: item.addresstype
        }));
    };