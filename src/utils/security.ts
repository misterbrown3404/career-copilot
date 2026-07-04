/**
 * Clean and sanitize user text inputs to prevent XSS, HTML injection, 
 * or script injection attacks.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return '';
  
  let clean = val;
  
  // 1. Remove script blocks completely
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 2. Remove iframe blocks completely
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // 3. Strip all HTML tags
  clean = clean.replace(/<\/?[^>]+(>|$)/g, '');
  
  // 4. Remove javascript:, vbscript:, data: source patterns
  clean = clean.replace(/(javascript|vbscript|data):/gi, 'blocked:');
  
  // 5. Remove event listeners in attribute configurations
  clean = clean.replace(/on(load|error|click|mouseover|focus|blur|change|submit|keydown|keypress|keyup|mouseenter|mouseleave)\s*=/gi, 'blocked_event=');

  return clean.trim();
}

/**
 * Deeply sanitizes any incoming object, array, or primitive data.
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const copy = { ...obj } as any;
    for (const key in copy) {
      if (Object.prototype.hasOwnProperty.call(copy, key)) {
        copy[key] = sanitizeObject(copy[key]);
      }
    }
    return copy as T;
  }
  
  return obj;
}

