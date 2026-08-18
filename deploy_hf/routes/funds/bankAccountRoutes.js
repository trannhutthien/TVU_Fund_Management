import express from "express";
import {
  getSchoolBankAccounts,
  getBankAccounts,
  getBankAccountsByUserId,
  createBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
  createSchoolBankAccount,
  updateSchoolBankAccount,
  deleteSchoolBankAccount
} from "../../controllers/funds/bankAccountController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// ─── BANK ACCOUNT ROUTES (TÀI KHOẢN NGÂN HÀNG)

// GET /api/bank-accounts/school — Lấy danh sách tài khoản nhà trường (PUBLIC)
router.get("/school", getSchoolBankAccounts);

// POST /api/bank-accounts/school — Thêm tài khoản nhà trường (Admin only)
router.post("/school", protect, authorizeRoles(1), createSchoolBankAccount);

// PUT /api/bank-accounts/school/:id — Sửa tài khoản nhà trường (Admin only)
router.put("/school/:id", protect, authorizeRoles(1), updateSchoolBankAccount);

// DELETE /api/bank-accounts/school/:id — Xóa tài khoản nhà trường (Admin only)
router.delete("/school/:id", protect, authorizeRoles(1), deleteSchoolBankAccount);

// GET /api/bank-accounts — Lấy danh sách tài khoản ngân hàng của user
router.get("/", protect, getBankAccounts);

// GET /api/bank-accounts/user/:userId — Lấy danh sách TK của một user bất kỳ
router.get("/user/:userId", protect, authorizeRoles(1, 2, 3), getBankAccountsByUserId);

// POST /api/bank-accounts — Thêm tài khoản ngân hàng mới
router.post("/", protect, createBankAccount);

// DELETE /api/bank-accounts/:id — Xóa tài khoản ngân hàng
router.delete("/:id", protect, deleteBankAccount);

// PUT /api/bank-accounts/:id/set-default — Đặt tài khoản mặc định
router.put("/:id/set-default", protect, setDefaultBankAccount);

export default router;
