# Cruel Stack Analysis Engine

The Analysis Engine is the core orchestration system for Cruel Stack's website analysis platform. It manages the execution of modular analysis components, handles dependencies, and emits real-time progress updates.

## Architecture

The Analysis Engine follows a modular architecture where independent analysis modules can be registered and executed in dependency order. The `Orchestrator` class manages the lifecycle of these modules.

### Key Components

1. **Orchestrator**: Central coordinator that manages module registration, dependency resolution, and execution
2. **AnalysisModule**: Interface that all analysis modules must implement
3. **AnalysisContext**: Shared context passed to all modules containing URL, options, and results from previous modules
4. **Progress Events**: Real-time updates emitted during analysis execution

## Usage

### Creating an Analysis Module

All analysis modules must implement the `AnalysisModule` interface:

```typescript
import type { AnalysisModule, AnalysisContext } from './types';

export const myModule: AnalysisModule<MyResults> = {
  name: 'my-module',
  phase: 'performance',
  dependencies: ['crawler'], // This module depends on the crawler module
  
  async execute(context: AnalysisContext): Promise<MyResults> {
    // Access the URL being analyzed
    const url = context.url;
    
    // Access analysis options
    const maxDepth = context.options.maxDepth;
    
    // Access results from dependency modules
    const crawlResults = context.crawlResults;
    
    // Perform analysis
    const results = await performAnalysis(url, crawlResults);
    
    return results;
  }
};
```

### Using the Orchestrator

```typescript
import { Orchestrator } from './orchestrator';
import { crawlerModule } from './modules/crawler';
import { performanceModule } from './modules/performance';

// Create orchestrator instance
const orchestrator = new Orchestrator();

// Register modules
orchestrator.registerModule(crawlerModule);
orchestrator.registerModule(performanceModule);

// Listen to events
orchestrator.on('progress', (update) => {
  console.log(`Progress: ${update.progress}% - ${update.currentTask}`);
});

orchestrator.on('moduleComplete', (moduleName, results) => {
  console.log(`Module ${moduleName} completed`);
});

orchestrator.on('complete', (results) => {
  console.log('Analysis complete!', results);
});

// Execute analysis
const job = {
  id: 'job-123',
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

const results = await orchestrator.executeAnalysis(job);
```

## Module Dependencies

The Orchestrator automatically resolves module dependencies using topological sort. Modules are executed in an order that ensures all dependencies complete before dependent modules run.

### Example Dependency Graph

```
crawler (no dependencies)
  ├─> technology (depends on crawler)
  ├─> performance (depends on crawler)
  └─> seo (depends on crawler)
        └─> accessibility (depends on seo)
```

Execution order: `crawler` → `technology`, `performance`, `seo` (parallel) → `accessibility`

### Circular Dependencies

The Orchestrator detects circular dependencies and throws an error:

```typescript
// This will throw an error
moduleA.dependencies = ['moduleB'];
moduleB.dependencies = ['moduleA'];
```

## Error Handling

The Orchestrator implements graceful degradation. If a module fails:

1. The error is logged and emitted via the `moduleError` event
2. Execution continues with remaining modules
3. The final results include data from successful modules only

```typescript
orchestrator.on('moduleError', (moduleName, error) => {
  console.error(`Module ${moduleName} failed:`, error);
  // Handle error (e.g., notify user, log to monitoring service)
});
```

## Progress Events

The Orchestrator emits several events during execution:

- `progress`: Emitted after each module completes with progress percentage
- `moduleStart`: Emitted when a module begins execution
- `moduleComplete`: Emitted when a module successfully completes
- `moduleError`: Emitted when a module fails
- `complete`: Emitted when all modules finish (success or failure)
- `error`: Emitted for orchestrator-level errors (e.g., circular dependencies)

## Analysis Phases

Modules are organized into phases:

- `crawl`: Website discovery and mapping
- `technology`: Technology stack detection
- `performance`: Performance measurement and optimization analysis
- `security`: Security vulnerability scanning
- `seo`: SEO and metadata analysis
- `accessibility`: Accessibility compliance checking
- `css`: CSS and styling analysis
- `functionality`: Functional testing and validation

## Context Sharing

The `AnalysisContext` is shared across all modules and updated as modules complete:

```typescript
interface AnalysisContext {
  url: string;                    // Target URL
  options: AnalysisOptions;       // Analysis configuration
  crawlResults?: CrawlResults;    // Available after crawler module
  // Additional fields added by browser automation layer
}
```

## Testing

The Orchestrator includes comprehensive unit tests covering:

- Module registration and validation
- Dependency resolution (simple and complex)
- Circular dependency detection
- Error handling and graceful degradation
- Progress event emission
- Context management

Run tests:

```bash
npm test -- orchestrator.test.ts
```

## Future Enhancements

- **Parallel Execution**: Execute independent modules in parallel for better performance
- **Module Priorities**: Allow modules to specify execution priority
- **Conditional Execution**: Skip modules based on runtime conditions
- **Module Caching**: Cache module results for repeated analyses
- **Streaming Results**: Stream partial results as modules complete

## Requirements Validation

This implementation validates the following requirements:

- **Requirement 2.1**: Analysis Engine fetches and analyzes pages (via module system)
- **Requirement 2.2**: Respects robots.txt and crawl policies (via options)
- **Requirement 11.1-11.5**: Real-time progress visualization (via progress events)

## Design Properties

This implementation supports the following design properties:

- **Property 17**: Real-time Progress Streaming - Progress updates are emitted as modules execute
- **Property 18**: Analysis Cancellation - Can be extended to support cancellation
