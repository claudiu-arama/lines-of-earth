export const fetchCitySuggestions = async (inputQuery: string) => {
  if (!inputQuery) return;

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputQuery)}&format=json&limit=5&addressdetails=1&accept-language=en`
  );
  if (!response.ok) throw new Error("Cannot establish secure connection to server");

  const data = await response.json();
  if (data.length === 0) throw new Error("No cities found.");

  return data.map(item => {
    const id = parseInt(item.osm_id, 10);
    let areaId: number | null = null;

    if (item.osm_type === "relation") {
      areaId = id + 3600000000;
    } else if (item.osm_type === "way") {
      areaId = id + 2400000000;
    }
    // node → areaId stays null, bbox fallback will be used

    return {
      display_name: item.display_name,
      areaId,
      boundingbox: item.boundingbox, // [minlat, maxlat, minlon, maxlon]
      lat: item.lat,
      lon: item.lon,
      type: item.addresstype,
    };
  });
};