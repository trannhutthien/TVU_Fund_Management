import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUserStatus,
  getUserStats,
  updateUserInfo,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rolesMiddleware.js";

const router = express.Router();

// GET /api/users/stats — Admin / Cán bộ
router.get("/stats", protect, authorizeRoles(1, 3), getUserStats);

// GET /api/users — Admin / Cán bộ
router.get("/", protect, authorizeRoles(1, 3), getUsers);

// GET /api/users/:id — Admin / Cán bộ
router.get("/:id", protect, authorizeRoles(1, 3), getUserById);

// POST /api/users — Admin / Cán bộ
router.post("/", protect, authorizeRoles(1, 3), createUser);

// PATCH /api/users/:id — Admin / Cán bộ (chỉ chỉnh sửa user role_id = 4)
router.patch("/:id", protect, authorizeRoles(1, 3), updateUserInfo);

// PUT /api/users/:id/status — Admin / Cán bộ (khóa/mở khóa)
router.put("/:id/status", protect, authorizeRoles(1, 3), updateUserStatus);

export default router;
