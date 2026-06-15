import express from "express";
import { getFunds, createFund, getPublicFunds, updateFundStatus, getFundDetail, updateFund, getFundBankAccounts } from "../../controllers/funds/fundController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// ─── PUBLIC ROUTES (không cần authentication) ────────────────────────────────

// GET /api/funds/public — Lấy danh sách quỹ công khai
router.get("/public", getPublicFunds);

// GET /api/funds/:id/bank-accounts — Lấy tài khoản ngân hàng của quỹ
router.get("/:id/bank-accounts", getFundBankAccounts);

// GET /api/funds/:id — Lấy chi tiết một quỹ (PUBLIC - không cần token)
router.get("/:id", getFundDetail);

// ─── PROTECTED ROUTES (cần authentication + authorization) ───────────────────

// GET /api/funds — Lấy tất cả quỹ (admin/giáo vụ/kế toán)
router.get("/", protect, authorizeRoles(1, 2, 3), getFunds);

// POST /api/funds — Tạo quỹ mới (admin/giáo vụ)
router.post("/", protect, authorizeRoles(1, 3), createFund);

// PUT /api/funds/:id — Cập nhật thông tin quỹ (admin/giáo vụ)
router.put("/:id", protect, authorizeRoles(1, 3), updateFund);

// PUT /api/funds/:id/status — Cập nhật trạng thái quỹ (admin/giáo vụ)
router.put("/:id/status", protect, authorizeRoles(1, 3), updateFundStatus);

export default router;
