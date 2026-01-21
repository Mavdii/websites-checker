/**
 * Cache Manager for Analysis Results
 * 
 * Provides caching functionality using Redis (with fallback to memory)
 */

import { getRedisClient } from '@/lib/redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 1 hour)
}

// In-memory cache fallback
const memoryCache = new Map<string, { value: string; expires: number }>();

/**
 * Cache manager for storing and retrieving analysis results
 */
export class CacheManager {
  private prefix: string;
  private useRedis: boolean = true;
  
  constructor(prefix = 'analysis') {
    this.prefix = prefix;
  }
  
  /**
   * Generate cache key
   */
  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }
  
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.getKey(key);
    
    // Try Redis first
    if (this.useRedis) {
      try {
        const redis = getRedisClient();
        const value = await redis.get(cacheKey);
        if (!value) return null;
        return JSON.parse(value) as T;
      } catch (error) {
        console.warn('Redis unavailable, using memory cache');
        this.useRedis = false;
      }
    }
    
    // Fallback to memory cache
    const cached = memoryCache.get(cacheKey);
    if (!cached) return null;
    
    // Check expiration
    if (Date.now() > cached.expires) {
      memoryCache.delete(cacheKey);
      return null;
    }
    
    try {
      return JSON.parse(cached.value) as T;
    } catch {
      return null;
    }
  }
  
  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const cacheKey = this.getKey(key);
    const ttl = options.ttl || 3600; // Default 1 hour
    const serialized = JSON.stringify(value);
    
    // Try Redis first
    if (this.useRedis) {
      try {
        const redis = getRedisClient();
        await redis.setex(cacheKey, ttl, serialized);
        return;
      } catch (error) {
        console.warn('Redis unavailable, using memory cache');
        this.useRedis = false;
      }
    }
    
    // Fallback to memory cache
    memoryCache.set(cacheKey, {
      value: serialized,
      expires: Date.now() + (ttl * 1000),
    });
  }
  
  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    const cacheKey = this.getKey(key);
    
    if (this.useRedis) {
      try {
        const redis = getRedisClient();
        await redis.del(cacheKey);
        return;
      } catch (error) {
        this.useRedis = false;
      }
    }
    
    memoryCache.delete(cacheKey);
  }
  
  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const cacheKey = this.getKey(key);
    
    if (this.useRedis) {
      try {
        const redis = getRedisClient();
        const exists = await redis.exists(cacheKey);
        return exists === 1;
      } catch (error) {
        this.useRedis = false;
      }
    }
    
    const cached = memoryCache.get(cacheKey);
    if (!cached) return false;
    
    // Check expiration
    if (Date.now() > cached.expires) {
      memoryCache.delete(cacheKey);
      return false;
    }
    
    return true;
  }
  
  /**
   * Clear all cache entries with this prefix
   */
  async clear(): Promise<void> {
    if (this.useRedis) {
      try {
        const redis = getRedisClient();
        const keys = await redis.keys(`${this.prefix}:*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        return;
      } catch (error) {
        this.useRedis = false;
      }
    }
    
    // Clear memory cache
    for (const key of memoryCache.keys()) {
      if (key.startsWith(`${this.prefix}:`)) {
        memoryCache.delete(key);
      }
    }
  }
}

/**
 * Create a cache manager instance
 */
export function createCacheManager(prefix?: string): CacheManager {
  return new CacheManager(prefix);
}
