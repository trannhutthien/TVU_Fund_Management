import express from "express";
import {
  getAllTransactions,
  getTransactionById,
  getTransactionsSummary,
  exportTransactions
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rolesMiddleware.js";

const router = express.Router();

// ─── TRANSACTION ROUTES (LỊCH SỬ DÒNG TIỀN) ───────────────────────────────────

// GET /api/transactions — Danh sách giao dịch với filter + phân trang
router.get("/", protect, authorizeRoles(1, 2), getAllTransactions);

// GET /api/transactions/summary — Tổng hợp thu/chi/ròng/bất thường
// Phải đặt trước route /:id để Express match đúng
router.get("/summary", protect, authorizeRoles(1, 2), getTransactionsSummary);

// GET /api/transactions/export — Xuất Excel toàn bộ giao dịch đang filter
router.get("/export", protect, authorizeRoles(1, 2), exportTransactions);

// GET /api/transactions/:id — Chi tiết 1 giao dịch
router.get("/:id", protect, authorizeRoles(1, 2), getTransactionById);

export default router;
