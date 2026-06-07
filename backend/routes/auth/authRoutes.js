import express from "express";
import { register, login, getMe, refreshToken, updatePassword, logout } from "../../controllers/auth/authController.js";
import { googleLogin, googleCallback } from "../../controllers/auth/googleAuthController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/auth/register      — đăng ký tài khoản mới (công khai)
router.post("/register", register);

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

// ─── Google OAuth 2.0 ────────────────────────────────────────────────────────
// GET /api/auth/google          — khởi động Google OAuth flow (redirect sang Google)
router.get("/google", googleLogin);

// GET /api/auth/google/callback — Google redirect về đây sau khi user xác thực
router.get("/google/callback", googleCallback);

export default router;

