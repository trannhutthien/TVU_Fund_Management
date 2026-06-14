import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUserStatus,
  getUserStats,
  updateUserInfo,
  getUserGrowth,
  deleteUser,
} from "../../controllers/users/userController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// GET /api/users/growth — Admin / Cán bộ
router.get("/growth", protect, authorizeRoles(1, 3), getUserGrowth);

// GET /api/users/stats — Admin / Cán bộ
router.get("/stats", protect, authorizeRoles(1, 3), getUserStats);

// GET /api/users — Admin / Cán bộ
router.get("/", protect, authorizeRoles(1, 3), getUsers);

// GET /api/users/:id — Admin / Cán bộ
router.get("/:id", protect, authorizeRoles(1, 3), getUserById);

// POST /api/users — Admin / Cán bộ
router.post("/", protect, authorizeRoles(1, 3), createUser);

// PATCH /api/users/:id — Admin / Cán bộ / Chủ sở hữu
router.patch("/:id", protect, updateUserInfo);

// PUT /api/users/:id/status — Admin / Cán bộ (khóa/mở khóa)
router.put("/:id/status", protect, authorizeRoles(1, 3), updateUserStatus);

// DELETE /api/users/:id — Admin (xóa tài khoản vĩnh viễn)
router.delete("/:id", protect, authorizeRoles(1), deleteUser);

export default router;
