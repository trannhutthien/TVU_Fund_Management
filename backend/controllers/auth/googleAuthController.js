import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import NguoiDungModel from "../../models/auth/NguoiDungModel.js";
import { buildUserAvatarUrl } from "../../utils/helpers/imageHelper.js";
import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// ─── Helper: tạo cặp token (giống authController) ────────────────────────────
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
  return { accessToken, refreshToken };
};

// ─── GET /api/auth/google ─────────────────────────────────────────────────────
// Tạo URL xác thực Google và redirect user đến đó
export const googleLogin = (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "select_account", // Luôn hiển thị màn hình chọn tài khoản
  });

  res.redirect(authUrl);
};

// ─── GET /api/auth/google/callback ───────────────────────────────────────────
// Google redirect về đây sau khi user chấp thuận
export const googleCallback = async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  // Nếu user huỷ đăng nhập Google
  if (error) {
    return res.redirect(`${frontendUrl}/login?error=google_cancelled`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=google_no_code`);
  }

  try {
    // 1. Đổi authorization code lấy tokens từ Google
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // 2. Lấy thông tin user từ Google thông qua id_token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googlePayload = ticket.getPayload();
    const { email, name, picture } = googlePayload;

    if (!email) {
      return res.redirect(`${frontendUrl}/login?error=google_no_email`);
    }

    // 3. Kiểm tra user đã tồn tại trong DB chưa
    let user = await NguoiDungModel.getUserByEmail(email);

    if (!user) {
      // 4a. Tạo user mới nếu chưa có
      const newUserId = await NguoiDungModel.createUserFromGoogle({
        hoTen: name || email.split("@")[0],
        email: email,
        avatar: picture || null,
      });
      user = await NguoiDungModel.getUserForProfile(newUserId);
      
      console.log(`✅ Tạo tài khoản mới từ Google: ${email} (ID: ${newUserId})`);
    } else {
      // 4b. User đã tồn tại - kiểm tra trạng thái
      if (user.trangthai === "KHOA") {
        return res.redirect(`${frontendUrl}/login?error=account_locked`);
      }
      if (user.vt_trangthai === "TAM_DUNG") {
        return res.redirect(`${frontendUrl}/login?error=role_suspended`);
      }
    }

    // 5. Tạo JWT tokens của hệ thống
    const payload = {
      user_id: user.nguoidung_id,
      vai_tro: user.vaitro_id,
    };
    const { accessToken, refreshToken } = generateTokens(payload);

    // 6. Ghi nhật ký đăng nhập
    try {
      await logSystemActivity(req, {
        nguoidung_id: user.nguoidung_id,
        hanhdong: "DANG_NHAP",
        loaidoituong: "nguoidung",
        doituong_id: user.nguoidung_id,
        mota: "Đăng nhập hệ thống qua Google OAuth",
      });
    } catch (logErr) {
      // Không throw lỗi nếu log thất bại
      console.error("Lỗi ghi log:", logErr);
    }

    // 7. Chuẩn bị thông tin user để gửi về frontend
    const userInfo = {
      id: user.nguoidung_id,
      maSoDinhDanh: user.masodinhdanh,
      hoTen: user.hoten,
      email: user.email,
      avatar: buildUserAvatarUrl(user.avatar) || picture || null,
      vaiTro: user.vaitro_id,
      tenVaiTro: user.tenvaitro || null,
      loaiTaiKhoan: user.loaitaikhoan || "SINH_VIEN",
      createdAt: user.ngaytao || null,
    };

    // 8. Redirect về frontend kèm token (encode để tránh vấn đề URL)
    const encodedUser = encodeURIComponent(JSON.stringify(userInfo));
    return res.redirect(
      `${frontendUrl}/auth/google/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${encodedUser}`
    );
  } catch (error) {
    console.error("Lỗi Google OAuth callback:", error);
    return res.redirect(`${frontendUrl}/login?error=google_failed`);
  }
};
