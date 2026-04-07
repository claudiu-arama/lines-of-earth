export const LAYER_KEYS = ['express', 'arterial', 'local', 'service', 'pedestrian', 'nature', 'transit', 'landmarks'];

export const LAYER_CONFIG = {
    landmarks:  { weight: 0.7, color: "red", minScale: 0.00070 },
    express:    { weight: 1.8, color: "#1a1a1a", minScale: 0.00000 },
    arterial:   { weight: 1.1, color: "#3d3d3d", minScale: 0.00005 },
    local:      { weight: 0.7, color: "#3d3d3d", minScale: 0.00020 },
    service:    { weight: 0.7, color: "#3d3d3d", minScale: 0.00060 },
    nature:     { weight: 0.7, color: "#3d3d3d", minScale: 0.00090 },
    pedestrian: { weight: 0.7, color: "#3d3d3d", minScale: 0.00120 },
    transit:    { weight: 0.7, color: "#3d3d3d", minScale: 0.00070 },
};

export const LAYER_MAPPING = {
    landmarks: [
       "university", "place_of_worship", "townhall", "stadium", 
    "castle", "museum", "amenity", "building", "hospital", "library", "theatre", "sports_centre", "archaeological_site",
     "monument", "castle", "cinema", "attraction", "park", "artwork", "funeral_hall", "garden", "fountain", "social_centre", "hotel", "arts_centre", "gym", "information", "community_centre"],
    express: ['motorway', 'motorway_link', 'trunk', 'trunk_link'],
    arterial: ['primary', 'primary_link', 'secondary', 'secondary_link'],
    local: ['tertiary', 'tertiary_link', 'residential', 'unclassified', 'living_street', 'road'],
    service: ['service', 'alley', 'services', 'driveway', 'passing_place'],
    pedestrian: ['footway', 'pedestrian', 'corridor', 'platform', 'sidewalk'],
    nature: ['path', 'steps', 'cycleway', 'track', 'bridleway', 'staircase'],
    // Transit acts as our fallback for anything not listed above
    transit: [] 
};

export const FRAME_CONFIG = {
    outerBorder: 20,
    mat: 40,
    innerBorder1: 6,
    innerGap: 4,
    innerBorder2: 3,
};