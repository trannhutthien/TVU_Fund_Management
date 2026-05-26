import express from "express";
import { getFunds, createFund, getPublicFunds } from "../controllers/fundController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rolesMiddleware.js";

const router = express.Router();

// GET /api/funds/public — API công khai, KHÔNG CẦN TOKEN
router.get("/public", getPublicFunds);

// GET /api/funds — cần access token hợp lệ và quyền admin/giáo vụ
router.get("/", protect, authorizeRoles(1, 3), getFunds);

// POST /api/funds — cần access token hợp lệ và quyền admin/giáo vụ
router.post("/", protect, authorizeRoles(1, 3), createFund);

export default router;
