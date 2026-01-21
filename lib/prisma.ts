import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient singleton to prevent multiple instances in development
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// For Prisma 7 with Accelerate, we need to pass accelerateUrl
const databaseUrl = process.env.DATABASE_URL || '';
const isAccelerateUrl = databaseUrl.startsWith('prisma+');

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    ...(isAccelerateUrl ? { accelerateUrl: databaseUrl } : {}),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
