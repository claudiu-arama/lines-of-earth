interface RoadsQueryTarget {
  osm_id: number;
  osm_type: "node" | "way" | "relation";
  boundingbox: [string, string, string, string];
}

/**
 * Builds an Overpass API query to fetch roads, waterways, and landmarks for a given target.
 * @param target RoadsQueryTarget - The target object containing osm_id, osm_type, and bounding box.
 * @returns The Overpass API query string.
 */
export function buildRoadsQuery(target: RoadsQueryTarget): string {
  const areaId = getOverpassAreaId(target.osm_id, target.osm_type);

  let scope: string;
  let areaDeclaration = "";

  if (areaId) {
    scope = "area.searchArea";
    areaDeclaration = `area(${areaId})->.searchArea;`;
  } else {
    // Some results (e.g. certain Scottish cities) come back as a `node`
    // with no derivable area — fall back to a bounding box instead.
    const [minLat, maxLat, minLon, maxLon] = target.boundingbox;
    scope = `${minLat},${minLon},${maxLat},${maxLon}`;
  }

  return `
    [timeout:300][out:json];
    ${areaDeclaration}
    (
        ${highways(scope)}
        ${waterways(scope)}
        ${landmarks(scope)}
    );
    out geom qt;
  `;
}

// Helpers

const RELATION_AREA_ID_OFFSET = 3600000000;
const WAY_AREA_ID_OFFSET = 2400000000;

const getOverpassAreaId = (
  osmId: number,
  osmType: "node" | "way" | "relation"
): number | null => {
  if (osmType === "relation") {
    return osmId + RELATION_AREA_ID_OFFSET;
  }

  if (osmType === "way") {
    return osmId + WAY_AREA_ID_OFFSET;
  }

  // node → no derivable area, bbox fallback will be used
  return null;
};

const highways = (scope: string) => `
      way["highway"](${scope});
      way["junction"="roundabout"](${scope});
      way["railway"~"^(rail|subway|tram|light_rail|monorail|narrow_gauge|preserved|miniature)$"](${scope});
  `;

const landmarks = (scope: string) => `
      way["amenity"~"^(university|place_of_worship|townhall|town_hall|museum|hospital|library|theatre|cinema|arts_centre|funeral_hall|gym|information)$"](${scope});
      way["leisure"~"^(stadium|sports_centre|sports_center|amusement_park|zoo|park)$"](${scope});
      way["historic"~"^(castle|monument|archaeological_site)$"](${scope});
      way["tourism"~"^(attraction|artwork|museum)$"](${scope});
      way["building"~"^(university|cathedral|chapel|church|mosque|synagogue|temple|stadium|hospital|train_station|civic|government|museum|theatre)$"](${scope});
      relation["amenity"~"^(university|place_of_worship|townhall|town_hall|museum|hospital|library|theatre|cinema|arts_centre|funeral_hall|gym|information)$"](${scope});
      relation["leisure"~"^(stadium|sports_centre|sports_center|amusement_park|zoo|park)$"](${scope});
      relation["historic"~"^(castle|monument|archaeological_site)$"](${scope});
      relation["tourism"~"^(attraction|artwork|museum)$"](${scope});
  `;

const waterways = (scope: string) => `
      way["natural"~"^(water|bay|strait)$"](${scope});
      way["waterway"~"^(river|canal|stream|drain|ditch)$"](${scope});
      way["waterway"="riverbank"](${scope});
      way["landuse"~"^(reservoir|basin)$"](${scope});
      relation["natural"="water"](${scope});
      relation["type"="multipolygon"]["natural"="water"](${scope});
      relation["waterway"="riverbank"](${scope});
      relation["type"="multipolygon"]["waterway"="riverbank"](${scope});
  `;
