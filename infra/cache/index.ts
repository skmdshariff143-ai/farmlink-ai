// =================================================================================
// FARMLINK AI - IN-MEMORY CACHE & REDIS CONFIGURATION
// =================================================================================
// Designed to cache catalog items, mandi market tick values, and user session blocks.

import { logger } from "@/lib/monitoring";

const cacheStore = new Map<string, { value: any; expiry: number }>();

export const CacheEngine = {
  get<T>(key: string): T | null {
    const cached = cacheStore.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      cacheStore.delete(key);
      logger.info(`♻ Cache key expired: ${key}`);
      return null;
    }

    return cached.value as T;
  },

  set(key: string, value: any, ttlSeconds: number = 300): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    cacheStore.set(key, { value, expiry });
    logger.info(`✓ Cache key stored: ${key} (TTL: ${ttlSeconds}s)`);
  },

  delete(key: string): void {
    cacheStore.delete(key);
  },

  clear(): void {
    cacheStore.clear();
  }
};
