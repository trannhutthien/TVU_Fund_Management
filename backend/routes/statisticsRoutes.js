import express from 'express';
import {
  getPublicStats,
  getFundBreakdown,
  getImpactStats,
  getKeToanSummary,
  getKeToanCashflow,
  getKeToanTransactionStatus,
  getKeToanRecentTransactions,
  getKeToanFundHealth,
  getKeToanPendingDonations,
} from '../controllers/statisticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rolesMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STATISTICS ROUTES (THỐNG KÊ) ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─── PUBLIC ────────────────────────────────────────────────────────────────────
router.get('/public', getPublicStats);
router.get('/fund-breakdown', getFundBreakdown);
router.get('/impact', getImpactStats);

// ─── KẾ TOÁN (role 1 - admin, 2 - kế toán) ────────────────────────────────────
router.get('/ketoan/summary', protect, authorizeRoles(1, 2), getKeToanSummary);
router.get('/ketoan/cashflow', protect, authorizeRoles(1, 2), getKeToanCashflow);
router.get('/ketoan/transaction-status', protect, authorizeRoles(1, 2), getKeToanTransactionStatus);
router.get('/ketoan/recent-transactions', protect, authorizeRoles(1, 2), getKeToanRecentTransactions);
router.get('/ketoan/fund-health', protect, authorizeRoles(1, 2), getKeToanFundHealth);
router.get('/ketoan/pending-donations', protect, authorizeRoles(1, 2), getKeToanPendingDonations);

export default router;
