import express from "express";
import {
  createInspection,
  updateResult,
  getInspectionHistory
} from "../../controllers/applications/nghiemThuController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// ─── PROTECTED ROUTES (Yêu cầu Authentication) ───────────────────────────────

// POST /api/nghiem-thu — Tạo lượt kiểm tra/nghiệm thu mới (Cán bộ, Admin)
router.post("/", protect, authorizeRoles(1, 3), createInspection);

// PUT /api/nghiem-thu/:id — Cập nhật kết quả nghiệm thu (Cán bộ, Admin)
router.put("/:id", protect, authorizeRoles(1, 3), updateResult);

// GET /api/nghiem-thu/application/:yeucauhotroId — Lịch sử nghiệm thu của đơn (mọi role)
router.get("/application/:yeucauhotroId", protect, getInspectionHistory);

export default router;
