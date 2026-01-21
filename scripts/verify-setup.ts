#!/usr/bin/env ts-node
/**
 * Verification script to check if all infrastructure is properly set up
 */

import { env } from '../lib/env';
import { getRedisClient, closeRedis } from '../lib/redis';
import { prisma, disconnectPrisma } from '../lib/prisma';

async function verifySetup() {
  console.log('🔍 Verifying Cruel Stack setup...\n');

  // Check environment variables
  console.log('✅ Environment variables loaded');
  console.log(`   - NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   - MAX_CRAWL_DEPTH: ${env.MAX_CRAWL_DEPTH}`);
  console.log(`   - BROWSER_POOL_SIZE: ${env.BROWSER_POOL_SIZE}\n`);

  // Check Redis connection
  try {
    const redis = getRedisClient();
    await redis.ping();
    console.log('✅ Redis connection successful\n');
    await closeRedis();
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    console.log('   Make sure Redis is running (docker-compose up -d)\n');
  }

  // Check Prisma/Database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    await disconnectPrisma();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('   Make sure PostgreSQL is running (docker-compose up -d)\n');
    console.log('   Run: npm run prisma:migrate\n');
  }

  console.log('🎉 Setup verification complete!');
}

verifySetup()
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
