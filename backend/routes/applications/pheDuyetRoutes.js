import express from 'express';
import {
  getPheDuyetStats,
  getAllPheDuyet,
  getApprovers,
  getApprovalTimeline,
} from '../../controllers/applications/pheDuyetController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/rolesMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PHÊ DUYỆT ROUTES (CHỈ ADMIN) ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/pheduyet/stats — Thống kê tổng quan
router.get('/stats', protect, authorizeRoles(1), getPheDuyetStats);

// GET /api/pheduyet/approvers — Danh sách người có quyền duyệt
router.get('/approvers', protect, authorizeRoles(1), getApprovers);

// GET /api/pheduyet/timeline/:type/:id — Chuỗi phê duyệt của 1 đơn/khoản
router.get('/timeline/:type/:id', protect, authorizeRoles(1), getApprovalTimeline);

// GET /api/pheduyet — Danh sách tất cả phê duyệt với filters
router.get('/', protect, authorizeRoles(1), getAllPheDuyet);

export default router;
