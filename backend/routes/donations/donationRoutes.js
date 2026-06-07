import express from "express";
import {
  createPublicDonation,
  approveDonation,
  confirmDonation,
  rejectDonation,
  createStaffDonation,
  createAuthenticatedDonation,
  listDonations,
  getDonationStats,
  getDonationDetail,
  getMyDonations,
} from "../../controllers/donations/donationController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONATION ROUTES ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/donations/public — Quyên góp công khai (KHÔNG CẦN TOKEN)
router.post("/public", createPublicDonation);

// POST /api/donations/authenticated — Nhà tài trợ đã đăng nhập quyên góp (CẦN TOKEN, ROLE 4)
router.post("/authenticated", protect, authorizeRoles(4), createAuthenticatedDonation);

// GET /api/donations/my-donations — Lấy danh sách quyên góp của nhà tài trợ hiện tại (CẦN TOKEN, ROLE 4)
router.get("/my-donations", protect, authorizeRoles(4), getMyDonations);


// GET /api/donations/stats — Stats cho Kế toán (Admin/Kế toán)
router.get("/stats", protect, authorizeRoles(1, 2), getDonationStats);

// GET /api/donations — List khoản tài trợ (Admin/Kế toán/Cán bộ)
router.get("/", protect, authorizeRoles(1, 2, 3), listDonations);

// GET /api/donations/:id — Chi tiết + lịch sử phê duyệt
router.get("/:id", protect, authorizeRoles(1, 2, 3), getDonationDetail);

// POST /api/donations — Cán bộ Quỹ/Admin ghi nhận khoản tài trợ (CẦN TOKEN)
router.post("/", protect, authorizeRoles(1, 3), createStaffDonation);

// PUT /api/donations/:id/approve — Duyệt khoản tài trợ (Kế toán/Admin)
router.put("/:id/approve", protect, authorizeRoles(1, 2), approveDonation);

// PUT /api/donations/:id/confirm — Xác nhận cuối cùng (Admin only)
router.put("/:id/confirm", protect, authorizeRoles(1), confirmDonation);

// PUT /api/donations/:id/reject — Từ chối khoản tài trợ (Kế toán/Admin)
router.put("/:id/reject", protect, authorizeRoles(1, 2), rejectDonation);

export default router;
