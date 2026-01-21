'use client';

import { useState } from 'react';
import { validateURL } from '@/lib/validation';
import type { ForensicReport } from '@/lib/report';

export function URLInputForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ForensicReport | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setReport(null);
    
    // Validate URL
    const validation = validateURL(url);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }
    
    // Submit analysis
    setLoading(true);
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Analysis failed');
        return;
      }
      
      setReport(data.report);
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTryExample = () => {
    setUrl('https://example.com');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-primary font-mono">
          CRUEL STACK
        </h1>
        <p className="text-xl text-muted-foreground">
          Professional Website Analysis & Technical Forensics
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Comprehensive audit covering architecture, performance, and security
        </p>
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2 text-foreground">
            Target Website URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono"
            disabled={loading}
            autoComplete="off"
          />
          {error && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Enter any public HTTP/HTTPS website URL for analysis
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !url}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span>
                Analyzing...
              </span>
            ) : (
              '🔍 Analyze Website'
            )}
          </button>
          
          <button
            type="button"
            onClick={handleTryExample}
            disabled={loading}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Try Example
          </button>
        </div>
      </form>
      
      {/* Report Display */}
      {report && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Summary Card */}
          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-primary">Analysis Report</h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {report.summary.overallScore}
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
                <div className="text-xs text-muted-foreground">Overall Score</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Target:</span>
                <div className="font-mono text-foreground break-all">
                  {report.metadata.targetUrl}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <div className="text-foreground">
                  {(report.metadata.analysisDuration / 1000).toFixed(2)}s
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Pages Analyzed:</span>
                <div className="text-foreground">{report.metadata.pagesAnalyzed}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Report ID:</span>
                <div className="font-mono text-xs text-foreground">
                  {report.metadata.reportId.slice(0, 8)}...
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Findings */}
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-secondary">Key Findings</h3>
            <ul className="space-y-2">
              {report.summary.keyFindings.map((finding, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-secondary mt-1">▸</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Technology Stack */}
          {report.summary.technologyStack.length > 0 && (
            <div className="p-6 bg-card border border-border rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-accent">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                {report.summary.technologyStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted text-foreground rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Crawl Details */}
          {report.sections.crawl && (
            <div className="p-6 bg-card border border-border rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-primary">Crawl Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {report.sections.crawl.statusCode}
                  </div>
                  <div className="text-sm text-muted-foreground">Status Code</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-secondary">
                    {report.sections.crawl.responseTime}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-accent">
                    {report.sections.crawl.staticResources}
                  </div>
                  <div className="text-sm text-muted-foreground">Resources</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-info">
                    {report.sections.crawl.apiEndpoints}
                  </div>
                  <div className="text-sm text-muted-foreground">API Endpoints</div>
                </div>
                <div className="p-4 bg-muted rounded-lg col-span-2">
                  <div className="text-lg font-bold text-foreground">
                    {report.sections.crawl.routingStrategy}
                  </div>
                  <div className="text-sm text-muted-foreground">Routing Strategy</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Analysis completed at {new Date(report.metadata.analysisDate).toLocaleString()}</p>
            <p className="mt-2">
              Powered by <span className="text-primary font-mono">CRUEL STACK</span> - Professional Website Analysis Platform
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
