import express from "express";
import { getFunds, createFund, getPublicFunds, updateFundStatus, getFundDetail, updateFund, getFundBankAccounts } from "../../controllers/funds/fundController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// GET /api/funds/public — API công khai, KHÔNG CẦN TOKEN
router.get("/public", getPublicFunds);

// GET /api/funds/:id/bank-accounts — API công khai, lấy tài khoản ngân hàng của quỹ
router.get("/:id/bank-accounts", getFundBankAccounts);

// GET /api/funds — cần access token hợp lệ và quyền admin/giáo vụ
router.get("/", protect, authorizeRoles(1, 2, 3), getFunds);

// GET /api/funds/:id — lấy chi tiết một quỹ
router.get("/:id", protect, authorizeRoles(1, 2, 3), getFundDetail);

// POST /api/funds — cần access token hợp lệ và quyền admin/giáo vụ
router.post("/", protect, authorizeRoles(1, 3), createFund);

// PUT /api/funds/:id — cập nhật thông tin quỹ
router.put("/:id", protect, authorizeRoles(1, 3), updateFund);

// PUT /api/funds/:id/status — cần access token hợp lệ và quyền admin/giáo vụ
router.put("/:id/status", protect, authorizeRoles(1, 3), updateFundStatus);

export default router;
