/**
 * Example analysis module demonstrating the module interface
 * 
 * This is a simple example module that can be used as a template
 * for implementing actual analysis modules.
 */

import type { AnalysisModule, AnalysisContext } from '../types';

export interface ExampleModuleResults {
  url: string;
  timestamp: Date;
  message: string;
}

/**
 * Example module that demonstrates the basic structure
 * of an analysis module
 */
export const exampleModule: AnalysisModule<ExampleModuleResults> = {
  name: 'example',
  phase: 'crawl',
  dependencies: [],

  async execute(context: AnalysisContext): Promise<ExampleModuleResults> {
    // Simulate some async work
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      url: context.url,
      timestamp: new Date(),
      message: `Analyzed ${context.url} with max depth ${context.options.maxDepth}`,
    };
  },
};
