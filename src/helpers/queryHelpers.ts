// TODO: replace `any` with proper types
export const getRoadsQuery = (city: any) => {
  if (!city) return "";

  const highways = `
        way["highway"](AREA);
        way["junction"="roundabout"](AREA);
        way["railway"~"^(rail|subway|tram|light_rail|monorail|narrow_gauge|preserved|miniature)$"](AREA);
    `;

  const landmarks = `
        way["amenity"~"^(university|place_of_worship|townhall|town_hall|museum|hospital|library|theatre|cinema|arts_centre|funeral_hall|gym|information)$"](AREA);
        way["leisure"~"^(stadium|sports_centre|sports_center|amusement_park|zoo|park)$"](AREA);
        way["historic"~"^(castle|monument|archaeological_site)$"](AREA);
        way["tourism"~"^(attraction|artwork|museum)$"](AREA);
        way["building"~"^(university|cathedral|chapel|church|mosque|synagogue|temple|stadium|hospital|train_station|civic|government|museum|theatre)$"](AREA);
        relation["amenity"~"^(university|place_of_worship|townhall|town_hall|museum|hospital|library|theatre|cinema|arts_centre|funeral_hall|gym|information)$"](AREA);
        relation["leisure"~"^(stadium|sports_centre|sports_center|amusement_park|zoo|park)$"](AREA);
        relation["historic"~"^(castle|monument|archaeological_site)$"](AREA);
        relation["tourism"~"^(attraction|artwork|museum)$"](AREA);
    `;

  const waterways = `
        way["natural"~"^(water|bay|strait)$"](AREA);
        way["waterway"~"^(river|canal|stream|drain|ditch)$"](AREA);
        way["waterway"="riverbank"](AREA);
        way["landuse"~"^(reservoir|basin)$"](AREA);
        relation["natural"="water"](AREA);
        relation["type"="multipolygon"]["natural"="water"](AREA);
        relation["waterway"="riverbank"](AREA);
        relation["type"="multipolygon"]["waterway"="riverbank"](AREA);
    `;

  if (city?.areaId) {
    return `
        [timeout:300][out:json];
        area(${city.areaId})->.searchArea;
        (
            ${highways.replaceAll("AREA", "area.searchArea")}
            ${waterways.replaceAll("AREA", "area.searchArea")}
            ${landmarks.replaceAll("AREA", "area.searchArea")}
            );
            out geom qt;
            `;
  }

  // some scottish cities — fall back to bounding box.
  // convert nominatim bbox to overpass bbox
  const [minLat, maxLat, minLon, maxLon] = city.boundingbox;
  const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;

  return `
    [timeout:300][out:json];
    (
        ${highways.replaceAll("AREA", bbox)}
        ${landmarks.replaceAll("AREA", bbox)}
        ${waterways.replaceAll("AREA", bbox)}
    );
    out geom qt;
    `;
};
