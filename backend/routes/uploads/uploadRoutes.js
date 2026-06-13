import express from 'express';
import {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  uploadMiddleware,
  uploadMultipleMiddleware,
  uploadAvatarMiddleware,
  uploadAvatar,
  uploadFundMiddleware,
  uploadFund,
  uploadStudentShowcaseMiddleware,
  uploadStudentShowcase
} from '../../controllers/uploads/uploadController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── UPLOAD ROUTES ────────────────────────────────════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/upload - Upload 1 file
// Yêu cầu: Token hợp lệ, FormData với key 'file'
router.post('/', protect, uploadMiddleware, uploadFile);

// POST /api/upload/public - Upload 1 file cho khách vãng lai (KHÔNG CẦN TOKEN)
router.post('/public', uploadMiddleware, uploadFile);

// POST /api/upload/multiple - Upload nhiều files (tối đa 5)
// Yêu cầu: Token hợp lệ, FormData với key 'files'
router.post('/multiple', protect, uploadMultipleMiddleware, uploadMultipleFiles);

// POST /api/upload/avatar - Upload ảnh đại diện
// Yêu cầu: Token hợp lệ, FormData với key 'file'
router.post('/avatar', protect, uploadAvatarMiddleware, uploadAvatar);

// POST /api/upload/fund - Upload ảnh bìa quỹ
// Yêu cầu: Token hợp lệ, FormData với key 'file'
router.post('/fund', protect, uploadFundMiddleware, uploadFund);

// POST /api/upload/student - Upload ảnh sinh viên nổi bật
// Yêu cầu: Token hợp lệ, FormData với key 'file'
router.post('/student', protect, uploadStudentShowcaseMiddleware, uploadStudentShowcase);

// DELETE /api/upload/:filename - Xóa file
// Yêu cầu: Token hợp lệ
router.delete('/:filename', protect, deleteFile);

export default router;
