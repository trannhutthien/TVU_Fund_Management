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
router.get('/stats', protect, authorizeRoles(1, 5), getPheDuyetStats);

router.get('/approvers', protect, authorizeRoles(1, 5), getApprovers);

router.get('/timeline/:type/:id', protect, authorizeRoles(1, 5), getApprovalTimeline);

router.get('/', protect, authorizeRoles(1, 5), getAllPheDuyet);

export default router;
