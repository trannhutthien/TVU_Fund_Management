import express from 'express';
import {
  getAvailableYears,
  getPublicStats,
  getFundBreakdown,
  getImpactStats,
  getKeToanSummary,
  getKeToanCashflow,
  getKeToanTransactionStatus,
  getKeToanRecentTransactions,
  getKeToanFundHealth,
  getKeToanPendingDonations,
  getApplicationStats,
  getKeToanReportStats,
  getAdminAdvancedStats,
  getYearlyReport,
  getPendingCount,
} from '../../controllers/reports/statisticsController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/rolesMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STATISTICS ROUTES (THỐNG KÊ) ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─── PUBLIC ────────────────────────────────────────────────────────────────────
router.get('/public', getPublicStats);
router.get('/fund-breakdown', getFundBreakdown);
router.get('/impact', getImpactStats);

// ─── AVAILABLE YEARS (dùng chung cho YearFilter) ──────────────────────────────
router.get('/available-years', protect, authorizeRoles(1, 2, 5), getAvailableYears);

// ─── KẾ TOÁN (role 1 - admin, 2 - kế toán) ────────────────────────────────────
router.get('/ketoan/summary', protect, authorizeRoles(1, 2, 5), getKeToanSummary);
router.get('/ketoan/cashflow', protect, authorizeRoles(1, 2, 5), getKeToanCashflow);
router.get('/ketoan/transaction-status', protect, authorizeRoles(1, 2, 5), getKeToanTransactionStatus);
router.get('/ketoan/recent-transactions', protect, authorizeRoles(1, 2, 5), getKeToanRecentTransactions);
router.get('/ketoan/fund-health', protect, authorizeRoles(1, 2, 5), getKeToanFundHealth);
router.get('/ketoan/pending-donations', protect, authorizeRoles(1, 2, 5), getKeToanPendingDonations);
router.get('/ketoan/report', protect, authorizeRoles(1, 2, 5), getKeToanReportStats);

// ─── BÁO CÁO NĂM TÀI CHÍNH (Điều 17.2, 18) ────────────────────────────────
router.get('/yearly-report', protect, authorizeRoles(1, 2, 5), getYearlyReport);

// ─── APPLICATIONS (role 1 - admin) ─────────────────────────────────────────────
router.get('/applications/stats', protect, authorizeRoles(1, 5), getApplicationStats);
router.get('/admin/advanced', protect, authorizeRoles(1, 5), getAdminAdvancedStats);

// ─── PENDING COUNT (sidebar badge) ─────────────────────────────────────────────
router.get('/pending-count', protect, authorizeRoles(1, 2, 3), getPendingCount);

export default router;
