import express from 'express';
import {
  getMyRepayments,
  submitProof,
  revokeProof,
} from '../../controllers/finance/lichTraNoUserController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/rolesMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// LICH TRA NO — Dành cho người dùng role 4 (Sinh viên)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/lich-tra-no/cua-toi — Xem nghĩa vụ hoàn trả của tôi
router.get('/cua-toi', protect, authorizeRoles(4), getMyRepayments);

// POST /api/lich-tra-no/:lichtranoId/nop-minh-chung — Nộp minh chứng trả nợ
router.post('/:lichtranoId/nop-minh-chung', protect, authorizeRoles(4), submitProof);

// DELETE /api/lich-tra-no/:lichtranoId/huy-minh-chung — Hủy minh chứng
router.delete('/:lichtranoId/huy-minh-chung', protect, authorizeRoles(4), revokeProof);

export default router;
