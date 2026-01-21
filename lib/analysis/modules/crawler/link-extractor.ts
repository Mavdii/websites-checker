/**
 * Link Extraction Utilities
 * 
 * Extracts links from HTML with support for various attributes
 */

import * as cheerio from 'cheerio';

export interface ExtractedLink {
  url: string;
  text: string;
  type: 'navigation' | 'resource' | 'api' | 'external';
  source: string; // href, src, srcset, data-*, etc.
}

/**
 * Extract all links from HTML
 */
export function extractLinks(
  html: string,
  baseUrl: string
): ExtractedLink[] {
  const $ = cheerio.load(html);
  const links: ExtractedLink[] = [];
  const seenUrls = new Set<string>();
  
  // Helper to add link if not seen
  const addLink = (url: string, text: string, type: ExtractedLink['type'], source: string) => {
    try {
      const absoluteUrl = new URL(url, baseUrl).href;
      if (!seenUrls.has(absoluteUrl)) {
        seenUrls.add(absoluteUrl);
        links.push({ url: absoluteUrl, text, type, source });
      }
    } catch {
      // Invalid URL, skip
    }
  };
  
  // Extract from href attributes
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    const text = $(element).text().trim();
    if (href) {
      const isExternal = href.startsWith('http') && !href.includes(new URL(baseUrl).hostname);
      addLink(href, text, isExternal ? 'external' : 'navigation', 'href');
    }
  });
  
  // Extract from src attributes (images, scripts, iframes)
  $('[src]').each((_, element) => {
    const src = $(element).attr('src');
    const tagName = element.tagName.toLowerCase();
    if (src) {
      addLink(src, '', 'resource', `src (${tagName})`);
    }
  });
  
  // Extract from srcset attributes
  $('[srcset]').each((_, element) => {
    const srcset = $(element).attr('srcset');
    if (srcset) {
      // Parse srcset format: "url1 1x, url2 2x"
      const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
      urls.forEach(url => {
        if (url) {
          addLink(url, '', 'resource', 'srcset');
        }
      });
    }
  });
  
  // Extract from data-* attributes (common in SPAs)
  $('[data-src], [data-href], [data-url]').each((_, element) => {
    const dataSrc = $(element).attr('data-src');
    const dataHref = $(element).attr('data-href');
    const dataUrl = $(element).attr('data-url');
    
    if (dataSrc) addLink(dataSrc, '', 'resource', 'data-src');
    if (dataHref) addLink(dataHref, '', 'navigation', 'data-href');
    if (dataUrl) addLink(dataUrl, '', 'navigation', 'data-url');
  });
  
  // Extract from link tags (stylesheets, preload, etc.)
  $('link[href]').each((_, element) => {
    const href = $(element).attr('href');
    const rel = $(element).attr('rel');
    if (href) {
      addLink(href, '', 'resource', `link (${rel || 'unknown'})`);
    }
  });
  
  // Extract from inline scripts (fetch, axios, etc.)
  $('script:not([src])').each((_, element) => {
    const scriptContent = $(element).html() || '';
    
    // Match fetch() calls
    const fetchMatches = scriptContent.match(/fetch\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (fetchMatches) {
      fetchMatches.forEach(match => {
        const urlMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (urlMatch && urlMatch[1]) {
          addLink(urlMatch[1], '', 'api', 'fetch()');
        }
      });
    }
    
    // Match axios calls
    const axiosMatches = scriptContent.match(/axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (axiosMatches) {
      axiosMatches.forEach(match => {
        const urlMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (urlMatch && urlMatch[1]) {
          addLink(urlMatch[1], '', 'api', 'axios');
        }
      });
    }
  });
  
  return links;
}

/**
 * Categorize links by type
 */
export function categorizeLinks(links: ExtractedLink[], baseUrl: string) {
  const baseHostname = new URL(baseUrl).hostname;
  
  const internal: ExtractedLink[] = [];
  const external: ExtractedLink[] = [];
  const api: ExtractedLink[] = [];
  const resources: ExtractedLink[] = [];
  
  for (const link of links) {
    try {
      const linkUrl = new URL(link.url);
      const isInternal = linkUrl.hostname === baseHostname;
      
      if (link.type === 'api') {
        api.push(link);
      } else if (link.type === 'resource') {
        resources.push(link);
      } else if (isInternal) {
        internal.push(link);
      } else {
        external.push(link);
      }
    } catch {
      // Invalid URL, skip
    }
  }
  
  return { internal, external, api, resources };
}

/**
 * Detect JavaScript-based navigation patterns
 */
export function detectJavaScriptNavigation(html: string): string[] {
  const patterns: string[] = [];
  
  // Check for common SPA frameworks
  if (html.includes('react-router') || html.includes('ReactRouter')) {
    patterns.push('React Router');
  }
  
  if (html.includes('vue-router') || html.includes('VueRouter')) {
    patterns.push('Vue Router');
  }
  
  if (html.includes('@angular/router')) {
    patterns.push('Angular Router');
  }
  
  if (html.includes('next/router') || html.includes('next/navigation')) {
    patterns.push('Next.js Router');
  }
  
  // Check for history API usage
  if (html.includes('pushState') || html.includes('replaceState')) {
    patterns.push('History API');
  }
  
  // Check for hash-based routing
  if (html.includes('window.location.hash') || html.includes('onhashchange')) {
    patterns.push('Hash-based Routing');
  }
  
  return patterns;
}
