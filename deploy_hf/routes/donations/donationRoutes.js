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
  listPublicDonations,
} from "../../controllers/donations/donationController.js";
import {
  createProposal,
  createPublicProposal,
  listProposals,
  getProposalDetail,
  approveProposal,
  rejectProposal,
  getProposalStats,
} from "../../controllers/donations/deXuatChuongTrinhController.js";
import {
  approveByCanBo,
  rejectByCanBo,
  confirmMoneyByKeToan,
  createActivityByAdmin,
  getProposalStatus,
} from "../../controllers/donations/proposalApprovalController.js";
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
router.get("/stats", protect, authorizeRoles(1, 2, 5), getDonationStats);

// GET /api/donations — List khoản tài trợ (Admin/Kế toán/Cán bộ)
router.get("/", protect, authorizeRoles(1, 2, 3, 5), listDonations);

// GET /api/donations/public — List khoản tài trợ công khai (KHÔNG CẦN TOKEN)
router.get("/public", listPublicDonations);

// GET /api/donations/:id — Chi tiết + lịch sử phê duyệt
router.get("/:id", protect, authorizeRoles(1, 2, 3, 5), getDonationDetail);

// POST /api/donations — Cán bộ Quỹ/Admin ghi nhận khoản tài trợ (CẦN TOKEN)
router.post("/", protect, authorizeRoles(1, 3), createStaffDonation);

// PUT /api/donations/:id/approve — Duyệt khoản tài trợ (Kế toán/Admin)
router.put("/:id/approve", protect, authorizeRoles(1, 2), approveDonation);

// PUT /api/donations/:id/confirm — Xác nhận cuối cùng (Admin only)
router.put("/:id/confirm", protect, authorizeRoles(1), confirmDonation);

// PUT /api/donations/:id/reject — Từ chối khoản tài trợ (Kế toán/Admin)
router.put("/:id/reject", protect, authorizeRoles(1, 2), rejectDonation);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ĐỀ XUẤT CHƯƠNG TRÌNH ROUTES (CASE 4) ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/donations/public/propose-program — Khách vãng lai tạo đề xuất (KHÔNG CẦN TOKEN)
router.post("/public/propose-program", createPublicProposal);

// GET /api/donations/propose-program/stats — Stats đề xuất (Admin/Cán bộ)
router.get("/propose-program/stats", protect, authorizeRoles(1, 3), getProposalStats);

// GET /api/donations/propose-program — Danh sách đề xuất chờ duyệt (Admin/Cán bộ)
router.get("/propose-program", protect, authorizeRoles(1, 3), listProposals);

// GET /api/donations/propose-program/:id — Chi tiết đề xuất (Admin/Cán bộ)
router.get("/propose-program/:id", protect, authorizeRoles(1, 3), getProposalDetail);

// POST /api/donations/propose-program — Tạo đề xuất chương trình mới (Cán bộ/Nhà tài trợ)
router.post("/propose-program", protect, authorizeRoles(3, 4), createProposal);

// PUT /api/donations/propose-program/:id/approve — Duyệt đề xuất (Admin only) [OLD - Keep for backward compatibility]
router.put("/propose-program/:id/approve", protect, authorizeRoles(1), approveProposal);

// PUT /api/donations/propose-program/:id/reject — Từ chối đề xuất (Admin only) [OLD - Keep for backward compatibility]
router.put("/propose-program/:id/reject", protect, authorizeRoles(1), rejectProposal);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ĐỀ XUẤT CHƯƠNG TRÌNH - LUỒNG DUYỆT 3 CẤP (MỚI) ──────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/donations/propose-program/:id/status — Lấy trạng thái timeline (All roles)
router.get("/propose-program/:id/status", protect, authorizeRoles(1, 2, 3, 4, 5), getProposalStatus);

// POST /api/donations/propose-program/:id/approve-by-canbo — Bước 1: Cán bộ duyệt nội dung
router.post("/propose-program/:id/approve-by-canbo", protect, authorizeRoles(3), approveByCanBo);

// POST /api/donations/propose-program/:id/reject-by-canbo — Bước 1: Cán bộ từ chối
router.post("/propose-program/:id/reject-by-canbo", protect, authorizeRoles(3), rejectByCanBo);

// POST /api/donations/propose-program/:id/confirm-money — Bước 2: Kế toán xác nhận tiền
router.post("/propose-program/:id/confirm-money", protect, authorizeRoles(2), confirmMoneyByKeToan);

// POST /api/donations/propose-program/:id/create-activity — Bước 3: Admin tạo hoạt động
router.post("/propose-program/:id/create-activity", protect, authorizeRoles(1), createActivityByAdmin);

export default router;
