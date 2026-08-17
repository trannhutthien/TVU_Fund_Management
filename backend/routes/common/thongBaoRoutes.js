import express from 'express';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../controllers/common/thongBaoController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/thong-bao/unread-count — Dem thong bao chua doc (trc route /:id de tranh conflict)
router.get('/unread-count', protect, getUnreadCount);

// PUT /api/thong-bao/doc-tat-ca — Danh dau tat ca da doc
router.put('/doc-tat-ca', protect, markAllAsRead);

// GET /api/thong-bao — Lay thong bao
router.get('/', protect, getMyNotifications);

// PUT /api/thong-bao/:id/doc — Danh dau da doc
router.put('/:id/doc', protect, markAsRead);

export default router;
