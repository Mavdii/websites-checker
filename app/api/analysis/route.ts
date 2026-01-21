/**
 * Analysis API Route
 * 
 * POST /api/analysis - Start new analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateURL } from '@/lib/validation';
import { Orchestrator } from '@/lib/analysis';
import { crawlerModule } from '@/lib/analysis/modules/crawler';
import { generateReport } from '@/lib/report';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await request.json();
    const { url, options } = body;
    
    // Validate URL
    const validation = validateURL(url);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false,
          error: validation.error 
        },
        { status: 400 }
      );
    }
    
    // Create orchestrator and register modules
    const orchestrator = new Orchestrator();
    orchestrator.registerModule(crawlerModule);
    
    // Execute analysis
    const results = await orchestrator.executeAnalysis({
      id: crypto.randomUUID(),
      url: validation.parsed!.url,
      status: 'running',
      options: {
        maxDepth: options?.maxDepth || 3,
        respectRobotsTxt: options?.respectRobotsTxt ?? true,
        includeExternalLinks: options?.includeExternalLinks ?? false,
        performanceRuns: options?.performanceRuns || 1,
      },
      createdAt: new Date(),
    });
    
    // Calculate duration
    const duration = Date.now() - startTime;
    
    // Generate report
    const report = generateReport(validation.parsed!.url, results, duration);
    
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: `Analysis failed: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
