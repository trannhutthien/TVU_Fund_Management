import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MULTER CONFIGURATION ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: timestamp_originalname
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    // Loại bỏ ký tự đặc biệt, chỉ giữ chữ, số, dấu gạch ngang và gạch dưới
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    cb(null, `${safeName}_${uniqueSuffix}${ext}`);
  }
});

// Validate file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file PDF, JPG, JPEG, PNG'), false);
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/upload (UPLOAD FILE MINH CHỨNG) ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Upload file minh chứng cho đơn xin hỗ trợ
//
// LUỒNG HOẠT ĐỘNG:
// 1. Nhận file từ FormData (key: 'file')
// 2. Validate file type (PDF, JPG, PNG) và size (<= 5MB)
// 3. Lưu file vào backend/uploads/documents/
// 4. Trả về đường dẫn file (relative path)
//
// YÊU CẦU:
// - Token hợp lệ (protect middleware)
// - File trong FormData với key 'file'
// - File type: PDF, JPG, JPEG, PNG
// - File size: <= 5MB
//
export const uploadFile = (req, res) => {
  try {
    // Kiểm tra có file không
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để upload'
      });
    }

    // Tạo đường dẫn tương đối để lưu vào database
    const filePath = `uploads/documents/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Upload file thành công',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Lỗi uploadFile:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload file'
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/upload/multiple (UPLOAD NHIỀU FILE) ────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Upload nhiều file minh chứng cùng lúc (tối đa 5 files)
//
export const uploadMultipleFiles = (req, res) => {
  try {
    // Kiểm tra có files không
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 file để upload'
      });
    }

    // Map thông tin các files
    const uploadedFiles = req.files.map(file => ({
      fileName: file.filename,
      originalName: file.originalname,
      filePath: `uploads/documents/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype
    }));

    return res.status(200).json({
      success: true,
      message: `Upload ${req.files.length} file thành công`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Lỗi uploadMultipleFiles:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload files'
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DELETE /api/upload/:filename (XÓA FILE) ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Xóa file đã upload (dùng khi user hủy upload hoặc xóa đơn)
//
export const deleteFile = (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên file'
      });
    }

    const filePath = path.join(__dirname, '../uploads/documents', filename);

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy file'
      });
    }

    // Xóa file
    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: 'Xóa file thành công'
    });
  } catch (error) {
    console.error('Lỗi deleteFile:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa file'
    });
  }
};

// Export multer middleware
export const uploadMiddleware = upload.single('file');
export const uploadMultipleMiddleware = upload.array('files', 5); // Tối đa 5 files
