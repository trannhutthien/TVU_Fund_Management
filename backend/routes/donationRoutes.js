import express from "express";
import { createPublicDonation, approveDonation, rejectDonation } from "../controllers/donationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rolesMiddleware.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONATION ROUTES (PUBLIC API) ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/donations/public — Quyên góp công khai (KHÔNG CẦN TOKEN)
// ─────────────────────────────────────────────────────────────────────────────
// Middleware: KHÔNG CÓ (public API)
//
// Mục đích:
// - Người dùng bên ngoài (không cần đăng nhập) quyên góp vào quỹ
// - Tự động tạo nhà tài trợ nếu email chưa tồn tại
// - Tạo khoản tài trợ với trạng thái "Chờ duyệt"
// - Trả về thông tin ngân hàng để người dùng chuyển khoản
//
router.post("/public", createPublicDonation);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/donations/:id/approve — Duyệt khoản tài trợ (Kế toán/Admin)
// ─────────────────────────────────────────────────────────────────────────────
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1, 2): Chỉ cho phép role_id = 1 (Admin) hoặc 2 (Kế toán)
//
// Mục đích:
// - Kế toán/Admin xác nhận đã nhận tiền từ nhà tài trợ
// - Cập nhật trạng thái khoản tài trợ từ "Chờ duyệt" → "Đã nhận"
// - Cộng tiền vào quỹ
// - Tạo giao dịch THU
//
router.put("/:id/approve", protect, authorizeRoles(1, 2), approveDonation);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/donations/:id/reject — Từ chối khoản tài trợ (Kế toán/Admin)
// ─────────────────────────────────────────────────────────────────────────────
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1, 2): Chỉ cho phép role_id = 1 (Admin) hoặc 2 (Kế toán)
//
// Mục đích:
// - Kế toán/Admin từ chối khoản tài trợ (VD: thông tin sai, chuyển khoản sai...)
// - Cập nhật trạng thái từ "Chờ duyệt" → "Từ chối"
// - KHÔNG cộng tiền vào quỹ
// - KHÔNG tạo giao dịch
//
router.put("/:id/reject", protect, authorizeRoles(1, 2), rejectDonation);

export default router;
