import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@cruelstack.dev' },
    update: {},
    create: {
      email: 'test@cruelstack.dev',
      name: 'Test User',
    },
  });

  console.log('✅ Created test user:', user);

  // Create a sample analysis
  const analysis = await prisma.analysis.create({
    data: {
      url: 'https://example.com',
      status: 'COMPLETED',
      options: {
        maxDepth: 3,
        respectRobotsTxt: true,
        includeExternalLinks: false,
        performanceRuns: 3,
      },
      results: {
        crawlData: {
          pagesFound: 10,
          totalLinks: 50,
        },
        performanceData: {
          lcp: 2.5,
          cls: 0.1,
          fid: 100,
        },
      },
      userId: user.id,
      startedAt: new Date(Date.now() - 300000), // 5 minutes ago
      completedAt: new Date(),
    },
  });

  console.log('✅ Created sample analysis:', analysis);

  // Create a sample report
  const report = await prisma.report.create({
    data: {
      analysisId: analysis.id,
      content: {
        summary: 'Sample analysis report',
        findings: [],
        recommendations: [],
      },
      metadata: {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
      },
    },
  });

  console.log('✅ Created sample report:', report);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
