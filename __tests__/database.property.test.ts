/**
 * @jest-environment node
 */

// Feature: cruel-stack, Property 21: Analysis History Storage
/**
 * Property-Based Tests for Database Operations
 * 
 * **Validates: Requirements 14.1, 14.2, 14.3**
 * 
 * Property 21: Analysis History Storage
 * For any completed analysis, the results should be stored with a timestamp 
 * and user association, and should be retrievable from the history.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import * as fc from 'fast-check';
import { prisma } from '@/lib/prisma';
import { AnalysisStatus } from '@prisma/client';

// Test database cleanup
beforeAll(async () => {
  // Ensure we're in test environment
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Database property tests must run in test environment');
  }
});

beforeEach(async () => {
  // Clean up test data before each test
  await prisma.report.deleteMany({});
  await prisma.analysis.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  // Clean up and disconnect
  await prisma.report.deleteMany({});
  await prisma.analysis.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

describe('Property 21: Analysis History Storage', () => {
  /**
   * Property Test: Completed analyses are stored with timestamp and user association
   * 
   * For any valid analysis data with COMPLETED status, when stored in the database:
   * 1. The analysis should be persisted with all required fields
   * 2. The createdAt timestamp should be set automatically
   * 3. The completedAt timestamp should be present
   * 4. The user association should be maintained
   * 5. The analysis should be retrievable by ID
   * 6. The analysis should be retrievable by user ID
   * 7. The analysis should be retrievable by URL
   */
  it('should store completed analyses with timestamp and user association', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random analysis data
        fc.record({
          url: fc.webUrl(),
          userId: fc.option(fc.uuid(), { nil: undefined }),
          options: fc.record({
            maxDepth: fc.integer({ min: 1, max: 10 }),
            respectRobotsTxt: fc.boolean(),
            includeExternalLinks: fc.boolean(),
            performanceRuns: fc.integer({ min: 1, max: 5 }),
          }),
          results: fc.record({
            pagesAnalyzed: fc.integer({ min: 1, max: 100 }),
            issuesFound: fc.integer({ min: 0, max: 50 }),
            technologiesDetected: fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
          }),
        }),
        async (analysisData) => {
          // Create user if userId is provided
          let user = null;
          if (analysisData.userId) {
            user = await prisma.user.create({
              data: {
                id: analysisData.userId,
                email: `test-${analysisData.userId}@example.com`,
                name: `Test User ${analysisData.userId}`,
              },
            });
          }

          // Create analysis with COMPLETED status
          const startedAt = new Date(Date.now() - 60000); // 1 minute ago
          const completedAt = new Date();

          const createdAnalysis = await prisma.analysis.create({
            data: {
              url: analysisData.url,
              status: AnalysisStatus.COMPLETED,
              options: analysisData.options,
              results: analysisData.results,
              userId: user?.id,
              startedAt,
              completedAt,
            },
          });

          // Property 1: Analysis should be persisted with all required fields
          expect(createdAnalysis).toBeDefined();
          expect(createdAnalysis.id).toBeDefined();
          expect(createdAnalysis.url).toBe(analysisData.url);
          expect(createdAnalysis.status).toBe(AnalysisStatus.COMPLETED);

          // Property 2: createdAt timestamp should be set automatically
          expect(createdAnalysis.createdAt).toBeInstanceOf(Date);
          expect(createdAnalysis.createdAt.getTime()).toBeLessThanOrEqual(Date.now());

          // Property 3: completedAt timestamp should be present for completed analyses
          expect(createdAnalysis.completedAt).toBeInstanceOf(Date);
          expect(createdAnalysis.completedAt).toEqual(completedAt);

          // Property 4: User association should be maintained
          if (user) {
            expect(createdAnalysis.userId).toBe(user.id);
          } else {
            expect(createdAnalysis.userId).toBeNull();
          }

          // Property 5: Analysis should be retrievable by ID
          const retrievedById = await prisma.analysis.findUnique({
            where: { id: createdAnalysis.id },
          });
          expect(retrievedById).toBeDefined();
          expect(retrievedById?.id).toBe(createdAnalysis.id);
          expect(retrievedById?.url).toBe(analysisData.url);

          // Property 6: Analysis should be retrievable by user ID (if user exists)
          if (user) {
            const retrievedByUserId = await prisma.analysis.findMany({
              where: { userId: user.id },
            });
            expect(retrievedByUserId.length).toBeGreaterThan(0);
            expect(retrievedByUserId.some((a) => a.id === createdAnalysis.id)).toBe(true);
          }

          // Property 7: Analysis should be retrievable by URL
          const retrievedByUrl = await prisma.analysis.findMany({
            where: { url: analysisData.url },
          });
          expect(retrievedByUrl.length).toBeGreaterThan(0);
          expect(retrievedByUrl.some((a) => a.id === createdAnalysis.id)).toBe(true);

          // Cleanup for this iteration
          await prisma.analysis.delete({ where: { id: createdAnalysis.id } });
          if (user) {
            await prisma.user.delete({ where: { id: user.id } });
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified
    );
  });

  /**
   * Property Test: Multiple analyses for the same URL are stored separately
   * 
   * For any URL, multiple analyses should be stored as separate records
   * with different timestamps, allowing history tracking.
   */
  it('should store multiple analyses for the same URL with different timestamps', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.webUrl(),
        fc.integer({ min: 2, max: 5 }), // Number of analyses to create
        async (url, numAnalyses) => {
          const analyses = [];

          // Create multiple analyses for the same URL
          for (let i = 0; i < numAnalyses; i++) {
            const analysis = await prisma.analysis.create({
              data: {
                url,
                status: AnalysisStatus.COMPLETED,
                options: { maxDepth: i + 1 },
                results: { iteration: i },
                completedAt: new Date(Date.now() + i * 1000), // Different timestamps
              },
            });
            analyses.push(analysis);
            // Small delay to ensure different createdAt timestamps
            await new Promise((resolve) => setTimeout(resolve, 10));
          }

          // Property: All analyses should be retrievable
          const retrieved = await prisma.analysis.findMany({
            where: { url },
            orderBy: { createdAt: 'asc' },
          });

          expect(retrieved.length).toBe(numAnalyses);

          // Property: Each analysis should have a unique ID
          const ids = retrieved.map((a) => a.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(numAnalyses);

          // Property: Timestamps should be in order
          for (let i = 1; i < retrieved.length; i++) {
            expect(retrieved[i].createdAt.getTime()).toBeGreaterThanOrEqual(
              retrieved[i - 1].createdAt.getTime()
            );
          }

          // Cleanup
          await prisma.analysis.deleteMany({ where: { url } });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Analysis history is retrievable with proper ordering
   * 
   * For any set of analyses, they should be retrievable in chronological order
   * (most recent first) for history display.
   */
  it('should retrieve analysis history in chronological order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            url: fc.webUrl(),
            status: fc.constantFrom(
              AnalysisStatus.COMPLETED,
              AnalysisStatus.FAILED,
              AnalysisStatus.CANCELLED
            ),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (analysesData) => {
          const createdAnalyses = [];

          // Create analyses with small delays to ensure different timestamps
          for (const data of analysesData) {
            const analysis = await prisma.analysis.create({
              data: {
                url: data.url,
                status: data.status,
                options: {},
                completedAt: data.status === AnalysisStatus.COMPLETED ? new Date() : null,
              },
            });
            createdAnalyses.push(analysis);
            await new Promise((resolve) => setTimeout(resolve, 10));
          }

          // Property: Retrieve in descending order (most recent first)
          const retrieved = await prisma.analysis.findMany({
            orderBy: { createdAt: 'desc' },
          });

          expect(retrieved.length).toBeGreaterThanOrEqual(analysesData.length);

          // Property: Timestamps should be in descending order
          for (let i = 1; i < retrieved.length; i++) {
            expect(retrieved[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
              retrieved[i].createdAt.getTime()
            );
          }

          // Cleanup
          for (const analysis of createdAnalyses) {
            await prisma.analysis.delete({ where: { id: analysis.id } });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: User-specific analysis history is correctly filtered
   * 
   * For any user, only their analyses should be returned when filtering by userId.
   */
  it('should retrieve only user-specific analyses when filtering by userId', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            email: fc.emailAddress(),
            analysisUrl: fc.webUrl(),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (usersData) => {
          const users = [];
          const analysesByUser = new Map<string, string[]>();

          // Create users and their analyses
          for (const userData of usersData) {
            const user = await prisma.user.create({
              data: {
                email: userData.email,
                name: `Test User ${userData.email}`,
              },
            });
            users.push(user);

            const analysis = await prisma.analysis.create({
              data: {
                url: userData.analysisUrl,
                status: AnalysisStatus.COMPLETED,
                options: {},
                userId: user.id,
                completedAt: new Date(),
              },
            });

            if (!analysesByUser.has(user.id)) {
              analysesByUser.set(user.id, []);
            }
            analysesByUser.get(user.id)!.push(analysis.id);
          }

          // Property: Each user should only see their own analyses
          for (const user of users) {
            const userAnalyses = await prisma.analysis.findMany({
              where: { userId: user.id },
            });

            const expectedAnalysisIds = analysesByUser.get(user.id) || [];
            expect(userAnalyses.length).toBe(expectedAnalysisIds.length);

            // All retrieved analyses should belong to this user
            for (const analysis of userAnalyses) {
              expect(analysis.userId).toBe(user.id);
              expect(expectedAnalysisIds).toContain(analysis.id);
            }
          }

          // Cleanup
          await prisma.analysis.deleteMany({
            where: { userId: { in: users.map((u) => u.id) } },
          });
          await prisma.user.deleteMany({
            where: { id: { in: users.map((u) => u.id) } },
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Analysis with report maintains referential integrity
   * 
   * For any completed analysis with a report, the report should be
   * accessible through the analysis relationship.
   */
  it('should maintain referential integrity between analysis and report', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          url: fc.webUrl(),
          reportContent: fc.record({
            summary: fc.string(),
            findings: fc.array(fc.string(), { maxLength: 5 }),
          }),
          reportMetadata: fc.record({
            version: fc.string(),
            generatedAt: fc.date(),
          }),
        }),
        async (data) => {
          // Create analysis
          const analysis = await prisma.analysis.create({
            data: {
              url: data.url,
              status: AnalysisStatus.COMPLETED,
              options: {},
              completedAt: new Date(),
            },
          });

          // Create associated report
          const report = await prisma.report.create({
            data: {
              analysisId: analysis.id,
              content: data.reportContent,
              metadata: data.reportMetadata,
            },
          });

          // Property: Report should be accessible through analysis
          const analysisWithReport = await prisma.analysis.findUnique({
            where: { id: analysis.id },
            include: { report: true },
          });

          expect(analysisWithReport).toBeDefined();
          expect(analysisWithReport?.report).toBeDefined();
          expect(analysisWithReport?.report?.id).toBe(report.id);
          expect(analysisWithReport?.report?.analysisId).toBe(analysis.id);

          // Property: Report should be accessible directly
          const directReport = await prisma.report.findUnique({
            where: { id: report.id },
            include: { analysis: true },
          });

          expect(directReport).toBeDefined();
          expect(directReport?.analysis.id).toBe(analysis.id);

          // Property: Deleting analysis should cascade delete report
          await prisma.analysis.delete({ where: { id: analysis.id } });

          const deletedReport = await prisma.report.findUnique({
            where: { id: report.id },
          });
          expect(deletedReport).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
