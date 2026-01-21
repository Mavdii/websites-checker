/**
 * URL Validator for Cruel Stack
 * 
 * Validates URLs for website analysis with comprehensive checks for:
 * - HTTP/HTTPS protocol validation
 * - Query parameters, fragments, and authentication tokens
 * - Descriptive error messages for invalid URLs
 * 
 * Requirements: 1.1, 1.2, 1.4
 */

/**
 * Result of URL validation
 */
export interface URLValidationResult {
  /**
   * Whether the URL is valid
   */
  valid: boolean;

  /**
   * Descriptive error message if invalid
   */
  error?: string;

  /**
   * Parsed URL components if valid
   */
  parsed?: ParsedURL;
}

/**
 * Parsed URL components
 */
export interface ParsedURL {
  /**
   * Full URL string
   */
  url: string;

  /**
   * Protocol (http or https)
   */
  protocol: string;

  /**
   * Hostname
   */
  hostname: string;

  /**
   * Port number (if specified)
   */
  port?: string;

  /**
   * Path component
   */
  path: string;

  /**
   * Query parameters
   */
  query?: string;

  /**
   * Fragment/hash
   */
  fragment?: string;

  /**
   * Authentication credentials (if present)
   */
  auth?: {
    username: string;
    password?: string;
  };
}

/**
 * Validates a URL for website analysis
 * 
 * @param input - The URL string to validate
 * @returns Validation result with error message if invalid
 * 
 * @example
 * ```typescript
 * const result = validateURL('https://example.com');
 * if (result.valid) {
 *   console.log('Valid URL:', result.parsed);
 * } else {
 *   console.error('Invalid URL:', result.error);
 * }
 * ```
 */
export function validateURL(input: string): URLValidationResult {
  // Check for empty or whitespace-only input
  if (typeof input !== 'string') {
    return {
      valid: false,
      error: 'URL is required and must be a string',
    };
  }

  if (input === '') {
    return {
      valid: false,
      error: 'URL cannot be empty',
    };
  }

  const trimmedInput = input.trim();
  if (trimmedInput.length === 0) {
    return {
      valid: false,
      error: 'URL cannot be empty or whitespace',
    };
  }

  // Check for extremely long URLs (potential DoS)
  if (trimmedInput.length > 2048) {
    return {
      valid: false,
      error: 'URL exceeds maximum length of 2048 characters',
    };
  }

  // Try to parse the URL
  let url: URL;
  try {
    url = new URL(trimmedInput);
  } catch (error) {
    // Provide more specific error messages for common issues
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (trimmedInput.includes(' ')) {
      return {
        valid: false,
        error: 'URL contains invalid spaces. URLs must not contain unencoded spaces.',
      };
    }

    if (!trimmedInput.includes('://')) {
      return {
        valid: false,
        error: 'URL must include a protocol (e.g., https://example.com)',
      };
    }

    if (trimmedInput.startsWith('//')) {
      return {
        valid: false,
        error: 'URL must include a protocol before // (e.g., https://example.com)',
      };
    }

    return {
      valid: false,
      error: `Invalid URL format: ${errorMessage}`,
    };
  }

  // Validate protocol is HTTP or HTTPS (Requirement 1.1)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return {
      valid: false,
      error: `Invalid protocol "${url.protocol}". Only HTTP and HTTPS protocols are supported.`,
    };
  }

  // Validate hostname exists
  if (!url.hostname || url.hostname.length === 0) {
    return {
      valid: false,
      error: 'URL must include a valid hostname',
    };
  }

  // Check for localhost/private IPs (optional security check)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '0.0.0.0') {
    return {
      valid: false,
      error: 'Localhost URLs are not allowed for security reasons',
    };
  }

  // Check for private IP ranges (basic check)
  if (isPrivateIP(url.hostname)) {
    return {
      valid: false,
      error: 'Private IP addresses are not allowed for security reasons',
    };
  }

  // Validate hostname format (basic check for valid characters)
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!hostnameRegex.test(url.hostname)) {
    // Check if it might be an IPv6 address
    if (!url.hostname.startsWith('[') || !url.hostname.endsWith(']')) {
      return {
        valid: false,
        error: 'Invalid hostname format. Hostname must contain only letters, numbers, dots, and hyphens.',
      };
    }
  }

  // Parse authentication credentials if present (Requirement 1.4)
  let auth: { username: string; password?: string } | undefined;
  if (url.username) {
    auth = {
      username: decodeURIComponent(url.username),
      password: url.password ? decodeURIComponent(url.password) : undefined,
    };
  }

  // Build parsed URL result (Requirement 1.4 - support query params, fragments, auth)
  const parsed: ParsedURL = {
    url: url.href,
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
    port: url.port || undefined,
    path: url.pathname,
    query: url.search ? (url.search.substring(1) || undefined) : undefined,
    fragment: url.hash ? (url.hash.substring(1) || undefined) : undefined,
    auth,
  };

  return {
    valid: true,
    parsed,
  };
}

/**
 * Check if a hostname is a private IP address
 * @param hostname - The hostname to check
 * @returns True if the hostname is a private IP
 */
function isPrivateIP(hostname: string): boolean {
  // IPv4 private ranges
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  
  if (match) {
    const octets = match.slice(1, 5).map(Number);
    
    // Validate octets are in range
    if (octets.some(octet => octet < 0 || octet > 255)) {
      return false;
    }

    // Check private ranges:
    // 10.0.0.0/8
    if (octets[0] === 10) return true;
    
    // 172.16.0.0/12
    if (octets[0] === 172 && octets[1]! >= 16 && octets[1]! <= 31) return true;
    
    // 192.168.0.0/16
    if (octets[0] === 192 && octets[1] === 168) return true;
    
    // 169.254.0.0/16 (link-local)
    if (octets[0] === 169 && octets[1] === 254) return true;
  }

  return false;
}

/**
 * Validates multiple URLs and returns results for each
 * @param urls - Array of URL strings to validate
 * @returns Array of validation results
 */
export function validateURLs(urls: string[]): URLValidationResult[] {
  return urls.map(url => validateURL(url));
}

/**
 * Checks if a URL string is valid (convenience function)
 * @param url - The URL string to check
 * @returns True if valid, false otherwise
 */
export function isValidURL(url: string): boolean {
  return validateURL(url).valid;
}
