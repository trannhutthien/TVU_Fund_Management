import express from 'express';
import {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  uploadMiddleware,
  uploadMultipleMiddleware
} from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── UPLOAD ROUTES ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/upload - Upload 1 file
// Yêu cầu: Token hợp lệ, FormData với key 'file'
router.post('/', protect, uploadMiddleware, uploadFile);

// POST /api/upload/multiple - Upload nhiều files (tối đa 5)
// Yêu cầu: Token hợp lệ, FormData với key 'files'
router.post('/multiple', protect, uploadMultipleMiddleware, uploadMultipleFiles);

// DELETE /api/upload/:filename - Xóa file
// Yêu cầu: Token hợp lệ
router.delete('/:filename', protect, deleteFile);

export default router;
