import express from 'express';
import {
  submitRecoveryProof,
  confirmRecoveryPayment,
  rejectRecoveryPayment,
  cancelRecoveryPayment,
  getPaymentHistory,
  getRecoveryList,
  getRecoveryDetail,
  getRecoveryDetailByYeuCauHoTro,
} from '../../controllers/finance/thuHoiController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/rolesMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// THU HOI VON ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/thu-hoi/:id/nop-tien — Sinh vien nop tien thu hoi
router.post('/:id/nop-tien', protect, authorizeRoles(4), submitRecoveryProof);

// GET /api/thu-hoi/danh-sach — Danh sach cho ke toan
router.get('/danh-sach', protect, authorizeRoles(2), getRecoveryList);

// GET /api/thu-hoi/by-yeucau/:yeucauhotroId — Chi tiet theo yeucauhotro_id (dung cho ContractDetailPage)
router.get('/by-yeucau/:yeucauhotroId', protect, authorizeRoles(1, 2), getRecoveryDetailByYeuCauHoTro);

// GET /api/thu-hoi/:id — Chi tiet dieu khoan thu hoi + lich su nop tien
router.get('/:id', protect, authorizeRoles(2), getRecoveryDetail);

// GET /api/thu-hoi/:id/lich-su — Lich su nop tien
router.get('/:id/lich-su', protect, authorizeRoles(2, 4), getPaymentHistory);

// PUT /api/thu-hoi/:lanNopId/xac-nhan — Ke toan xac nhan theo lan nop
router.put('/:lanNopId/xac-nhan', protect, authorizeRoles(2), confirmRecoveryPayment);

// PUT /api/thu-hoi/:lanNopId/tu-choi — Ke toan tu choi theo lan nop
router.put('/:lanNopId/tu-choi', protect, authorizeRoles(2), rejectRecoveryPayment);

// DELETE /api/thu-hoi/:lanNopId/huy — Sinh vien huy lan nop tien
router.delete('/:lanNopId/huy', protect, authorizeRoles(4), cancelRecoveryPayment);

export default router;
