import express from "express";
import {
  getPublicChucVu,
  getAllChucVu,
  getChucVuById,
  createChucVu,
  updateChucVu,
  softDeleteChucVu,
  updateThuTu
} from "../../controllers/system/chucVuController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// GET /api/chuc-vu/public — API công khai, KHÔNG CẦN TOKEN
router.get("/public", getPublicChucVu);

// GET /api/chuc-vu — cần access token hợp lệ, quyền Admin hoặc Cán bộ Quỹ
router.get("/", protect, authorizeRoles(1, 3), getAllChucVu);

// PUT /api/chuc-vu/reorder — cần access token hợp lệ, quyền Admin hoặc Cán bộ Quỹ
router.put("/reorder", protect, authorizeRoles(1, 3), updateThuTu);

// GET /api/chuc-vu/:id — cần access token hợp lệ, quyền Admin hoặc Cán bộ Quỹ
router.get("/:id", protect, authorizeRoles(1, 3), getChucVuById);

// POST /api/chuc-vu — cần access token hợp lệ, quyền Admin hoặc Cán bộ Quỹ
router.post("/", protect, authorizeRoles(1, 3), createChucVu);

// PUT /api/chuc-vu/:id — cần access token hợp lệ, quyền Admin hoặc Cán bộ Quỹ
router.put("/:id", protect, authorizeRoles(1, 3), updateChucVu);

// DELETE /api/chuc-vu/:id — cần access token hợp lệ, quyền Admin hoặc Cán bộ Quỹ (xóa mềm)
router.delete("/:id", protect, authorizeRoles(1, 3), softDeleteChucVu);

export default router;
