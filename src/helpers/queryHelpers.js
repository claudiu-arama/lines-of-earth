export const getRoadsQuery = (city) => {
    if (!city) return "";
    
const highways = `
    way["highway"](AREA);
    way["junction"="roundabout"](AREA);
    way["railway"~"^(rail|subway|tram|light_rail|monorail|narrow_gauge|preserved|miniature)$"](AREA);
  `;

const landmarks = `
    way["amenity"~"^(university|place_of_worship|townhall|town_hall|museum|hospital|library|theatre|cinema)$"](AREA);
    way["leisure"~"^(stadium|sports_centre|sports_center|amusement_park|zoo)$"](AREA);
    way["historic"~"^(castle|monument|archaeological_site)$"](AREA);
    relation["amenity"~"^(university|place_of_worship|townhall|town_hall|museum|hospital|library|theatre|cinema)$"](AREA);
    relation["leisure"~"^(stadium|sports_centre|sports_center|amusement_park|zoo)$"](AREA);
    relation["historic"~"^(castle|monument|archaeological_site)$"](AREA);
  `;

if (city?.areaId) {
    return `
      [timeout:300][out:json];
      area(${city.areaId})->.searchArea;
      (${highways.replaceAll("AREA", "area.searchArea")}
       ${landmarks.replaceAll("AREA", "area.searchArea")});
      out geom qt;
    `;
  }

// some scottish cities — fall back to bounding box.
// convert nominatim bbox to overpass bbox
const [minLat, maxLat, minLon, maxLon] = city.boundingbox;
const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;

return `
    [timeout:300][out:json];
    (${highways.replaceAll("AREA", bbox)}
     ${landmarks.replaceAll("AREA", bbox)});
    out geom;
  `;
};