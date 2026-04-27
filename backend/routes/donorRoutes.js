import express from "express";
import { createDonor } from "../controllers/donorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rolesMiddleware.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONOR ROUTES (CHO ADMIN/GIÁO VỤ) ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/donors — Tạo nhà tài trợ thủ công (Admin/Giáo vụ)
// ─────────────────────────────────────────────────────────────────────────────
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1, 3): Chỉ cho phép role_id = 1 (Admin) hoặc 3 (Giáo vụ)
//
// Mục đích:
// - Nhân viên tạo nhà tài trợ trước (VD: đối tác, doanh nghiệp)
// - Không tạo khoản tài trợ, chỉ tạo thông tin nhà tài trợ
//
router.post("/", protect, authorizeRoles(1, 3), createDonor);

export default router;
