/**
 * Basic Crawler Module for Cruel Stack MVP
 * 
 * Fetches and analyzes web pages
 */

import type { AnalysisModule, AnalysisContext, CrawlResults, PageInfo } from '../../types';
import { extractLinks, categorizeLinks, detectJavaScriptNavigation } from './link-extractor';

export const crawlerModule: AnalysisModule<CrawlResults> = {
  name: 'crawler',
  phase: 'crawl',
  dependencies: [],
  
  async execute(context: AnalysisContext): Promise<CrawlResults> {
    const startTime = Date.now();
    
    try {
      // Fetch the main page
      const response = await fetch(context.url, {
        headers: {
          'User-Agent': 'Cruel-Stack-Analyzer/1.0',
        },
      });
      
      const html = await response.text();
      const responseTime = Date.now() - startTime;
      
      // Extract basic page info
      const pageInfo: PageInfo = {
        url: context.url,
        depth: 0,
        statusCode: response.status,
        responseTime,
        contentType: response.headers.get('content-type') || 'text/html',
        size: html.length,
      };
      
      // Extract links using advanced extractor
      const allLinks = extractLinks(html, context.url);
      const categorized = categorizeLinks(allLinks, context.url);
      const jsNavigation = detectJavaScriptNavigation(html);
      
      context.logger?.info('Links extracted', {
        total: allLinks.length,
        internal: categorized.internal.length,
        external: categorized.external.length,
        api: categorized.api.length,
        resources: categorized.resources.length,
      });
      
      // Use categorized resources
      const staticResources = categorized.resources.map(link => ({
        url: link.url,
        type: link.source.includes('image') ? 'image' : 
              link.source.includes('script') ? 'script' :
              link.source.includes('stylesheet') ? 'stylesheet' : 'other',
        size: 0,
      }));
      
      // Use categorized API endpoints
      const apiEndpoints = categorized.api.map(link => ({
        url: link.url,
        method: 'GET',
      }));
      
      // Detect routing strategy (improved)
      let routingStrategy = 'Unknown';
      const htmlLower = html.toLowerCase();
      
      if (jsNavigation.includes('Next.js Router')) {
        routingStrategy = 'Next.js (App Router / Pages Router)';
      } else if (jsNavigation.includes('React Router')) {
        routingStrategy = 'React SPA with React Router';
      } else if (jsNavigation.includes('Vue Router')) {
        routingStrategy = 'Vue.js SPA with Vue Router';
      } else if (jsNavigation.includes('Angular Router')) {
        routingStrategy = 'Angular SPA with Angular Router';
      } else if (htmlLower.includes('next') || htmlLower.includes('_next')) {
        routingStrategy = 'Next.js (SSR/SSG)';
      } else if (htmlLower.includes('react') && htmlLower.includes('root')) {
        routingStrategy = 'React SPA (CSR)';
      } else if (htmlLower.includes('vue')) {
        routingStrategy = 'Vue.js SPA';
      } else if (htmlLower.includes('angular')) {
        routingStrategy = 'Angular SPA';
      } else if (jsNavigation.includes('History API')) {
        routingStrategy = 'SPA with History API';
      } else if (jsNavigation.includes('Hash-based Routing')) {
        routingStrategy = 'SPA with Hash Routing';
      } else if (categorized.internal.length > 10) {
        routingStrategy = 'Traditional MPA (SSR)';
      }
      
      context.logger?.info('Routing strategy detected', { routingStrategy, jsNavigation });
      
      return {
        pages: [pageInfo],
        siteMap: {
          root: context.url,
          pages: new Map([[context.url, pageInfo]]),
        },
        routingStrategy,
        apiEndpoints,
        staticResources,
      };
    } catch (error) {
      console.error('Crawler error:', error);
      
      // Return minimal results on error
      return {
        pages: [{
          url: context.url,
          depth: 0,
          statusCode: 0,
          responseTime: Date.now() - startTime,
          contentType: 'error',
          size: 0,
        }],
        siteMap: {
          root: context.url,
          pages: new Map(),
        },
        routingStrategy: 'Error',
        apiEndpoints: [],
        staticResources: [],
      };
    }
  },
};
