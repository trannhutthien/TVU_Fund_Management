import express from 'express';
import {
  getDonorWall,
  getStaffDonors,
  getDonorDetail,
  getDonorStats,
} from '../controllers/donorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rolesMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONOR ROUTES (NHÀ TÀI TRỢ) ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/donors/wall - Public: danh sách nhà tài trợ cho DonorWallSection
router.get('/wall', getDonorWall);

// GET /api/donors/stats - Cán bộ Quỹ/Admin: thống kê 4 thẻ
router.get('/stats', protect, authorizeRoles(1, 3), getDonorStats);

// GET /api/donors - Cán bộ Quỹ/Admin: danh sách + filter + sort + phân trang
router.get('/', protect, authorizeRoles(1, 3), getStaffDonors);

// GET /api/donors/:id - Cán bộ Quỹ/Admin: chi tiết + lịch sử khoản tài trợ
router.get('/:id', protect, authorizeRoles(1, 3), getDonorDetail);

export default router;
