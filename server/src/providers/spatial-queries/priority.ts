import { osmFetch } from "../../common/http/osmFetch.ts";
import { redisClient } from "../../common/redis/redisClient.ts";

import { OVERPASS_CONFIG, OVERPASS_INSTANCES } from "./config.ts";

import type { OverpassInstance } from "./types.ts";

const RANKING_KEY = "overpass:latency:ranking";
const PROBE_LOCK_KEY = "overpass:latency:probe-lock";
const PROBE_LOCK_TTL_MS = 10000;

interface ProbeResult {
  id: string;
  rttMs: number;
}

/**
 * Probes an Overpass instance to measure its latency.
 * @param instance OverpassInstance - The Overpass instance to probe.
 * @returns Promise<ProbeResult | null> - The result of the probe or null if it failed.
 */
export async function probeInstance(
  instance: OverpassInstance
): Promise<ProbeResult | null> {
  const start = performance.now();

  try {
    const response = await osmFetch(new URL(instance.statusUrl), {
      signal: AbortSignal.timeout(OVERPASS_CONFIG.probeTimeoutMs)
    });

    if (!response.ok) return null;

    return {
      id: instance.id,
      rttMs: performance.now() - start
    };
  } catch {
    return null;
  }
}

/**
 * Refreshes the latency ranking of Overpass instances.
 * @returns Promise<void> - A promise that resolves when the ranking is refreshed.
 */
export async function refreshRanking(): Promise<void> {
  const acquired = await redisClient
    .set(PROBE_LOCK_KEY, "1", "PX", PROBE_LOCK_TTL_MS, "NX")
    .catch(() => null);

  if (!acquired) return;

  try {
    const results = await Promise.allSettled(
      OVERPASS_INSTANCES.map(probeInstance)
    );

    const successful = results
      .filter(
        (result): result is PromiseFulfilledResult<ProbeResult> =>
          result.status === "fulfilled" && result.value !== null
      )
      .map((result) => result.value);

    if (successful.length === 0) return;

    const pipeline = redisClient.pipeline();
    pipeline.del(RANKING_KEY);
    successful.forEach(({ id, rttMs }) => {
      pipeline.zadd(RANKING_KEY, rttMs, id);
    });
    pipeline.expire(
      RANKING_KEY,
      Math.ceil(OVERPASS_CONFIG.priorityCacheTtlMs / 1000)
    );

    await pipeline.exec();
  } catch (error) {
    console.error("Overpass latency probe failed:", error);
  } finally {
    await redisClient.del(PROBE_LOCK_KEY).catch(() => {});
  }
}

/**
 * Retrieves the IDs of Overpass instances ordered by their latency.
 * @returns Promise<string[]> - A promise that resolves to the IDs of Overpass instances ordered by their latency.
 */
export async function getRankedInstanceIds(): Promise<string[]> {
  try {
    const ranked = await redisClient.zrange(RANKING_KEY, 0, "-1");

    if (ranked.length > 0) return ranked;

    void refreshRanking();

    return OVERPASS_INSTANCES.map((instance) => instance.id);
  } catch (error) {
    console.error("Failed to read Overpass latency ranking:", error);
    return OVERPASS_INSTANCES.map((instance) => instance.id);
  }
}
