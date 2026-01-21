import Redis from 'ioredis';
import { env } from './env';

/**
 * Redis client singleton
 */
let redis: Redis | null = null;
let redisAvailable = true;

/**
 * Get or create Redis client
 */
export function getRedisClient(): Redis {
  if (!redisAvailable) {
    throw new Error('Redis is not available');
  }
  
  if (!redis) {
    try {
      redis = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          if (times > 3) {
            redisAvailable = false;
            return null; // Stop retrying
          }
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err: Error) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
        lazyConnect: true, // Don't connect immediately
      });

      redis.on('error', (err: Error) => {
        console.warn('Redis Client Error (will use memory cache):', err.message);
        redisAvailable = false;
      });

      redis.on('connect', () => {
        console.log('✅ Redis connected');
        redisAvailable = true;
      });
      
      // Try to connect
      redis.connect().catch((err) => {
        console.warn('Redis connection failed (will use memory cache):', err.message);
        redisAvailable = false;
      });
    } catch (error) {
      console.warn('Redis initialization failed (will use memory cache)');
      redisAvailable = false;
      throw error;
    }
  }

  return redis;
}

/**
 * Cache manager with common operations
 */
export class CacheManager {
  private client: Redis;

  constructor() {
    this.client = getRedisClient();
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  /**
   * Set a value in cache with optional TTL (in seconds)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttl) {
      await this.client.setex(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration on a key (in seconds)
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  /**
   * Increment a counter
   */
  async increment(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Decrement a counter
   */
  async decrement(key: string): Promise<number> {
    return this.client.decr(key);
  }

  /**
   * Add item to a list
   */
  async listPush(key: string, value: unknown): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.rpush(key, serialized);
  }

  /**
   * Get all items from a list
   */
  async listGetAll<T>(key: string): Promise<T[]> {
    const values = await this.client.lrange(key, 0, -1);
    return values.map((v) => {
      try {
        return JSON.parse(v) as T;
      } catch {
        return v as T;
      }
    });
  }

  /**
   * Remove item from a list
   */
  async listRemove(key: string, value: unknown): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.lrem(key, 0, serialized);
  }

  /**
   * Flush all data (use with caution!)
   */
  async flushAll(): Promise<void> {
    await this.client.flushall();
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
