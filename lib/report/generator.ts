/**
 * Report Generator for Cruel Stack
 * 
 * Generates comprehensive analysis reports
 */

import type { AnalysisResults } from '../analysis/types';
import type { ForensicReport, CrawlSection } from './types';

export function generateReport(
  url: string,
  results: AnalysisResults,
  duration: number
): ForensicReport {
  const reportId = crypto.randomUUID();
  
  // Extract crawl data
  const crawlData = results.crawlData;
  const mainPage = crawlData?.pages[0];
  
  // Build crawl section
  const crawlSection: CrawlSection | undefined = crawlData ? {
    totalPages: crawlData.pages.length,
    routingStrategy: crawlData.routingStrategy,
    apiEndpoints: crawlData.apiEndpoints.length,
    staticResources: crawlData.staticResources.length,
    responseTime: mainPage?.responseTime || 0,
    statusCode: mainPage?.statusCode || 0,
  } : undefined;
  
  // Generate key findings
  const keyFindings: string[] = [];
  
  if (crawlSection) {
    keyFindings.push(`Analyzed ${crawlSection.totalPages} page(s)`);
    keyFindings.push(`Detected routing strategy: ${crawlSection.routingStrategy}`);
    keyFindings.push(`Found ${crawlSection.staticResources} static resources`);
    
    if (crawlSection.apiEndpoints > 0) {
      keyFindings.push(`Discovered ${crawlSection.apiEndpoints} API endpoint(s)`);
    }
    
    if (crawlSection.responseTime < 500) {
      keyFindings.push(`Fast response time: ${crawlSection.responseTime}ms`);
    } else if (crawlSection.responseTime > 2000) {
      keyFindings.push(`Slow response time: ${crawlSection.responseTime}ms - needs optimization`);
    }
  }
  
  // Detect technologies from crawl data
  const technologies: string[] = [];
  if (crawlSection?.routingStrategy.includes('Next.js')) {
    technologies.push('Next.js', 'React');
  } else if (crawlSection?.routingStrategy.includes('React')) {
    technologies.push('React');
  } else if (crawlSection?.routingStrategy.includes('Vue')) {
    technologies.push('Vue.js');
  } else if (crawlSection?.routingStrategy.includes('Angular')) {
    technologies.push('Angular');
  }
  
  // Check for common resources
  const resources = crawlData?.staticResources || [];
  const hasJQuery = resources.some(r => r.url.includes('jquery'));
  const hasTailwind = resources.some(r => r.url.includes('tailwind'));
  const hasBootstrap = resources.some(r => r.url.includes('bootstrap'));
  
  if (hasJQuery) technologies.push('jQuery');
  if (hasTailwind) technologies.push('Tailwind CSS');
  if (hasBootstrap) technologies.push('Bootstrap');
  
  // Calculate overall score (simple heuristic)
  let overallScore = 70; // Base score
  
  if (crawlSection) {
    // Good response time
    if (crawlSection.responseTime < 500) overallScore += 10;
    else if (crawlSection.responseTime > 2000) overallScore -= 10;
    
    // Successful status code
    if (crawlSection.statusCode === 200) overallScore += 5;
    else if (crawlSection.statusCode >= 400) overallScore -= 15;
    
    // Modern framework
    if (technologies.length > 0) overallScore += 5;
    
    // Has API endpoints (modern architecture)
    if (crawlSection.apiEndpoints > 0) overallScore += 5;
  }
  
  // Clamp score between 0-100
  overallScore = Math.max(0, Math.min(100, overallScore));
  
  return {
    metadata: {
      reportId,
      targetUrl: url,
      analysisDate: new Date(),
      analysisDuration: duration,
      pagesAnalyzed: crawlData?.pages.length || 0,
    },
    summary: {
      overallScore,
      keyFindings,
      criticalIssues: [],
      technologyStack: technologies,
    },
    sections: {
      crawl: crawlSection,
    },
  };
}
