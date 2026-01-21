/**
 * PrismaClient singleton (optional)
 * Only loads if DATABASE_URL is set
 */

let prisma: any = undefined;

// Only load Prisma if DATABASE_URL exists
if (process.env.DATABASE_URL) {
  try {
    const { PrismaClient } = require('@prisma/client');
    
    const globalForPrisma = globalThis as unknown as {
      prisma: any | undefined;
    };

    const databaseUrl = process.env.DATABASE_URL;
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
  } catch (error) {
    console.warn('Prisma not available:', error);
  }
}

export { prisma };

export async function disconnectPrisma(): Promise<void> {
  if (prisma && typeof prisma.$disconnect === 'function') {
    await prisma.$disconnect();
  }
}
