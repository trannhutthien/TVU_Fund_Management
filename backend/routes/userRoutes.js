import express from "express";
import { getUsers, createUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rolesMiddleware.js";

const router = express.Router();

// GET /api/users — cần access token hợp lệ và quyền admin/giáo vụ
router.get("/", protect, authorizeRoles(1, 3), getUsers);

// POST /api/users — cần access token hợp lệ và quyền admin/giáo vụ
router.post("/", protect, authorizeRoles(1, 3), createUser);

export default router;
