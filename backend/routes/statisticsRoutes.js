import express from 'express';
import {
  getPublicStats,
  getSupportedRequestsCount,
  getTotalFundAmount,
  getTotalDonorsCount,
  getTotalFundsCount
} from '../controllers/statisticsController.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STATISTICS ROUTES (THỐNG KÊ) ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES - Không cần authentication
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/statistics/public
// Lấy tất cả thống kê cho Landing Page (4 số liệu)
router.get('/public', getPublicStats);

// GET /api/statistics/supported-requests
// Lấy số yêu cầu đã hỗ trợ
router.get('/supported-requests', getSupportedRequestsCount);

// GET /api/statistics/total-fund-amount
// Lấy tổng số tiền các quỹ
router.get('/total-fund-amount', getTotalFundAmount);

// GET /api/statistics/total-donors
// Lấy tổng số nhà hỗ trợ
router.get('/total-donors', getTotalDonorsCount);

// GET /api/statistics/total-funds
// Lấy tổng số quỹ đang hoạt động
router.get('/total-funds', getTotalFundsCount);

export default router;
