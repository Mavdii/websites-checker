/**
 * Cruel Stack Analysis Engine
 * 
 * Core orchestration and module management for website analysis
 */

export { Orchestrator } from './orchestrator';
export { createAnalysisContext, createLogger, AnalysisLogger } from './context';
export { createCacheManager, CacheManager } from './cache';
export type { OrchestratorEvents } from './orchestrator';

export type {
  AnalysisModule,
  AnalysisContext,
  AnalysisResults,
  AnalysisJob,
  AnalysisOptions,
  AnalysisPhase,
  AnalysisStatus,
  ProgressUpdate,
  Discovery,
  LiveMetrics,
  CrawlResults,
  PageInfo,
  SiteMap,
  APIEndpoint,
  Resource,
} from './types';
