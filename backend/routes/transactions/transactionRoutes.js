import express from "express";
import {
  getAllTransactions,
  getTransactionById,
  getTransactionsSummary,
  createChiKhac,
  exportTransactions,
  updateDoiSoatStatus,
  getTransactionByApplication,
  uploadProof,
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
router.get("/", protect, authorizeRoles(1, 2, 5), getAllTransactions);

// GET /api/transactions/summary — Tổng hợp thu/chi/ròng/bất thường
router.get("/summary", protect, authorizeRoles(1, 2, 5), getTransactionsSummary);

// GET /api/transactions/export — Xuất Excel toàn bộ giao dịch đang filter
router.get("/export", protect, authorizeRoles(1, 2, 5), exportTransactions);

// POST /api/transactions/chi-khac — Ghi nhận chi khác: thẩm định, bộ máy, nhiệm vụ khác (C3)
router.post("/chi-khac", protect, authorizeRoles(1, 2), createChiKhac);

// GET /api/transactions/by-application/:yeucauhotroId — Lấy giao dịch theo đơn
router.get("/by-application/:yeucauhotroId", protect, authorizeRoles(1, 2, 5), getTransactionByApplication);

// GET /api/transactions/:id — Chi tiết 1 giao dịch
router.get("/:id", protect, authorizeRoles(1, 2, 5), getTransactionById);

// PATCH /api/transactions/:id/doi-soat — Cập nhật trạng thái đối soát
router.patch("/:id/doi-soat", protect, authorizeRoles(1, 2), updateDoiSoatStatus);

// PATCH /api/transactions/:id/upload-proof — Upload minh chứng chuyển khoản
router.patch("/:id/upload-proof", protect, authorizeRoles(1, 2), uploadProof);

export default router;

