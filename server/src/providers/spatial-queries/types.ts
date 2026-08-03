export interface OverpassInstance {
  id: string;
  name: string;
  queryUrl: string;
  statusUrl: string;
}

export interface OverpassConfig {
  raceSize: number;
  requestTimeoutMs: number;
  probeTimeoutMs: number;
  failureThreshold: number;
  failureWindowMs: number;
  openStateTtlMs: number;
  priorityCacheTtlMs: number;
}
