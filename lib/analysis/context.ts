/**
 * Analysis Context and Shared Utilities
 * 
 * Provides shared context and utilities for analysis modules
 */

import type { AnalysisContext, AnalysisOptions } from './types';

/**
 * Create a new analysis context
 */
export function createAnalysisContext(
  url: string,
  options: AnalysisOptions
): AnalysisContext {
  return {
    url,
    options,
  };
}

/**
 * Logger with correlation IDs for tracking analysis execution
 */
export class AnalysisLogger {
  private correlationId: string;
  
  constructor(correlationId: string) {
    this.correlationId = correlationId;
  }
  
  info(message: string, data?: unknown): void {
    console.log(`[${this.correlationId}] INFO: ${message}`, data || '');
  }
  
  warn(message: string, data?: unknown): void {
    console.warn(`[${this.correlationId}] WARN: ${message}`, data || '');
  }
  
  error(message: string, error?: unknown): void {
    console.error(`[${this.correlationId}] ERROR: ${message}`, error || '');
  }
  
  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.correlationId}] DEBUG: ${message}`, data || '');
    }
  }
}

/**
 * Create a logger for an analysis job
 */
export function createLogger(jobId: string): AnalysisLogger {
  return new AnalysisLogger(jobId);
}
