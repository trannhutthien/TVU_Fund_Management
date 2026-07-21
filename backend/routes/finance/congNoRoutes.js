import express from 'express';
import {
  getTongQuan,
  getDanhSach,
  getChiTiet,
  confirmPayment,
  rejectPayment,
  sendReminder,
  getNghiemThuList,
} from '../../controllers/finance/congNoController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/rolesMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// CONG NO ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/cong-no/tong-quan — Thong ke tong quan cong no (all roles)
router.get('/tong-quan', protect, authorizeRoles(1, 2, 3, 5), getTongQuan);

// GET /api/cong-no/danh-sach — Danh sach ky tra no (all roles)
router.get('/danh-sach', protect, authorizeRoles(1, 2, 3, 5), getDanhSach);

// GET /api/cong-no/chi-tiet/:yeucauhotroId — Chi tiet hop dong (all roles)
router.get('/chi-tiet/:yeucauhotroId', protect, authorizeRoles(1, 2, 3, 5), getChiTiet);

// PUT /api/cong-no/xac-nhan/:lichtranoId — Duyet xac nhan thu no (Ke toan only)
router.put('/xac-nhan/:lichtranoId', protect, authorizeRoles(2), confirmPayment);

// PUT /api/cong-no/tu-choi/:lichtranoId — Tu choi minh chung (Ke toan only)
router.put('/tu-choi/:lichtranoId', protect, authorizeRoles(2), rejectPayment);

// POST /api/cong-no/nhac-no/:lichtranoId — Nhac no (Admin, Ke toan, Can bo)
router.post('/nhac-no/:lichtranoId', protect, authorizeRoles(1, 2, 3), sendReminder);

// ═══════════════════════════════════════════════════════════════════════════════
// NGHIEM THU ROUTES (danh cho trang giam sat)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/cong-no/nghiem-thu — Danh sach don co nghiem thu (all roles)
router.get('/nghiem-thu', protect, authorizeRoles(1, 2, 3, 5), getNghiemThuList);

export default router;
