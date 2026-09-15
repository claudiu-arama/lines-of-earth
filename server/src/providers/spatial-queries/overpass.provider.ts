import { AppError } from "../../common/errors/AppError.ts";
import { osmFetch } from "../../common/http/osmFetch.ts";
import { chunk } from "../../helpers/arrayHelpers.ts";

import {
  filterHealthy,
  recordFailure,
  recordSuccess
} from "./circuitBreaker.ts";
import { OVERPASS_CONFIG, OVERPASS_INSTANCES } from "./config.ts";
import { getRankedInstanceIds } from "./priority.ts";

import type { OverpassInstance } from "./types.ts";

/**
 * Queries the Overpass API with the specified query.
 * @param query
 * @returns
 */
export async function queryOverpass(query: string): Promise<unknown> {
  const knownIds = new Set(OVERPASS_INSTANCES.map((instance) => instance.id));

  const instanceById = new Map(
    OVERPASS_INSTANCES.map((instance) => [instance.id, instance])
  );

  const rankedIds = (await getRankedInstanceIds()).filter((id) =>
    knownIds.has(id)
  );

  const missingIds = [...knownIds].filter((id) => !rankedIds.includes(id));
  const orderedIds = [...rankedIds, ...missingIds];

  const healthyIds = await filterHealthy(orderedIds);

  if (healthyIds.length === 0) {
    throw new AppError({
      statusCode: 502,
      errorCode: "OVERPASS_UNAVAILABLE",
      message: "All Overpass instances are currently unavailable.",
      expose: false
    });
  }

  const batches = chunk(healthyIds, OVERPASS_CONFIG.raceSize);

  for (const batch of batches) {
    const attempts = batch
      .map((id) => instanceById.get(id))
      .filter(
        (instance): instance is OverpassInstance => instance !== undefined
      )
      .map((instance) => {
        const controller = new AbortController();
        return {
          instanceId: instance.id,
          controller,
          promise: attemptQuery(instance, query, controller)
        };
      });

    attempts.forEach((attempt) => attempt.promise.catch(() => {}));

    try {
      const winner = await Promise.any(
        attempts.map((attempt) => attempt.promise)
      );

      attempts.forEach((attempt) => {
        if (attempt.instanceId !== winner.instanceId)
          attempt.controller.abort();
      });

      await recordSuccess(winner.instanceId);
      return winner.data;
    } catch {
      await Promise.all(batch.map((id) => recordFailure(id)));
    }
  }

  throw new AppError({
    statusCode: 502,
    errorCode: "OVERPASS_UNAVAILABLE",
    message: "All Overpass instances failed to respond.",
    expose: false
  });
}

// Helpers

interface QueryAttemptResult {
  instanceId: string;
  data: unknown;
}

/**
 * Attempts to query an Overpass instance with the specified query.
 * @param instance
 * @param query
 * @param controller
 * @returns
 */
async function attemptQuery(
  instance: OverpassInstance,
  query: string,
  controller: AbortController
): Promise<QueryAttemptResult> {
  const timeout = setTimeout(
    () => controller.abort(),
    OVERPASS_CONFIG.requestTimeoutMs
  );

  try {
    const response = await osmFetch(new URL(instance.queryUrl), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`${instance.id} responded ${response.status}`);
    }

    return { instanceId: instance.id, data: await response.json() };
  } finally {
    clearTimeout(timeout);
  }
}
