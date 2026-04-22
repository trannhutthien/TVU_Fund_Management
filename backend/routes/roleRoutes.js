import express from "express";
import { getRoles, getRoleById, updateRole, getUsersByRole } from "../controllers/roleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/roles — cần access token hợp lệ
router.get("/", protect, getRoles);

// GET /api/roles/:id — cần access token hợp lệ
router.get("/:id", protect, getRoleById);

// GET /api/roles/:id/users — cần access token hợp lệ
router.get("/:id/users", protect, getUsersByRole);

// PATCH /api/roles/:id — cần access token hợp lệ (partial update)
router.patch("/:id", protect, updateRole);

export default router;
