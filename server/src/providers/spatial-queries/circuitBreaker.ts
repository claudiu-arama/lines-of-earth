import { randomUUID } from "node:crypto";

import { redisClient } from "../../common/redis/redisClient.ts";

import { OVERPASS_CONFIG } from "./config.ts";

const failuresKey = (instanceId: string) => `overpass:failures:${instanceId}`;
const openKey = (instanceId: string) => `overpass:open:${instanceId}`;

export async function recordFailure(instanceId: string): Promise<void> {
  try {
    const now = Date.now();
    const member = `${now}:${randomUUID()}`;
    const windowStart = now - OVERPASS_CONFIG.failureWindowMs;
    const key = failuresKey(instanceId);

    const pipeline = redisClient.pipeline();
    pipeline.zadd(key, now, member);
    pipeline.zremrangebyscore(key, "-inf", windowStart);
    pipeline.zcard(key);
    pipeline.expire(
      key,
      Math.ceil((OVERPASS_CONFIG.failureWindowMs * 2) / 1000)
    );
    const results = await pipeline.exec();

    const failureCount = results?.[2]?.[1] as number | undefined;

    if (
      failureCount !== undefined &&
      failureCount >= OVERPASS_CONFIG.failureThreshold
    ) {
      await redisClient.set(
        openKey(instanceId),
        "1",
        "PX",
        OVERPASS_CONFIG.openStateTtlMs
      );
    }
  } catch (error) {
    console.error(
      `Circuit breaker recordFailure failed for ${instanceId}:`,
      error
    );
  }
}

export async function recordSuccess(instanceId: string): Promise<void> {
  try {
    await redisClient.del(openKey(instanceId));
  } catch (error) {
    console.error(
      `Circuit breaker recordSuccess failed for ${instanceId}:`,
      error
    );
  }
}

export async function isOpen(instanceId: string): Promise<boolean> {
  try {
    const exists = await redisClient.exists(openKey(instanceId));
    return exists === 1;
  } catch (error) {
    console.error(
      `Circuit breaker isOpen check failed for ${instanceId}:`,
      error
    );
    return false;
  }
}

export async function filterHealthy(instanceIds: string[]): Promise<string[]> {
  if (instanceIds.length === 0) return [];

  try {
    const pipeline = redisClient.pipeline();
    instanceIds.forEach((id) => pipeline.exists(openKey(id)));

    const results = await pipeline.exec();
    if (!results) return instanceIds;

    return instanceIds.filter((_, index) => results[index]?.[1] === 0);
  } catch (error) {
    console.error("Circuit breaker filterHealthy failed:", error);
    return instanceIds;
  }
}
