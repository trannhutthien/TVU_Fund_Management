import express from "express";
import { createFund } from "../controllers/fundController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rolesMiddleware.js";

const router = express.Router();

// POST /api/funds — cần access token hợp lệ và quyền admin/giáo vụ
router.post("/", protect, authorizeRoles(1, 3), createFund);

export default router;
