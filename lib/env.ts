import { z } from 'zod';

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  // Database (optional)
  DATABASE_URL: z.string().url().optional().describe('PostgreSQL database connection URL'),

  // Redis (optional)
  REDIS_URL: z.string().url().optional().default('redis://localhost:6379').describe('Redis connection URL'),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Next.js
  NEXT_PUBLIC_APP_URL: z.string().url().optional().describe('Public application URL'),

  // Analysis Configuration
  MAX_CRAWL_DEPTH: z.coerce.number().int().positive().default(5),
  MAX_CONCURRENT_ANALYSES: z.coerce.number().int().positive().default(3),
  ANALYSIS_TIMEOUT_MS: z.coerce.number().int().positive().default(300000), // 5 minutes

  // Browser Configuration
  BROWSER_POOL_SIZE: z.coerce.number().int().positive().default(3),
  BROWSER_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),

  // Performance
  PERFORMANCE_RUNS: z.coerce.number().int().positive().default(3),
});

/**
 * Validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 * @throws {Error} If validation fails
 */
function parseEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

/**
 * Validated environment variables - use this throughout the application
 */
export const env = parseEnv();
