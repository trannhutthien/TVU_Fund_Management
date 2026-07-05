import express from "express";
import {
  getSchoolBankAccounts,
  getBankAccounts,
  getBankAccountsByUserId,
  createBankAccount,
  deleteBankAccount,
  setDefaultBankAccount
} from "../../controllers/funds/bankAccountController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// ─── BANK ACCOUNT ROUTES (TÀI KHOẢN NGÂN HÀNG)

// GET /api/bank-accounts/school — Lấy danh sách tài khoản nhà trường (PUBLIC - không cần auth)
// CÔNG DỤNG: Hiển thị danh sách TK nhà trường trong form donation để nhà tài trợ chọn
router.get("/school", getSchoolBankAccounts);

// GET /api/bank-accounts — Lấy danh sách tài khoản ngân hàng của user
// Middleware: protect (cần token hợp lệ)
router.get("/", protect, getBankAccounts);

// GET /api/bank-accounts/user/:userId — Lấy danh sách TK của một user bất kỳ
// CÔNG DỤNG: Admin / Cán bộ Quỹ xem TK ngân hàng nhận giải ngân của sinh viên
//            khi xét duyệt hồ sơ.
// Middleware: protect + authorizeRoles(1, 3) (chỉ Admin và Cán bộ)
router.get("/user/:userId", protect, authorizeRoles(1, 2, 3), getBankAccountsByUserId);

// POST /api/bank-accounts — Thêm tài khoản ngân hàng mới
// Middleware: protect (cần token hợp lệ)
// Body: { soTaiKhoan, tenNganHang, chuTaiKhoan, laMacDinh }
router.post("/", protect, createBankAccount);

// DELETE /api/bank-accounts/:id — Xóa tài khoản ngân hàng
// Middleware: protect (cần token hợp lệ)
router.delete("/:id", protect, deleteBankAccount);

// PUT /api/bank-accounts/:id/set-default — Đặt tài khoản mặc định
// Middleware: protect (cần token hợp lệ)
router.put("/:id/set-default", protect, setDefaultBankAccount);

export default router;
