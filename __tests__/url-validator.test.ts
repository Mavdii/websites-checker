/**
 * Unit tests for URL validator
 * 
 * Tests cover:
 * - Valid HTTP/HTTPS URLs
 * - Invalid protocols
 * - Query parameters, fragments, and auth tokens
 * - Descriptive error messages
 * - Edge cases and security checks
 */

import {
  validateURL,
  validateURLs,
  isValidURL,
  type URLValidationResult,
} from '../lib/validation/url-validator';

describe('URL Validator', () => {
  describe('validateURL - Valid URLs', () => {
    it('should accept valid HTTPS URL', () => {
      const result = validateURL('https://example.com');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.parsed).toBeDefined();
      expect(result.parsed?.protocol).toBe('https');
      expect(result.parsed?.hostname).toBe('example.com');
    });

    it('should accept valid HTTP URL', () => {
      const result = validateURL('http://example.com');
      expect(result.valid).toBe(true);
      expect(result.parsed?.protocol).toBe('http');
    });

    it('should accept URL with path', () => {
      const result = validateURL('https://example.com/path/to/page');
      expect(result.valid).toBe(true);
      expect(result.parsed?.path).toBe('/path/to/page');
    });

    it('should accept URL with query parameters', () => {
      const result = validateURL('https://example.com?foo=bar&baz=qux');
      expect(result.valid).toBe(true);
      expect(result.parsed?.query).toBe('foo=bar&baz=qux');
    });

    it('should accept URL with fragment', () => {
      const result = validateURL('https://example.com#section');
      expect(result.valid).toBe(true);
      expect(result.parsed?.fragment).toBe('section');
    });

    it('should accept URL with query and fragment', () => {
      const result = validateURL('https://example.com/page?foo=bar#section');
      expect(result.valid).toBe(true);
      expect(result.parsed?.query).toBe('foo=bar');
      expect(result.parsed?.fragment).toBe('section');
    });

    it('should accept URL with authentication credentials', () => {
      const result = validateURL('https://user:pass@example.com');
      expect(result.valid).toBe(true);
      expect(result.parsed?.auth).toBeDefined();
      expect(result.parsed?.auth?.username).toBe('user');
      expect(result.parsed?.auth?.password).toBe('pass');
    });

    it('should accept URL with username only', () => {
      const result = validateURL('https://user@example.com');
      expect(result.valid).toBe(true);
      expect(result.parsed?.auth?.username).toBe('user');
      expect(result.parsed?.auth?.password).toBeUndefined();
    });

    it('should accept URL with port', () => {
      const result = validateURL('https://example.com:8080');
      expect(result.valid).toBe(true);
      expect(result.parsed?.port).toBe('8080');
    });

    it('should accept URL with subdomain', () => {
      const result = validateURL('https://api.example.com');
      expect(result.valid).toBe(true);
      expect(result.parsed?.hostname).toBe('api.example.com');
    });

    it('should accept URL with multiple subdomains', () => {
      const result = validateURL('https://api.v2.example.com');
      expect(result.valid).toBe(true);
      expect(result.parsed?.hostname).toBe('api.v2.example.com');
    });

    it('should accept URL with all components', () => {
      const result = validateURL(
        'https://user:pass@api.example.com:8080/path/to/resource?foo=bar&baz=qux#section'
      );
      expect(result.valid).toBe(true);
      expect(result.parsed?.protocol).toBe('https');
      expect(result.parsed?.auth?.username).toBe('user');
      expect(result.parsed?.auth?.password).toBe('pass');
      expect(result.parsed?.hostname).toBe('api.example.com');
      expect(result.parsed?.port).toBe('8080');
      expect(result.parsed?.path).toBe('/path/to/resource');
      expect(result.parsed?.query).toBe('foo=bar&baz=qux');
      expect(result.parsed?.fragment).toBe('section');
    });

    it('should accept URL with encoded characters in query', () => {
      const result = validateURL('https://example.com?search=hello%20world');
      expect(result.valid).toBe(true);
      expect(result.parsed?.query).toBe('search=hello%20world');
    });

    it('should accept URL with encoded auth credentials', () => {
      const result = validateURL('https://user%40email:p%40ss@example.com');
      expect(result.valid).toBe(true);
      expect(result.parsed?.auth?.username).toBe('user@email');
      expect(result.parsed?.auth?.password).toBe('p@ss');
    });
  });

  describe('validateURL - Invalid Protocols', () => {
    it('should reject FTP protocol', () => {
      const result = validateURL('ftp://example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid protocol');
      expect(result.error).toContain('ftp:');
      expect(result.error).toContain('HTTP and HTTPS');
    });

    it('should reject file protocol', () => {
      const result = validateURL('file:///path/to/file');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid protocol');
    });

    it('should reject custom protocol', () => {
      const result = validateURL('custom://example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid protocol');
    });

    it('should reject URL without protocol', () => {
      const result = validateURL('example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('protocol');
    });

    it('should reject URL with protocol-like prefix but no colon', () => {
      const result = validateURL('https//example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateURL - Invalid Formats', () => {
    it('should reject empty string', () => {
      const result = validateURL('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject whitespace-only string', () => {
      const result = validateURL('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject non-string input', () => {
      const result = validateURL(null as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('string');
    });

    it('should reject undefined input', () => {
      const result = validateURL(undefined as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('string');
    });

    it('should reject URL with spaces', () => {
      const result = validateURL('https://example .com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('spaces');
    });

    it('should reject URL starting with //', () => {
      const result = validateURL('//example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('protocol');
    });

    it('should reject extremely long URL', () => {
      const longPath = 'a'.repeat(2100);
      const result = validateURL(`https://example.com/${longPath}`);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('maximum length');
    });

    it('should reject URL without hostname', () => {
      const result = validateURL('https://');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateURL - Security Checks', () => {
    it('should reject localhost', () => {
      const result = validateURL('https://localhost');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Localhost');
    });

    it('should reject 127.0.0.1', () => {
      const result = validateURL('https://127.0.0.1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Localhost');
    });

    it('should reject 0.0.0.0', () => {
      const result = validateURL('https://0.0.0.0');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Localhost');
    });

    it('should reject private IP 10.x.x.x', () => {
      const result = validateURL('https://10.0.0.1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Private IP');
    });

    it('should reject private IP 172.16.x.x', () => {
      const result = validateURL('https://172.16.0.1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Private IP');
    });

    it('should reject private IP 192.168.x.x', () => {
      const result = validateURL('https://192.168.1.1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Private IP');
    });

    it('should reject link-local IP 169.254.x.x', () => {
      const result = validateURL('https://169.254.1.1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Private IP');
    });

    it('should accept public IP address', () => {
      const result = validateURL('https://8.8.8.8');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateURL - Edge Cases', () => {
    it('should trim whitespace from input', () => {
      const result = validateURL('  https://example.com  ');
      expect(result.valid).toBe(true);
      expect(result.parsed?.hostname).toBe('example.com');
    });

    it('should handle URL with empty path', () => {
      const result = validateURL('https://example.com');
      expect(result.valid).toBe(true);
      expect(result.parsed?.path).toBe('/');
    });

    it('should handle URL with trailing slash', () => {
      const result = validateURL('https://example.com/');
      expect(result.valid).toBe(true);
      expect(result.parsed?.path).toBe('/');
    });

    it('should handle URL with empty query parameter', () => {
      const result = validateURL('https://example.com?');
      expect(result.valid).toBe(true);
      expect(result.parsed?.query).toBeUndefined();
    });

    it('should handle URL with empty fragment', () => {
      const result = validateURL('https://example.com#');
      expect(result.valid).toBe(true);
      expect(result.parsed?.fragment).toBeUndefined();
    });

    it('should handle URL with hyphenated domain', () => {
      const result = validateURL('https://my-example-site.com');
      expect(result.valid).toBe(true);
      expect(result.parsed?.hostname).toBe('my-example-site.com');
    });

    it('should handle URL with numbers in domain', () => {
      const result = validateURL('https://example123.com');
      expect(result.valid).toBe(true);
      expect(result.parsed?.hostname).toBe('example123.com');
    });

    it('should handle URL with TLD only', () => {
      const result = validateURL('https://example.co');
      expect(result.valid).toBe(true);
      expect(result.parsed?.hostname).toBe('example.co');
    });

    it('should handle URL with long TLD', () => {
      const result = validateURL('https://example.museum');
      expect(result.valid).toBe(true);
      expect(result.parsed?.hostname).toBe('example.museum');
    });
  });

  describe('validateURLs - Batch Validation', () => {
    it('should validate multiple URLs', () => {
      const urls = [
        'https://example.com',
        'http://test.com',
        'ftp://invalid.com',
        'https://valid.org',
      ];
      const results = validateURLs(urls);

      expect(results).toHaveLength(4);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(true);
      expect(results[2].valid).toBe(false);
      expect(results[3].valid).toBe(true);
    });

    it('should handle empty array', () => {
      const results = validateURLs([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('isValidURL - Convenience Function', () => {
    it('should return true for valid URL', () => {
      expect(isValidURL('https://example.com')).toBe(true);
    });

    it('should return false for invalid URL', () => {
      expect(isValidURL('not a url')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidURL('')).toBe(false);
    });
  });

  describe('validateURL - Descriptive Error Messages', () => {
    it('should provide descriptive error for missing protocol', () => {
      const result = validateURL('example.com');
      expect(result.error).toContain('protocol');
      expect(result.error).toContain('https://');
    });

    it('should provide descriptive error for invalid protocol', () => {
      const result = validateURL('ftp://example.com');
      expect(result.error).toContain('Invalid protocol');
      expect(result.error).toContain('HTTP and HTTPS');
    });

    it('should provide descriptive error for spaces', () => {
      const result = validateURL('https://example .com');
      expect(result.error).toContain('spaces');
      expect(result.error).toContain('unencoded');
    });

    it('should provide descriptive error for localhost', () => {
      const result = validateURL('https://localhost');
      expect(result.error).toContain('Localhost');
      expect(result.error).toContain('security');
    });

    it('should provide descriptive error for private IP', () => {
      const result = validateURL('https://192.168.1.1');
      expect(result.error).toContain('Private IP');
      expect(result.error).toContain('security');
    });

    it('should provide descriptive error for empty input', () => {
      const result = validateURL('');
      expect(result.error).toContain('empty');
    });

    it('should provide descriptive error for non-string input', () => {
      const result = validateURL(123 as any);
      expect(result.error).toContain('string');
    });
  });

  describe('validateURL - Real-World URLs', () => {
    it('should accept GitHub URL', () => {
      const result = validateURL('https://github.com/user/repo');
      expect(result.valid).toBe(true);
    });

    it('should accept Google URL with query', () => {
      const result = validateURL('https://www.google.com/search?q=test');
      expect(result.valid).toBe(true);
    });

    it('should accept URL with complex query parameters', () => {
      const result = validateURL(
        'https://example.com/api?filter[name]=test&sort=-created_at&page[number]=1'
      );
      expect(result.valid).toBe(true);
    });

    it('should accept URL with authentication token in query', () => {
      const result = validateURL(
        'https://api.example.com/data?token=abc123xyz'
      );
      expect(result.valid).toBe(true);
      expect(result.parsed?.query).toContain('token=abc123xyz');
    });

    it('should accept URL with deep path', () => {
      const result = validateURL(
        'https://example.com/api/v2/users/123/posts/456/comments'
      );
      expect(result.valid).toBe(true);
    });
  });
});
