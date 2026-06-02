import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import NguoiDungModel from "../../models/auth/NguoiDungModel.js";
import DonorModel from "../../models/donations/DonorModel.js";
import { buildUserAvatarUrl } from "../../utils/helpers/imageHelper.js";
import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";

const getMaintenanceMode = () => {
  try {
    const settingsPath = path.join(process.cwd(), "config/system_settings.json");
    const data = fs.readFileSync(settingsPath, "utf8");
    const settings = JSON.parse(data);
    return !!settings.maintenanceMode;
  } catch (error) {
    return false;
  }
};


// ─── Helper: tạo cặp token ───────────────────────────────────────────────────
// Tách ra hàm riêng để login và refresh-token đều dùng chung logic
const generateTokens = (payload) => {
  // Access token: sống lâu hơn cho development (2 giờ), production nên dùng 15m
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
  });

  // Refresh token: sống lâu (30 ngày cho development), production nên dùng 7d
  // Ký bằng secret KHÁC để tách biệt hoàn toàn với access token
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

  return { accessToken, refreshToken };
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Đăng ký tài khoản mới (công khai - không cần authentication)
// Hỗ trợ 2 loại: SINH_VIEN và NHA_TAI_TRO
export const register = async (req, res) => {
  try {
    // Kiểm tra chế độ bảo trì
    if (getMaintenanceMode()) {
      return res.status(503).json({
        success: false,
        message: "Hệ thống đang trong chế độ bảo trì. Không thể đăng ký tài khoản mới lúc này.",
        maintenance: true
      });
    }

    const { 
      hoTen, 
      mssv, 
      lopKhoa, 
      email, 
      password,
      tenToChuc,
      loaiNhaTaiTro,
      soDienThoai,
      loaiTaiKhoan // 'sinhvien' hoặc 'nhataitro'
    } = req.body;

    // 1. Validate loại tài khoản
    if (!loaiTaiKhoan || !['sinhvien', 'nhataitro'].includes(loaiTaiKhoan)) {
      return res.status(400).json({
        success: false,
        message: "Loại tài khoản không hợp lệ",
      });
    }

    // 2. Validate dữ liệu theo loại tài khoản
    if (loaiTaiKhoan === 'sinhvien') {
      if (!hoTen || !mssv || !lopKhoa || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin: họ tên, MSSV, lớp/khoa, email, mật khẩu",
        });
      }
    } else {
      if (!tenToChuc || !email || !soDienThoai || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin: tên tổ chức, email, số điện thoại, mật khẩu",
        });
      }
    }

    // 3. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không đúng định dạng",
      });
    }

    // 4. Validate độ dài mật khẩu
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      });
    }

    // 5. Kiểm tra email đã tồn tại chưa
    const emailExists = await NguoiDungModel.checkEmailExists(email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // 6. Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. Chuẩn bị dữ liệu user
    const userData = {
      hoTen: loaiTaiKhoan === 'sinhvien' ? hoTen.trim() : tenToChuc.trim(),
      maSoDinhDanh: loaiTaiKhoan === 'sinhvien' ? mssv.trim() : `NTT${Date.now()}`, // Tạo mã tự động cho nhà tài trợ
      email: email.trim().toLowerCase(),
      matKhau: hashedPassword,
      roleId: 4, // Vai trò "Người dùng"
      loaiTaiKhoan: loaiTaiKhoan === 'sinhvien' ? 'SINH_VIEN' : 'NHA_TAI_TRO',
      khoaPhong: loaiTaiKhoan === 'sinhvien' ? lopKhoa.trim() : loaiNhaTaiTro || null,
      soDienThoai: soDienThoai || null,
      trangThai: 'HOAT_DONG',
      avatar: null,
      diaChi: null
    };

    // 8. Tạo user mới trong database
    const userId = await NguoiDungModel.createUser(userData);

    // 8.5. Nếu là NHA_TAI_TRO, tự động tạo record trong bảng nhataitro
    if (loaiTaiKhoan === 'nhataitro') {
      try {
        const donorData = {
          userId: userId,
          tenNhaTaiTro: tenToChuc.trim(),
          loai: loaiNhaTaiTro || 'Ca nhan', // 'Ca nhan' hoặc 'To chuc'
        };
        
        const result = await DonorModel.createDonor(donorData);
        console.log(`Đã tạo nhà tài trợ ID ${result.insertId} cho user ID ${userId}`);
      } catch (donorError) {
        console.error("Lỗi tạo nhà tài trợ:", donorError);
        // Không throw error, vì user đã được tạo thành công
        // Sẽ tự động tạo sau khi quyên góp lần đầu
      }
    }

    // 9. Tạo token cho user mới
    const payload = {
      user_id: userId,
      vai_tro: 4,
    };
    const { accessToken, refreshToken } = generateTokens(payload);

    // 10. Lấy thông tin user vừa tạo
    const newUser = await NguoiDungModel.getUserForProfile(userId);

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      accessToken,
      refreshToken,
      user: {
        id: newUser.nguoidung_id,
        maSoDinhDanh: newUser.masodinhdanh,
        hoTen: newUser.hoten,
        email: newUser.email,
        vaiTro: newUser.vaitro_id,
        tenVaiTro: newUser.tenvaitro || null,
        loaiTaiKhoan: newUser.loaitaikhoan,
        khoaPhong: newUser.khoaphong,
        createdAt: newUser.ngaytao,
      },
    });
  } catch (error) {
    console.error("Lỗi register:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, matKhau } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!email || !matKhau) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    // 2. Tìm user trong database
    const user = await NguoiDungModel.getUserForLogin(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email không đúng hoặc là tài khoản không tồn tại",
      });
    }

    // Kiểm tra chế độ bảo trì
    if (getMaintenanceMode() && user.role_id !== 1) {
      return res.status(503).json({
        success: false,
        message: "Hệ thống đang trong chế độ bảo trì. Chỉ Admin được phép truy cập lúc này.",
        maintenance: true
      });
    }

    // 3. Kiểm tra tài khoản có bị khoá không
    if (user.trangthai === "KHOA") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khoá, vui lòng liên hệ quản trị viên",
      });
    }

    // Kiểm tra vai trò có bị tạm dừng không
    if (user.vt_trangthai === "TAM_DUNG") {
      return res.status(403).json({
        success: false,
        message: "Vai trò của bạn đã bị tạm dừng. Vui lòng liên hệ quản trị viên.",
      });
    }

    // 4. So sánh mật khẩu với hash trong DB
    const isPasswordValid = await bcrypt.compare(matKhau, user.matkhau);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    // 5. Tạo cặp token (access + refresh)
    // LƯU Ý: Dùng user_id (PRIMARY KEY) thay vì ma_so_dinh_danh
    const payload = {
      user_id: user.nguoidung_id,
      vai_tro: user.vaitro_id,
    };
    const { accessToken, refreshToken } = generateTokens(payload);

    // 6. Ghi nhật ký đăng nhập
    await logSystemActivity(req, {
      nguoidung_id: user.nguoidung_id,
      hanhdong: 'DANG_NHAP',
      loaidoituong: 'nguoidung',
      doituong_id: user.nguoidung_id,
      mota: 'Đăng nhập hệ thống thành công'
    });

    // 7. Trả về cặp token và thông tin user (không trả mat_khau)
    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
      user: {
        id: user.nguoidung_id,
        maSoDinhDanh: user.masodinhdanh,
        hoTen: user.hoten,
        email: email,
        avatar: buildUserAvatarUrl(user.avatar), // ✅ Build full URL
        vaiTro: user.vaitro_id,
        tenVaiTro: user.tenvaitro || null,
        loaiTaiKhoan: user.loaitaikhoan || null,
        createdAt: user.ngaytao || null,
      },
    });
  } catch (error) {
    console.error("Lỗi login:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ (đã qua middleware protect)
export const getMe = async (req, res) => {
  try {
    // req.user.id đã được gắn bởi middleware protect
    const user = await NguoiDungModel.getUserForProfile(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.nguoidung_id,
        maSoDinhDanh: user.masodinhdanh,
        hoTen: user.hoten,
        email: user.email,
        avatar: buildUserAvatarUrl(user.avatar), // ✅ Build full URL
        soDienThoai: user.sodienthoai || null,
        diaChi: user.diachi || null,
        vaiTro: user.vaitro_id,
        tenVaiTro: user.tenvaitro || null,
        loaiTaiKhoan: user.loaitaikhoan || null,
        khoaPhong: user.khoaphong || null,
        trangThai: user.trangthai,
        createdAt: user.ngaytao || null,
      },
    });
  } catch (error) {
    console.error("Lỗi getMe:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── POST /api/auth/refresh-token ────────────────────────────────────────────
// Dùng khi access token hết hạn — client gửi refresh token để lấy access token mới
// KHÔNG cần middleware protect (vì access token đã hết hạn rồi)
export const refreshToken = async (req, res) => {
  try {
    const  token  = req.body.refreshToken;

    // 1. Kiểm tra có gửi refresh token không
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp refresh token",
      });
    }

    // 2. Xác thực refresh token bằng JWT_REFRESH_SECRET (secret RIÊNG)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      // Token giả mạo, hết hạn, hoặc bị sửa đổi
      return res.status(401).json({
        success: false,
        message: "Refresh token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại",
      });
    }

    // 3. Kiểm tra user vẫn còn tồn tại và không bị khoá trong DB
    // (trường hợp tài khoản bị xoá hoặc khoá sau khi token được cấp)
    // LƯU Ý: decoded.user_id (không phải decoded.id)
    const user = await NguoiDungModel.getUserForProfile(decoded.user_id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không còn tồn tại",
      });
    }
    if (user.trangthai === "KHOA") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khoá, vui lòng liên hệ quản trị viên",
      });
    }

    // 4. Cấp cặp token mới (xoay vòng cả refresh token — tăng bảo mật)
    const payload = {
      user_id: user.nguoidung_id,
      vai_tro: user.vaitro_id,
    };
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens(payload);

    // 5. Trả về cặp token mới
    return res.status(200).json({
      success: true,
      message: "Cấp lại token thành công",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Lỗi refreshToken:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── PUT /api/auth/update-password ───────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ (đã qua middleware protect)
// User cần cung cấp mật khẩu cũ và mật khẩu mới
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword} = req.body;
    const userId = req.user.id; // Lấy từ middleware protect

    // 1. Kiểm tra dữ liệu đầu vào
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới và xác nhận mật khẩu mới",
      });
    }

    // 2. Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // 3. Kiểm tra mật khẩu mới và xác nhận mật khẩu mới có khớp không
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới và xác nhận mật khẩu mới không khớp",
      });
    }

    // 3. Lấy mật khẩu hiện tại từ database
    const userData = await NguoiDungModel.getUserPassword(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // 4. Xác thực mật khẩu cũ
    const isOldPasswordValid = await bcrypt.compare(oldPassword, userData.mat_khau);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu cũ không đúng",
      });
    }

    // 5. Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
    const isSamePassword = await bcrypt.compare(newPassword, userData.mat_khau);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không được trùng với mật khẩu cũ",
      });
    }

    // 6. Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 7. Cập nhật mật khẩu trong database
    await NguoiDungModel.updatePassword(userId, hashedPassword);

    // 8. Trả về kết quả thành công
    return res.status(200).json({
      success: true,
      message: "Cập nhật mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi updatePassword:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ (đã qua middleware protect)
// Trong JWT thuần (stateless), server chỉ verify token và trả về success
// Client sẽ tự xóa token khỏi localStorage/sessionStorage
export const logout = async (req, res) => {
  try {
    // req.user.id đã được verify bởi middleware protect
    // Trong JWT thuần, server không lưu trữ token nên không cần xóa gì
    // Chỉ cần trả về success để client biết và xóa token ở phía mình
    
    // Log logout event để audit/tracking
    await logSystemActivity(req, {
      hanhdong: 'DANG_XUAT',
      loaidoituong: 'nguoidung',
      doituong_id: req.user.id,
      mota: 'Đăng xuất khỏi hệ thống'
    });

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("Lỗi logout:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
