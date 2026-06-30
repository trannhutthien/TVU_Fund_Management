import express from "express";
import {
  getAllTransactions,
  getTransactionById,
  getTransactionsSummary,
  exportTransactions,
  updateDoiSoatStatus,
} from "../../controllers/transactions/transactionController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// ─── PUBLIC TRANSACTION ROUTES (Không cần đăng nhập) ─────────────────────────
router.get("/public", getAllTransactions);
router.get("/public/summary", getTransactionsSummary);
router.get("/public/export", exportTransactions);
router.get("/public/:id", getTransactionById);

// ─── PROTECTED TRANSACTION ROUTES (Yêu cầu đăng nhập + phân quyền) ───────────

// GET /api/transactions — Danh sách giao dịch với filter + phân trang
router.get("/", protect, authorizeRoles(1, 2), getAllTransactions);

// GET /api/transactions/summary — Tổng hợp thu/chi/ròng/bất thường
router.get("/summary", protect, authorizeRoles(1, 2), getTransactionsSummary);

// GET /api/transactions/export — Xuất Excel toàn bộ giao dịch đang filter
router.get("/export", protect, authorizeRoles(1, 2), exportTransactions);

// GET /api/transactions/:id — Chi tiết 1 giao dịch
router.get("/:id", protect, authorizeRoles(1, 2), getTransactionById);

// PATCH /api/transactions/:id/doi-soat — Cập nhật trạng thái đối soát
router.patch("/:id/doi-soat", protect, authorizeRoles(1, 2), updateDoiSoatStatus);

export default router;
