import type { OverpassConfig, OverpassInstance } from "./types.ts";

// Verify these mirrors and paths are still current before relying on them.
export const OVERPASS_INSTANCES: OverpassInstance[] = [
  {
    id: "overpass-de",
    name: "overpass-api.de",
    queryUrl: "https://overpass-api.de/api/interpreter",
    statusUrl: "https://overpass-api.de/api/status"
  },
  {
    id: "overpass-kumi",
    name: "overpass.kumi.systems",
    queryUrl: "https://overpass.kumi.systems/api/interpreter",
    statusUrl: "https://overpass.kumi.systems/api/status"
  },
  {
    id: "overpass-fr",
    name: "overpass.openstreetmap.fr",
    queryUrl: "https://overpass.openstreetmap.fr/api/interpreter",
    statusUrl: "https://overpass.openstreetmap.fr/api/status"
  }
];

export const OVERPASS_CONFIG: OverpassConfig = {
  raceSize: 2,
  requestTimeoutMs: 25000,
  probeTimeoutMs: 5000,
  failureThreshold: 3,
  failureWindowMs: 60000,
  openStateTtlMs: 30000,
  priorityCacheTtlMs: 120000
};
