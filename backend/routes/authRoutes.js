import express from "express";
import { login, getMe, refreshToken, updatePassword, logout } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/auth/login         — không cần token
router.post("/login", login);

// POST /api/auth/refresh-token — không cần access token (vì nó đã hết hạn rồi)
//                                chỉ cần refresh token trong body
router.post("/refresh-token", refreshToken);

// GET /api/auth/me             — cần access token hợp lệ
router.get("/me", protect, getMe);

// PUT /api/auth/update-password — cần access token hợp lệ
router.put("/update-password", protect, updatePassword);

// POST /api/auth/logout        — cần access token hợp lệ
router.post("/logout", protect, logout);

export default router;
