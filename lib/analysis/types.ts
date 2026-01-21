/**
 * Core types for the Cruel Stack analysis engine
 */

/**
 * Analysis phases that modules can belong to
 */
export type AnalysisPhase =
  | 'crawl'
  | 'technology'
  | 'performance'
  | 'security'
  | 'seo'
  | 'accessibility'
  | 'css'
  | 'functionality';

/**
 * Status of an analysis job
 */
export type AnalysisStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Configuration options for analysis
 */
export interface AnalysisOptions {
  maxDepth: number;
  respectRobotsTxt: boolean;
  includeExternalLinks: boolean;
  performanceRuns: number;
}

/**
 * Context passed to analysis modules during execution
 */
export interface AnalysisContext {
  url: string;
  options: AnalysisOptions;
  logger?: AnalysisLogger;
  cache?: CacheManager;
  // Browser will be added when browser automation layer is implemented
  // browser?: Browser;
  // Crawl results available after crawler module completes
  crawlResults?: CrawlResults;
}

/**
 * Logger with correlation IDs
 */
export interface AnalysisLogger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: unknown): void;
  debug(message: string, data?: unknown): void;
}

/**
 * Cache manager interface
 */
export interface CacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

/**
 * Results from the crawler module
 * Placeholder for now, will be fully implemented in crawler module
 */
export interface CrawlResults {
  pages: PageInfo[];
  siteMap: SiteMap;
  routingStrategy: string;
  apiEndpoints: APIEndpoint[];
  staticResources: Resource[];
}

export interface PageInfo {
  url: string;
  depth: number;
  statusCode: number;
  responseTime: number;
  contentType: string;
  size: number;
}

export interface SiteMap {
  root: string;
  pages: Map<string, PageInfo>;
}

export interface APIEndpoint {
  url: string;
  method: string;
}

export interface Resource {
  url: string;
  type: string;
  size: number;
}

/**
 * Base interface for all analysis modules
 */
export interface AnalysisModule<T = unknown> {
  /**
   * Unique name of the module
   */
  name: string;

  /**
   * Analysis phase this module belongs to
   */
  phase: AnalysisPhase;

  /**
   * Names of modules this module depends on
   * These modules must complete before this module can execute
   */
  dependencies: string[];

  /**
   * Execute the analysis module
   * @param context - Analysis context with URL, options, and shared data
   * @returns Promise resolving to module-specific results
   */
  execute(context: AnalysisContext): Promise<T>;
}

/**
 * Results from all analysis modules
 */
export interface AnalysisResults {
  crawlData?: CrawlResults;
  performanceData?: unknown;
  securityData?: unknown;
  technologyData?: unknown;
  seoData?: unknown;
  accessibilityData?: unknown;
  cssData?: unknown;
  functionalityData?: unknown;
}

/**
 * Progress update emitted during analysis
 */
export interface ProgressUpdate {
  phase: AnalysisPhase;
  progress: number; // 0-100
  currentTask: string;
  discoveries: Discovery[];
  metrics: LiveMetrics;
}

/**
 * Discovery made during analysis
 */
export interface Discovery {
  type: 'technology' | 'issue' | 'page' | 'resource';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
}

/**
 * Live metrics during analysis
 */
export interface LiveMetrics {
  pagesCrawled: number;
  issuesFound: number;
  technologiesDetected: number;
  resourcesAnalyzed: number;
}

/**
 * Analysis job information
 */
export interface AnalysisJob {
  id: string;
  url: string;
  status: AnalysisStatus;
  options: AnalysisOptions;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}
