import path from 'path';
import fs from 'fs/promises';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── FILE VALIDATOR MIDDLEWARE ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Validates uploaded files to ensure security and prevent malicious files

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

const FILE_SIGNATURES = {
  '.pdf': ['25504446'],
  '.jpg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2'],
  '.jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2'],
  '.png': ['89504e47']
};

/**
 * Validates file signature (magic bytes) to ensure file type matches extension
 * @param {string} signature - Hex string of first 4 bytes
 * @param {string} ext - File extension
 * @returns {boolean} - True if signature matches extension
 */
const validateFileSignature = (signature, ext) => {
  const validSignatures = FILE_SIGNATURES[ext];
  if (!validSignatures) return true; // Skip validation for .doc, .docx (complex format)
  
  return validSignatures.some(sig => signature.startsWith(sig));
};

/**
 * Middleware: Validate uploaded files
 * Checks extension, MIME type, and file signature
 */
export const validateFile = async (req, res, next) => {
  try {
    // If no file, skip validation
    if (!req.file && (!req.files || req.files.length === 0)) {
      return next();
    }
    
    // Handle single file
    const files = req.file ? [req.file] : req.files;
    
    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      
      // 1. Check extension
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} không được hỗ trợ. Chỉ chấp nhận: PDF, JPG, PNG, DOC, DOCX`
        });
      }
      
      // 2. Check MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} không hợp lệ. MIME type không được hỗ trợ.`
        });
      }
      
      // 3. Check file signature (magic bytes)
      try {
        const buffer = await fs.readFile(file.path);
        const signature = buffer.toString('hex', 0, 4);
        
        const isValid = validateFileSignature(signature, ext);
        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: `File ${file.originalname} bị lỗi hoặc giả mạo. File signature không khớp với extension.`
          });
        }
      } catch (error) {
        console.error('Error reading file for signature validation:', error);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi kiểm tra file'
        });
      }
      
      // 4. Check for dangerous executables
      const dangerousExtensions = ['.exe', '.bat', '.sh', '.cmd', '.com', '.scr', '.vbs', '.js', '.jar'];
      if (dangerousExtensions.includes(ext)) {
        return res.status(400).json({
          success: false,
          message: `File thực thi không được phép upload`
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('File validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra file'
    });
  }
};

/**
 * Sanitize filename: remove special characters and limit length
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  // Remove special characters, keep only alphanumeric, dots, hyphens, underscores
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100);
  
  return sanitized;
};

/**
 * Generate unique filename to prevent collision
 * @param {string} originalFilename - Original filename
 * @returns {string} - Unique filename with timestamp
 */
export const generateUniqueFilename = (originalFilename) => {
  const ext = path.extname(originalFilename);
  const basename = path.basename(originalFilename, ext);
  const sanitized = sanitizeFilename(basename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return `${sanitized}_${timestamp}_${random}${ext}`;
};
