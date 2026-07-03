import express from "express";
import {
  requestAllocation,
  approveAllocation,
  rejectAllocation,
  rollbackAllocation,
  getAllocationRequests
} from "../../controllers/funds/phanBoNganSachController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// ─── PROTECTED ROUTES (Yêu cầu Authentication) ───────────────────────────────

// GET /api/funds/allocate — Lấy danh sách yêu cầu trích lập ngân sách (Admin, Kế toán, Cán bộ)
router.get("/", protect, authorizeRoles(1, 2, 3), getAllocationRequests);

// POST /api/funds/allocate/request — Gửi đề xuất trích lập ngân sách mới (Cán bộ, Admin)
router.post("/request", protect, authorizeRoles(1, 3), requestAllocation);

// POST /api/funds/allocate/:id/approve — Phê duyệt trích lập ngân sách (Chỉ Admin)
router.post("/:id/approve", protect, authorizeRoles(1), approveAllocation);

// POST /api/funds/allocate/:id/reject — Từ chối trích lập ngân sách (Chỉ Admin)
router.post("/:id/reject", protect, authorizeRoles(1), rejectAllocation);

// POST /api/funds/allocate/:id/rollback — Thu hồi ngân sách trích lập nhầm (Chỉ Admin)
router.post("/:id/rollback", protect, authorizeRoles(1), rollbackAllocation);

export default router;
