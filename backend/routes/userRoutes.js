import express from "express";
import { getUsers, getUserById, createUser, updateUserStatus } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rolesMiddleware.js";

const router = express.Router();

// GET /api/users — cần access token hợp lệ và quyền admin/giáo vụ
router.get("/", protect, authorizeRoles(1, 3), getUsers);

// GET /api/users/:id — cần access token hợp lệ và quyền admin/giáo vụ
router.get("/:id", protect, authorizeRoles(1, 3), getUserById);

// POST /api/users — cần access token hợp lệ và quyền admin/giáo vụ
router.post("/", protect, authorizeRoles(1, 3), createUser);

// PUT /api/users/:id/status — cần access token hợp lệ và quyền admin
router.put("/:id/status", protect, authorizeRoles(1), updateUserStatus);

export default router;
