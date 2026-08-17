import express from "express";
import {
  createInspection,
  updateResult,
  updateInspection,
  deleteInspection,
  getInspectionHistory,
  getDetail
} from "../../controllers/applications/nghiemThuController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// ─── PROTECTED ROUTES (Yêu cầu Authentication) ───────────────────────────────

// POST /api/nghiem-thu — Tạo lượt kiểm tra/nghiệm thu mới (Chỉ Cán bộ Quỹ)
router.post("/", protect, authorizeRoles(3), createInspection);

// PUT /api/nghiem-thu/:id — Cập nhật KẾT QUẢ nghiệm thu (Chỉ Admin duyệt)
router.put("/:id", protect, authorizeRoles(1), updateResult);

// PUT /api/nghiem-thu/:id/edit — Sửa thông tin nghiệm thu chưa duyệt (Cán bộ/Admin)
router.put("/:id/edit", protect, authorizeRoles(1, 3), updateInspection);

// DELETE /api/nghiem-thu/:id — Xóa nghiệm thu chưa duyệt (Cán bộ/Admin)
router.delete("/:id", protect, authorizeRoles(1, 3), deleteInspection);

// GET /api/nghiem-thu/application/:yeucauhotroId — Lịch sử nghiệm thu của đơn (mọi role)
router.get("/application/:yeucauhotroId", protect, getInspectionHistory);

// GET /api/nghiem-thu/application/:yeucauhotroId/detail — Chi tiết nghiệm thu (mọi role)
router.get("/application/:yeucauhotroId/detail", protect, getDetail);

export default router;
