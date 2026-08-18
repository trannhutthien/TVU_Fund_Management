import express from 'express';
import {
  proposeDuToan, approveLevel, getAllDuToan,
  getDuToanByYear, getPreviousYearStats, getChiTiet
} from '../../controllers/reports/duToanController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/rolesMiddleware.js';

const router = express.Router();

// POST /api/du-toan — Tao du toan moi (Ke toan - role 2)
router.post('/', protect, authorizeRoles(2), proposeDuToan);

// GET /api/du-toan/thong-ke-nam-truoc/:nam — Thong ke nam truoc (roles 1,2,3,5)
router.get('/thong-ke-nam-truoc/:nam', protect, authorizeRoles(1, 2, 3, 5), getPreviousYearStats);

// GET /api/du-toan/chi-tiet/:id — Chi tiet khoan chi (roles 1,2,3,5)
router.get('/chi-tiet/:id', protect, authorizeRoles(1, 2, 3, 5), getChiTiet);

// GET /api/du-toan — Danh sach tat ca du toan (roles 1,2,3,5)
router.get('/', protect, authorizeRoles(1, 2, 3, 5), getAllDuToan);

// PUT /api/du-toan/:id/approve — Duyet/Tu choi theo cap (Admin/BKS)
router.put('/:id/approve', protect, authorizeRoles(1, 5), approveLevel);

// GET /api/du-toan/:namtaichinh — Xem du toan theo nam (roles 1,2,3,5)
router.get('/:namtaichinh', protect, authorizeRoles(1, 2, 3, 5), getDuToanByYear);

export default router;
