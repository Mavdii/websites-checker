# URL Validation Module

This module provides comprehensive URL validation for the Cruel Stack website analysis platform.

## Features

- ✅ HTTP/HTTPS protocol validation (Requirement 1.1)
- ✅ Descriptive error messages for invalid URLs (Requirement 1.2)
- ✅ Support for query parameters, fragments, and authentication tokens (Requirement 1.4)
- ✅ Security checks (blocks localhost and private IPs)
- ✅ Comprehensive input validation
- ✅ URL component parsing

## Usage

### Basic Validation

```typescript
import { validateURL } from './lib/validation';

const result = validateURL('https://example.com');

if (result.valid) {
  console.log('Valid URL!');
  console.log('Hostname:', result.parsed?.hostname);
  console.log('Protocol:', result.parsed?.protocol);
} else {
  console.error('Invalid URL:', result.error);
}
```

### Validating URLs with Components

```typescript
import { validateURL } from './lib/validation';

// URL with query parameters
const result1 = validateURL('https://api.example.com/search?q=test&limit=10');
console.log('Query:', result1.parsed?.query); // "q=test&limit=10"

// URL with fragment
const result2 = validateURL('https://example.com/page#section');
console.log('Fragment:', result2.parsed?.fragment); // "section"

// URL with authentication
const result3 = validateURL('https://user:pass@api.example.com');
console.log('Username:', result3.parsed?.auth?.username); // "user"
console.log('Password:', result3.parsed?.auth?.password); // "pass"

// URL with all components
const result4 = validateURL(
  'https://user:pass@api.example.com:8080/v2/users?active=true#top'
);
console.log('Full URL:', result4.parsed);
```

### Batch Validation

```typescript
import { validateURLs } from './lib/validation';

const urls = [
  'https://example.com',
  'http://test.com',
  'ftp://invalid.com', // Will fail
  'https://valid.org',
];

const results = validateURLs(urls);
results.forEach((result, index) => {
  if (result.valid) {
    console.log(`URL ${index + 1}: Valid`);
  } else {
    console.log(`URL ${index + 1}: Invalid - ${result.error}`);
  }
});
```

### Quick Validation Check

```typescript
import { isValidURL } from './lib/validation';

if (isValidURL('https://example.com')) {
  console.log('URL is valid!');
}
```

## Validation Rules

### Accepted URLs

- ✅ HTTP and HTTPS protocols only
- ✅ Valid hostnames (letters, numbers, dots, hyphens)
- ✅ Public IP addresses
- ✅ URLs with ports
- ✅ URLs with paths, query parameters, and fragments
- ✅ URLs with authentication credentials
- ✅ URLs up to 2048 characters

### Rejected URLs

- ❌ Non-HTTP/HTTPS protocols (FTP, file, etc.)
- ❌ Localhost and 127.0.0.1
- ❌ Private IP addresses (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
- ❌ Link-local addresses (169.254.x.x)
- ❌ Empty or whitespace-only strings
- ❌ URLs with unencoded spaces
- ❌ URLs exceeding 2048 characters
- ❌ Malformed URLs

## Error Messages

The validator provides descriptive error messages for different failure cases:

```typescript
validateURL('').error;
// "URL cannot be empty"

validateURL('ftp://example.com').error;
// "Invalid protocol "ftp:". Only HTTP and HTTPS protocols are supported."

validateURL('https://localhost').error;
// "Localhost URLs are not allowed for security reasons"

validateURL('https://192.168.1.1').error;
// "Private IP addresses are not allowed for security reasons"

validateURL('example.com').error;
// "URL must include a protocol (e.g., https://example.com)"

validateURL('https://example .com').error;
// "URL contains invalid spaces. URLs must not contain unencoded spaces."
```

## Type Definitions

### URLValidationResult

```typescript
interface URLValidationResult {
  valid: boolean;
  error?: string;
  parsed?: ParsedURL;
}
```

### ParsedURL

```typescript
interface ParsedURL {
  url: string;
  protocol: string;
  hostname: string;
  port?: string;
  path: string;
  query?: string;
  fragment?: string;
  auth?: {
    username: string;
    password?: string;
  };
}
```

## Security Considerations

The validator includes security checks to prevent:

1. **SSRF Attacks**: Blocks localhost and private IP addresses
2. **DoS Attacks**: Limits URL length to 2048 characters
3. **Protocol Confusion**: Only allows HTTP and HTTPS protocols

These checks help protect the analysis system from malicious inputs.

## Testing

The module includes comprehensive unit tests covering:

- Valid URLs with all components
- Invalid protocols
- Invalid formats
- Security checks
- Edge cases
- Descriptive error messages
- Real-world URLs

Run tests with:

```bash
npm test -- url-validator.test.ts
```

## Requirements Mapping

- **Requirement 1.1**: Validates HTTP/HTTPS protocol
- **Requirement 1.2**: Returns descriptive error messages for invalid URLs
- **Requirement 1.4**: Supports query parameters, fragments, and authentication tokens
