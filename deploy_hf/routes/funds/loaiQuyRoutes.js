import express from "express";
import { getLoaiQuy, getLoaiQuyGroups, createLoaiQuy } from "../../controllers/funds/loaiQuyController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// GET /api/loai-quy/groups — API công khai: lấy danh sách nhóm quỹ
router.get("/groups", getLoaiQuyGroups);

// GET /api/loai-quy — API công khai
router.get("/", getLoaiQuy);

// POST /api/loai-quy — Yêu cầu token hợp lệ và quyền Admin/Cán bộ
router.post("/", protect, authorizeRoles(1, 3), createLoaiQuy);

export default router;
