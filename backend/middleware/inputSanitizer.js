// ═══════════════════════════════════════════════════════════════════════════════
// ─── INPUT SANITIZER MIDDLEWARE ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Sanitizes user input to prevent XSS and injection attacks

/**
 * Escape HTML special characters
 * @param {string} str - Input string
 * @returns {string} - Escaped string
 */
const escapeHtml = (str) => {
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char]);
};

/**
 * Check for suspicious patterns (XSS, SQL injection)
 * @param {string} str - Input string
 * @returns {boolean} - True if suspicious pattern found
 */
const containsSuspiciousContent = (str) => {
  // Check for script tags
  if (/<script|javascript:/i.test(str)) {
    return true;
  }
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /('|")\s*(OR|AND)\s*('|")/i,
    /;\s*DROP\s+TABLE/i,
    /;\s*DELETE\s+FROM/i,
    /UNION\s+SELECT/i,
    /--\s*$/
  ];
  
  return sqlPatterns.some(pattern => pattern.test(str));
};

/**
 * Recursively sanitize object
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object or throws error if suspicious content found
 */
const sanitizeObject = (obj) => {
  for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) {
      continue;
    }
    
    if (typeof obj[key] === 'string') {
      // Trim whitespace
      obj[key] = obj[key].trim();
      
      // Check for suspicious content
      if (containsSuspiciousContent(obj[key])) {
        throw new Error(`Dữ liệu không hợp lệ được phát hiện trong trường "${key}"`);
      }
      
      // Escape HTML (but preserve Vietnamese UTF-8 characters)
      // Only escape if the string contains HTML-like characters
      if (/<|>|&|"|'|\//.test(obj[key])) {
        obj[key] = escapeHtml(obj[key]);
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively sanitize nested objects/arrays
      sanitizeObject(obj[key]);
    }
  }
  
  return obj;
};

/**
 * Middleware: Sanitize request body
 */
export const sanitizeInput = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }
    
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin'
    });
  }
};

/**
 * Middleware: Sanitize query parameters
 */
export const sanitizeQuery = (req, res, next) => {
  try {
    if (req.query && typeof req.query === 'object') {
      sanitizeObject(req.query);
    }
    
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin'
    });
  }
};

/**
 * Middleware: Sanitize both body and query
 */
export const sanitizeAll = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }
    
    if (req.query && typeof req.query === 'object') {
      sanitizeObject(req.query);
    }
    
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin'
    });
  }
};
