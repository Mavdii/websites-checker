/**
 * Report types for Cruel Stack
 */

export interface ForensicReport {
  metadata: ReportMetadata;
  summary: ExecutiveSummary;
  sections: ReportSections;
}

export interface ReportMetadata {
  reportId: string;
  targetUrl: string;
  analysisDate: Date;
  analysisDuration: number;
  pagesAnalyzed: number;
}

export interface ExecutiveSummary {
  overallScore: number;
  keyFindings: string[];
  criticalIssues: string[];
  technologyStack: string[];
}

export interface ReportSections {
  crawl?: CrawlSection;
  performance?: PerformanceSection;
  security?: SecuritySection;
  technologies?: TechnologySection;
}

export interface CrawlSection {
  totalPages: number;
  routingStrategy: string;
  apiEndpoints: number;
  staticResources: number;
  responseTime: number;
  statusCode: number;
}

export interface PerformanceSection {
  score: number;
  metrics: Record<string, number>;
}

export interface SecuritySection {
  score: number;
  issues: string[];
}

export interface TechnologySection {
  detected: string[];
  confidence: Record<string, number>;
}
