import express from 'express';
import { proposeDuToan, approveDuToan, getDuToanByYear } from '../../controllers/reports/duToanController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/rolesMiddleware.js';

const router = express.Router();

// POST /api/du-toan — Đề xuất dự toán năm (chỉ Kế toán - role 2)
router.post('/', protect, authorizeRoles(2), proposeDuToan);

// PUT /api/du-toan/:id — Duyệt/Từ chối đề xuất dự toán (chỉ Admin - role 1)
router.put('/:id', protect, authorizeRoles(1), approveDuToan);

// GET /api/du-toan/:namtaichinh — Xem dự toán của năm tài chính (Admin & Kế toán - roles 1, 2)
router.get('/:namtaichinh', protect, authorizeRoles(1, 2), getDuToanByYear);

export default router;
