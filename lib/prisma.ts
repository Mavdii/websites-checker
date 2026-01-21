/**
 * PrismaClient singleton to prevent multiple instances in development
 * 
 * Note: Prisma is optional. If DATABASE_URL is not set, this will be undefined.
 */

let prisma: any = undefined;

try {
  // Only import and initialize Prisma if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    const { PrismaClient } = require('@prisma/client');
    
    const globalForPrisma = globalThis as unknown as {
      prisma: any | undefined;
    };

    const databaseUrl = process.env.DATABASE_URL || '';
    const isAccelerateUrl = databaseUrl.startsWith('prisma+');

    prisma =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        ...(isAccelerateUrl ? { accelerateUrl: databaseUrl } : {}),
      });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
  }
} catch (error) {
  console.warn('Prisma is not available. Database features will be disabled.');
}

export { prisma };

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}
