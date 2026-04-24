import express from "express";
import { createUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles, isAdmin } from "../middleware/rolesMiddleware.js";
const router = express.Router();

// POST /api/users — cần access token hợp lệ
router.post("/", protect, authorizeRoles(1,3), createUser);

export default router;
