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

// GET /api/chuc-vu — cần access token hợp lệ và quyền admin
router.get("/", protect, authorizeRoles(1), getAllChucVu);

// PUT /api/chuc-vu/reorder — cần access token hợp lệ và quyền admin
router.put("/reorder", protect, authorizeRoles(1), updateThuTu);

// GET /api/chuc-vu/:id — cần access token hợp lệ và quyền admin
router.get("/:id", protect, authorizeRoles(1), getChucVuById);

// POST /api/chuc-vu — cần access token hợp lệ và quyền admin
router.post("/", protect, authorizeRoles(1), createChucVu);

// PUT /api/chuc-vu/:id — cần access token hợp lệ và quyền admin
router.put("/:id", protect, authorizeRoles(1), updateChucVu);

// DELETE /api/chuc-vu/:id — cần access token hợp lệ và quyền admin (xóa mềm)
router.delete("/:id", protect, authorizeRoles(1), softDeleteChucVu);

export default router;
