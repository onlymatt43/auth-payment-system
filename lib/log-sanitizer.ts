/**
 * Log Sanitization Utility
 * Removes sensitive information from log messages
 */

// Regex patterns for sensitive data
const PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  CREDIT_CARD: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  TOKEN: /bearer\s+[a-zA-Z0-9._-]+/gi,
  SECRET_KEY: /(secret|key|password|token|auth)\s*[:=]\s*[^\s,}]+/gi,
  POINTS: /points[:\s]*(\d+)/gi,
  AMOUNT_DOLLAR: /\$?\d+(\.\d{2})?/g,
  USER_ID: /user[_-]?id[:\s]*(\d+)/gi,
  UUID: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
};

const REPLACEMENTS = {
  EMAIL: '[EMAIL]',
  PHONE: '[PHONE]',
  CREDIT_CARD: '[CARD]',
  TOKEN: 'Bearer [TOKEN]',
  SECRET_KEY: (match: string) => {
    const [key] = match.split(/[:=]/);
    return `${key.trim()} = [REDACTED]`;
  },
  POINTS: 'points: [AMOUNT]',
  AMOUNT_DOLLAR: '[AMOUNT]',
  USER_ID: 'user_id: [USER]',
  UUID: '[UUID]',
};

/**
 * Sanitize a string by removing/redacting sensitive information
 */
export function sanitizeString(text: string, fieldsToRedact: string[] = []): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  let sanitized = text;

  // Apply all patterns by default
  for (const [key, pattern] of Object.entries(PATTERNS)) {
    if (fieldsToRedact.length === 0 || fieldsToRedact.includes(key)) {
      const replacement = REPLACEMENTS[key as keyof typeof REPLACEMENTS];
      if (typeof replacement === 'function') {
        sanitized = sanitized.replace(pattern, replacement);
      } else {
        sanitized = sanitized.replace(pattern, replacement);
      }
    }
  }

  return sanitized;
}

/**
 * Sanitize an error object for logging
 */
export function sanitizeError(error: any, fieldsToRedact: string[] = []): string {
  if (error instanceof Error) {
    return sanitizeString(error.message, fieldsToRedact);
  }

  if (typeof error === 'object') {
    const sanitized = JSON.stringify(error);
    return sanitizeString(sanitized, fieldsToRedact);
  }

  return sanitizeString(String(error), fieldsToRedact);
}

/**
 * Sanitize an object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldsToRedact: string[] = []
): Partial<T> {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip common sensitive fields
    if (['password', 'secret', 'token', 'auth', 'key'].some(f => key.toLowerCase().includes(f))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, fieldsToRedact);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, fieldsToRedact);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Create a safe log message
 */
export function createSafeLog(
  action: string,
  details: any,
  fieldsToRedact: string[] = []
): string {
  const sanitized = sanitizeObject(details, fieldsToRedact);
  return `${action}: ${JSON.stringify(sanitized)}`;
}

// Example usage:
// console.error(createSafeLog('Spin error', { email: 'user@test.com', amount: 50, error: err }, ['EMAIL', 'AMOUNT']));
// Output: Spin error: {"email":"[EMAIL]","amount":"[AMOUNT]","error":"..."}
