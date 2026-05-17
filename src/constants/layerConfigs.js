export const LAYER_KEYS = ['express', 'arterial', 'local', 'service', 'pedestrian', 'nature', 'transportation', 'landmarks', 'water', 'miscellaneous'];

export const LAYER_CONFIG = {
    water: { weight: 1.5, color: "#a8d4f5", minScale: 0.00020 },
    landmarks: { weight: 0.7, color: "red", minScale: 0.00070 },
    express: { weight: 1.8, color: "#1a1a1a", minScale: 0.00000 },
    arterial: { weight: 1.1, color: "#3d3d3d", minScale: 0.00005 },
    local: { weight: 0.7, color: "#3d3d3d", minScale: 0.00020 },
    service: { weight: 0.7, color: "#3d3d3d", minScale: 0.00060 },
    nature: { weight: 0.7, color: "#3d3d3d", minScale: 0.00090 },
    pedestrian: { weight: 0.7, color: "#3d3d3d", minScale: 0.00120 },
    transportation: { weight: 0.8, color: "#282530", minScale: 0.00040 },
    miscellaneous: { weight: 0.5, color: "#f7b5b5", minScale: 0.00120 },
    canvas: { color: "#fbffe7", minScale: 0.00070 }
};

export const LAYER_MAPPING = {
    water: ["water", "bay", "strait", "river", "canal",
        "stream", "drain", "ditch", "reservoir", "basin", "riverbank", "pond", "moat", "lake", "dock", "wastewater", "marina", "harbour", "aqueduct", "swimming_area"],
    landmarks: [
        "university", "place_of_worship", "townhall", "stadium",
        "castle", "museum", "amenity", "building", "hospital", "library", "theatre", "sports_centre", "archaeological_site",
        "monument", "cinema", "attraction", "park", "artwork", "funeral_hall", "garden", "fountain", "social_centre", "hotel", "arts_centre", "gym", "information", "community_centre", "railway_station", "train_station", "government"],
    express: ['motorway', 'motorway_link', 'trunk', 'trunk_link'],
    arterial: ['primary', 'primary_link', 'secondary', 'secondary_link'],
    local: ['tertiary', 'tertiary_link', 'residential', 'unclassified', 'living_street', 'road'],
    service: ['service', 'alley', 'services', 'driveway', 'passing_place'],
    pedestrian: ['footway', 'pedestrian', 'corridor', 'platform', 'sidewalk'],
    nature: ['path', 'steps', 'cycleway', 'track', 'bridleway', 'staircase'],
    transportation: ['rail', 'railway', 'subway', 'tram', 'light_rail', 'monorail', 'narrow_gauge', 'funicular', 'miniature', 'preserved', 'disused', 'abandoned'],
    miscellaneous: []
};

export const LAYER_MAPPING_SETS = Object.fromEntries(
  Object.entries(LAYER_MAPPING).map(([key, arr]) => [key, new Set(arr)])
);

export const FRAME_CONFIG = {
    outerBorder: 20,
    mat: 40,
    innerBorder1: 6,
    innerGap: 4,
    innerBorder2: 3,
};
//use this to remove unwanted roads
export const EXCLUDED_TYPES = new Set([
  "boat_ride",
]);

// helper set to force close "open" bodies of water
export const ENCLOSED_WATER_TYPES = new Set([
]);