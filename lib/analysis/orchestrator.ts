/**
 * Orchestrator for managing and executing analysis modules
 * 
 * The Orchestrator is responsible for:
 * - Registering analysis modules
 * - Resolving module dependencies
 * - Executing modules in the correct order
 * - Emitting progress updates
 * - Handling module failures gracefully
 */

import { EventEmitter } from 'events';
import type {
  AnalysisModule,
  AnalysisResults,
  AnalysisJob,
  ProgressUpdate,
} from './types';
import { createAnalysisContext, createLogger } from './context';
import { createCacheManager } from './cache';

/**
 * Event types emitted by the Orchestrator
 */
export interface OrchestratorEvents {
  progress: (update: ProgressUpdate) => void;
  moduleStart: (moduleName: string) => void;
  moduleComplete: (moduleName: string, results: unknown) => void;
  moduleError: (moduleName: string, error: Error) => void;
  complete: (results: AnalysisResults) => void;
  error: (error: Error) => void;
}

/**
 * Orchestrator class for managing analysis module execution
 */
export class Orchestrator extends EventEmitter {
  private modules: Map<string, AnalysisModule> = new Map();
  private moduleResults: Map<string, unknown> = new Map();

  /**
   * Register an analysis module
   * @param module - The analysis module to register
   * @throws Error if a module with the same name is already registered
   */
  registerModule(module: AnalysisModule): void {
    if (this.modules.has(module.name)) {
      throw new Error(
        `Module with name "${module.name}" is already registered`
      );
    }

    // Validate module structure
    if (!module.name || typeof module.name !== 'string') {
      throw new Error('Module must have a valid name');
    }

    if (!module.phase || typeof module.phase !== 'string') {
      throw new Error(`Module "${module.name}" must have a valid phase`);
    }

    if (!Array.isArray(module.dependencies)) {
      throw new Error(
        `Module "${module.name}" must have a dependencies array`
      );
    }

    if (typeof module.execute !== 'function') {
      throw new Error(`Module "${module.name}" must have an execute method`);
    }

    this.modules.set(module.name, module);
  }

  /**
   * Get a registered module by name
   * @param name - The name of the module
   * @returns The module or undefined if not found
   */
  getModule(name: string): AnalysisModule | undefined {
    return this.modules.get(name);
  }

  /**
   * Get all registered modules
   * @returns Array of all registered modules
   */
  getAllModules(): AnalysisModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Resolve module execution order based on dependencies
   * Uses topological sort to determine the correct execution order
   * @returns Array of modules in execution order
   * @throws Error if circular dependencies are detected
   */
  private resolveExecutionOrder(): AnalysisModule[] {
    const modules = Array.from(this.modules.values());
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: AnalysisModule[] = [];

    const visit = (moduleName: string): void => {
      // Check for circular dependencies
      if (visiting.has(moduleName)) {
        throw new Error(
          `Circular dependency detected involving module "${moduleName}"`
        );
      }

      // Skip if already visited
      if (visited.has(moduleName)) {
        return;
      }

      const module = this.modules.get(moduleName);
      if (!module) {
        throw new Error(`Module "${moduleName}" not found`);
      }

      visiting.add(moduleName);

      // Visit all dependencies first
      for (const dep of module.dependencies) {
        if (!this.modules.has(dep)) {
          throw new Error(
            `Module "${moduleName}" depends on "${dep}" which is not registered`
          );
        }
        visit(dep);
      }

      visiting.delete(moduleName);
      visited.add(moduleName);
      order.push(module);
    };

    // Visit all modules
    for (const module of modules) {
      visit(module.name);
    }

    return order;
  }

  /**
   * Execute all registered modules in dependency order
   * @param job - The analysis job to execute
   * @returns Promise resolving to aggregated analysis results
   */
  async executeAnalysis(job: AnalysisJob): Promise<AnalysisResults> {
    try {
      // Clear previous results
      this.moduleResults.clear();

      // Create logger and cache
      const logger = createLogger(job.id);
      const cache = createCacheManager(`analysis:${job.id}`);
      
      logger.info('Starting analysis', { url: job.url, options: job.options });

      // Resolve execution order
      const executionOrder = this.resolveExecutionOrder();

      // Create analysis context
      const context = createAnalysisContext(job.url, job.options);
      context.logger = logger;
      context.cache = cache;

      // Execute modules in order
      for (const module of executionOrder) {
        try {
          logger.info(`Starting module: ${module.name}`);
          this.emit('moduleStart', module.name);

          // Execute the module
          const result = await module.execute(context);

          // Store results
          this.moduleResults.set(module.name, result);

          // Update context with results if it's the crawler module
          if (module.phase === 'crawl') {
            context.crawlResults = result as any;
          }

          logger.info(`Completed module: ${module.name}`);
          this.emit('moduleComplete', module.name, result);

          // Emit progress update
          this.emitProgress({
            phase: module.phase,
            progress: this.calculateProgress(executionOrder, module.name),
            currentTask: `Completed ${module.name}`,
            discoveries: [],
            metrics: {
              pagesCrawled: 0,
              issuesFound: 0,
              technologiesDetected: 0,
              resourcesAnalyzed: 0,
            },
          });
        } catch (error) {
          const err =
            error instanceof Error ? error : new Error(String(error));
          logger.error(`Module "${module.name}" failed`, err);
          this.emit('moduleError', module.name, err);

          // Continue with other modules (graceful degradation)
          console.error(`Module "${module.name}" failed:`, err);
        }
      }

      logger.info('Analysis completed successfully');

      // Aggregate results
      const results: AnalysisResults = {
        crawlData: this.moduleResults.get('crawler') as any,
        performanceData: this.moduleResults.get('performance'),
        securityData: this.moduleResults.get('security'),
        technologyData: this.moduleResults.get('technology'),
        seoData: this.moduleResults.get('seo'),
        accessibilityData: this.moduleResults.get('accessibility'),
        cssData: this.moduleResults.get('css'),
        functionalityData: this.moduleResults.get('functionality'),
      };

      this.emit('complete', results);
      return results;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Calculate progress percentage based on completed modules
   * @param executionOrder - Array of modules in execution order
   * @param currentModule - Name of the current module
   * @returns Progress percentage (0-100)
   */
  private calculateProgress(
    executionOrder: AnalysisModule[],
    currentModule: string
  ): number {
    const currentIndex = executionOrder.findIndex(
      (m) => m.name === currentModule
    );
    if (currentIndex === -1) return 0;

    return Math.round(((currentIndex + 1) / executionOrder.length) * 100);
  }

  /**
   * Emit a progress update
   * @param update - Progress update to emit
   */
  emitProgress(update: ProgressUpdate): void {
    this.emit('progress', update);
  }

  /**
   * Clear all registered modules
   * Useful for testing
   */
  clearModules(): void {
    this.modules.clear();
    this.moduleResults.clear();
  }
}
