import express from "express";
import { createPublicDonation } from "../controllers/donationController.js";

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

export default router;
