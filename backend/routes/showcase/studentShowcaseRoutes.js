import express from "express";
import {
  getPublicStudentShowcase,
  getAllStudentShowcase,
  getStudentShowcaseById,
  createStudentShowcase,
  updateStudentShowcase,
  deleteStudentShowcase,
  updateStudentShowcaseStatus
} from "../../controllers/showcase/studentShowcaseController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// GET /api/student-showcase/public — API công khai, KHÔNG CẦN TOKEN
router.get("/public", getPublicStudentShowcase);

// GET /api/student-showcase — cần access token hợp lệ và quyền admin/cán bộ
router.get("/", protect, authorizeRoles(1, 3), getAllStudentShowcase);

// GET /api/student-showcase/:id — cần access token hợp lệ và quyền admin/cán bộ
router.get("/:id", protect, authorizeRoles(1, 3), getStudentShowcaseById);

// POST /api/student-showcase — cần access token hợp lệ và quyền admin/cán bộ
router.post("/", protect, authorizeRoles(1, 3), createStudentShowcase);

// PUT /api/student-showcase/:id — cần access token hợp lệ và quyền admin/cán bộ
router.put("/:id", protect, authorizeRoles(1, 3), updateStudentShowcase);

// DELETE /api/student-showcase/:id — cần access token hợp lệ và quyền admin/cán bộ
router.delete("/:id", protect, authorizeRoles(1, 3), deleteStudentShowcase);

// PUT /api/student-showcase/:id/status — cần access token hợp lệ và quyền admin/cán bộ
router.put("/:id/status", protect, authorizeRoles(1, 3), updateStudentShowcaseStatus);

export default router;
