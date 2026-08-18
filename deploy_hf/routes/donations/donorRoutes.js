import express from 'express';
import {
  getDonorWall,
  getStaffDonors,
  getDonorDetail,
  getDonorStats,
  getMyDonorStats,
  getMyDonations,
  getPublicDonorDetail,
} from '../../controllers/donations/donorController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/rolesMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONOR ROUTES (NHÀ TÀI TRỢ) ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/donors/wall - Public: danh sách nhà tài trợ cho DonorWallSection
router.get('/wall', getDonorWall);

// GET /api/donors/public/:id - Public: chi tiết nhà tài trợ không cần token
router.get('/public/:id', getPublicDonorDetail);

// ─────────────────────────────────────────────────────────────────────────────
// DONOR USER ROUTES (Nhà tài trợ xem profile của mình)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/donors/my-stats - Nhà tài trợ: thống kê của mình
router.get('/my-stats', protect, authorizeRoles(4), getMyDonorStats);

// GET /api/donors/my-donations - Nhà tài trợ: danh sách quyên góp của mình
router.get('/my-donations', protect, authorizeRoles(4), getMyDonations);

// ─────────────────────────────────────────────────────────────────────────────
// STAFF ROUTES (Cán bộ Quỹ/Admin quản lý nhà tài trợ)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/donors/stats - Cán bộ Quỹ/Admin: thống kê 4 thẻ
router.get('/stats', protect, authorizeRoles(1, 3), getDonorStats);

// GET /api/donors - Cán bộ Quỹ/Admin: danh sách + filter + sort + phân trang
router.get('/', protect, authorizeRoles(1, 3), getStaffDonors);

// GET /api/donors/:id - Cán bộ Quỹ/Admin: chi tiết + lịch sử khoản tài trợ
router.get('/:id', protect, authorizeRoles(1, 3), getDonorDetail);

export default router;
