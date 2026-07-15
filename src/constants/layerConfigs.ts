export const LAYER_KEYS = [
  "express",
  "arterial",
  "local",
  "service",
  "pedestrian",
  "nature",
  "transportation",
  "landmarks",
  "water",
  "miscellaneous"
];
export const MAP_PRESETS = {
  blueprint: {
    id: "blueprint",
    name: "Blueprint",
    config: {
      water: { weight: 1.5, color: "#7eb8d4", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#ffffff", minScale: 0.0007 },
      express: { weight: 2.0, color: "#ffffff", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#cce8f4", minScale: 0.00005 },
      local: { weight: 0.8, color: "#a8d4e8", minScale: 0.0002 },
      service: { weight: 0.6, color: "#7eb8d4", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#a8d4e8", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#7eb8d4", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#ffffff", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#5a9ab5", minScale: 0.0012 },
      canvas: { color: "#1a3a4a", minScale: 0.0007 }
    }
  },
  "ink-on-paper": {
    id: "ink-on-paper",
    name: "Ink on Paper",
    config: {
      water: { weight: 1.5, color: "#a8c8e8", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#c0392b", minScale: 0.0007 },
      express: { weight: 2.0, color: "#0a0a0a", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#1a1a1a", minScale: 0.00005 },
      local: { weight: 0.8, color: "#2c2c2c", minScale: 0.0002 },
      service: { weight: 0.6, color: "#3d3d3d", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#2d5a27", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#4a4a4a", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#1a1a1a", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#888888", minScale: 0.0012 },
      canvas: { color: "#f5f0e8", minScale: 0.0007 }
    }
  },
  "clean-white": {
    id: "clean-white",
    name: "Clean White",
    config: {
      water: { weight: 1.5, color: "#b8d4e8", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#e63946", minScale: 0.0007 },
      express: { weight: 2.0, color: "#111111", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#222222", minScale: 0.00005 },
      local: { weight: 0.8, color: "#333333", minScale: 0.0002 },
      service: { weight: 0.6, color: "#555555", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#4a7c59", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#666666", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#222222", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#999999", minScale: 0.0012 },
      canvas: { color: "#ffffff", minScale: 0.0007 }
    }
  },
  "warm-ivory": {
    id: "warm-ivory",
    name: "Warm Ivory",
    config: {
      water: { weight: 1.5, color: "#9bbfd4", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#b5451b", minScale: 0.0007 },
      express: { weight: 2.0, color: "#1a1008", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#2a1f10", minScale: 0.00005 },
      local: { weight: 0.8, color: "#3d3020", minScale: 0.0002 },
      service: { weight: 0.6, color: "#5a4a35", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#3d6b35", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#6b5a45", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#2a1f10", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#8a7a65", minScale: 0.0012 },
      canvas: { color: "#fdf6e3", minScale: 0.0007 }
    }
  },
  graphite: {
    id: "graphite",
    name: "Graphite",
    config: {
      water: { weight: 1.5, color: "#5b8fa8", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#e8c547", minScale: 0.0007 },
      express: { weight: 2.0, color: "#f0f0f0", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#d0d0d0", minScale: 0.00005 },
      local: { weight: 0.8, color: "#b0b0b0", minScale: 0.0002 },
      service: { weight: 0.6, color: "#909090", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#6b9e6b", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#808080", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#d0d0d0", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#606060", minScale: 0.0012 },
      canvas: { color: "#2a2a2a", minScale: 0.0007 }
    }
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    config: {
      water: { weight: 1.5, color: "#2a5f8f", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#f0a500", minScale: 0.0007 },
      express: { weight: 2.0, color: "#e8e8e8", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#c8c8c8", minScale: 0.00005 },
      local: { weight: 0.8, color: "#a0a0a0", minScale: 0.0002 },
      service: { weight: 0.6, color: "#707070", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#2d6e4e", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#606060", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#b0b0b0", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#505050", minScale: 0.0012 },
      canvas: { color: "#0f1923", minScale: 0.0007 }
    }
  },
  forest: {
    id: "forest",
    name: "Forest",
    config: {
      water: { weight: 1.5, color: "#4a8fa8", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#e8d5a3", minScale: 0.0007 },
      express: { weight: 2.0, color: "#f0ece0", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#d8d4c8", minScale: 0.00005 },
      local: { weight: 0.8, color: "#b8b4a8", minScale: 0.0002 },
      service: { weight: 0.6, color: "#989488", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#c8d8a0", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#888480", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#c8c4b8", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#787470", minScale: 0.0012 },
      canvas: { color: "#1e2d1e", minScale: 0.0007 }
    }
  },
  sepia: {
    id: "sepia",
    name: "Sepia",
    config: {
      water: { weight: 1.5, color: "#8aacb8", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#8b3a2a", minScale: 0.0007 },
      express: { weight: 2.0, color: "#2a1a0a", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#3a2a1a", minScale: 0.00005 },
      local: { weight: 0.8, color: "#5a4a3a", minScale: 0.0002 },
      service: { weight: 0.6, color: "#7a6a5a", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#5a7a3a", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#8a7a6a", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#4a3a2a", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#9a8a7a", minScale: 0.0012 },
      canvas: { color: "#f0e6d0", minScale: 0.0007 }
    }
  },
  "neon-city": {
    id: "neon-city",
    name: "Neon City",
    config: {
      water: { weight: 1.5, color: "#0a4a6e", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#ff2d78", minScale: 0.0007 },
      express: { weight: 2.0, color: "#00f0c0", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#00c8a0", minScale: 0.00005 },
      local: { weight: 0.8, color: "#008a70", minScale: 0.0002 },
      service: { weight: 0.6, color: "#006050", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#00a060", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#005040", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#00d8b0", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#004030", minScale: 0.0012 },
      canvas: { color: "#0a0a1a", minScale: 0.0007 }
    }
  },
  "dusty-rose": {
    id: "dusty-rose",
    name: "Dusty Rose",
    config: {
      water: { weight: 1.5, color: "#7aacc0", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#8b2252", minScale: 0.0007 },
      express: { weight: 2.0, color: "#1a0a10", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#2a1a20", minScale: 0.00005 },
      local: { weight: 0.8, color: "#4a3a40", minScale: 0.0002 },
      service: { weight: 0.6, color: "#6a5a60", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#5a6a3a", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#7a6a70", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#3a2a30", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#8a7a80", minScale: 0.0012 },
      canvas: { color: "#f5e8ec", minScale: 0.0007 }
    }
  },
  slate: {
    id: "slate",
    name: "Slate",
    config: {
      water: { weight: 1.5, color: "#4a7a9b", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#e8a020", minScale: 0.0007 },
      express: { weight: 2.0, color: "#e0e8f0", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#c0c8d0", minScale: 0.00005 },
      local: { weight: 0.8, color: "#90a0b0", minScale: 0.0002 },
      service: { weight: 0.6, color: "#607080", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#5a8a6a", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#506070", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#a0b0c0", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#405060", minScale: 0.0012 },
      canvas: { color: "#2a3540", minScale: 0.0007 }
    }
  },
  chalk: {
    id: "chalk",
    name: "Chalk",
    config: {
      water: { weight: 1.5, color: "#6a9ab8", minScale: 0.0002 },
      landmarks: { weight: 1.2, color: "#d4504a", minScale: 0.0007 },
      express: { weight: 2.0, color: "#f8f8f8", minScale: 0.0 },
      arterial: { weight: 1.3, color: "#e0e0e0", minScale: 0.00005 },
      local: { weight: 0.8, color: "#c8c8c8", minScale: 0.0002 },
      service: { weight: 0.6, color: "#a0a0a0", minScale: 0.0006 },
      nature: { weight: 0.8, color: "#88b888", minScale: 0.0009 },
      pedestrian: { weight: 0.6, color: "#909090", minScale: 0.0012 },
      transportation: { weight: 1.0, color: "#d0d0d0", minScale: 0.0004 },
      miscellaneous: { weight: 0.5, color: "#707070", minScale: 0.0012 },
      canvas: { color: "#1a1a2e", minScale: 0.0007 }
    }
  }
};
export const LAYER_MAPPING = {
  water: [
    "water",
    "bay",
    "strait",
    "river",
    "canal",
    "stream",
    "drain",
    "ditch",
    "reservoir",
    "basin",
    "riverbank",
    "pond",
    "moat",
    "lake",
    "dock",
    "wastewater",
    "marina",
    "harbour",
    "aqueduct",
    "swimming_area"
  ],
  landmarks: [
    "university",
    "place_of_worship",
    "townhall",
    "stadium",
    "castle",
    "museum",
    "amenity",
    "building",
    "hospital",
    "library",
    "theatre",
    "sports_centre",
    "archaeological_site",
    "monument",
    "cinema",
    "attraction",
    "park",
    "artwork",
    "funeral_hall",
    "garden",
    "fountain",
    "social_centre",
    "hotel",
    "arts_centre",
    "gym",
    "information",
    "community_centre",
    "railway_station",
    "train_station",
    "government"
  ],
  express: ["motorway", "motorway_link", "trunk", "trunk_link"],
  arterial: ["primary", "primary_link", "secondary", "secondary_link"],
  local: [
    "tertiary",
    "tertiary_link",
    "residential",
    "unclassified",
    "living_street",
    "road"
  ],
  service: ["service", "alley", "services", "driveway", "passing_place"],
  pedestrian: ["footway", "pedestrian", "corridor", "platform", "sidewalk"],
  nature: ["path", "steps", "cycleway", "track", "bridleway", "staircase"],
  transportation: [
    "rail",
    "railway",
    "subway",
    "tram",
    "light_rail",
    "monorail",
    "narrow_gauge",
    "funicular",
    "miniature",
    "preserved",
    "disused",
    "abandoned"
  ],
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
  innerBorder2: 3
};
//use this to remove unwanted roads
export const EXCLUDED_TYPES = new Set(["boat_ride"]);

// helper set to force close "open" bodies of water
export const ENCLOSED_WATER_TYPES = new Set([]);
