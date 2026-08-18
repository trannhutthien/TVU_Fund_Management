import express from "express";
import { getRoles, getRoleById, updateRole, getUsersByRole } from "../../controllers/users/roleController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles, isAdmin } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// GET /api/roles — cần access token hợp lệ
router.get("/", protect, authorizeRoles(1, 3), getRoles);

// GET /api/roles/:id — cần access token hợp lệ
router.get("/:id", protect, authorizeRoles(1, 3), getRoleById);

// GET /api/roles/:id/users — cần access token hợp lệ
router.get("/:id/users", protect, authorizeRoles(1, 3), getUsersByRole);

// PATCH /api/roles/:id — cần access token hợp lệ (partial update)
router.patch("/:id", protect, isAdmin(1), updateRole);

export default router;
