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
    const uploadPath = path.join(__dirname, '../../uploads/documents');
    
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

    const filePath = path.join(__dirname, '../../uploads/documents', filename);

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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── AVATAR UPLOAD CONFIGURATION & CONTROLLER ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const user = req.user;
    let targetFolder = 'staffs'; // Mặc định là staffs nếu không xác định được

    if (user) {
      const roleId = Number(user.role_id || user.roleId);
      if (roleId === 1 || roleId === 2 || roleId === 3) {
        targetFolder = 'staffs';
      } else if (roleId === 4) {
        const loaiTaiKhoan = user.loai_tai_khoan || user.loaiTaiKhoan;
        if (loaiTaiKhoan === 'SINH_VIEN') {
          targetFolder = 'students';
        } else if (loaiTaiKhoan === 'NHA_TAI_TRO') {
          targetFolder = 'staffs';
        }
      }
    }

    const uploadPath = path.join(__dirname, `../../uploads/avatars/${targetFolder}`);
    
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeName}_${uniqueSuffix}${ext}`);
  }
});

const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh JPG, JPEG, PNG'), false);
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

export const uploadAvatarMiddleware = avatarUpload.single('file');

export const uploadAvatar = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để upload'
      });
    }

    const user = req.user;
    let targetFolder = 'staffs';

    if (user) {
      const roleId = Number(user.role_id || user.roleId);
      if (roleId === 1 || roleId === 2 || roleId === 3) {
        targetFolder = 'staffs';
      } else if (roleId === 4) {
        const loaiTaiKhoan = user.loai_tai_khoan || user.loaiTaiKhoan;
        if (loaiTaiKhoan === 'SINH_VIEN') {
          targetFolder = 'students';
        } else if (loaiTaiKhoan === 'NHA_TAI_TRO') {
          targetFolder = 'staffs';
        }
      }
    }

    const filePath = `uploads/avatars/${targetFolder}/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Upload ảnh đại diện thành công',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Lỗi uploadAvatar:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload ảnh đại diện'
    });
  }
};

// Export multer middleware
export const uploadMiddleware = upload.single('file');
export const uploadMultipleMiddleware = upload.array('files', 5); // Tối đa 5 files

// ═══════════════════════════════════════════════════════════════════════════════
// ─── FUND COVER UPLOAD CONFIGURATION & CONTROLLER ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const fundStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/avatars/fund');
    
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeName}_${uniqueSuffix}${ext}`);
  }
});

const fundFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh JPG, JPEG, PNG'), false);
  }
};

const fundUpload = multer({
  storage: fundStorage,
  fileFilter: fundFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

export const uploadFundMiddleware = fundUpload.single('file');

export const uploadFund = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để upload'
      });
    }

    const filePath = `uploads/avatars/fund/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Upload ảnh bìa quỹ thành công',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Lỗi uploadFund:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload ảnh bìa quỹ'
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STUDENT SHOWCASE UPLOAD CONFIGURATION & CONTROLLER ───────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const studentShowcaseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/avatars/students');
    
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeName}_${uniqueSuffix}${ext}`);
  }
});

const studentShowcaseFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh JPG, JPEG, PNG'), false);
  }
};

const studentShowcaseUpload = multer({
  storage: studentShowcaseStorage,
  fileFilter: studentShowcaseFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

export const uploadStudentShowcaseMiddleware = studentShowcaseUpload.single('file');

export const uploadStudentShowcase = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để upload'
      });
    }

    const filePath = `uploads/avatars/students/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Upload ảnh sinh viên nổi bật thành công',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Lỗi uploadStudentShowcase:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload ảnh sinh viên nổi bật'
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NEWS UPLOAD CONFIGURATION & CONTROLLER ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const newsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/tintuc');
    
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeName}_${uniqueSuffix}${ext}`);
  }
});

const newsFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh JPG, JPEG, PNG'), false);
  }
};

const newsUpload = multer({
  storage: newsStorage,
  fileFilter: newsFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

export const uploadNewsMiddleware = newsUpload.single('file');

export const uploadNews = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để upload'
      });
    }

    const filePath = `uploads/tintuc/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Upload ảnh tin tức thành công',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Lỗi uploadNews:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload ảnh tin tức'
    });
  }
};
