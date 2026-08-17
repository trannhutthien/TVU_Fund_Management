import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── CSRF PROTECTION MIDDLEWARE ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Protects against Cross-Site Request Forgery attacks

// In-memory storage for CSRF tokens (in production, use Redis)
const csrfTokens = new Map();

// Cleanup expired tokens every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(token);
    }
  }
}, 30 * 60 * 1000);

/**
 * Generate a random CSRF token
 * @returns {string} - CSRF token
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Middleware: Generate and send CSRF token
 * Route: GET /api/csrf-token
 */
export const getCsrfToken = (req, res) => {
  try {
    const token = generateToken();
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
    
    // Store token with expiration
    csrfTokens.set(token, {
      expiresAt,
      used: false
    });
    
    return res.status(200).json({
      success: true,
      csrfToken: token,
      expiresIn: 3600 // seconds
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo token bảo mật'
    });
  }
};

/**
 * Middleware: Verify CSRF token
 * Checks X-CSRF-Token header against stored tokens
 */
export const verifyCsrfToken = (req, res, next) => {
  try {
    // Skip CSRF check for GET requests (they should be idempotent)
    if (req.method === 'GET') {
      return next();
    }
    
    const token = req.headers['x-csrf-token'];
    
    // Check if token provided
    if (!token) {
      return res.status(403).json({
        success: false,
        message: 'Token bảo mật không được cung cấp'
      });
    }
    
    // Check if token exists and is valid
    const tokenData = csrfTokens.get(token);
    
    if (!tokenData) {
      return res.status(403).json({
        success: false,
        message: 'Token bảo mật không hợp lệ'
      });
    }
    
    // Check if token expired
    if (Date.now() > tokenData.expiresAt) {
      csrfTokens.delete(token);
      return res.status(403).json({
        success: false,
        message: 'Token bảo mật đã hết hạn. Vui lòng tải lại trang'
      });
    }
    
    // Token is valid - mark as used and proceed
    // Note: We don't delete the token immediately to allow retry on network errors
    // It will be cleaned up by the interval or can be rotated after successful request
    tokenData.used = true;
    tokenData.usedAt = Date.now();
    
    next();
  } catch (error) {
    console.error('CSRF verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xác thực token bảo mật'
    });
  }
};

/**
 * Middleware: Rotate CSRF token after successful request
 * Call this after a successful form submission
 */
export const rotateCsrfToken = (req, res, next) => {
  const oldToken = req.headers['x-csrf-token'];
  
  if (oldToken) {
    // Delete old token
    csrfTokens.delete(oldToken);
    
    // Generate new token
    const newToken = generateToken();
    const expiresAt = Date.now() + (60 * 60 * 1000);
    
    csrfTokens.set(newToken, {
      expiresAt,
      used: false
    });
    
    // Send new token in response header
    res.setHeader('X-New-CSRF-Token', newToken);
  }
  
  next();
};

/**
 * Optional: Clear expired tokens manually
 */
export const clearExpiredTokens = () => {
  const now = Date.now();
  let cleared = 0;
  
  for (const [token, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(token);
      cleared++;
    }
  }
  
  console.log(`Cleared ${cleared} expired CSRF tokens`);
  return cleared;
};
