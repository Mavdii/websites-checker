/**
 * Basic usage example for the Cruel Stack Analysis Engine
 * 
 * This example demonstrates how to:
 * 1. Create an Orchestrator instance
 * 2. Register analysis modules
 * 3. Listen to progress events
 * 4. Execute an analysis job
 */

import { Orchestrator } from '../orchestrator';
import type { AnalysisModule, AnalysisJob } from '../types';

// Example: Create a simple crawler module
const crawlerModule: AnalysisModule = {
  name: 'crawler',
  phase: 'crawl',
  dependencies: [],

  async execute(context) {
    console.log(`Crawling ${context.url}...`);
    
    // Simulate crawling work
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      pages: [
        { url: context.url, depth: 0, statusCode: 200, responseTime: 150, contentType: 'text/html', size: 50000 },
        { url: `${context.url}/about`, depth: 1, statusCode: 200, responseTime: 120, contentType: 'text/html', size: 30000 },
      ],
      siteMap: {
        root: context.url,
        pages: new Map(),
      },
      routingStrategy: 'SSR',
      apiEndpoints: [],
      staticResources: [],
    };
  },
};

// Example: Create a performance module that depends on crawler
const performanceModule: AnalysisModule = {
  name: 'performance',
  phase: 'performance',
  dependencies: ['crawler'],

  async execute(context) {
    console.log(`Analyzing performance for ${context.url}...`);
    
    // Access crawl results from context
    const pageCount = context.crawlResults?.pages.length || 0;
    console.log(`Found ${pageCount} pages to analyze`);

    // Simulate performance analysis
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      coreWebVitals: {
        lcp: { value: 2.5, rating: 'good' },
        cls: { value: 0.1, rating: 'good' },
        fid: { value: 100, rating: 'good' },
      },
      lighthouseScore: 85,
    };
  },
};

// Example: Create a technology detection module
const technologyModule: AnalysisModule = {
  name: 'technology',
  phase: 'technology',
  dependencies: ['crawler'],

  async execute(context) {
    console.log(`Detecting technologies for ${context.url}...`);

    // Simulate technology detection
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      frontend: {
        framework: { name: 'Next.js', version: '14.0.0', confidence: 0.95 },
        libraries: [
          { name: 'React', version: '18.2.0', confidence: 0.98 },
          { name: 'Tailwind CSS', version: '3.3.0', confidence: 0.90 },
        ],
      },
      backend: {
        server: { name: 'Node.js', confidence: 0.85 },
      },
    };
  },
};

/**
 * Main function demonstrating the analysis workflow
 */
async function runAnalysis() {
  console.log('=== Cruel Stack Analysis Engine Demo ===\n');

  // 1. Create orchestrator
  const orchestrator = new Orchestrator();

  // 2. Register modules
  console.log('Registering analysis modules...');
  orchestrator.registerModule(crawlerModule);
  orchestrator.registerModule(performanceModule);
  orchestrator.registerModule(technologyModule);
  console.log(`Registered ${orchestrator.getAllModules().length} modules\n`);

  // 3. Set up event listeners
  orchestrator.on('moduleStart', (moduleName) => {
    console.log(`▶ Starting module: ${moduleName}`);
  });

  orchestrator.on('moduleComplete', (moduleName) => {
    console.log(`✓ Completed module: ${moduleName}`);
  });

  orchestrator.on('moduleError', (moduleName, error) => {
    console.error(`✗ Module ${moduleName} failed:`, error.message);
  });

  orchestrator.on('progress', (update) => {
    console.log(`Progress: ${update.progress}% - ${update.currentTask}`);
  });

  orchestrator.on('complete', (results) => {
    console.log('\n=== Analysis Complete ===');
    console.log('Results summary:');
    console.log(`- Pages crawled: ${results.crawlData?.pages.length || 0}`);
    console.log(`- Technologies detected: ${results.technologyData ? 'Yes' : 'No'}`);
    console.log(`- Performance analyzed: ${results.performanceData ? 'Yes' : 'No'}`);
  });

  // 4. Create analysis job
  const job: AnalysisJob = {
    id: 'demo-job-001',
    url: 'https://example.com',
    status: 'running',
    options: {
      maxDepth: 3,
      respectRobotsTxt: true,
      includeExternalLinks: false,
      performanceRuns: 3,
    },
    createdAt: new Date(),
  };

  // 5. Execute analysis
  console.log(`Starting analysis for: ${job.url}\n`);
  try {
    const results = await orchestrator.executeAnalysis(job);
    
    console.log('\n=== Final Results ===');
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runAnalysis().catch(console.error);
}

export { runAnalysis };
