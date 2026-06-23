import express from "express";
import {
  submitGuestApplication,
  submitGuestDonation,
  resendGuestOtp,
  verifyOtp,
  trackGuestStatus,
} from "../../controllers/guest/guestController.js";
import { rateLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

// Giới hạn IP: tối đa 3 lần nộp đơn/1 giờ từ cùng một IP để chống spam
const submissionLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3,
  message: "Bạn đã gửi quá nhiều yêu cầu đăng ký."
});

// POST /api/guest/yeu-cau - Gửi đơn xin hỗ trợ vãng lai
router.post("/yeu-cau", submissionLimiter, submitGuestApplication);

// POST /api/guest/tai-tro - Gửi đơn quyên góp tài trợ vãng lai
router.post("/tai-tro", submissionLimiter, submitGuestDonation);

// POST /api/guest/verify-otp - Xác thực OTP và kích hoạt migrate dữ liệu
router.post("/verify-otp", verifyOtp);

// POST /api/guest/resend-otp - Gửi lại OTP cho phiên khách vãng lai
router.post("/resend-otp", resendGuestOtp);

// GET /api/guest/track/:uuid - Tra cứu trạng thái đơn qua UUID
router.get("/track/:uuid", trackGuestStatus);

export default router;
