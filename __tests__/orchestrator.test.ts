/**
 * Unit tests for the Orchestrator class
 * 
 * Tests cover:
 * - Module registration and validation
 * - Dependency resolution
 * - Execution order
 * - Error handling and graceful degradation
 * - Progress event emission
 */

import { Orchestrator } from '../lib/analysis/orchestrator';
import type {
  AnalysisModule,
  AnalysisContext,
  AnalysisJob,
  ProgressUpdate,
} from '../lib/analysis/types';

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;

  beforeEach(() => {
    orchestrator = new Orchestrator();
  });

  describe('Module Registration', () => {
    it('should register a valid module', () => {
      const module: AnalysisModule = {
        name: 'test-module',
        phase: 'crawl',
        dependencies: [],
        execute: async () => ({ success: true }),
      };

      orchestrator.registerModule(module);
      expect(orchestrator.getModule('test-module')).toBe(module);
    });

    it('should throw error when registering duplicate module', () => {
      const module: AnalysisModule = {
        name: 'test-module',
        phase: 'crawl',
        dependencies: [],
        execute: async () => ({ success: true }),
      };

      orchestrator.registerModule(module);
      expect(() => orchestrator.registerModule(module)).toThrow(
        'Module with name "test-module" is already registered'
      );
    });

    it('should throw error for module without name', () => {
      const module = {
        name: '',
        phase: 'crawl',
        dependencies: [],
        execute: async () => ({ success: true }),
      } as AnalysisModule;

      expect(() => orchestrator.registerModule(module)).toThrow(
        'Module must have a valid name'
      );
    });

    it('should throw error for module without phase', () => {
      const module = {
        name: 'test-module',
        phase: '',
        dependencies: [],
        execute: async () => ({ success: true }),
      } as AnalysisModule;

      expect(() => orchestrator.registerModule(module)).toThrow(
        'Module "test-module" must have a valid phase'
      );
    });

    it('should throw error for module without dependencies array', () => {
      const module = {
        name: 'test-module',
        phase: 'crawl',
        dependencies: null,
        execute: async () => ({ success: true }),
      } as any;

      expect(() => orchestrator.registerModule(module)).toThrow(
        'Module "test-module" must have a dependencies array'
      );
    });

    it('should throw error for module without execute method', () => {
      const module = {
        name: 'test-module',
        phase: 'crawl',
        dependencies: [],
      } as any;

      expect(() => orchestrator.registerModule(module)).toThrow(
        'Module "test-module" must have an execute method'
      );
    });

    it('should get all registered modules', () => {
      const module1: AnalysisModule = {
        name: 'module-1',
        phase: 'crawl',
        dependencies: [],
        execute: async () => ({ success: true }),
      };

      const module2: AnalysisModule = {
        name: 'module-2',
        phase: 'performance',
        dependencies: [],
        execute: async () => ({ success: true }),
      };

      orchestrator.registerModule(module1);
      orchestrator.registerModule(module2);

      const modules = orchestrator.getAllModules();
      expect(modules).toHaveLength(2);
      expect(modules).toContain(module1);
      expect(modules).toContain(module2);
    });
  });

  describe('Dependency Resolution', () => {
    it('should execute modules in correct order with simple dependencies', async () => {
      const executionOrder: string[] = [];

      const moduleA: AnalysisModule = {
        name: 'module-a',
        phase: 'crawl',
        dependencies: [],
        execute: async () => {
          executionOrder.push('module-a');
          return { success: true };
        },
      };

      const moduleB: AnalysisModule = {
        name: 'module-b',
        phase: 'performance',
        dependencies: ['module-a'],
        execute: async () => {
          executionOrder.push('module-b');
          return { success: true };
        },
      };

      orchestrator.registerModule(moduleA);
      orchestrator.registerModule(moduleB);

      const job: AnalysisJob = {
        id: 'test-job',
        url: 'https://example.com',
        status: 'running',
        options: {
          maxDepth: 3,
          respectRobotsTxt: true,
          includeExternalLinks: false,
          performanceRuns: 1,
        },
        createdAt: new Date(),
      };

      await orchestrator.executeAnalysis(job);

      expect(executionOrder).toEqual(['module-a', 'module-b']);
    });

    it('should execute modules in correct order with complex dependencies', async () => {
      const executionOrder: string[] = [];

      const moduleA: AnalysisModule = {
        name: 'module-a',
        phase: 'crawl',
        dependencies: [],
        execute: async () => {
          executionOrder.push('module-a');
          return { success: true };
        },
      };

      const moduleB: AnalysisModule = {
        name: 'module-b',
        phase: 'technology',
        dependencies: ['module-a'],
        execute: async () => {
          executionOrder.push('module-b');
          return { success: true };
        },
      };

      const moduleC: AnalysisModule = {
        name: 'module-c',
        phase: 'performance',
        dependencies: ['module-a'],
        execute: async () => {
          executionOrder.push('module-c');
          return { success: true };
        },
      };

      const moduleD: AnalysisModule = {
        name: 'module-d',
        phase: 'security',
        dependencies: ['module-b', 'module-c'],
        execute: async () => {
          executionOrder.push('module-d');
          return { success: true };
        },
      };

      orchestrator.registerModule(moduleA);
      orchestrator.registerModule(moduleB);
      orchestrator.registerModule(moduleC);
      orchestrator.registerModule(moduleD);

      const job: AnalysisJob = {
        id: 'test-job',
        url: 'https://example.com',
        status: 'running',
        options: {
          maxDepth: 3,
          respectRobotsTxt: true,
          includeExternalLinks: false,
          performanceRuns: 1,
        },
        createdAt: new Date(),
      };

      await orchestrator.executeAnalysis(job);

      // module-a must be first
      expect(executionOrder[0]).toBe('module-a');
      // module-d must be last
      expect(executionOrder[3]).toBe('module-d');
      // module-b and module-c must come before module-d
      const bIndex = executionOrder.indexOf('module-b');
      const cIndex = executionOrder.indexOf('module-c');
      const dIndex = executionOrder.indexOf('module-d');
      expect(bIndex).toBeLessThan(dIndex);
      expect(cIndex).toBeLessThan(dIndex);
    });

    it('should throw error for circular dependencies', async () => {
      const moduleA: AnalysisModule = {
        name: 'module-a',
        phase: 'crawl',
        dependencies: ['module-b'],
        execute: async () => ({ success: true }),
      };

      const moduleB: AnalysisModule = {
        name: 'module-b',
        phase: 'performance',
        dependencies: ['module-a'],
        execute: async () => ({ success: true }),
      };

      orchestrator.registerModule(moduleA);
      orchestrator.registerModule(moduleB);

      const job: AnalysisJob = {
        id: 'test-job',
        url: 'https://example.com',
        status: 'running',
        options: {
          maxDepth: 3,
          respectRobotsTxt: true,
          includeExternalLinks: false,
          performanceRuns: 1,
        },
        createdAt: new Date(),
      };

      await expect(orchestrator.executeAnalysis(job)).rejects.toThrow(
        /Circular dependency detected/
      );
    });

    it('should throw error for missing dependency', async () => {
      const moduleA: AnalysisModule = {
        name: 'module-a',
        phase: 'crawl',
        dependencies: ['non-existent-module'],
        execute: async () => ({ success: true }),
      };

      orchestrator.registerModule(moduleA);

      const job: AnalysisJob = {
        id: 'test-job',
        url: 'https://example.com',
        status: 'running',
        options: {
          maxDepth: 3,
          respectRobotsTxt: true,
          includeExternalLinks: false,
          performanceRuns: 1,
        },
        createdAt: new Date(),
      };

      await expect(orchestrator.executeAnalysis(job)).rejects.toThrow(
        'Module "module-a" depends on "non-existent-module" which is not registered'
      );
    });
  });

  describe('Error Handling', () => {
    it('should continue execution when a module fails (graceful degradation)', async () => {
      const executionOrder: string[] = [];

      const moduleA: AnalysisModule = {
        name: 'module-a',
        phase: 'crawl',
        dependencies: [],
        execute: async () => {
          executionOrder.push('module-a');
          throw new Error('Module A failed');
        },
      };

      const moduleB: AnalysisModule = {
        name: 'module-b',
        phase: 'performance',
        dependencies: [],
        execute: async () => {
          executionOrder.push('module-b');
          return { success: true };
        },
      };

      orchestrator.registerModule(moduleA);
      orchestrator.registerModule(moduleB);

      const job: AnalysisJob = {
        id: 'test-job',
        url: 'https://example.com',
        status: 'running',
        options: {
          maxDepth: 3,
          respectRobotsTxt: true,
          includeExternalLinks: false,
          performanceRuns: 1,
        },
        createdAt: new Date(),
      };

      const results = await orchestrator.executeAnalysis(job);

      // Both modules should have been attempted
      expect(executionOrder).toEqual(['module-a', 'module-b']);
      // Results should still be returned
      expect(results).toBeDefined();
    });

    it('should emit moduleError event when a module fails', async () => {
      const moduleA: AnalysisModule = {
        name: 'module-a',
        phase: 'crawl',
        dependencies: [],
        execute: async () => {
          throw new Error('Module A failed');
        },
      };

      orchestrator.registerModule(moduleA);

      const job: AnalysisJob = {
        id: 'test-job',
        url: 'https://example.com',
        status: 'running',
        options: {
          maxDepth: 3,
          respectRobotsTxt: true,
          includeExternalLinks: false,
          performanceRuns: 1,
        },
        createdAt: new Date(),
      };

      const errorHandler = jest.fn();
      orchestrator.on('moduleError', errorHandler);

      await orchestrator.executeAnalysis(job);

      expect(errorHandler).toHaveBeenCalledWith(
        'module-a',
        expect.any(Error)
      );
    });
  });

  describe('Progress Events', () => {
    it('should emit progress events during execution', async () => {
      const moduleA: AnalysisModule = {
        name: 'module-a',
        phase: 'crawl',
        dependencies: [],
        execute: async () => ({ success: true }),
      };

      const moduleB: AnalysisModule = {
        name: 'module-b',
        phase: 'performance',
        dependencies: ['module-a'],
        execute: async () => ({ success: true }),
      };

      orchestrator.registerModule(moduleA);
      orchestrator.registerModule(moduleB);

      const job: AnalysisJob = {
        id: 'test-job',
        url: 'https://example.com',
        status: 'running',
        options: {
          maxDepth: 3,
          respectRobotsTxt: true,
          includeExternalLinks: false,
          performanceRuns: 1,
        },
        createdAt: new Date(),
      };

      const progressUpdates: ProgressUpdate[] = [];
      orchestrator.on('progress', (update: ProgressUpdate) => {
        progressUpdates.push(update);
      });

      await orchestrator.executeAnalysis(job);

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].progress).toBeGreaterThan(0);
      expect(progressUpdates[0].progress).toBeLessThanOrEqual(100);
    });

    it('should emit moduleStart and moduleComplete events', async () => {
      const moduleA: AnalysisModule = {
        name: 'module-a',
        phase: 'crawl',
        dependencies: [],
        execute: async () => ({ success: true }),
      };

      orchestrator.registerModule(moduleA);

      const job: AnalysisJob = {
        id: 'test-job',
        url: 'https://example.com',
        status: 'running',
        options: {
          maxDepth: 3,
          respectRobotsTxt: true,
          includeExternalLinks: false,
          performanceRuns: 1,
        },
        createdAt: new Date(),
      };

      const startHandler = jest.fn();
      const completeHandler = jest.fn();

      orchestrator.on('moduleStart', startHandler);
      orchestrator.on('moduleComplete', completeHandler);

      await orchestrator.executeAnalysis(job);

      expect(startHandler).toHaveBeenCalledWith('module-a');
      expect(completeHandler).toHaveBeenCalledWith('module-a', {
        success: true,
      });
    });

    it('should emit complete event with aggregated results', async () => {
      const moduleA: AnalysisModule = {
        name: 'crawler',
        phase: 'crawl',
        dependencies: [],
        execute: async () => ({ pages: [] }),
      };

      orchestrator.registerModule(moduleA);

      const job: AnalysisJob = {
        id: 'test-job',
        url: 'https://example.com',
        status: 'running',
        options: {
          maxDepth: 3,
          respectRobotsTxt: true,
          includeExternalLinks: false,
          performanceRuns: 1,
        },
        createdAt: new Date(),
      };

      const completeHandler = jest.fn();
      orchestrator.on('complete', completeHandler);

      await orchestrator.executeAnalysis(job);

      expect(completeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          crawlData: { pages: [] },
        })
      );
    });
  });

  describe('Context Management', () => {
    it('should pass context to modules', async () => {
      let receivedContext: AnalysisContext | null = null;

      const moduleA: AnalysisModule = {
        name: 'module-a',
        phase: 'crawl',
        dependencies: [],
        execute: async (context: AnalysisContext) => {
          receivedContext = context;
          return { success: true };
        },
      };

      orchestrator.registerModule(moduleA);

      const job: AnalysisJob = {
        id: 'test-job',
        url: 'https://example.com',
        status: 'running',
        options: {
          maxDepth: 3,
          respectRobotsTxt: true,
          includeExternalLinks: false,
          performanceRuns: 1,
        },
        createdAt: new Date(),
      };

      await orchestrator.executeAnalysis(job);

      expect(receivedContext).not.toBeNull();
      expect(receivedContext?.url).toBe('https://example.com');
      expect(receivedContext?.options).toEqual(job.options);
    });

    it('should update context with crawl results after crawler module', async () => {
      const crawlResults = {
        pages: [{ url: 'https://example.com', depth: 0 }],
        siteMap: { root: 'https://example.com', pages: new Map() },
        routingStrategy: 'SSR',
        apiEndpoints: [],
        staticResources: [],
      };

      const crawler: AnalysisModule = {
        name: 'crawler',
        phase: 'crawl',
        dependencies: [],
        execute: async () => crawlResults,
      };

      let receivedContext: AnalysisContext | null = null;

      const moduleB: AnalysisModule = {
        name: 'module-b',
        phase: 'performance',
        dependencies: ['crawler'],
        execute: async (context: AnalysisContext) => {
          receivedContext = context;
          return { success: true };
        },
      };

      orchestrator.registerModule(crawler);
      orchestrator.registerModule(moduleB);

      const job: AnalysisJob = {
        id: 'test-job',
        url: 'https://example.com',
        status: 'running',
        options: {
          maxDepth: 3,
          respectRobotsTxt: true,
          includeExternalLinks: false,
          performanceRuns: 1,
        },
        createdAt: new Date(),
      };

      await orchestrator.executeAnalysis(job);

      expect(receivedContext?.crawlResults).toEqual(crawlResults);
    });
  });

  describe('Utility Methods', () => {
    it('should clear all modules', () => {
      const module: AnalysisModule = {
        name: 'test-module',
        phase: 'crawl',
        dependencies: [],
        execute: async () => ({ success: true }),
      };

      orchestrator.registerModule(module);
      expect(orchestrator.getAllModules()).toHaveLength(1);

      orchestrator.clearModules();
      expect(orchestrator.getAllModules()).toHaveLength(0);
    });
  });
});
